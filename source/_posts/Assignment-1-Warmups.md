---
title: 'Assignment #1: Warmups'
tags: [Java, Java基础]
copyright: true
date: 2019-03-12 17:57:50
categories: Java
description:
cover:
---

## 简答

1.  为什么 Java 被称作是“平台无关的语言”？
2.  JDK 和 JRE 的区别是什么？
3.  什么是值传递和引用传递？

>   简答题可以去网上找相关内容，不过要在最后给出参考链接。不能只答一两句话，单纯的复制粘贴网上的答案，要结合自己的理解，必要时可以举例、代码、作图用来解释。

## The Fibonacci sequence

13世纪，意大利数学家列奥纳多·斐波那契(Leonardo Fibonacci)为了解释兔子数量的几何增长，设计了一个数学序列，现在以他的名字命名。**这个序列中的前两项Fib(0)和Fib(1)分别是0和1，后面的每一项都是前两项的和**。因此，斐波那契数列的前几项看起来是这样的：

Fib(0)=0
Fib(1)=1
Fib(2)=1 (0 + 1)
Fib(3)=2 (1 + 1)
Fib(4)=3 (1 + 2)
Fib(5)=5 (2 + 3)

编写一个程序，显示斐波那契数列中的元素，从Fib(0)开始，直到元素小于或等于10,000为止。因此，你的程序应该生成以下示例运行:

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/20190312181745.png)


## Drawing Centered Text

你的任务是写一个 `GraphicsProgram` 来显示下面这行文字：

**Java rocks my socks!**

文本应该以 `SansSerif` 28号字体显示，而且应该在图形界面中水平竖直居中。

Bonus：如果您想在窗口中添加10个标签，所有标签都具有相同的字体、大小，并且水平居中，但具有不同的y坐标，您可以如何组织代码？

## Drawing a face

您的工作是绘制一个机器人的脸，如下面的示例运行所示：

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/B6F7FF79-96E6-4AB4-BC80-5B96474C27E3.png)

<hr />

因为 Java 基础知识的学习较为乏味，所以我在网上找了一个图形化的库来增加作业的乐趣，这是图形库的 [API 文档](https://cs.stanford.edu/people/eroberts/jtf/javadoc/student/index.html?acm/program/package-summary.html)。

这个图形库对 Java 基本图形库进行了封装，比较简单，做到会用即可，不用深入了解。

以这次作业为例，我简单介绍一下它，比如我们要在屏幕上画一个蓝色的矩形，可以使用 GRect 类绘制：

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/3573C038-0E70-4A3F-B82B-50ACC8779114.png)

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/7727DB82-6378-492E-B7A2-B83E4E15D73B.png)

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/50D83877-3F48-4408-9788-DDD6C1643AA7.png)

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/DC3E4314-A8F7-43FE-8DDC-9106FF39FBF3.png)

关于图形界面的宽度和放置元素的位置：

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/4FC7D396-0664-42CB-BC98-B0DA583BB504.png)

下面这个程序的目的是向您展示一个具有多个关键形状的图形程序。我们实现了两个矩形(一个蓝色和一个黄色)，一个红色椭圆，在同一个位置画一个黑色的未填充矩形。在屏幕的中央，我们写着“Programming is Awesome”。

```java
import acm.graphics.*;
import acm.program.*;
import java.awt.*;

public class ProgrammingAwesome extends GraphicsProgram {	
	// draws the screen in the picture above
	public void run() {
		// half the height of the screen.
		double centerY = getHeight()/2;
		
		// make and add a blue square
		GRect blueSquare = new GRect(80, 80); // width and height are 80
		blueSquare.setColor(Color.BLUE); // make the square blue
		blueSquare.setFilled(true); // fill the square
		add(blueSquare, 70, 70); // add the square to the screen

		// add a long yellow rectangle
		GRect yellowRect = new GRect(40, 360);
		yellowRect.setColor(Color.YELLOW);
		yellowRect.setFilled(true);
		add(yellowRect, 600, 10);
		
		// make and add a red oval
		GOval redOval = new GOval(120, centerY); // width and height
		redOval.setColor(Color.RED);
		redOval.setFilled(true);
		add(redOval, 200, 180); // add to location (200, 180)

		// make and add a rectangle which fits around the red oval
		GRect circleOutline = new GRect(120, centerY);
		add(circleOutline, 200, 180);
		
		// add a piece of text
		GLabel label = new GLabel("Programming is Awesome!");
		label.setFont("Courier-52");
		add(label, 10, centerY);
		
		// this object is never added
		GRect dudeWheresMyRect = new GRect(600, 600);
		dudeWheresMyRect.setFilled(true);
		// since it is not added, we will never see it...
	}	
}
```

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/F069F0CE-9871-44A5-BBED-669BB1E9280D.png)


<hr />
