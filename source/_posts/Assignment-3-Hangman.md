---
title: 'Assignment #3:Hangman'
tags: [Java]
copyright: true
date: 2019-04-12 12:41:45
categories: Java-beginner
description:
---

![](/uploads/a3.png)

<!-- more -->

## Java crawler

学习 Java 网络爬虫，爬取网易云热评。

爬取目标网址：[Viva La Vida](https://music.163.com/#/song?id=3986017)

关于大概流程和基础知识的学习可以看 [分布式爬虫从零开始](https://github.com/CriseLYJ/Python-crawler-tutorial-starts-from-zero)，不过这个是用 Python 写的，可以参考思想。爬虫没有什么一招吃遍天的教程，因为网站都在更新反爬策略，所以以前的方法可能失效，最重要的是学会分析网络请求、解析 json 数据等。

关于第三方库可以使用 HTTPClient 和 Jsoup，不要使用特别成熟的 Java 爬虫框架如 WebMagic 等。

爬取结果类似下图所示：

![](https://images2017.cnblogs.com/blog/1291955/201712/1291955-20171209112901355-439046804.png)

## Hangman

本次作业将开发一个猜单词的游戏，练习对字符串和文件的操作。

程序运行时首先从内置的词库文件中随机选择一个单词，然后打印一行破折号，每个破折号代表一个字母，并要求用户每次猜一个字母。如果猜中的话，单词重新显示，字母位的破折号由字母替代；猜错则剩余次数减一，没有剩余次数即挑战失败。

这原本是一个针对幼儿学单词的游戏的一部分，所以增加适量的图形化界面会有利于激起小孩子的兴趣。我们把游戏主人公 Karel 挂在一个降落伞上，假设相连有7根绳子（即7次猜测机会），每猜错一次都会自动断掉一根绳子，绳子全部断掉后 Karel 将被丢下。

下面是游戏的演示图。

猜词失败：

![1](/uploads/a3-1.gif)

猜词成功：

![2](/uploads/a3-2.gif)


为了上手这个作业，建议你做一下下面这个练习。

### Sandcastle: Alternate Caps

编写一个 altCaps(String input) 方法，将字符串转换为交替的大写字母，这种打字方式在90年代末很流行。例如：

```java
altCaps("aaaaaa")       returns "aAaAaA"
altCaps("Hello World")  returns "hElLo WoRlD"
```

注意非字母的字符（比如空格）不会更改，也不会影响大小写字母的交替顺序。

---

分为三个部分设计和测试 Hangman 程序。第一部分让控制台游戏在没有任何图形化界面的情况下运行，待猜测的单词可以固定；第二部分添加图形化界面；最后一部分要求从文件中读取单词的版本替换提供的待猜测单词。

### Part I—Playing a console-based game

对于第一部分，你至少要完成以下三点：

- 选择一个随机的单词作为待猜测单词。该单词是从单词列表中选择的。
- 跟踪用户猜测的单词，单词先以一系列破折号开始，然后根据猜对的字母进行更新。
- 实现基本的控制结构并完善细节(要求用户猜测字母，跟踪剩余的猜测数量，打印出各种消息，检测游戏结束，等等)。

对于随机获取单词可以先用下面的方法代替，不过这只是暂时的测试阶段，最后要更改为从文件中读取。

```java
	/**
	 * Method: Get Random Word
	 * -------------------------
	 * This method returns a word to use in the hangman game. It randomly 
	 * selects from among 10 choices.
	 */
	private String getRandomWord() {
		int index = rg.nextInt(10);
		if(index == 0) return "BUOY";
		if(index == 1) return "COMPUTER";
		if(index == 2) return "CONNOISSEUR";
		if(index == 3) return "DEHYDRATE";
		if(index == 4) return "FUZZY";
		if(index == 5) return "HUBBUB";
		if(index == 6) return "KEYHOLE";
		if(index == 7) return "QUAGMIRE";
		if(index == 8) return "SLITHER";
		if(index == 9) return "ZIRCON";
		throw new ErrorException("getWord: Illegal index");
	}
```

有两点细节要注意:

- 如果用户输入的不是单个字母，那么您的程序应该告诉用户猜测是非法的并接受新的猜测。
- 假设用户重复输入同一个字母，如果这个字母猜测正确的话，你的程序应该什么也不做；如果猜测错误，剩余猜测次数应减一。


### Part II—Adding graphics

对于第二部分，你的任务只是扩展已经编写的程序，以便它现在能够跟踪 Hangman 图形显示。

starter codes 中已经提供了一个 canvas 实例，它是右侧的空白区域，因为整个程序本质是一个控制台程序，所以图形化元素都应该添加到 canvas 里面，比如 `canvas.add(object)`。获取宽度和清空元素也不是 `getWidth()` `removeAll()` ，而是 `canvas.getWidth()` `canvas.removeAll()`。

下面的方法展示了如何向 canvas 添加元素以显示图像。

```java
private void drawBackground() {
	GImage bg = new GImage("background.jpg");
	bg.setSize(canvas.getWidth(), canvas.getHeight());
	canvas.add(bg, 0, 0);
}
```

starter codes 中已经有需要的图片，使用它们就可以，无需截图下载。

Karel 与降落伞相连的是自己绘制的线，你可以随意指定刚开始线的数量，但要保证它们随着猜测次数的减少而减少。

### Part III—Reading the lexicon from a data file

最后一个步骤就是从 HangmanLexicon.txt 文件中读取字符串，并随机选择一个单词，以代替之前给出的选单词的方法。



<hr />
