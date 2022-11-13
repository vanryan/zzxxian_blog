---
title: Jumbo Frame 与 MTU
date: "2018-09-24T21:37:43.330Z"
template: post
draft: false
slug: "jumbo-frame"
category: "networking"
collection: "technical"
tags:
  - "technical"
  - "ethernet"
  - "networking"
  - "AWS"
  - "computer-networks"
description: "如何增加网络吞吐量：1500 MTU seems too small, let us sextuple it!"
---

## 什么是MTU

根据AWS EC2的文档：

> The maximum transmission unit (MTU) of a network connection is the size, in bytes, of the largest permissible packet that can be passed over the connection. The larger the MTU of a connection, the more data that can be passed in a single packet. Ethernet packets consist of the frame, or the actual data you are sending, and the network overhead information that surrounds it.

MTU，即是一个connection上最大允许的packet/frame大小。我们知道，交换机(switch)和路由(router)的CPU都是按帧(frame)来处理信息。那么每个frame越大，理论上我们部署的网络中的router和switch总体效率便会得到提高。

## Ethernet Frame
拿Ethernet Frame作例子：
![802.3 Ethernet packet and frame structure - wikipedia](https://upload-images.jianshu.io/upload_images/72299-e65bbc17b0559eee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

每个frame的header大小是固定的(frame delimiter之后的：MAC destination + MAC source + 802.1Q tag + length) = 18 bytes。802.1Q协议，也被称为Dot1q，本质上是用来在IEEE 802.3 Ethernet network上支持VLAN的，这里不赘述。由于VLAN的广泛使用，我们这里将其考虑进来。

由于header+preamble的大小固定，很显然每个frame/packet越小，收发的网络设备(switch/router)CPU花费在组合和拆分信息(收到frames时组合，发送信息时拆分)的时间和资源就越多，举一个极端情况，如果每帧payload只有1 byte，那我们不需要计算也能直观感觉到，这个网络的信息处理效率（吞吐量 / throughput）低得莫名其妙。从信息有效的比率的角度来说，Fixed Header + Payload = Unit Size，如果允许的Unit Size越大，那么每个frame的payload也就越大，所以所有的frames的信息里，fixed header占的比例就越小，网络设备就更多地在处理有效信息——payload。

![直观比较](https://upload-images.jianshu.io/upload_images/72299-0b056269672d507f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## Why Jumbo Frame

根据[IEEE 802.3](http://www.ieee802.org/3/)，现在IEEE规定的Ethernet MTU是1500个字节。满打满算，1500个字节在payload上用完，1500/1542 （1500+26+4+12=1544）= 97.28%是这个限制下最高的利用效率（假设使用802.1Q VLAN tagging ）。随着网络的日渐发达，对性能的要求愈加苛刻，人们不满足于1500MTU，所以拥有9000字节payload的Jumbo Frame便应运而生。

Jumbo Frame并不是什么新鲜的东西，Jumbo Frame起源于 [Alteon WebSystems](https://en.wikipedia.org/wiki/Alteon_WebSystems "Alteon WebSystems") 推出的ACEnic [Gigabit Ethernet](https://en.wikipedia.org/wiki/Gigabit_Ethernet "Gigabit Ethernet") adapters。现在的Jumbo Frame是9000MTU这一规范，也是源自于此。所以并不是说固定9000字节，不同的网络（设备）供应商可能提供不同的选择。

![超9000MTU!](https://upload-images.jianshu.io/upload_images/72299-4b28aad3a364ca4a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Jumbo这个词本意就是“巨大，特大”，所以一般frame size非标准（1500MTU）的frame规制，我们都可以称其为Jumbo Frame。

说到这里，我们可能会有些迷惑的地方在于，1500MTU 或者9000MTU，到底是指的payload size还是整个frame的大小呢？这真的是一个case by case的问题，各个网络设备供应商可能从未统一过。比如Cisco IOS 1500可能跟Juniper 1518一样，很明显一个标明的MTU没包含header一个包含了header，又比如AWS的Jumbo Frame是指的整个packet size 9000，而AWS又称这个standard为9001MTU。

## Jumbo Frame的应用
使用上，比较重要的一点是，Jumbo Frame在一套系统中的应用，必须是end-to-end的。因为一旦中间有任何一个hop，任何一环没能支持同一MTU的Jumbo Frame，那么那一个部分就可能成为整个系统的网络瓶颈——木桶原理，最慢的一环决定了整体的速度。

现在的主流厂商基本上都支持Jumbo Frame。比如说Juniper Networks的[SRX Series Services Gateway](https://www.juniper.net/us/en/products-services/security/srx-series/srx5400/)都支持最多9192字节的Jumbo Frame，当然这是整个packet size，payload部分仍是9000字节。

### IP Fragmentation和Path MTU Discovery
IP Fragmentation，即是一个支持IP协议的link（比如两个router）MTU大小小于packet size时，该IP packet被切分传送。然后link的接收方则会将MTU的packet重新组合。比如说router A开始发送Jumbo Frame，而下一个hop的router B仍旧认为这个link的MTU是1500，那么这里就可能会发生IP Fragmentation，否则router B就只能丢掉不合标准的来自于A的packets。

Path MTU Discovery则是基于ICMP的，用于确定一个link的MTU的技术。如果要支持Jumbo Frame，一个网络势必要支持Path MTU Discovery，否则该网络中的设备会缺乏调整MTU的能力。

## Jumbo Frame的问题
Jumbo Frame之所以没有成为现今IEEE的正式标准，恐怕是因为它所具有的一些问题。

一个问题便来自于上面所说的Path MTU Discovery。众所周知，ICMP有着很多安全隐患（比如典型的DoS--ICMP flood），因而许多网络设备供应商/ISP/用户自己会关掉/block掉整个ICMP，这便会限制Jumbo Frame的使用。

另一个问题，如上所述，Jumbo Frame要发挥价值，必须要一个网络end-to-end的支持并开启Jumbo Frame，这一点，在很复杂的网络环境中，不论是开发角度还是实践角度，都是很难的。当然有一些特殊的网络环境很适合使用，比如说AWS的[Direct Connect](https://aws.amazon.com/directconnect/)——为用户提供AWS到自己的onprem网络（比如公司/自己的datacenter等等）提供一条不经过Internet基于802.1q VLAN的专属通路。

现代的NIC有着非常丰富和强大的处理功能。比如一个有着64k buffer的NIC，它并不会太在乎一个个1500字节的packet，而是先把现有的packets塞进buffer，然后便可以根据自己的处理能力高效的处理buffer，而非frame by frame地处理数据。

总而言之，使用Jumbo Frame，听起来很美好，能有效提高网络吞吐，可是具体的使用，需要考虑具体网络环境和所涵盖的所有网络设备，权衡之下才能知道使用它是一个能够有效改进网络的手段，还是弊大于利的多余操作。

## References
- [Should I enable jumbo frame size of 9000 bytes for my NICs?](https://superuser.com/questions/346717/should-i-enable-jumbo-frame-size-of-9000-bytes-for-my-nics)
- [The Case Against Jumbo Frames ](https://www.nanog.org/sites/default/files/wednesday_general_steenbergen_antijumbo.pdf)
- [Wikipedia Jumbo Frame](https://en.wikipedia.org/wiki/Jumbo_frame)
- [Wikipedia Path MTU Discovery](https://en.wikipedia.org/wiki/Path_MTU_Discovery)
- [Juniper Networks](https://www.juniper.net/documentation/en_US/junos/topics/concept/jumbo-ethernet-interfaces-security.html)
- [Guidance on the use of jumbo frames](https://kb.netgear.com/25091/Guidance-on-the-use-of-jumbo-frames)
