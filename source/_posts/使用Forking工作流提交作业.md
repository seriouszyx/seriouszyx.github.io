---
title: 使用Forking工作流提交作业
tags: []
copyright: true
date: 2019-03-08 13:23:13
categories:
cover:
---


<!-- more -->

## 工作方式

>   在讲解之前先说明一下，下文中的`你们`指代码贡献者，`我`指项目维护者。

`Forking` 工作流和其他工作流有根本的不同。 这种工作流不是使用单个服务端仓库作为『中央』代码基线，而是让各个开发者都有一个服务端仓库。 这意味着各个代码贡献者（你们）有2个 Git 仓库而不是1个：一个本地私有的（这里的本地私有不是指电脑上的本地，而是指你们 GitHub 账号下的远程仓库），另一个服务端公开的（指我的 GitHub 账号下的远程仓库）。

<img src="https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/git-workflows-forking.png" width="500" hegiht="313" />

Forking 工作流的一个主要优势是，贡献的代码可以被集成，而不需要所有人都能 push 代码到仅有的中央仓库（我的远程仓库）中。 开发者 push 到自己的服务端仓库，而只有项目维护者才能 push 到正式仓库。 这样项目维护者可以接受任何开发者的提交，但无需给他正式代码库的写权限。

效果就是一个分布式的工作流，能为大型、自发性的团队（包括了不受信的第三方）提供灵活的方式来安全的协作。 也让这个工作流成为开源项目的理想工作流。

## 实例

### 项目维护者初始化正式仓库

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/git-workflows-forking-1.png)

和任何使用 Git 项目一样，第一步是创建在服务器上一个正式仓库，让所有团队成员都可以访问到。 通常这个仓库也会作为项目维护者的[公开仓库](https://github.com/seriouszyx/Java-beginner)。 

这个步骤由我来完成。

### 开发者 `fork` 正式仓库

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/git-workflows-forking-2.png)

其它所有的开发（你们）需要 fork 正式仓库，fork 操作基本上就只是一个服务端的克隆。GitHub 有 fork 按钮只需点击就可以完成 fork 操作。

这一步完成后，每个开发者都在服务端（你们 GitHub 账号下）有一个自己的仓库。

### 开发者克隆自己 `fork` 出来的仓库

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/git-workflows-forking-3.png)

下一步，各个开发者要克隆自己的公开仓库（是你们 GitHub 账号下的仓库，不是我账号下的），用熟悉的 git clone 命令。

```shell
git clone https://user@bitbucket.org/user/repo.git
```
Forking 工作流需要2个远程别名 —— 一个指向正式仓库，另一个指向开发者自己的服务端仓库。别名的名字可以任意命名，常见的约定是使用 origin 作为远程克隆的仓库的别名 （这个别名会在运行 git clone 自动创建），upstream（上游）作为正式仓库的别名。

当然，在没有足够熟悉之前，我建议你们用这种常见的命名方式。

```shell
git remote add upstream https://github.com/seriouszyx/Java-beginner.git
```

需要你们自己用上面的命令创建 upstream 别名，这里的 upstream 可以理解为一个引用指向了正式仓库（我账号下的仓库）。这样可以简单地保持本地仓库和正式仓库的同步更新。

### 开发者开发自己的功能

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/git-workflows-forking-4.png)

为了避免冲突的产生，你们需要建立一个自己的分支，在分支上进行操作：

```shell
git checkout -b some-feature
```

`some-future` 是分支名，你可以按照你喜欢的方式命名，不过建议你们命名为自己的姓名首字母缩写。 如果是我的话，我就会像下面这样命名：

```shell
git checkout -b zyx
```

注意一点，除了第一次，以后进行分支的切换时不需要加 `-b`。

现在你就在自己的分支上处理代码，

### 开发者发布自己的功能

一旦开发者准备好了分享新功能（完成作业后），需要做二件事。 首先，通过 push 他的贡献代码到自己的公开仓库中，让其它的开发者都可以访问到。 他的origin 远程别名应该已经有了，所以要做的就是：

```shell
git add .
git commit -m "balabala"
git push origin feature-branch
```

这里最大的不同是 push 命令，你需要 push 的不是 master，而是你自己新建立的分支 `some-future`。

第二件事，开发者要通知项目维护者，想要合并他的新功能到正式库中。 GitHub 提供了 Pull Request 按钮（在你们自己仓库的页面刷新会出现），弹出表单让你指定哪个分支要合并到正式仓库。 一般你会想集成你的功能分支到上游远程仓库的master分支中。

### 项目维护者集成开发者的功能

![](https://raw.githubusercontent.com/seriouszyx/PicBed/master/img/git-workflows-forking-6.png)

这一步需要我来操作，你们可以大致看一下了解整个流程。

当项目维护者收到pull request，他要做的是决定是否集成它到正式代码库中。有二种方式来做：

1.直接在pull request中查看代码
2.pull代码到他自己的本地仓库，再手动合并

第一种做法更简单，维护者可以在GUI中查看变更的差异，做评注和执行合并。 但如果出现了合并冲突，需要第二种做法来解决。这种情况下，维护者需要从开发者的服务端仓库中 fetch 功能分支， 合并到他本地的 master 分支，解决冲突：

```shell
git fetch https://bitbucket.org/user/repo feature-branch
# 查看变更
git checkout master
git merge FETCH_HEAD
```

变更集成到本地的master分支后，维护者要push变更到服务器上的正式仓库，这样其它的开发者都能访问到：

```shell
git push origin master
```

注意，维护者的origin是指向他自己公开仓库的，即是项目的正式代码库。到此，**开发者的贡献完全集成到了项目中**。

### 开发者和正式仓库做同步

由于正式代码库往前走了，其它的开发需要和正式仓库做同步。 

举例来说，你们有几个人交了作业，或者我发布了新的任务，正式仓库的内容就发生了改变，你们需要获取最新的信息的话，就需要`同步`。

```shell
git pull upstream master
```

git pull 是一个拉取分支更新的命令，upstream 指我的远程仓库的别名（之前的步骤中创建过），master 指我的远程仓库的分支名。

**注意，一定要先将自己的代码 push，我合并了之后，再 pull 拉取更新。**


<hr />

> 参考：
  [git-workflows-and-tutorials](https://github.com/oldratlee/translations/blob/master/git-workflows-and-tutorials/workflow-forking.md)