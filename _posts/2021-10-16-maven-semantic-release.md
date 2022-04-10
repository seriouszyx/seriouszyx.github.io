---
layout: post
title: 🪜【CI/CD】使用 maven-semantic-release 自动化发版
date: 2021-10-16 14:41:20
---

## 前言

["如何发布 Java 包到 Maven 中央仓库"](/2021/publish-to-maven.html) 讲解了本地将 Java 包发布到 Maven 中央库的全过程。但在开源项目中，一般通过 GitHub 进行代码托管，并在 GitHub 的 Release 中进行发版并写明更新日志，还可能在 README 中添加 Maven 中央库的徽章。这一过程固定又繁琐，本文通过 maven-semantic-release 和 GitHub Actions 进行自动化操作，完成上述的整套流程。

演示仓库位于 [https://github.com/seriouszyx/maven-release-example](https://github.com/seriouszyx/maven-release-example)。


## GitHub Actions

GitHub 提供了一个 Maven 工作流的[模板](https://github.com/actions/starter-workflows/blob/main/ci/maven.yml)，在项目根目录创建 `.github/workflows/maven-ci.yml` 文件，添加工作流的配置文件。

```yml
name: Java CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Set up JDK 1.8
        uses: actions/setup-java@v1
        with:
          java-version: 1.8

      - name: Build with Maven
        run: mvn clean test
```

工作流执行了下面几步。

* `checkout` 将存储库的副本下载到运行的服务器上
* `setup-java` 配置了 JDK11
* `Build with Maven` 进行构建和测试

为 `maven-gpg-plugin` 添加 configuration，用于 GPG 非交互式密码输入。

```xml
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
    <configuration>
        <!-- Prevent gpg from using pinentry programs -->
        <gpgArguments>
            <arg>--pinentry-mode</arg>
            <arg>loopback</arg>
        </gpgArguments>
    </configuration>
</plugin>
```

## maven-semantic-release

[semantic-release](https://semantic-release.gitbook.io/semantic-release/) 会根据规范化的 commit 信息生成发布日志，默认使用 angular 规则，其他规则可以配置插件完成。

semantic-release 大致的工作流如下:

* 提交到特定的分支触发 release 流程
* 验证 commit 信息，生成 release note，打 git tag
* 其他后续流程，如生成 `CHANGELOG.md`，`npm publish` 等等（通过插件完成）

[maven-semantic-release](https://github.com/conveyal/maven-semantic-release) 是官方文档列出的针对 Maven 的第三方工具，它将部署一个 Maven 项目到 Maven 中央库，而 semantic-release 则是部署一个 node.js 项目到 npm。

前文中 JIRA 和 GPG 的配置信息全都存放在本地，可以将其配置在 GitHub Secrets 中，以供 GitHub Actions 自动构建过程中使用。

需要提前准备好的是 JIRA 的用户名（OSSRH_JIRA_USERNAME）和密码（OSSRH_JIRA_PASSWORD），GPG 的 key 名（GPG_KEY_NAME）、私钥（GPG_PRIVATE_KEY）和生成键值对时输入的密码（GPG_PASSPHRASE）。

其中，GPG 的 key 名可以通过以下命令获得，我的是 `89985FBD3651A87B` 。

```shell
C:\Users\Yixiang Zhao>gpg --list-secret-keys --keyid-format LONG
C:/Users/Yixiang Zhao/AppData/Roaming/gnupg/pubring.kbx
-------------------------------------------------------
sec   rsa3072/89985FBD3651A87B 2021-10-14 [SC] [expires: 2023-10-14]
      444D548E4E29746B4E2C89FC89985FBD3651A87B
uid                 [ultimate] Yixiang Zhao <seriouszyx@gmail.com>
ssb   rsa3072/1613CEA56E822D62 2021-10-14 [E] [expires: 2023-10-14]
```

GPG 的私钥可以通过 `gpg --armo --export-secret-keys 89985FBD3651A87B` 命令获得，最后的参数是 key 名。注意私钥是从 `-----BEGIN PGP PRIVATE KEY BLOCK-----` 一直到 `-----END PGP PRIVATE KEY BLOCK-----`，而不是仅仅是中间这一段文本。

将这些配置信息添加到 Settings->Secrets->Repository secrets 中。

![](https://img.seriouszyx.com/202110161622009.png#vwid=2560&vhei=1378)

补充 `maven-ci.yml` 文件，添加 maven-semantic-release 配置。

```yml
name: Java CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Set up JDK 1.8
        uses: actions/setup-java@v1
        with:
          java-version: 1.8
          server-username: OSSRH_JIRA_USERNAME
          server-password: OSSRH_JIRA_PASSWORD
          gpg-private-key: ${{ secrets.GPG_PRIVATE_KEY }}
          gpg-passphrase: GPG_PASSPHRASE

      - name: Build with Maven
        run: mvn clean test

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 16

      - name: Sematic Release
        run: |
          npm install -g @conveyal/maven-semantic-release semantic-release
          semantic-release --prepare @conveyal/maven-semantic-release --publish @semantic-release/github,@conveyal/maven-semantic-release --verify-conditions @semantic-release/github,@conveyal/maven-semantic-release --verify-release @conveyal/maven-semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GPG_KEY_NAME: ${{ secrets.GPG_KEY_NAME }}
          GPG_PASSPHRASE: ${{ secrets.GPG_PASSPHRASE }}
          OSSRH_JIRA_USERNAME: ${{ secrets.OSSRH_JIRA_USERNAME }}
          OSSRH_JIRA_PASSWORD: ${{ secrets.OSSRH_JIRA_PASSWORD }}

```

前文在本地 maven 的 `settings.xml` 文件中配置的信息，转移到项目根目录下的 `maven-settings.xml` 中。

```xml
<settings>
    <servers>
        <server>
            <id>ossrh</id>
            <username>${OSSRH_JIRA_USERNAME}</username>
            <password>${OSSRH_JIRA_PASSWORD}</password>
        </server>
    </servers>
    <profiles>
        <profile>
            <id>ossrh</id>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
            <properties>
                <gpg.executable>gpg</gpg.executable>
                <gpg.keyname>${GPG_KEY_NAME}</gpg.keyname>
                <gpg.passphrase>${GPG_PASSPHRASE}</gpg.passphrase>
            </properties>
        </profile>
    </profiles>
</settings>
```

配置好后，每次 push 或 pull request 到 master 分支时，都会出发 GitHub Actions 自动化构建、测试，并通过 maven-semantic-release 将 jar 上传到 Maven 中央库，并在项目的 GitHub Release 中自动生成更新日志。

![](https://img.seriouszyx.com/202110161622266.png#vwid=1960&vhei=1261)

---

1. [semantic-release](https://semantic-release.gitbook.io/semantic-release/)
2. [通过 GitHub Action 自动部署 Maven 项目](https://juejin.cn/post/6892965219791093773)
3. [团队敏捷实践 —— 使用 semantic-release 自动管理发布版本](https://blog.dteam.top/posts/2020-05/semantic-release.html)