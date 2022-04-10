---
layout: post
title: 💻【环境搭建】服务器内网穿透
date: 2021-02-14 13:40:49
---


本科 AI 实验室的服务器在内网部署，疫情期间大家都没办法在学校，又需要使用 GPU 完成一些工作。正好老板又添置了一台服务器，派我做一下内网穿透，方便远程使用。


## 服务器配置


主要想记录一下软件方面的配置，所以怎么安装滑轨、怎么接线这类问题就不赘述了，下面的表格中记录了两台服务器的软硬件配置。



|  | server1 | server2 |
| --- | --- | --- |
| GPU | Tesla V100 16G×2 | Quadro RTX 6000 24G×2 |
| CPU | Intel Xeon Gold 5117 @ 2.00GHz | Intel Xeon Gold 6240R @ 2.40GHz |
| 内存 | 128G | 128G |
| 硬盘 | 20TB | 24TB |
| 操作系统 | Ubuntu 18.04 LTS | Ubuntu 18.04 LTS |



## 内网穿透


上述两台服务器都在学院机房里，此局域网的限制很大，甚至学校提供的 VPN 都无法访问，必须要在学院内部的网络才能访问。当用户在宿舍或者校外，是没有官方提供的代理工具来连接服务器的，所以就需要一台公网服务器做转发，用户通过公网 ip 来访问内网的服务器，这就需要内网穿透技术。


市面上有一些成熟的内网穿透软件，如花生壳、蒲公英等，但免费版本大多有带宽限制，且速度极慢，无法正常使用。然而这些软件底层或多或少都依赖 [frp](https://github.com/fatedier/frp)，一款专注于内网穿透的高性能反向代理应用，支持多种协议，可以安全的将内网服务通过公网 ip 节点的中转暴露到公网。


经调研后发现，frp 原生支持端口复用，也就是多个服务通过同一个服务端端口暴露。这样可以使用一台公网服务器同时代理两台内网服务，通过不同外网端口访问不同的内网服务。


frp 的安装包在 [GitHub ](https://github.com/fatedier/frp/releases)上，值得注意的是，要想使 frp 正常工作，必须在不同服务器上下载相同版本的 frp 包。


### 服务端设置


> frp 的服务端是进行中转的公网服务器，具有独立的公网 ip。



下载解压 frp 包，我一般放置在 `/usr/local/frp/` 目录下，编辑服务端配置文件 `frps.ini` 。


```bash
[common]
bind_port = 7000
vhost_http_port = 8899
```


其中：


- “bind_port”表示用于客户端和服务端连接的端口，这个端口号我们之后在配置客户端的时候要用到。
- “vhost_http_port”和“vhost_https_port”用于反向代理 HTTP 主机时使用，本文不涉及 HTTP 协议，因而照抄或者删除这条均可。



编辑完成后即可保存，运行服务端应用。


```bash
./frps -c frps.ini
```


此时的服务端仅运行在前台，如果 `Ctrl+C` 停止或者关闭 SSH 窗口后，frps 均会停止运行，因而我们使用 [nohup 命令](https://www.runoob.com/linux/linux-comm-nohup.html)将其运行在后台。

```bash
nohup ./frps -c frps.ini &
```


至此，服务端即设置完成，你可以关闭SSH窗口了。

### 客户端配置


> frp 的客户端是真正想要访问的内网服务器。



同样下载解压好 frp 软件，注意版本的统一，编辑两台客户端配置文件 `frpc.ini`。


```bash
[common]
server_addr = 39.106.21.214
server_port = 7000
 
[ssh]
type = tcp
local_ip = 172.10.1.185
local_port = 22
remote_port = 6666
```


```bash
[common]
server_addr = 39.106.21.214
server_port = 7000

[ssh1]
type = tcp
local_ip = 172.10.1.184
local_port = 22
remote_port = 6667
```


其中：


- “server_addr”为服务端 ip 地址，填入即可。
- “server_port”为服务器端口，填入你设置的端口号即可，如果未改变就是7000。
- “[xxx]”表示一个规则名称，自己定义，便于查询即可。
- “type”表示转发的协议类型，有 TCP 和 UDP 等选项可以选择，如有需要请自行查询 frp 手册。
- “local_port”是本地应用的端口号，按照实际应用工作在本机的端口号填写即可。
- “remote_port”是该条规则在服务端开放的端口号，自己填写并记录即可。



配置好后可以使用同样的方法后台运行客户端程序。


```bash
nohup ./frpc -c frpc.ini &
```


## 服务链架构


下面是整个 frp 服务链的架构（图中 ip 及端口号皆为模拟值）：


![frp 架构](/assets/posts/expose-local-server/image.png)


实线代表直接网络连接，虚线代表虚拟网络连接。在内网服务器（frpc）中配置的 `remote_port` 将在启动后向公网服务器（frps）发送（通过7000端口）注册信息，发送成功后，公网服务器开始监听6666和6667两个端口。


在实际访问时，直接在 SSH 客户端输入公网服务器的 ip 地址，通过6666和6667两个端口号控制访问两台内网服务器，而其中的 `server_port` 、 `server_addr` 、 `local_ip` 和 `local_port` 等信息对用户透明，简单方便。


> 参考：
> - [使用frp进行内网穿透](https://sspai.com/post/52523)
> - [frp issues 174](https://github.com/fatedier/frp/issues/174)