---
title: 突然发现 Chrome 的 Dev Tools 现在显示 Cache 的来源了
s: about-chrome-network-devtool
date: 2017-02-14 14:20:24
tags:
    - JavaScript
    - FE
---
![devtool](devtool.png)

根据图里的情况来看。

WebFonts，Data URL（这不是废话）都是 from memory cache.
<!--more-->
而其他的，例如外部 css, js 文件，图片之类的都是 from disk cache.

当然...这一切都是在被 cache 的基础之上...
