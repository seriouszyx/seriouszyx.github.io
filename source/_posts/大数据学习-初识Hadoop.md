---
title: 大数据学习 | 初识 Hadoop
tags: ['大数据','Hadoop']
copyright: true
date: 2018-12-25 12:39:24
categories:
- 知识总结
description: 
image: https://i.loli.net/2018/12/27/5c2478c2654a3.jpg
---

最近想要了解一些前沿技术，不能一门心思眼中只有 web，因为我目前对 Java 语言及其生态相对熟悉，所以在网上搜集了 Hadoop 相关文章，并做了整合。

本篇文章在于对大数据以及 Hadoop 有一个直观的概念，并上手简单体验。


<!-- more -->

## Hadoop 基础概念

`Hadoop` 是一个用 Java 实现的开源框架，是一个分布式的解决方案，将大量的信息处理所带来的压力分摊到其他服务器上。

在了解各个名词之前，我们必须掌握一组概念。

### 结构化数据 vs 非结构化数据

`结构化数据`即行数据，存储在数据库里，可以用二维表结构来表达，例如：名字、电话、家庭住址等。

常见的结构化数据库为 mysql、sqlserver。

![zhhihu1.jpg](https://i.loli.net/2018/12/30/5c287655d4f10.jpg)

`非结构化数据库`是指其字段长度可变，并且每个字段的记录又可以由可重复或不可重复的子字段构成的数据库。无法用结构化的数据模型表示，例如：文档、图片、声音、视频等。在大数据时代，对非关系型数据库的需求日益增加，数据库技术相应地进入了“后关系数据库时代”。

非结构化数据库代表为 HBase、mongodb。

![v2-27e5113596ab21aae1d64516ef015100_1200x500.jpg](https://i.loli.net/2018/12/30/5c2876565ece1.jpg)

可以大致归纳，结构化数据是先有结构、再有数据；非结构化数据是先有数据、再有结构。

Hadoop 是大数据存储和计算的开山鼻祖，现在大多数开源大数据框架都依赖 Hadoop 或者与它能很好地兼容，下面开始讲述 Hadoop 的相关概念。

### Hadoop 1.0 vs Hadoop 2.0

![Hadoop-1-vs-Hadoop-2-Architecture.png](https://i.loli.net/2018/12/27/5c242519227c9.png)

###  HDFS 和 MapReduce

Hadoop 为解决`存储`和`分析`大量数据而生，所以这两部分也是 Hadoop 的狭义说法（广义指 Hadoop 生态）。HDFS 提供了一种安全可靠的分布式文件存储系统，MapReduce 提供了基于批处理模式的数据分析框架。

`HDFS`（Hadoop Distributed File System）的设计本质上是为了大量的数据能横跨很多台机器，但是你看到的是一个文件系统而不是很多个文件系统。就好比访问 `/hdfs/tmp/file1` 的数据，引用的是一个文件路径，但是实际数据可能分布在很多机器上，当然 HDFS 为你管理这些数据，用户并不需要了解它如何管理。

关于 `MapReduce`，这里通过一个具体模型来解释。

考虑如果你要统计一个巨大的文本文件存储在类似 HDFS 上，你想要知道这个文本里各个词的出现频率。你启动了一个 MapReduce 程序。Map 阶段，几百台机器同时读取这个文件的各个部分，分别把各自读到的部分分别统计出词频，产生类似（hello, 12100次），（world，15214次）等等这样的 Pair（我这里把 Map 和 Combine 放在一起说以便简化）；这几百台机器各自都产生了如上的集合，然后又有几百台机器启动 Reduce 处理。Reducer 机器 A 将从 Mapper 机器收到所有以 A 开头的统计结果，机器 B 将收到 B 开头的词汇统计结果（当然实际上不会真的以字母开头做依据，而是用函数产生 Hash 值以避免数据串化。因为类似 X 开头的词肯定比其他要少得多，而你不希望数据处理各个机器的工作量相差悬殊）。然后这些Reducer将再次汇总，（hello，12100）＋（hello，12311）＋（hello，345881）= （hello，370292）。每个 Reducer 都如上处理，你就得到了整个文件的词频结果。

这就是一个简单的 `WordCount` 的例子，Map+Reduce 这种简单模型暴力好用，不过很笨重，关于更高效的解决方法，以后再详细描述。

###  Hadoop 构建模块

下面从底层实现的角度解释 HDFS 和 MapReduce 的一些概念。

`NameNode` 是 Hadoop 守护进程中最重要的一个。NameNode 位于 HDFS 的主端，指导 DataNode 执行底层的 IO 任务。NameNode 的运行消耗大量内存和 IO 资源，所以 NameNode 服务器不会同时是 DataNode 或 TaskTracker。

NameNode 和 `DataNode` 为主/从结构（Master/Slave）。每一个集群上的从节点都会驻留一个 DataNode 守护进程，来执行分布式文件系统的繁重工作，将 HDFS 数据块读取或者写入到本地文件系统的实际文件中。当希望对 HDFS 文件进行读写时，文件被分割为多个块，由NameNode 告知客户端每个数据块驻留在那个 DataNode。客户端直接与 DataNode 守护进程通信，来处理与数据块相对应的本地文件。

`SNN`（Scondary NameNode）是监测 HDFS 集群状态的辅助守护进程。SNN 快照有助于加少停机的时间并降低数据丢失的风险。

`JobTracker` 守护进程是应用程序和 Hadoop 之间的纽带。一旦提交代码到集群上，JobTracker 就会确定执行计划，包括决定处理哪些文件，为不同的任务分配节点以及监控所有任务的运行。如果任务失败，JobTracker 将自动重启任务，但所分配的节点可能会不同，同时受到预定义的重试次数限制。每一个Hadoop集群只有一个JobTracker守护进程，它通常运行在服务器集群的主节点上。

JobTracker 和 `TaskTracker` 也是主/从结构。JobTracker 作为主节点，监测 MapReduce 作业的整个执行过程，同时，TaskTracker 管理各个任务在每个从节点上的执行情况。TaskTracker 的一个职责就是负责持续不断地与 JobTracker 通讯。如果 JobTracker 在指定的时间内没有收到来自 TaskTracker 的心跳，它会假定 TaskTracker 已经崩溃了，进而重新提交相应的任务到集群的其他节点中。

##  尝试使用 Hadoop

`Hadoop 安装`可以直接看官方文档，或是 Google 一些不错的教程，比如 [Hadoop 的安装](https://chu888chu888.gitbooks.io/hadoopstudy/content/Content/4/chapter0401.html)、[Mac 系统安装Hadoop 2.7.3](https://www.jianshu.com/p/de7eb61c983a)。

按照操作配置 Hadoop 并成功运行，访问`localhost:50070` 和 `localhost:8088` 分别显示一下页面。

![90496E3D-A8FB-41CE-9FF0-3B962184AFAE.png](https://i.loli.net/2018/12/27/5c2457210b58d.png)

![1CBC323A-55DC-40AC-B258-3725DD0D4350.png](https://i.loli.net/2018/12/27/5c2457214a2e2.png)

运行`伪分布式`样例：

![31D3E6A6-5864-4C6E-865E-AE576A64E647.png](https://i.loli.net/2018/12/27/5c24700c97c3a.png)


### HDFS 目录/文件操作命令

HDFS 是一种文件系统，它可以将一个很大的数据集存储为一个文件，而大多数其他文件系统无力于这一点。Hadoop 也为它提供了一种与 Linux 命令类似的命令行工具，我们可以进行一些简单的操作。

Hadoop 的`文件命令`采取的形式为

```shell
hadoop fs -cmd <args>
```

其中 cmd 为具体的文件命令，通常与 UNIX 对应的命令名相同，比如：

```shell
hadoop fs -ls
hadoop fs -mkdir /user/seriouszyx
hadoop fs -lsr /
hadoop fs -rm example.txt
```

还有一些本地文件系统和 HDFS 交互的命令，也经常使用到。

```shell
hadoop fs -put example.txt /user/seriouszyx
hadoop fs -get example.txt
```

##  Hadoop 构建模块的原理

### MapReduce 如何分而治之

MapReduce 是用来处理大规模数据的一个并行编程框架，采用了对数据“分而治之”的方法。

![40658-2de7c5066daf7ab1.png](https://i.loli.net/2018/12/30/5c28765631bc8.png)

MapReduce 是一个离线计算框架，它将计算分为两个阶段，Map（并行处理输入数据）和 Reduce（对 Map 结果汇总）。其中 Map 和 Reduce 函数提供了两个高层接口，由用户去编程实现。

Map 的一般处理逻辑为：**(k1;v1) ---->map 处理---->[(k2;v2)]**

Reduce 函数的一般处理逻辑是：**(k2;[v2])---->reduce 处理---->[(k3;v3)]**

可以看出 map 处理的输出与 reduce 的输入并不完全相同，这是因为输入参数在进入 reduce 前，一般会将相同键 k2 下的所有值 v2 合并到一个集合中处理：**[(k2;v2)]--->(k2;[v2])**，这个过程叫 Combiner。

在经过 Map 和 Reduce 的抽象后，并行结构模型就变成了下面这样：

![40658-df82b7a1775fac75.png](https://i.loli.net/2018/12/30/5c28765664bab.png)

上图中可以发现，中间有一个同步障（Barrier），其作用是等所有的 map 节点处理完后才进入 reduce，并且这个阶段同时进行数据加工整理过程（Aggregation & Shuffle），以便 reduce 节点可以完全基于本节点上的数据计算最终结果。

不过这仍然不是完整的 MapReduce 模型，在上述框架图中，还少了两个步骤 Combiner 和 Partitioner。

![40658-39cc7b851195657c.png](https://i.loli.net/2018/12/30/5c287656a01e5.png)


上述图以`词频统计（WordCount）`为例。

**Combiner** 用来对中间结果数据网络传输进行优化，比如 map 处理完输出很多键值对后，某些键值对的键是相同的，Combiner 就会将相同的键合并，比如有两个键值对的键相同（good，1）和（good，2），便可以合成(good,3)。

这样，可以减少需要传输的中间结果数据量，打倒网络数据传输优化，因为 map 传给 reduce 是通过网络来传的。

**Partitioner** 负责对中间结果进行分区处理。比如词频统计，将所有主键相同的键值对传输给同一个 Reduce 节点，以便 Reduce 节点不需要访问其他 Reduce 节点的情况下，一次性对分过来的中间结果进行处理。

### 副本机制

我们再说回 HDFS 诞生的原因，hdfs 由 Google 最先研发，其需求是单独一台计算机所能存储的空间是有限的，而随着计算机存储空间的加大，其价格是呈几何倍的增长。而 hdfs 架构在相对廉价的计算机上，以分布式的方式，这样想要扩大空间之遥增加集群的数量就可以了。

大量相对廉价的计算机，那么说明**宕机**就是一种必然事件，我们需要让数据避免丢失，就只用采取冗余数据存储，而具体的实现的就是`副本机制`。

![](http://hadoop.apache.org/docs/r2.8.3/hadoop-project-dist/hadoop-hdfs/images/hdfsdatanodes.png)

hdfs 主要使用`三副本机制`

- 第一副本：如果上传节点是 DN，则上传该节点；如果上传节点是 NN，则随机选择 DN
- 第二副本：放置在不同机架的 DN 上
- 第三副本：放置在与第二副本相同机架的不同 DN 上

除了极大程度地避免宕机所造成的数据损失，副本机制还可以在数据读取时进行数据校验。

### NameNode 在做些什么

在 Hadoop 1.0 时代，Hadoop 两大核心组件 HDFS NameNode 和 JobTracker 都存在着单点问题，其中以 NameNode 最为严重。因为 `NameNode 保存了整个 HDFS 的元数据信息`，一旦 NameNode 挂掉，整个 HDFS 就无法访问，同时 Hadoop 生态系统中依赖于 HDFS 的各个组件，包括 MapReduce、Hive、Pig 以及 HBase 等也都无法正常工作，并且重新启动 NameNode 和进行数据恢复的过程也会比较耗时。

这些问题在给 Hadoop 的使用者带来困扰的同时，也极大地限制了 Hadoop 的使用场景，使得 Hadoop 在很长的时间内仅能用作离线存储和离线计算，无法应用到对可用性和数据一致性要求很高的在线应用场景中。

所幸的是，在 Hadoop2.0 中，HDFS NameNode 和 YARN ResourceManger(JobTracker 在 2.0 中已经被整合到 YARN ResourceManger 之中) 的单点问题都得到了解决，经过多个版本的迭代和发展，目前已经能用于生产环境。

![](https://www.ibm.com/developerworks/cn/opensource/os-cn-hadoop-name-node/img001.png)

从上图中我们可以看到，有两台 NameNode——Active NameNode 和 Standby NameNode，一台处于 Active 状态，为主 NameNode，另外一台处于 Standby 状态，为备 NameNode，只有主 NameNode 才能对外提供读写服务。

### Yarn

`Yarn` 是 Hadoop 集群的新一代资源管理系统。Hadoop 2.0 对 MapReduce 框架做了彻底的设计重构，我们称 Hadoop 2.0 中的 MapReduce 为 MRv2 或者 Yarn。

![20151029092726524 (2).jpg](https://i.loli.net/2018/12/30/5c28775f7eaa5.jpg)

在 Hadoop 2.x 中，Yarn 把 job 的概念换成了 `application`，因为运行的应用不只是 MapReduce 了，还可能是其他应用，如一个 DAG（有向无环图 Directed Acyclic Graph，例如 Storm 应用）。

Yarn 另一个目标是扩展 Hadoop，使得它不仅仅可以支持 MapReduce 计算，还能很方便地管理诸如 Hive、Pig、Hbase、Spark/Shark 等应用。

这种新的架构设计能够使得各种类型的应用运行在 Hadoop 上面，并通过 Yarn 从系统层面进行统一的管理，也就是说，有了 Yarn，**各种应用就可以互不干扰的运行在同一个 Hadoop 系统中**，共享整个集群资源。



###  ResourceManager 在做些什么

刚刚提到的 Yarn 也采用了 Master/Slave 结构，其中 Master 为 **ResourceManager**，负责整个集群的资源管理与调度；Slave 实现为 **NodeManager**，负责单个节点的组员管理与任务启动。 

ResourceManager 是整个 Yarn 集群中最重要的组件之一，它的功能较多，包括 ApplicationMaster 管理（启动、停止等）、NodeManager 管理、Application 管理、状态机管理等。

ResourceManager 主要完成以下几个功能：
- 与客户端交互，处理来自客户端的请求
- 启动和管理 ApplicationMaster，并在它失败时重新启动它
- 管理 NodeManager，接受来自 NodeManager 的资源管理汇报信息，并向 NodeManager 下达管理命令或把信息按照一定的策略分配给各个应用程序（ApplicationManager）等
- **资源管理与调度，接受来自 ApplicationMaster 的资源申请请求，并为之分配资源（核心）**

在 Master/Slave 架构中，ResourceManager 同样存在单点故障（高可用问题，High Availability）问题。为了解决它，通常采用热备方案，即集群中存在一个对外服务的 Active Master 和若干个处于就绪状态的 Standy Master，一旦 Active Master 出现故
障，立即采用一定的侧率选取某个 Standy Master 转换为 Active Master 以正常对外提供服务。

##  总结

本文介绍了 Hadoop 的相关概念，包括量大核心部件 HDFS 和 MapReduce，并对其进行了进一步剖析，Hadoop 2.0 的 Yarn 的简单介绍，以及一些问题的解决方法（如 HA）。

也通过配置第一次在本机上配置了 Hadoop 的运行环境，运行了伪分布式样例。

接下来会结合一个具体问题深入理解 Hadoop 的方方面面。

<br />

>   References:
>    [大数据学习笔记](https://chu888chu888.gitbooks.io/hadoopstudy/content/)
>    [一文读懂大数据平台——写给大数据开发初学者的话!](https://zhuanlan.zhihu.com/p/26545566)
>   [Hadoop HDFS和MapReduce](https://www.jianshu.com/p/ed6b35f52e3c)
>   [HDFS文件操作](http://pangjiuzala.github.io/2015/08/03/HDFS%E6%96%87%E4%BB%B6%E6%93%8D%E4%BD%9C/)
>   [hadoop笔记4--MapReduce框架](https://www.jianshu.com/p/35be7bdca902)
>   [Hadoop Yarn详解](https://blog.csdn.net/suifeng3051/article/details/49486927)
>   [Hadoop NameNode 高可用 (High Availability) 实现解析](https://www.ibm.com/developerworks/cn/opensource/os-cn-hadoop-name-node/index.html)
> [Hadoop -YARN ResourceManager 剖析](https://blog.csdn.net/zhangzhebjut/article/details/37730065)

<hr />
