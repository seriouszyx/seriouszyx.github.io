---
layout: post
title: 🪜【CI/CD】如何发布 Java 包到 Maven 中央仓库
date: 2021-10-16 14:39:08
---

## 前言

最近参与一些开源项目，涉及到发版相关的问题，没有看到详细又不过时的教程，于是自己调研摸索，总结出了这篇文章。

本文主要参考[官方文档](https://central.sonatype.org/publish/)进行编写，演示仓库位于 [https://github.com/seriouszyx/maven-release-example](https://github.com/seriouszyx/maven-release-example)。

## 准备工作

### Coordinates

Maven 用 **groupid** 来标识项目空间，用域名逆序的方式命名。下面是两种命名的例子，如果有自己的域名，直接使用就可以；如果没有，可以使用 github 等代码托管服务的域名。

* www.seriouszyx.com -> com.seriouszyx
* github.com/seriouszyx -> io.github.seriouszyx

下面是支持个人 groupid 的代码托管服务，假设使用 `io.github.myusername` ，需要创建一个名为 **OSSRH-TICKETNUMBER** 的公开仓库进行验证（验证成功后可删除）。如果使用自己的域名，也需要添加 TXT 解析，稍后会提到。

| 服务        | groupid                   | 相关文档                                                                                                                                                                                   |
| ----------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GitHub      | io.github.myusername      | [https://pages.github.com/](https://pages.github.com/)<br />                                                                                                                                     |
| GitLab      | io.gitlab.myusername      | [https://about.gitlab.com/stages-devops-lifecycle/pages/](https://about.gitlab.com/stages-devops-lifecycle/pages/)                                                                         |
| Gitee       | io.gitee.myusername       | [https://gitee.com/help/articles/4136](https://gitee.com/help/articles/4136)                                                                                                               |
| Bitbucket   | io.bitbucket.myusername   | [https://support.atlassian.com/bitbucket-cloud/docs/publishing-a-website-on-bitbucket-cloud/](https://support.atlassian.com/bitbucket-cloud/docs/publishing-a-website-on-bitbucket-cloud/) |
| SourceForge | io.sourceforge.myusername | [https://sourceforge.net/p/forge/documentation/Project%20Web%20Services/](https://sourceforge.net/p/forge/documentation/Project%20Web%20Services/)                                         |

**artifactId** 用来标识项目本身，如果项目命名很长，可以使用“-”来进行分隔。

### GPG

将组件发布到 Maven 中央仓库需要使用 **PGP** 进行签名，GnuPG （又称 GPG） 都是 OpenPGP 的实现，需要先创建你自己的键值对，再上传到服务器以供验证。

从 [https//www.gnupg.org/download/](https://gnupg.org/download/index.html#sec-1-2) 下载安装，使用 `--version` 标志检查。

```shell
$ gpg --version
gpg (GnuPG) 2.2.28
libgcrypt 1.8.8
Copyright (C) 2021 g10 Code GmbH
License GNU GPL-3.0-or-later <https://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Home: C:/Users/Yixiang Zhao/AppData/Roaming/gnupg
Supported algorithms:
Pubkey: RSA, ELG, DSA, ECDH, ECDSA, EDDSA
Cipher: IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256, TWOFISH,
        CAMELLIA128, CAMELLIA192, CAMELLIA256
Hash: SHA1, RIPEMD160, SHA256, SHA384, SHA512, SHA224
Compression: Uncompressed, ZIP, ZLIB, BZIP2
```

安装成功后产生键值对，过程中需要填写姓名、邮箱和密码，密钥有效期为 2 年，到时候需要使用密码延长有效期，可以看到我的公钥 id 是 `444D548E4E29746B4E2C89FC89985FBD3651A87B` 。

```shell
$ gpg --gen-key
gpg (GnuPG) 2.2.28; Copyright (C) 2021 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Note: Use "gpg --full-generate-key" for a full featured key generation dialog.

GnuPG needs to construct a user ID to identify your key.

Real name: Yixiang Zhao
Email address: seriouszyx@gmail.com
You selected this USER-ID:
    "Yixiang Zhao <seriouszyx@gmail.com>"

Change (N)ame, (E)mail, or (O)kay/(Q)uit? O
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
gpg: key 89985FBD3651A87B marked as ultimately trusted
gpg: directory 'C:/Users/Yixiang Zhao/AppData/Roaming/gnupg/openpgp-revocs.d' created
gpg: revocation certificate stored as 'C:/Users/Yixiang Zhao/AppData/Roaming/gnupg/openpgp-revocs.d\444D548E4E29746B4E2C89FC89985FBD3651A87B.rev'
public and secret key created and signed.

pub   rsa3072 2021-10-14 [SC] [expires: 2023-10-14]
      444D548E4E29746B4E2C89FC89985FBD3651A87B
uid                      Yixiang Zhao <seriouszyx@gmail.com>
sub   rsa3072 2021-10-14 [E] [expires: 2023-10-14]
```

后续步骤需要通过你的公钥来进行验证，所以把它上传到服务器中，注意 `--send-keys` 后面是你自己的公钥。

```shell
$ gpg --keyserver keyserver.ubuntu.com --send-keys 444D548E4E29746B4E2C89FC89985FBD3651A87B
gpg: sending key 89985FBD3651A87B to hkp://keyserver.ubuntu.com
```

等大概十几分钟，验证公钥是否发布成功。

```shell
$ gpg --keyserver keyserver.ubuntu.com --recv-keys 444D548E4E29746B4E2C89FC89985FBD3651A87B
gpg: key 89985FBD3651A87B: "Yixiang Zhao <seriouszyx@gmail.com>" not changed
gpg: Total number processed: 1
gpg:              unchanged: 1
```

## 在 Sonatype 创建 Issue

开发者要想将组件发布至 Maven 中央仓库，需要借助于 Sonatype 的开源软件存储库托管（Open Source Software Repository Hosting, OSSRH）服务。Sonatype 使用 JIRA 来管理请求，所以需要先[注册账号](https://issues.sonatype.org/secure/Signup!default.jspa)。

注册好之后，就可以[创建一个新的 Issue](https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134)（文档中又称 Project ticket），可以参考我创建的测试 Issue [OSSRH-74121](https://issues.sonatype.org/browse/OSSRH-74121)。

![](https://img.seriouszyx.com/202110161035158.png#vwid=1949&vhei=895)

这时需要进行人工审核，将分配的编号 `OSSRH-74121` 添加到域名的 TXT 解析，或者在 GitHub 等托管服务中创建一个名为 `OSSRH-74121` 的公开库。我等了大概一两个小时，就通过了审核，Status 变成了 `RESOLVED` 。

## 配置发布信息

本文使用 Maven 为例发布自己的 Java 包，如果使用 Gradle、Ant 等工具，可以参照官方文档。

### 分发管理和认证

在 `pom.xml` 中添加以下配置，使得可以使用 Nexus Staging Maven plugin 插件向 OSSRH Nexus Repository Manager 发布。

```xml
<distributionManagement>
  <snapshotRepository>
    <id>ossrh</id>
    <url>https://s01.oss.sonatype.org/content/repositories/snapshots</url>
  </snapshotRepository>
  <repository>
    <id>ossrh</id>
    <url>https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/</url>
  </repository>
</distributionManagement>
<build>
  <plugins>
    <plugin>
      <groupId>org.sonatype.plugins</groupId>
      <artifactId>nexus-staging-maven-plugin</artifactId>
      <version>1.6.8</version>
      <extensions>true</extensions>
      <configuration>
        <serverId>ossrh</serverId>
        <nexusUrl>https://s01.oss.sonatype.org/</nexusUrl>
        <autoReleaseAfterClose>true</autoReleaseAfterClose>
      </configuration>
    </plugin>
    ...
  </plugins>
</build>
```

下面是发布所需的 JIRA 账户信息，写入到 Maven 的 `setting.xml` 文件中（通常位于 `~/.m2`）。

```xml
<settings>
  <servers>
    <server>
      <id>ossrh</id>
      <username>your-jira-id</username>
      <password>your-jira-pwd</password>
    </server>
  </servers>
</settings>
```

注意这里的 id 和 `snapshotRepository` /`repository` 中的 id，以及 `plugin` 中的 id 都是相同的，都为 **ossrh**。

### Javadoc 和源代码

为了生成 Javadoc 和源 jar 文件，需要在 `pom.xml` 中添加以下配置。

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-source-plugin</artifactId>
      <version>2.2.1</version>
      <executions>
        <execution>
          <id>attach-sources</id>
          <goals>
            <goal>jar-no-fork</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-javadoc-plugin</artifactId>
      <version>2.9.1</version>
      <executions>
        <execution>
          <id>attach-javadocs</id>
          <goals>
            <goal>jar</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

### GPG 签名组件

Maven GPG 插件使用以下配置为组件进行签名。

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-gpg-plugin</artifactId>
      <version>1.5</version>
      <executions>
        <execution>
          <id>sign-artifacts</id>
          <phase>verify</phase>
          <goals>
            <goal>sign</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

并在 `setting.xml` 中配置 gpg 的运行文件和密码。

```xml
<settings>
  <profiles>
    <profile>
      <id>ossrh</id>
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <properties>
        <gpg.executable>D:/Work/GnuPG/bin/gpg.exe</gpg.executable>
        <gpg.passphrase>the_pass_phrase</gpg.passphrase>
      </properties>
    </profile>
  </profiles>
</settings>
```

如果想要发布正式版本，还需要在 `pom.xml` 中配置项目名、描述、开发者等信息。

```xml
<name>maven-release-example</name>
<description>Example project to deploy maven projects.</description>
<url>https://github.com/seriouszyx/maven-release-example</url>
<licenses>
    <license>
        <name>MIT</name>
        <url>https://opensource.org/licenses/MIT</url>
    </license>
</licenses>
<developers>
    <developer>
        <name>Yixiang Zhao</name>
        <email>seriouszyx@gmail.com</email>
        <organization>seriouszyx</organization>
        <organizationUrl>https://seriouszyx.com/</organizationUrl>
    </developer>
</developers>
<scm>
    <connection>scm:git:https://github.com/seriouszyx/maven-release-example.git</connection>
    <developerConnection>scm:git:https://github.com/seriouszyx/maven-release-example.git</developerConnection>
    <url>https://github.com/seriouszyx/maven-release-example</url>
</scm>
```

## 发布

更改 `pom.xml` 中的版本号为 `1.0.0` ， 在项目根目录运行 `mvn clean deploy` 即可发布，发布成功后组件会存储到一个临时存储库中，只对团队成员开放，可以在 [https://s01.oss.sonatype.org/](https://s01.oss.sonatype.org/) 访问，点击右上角登录 JIRA 的账号，搜索刚发布的组件，即可查询到相关信息。

![](https://img.seriouszyx.com/202110161035870.png#vwid=2560&vhei=1381)

因为之前在 maven 插件 nexus-staging-maven-plugin 中的 `autoReleaseAfterClose` 属性设置为 true 了，所以自动上传到 staging repository ，并且自动执行了 close->release->drop 三步曲，等待两小时后就可以在 [https://search.maven.org](https://search.maven.org/) 查到了。

![](https://img.seriouszyx.com/202110161035404.png#vwid=2069&vhei=393)

在新建工程的 `pom.xml` 种添加依赖，即可使用 jar 包中的方法。

```xml
<dependency>
    <groupId>com.seriouszyx</groupId>
    <artifactId>maven-release-example</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

1. [The Central Repository Documentation](https://central.sonatype.org/publish/)
2. [发布项目到中央库的一些常见问题](https://blog.csdn.net/qiaojialin/article/details/77659200)