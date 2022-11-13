---
title: Python整数对象池:“内存泄漏”？
date: "2016-11-28T15:36:37.121Z"
template: post
draft: false
slug: python-int-pool
category: "programming-lang"
tags:
  - "technical"
  - "python"
  - "internal"
  - "programming"
  - "object"
description: "Python里面，整数对象的头文件intobject.h，也可以在Include/目录里找到，
    这一文件定义了PyIntObject这一结构体作为Python中的整数对象"
---

#“墙上的斑点”

我第一次注意到短裤上的那个破洞，大概是在金年的三月上旬。如果想要知道具体的时间，那就得回想一下当时我看见的东西。我还能够回忆起，游泳池顶上，摇曳的、白色的灯光不停地映在我的短裤上；有三五名少年一同扎进了水里。哦，那是大概是冬天，因为我回忆起当时的前一天我和室友吃了部队锅，那段时间我没有吸烟，反而嚼了许多口香糖，糖纸总是掉下去，无意中埋下头，这是我第一次看到短裤上的那个破洞。

----------

今天在机场等shuttle时，听到旁边的两个年轻人神采飞扬地讨论游泳的话题。莫名地回想起来，几年前看了一篇讲述Python内部整数对象管理机制的文章，其中谈到了Python应用内存池机制来对“大”整数对象进行管理。从它出发，我想到了一些问题，想要在这里讨论一下。

# 背景
注：本文讨论的Python版本是Python 2 (2.7.11)，C实现。

## “一切皆对象”

我们知道，Python的对象，本质上是C中的结构体（生存于在系统堆上）。所有Python对象的根源都是`PyObject`这个结构体。

打开Python源码目录的`Include/`，可以找到*object.h*这一文件，这一个文件，是整个Python对象机制的基础。搜索`PyObject`，我们将会找到：

```c
typedef struct _object {
	PyObject_HEAD
} PyObject;
```

再看看PyObject_HEAD这个宏:

```c
#define PyObject_HEAD			\
	_PyObject_HEAD_EXTRA		\
	Py_ssize_t ob_refcnt;		\
	struct _typeobject *ob_type;
```
在实际编译出的`PyObject`中，有`ob_refcnt`这个变量和`ob_type`这个指针。前者用于Python的引用计数垃圾收集，后者用于指定这个对象的“类型对象”。Python中可以把对象分为“普通”对象和类型对象。也就是说，表示对象的类型，是通过一个指针来指向另一个对象，即**类型对象**，来实现的。这是“一切皆对象”的一个关键体现。

## Python中的整数对象

Python里面，整数对象的头文件*intobject.h*，也可以在`Include/`目录里找到，这一文件定义了`PyIntObject`这一结构体作为Python中的整数对象：
```c
typedef struct {
    PyObject_HEAD
    long ob_ival;
} PyIntObject;
```

上面提过了，每一个Python对象的`ob_type`都指向一个类型对象，这里`PyIntObject`则指向`PyInt_Type`。想要了解`PyInt_Type`的相关信息，我们可以打开`intobject.c`，并找到如下内容：

```c
PyTypeObject PyInt_Type = {
	PyObject_HEAD_INIT(&PyType_Type)
	0,
	"int",
	sizeof(PyIntObject),
	0,
	(destructor)int_dealloc,		/* tp_dealloc */
	(printfunc)int_print,			/* tp_print */
	0,					/* tp_getattr */
	0,					/* tp_setattr */
	(cmpfunc)int_compare,			/* tp_compare */
	(reprfunc)int_repr,			/* tp_repr */
	&int_as_number,				/* tp_as_number */
	0,					/* tp_as_sequence */
	0,					/* tp_as_mapping */
	(hashfunc)int_hash,			/* tp_hash */
        0,					/* tp_call */
        (reprfunc)int_repr,			/* tp_str */
	PyObject_GenericGetAttr,		/* tp_getattro */
	0,					/* tp_setattro */
	0,					/* tp_as_buffer */
	Py_TPFLAGS_DEFAULT | Py_TPFLAGS_CHECKTYPES |
		Py_TPFLAGS_BASETYPE,		/* tp_flags */
	int_doc,				/* tp_doc */
	0,					/* tp_traverse */
	0,					/* tp_clear */
	0,					/* tp_richcompare */
	0,					/* tp_weaklistoffset */
	0,					/* tp_iter */
	0,					/* tp_iternext */
	int_methods,				/* tp_methods */
	0,					/* tp_members */
	0,					/* tp_getset */
	0,					/* tp_base */
	0,					/* tp_dict */
	0,					/* tp_descr_get */
	0,					/* tp_descr_set */
	0,					/* tp_dictoffset */
	0,					/* tp_init */
	0,					/* tp_alloc */
	int_new,				/* tp_new */
	(freefunc)int_free,           		/* tp_free */
};
```
这里给Python的整数类型定义了许多的操作。拿`int_dealloc`,`int_free`，`int_new`这几个操作举例。显而易见，`int_dealloc`负责析构，`int_free`负责释放该对象所占用的内存，`int_new`负责创建新的对象。int_as_number也是比较有意思的一个field。它指向一个`PyNumberMethods`结构体。`PyNumberMethods`含有许多个函数指针，用以定义对数字的操作，比如加减乘除等等。

## 通用整数对象池

