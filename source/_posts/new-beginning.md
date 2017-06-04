---
title: 终结是新的开始
s: new-beginning
date: 2016-11-12 14:56:03
tags: Blog
---
之前考虑着关掉博客，但是想了一想还是不想把就这么关掉，大概是从去年的7、8月份时写了第一篇，好像是关于 `IOC/AOP` 的吧，之后基本上几天能写一篇，不过内容都不算很多，不是很详细，也不是很深入的那种，大多都是写一些自己的小玩具之类的。

暑假之后更新的次数少了很多，原因前面已经说过了。本来想着关掉博客这个博客，后来还是没有舍得下手。但是就那样继续下去又感觉略别扭。其实蛮想不到的，自己这些文章里好像只有那个写多说评论框`https`下使用的文章稍热一点点。好吧，现在其实不需要那么麻烦了，只需要在 `http header` 里带上 `Content-Security-Policy: upgrade-insecure-requests` 把那些 `http` 连接 **强行** 升为 `https` 就好了。
<!--more-->
终结是新的开始。我把之前的东西全部都备份压缩放到了 `github` 上「怎么感觉这好像算是滥用的样子」，木有续以前的坑。

重新写了博客，考虑到未来可能不想续费阿里云了(有点贵)，所以考虑以后部署到 `github pages`。

大部分人都是用的 `hexo`,`jekyll` 等静态博客生成工具。将博客内容写到 `markdown` 文件里，然后 `build` 出博客的静态文件，再 `push` 到 `username.github.io` 或 `gh-pages` 分支上。但是呢，我可不想落入俗套呐，于是我就结合了 @Junnplus 这家伙的「見 issues」 ，用 `SPA + github commit api` 实现了这个博客咯。哎，之前百度还收录了我100多个页面呢，换上 `SPA` 后估计就没了，无所谓了=-=

因为真正自己写的部分只有前端的部分，所以我考录着「能不能只使用CDN来部署呢？」，因为腾讯云免费提供一定量的CDN流量，所以我就想到了部署到腾讯云的CDN，腾讯云的CDN支持回源/ftp上传空间/oss三种部署的方式，因为 oss 有现成的 sdk 的原因，所以我选择了用 oss 储存的方式（后来才发现这是个深坑，不能直接上传一个目录，只能一个一个传）。

写完了自动部署的脚本，下一个问题就是自动构建了，其实这个问题网上已经有现成的解决方案了，有各种 CI(持续集成) 工具来做这件事，但是因为有些需要收费的原因，我不是很想去学。so, 自己写一个咯，这个倒是很简单，因为是 webhook 的机制，所以需要一个 web server 来 hook events，这时候就用上了以前注册的好东西了，用上了 `arukas.io` 的 `docker` 云，开一个 `containner` 轻松愉快。每当新 push 时，脚本都会自动构建一次并将过程表现在<https://github.com/lingmm/IssueBlog/commits/master>上面。

不得不说，`python` 的 `cotextmanager` 做这个蛮好用的。
```python
@contextlib.contextmanager
def status_around():
  status('pending')
  try:
    yield
    status('success')
  except:
    status('error')

with status_around():
  build()
```
当然像 `ruby`,`scala` 能做的比↑还要好看一点，不过 `python` 也还不错啦~

今天试了试 `daocloud` ，以前都是用命令操作  `docker` ，换成 `UI` 感觉体验蛮不错的，除了那个有点像 `icloud` 的 `mainmenu` ，其他体验都挺好，中间我通过微信问了问他们怎么删除他们的 `monitor`，解释的也挺热情的。(感觉他们的monitor有点占内存)

建了个 images 放了博客，目前放在 `daocloud` 上管理，感觉美滋滋，QAQ
