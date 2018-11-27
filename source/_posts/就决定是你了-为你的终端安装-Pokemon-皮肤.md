---
title: 就决定是你了 | 为你的终端安装 Pokemon 皮肤
tags: 
- 折腾
- Linux
- 终端
- 美化
copyright: true
date: 2018-11-27 12:21:08
categories:
- 折腾
---

正值精灵宝可梦大热时期，在逛 GitHub 时发现了一个特别强的东西 —— [Pokemon-Terminal](https://github.com/LazoCoder/Pokemon-Terminal)，经过一顿折腾后，终于把终端打造成了这个样子 👇

<img src="http://pi0evhi68.bkt.clouddn.com/A5592C04-B48F-47E4-BBB8-3BA763D5F668.png" alt="" style="width:100%" />

<!-- more -->

##  Pokemon-Terminal

正值精灵宝可梦大热时期，在逛 GitHub 时发现了一个特别强的东西 —— [Pokemon-Terminal](https://github.com/LazoCoder/Pokemon-Terminal)

这是一款美化终端的神器，将口袋妖怪与终端完美结合，先上几张图让大家感受一下：

![Pokemon Terminal README md at master · LazoCoder Pokemon Terminal](http://pi0evhi68.bkt.clouddn.com/Pokemon Terminal README md at master · LazoCoder Pokemon Terminal.png)


它拥有 719 款 Pokemon 皮肤，可以根据编号或口袋妖怪名字（例如 pikachu）改变，支持 iTerm2、ConEmu、Terminology、Tilix 等终端，同时支持 Windows、MacOS、GNOME、Openbox 和 i3wm。

如果你也是个口袋迷，那么快来给你的终端安上这款皮肤吧！

##  安装

本项目的 README 上有各种安装方法，这里以 macOS 为例。

首先确保你的电脑已经安装 3.6 及以上版本的 python（最好是 3.6），下面是下载地址

- [For Mac](https://www.python.org/downloads/mac-osx/)
- [For Windows](https://www.python.org/downloads/windows/)
- [For Ubuntu](https://askubuntu.com/a/865569)
- [For Arch Linux](https://www.archlinux.org/packages/extra/x86_64/python/)

确保有以下终端模拟器中的一种（我用的是 iTerm2）

- [iTerm2](https://iterm2.com/)
- [ConEmu](https://conemu.github.io/) or derivative (such as [Cmder](http://cmder.net/))
- [Terminology](https://www.enlightenment.org/about-terminology)
- [Tilix](https://gnunn1.github.io/tilix-web/)

可以使用以下几种方式安装

- [Arch Linux User Repository package (System-wide)](https://aur.archlinux.org/packages/pokemon-terminal-git/) 
- [pip (System-wide)](#pip-system-wide)
- [pip (Per-User)](#pip-per-user)
- [npm (Per-User)](#npm-per-user)
- [Distutils (System-wide)](#distutils-system-wide)

这里我使用 npm 安装（确保有 node.js），因为比较简单。

在 iTerm 2 中输入以下命令

```shell
npm install --global pokemon-terminal
```

好了，这就安装成功了，是不是非常简单！

```bash
$ pokemon pikachu
```

皮卡丘，就决定是你了!

##  深度使用

每次启动都想`自动随机`更换皮肤的话，可以像这样设置：

![3806757A-C9B3-41AD-8D70-637CC9DFFF29](http://pi0evhi68.bkt.clouddn.com/3806757A-C9B3-41AD-8D70-637CC9DFFF29.png)

还有原项目给出的使用方法：

```
usage: pokemon [-h] [-n NAME]
               [-r [{kanto,johto,hoenn,sinnoh,unova,kalos} [{kanto,johto,hoenn,sinnoh,unova,kalos} ...]]]
               [-l [0.xx]] [-d [0.xx]]
               [-t [{normal,fire,fighting,water,flying,grass,poison,electric,ground,psychic,rock,ice,bug,dragon,ghost,dark,steel,fairy} [{normal,fire,fighting,water,flying,grass,poison,electric,ground,psychic,rock,ice,bug,dragon,ghost,dark,steel,fairy} ...]]]
               [-ne] [-e] [-ss [X]] [-w] [-v] [-dr] [-c]
               [id]

Set a pokemon to the current terminal background or wallpaper

positional arguments:
  id                    Specify the wanted pokemon ID or the exact (case
                        insensitive) name

optional arguments:
  -h, --help            show this help message and exit
  -c, --clear           Clears the current pokemon from terminal background
                        and quits.

Filters:
  Arguments used to filter the list of pokemons with various conditions that
  then will be picked

  -n NAME, --name NAME  Filter by pokemon which name contains NAME
  -r [{kanto,johto,hoenn,sinnoh,unova,kalos} [{kanto,johto,hoenn,sinnoh,unova,kalos} ...]], --region [{kanto,johto,hoenn,sinnoh,unova,kalos} [{kanto,johto,hoenn,sinnoh,unova,kalos} ...]]
                        Filter the pokemons by region
  -l [0.xx], --light [0.xx]
                        Filter out the pokemons darker (lightness threshold
                        lower) then 0.xx (default is 0.7)
  -d [0.xx], --dark [0.xx]
                        Filter out the pokemons lighter (lightness threshold
                        higher) then 0.xx (default is 0.42)
  -t [{normal,fire,fighting,water,flying,grass,poison,electric,ground,psychic,rock,ice,bug,dragon,ghost,dark,steel,fairy} [{normal,fire,fighting,water,flying,grass,poison,electric,ground,psychic,rock,ice,bug,dragon,ghost,dark,steel,fairy} ...]], --type [{normal,fire,fighting,water,flying,grass,poison,electric,ground,psychic,rock,ice,bug,dragon,ghost,dark,steel,fairy} [{normal,fire,fighting,water,flying,grass,poison,electric,ground,psychic,rock,ice,bug,dragon,ghost,dark,steel,fairy} ...]]
                        Filter the pokemons by type.
  -ne, --no-extras      Excludes extra pokemons (from the extras folder)
  -e, --extras          Excludes all non-extra pokemons

Misc:
  -ss [X], --slideshow [X]
                        Instead of simply choosing a random pokemon from the
                        filtered list, starts a slideshow (with X minutes of
                        delay between pokemon) in the background with the
                        pokemon that matched the filters
  -w, --wallpaper       Changes the desktop wallpaper instead of the terminal
                        background
  -v, --verbose         Enables verbose output
  -dr, --dry-run        Implies -v and doesn't actually changes either
                        wallpaper or background after the pokemon has been
                        chosen

Not setting any filters will get a completely random pokemon
```

举几个例子，可以根据口袋妖怪的名字改变皮肤

![](https://i.imgur.com/DfA2lcd.gif)

同一款皮肤（部分）还可以改变不同的形态

![](https://i.imgur.com/gdGUucu.gif)

还可以自定义图片之类的，自己摸索吧。

##  终端美化

作者建议更改终端默认的透明度的模糊程度，以达到更好的效果，可以像这样设置：

![](https://i.imgur.com/xSZAGhL.png)

设置之后就会变成这个样子：

![](https://i.imgur.com/82DAT97.jpg)

iTerm 2 的默认功能还是不够强大，可以配置 oh-my-zsh，安装字体库、插件等，如果有需要可以参考这篇文章 [iTerm2 + Oh My Zsh 打造舒适终端体验](https://segmentfault.com/a/1190000014992947)。

最后，安装配置了 iTerm 2 + oh-my-zsh + Pokemon-Terminal，你就拥有了像下面一样的终端。

![404B150B-328D-4038-B142-06C0CDDEC40A](http://pi0evhi68.bkt.clouddn.com/404B150B-328D-4038-B142-06C0CDDEC40A.png)

Have fun !

<hr />
