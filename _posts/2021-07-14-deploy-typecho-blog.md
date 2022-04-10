---
layout: post
title: 💻【环境搭建】基于 Docker 搭建 Typecho 博客系统
date: 2021-07-14 13:40:49
---

# 云服务器

首先一般搭建动态博客都会有一个云服务器，国内的话供应商一般是阿里云或者腾讯云，我这里使用的是腾讯云，基本的操作逻辑大同小异。

下面是我服务器的配置信息。

![](https://img.seriouszyx.com/20210714235652.png#vwid=1646&vhei=876)

# 安装 Docker

## yum 换源

首先将 yum 进行换源处理，以获得更快的下载速度。备份 `CentOS-Base.repo` 文件，以便更改配置文件出错恢复默认。

```bash
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
```

之后下载新的 `CentOS-Base.repo` 到 `/etc/yum.repos.d` 。

```bash
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-8.repo
```

根据自己服务器的版本下载相应的配置文件，比如机器的操作系统是 CentOS7，就把下载链接最后的部分改为 `CentOS-7.repo` 。

下载成功后运行 `yum makecache` 生成缓存即可，这样使用 yum 下载软件包时访问的就是阿里的镜像，速度会快很多。

## 安装 Docker

在新主机上首次安装 Docker Engine-Community 之前，需要设置 Docker 仓库，之后就可以从仓库安装和更新 Docker。

先安装所需的软件包，`yum-utils` 提供了 yum-config-manager ，并且 device mapper 存储驱动程序需要 `device-mapper-persistent-data` 和 `lvm2`。

```bash
yum install -y yum-utils device-mapper-persistent-data lvm2
```

使用以下命令来设置稳定的仓库，国内的阿里源会加快下载速度。

```bash
sudo yum-config-manager \
    --add-repo \
    http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

安装最新版本的 `Docker Engine-Community` 和 `containerd`。

```bash
yum install -y docker-ce docker-ce-cli containerd.io
```

安装后输入 `serivce docker status`  查看 Docker 运行状态，如下所示即正常运行。

![](https://img.seriouszyx.com/20210714235730.png#vwid=1695&vhei=426)

## Docker 换源

修改镜像配置文件。

```bash
vim /etc/docker/daemon.json
```

添加国内源。

```json
{
    "registry-mirrors": [
       "https://docker.mirrors.ustc.edu.cn",
       "http://hub-mirror.c.163.com",
       "https://registry.docker-cn.com"
    ]
}
```

使用 `service docker restart` 命令重启 Docker 服务后生效。

# 安装 Typecho 依赖环境

所有容器依赖的一些数据都放在 `/data` 目录下，包括数据库、网站源码、Nginx 的 conf 等，目的是为了以后迁移方便，直接将 `/data` 拷贝到新服务器就可以。

## 安装数据库 MySQL

使用 Docker 安装 MySQL5.7，注意密码项的自定义修改。

```bash
docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password --mount type=bind,source=/data/mysql,target=/var/lib/mysql --restart=always --name mysql5.7 mysql:5.7
```

`--mount` 命令也可以用 `-v /data/mysql:/var/lib/mysql` 代替，官方更推荐使用 `--mount`，详情请看[官网](https://docs.docker.com/storage/bind-mounts/)。

对于 `docker run` 命令的部分参数说明：

- -d 代表 daemon，即后台运行。
- -p 是映射容器的3306端口到宿主机的3306端口，规则是：`-p IP:host_port:container_port` 。
- -e 是设置 MySQL 的密码。
- --mount 是让容器的`/var/lib/mysql` 映射到宿主机的 `/data/mysql` 目录中。
- --restart=always 是为了在 Docker 重启时，容器能够自动启动。

## 安装 Nginx

```bash
docker run -p 80:80 -p 443:443 --mount type=bind,source=/data/nginx/conf.d,target=/etc/nginx/conf.d --mount type=bind,source=/data/solution,target=/data/solution --restart=always -d --name nginx nginx
```

- `--mount type=bind,source=/data/nginx/conf.d,target=/etc/nginx/conf.d` 是为了将 Nginx 的配置目录映射到宿主机的目录中，这样当 Nginx 容器被销毁时，依然能保留配置。
- `/data/solution` 用于存放网站项目，也是为了数据与容器分离。
- -d 这里同时映射了80和443端口。

## 安装 PHP

可以在 PHP 的[官方镜像源](https://hub.docker.com/_/php)找到最新版本的 PHP，在实际使用中，我们可能还需要装一些 PHP 的扩展，而官方源中支持已经帮我们安装了一些扩展的 PHP 镜像，如 `php:<version>-fpm`，其中的 `<version>` 指的是 PHP 版本，具体可以从官方镜像源找到。

```bash
docker run --name php-fpm -p 9000:9000 --mount type=bind,source=/data/solution,target=/data/solution --restart=always -d php:7.4-fpm
```

这里也将网站根目录 `/data/solution` 映射到 PHP 容器中，为了 PHP 能正确读取 Nginx 中的 root 配置项。 

由于 Typecho 需要用到 `pdo_mysql` 扩展，因此要在 `php-fpm` 上安装这个扩展。

```bash
# 进入到`php-fpm`容器内部
docker exec -it php-fpm bash
# 安装扩展
docker-php-ext-install pdo_mysql
# 查看是否已经成功安装
php -m
# 退出容器
exit
```

安装后重启 `php-fpm`，`pdo_mysql` 则安装成功。

```bash
docker restart php-fpm
```

# 自定义 Bridge 网络

执行命令看一下，现在机器上已经运行着 Nginx、PHP、MySQL 三个服务，现在需要让它们之间能够相互通信，这里使用自定义 Bridge 网络的方法。

![](https://img.seriouszyx.com/20210714235804.png#vwid=1377&vhei=99)

实际上启动容器时，Docker 会将容器绑定到默认的 Bridge 网络中，使用 `docker network inspect bridge` 命令打印此时默认的网络：

```json
[
    {
        "Name": "typecho",
        "Id": "d9d06a7e7410e75183eb09019bb895a12a01d2f7405f80e09d40811c578ff396",
        "Created": "2021-06-11T13:10:53.453912588+08:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "2d4b9daf908252e40b8cca8e772e9dece8c1c36a467f2846fc0786d4964817cd": {
                "Name": "mysql5.7",
                "EndpointID": "8afe4a42884234acda9c8b996faed20d98015e6c919455edaf0d24f63bc22764",
                "MacAddress": "02:42:ac:12:00:02",
                "IPv4Address": "172.18.0.2/16",
                "IPv6Address": ""
            },
            "8cd032a4eeff30e7a54d81b6f92449160b243c793ba9d1a239cb4587896f2721": {
                "Name": "php-fpm",
                "EndpointID": "211aa7e5ab248aee84cc7875b76842037e1c597eb3f5b546b3705ac971c52c0a",
                "MacAddress": "02:42:ac:12:00:04",
                "IPv4Address": "172.18.0.4/16",
                "IPv6Address": ""
            },
            "ff4b411e355f1000552b892601164499a0c077fdd4a8eb22bb8c5e92f0757d83": {
                "Name": "nginx",
                "EndpointID": "e10b908ac0e0f6bd872a0b23d7ff30f58845700b7fe48568325d73ad38ba1747",
                "MacAddress": "02:42:ac:12:00:03",
                "IPv4Address": "172.18.0.3/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```

可以看到 MySQL、php-fpm、Nginx 在默认 Bridge 中的 IP 分别是 `172.18.0.2`、`172.18.0.4`、`172.18.0.3`，  可以通过容器在宿主机中的 IP 来访问对应的服务，比如 php-fpm 想要访问 MySQL，可以在 php-fpm 容器中通过 `172.18.0.2:3306` 来访问。

这种方式只能使用 IP 来访问对应的容器的服务，而 IP 可能会变化的，因此是不推荐使用在生产环境的。而用户自定义的 Bridge 网络，不仅支持 IP 访问，还支持直接使用容器名称访问。

创建一个自定义 Bridge 网络，假设名称是 `typecho`。

```bash
docker network create typecho
```

通过 `docker network connect ${网络名} ${容器名}` 来将容器绑定到 `typecho` 网络上。

```bash
docker network connect typecho mysql5.7
docker network connect typecho php-fpm
docker network connect typecho nginx
```

现在三个容器已经绑定到自定义的 Bridge 网络上了。例如，在 Nginx 容器中，就可以直接通过 `php-fpm` 的名字来调用 PHP 的服务了。

# 安装 Typecho

进入 MySQL 容器创建数据库 `typecho` 。

```bash
docker exec -it mysql5.7 bash
mysql -uroot -p 
输入密码
create database typecho;
```

进入 Typecho 官方[下载页面](https://typecho.org/download)，发现分为`稳定版`和`开发版`两种，按照一般的软件安装思路，当然是选择稳定版，但是 Typecho 的稳定版在2017年后就没有更新了，会遇到许多问题，比如我之前的安装中就遇到了[此类错误](https://github.com/typecho/typecho/issues/683) ，随后切换至开发版后问题解决。

复制开发版的下载链接，下载到服务器的 `/data` 目录下并解压到 `/solution` 目录下。

```bash
wget https://nightly.link/typecho/typecho/workflows/Typecho-dev-Ci/master/typecho_build.zip 

unzip typecho_build.zip -d ./solution/typecho
```

然后配置 Nginx 使得网站可以正常访问。注意其中 Nginx 要访问 php-fpm，在配置文件中可通过名字访问其 Docker 容器。

```bash
server {
	listen 80;
	server_name localhost;
	root   /data/solution/typecho;   # 这里是网站的存放路径
  index  index.php;

	# 下面直接照写
	location / {
    	try_files $uri $uri/ /index.php$is_args$args;
	}
	
	location ~ \.php$ {
        include fastcgi.conf;
        include fastcgi_params;
        fastcgi_pass php-fpm:9000;
    }
	
}
```

配置成功后重启 Nginx 容器，访问服务器的 IP 地址，开始配置 Typecho 博客系统。

![](https://img.seriouszyx.com/20210714235847.png#vwid=1920&vhei=946)

数据库适配器选择安装好的 `pdo-mysql` ，因为已经配置了自定义 Bridge 网络，数据库地址填入容器名即可访问数据库。

![](https://img.seriouszyx.com/20210714235921.png#vwid=1920&vhei=2145)

完成配置信息后会显示如下界面，需要复制文本框中的内容，然后创建 `config.inc.php` 文件粘贴进去。

```bash
vim /data/solution/typecho/config.inc.php
```

![](https://img.seriouszyx.com/20210714235946.png#vwid=1920&vhei=781)

最终会显示安装成功页面，并可以查看默认的用户名和密码。

![](https://img.seriouszyx.com/20210715000019.png#vwid=1920&vhei=944)

下面两个链接分别是博客页面和后台控制面板。

![](https://img.seriouszyx.com/20210715000053.png#vwid=1920&vhei=1015)

![](https://img.seriouszyx.com/20210715000124.png#vwid=1920&vhei=950)

Typecho 博客系统至此安装完成。

---

1. [Centos8使用docker迁移typecho博客](https://segmentfault.com/a/1190000021390958)
2. [将CentOS的yum源更换为国内镜像源](https://blog.csdn.net/wudinaniya/article/details/105758739)
3. [CentOS Docker 安装](https://www.runoob.com/docker/centos-docker-install.html)
4. [Typecho 环境配置和博客搭建](https://wiki.dongxing.xin/pages/b1c12d/#php-%E5%AE%89%E8%A3%85)