Python里面，对象的创建一般是通过Python的C API或者是其类型对象。这里就不详述具体的创建机制，具体内容可以参考Python的[有关文档](https://docs.python.org/2/extending/newtypes.html)。这里我们想要关注的是，整数对象是如何存活在系统内存中的。

整数对象大概会是常见Python程序中使用最频繁的对象了。并且，正如上面提到过的，Python的一切皆对象而且对象都生存在系统的堆上，整数对象当然不例外，那么以整数对象的使用频度，系统堆将面临难以想象的高频的访问。一些简单的循环和计算，都会致使malloc和free一次次被调用，由此带来的开销是难以计数的。此外，heap也会有很多的fragmentation的情况，进一步导致性能下降。

这也是为什么通用整数对象池机制在Python中得到了应用。这里需要说明的是，“小”的整数对象，将全部直接放置于内存中。怎么样定义“小”呢？继续看`intobject.c`，我们可以看到：
```c
#ifndef NSMALLPOSINTS
#define NSMALLPOSINTS           257
#endif
#ifndef NSMALLNEGINTS
#define NSMALLNEGINTS           5
#endif
#if NSMALLNEGINTS + NSMALLPOSINTS > 0
/* References to small integers are saved in this array so that they
   can be shared.
   The integers that are saved are those in the range
   -NSMALLNEGINTS (inclusive) to NSMALLPOSINTS (not inclusive).
*/
static PyIntObject *small_ints[NSMALLNEGINTS + NSMALLPOSINTS];
```
值在这个范围内的整数对象将被直接换存在内存中，`small_ints`负责保存它们的指针。可以理解，这个数组越大，使用整数对象的性能（很可能）就越高。但是这里也是一个trade-off，毕竟系统内存大小有限，直接缓存的小整数数量太多也会影响整体效率。

与小整数相对的是“大”整数对象，也就是除开小整数对象之外的其他整数对象。既然不可能再缓存所有，或者说大部分常用范围的整数，那么一个妥协的办法就是提供一片空间让这些大整数对象按需依次使用。Python也正是这么做的。它维护了两个单向链表`block_list`和`free_list`。前者保存了许多被称为`PyIntBlock`的结构，用于存储被使用的大整数的`PyIntObject`；后者则用于维护前者所有block之中的空闲内存。

仍旧是在`intobject.c`之中，我们可以看到：
```c
struct _intblock {
    struct _intblock *next;
    PyIntObject objects[N_INTOBJECTS];
};

typedef struct _intblock PyIntBlock;
```
一个`PyIntBlock`保存`N_INTOBJECTS`个PyIntObject。

现在我们来思考一下一个Python整数对象在内存中的“一生”。

被创建出来之前，先检查其值的大小，如果在小整数的范围内，则直接使用小整数池，只用更新其对应整数对象的引用计数就可以了。如果是大整数，则需要先检查`free_list`看是否有空闲的空间，要是没有则申请新的内存空间，更新`block_list`和`free_list`，否则就使用`free_list`指向的下一个空闲内存位置并且更新`free_list`。

# “内存泄漏”？

So far so good. 上述的机制可以很好减轻fragmentation的问题，同时可以根据所跑的程序不同的特点来做fine tuning从而编译出自己认为合适的Python。但是我们只说了Python整数对象的“来”还没有提它的“去”。当一个整数对象的引用计数变成0以后，会发生什么事情呢？

小整数对象自是不必担心，始终都是在内存中的；大整数对象则需要调用析构操作，`int_dealloc` （`intobject.c`）:

```c
static void
int_dealloc(PyIntObject *v)
{
    if (PyInt_CheckExact(v)) {
        Py_TYPE(v) = (struct _typeobject *)free_list;
        free_list = v;
    }
    else
        Py_TYPE(v)->tp_free((PyObject *)v);
}
```

这个`PyInt_CheckExact`，来自于`intobject.h`：
```c
#define PyInt_CheckExact(op) ((op)->ob_type == &PyInt_Type)
```
它起到了类型检查的作用。所以如果这个指针`v`指向的不是Python原生整数对象，则`int_dealloc`直接调用该类型的`tp_free`操作；否则把不再需要的那块内存放入`free_list`之中。

这也就是说，当一个大整数`PyIntObject`的生命周期结束时，它之前的内存不会交换给系统堆，而是通过`free_list`继续被该Python进程占有。

倘若一个程序使用很多的大整数呢？倘若每个大整数只被使用一次呢？是不是很像内存泄漏？

我们来做个简单的计算，假如你的电脑是Macbook Air，8GB Memory，如果你的PyIntObject占用24个Byte，那么满打满算，能够存下大约357913941个整数对象。

下面做个实验。以下程序运行在Macbook Pro (mid 2015), 2.5Ghz i7, 16 GB Memory，Python 2.7.11的环境下：

```c
l = list()
num = 178956971

for i in range(0, num):
    l.append(i)
    if len(l) % 100000 == 0:
        l[:] = []
```
运行这个程序，会发现它占用了5.44GB的内存:
![5.44GB.png](http://upload-images.jianshu.io/upload_images/72299-7b1d9c08913a068c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果把整数个数减半，比如使用89478486，则会占用2.72GB内存（正好原来一半）：

![2.72GB.png](http://upload-images.jianshu.io/upload_images/72299-ed50ba706a63c253.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

一个`PyIntObject`占用多大内存呢？
![da.png](http://upload-images.jianshu.io/upload_images/72299-3c80a1fc6b8039bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

讲道理，24 bytes x 178956971 = 4294967304 bytes，约等于2^32，也就是4GB，那么为什么会占用5.44GB呢？

这并非程序其他部分的overhead，因为，就算你的程序只含有：
```c
for i in range(0, 178956971):
	pass
```
它仍旧会占用5.44GB内存。5.44 x 2^30 / 178956971大约等于32.64，也就是均摊下来一个整数对象占用了32.64个Byte.

这个问题可以作为一个简单的思考题，这里就不讨论了。

# 总结

Python的整数对象管理机制并不复杂，但也有趣，刚接触Python的时候是很好的学习材料。细纠下来会发现有很多工程上的考虑以及与之相关的现象，值得我们深入挖掘。
