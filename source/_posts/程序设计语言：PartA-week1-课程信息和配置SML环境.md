---
title: 程序设计语言：PartA-week1 课程信息和配置SML环境
tags: [SML, Emacs]
copyright: true
date: 2019-05-08 08:32:15
categories: Programming-Languages
---

![](/uploads/pla1.jpg)

<!-- more -->

## 课程信息

在知乎上[Coursera 上有哪些课程值得推荐？](https://www.zhihu.com/question/22436320)问题下看到了`字节`的回答下首推了这门课程——华盛顿大学的 [Programming Languages](https://www.coursera.org/learn/programming-languages)，大致看了下大纲，适合有一门编程语言背景的学生，目的是通过讲述几门小众语言来描述编程范式（尤其注重函数式编程范式）。整个课程分为三部分，A 部分讲解 SML，B 部分讲解 Racket，C 部分讲解 Ruby。

之前看过王垠的[《如何掌握所有的程序语言》](http://www.yinwang.org/blog-cn/2017/07/06/master-pl)，而 Programming Languages 大概就是学习编程语言特性的最好的课程。

## 安装 SML 环境

第一部分讲解 SML，使用 Emacs 做编程环境，我使用了是 Mac OS。

下面是一些基础的概念：

- SML(Standard Meta Language)：一种标准的函数式编程语言
- M：指 `alt` 键
- C：指 `control` 键
- REPL(Read-Eval-Print Loop)：读取-求值-输出循环，是一个简单的、交互的编程环境

### 安装 Emacs

可以从 [http://emacsformacosx.com/](http://emacsformacosx.com/)下载 Emacs，下面是一些基本命令：

- C-x C-c：退出 Emacs
- C-g：撤回当前操作
- C-x C-f：打开一个文件
- C-x C-s：保存一个文件
- C-x C-w：写一个文件

### 安装 SML/NJ

[下载 smlnj](http://www.smlnj.org/dist/working/110.80/)，在 `/.bash_profile` 中配置环境变量：

```bash
export PATH="$PATH:/usr/local/smlnj/bin"
```

打开 Terminal 输入 sml 将会看到 `Standard ML of New Jersey v110.80 [built: ...]` 的字样。

### 安装 SML Mode

SML Mode 就相当于 Emacs 和 SML 结合的模块。在 Emacs 中运行 `M-x list-packages`，找到 `sml-mode` 点击安装，在 `~/.emacs` 中添加环境变量：

```bash
(setenv "PATH" (concat "/usr/local/smlnj/bin:" (getenv "PATH")))
(setq exec-path (cons "/usr/local/smlnj/bin"  exec-path))
``` 

重启 Emacs，直接创建一个 `my.sml` 拖进 Emacs 中，输入内容：

```sml
val x = 2 + 4
val y = x * 5
```

`C-x C-s` 保存，`C-c C-s` + Return 创建 SML/NJ REPL，相当于创建一个交互的界面，输入 `use "my.sml"` 显示结果。

![1](https://raw.githubusercontent.com/seriouszyx/Programming-Languages/master/PartA-week1/imgs/1.png)

神的编辑器。

## 编程作业

第一周的作业就是让学生熟悉这门课交作业的流程，需要先过 Auto-Grader（每天只能提交一次），然后再进行 peer-assistance。

作业内容的话并不难，就是改一个符号，而且文档中都指出来了。

比较想记录的一点是 Emacs 的工作环境布局。左上角的 buffer（编辑窗口）是一个 SML REPL；右上角是编写 HomeWork 的文件；左下角是 HomeWork 的测试文件；右下角的 buffer 是一个 Command Console，用于显示对文件进行了哪些命令操作。

![2](https://raw.githubusercontent.com/seriouszyx/Programming-Languages/master/PartA-week1/imgs/2.png)

弄出这个布局可以先切换到 sml-mode，然后 `C-c C-s` 调出 SML REPL，此时是一个上下布局。然后分别让光标悬浮在两个 buffer 中，通过 `C-x 3` 让光标所停留的 buffer 水平切分成两个 buffer，此时 Emacs 的一个四方格布局已经出来了。

然后就可以将文件拖到不同布局中，文件的排放看个人习惯。

环境布局弄好之后，通过鼠标点击或者 `C-x o` 就能移动光标到不同的 buffer。

接下来是 HW 的一般编写流程：

- 在源代码中编写对应的 function，编写完成后要用 `C-x C-s` **保存**。
- 在 test 文件中编写测试，首行通过 use 语句引入源代码文件，保存。
- 在 SML REPL 里面通过 use 语句引入 test 文件，核对测试结果。


> 参考：
> [在Emacs用SML](https://www.jianshu.com/p/f6115fd42929)
> [Programing Languages Part A Note（一）：工欲善其事，必先利其器](https://zhuanlan.zhihu.com/p/37518107)

<hr />
