---
title: 'Assignment #2: Breakout'
tags: [Java,Java基础]
copyright: true
date: 2019-03-17 09:54:02
categories: Java
description:
cover: https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/QQ20190118-1.jpg

---

## 简答

1. Java支持的数据类型有哪些？什么是自动拆装箱？
2. 接口和抽象类的区别是什么？
3. String s = new String("abc"); 创建了几个对象？为什么？


## Console Programming

这部分的题没有 starter codes，自己创建。

### 移动零

给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。

* 样例输入: [0,1,0,3,12]
* 样例输出: [1,3,12,0,0]

### 不要数“4”

Java 组的 N 个人选组长，选举方法如下：所有人按 1，2，3，… ，N 编号围坐一圈，从第1 个人开始报数，报到 4 号退出圈外，然后下一个人接着从 1 开始数。如此循环报数，直到圈内只剩下一个人，即为组长。编程输出组长的原始序号。

* 输入形式：接受一个整数 N 代表组内总人数
* 输出形式：显示最后剩下的人的原始序号

## Breakout!

你的任务是编写经典的街机游戏《Breakout》，这款游戏是史蒂夫·沃兹尼亚克(Steve Wozniak)在与史蒂夫·乔布斯(Steve Jobs)创立苹果公司(Apple)之前发明的。这是一项艰巨的任务，但只要你把问题分解成几个部分，就完全可以处理。在本文章后面的策略和战术部分中，有一些建议可以帮助你掌握最重要的内容。

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/20190317114351.png)

### Preparation

#### Primer Checker

编写像《Breakout》这样的大型程序时，一个关键的挑战是如何最好地将解决方案分解为易于管理的和实现的方法。为了练习这项技能，您将从编写一个很短的方法开始，该方法接受一个大于1的正整数作为输入，并返回一个布尔值，指示该整数是否是质数。

在 PrimeChecker.java 中，提供了 arunmethod 来测试一系列数字是否为素数。 你的工作是实现 isPrime 方法以检查数字是否为素数。

#### Mouse Reporter

为了讲解动画和实现，这里提供一个示例程序——MouseReporter.java（starter codes 中提供），它演示了 Breakout 所需的基本概念。在屏幕左侧写一个 MouseReportert，创建一个 GLabel。 移动鼠标时，标签会更新显示鼠标的当前 x，y 位置。 如果鼠标触摸标签，它应该变成红色，否则它应该是蓝色。

代码中有一个关键的函数

```java
public GObject getElementAt(double x, double y)
```

它接受窗口中的一个位置，并返回该位置的图形对象(如果有的话)。如果没有图形对象覆盖该位置，getElementAt 返回特殊的常量 null。如果不止一个，getElementAt 总是选择堆栈顶部最近的一个，也就是显示在前面的那个。

### The Breakout game

在《Breakout》中，world 的初始配置显示在代码的开始处。屏幕顶部的彩色矩形是砖块（brick），底部稍大一些的矩形是挡板（paddle）。挡板随着鼠标的移动可以左右移动，直到到达窗体的边缘。

游戏开始时，会有一个球从窗体的中心以随机的角度射向屏幕的底部。球从挡板和窗体的墙壁上弹回来，这与物理原理一致，通常表示为入射角等于反射角(正如本文章后面讨论的那样，实现起来非常容易)。因此，在两次弹回后，小球会撞击上方的砖块，被撞击的砖块消失，球被弹回屏幕底部。（注意图片中的虚线只是为了演示球的运动轨迹，实际并不需要实现）

游戏会有两种终止情况：

1. 球弹下来的过程中没有碰到挡板，而是直接碰到屏幕底部，则停止游戏，提示玩家游戏失败。
2. 最后一个砖块被打掉，提示玩家获胜。

下面会介绍一下实现的思路。

#### Set up the bricks

在你开始玩这个游戏之前，你必须设置好各种方块。因此，可以将 run() 方法为两个方法实现：一个用于设置游戏，另一个用于玩游戏。设置的一个重要部分包括在游戏顶部创建几排砖块，看起来像这样：

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/20190317114619.png)

砖块的数量、尺寸和间距使用 starter codes 中的命名常量指定，从窗口顶部到砖块第一行的距离也是如此。你唯一需要计算的值是第一行中心的 x 坐标，以便砖块以窗口为中心，剩下的空间在左右两边平分。

每两行的砖块颜色不变，并按以下颜色的排列：RED, ORANGE, YELLOW, GREEN, CYAN。

#### Create the paddle

下一步是创建一个挡板（方法的常数值中给出了它相距屏幕底部的距离），并为其添加鼠标移动事件，随着鼠标的移动更改 x 坐标，不更改 y 坐标，挡板的移动可以参考 GRect 的 move 方法。

要注意，挡板不能移动出边界，所以要考虑边界条件。

#### Create a ball and get it to bounce off the walls

你现在已经经过了设置阶段，进入了游戏的游戏阶段。首先，创建一个球，并把它放在窗口的中心。请记住，govaly 的坐标并不指定球的中心位置，而是指定球的左上角。

创造一个球是很容易的，因为它只是一个 filled 的 GOval。有趣的部分在于让它适当地移动和弹跳。

每次球都从同一个方式发射会非常无聊，所以第一次球应该以向下的任意方向发射，你可以使用以下的步骤：

1. 声明一个实例变量 rgen，用来作为一个随机数生成器：
```java
private RandomGenerator rgen = RandomGenerator.getInstance();
```
2. 初始化球的速度：
```java
vx=rgen.nextDouble(VELOCITY_X_MIN , VELOCITY_X_MAX);
if (rgen.nextBoolean(0.5)) 
    vx = -vx;
vy=VELOCITY_Y
```
这会产生一个 1.0 到 3.0 的随机 double 值。

3. 移动球


```java
while(true) {
    ball.move(vx, vy);
    // other operations
}
```

#### Checking for collisions

这是整个游戏最精彩的部分，碰撞检测直接决定整个游戏是否成功。

我们知道球在游戏中是有物理位置的，它可以看作是下面这样：

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/20190317114708.png)

对于四角每一个点，你都可以用下面的方面做检测：

1. 调用 getElementAt 方法检测当前位置是否有物体
2. 如果返回值不为空，函数会返回一个 GObject 对象，你需要判断它是挡板还是砖块
3. 如果四个角都没有碰撞，则整个球没有碰撞

### Possible extensions

下面是在完成游戏的基础上进行的一些功能扩展：

1. 增加声音。在每次球与砖或球碰撞时，你可能想使用一个简短的反弹声。这个扩展非常简单。starter codes 包含一个名为 bounce.au 的音频剪辑文件。你可以这样加载声音：
```java
AudioClip bounceClip = MediaTools.loadAudioClip("bounce.au");
```
然后这样调用：
```java
bounceClip.play();
```
2. 增加难度。你可以设置击打一定次数后增加球的运动速度。
3. 保存分数。每次碰撞都会获得一定的分数，不同颜色的球对应的分数也不同。
4. 使用你的想象，为游戏增加功能。


<hr />
