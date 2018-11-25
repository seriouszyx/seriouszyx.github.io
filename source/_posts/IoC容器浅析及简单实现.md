---
layout: spring
title: IoC容器浅析及简单实现
date: 2018-11-25 14:43:04
categories:
- 技术相关
tags:
- JavaWeb
- Java
---

Spring IoC 容器是 Spring 框架中最核心的部分，也是初学者难以理解的部分，对于这种关键的设计，简单实现一次能最大限度地加深理解，了解其中思想，对以后的开发也大有裨益。



<!-- more -->

#   Spring IoC 容器浅析及简单实现


##	Spring IoC 概述

原生的 JavaEE 技术中各个模块之间的联系较强，即`耦合度较高`。

比如完成一个用户的创建事务，视图层会创建业务逻辑层的对象，再在内部调用对象的方法，各个模块的`独立性很差`，如果某一模块的代码发生改变，其他模块的改动也会很大。

而 Spring 框架的核心——IoC（控制反转）很好的解决了这一问题。控制反转，即`某一接口具体实现类的选择控制权从调用类中移除，转交给第三方决定`，即由 Spring 容器借由 Bean 配置来进行控制。

可能 IoC 不够开门见山，理解起来较为困难。因此， Martin Fowler 提出了 DI（Dependency Injection，依赖注入）的概念来替代 IoC，即`让调用类对某一接口实现类的依赖关系由第三方（容器或写协作类）注入，以移除调用类对某一接口实现类的依赖`。

比如说， 上述例子中，视图层使用业务逻辑层的接口变量，而不需要真正 new 出接口的实现，这样即使接口产生了新的实现或原有实现修改，视图层都能正常运行。

从注入方法上看，IoC 主要划分为三种类型：构造函数注入、属性注入和接口注入。在开发过程中，一般使用`属性注入`的方法。

IoC 不仅可以实现`类之间的解耦`，还能帮助完成`类的初始化与装配工作`，让开发者从这些底层实现类的实例化、依赖关系装配等工作中解脱出出来，专注于更有意义的业务逻辑开发工作。

##	Spring IoC 简单实现

下面实现了一个IoC容器的核心部分，简单模拟了IoC容器的基本功能。


下面列举出核心类：

Student.java

```java
/**
 * @ClassName Student
 * @Description 学生实体类
 * @Author Yixiang Zhao
 * @Date 2018/9/22 9:19
 * @Version 1.0
 */
public class Student {

    private String name;

    private String gender;

    public void intro() {
        System.out.println("My name is " + name + " and I'm " + gender + " .");
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}
```

StuService.java

```java
/**
 * @ClassName StuService
 * @Description 学生Service
 * @Author Yixiang Zhao
 * @Date 2018/9/22 9:21
 * @Version 1.0
 */
public class StuService {

    private Student student;

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }
}
```

beans.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans>
    <bean id="Student" class="me.seriouszyx.pojo.Student">
        <property name="name" value="ZYX"/>
        <property name="gender" value="man"/>
    </bean>

    <bean id="StuService" class="me.seriouszyx.service.StuService">
        <property ref="Student"/>
    </bean>
</beans>
```

下面是核心类 ClassPathXMLApplicationContext.java

```java

/**
 * @ClassName ClassPathXMLApplicationContext
 * @Description ApplicationContext的实现，核心类
 * @Author Yixiang Zhao
 * @Date 2018/9/22 9:40
 * @Version 1.0
 */
public class ClassPathXMLApplicationContext implements ApplicationContext {

    private Map map = new HashMap();

    public ClassPathXMLApplicationContext(String location) {
        try {
            Document document = getDocument(location);
            XMLParsing(document);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 加载资源文件，转换成Document类型
    private Document getDocument(String location) throws JDOMException, IOException {
        SAXBuilder saxBuilder = new SAXBuilder();
        return saxBuilder.build(this.getClass().getClassLoader().getResource(location));
    }

    private void XMLParsing(Document document) throws Exception {
        // 获取XML文件根元素beans
        Element beans = document.getRootElement();
        // 获取beans下的bean集合
        List beanList = beans.getChildren("bean");
        // 遍历beans集合
        for (Iterator iter = beanList.iterator(); iter.hasNext(); ) {
            Element bean = (Element) iter.next();
            // 获取bean的属性id和class，id为类的key值，class为类的路径
            String id = bean.getAttributeValue("id");
            String className = bean.getAttributeValue("class");
            // 动态加载该bean代表的类
            Object obj = Class.forName(className).newInstance();
            // 获得该类的所有方法
            Method[] methods = obj.getClass().getDeclaredMethods();
            // 获取该节点的所有子节点，子节点存储类的初始化参数
            List<Element> properties = bean.getChildren("property");
            // 遍历，将初始化参数和类的方法对应，进行类的初始化
            for (Element pro : properties) {
                for (int i = 0; i < methods.length; i++) {
                    String methodName = methods[i].getName();
                    if (methodName.startsWith("set")) {
                        String classProperty = methodName.substring(3, methodName.length()).toLowerCase();
                        if (pro.getAttribute("name") != null) {
                            if (classProperty.equals(pro.getAttribute("name").getValue())) {
                                methods[i].invoke(obj, pro.getAttribute("value").getValue());
                            }
                        } else {
                            methods[i].invoke(obj, map.get(pro.getAttribute("ref").getValue()));
                        }
                    }
                }
            }
            // 将初始化完成的对象添加到HashMap中
            map.put(id, obj);
        }
    }

    public Object getBean(String name) {
        return map.get(name);
    }

}
```

最后进行测试

```java
public class MyIoCTest {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXMLApplicationContext("beans.xml");
        StuService stuService = (StuService) context.getBean("StuService");
        stuService.getStudent().intro();
    }
}
```

测试成功！

```text
My name is ZYX and I'm man .

Process finished with exit code 0
```

##	源码

代码在我的 [GitHub](https://github.com/seriouszyx/LearnSpring/tree/master/mycode/SimpleIoC)开源，欢迎一起交流讨论。

##	总结

熟悉一个框架最好的方式，就是亲手实现它。这样不仅会深刻地认识到框架的工作原理，以后的使用也会更加得心应手。

此外，在实现的过程中，又会收获很多东西，就像实现 IoC 容器一样，不仅了解解析 XML 文件的 JDOM 工具，还加深了对 Java 反射的理解。在实际开发中，几乎没有任何地方需要用到反射这一技术，但在框架实现过程中，不懂反射则寸步难行。

>	更多的 Spring 学习心得请戳[Spring 框架学习](https://github.com/seriouszyx/LearnSpring)