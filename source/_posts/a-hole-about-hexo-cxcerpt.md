---
title: 一个 hexo cxcerpt 的坑
s: a-hole-about-hexo-cxcerpt
date: 2017-04-30 11:08:19
tags:
  - Hexo
---
刚刚更新完博客提交后，发现博客文章列表页所有的文章都没了预览。

当时真的是一脸茫然啊，好奇怪呀，我只不过是多加了一篇文章啊喂。

然而当我 reset 到旧的 commit 后它就又恢复了正常，这....这...不会因为多了一个 md 文件引起吧，一定是时辰的错啦。
<!--more-->
然后呢，各种找原因，期间的坑就不一一赘述了。

总的来说，原因是 `hexo-html-minifier` 这个插件和 `hexo` 本身的 `cxcerpt` 机制产生了冲突。大概的流程为

1. post render
2. html-html-minifier
3. hexo builtin cxcerpt

这就产生坑了啊喂... `minifier` 把 `<!--more-->` 这个 comments 直接删掉了，就导致 `cxcerpt` 不能正常 work 了。

好吧，是不是要给 `minifier` 提个 pr，专门忽视掉 `<!--more-->` 这个 comments 呢？好像也不太行，这个东西也是调用的别的模块来 minifier 的。

啊啊啊，所以大概只能默默的自己记住了QAQ
