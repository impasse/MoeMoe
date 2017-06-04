---
title: 突然想到 Javascript 里的 async-await 和 Haskell 里的 do-notation 是一个东西
s: javascript-and-haskell-about-monad
date: 2016-12-02 16:30:46
tags:
    - JavaScript
    - Haskell
---
Javascript 里面的 Promise 对应 Haskell 里的 Monad，把操作封装在 Promise/Monad 里。

```js
async function do(){
  let a = await JobOne();
  let b = await JobTwo();
  return c;
}
```
<!--more-->
```haskell
do' = do
  a <- job_one
  b <- job_two
  return c
```

只不过没有haskell那些类型约束=-=
