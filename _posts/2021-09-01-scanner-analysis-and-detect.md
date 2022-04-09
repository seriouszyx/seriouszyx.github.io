---
layout: post
title: 网络扫描探测工具的分析与识别
date: 2021-09-01 14:30:24
---

## 扫描探测工具识别

网络扫描探测通常是发起网络入侵的第一步，攻击者可以利用扫描探测工具获取网络中的主机系统、TCP/UDP 端口的开放情况、子域名、网站指纹、WAF、CDN、中间件类别等重要信息，识别出存在安全漏洞的主机或系统，从而发起有针对性的网络入侵行为。此外，一些扫描工具同时具备漏洞利用的能力。因此，对网络扫描探测行为进行识别和研究，有利于及时发现网络攻击的前兆，发现网络攻击行为，快速定位网络服务中存在的漏洞，对网络安全防护工作十分有意义。

本文以下列三个常见扫描器为代表，探究扫描器的特有指纹信息，编写 Demo 进行扫描器的识别。

![](https://img.seriouszyx.com/202109011044955.png#vwid=1999&vhei=694)

## Zmap

### 抓包分析

ZMap 被设计用来针对整个 IPv4 地址空间或其中的大部分实施综合扫描的工具。

默认情况下，ZMap 会对于指定端口实施尽可能大速率的 TCP SYN 扫描。如下图所示，客户端在发送一个 SYN 包的时候，如果对方端口开放，就会发送一个 SYN-ACK，那么就表明这个端口开放，这时候我们发送 RST 包，防止占用对方资源；如果对方端口不开放，那么我们就会收到对方主机的 RST 包。

![](https://img.seriouszyx.com/202109011044047.png#vwid=2652&vhei=1128)

较为保守的情况下，对 10,000 个随机的地址的 80 端口以 10Mbps 的速度扫描，如下所示：

![](https://img.seriouszyx.com/202109011044067.png#vwid=2225&vhei=653)

在生成的 csv 结果文件中，以下 IP 地址的 80 端口开放：

```bash
47.243.139.246
20.205.204.152
121.36.193.65
156.245.39.71
13.238.233.150
142.234.31.240
68.183.75.244
185.48.122.237
52.25.116.123
104.127.1.181
185.248.102.245
95.217.201.8
3.125.24.134
23.15.117.202
```

抓包结果如下所示，Zmap 向随机的 10,000 个 IP 的 80 端口发送 SYN 数据包。

![](https://img.seriouszyx.com/202109011044558.png#vwid=2560&vhei=908)

如果 IP 的 80 端口开放，以 47.243.139.246 为例，筛选出的数据包如下图所示，具体解释为：

1. 向 47.243.139.246 的 80 端口发送 SYN 数据包
2. 接收到 47.243.139.246 的 80 端口的 SYN/ACK 包，证明该 IP 的 80 端口可用
3. 向 47.243.139.246 的 80 端口发送 RST 数据包，防止占用对方资源

![](https://img.seriouszyx.com/202109011044591.png#vwid=2560&vhei=371)

如果 IP 的 80 端口不开放，以 44.102.170.124 为例，筛选出的数据包如下图所示。Zmap 向其发送 SYN 请求后没有得到应答，故判断该 IP 的 80 端口不可用。

![](https://img.seriouszyx.com/202109011044623.png#vwid=2560&vhei=235)

查看 Zmap 向哪些 IP 发送了 RST 数据包，则证明这些 IP 的 80 端口可用。筛选结果如下图所示，目的地址与上述的 csv 结果文件一致。

![](https://img.seriouszyx.com/202109011044663.png#vwid=2560&vhei=798)

### 源码分析

Zmap 整体函数调用图如下所示。

![](https://img.seriouszyx.com/202109011044692.png#vwid=942&vhei=522)

通过图我们可以直观的看到整个程序调用的过程。Zmap 在启动时候，先获取环境信息，如 IP、网关等。然后读取配置文件选择使用哪种扫描方式，然后在 Probe_modules 切换到对应的模块，然后启动。

下面侧重分析 SYN 扫描这个模块，整个执行的过程中，会有一个线程专门负责发送，另外有一个使用 libpcap 组件抓包，发送和接收就独立开来。

[zmap/src/probe_modules/module_tcp_synscan.c](https://github.com/zmap/zmap/blob/main/src/probe_modules/module_tcp_synscan.c) 是用于执行 TCP SYN 扫描的探测模块，在初始化阶段的 synscan_init_perthread 函数中，依次调用 make_ip_header 函数和 make_tcp_header 函数进行数据包 header 的封装。

```c
static int synscan_init_perthread(
    void *buf, macaddr_t *src, macaddr_t *gw,
    port_h_t dst_port,
    UNUSED void **arg_ptr)
{
    struct ether_header *eth_header = (struct ether_header *)buf;
    make_eth_header(eth_header, src, gw);
    struct ip *ip_header = (struct ip *)(&eth_header[1]);
    uint16_t len = htons(sizeof(struct ip) + ZMAP_TCP_SYNSCAN_TCP_HEADER_LEN);
    make_ip_header(ip_header, IPPROTO_TCP, len);
    struct tcphdr *tcp_header = (struct tcphdr *)(&ip_header[1]);
    make_tcp_header(tcp_header, dst_port, TH_SYN);
    set_mss_option(tcp_header);
    return EXIT_SUCCESS;
}
```

这两个函数编写于 [zmap/src/probe_modules/packet.c](https://github.com/zmap/zmap/blob/main/src/probe_modules/packet.c) 中。分析 make_ip_header 函数可知，在下示第 7 行，IP 的 identification number 被设置为固定的 54321。

```c
void make_ip_header(struct ip *iph, uint8_t protocol, uint16_t len)
{
    iph->ip_hl = 5;  // Internet Header Length
    iph->ip_v = 4;   // IPv4
    iph->ip_tos = 0; // Type of Service
    iph->ip_len = len;
    iph->ip_id = htons(54321); // identification number
    iph->ip_off = 0;	   // fragmentation flag
    iph->ip_ttl = MAXTTL;      // time to live (TTL)
    iph->ip_p = protocol;      // upper layer protocol => TCP
    // we set the checksum = 0 for now because that's
    // what it needs to be when we run the IP checksum
    iph->ip_sum = 0;
}
```

分析 make_tcp_header 函数可知，在下示第 10 行，TCP 的 window 被设置为固定的 65535。

```c
void make_tcp_header(struct tcphdr *tcp_header, port_h_t dest_port,
		     uint16_t th_flags)
{
    tcp_header->th_seq = random();
    tcp_header->th_ack = 0;
    tcp_header->th_x2 = 0;
    tcp_header->th_off = 5; // data offset
    tcp_header->th_flags = 0;
    tcp_header->th_flags |= th_flags;
    tcp_header->th_win = htons(65535); // largest possible window
    tcp_header->th_sum = 0;
    tcp_header->th_urp = 0;
    tcp_header->th_dport = htons(dest_port);
}
```

查看抓取的 SYN 数据包，如下图所示，IP 的 ID 和 TCP 的 window 确实为 54321 和 65535，所以这两个固定值可作为扫描器特征。

![](https://img.seriouszyx.com/202109011044714.png#vwid=2560&vhei=1275)

## Angry IP Scanner

### 抓包分析

Angry IP Scanner（简称 angryip） 是一款开源跨平台的网络扫描器，主要用于扫描 IP 地址和端口。

angryip 默认使用 Windows ICMP 方法扫描各个 ip 地址，扫描每个 IP 的 80、443 和 8080 端口。以 IP 范围 123.56.104.200~123.56.104.250 为例，扫描结果如下图所示，红色代表 IP 不可用，蓝色代表 IP 可用端口不可用，绿色代表 IP 和端口均可用。

![](https://img.seriouszyx.com/202109011044740.png#vwid=2558&vhei=1534)

在捕获的数据包中，以 123.56.104.218 为例，该 IP 被标记为绿色，下面是与它有关的数据包抓取结果。

图中第一个红框处 angryip 与 123.56.104.218 进行了 3 次 ping，且都予以回复，说明该 IP 可用。第二个红框处 angryip 分别测试 123.56.104.218 的 80、443 和 8080 端口，其中 80 和 443 端口予以回复，说明这两个端口可用。

![](https://img.seriouszyx.com/202109011044760.png#vwid=2560&vhei=930)

在不可用的 IP 中，以 123.56.104.204 为例，与它相关的数据包抓取结果如下。angryip 向其发送 3 次 ping 请求，都没有得到回复，则判断其 IP 不可用，也没有向其端口发送数据包。

![](https://img.seriouszyx.com/202109011044783.png#vwid=2560&vhei=325)

### 源码分析

因为无论 IP 和端口是否可用，angryip 都会先发送 ping 数据包，所以通过 ping 阶段的源码分析其工具的特征。

分析 [ipscan/test/net/azib/ipscan/core/net/ICMPSharedPingerTest.java](https://github.com/angryip/ipscan/blob/64ec7090acdba380a62d5d2e1a6c630cc5302197/test/net/azib/ipscan/core/net/ICMPSharedPingerTest.java) 源码，该测试类调用 pinger.ping()方法 3 次，并计算平均时长。

```java
public class ICMPSharedPingerTest {
    @Test @Ignore("this test works only under root")
    public void testPing() throws Exception {
	Pinger pinger = new ICMPSharedPinger(1000);
	PingResult result = pinger.ping(new ScanningSubject(InetAddress.getLocalHost()), 3);
	assertTrue(result.getAverageTime() >= 0);
	assertTrue(result.getAverageTime() < 50);
	assertTrue(result.getTTL() >= 0);
    }
}
```

该方法在 [ipscan/test/net/azib/ipscan/core/net/WindowsPinger.java](https://github.com/angryip/ipscan/blob/master/src/net/azib/ipscan/core/net/WindowsPinger.java) 中，源码如下所示，判断 IP 类型，并调用 IPv6 和 IPv4 对应的方法。

```java
public PingResult ping(ScanningSubject subject, int count) throws IOException {
    if (subject.isIPv6())
	return ping6(subject, count);
    else
	return ping4(subject, count);
}
```

以 IPv4 为例，方法中定义了数据包的数据大小为 32，即 sendDataSize = 32。后续使用 Memory()方法创建 SendData 对象，并未对其进行赋值，故默认值应全为 0。

```java
private PingResult ping4(ScanningSubject subject, int count) throws IOException {
    Pointer handle = dll.IcmpCreateFile();
    if (handle == null) throw new IOException("Unable to create Windows native ICMP handle");

    int sendDataSize = 32;
    int replyDataSize = sendDataSize + (new IcmpEchoReply().size()) + 10;
    Pointer sendData = new Memory(sendDataSize);
    sendData.clear(sendDataSize);
    Pointer replyData = new Memory(replyDataSize);

    PingResult result = new PingResult(subject.getAddress(), count);
    try {
	IpAddrByVal ipaddr = toIpAddr(subject.getAddress());
	for (int i = 1; i <= count && !currentThread().isInterrupted(); i++) {
            int numReplies = dll.IcmpSendEcho(handle, ipaddr, sendData, (short) sendDataSize, null, replyData, replyDataSize, timeout);
	    IcmpEchoReply echoReply = new IcmpEchoReply(replyData);
	    if (numReplies > 0 && echoReply.status == 0 && Arrays.equals(echoReply.address.bytes, ipaddr.bytes)) {
		result.addReply(echoReply.roundTripTime);
		result.setTTL(echoReply.options.ttl & 0xFF);
	    }
	}
    }
    finally {
	dll.IcmpCloseHandle(handle);
    }
    return result;
}
```

在实际抓包中，每个发出的 ICMP 请求中，Data 的大小均为 32 字节，且全为 0，所以可将它作为 angryip 的特征。

![](https://img.seriouszyx.com/202109011044806.png#vwid=2560&vhei=1068)

## Masscan

### 抓包分析

Masscan 默认使用 SYN 扫描，以 IP 123.56.104.218 为例，扫描其 1~600 端口，结果如下所示。

![](https://img.seriouszyx.com/202109011044826.png#vwid=1346&vhei=278)

抓包结果如下所示，Masscan 向 123.56.104.218 的 1~600 端口进行随机化扫描，发出 SYN 请求。

![](https://img.seriouszyx.com/202109011044847.png#vwid=2560&vhei=1250)

 查看 80 端口的数据包，下图可知 80 端口向 Masscan 回复，说明该端口可用。

![](https://img.seriouszyx.com/202109011044871.png#vwid=2560&vhei=277)

查看 81 端口的数据包，发现并没有数据包回复，说明该端口不可用。

![](https://img.seriouszyx.com/202109011044891.png#vwid=2560&vhei=162)

筛选收到的 SYN/ACK 数据包，得到 22、443 和 80 端口，说明 123.56.104.218 的 1~600 中这 3 个端口可用。

![](https://img.seriouszyx.com/202109011044912.png#vwid=2560&vhei=260)

### 源码分析

观察抓包分析中结果可以发现，所有发出的 SYN 请求中，窗口大小都是 1024。

![](https://img.seriouszyx.com/202109011044935.png#vwid=2560&vhei=1250)

在 Masscan 的主函数 [masscan/src/main.c](https://github.com/robertdavidgraham/masscan/blob/master/src/main.c) 文件中，默认使用以下代码初始化 TCP 数据包的模板。

```c
template_packet_init(
    parms->tmplset,
    parms->source_mac,
    parms->router_mac_ipv4,
    parms->router_mac_ipv6,
    masscan->payloads.udp,
    masscan->payloads.oproto,
    stack_if_datalink(masscan->nic[index].adapter),
    masscan->seed);
```

该函数位于 [masscan/src/templ.pkt.c](https://github.com/robertdavidgraham/masscan/blob/master/src/templ-pkt.c) 中，其中对于 TCP 的初始化代码如下所示。

```c
/* [TCP] */
_template_init(&templset->pkts[Proto_TCP],
               source_mac, router_mac_ipv4, router_mac_ipv6,
               default_tcp_template,
               sizeof(default_tcp_template)-1,
               data_link);
templset->count++;
```

其中调用的 default_tcp_template 定义在该文件头部，下述 7 行指定 IP 的 length 为 40，下述 10 行指定 TLL 为 255，下述 18 行指定 ack 为 0，下述 21 行指定 window 的大小为 1024，可以将这些指标视为 Masscan 的特征。

```c
static unsigned char default_tcp_template[] =
    "\0\1\2\3\4\5"  /* Ethernet: destination */
    "\6\7\x8\x9\xa\xb"  /* Ethernet: source */
    "\x08\x00"      /* Ethernet type: IPv4 */
    "\x45"          /* IP type */
    "\x00"
    "\x00\x28"      /* total length = 40 bytes */
    "\x00\x00"      /* identification */
    "\x00\x00"      /* fragmentation flags */
    "\xFF\x06"      /* TTL=255, proto=TCP */
    "\xFF\xFF"      /* checksum */
    "\0\0\0\0"      /* source address */
    "\0\0\0\0"      /* destination address */

    "\0\0"          /* source port */
    "\0\0"          /* destination port */
    "\0\0\0\0"      /* sequence number */
    "\0\0\0\0"      /* ack number */
    "\x50"          /* header length */
    "\x02"          /* SYN */
    "\x04\x0"        /* window fixed to 1024 */
    "\xFF\xFF"      /* checksum */
    "\x00\x00"      /* urgent pointer */
    "\x02\x04\x05\xb4"  /* added options [mss 1460] */
;
```

## Demo 设计与实现

经过抓包分析和源码分析后，可以总结三个扫描器的特征如下表所示。

![](https://img.seriouszyx.com/202109011044988.png#vwid=1524&vhei=877)

总体来看，三个扫描器工具都是基于单包的头部信息进行识别，且经过源码确认，属于强特征。那么识别的具体设计也就很容易了，对 pcap 文件的每个数据包进行分类，判断其是否满足上述三个指纹，核心识别流程图如下图所示。

![](https://img.seriouszyx.com/202109011044015.png#vwid=622&vhei=624)

具体实现使用 Python 的 Scrapy 包解析 pcap，进行相关操作，代码很短，核心部分如下。

```python
for data in packets:
    if 'TCP' in data:
        # 识别 Zmap
        if (data['TCP'].window == 65535) and (data['IP'].id == 54321):
            isZmap = True
        # 识别 Masscan
        if data['TCP'].window == 1024 and data['TCP'].ack == 0 \
                and data['IP'].ttl == 255 and data['IP'].len == 40:
            isMasscan = True
    # 识别 Angry IP Scanner
    if 'ICMP' in data:
        if 'Raw' in data:
            items = processStr(data['Raw'].load)
            if len(data['Raw']) == 32 and items == ANGRYIP_FLAG:
                isAngryip = True
```

代码放置于 [GitHub](https://github.com/seriouszyx/ScannerRecognition)。

---

参考：

[互联网扫描器 ZMap 完全手册](https://linux.cn/article-5860-1.html)

[zmap 源码解读之 zmap 扫描快的原因](https://nanshihui.github.io/2017/03/29/zmap%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E4%B9%8Bzmap%E6%89%AB%E6%8F%8F%E5%BF%AB%E7%9A%84%E5%8E%9F%E5%9B%A0/)

[Nmap_Bypass_IDS](https://github.com/al0ne/Nmap_Bypass_IDS)

[入侵检测——masscan(扫描篇)](https://blog.csdn.net/weixin_44288604/article/details/115656891)