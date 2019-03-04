---
title: '《Algorithms,Part 1》Programming Assignment 1: Percolation'
tags: ['coursera', 'Algorithms', 'Programming Assignment']
copyright: true
date: 2019-01-06 16:07:13
categories:
    - 知识总结
description:
image:
mathjax: true
---

coursera 课程 《Algorithms,Part 1》第一周作业解答 —— 渗透模型。

<!-- more -->

## 问题

Programming Assignment 1 是一个并查集的应用——渗透模型。

![80D8C615-CF2F-4DDD-9A3B-7460DB13725F.png](https://i.loli.net/2019/01/06/5c31b84b6e708.png)

给定义一个 $n\times n$ 的矩阵（代表一个系统），黑色代表节点被堵住，白色代表节点已经打开。默认情况下所有节点都被堵住，如果某一个节点与第一行的节点相连（connected），那么它就是 `full` 的。如果最后一行任意一个节点与第一个行任意一个节点相连，那么整个系统就是 `percolation`。

假设每个节点打开的概率是 $p$，求整个系统 percolation 的阀值估计。

![26697FCC-2B43-47B2-A94C-049E697D325A.png](https://i.loli.net/2019/01/06/5c31bf3d3b947.png)

对于这个问题，我们可以使用 `蒙特卡洛模拟(Monte Carlo simulation)`：
- 所有的节点初始化为关闭（blocked）
- 重复以下步骤，直到系统实现 percolation
    - 在所有关闭的节点中随便选择一个
    - 打开（open）这个节点
- 此时打开的节点个数/总节点个数就是系统的阀值

假设经过 $T$ 次实验，每次实验的阀值是 $x_t$，则平均值 $\bar x$ 和方差 $s^2$ 的计算公式如下：

$$ \bar x=\frac{x_1+x_2+\dots+x_T}{T}, s^2=\frac{(x_1-\bar x)^2+(x_2-\bar x)^2+\dots+(x_T-\bar x)^2}{T-1} $$

假设 $T$ 足够大，下面给出阀值估计的 $95\%$ 的置信区间：

$ \Bigg[ \bar x-\frac{1.96s}{\sqrt{T}}, x+\frac{1.96s}{\sqrt{T}} \Bigg] $

要求实现两个类。Percolation.java 使用给定的 `WeightedQuickUnionUF` 实现以下 API，用于对渗透模型进行操作。

```java
public class Percolation {
   public Percolation(int n)                // create n-by-n grid, with all sites blocked
   public    void open(int row, int col)    // open site (row, col) if it is not open already
   public boolean isOpen(int row, int col)  // is site (row, col) open?
   public boolean isFull(int row, int col)  // is site (row, col) full?
   public     int numberOfOpenSites()       // number of open sites
   public boolean percolates()              // does the system percolate?

   public static void main(String[] args)   // test client (optional)
}
```

PercolationStas.java 使用设计好的 Percolation 类进行蒙特卡洛模拟，并计算平均值、方差、置信区间等。

```java
public class PercolationStats {
   public PercolationStats(int n, int trials)    // perform trials independent experiments on an n-by-n grid
   public double mean()                          // sample mean of percolation threshold
   public double stddev()                        // sample standard deviation of percolation threshold
   public double confidenceLo()                  // low  endpoint of 95% confidence interval
   public double confidenceHi()                  // high endpoint of 95% confidence interval

   public static void main(String[] args)        // test client (described below)
}
```


##  思路

Robert Sedgewick 已经在 Lecture Slides 上提到了一种有效的解决方案，那就是构造虚拟两个节点，以判断整个系统是否是 percolation。

![C1435870-4DB5-453B-B094-E4B51B9F0FFB.png](https://i.loli.net/2019/01/06/5c31ec52650f8.png)

这种方式相当高效，我之前想的一种方法就无奈超时，这样 `isFull()` 和 `percolation()` 方法都是常数时间复杂度，这要比遍历一行节点效率高得多，尤其是第二个类的运行时，遍历的方法大概两分钟才能跑出来结果，而虚拟节点只需要两三秒钟。

不过虚拟节点会出现 `回流` 问题，可以内置两个 WeightedQuickUnionUF 对象，分别用于 `isFull()` 和 `percolation()` 两种方法的记录。

##  实现

[源代码](https://github.com/seriouszyx/Algorithms-solution/tree/master/course/Percolation/src)

好不容易冲到了 99，需要用 `FindBugs` 和 `CheckStyle` 保证代码质量。

有时间把需要注意的地方补充了。

<hr />
