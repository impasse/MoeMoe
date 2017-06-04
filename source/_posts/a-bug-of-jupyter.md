---
title: 一个 jupyter 的 bug
s: a-bug-of-jupyter
date: 2017-04-30 10:20:00
tags:
    - Python
---
最近在玩 Python 的一些东西，就在 vps 上装了 Jupyter notebook，这样就可以在线把代码放到线上，随时访问就能继续操作/查看了。

不过其中遇到了一个问题，在我保存了一个 .ipynb 后，一会再重启打开 notebook，ipython kernel 会启动**失败**。
<!--more-->
大概的原因是:

jupyter 会把 `connection_file` 写入到文件系统中，但是并不会创建那个文件所在的目录，结果就导致创建文件了。

解决方法很简单：

1. 编辑 `jupyter_client/connect.py`,在最前面加上 `from pathlib import Path`。

2. 在 `write_connection_file` 函数的 `with open(fname, 'w') as f` 前面加上

```python
base_dir = os.path.dirname(fname)
if not os.path.isdir(base_dir):
    Path(base_dir).mkdir(parents=True)
# 这里有个问题是这个 base_dir 如果是个文件，那还是写入不了文件的，不过如果不是故意的话基本不会发生 hhh
```

就解决了 ww
