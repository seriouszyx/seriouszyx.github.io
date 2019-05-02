---
title: 【通天塔之Vue】壹 缘起-乾坤大挪移
tags: [通天塔, vue, JavaScript, 前端]
copyright: true
date: 2019-04-29 09:24:18
categories: Vue
---

![](/uploads/tttvue1.jpg)

<!-- more -->

## 缘起

一开始我想讨论两个问题，为什么学习 Vue 和为什么起了这么一个看似中二的名字。

### 入门 Vue

一个后端为什么要学习 Vue？而且还是在我任务繁多、时间紧迫的节点。

很坦诚地说，我日常开发中一个明显的问题就是写的界面太丑或是代码不规范，而很多基于前端框架的 UI 框架无疑减轻了任务量，就比如说 [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)。

学习 Vue 最直接的目的就是使用它们。

当然 Vue 本身的设计思想也很出色，再加上作为前端框架它简单易学，所以我选择了它。

### 通天塔

关于这个名字，我模仿了一位非常崇拜的大佬——[小土刀](https://wdxtub.com/)。它惊人的自控力和学习效率让我敬佩，强烈推荐多看看他博客上的文章。

> 工程实践就像通天塔，需要不断添砖加瓦才能越盖越高。

既然学习 Vue 是为了工程实践的一部分，所以我想用它作为我的`通天塔`中的一片瓦，看到更远的世界。

## 数据绑定

闲言少叙。

下面是一个用 Vue 编写的 Hello World 的例子。

```html
<body>
    <div id="app">{{content}}</div>

    <script>
        var app = new Vue({
            el: '#app',
            data: {
                content: 'hello world'
            }
        })

        setTimeout(function() {
            app.$data.content = 'bye world'
        }, 2000)
    </script>
</body>
```

与普通面向对象不同的是，app 实例不像`对象`一样只具有属性和方法，而是使用`规定`的形式定义本身构成。比如 el 后的内容就是它的 id 值；data 后的内容就是它的属性；methods 后就是它的方法。

所以与其称它为一个 vue 实例，不如就叫它`模型`，因为它有自己本身规定好的的构成。

简单解释一下各个构成：

- el 就是模型的唯一标志。要将系统中的两部分结合到一起，一定要有一个标志，这在数据库、加密解密中同样适用。

- data 是要展示的数据。可以是单个字符串，也可以是字符串列表，而对于列表的映射，需要 v-for 指令。
> 其实我有个疑问，为什么需要这个指令？ `<li>{{list}}</li>` 这样写让 vue 自己判断 list 是单个字符串还是列表，进行自动解析不是更方便吗？

- methods 是定义的方法。它主要包括了控制数据的代码，也就是逻辑代码。

这样做最显著的一点好处就是**解耦**。js 只关心如何将模型封装好，html 只关心如何将封装好的对象显示出来。

## 数据交互

这是一个简单的 TodoList 的应用，虽然简单，却已经具备了一个前端应用该有的东西。

```html
<body>
    <div id="app">
        <input type="text" v-model="inputValue" />
        <button v-on:click="handleBtnClick">提交</button>
        <ul>
            <li v-for="item in list">{{item}}</li>
        </ul>
    </div>

    <script>
        var app = new Vue({
            el: '#app',
            data: {
                list: [],
                inputValue: ''
            },
            methods: {
                handleBtnClick: function() {
                    this.list.push(this.inputValue)
                    this.inputValue = ''
                }
            }
        })

    </script>
</body>
```

html 和 js 已经相当于两个模块了，两个模块之前是在一起的，所以一定会有数据交互。

数据交互怎么产生？通过 v-on 指令调用实例的方法。

参数如何传递？使用 v-model 指令。

v-model 官方的说法是数据双向改变，不过我更倾向于这样理解，它只是为 html 向 js 传输数据打通了一条道路，而 js 的模型本身就能自动映射到 html 上。

这已经算得上是一个简单的应用。我们发现没有 vue 之前的开发重点是 html，js 只是辅助操作 dom 节点的工具；而 vue 使开发的重点挪回了 js，也就是数据本身，通过改变 vue 实例本身的数据进而控制 html 的展示。

## MVP vs. MVVM

MVP 模式包含三个部分：model 数据层、presenter 控制层、view 视图层。

下面是使用 MVP 模式实现 TodoList 的代码。

```html
<body>
    <div>
        <input id="input" type="text" />
        <button id="btn">提交</button>
        <ul id="list"></ul>
    </div>

    <script>
        function Page() {}
        $.extend(Page.prototype, {
            init: function() {
                this.bindEvents()
            },
            bindEvents: function() {
                var btn = $('#btn')
                btn.on('click', $.proxy(this.handleBtnClick, this))
            },
            handleBtnClick: function() {
                var inputValue = $('#input').val()
                var ulElem = $('#list')
                ulElem.append('<li>' + inputValue + '</li>')
                $('input').val('')
            }
        })

        var page = new Page();
        page.init();
    </script>
</body>
```

例子中没有 ajax 获取数据操作，所以没有 model 层。

而 presenter 的核心地位显而易见，从代码上就可以看出它是整个应用的核心。MVP 模式中 presenter 相当于中间层，它接受 view 层的方法调用，对 model 层获取或改变数据，再将反馈的数据返回给 view 层。

仔细观察，presenter 大部分代码都在控制 dom 节点，这也是 MVP 的弊端。

而之前使用 vue 的实现就是 MVVM 模式。

MVVM 将 presenter 改为 ViewModel，由 vue 控制。model 层的逻辑代码改变的是本身数据，而不是 dom 节点，数据自动由 ViewModel 自动映射到 view 层。

## 乾坤大挪移

所以说 Vue 到底为前端开发带来了什么？

在我看来，最显著的一点是**让前端开发的重点从 html 界面转移到了数据**。

以前前端程序员是先思考界面的样式，再根据样式向后台索取数据；而现在，前端先思考自己有哪些数据，再考虑如何将数据更好的展示给用户。

当然，vue 也有助于**解耦**和**降低复杂度**，不过它们只是优化，没有它们变化也不是很明显，算不上是核心。

而开发时**思考重心的转移**，才是 vue 带给我们的最重要的一点。

<hr />
