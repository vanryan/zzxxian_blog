---
title: LLVM 3.9/4.0 安装笔记 (Debian / Ubuntu)
date: "2017-04-02T23:46:37.121Z"
template: post
draft: false
path: "/posts/llvm39-ubuntu/"
category: "compiler"
tags:
  - "technical"
  - "LLVM"
  - "debian"
  - "installation"
  - "compiler"
  - "ubuntu"
description: "How to install LLVM 3.9/4.0 on Debian / Ubuntu"
---

# 目录
+ 安装／升级cmake
+ 安装Ninja
+ 安装libffi和Python2.7.13
+ 安装Clang和LLVM (源码编译)
+ 安装plugin

# 安装／升级cmake
根据[LLVM官网](http://llvm.org/docs/GettingStarted.html)，编译LLVM和Clang需要CMake 3.4.3以上 (2017年2月):

> LLVM requires CMake 3.4.3 to build. It is generally recommended to use a recent CMake, especially if you’re generating Ninja build files. This is because the CMake project is constantly improving the quality of the generators, and the Ninja generator gets a lot of attention.

这段话告诉我们两件事情：一是用新版的cmake是一个比较稳妥的选择，二是用于编译LLVM的cmake的generator的选择上，可能Ninja是一个比较好的选择。

在Ubuntu 14.04.5上如果用`apt-get`来安装cmake的话，会得到一个版本为2.8的cmake，这不是我们想要的版本，所以这里使用源码安装。

cmake的版本可以使用`cmake --version`来检查。如果要卸载apt-get安装的cmake，我们可以`sudo apt-get remove cmake`。

*cmake.org/download/*提供了源码文件，也提供了一个安装脚本（*cmake-3.7.2-Linux-x86_64.sh*）。这里我直接使用这个脚本了。运行前，还是需要改一下权限 `chmod +x /path/to/cmake-3.7.2-Linux-x86_64.sh`。然后运行即可。进入了more以后直接按q可以结束阅读用户协议。

最后一步就是将生成的cmake的binary文件引入系统path里了。比如你的cmake-3.7.2-Linux-x86_64文件夹位于`/path/to/cmake-3.7.2-Linux-x86_64`，直接做一个link就可以了:`sudo ln -s /path/to/cmake-3.7.2-Linux-x86_64/bin/* /usr/local/bin`。 （这里你可能也要检查一下`/usr/localbin`在不在系统的`$PATH`环境变量里）

# 安装Ninja
Ninja是一个build工具，跟unix的make是统一范畴。参照[Ninja的文档](https://github.com/ninja-build/ninja/wiki/Pre-built-Ninja-packages)，在Debian/Ubuntu里执行

`apt-get install ninja-build`

就可以了。使用Ninja与否是Optional的，不过我个人觉得在安装LLVM时，Ninja的确是比Make要快一点的。

# 安装libffi和Python2.7.13
libffi和Python2.7.13在安装LLVM时也是可选的。libffi是什么呢？参看一下[它的介绍](http://www.linuxfromscratch.org/blfs/view/8.0/general/libffi.html):

> The libffi library provides a portable, high level programming interface to various calling conventions. This allows a programmer to call any function specified by a call interface description at run time.

安装了libffi，则可以在使用cmake时开启`DLLVM_ENABLE_FFI`选项了，也就是`-DLLVM_ENABLE_FFI=ON`。

从[ftp://sourceware.org/pub/libffi/libffi-3.2.1.tar.gz](ftp://sourceware.org/pub/libffi/libffi-3.2.1.tar.gz)下载libffi的源码，然后执行
```
sed -e '/^includesdir/ s/$(libdir).*$/$(includedir)/' \
    -i include/Makefile.in &&

sed -e '/^includedir/ s/=.*$/=@includedir@/' \
    -e 's/^Cflags: -I${includedir}/Cflags:/' \
    -i libffi.pc.in        &&

./configure --prefix=/usr --disable-static &&
make
```

最后`sudo su`以后`make install`安装好就可以了。

至于Python2.7.13, 安装便十分直白，先下载源码

```wget https://www.python.org/ftp/python/2.7.13/Python-2.7.13.tgz```

然后解压，编译和安装即可


```
tar xzf Python-2.7.13.tgz
cd Python-2.7.13
sudo ./configure
sudo make install
```

# 安装Clang和LLVM (源码编译)
LLVM和Clang等的源码可以从[releases.llvm.org](http://releases.llvm.org/)获得。如果要获得最新的代码，则需要使用svn来下载。

如果使用svn，则参照[LLVM官网](http://llvm.org/docs/GettingStarted.html)操作即可，假设你打算安装LLVM在`/path/to/llvm-src`

LLVM:

    cd /path/to/llvm-src
    svn co http://llvm.org/svn/llvm-project/llvm/trunk llvm

Clang:

    cd /path/to/llvm-src
    cd llvm/tools
    svn co http://llvm.org/svn/llvm-project/cfe/trunk clang

LLD linker [可选]:

    cd /path/to/llvm-src
    cd llvm/tools
    svn co http://llvm.org/svn/llvm-project/lld/trunk lld

Compiler-RT (required to build the sanitizers) [可选]:

    cd /path/to/llvm-src
    cd llvm/projects
    svn co http://llvm.org/svn/llvm-project/compiler-rt/trunk compiler-rt

如果我们下载源码（例如最新版已经是4.0.0，而我们仍想安装3.9.1），则可以直接下载:
+ *http://llvm.org/releases/3.9.1/llvm-3.9.1.src.tar.xz* LLVM
+ *http://llvm.org/releases/3.9.1/cfe-3.9.1.src.tar.xz* Clang
+ *http://llvm.org/releases/3.9.1/compiler-rt-3.9.1.src.tar.xz* Compiler RT

假设llvm解压出的文件夹叫做`llvm-3.9.1.src`，则:

    cd /path/to/llvm-3.9.1.src

    tar -xf ../cfe-3.9.1.src.tar.xz -C tools &&
    tar -xf ../compiler-rt-3.9.1.src.tar.xz -C projects &&

    mv tools/cfe-3.9.1.src tools/clang &&
    mv projects/compiler-rt-3.9.1.src projects/compiler-rt

LLVM3.7.0以后就不再允许源码内编译了(build inside source-tree)，所以我们需要在`llvm-3.9.1.src`外面另外建一个文件夹，比如叫做`llvm-build`：

    mkdir llvm-build
    cd llvm-build

接下来则要使用cmake来进行编译，如果安装了Ninja，llvm源码文件夹是`llvm-3.9.1.src`。一个实例是：
```
cmake -G Ninja  \
  -DCMAKE_INSTALL_PREFIX=/usr  \
  -DCMAKE_BUILD_TYPE=Release \
  -DLLVM_ENABLE_FFI=ON \
  -DLLVM_BUILD_LLVM_DYLIB=ON \
  -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
  -DLLVM_TARGETS_TO_BUILD="host"
  -Wno-dev
  ../llvm-3.9.1.src
  ```
这里要注意一下一些主要的参数，-G是选择generator，如果安装了Ninja则会生成Ninja的build文件。-DCMAKE_INSTALL_PREFIX是表明了最后要安装到了目录，-DCMAKE_BUILD_TYPE则是表明build类型，如果选择Debug则会安装很多不需要的文件，-DLLVM_ENABLE_FFI则是开启FFI，-DLLVM_TARGETS_TO_BUILD是指明build的target，如果只选host，则只build针对当前平台的内容，免去了不少多余文件。最后一行的`../llvm-3.9.1.src`则是告诉cmake源码文件的位置。

在这之后，直接进行`ninja`的操作即可。Ninja的使用方式类似于make，比如开4核使用`ninja -j4`，清除build的文件则`ninja clean`。

如果不使用Ninja，还是使用make来build，则cmake选择`cmake -G "Unix Makefiles"`即可。

在虚拟机中编译LLVM 3.9.1，需要开足够的内存（比如我个人建议6个G）和足够的硬盘（用动态分配吧）。如果用了`ninja -j2`以上，有可能会在编译一些文件时崩掉，这时候只是使用`ninja`即可。（make也是一样）

最后运行`ninja install`或者`make install`即完成安装。之后可以用`clang --version`和`llc --version`检查安装成功的版本。llc是LLVM static compiler，当然我们也可以通过其它的LLVM组件来检查，比如用dissembler: `llvm-dis --version`。


# 安装plugin
这里我以[LLVM Gold Plugin](http://llvm.org/docs/GoldPlugin.html)为例。因为我这次安装LLVM的最终目的，是需要运行和编辑这个instrumentation工具[Contech](https://github.com/bprail/contech)，它是需要Gold Plugin的。

它的安装本身，只需要执行以下操作即可:

```
git clone --depth 1 git://sourceware.org/git/binutils-gdb.git binutils
mkdir build # 源码树外build
cd build
../binutils/configure --enable-gold --enable-plugins --disable-werror
make all-gold
```

接下来build LLVM，我使用的cmake指令：

```
CC=gcc CXX=g++                              \
cmake -G Ninja \
      -DCMAKE_INSTALL_PREFIX=/usr           \
      -DLLVM_ENABLE_FFI=ON                  \
      -DCMAKE_BUILD_TYPE=RelWithDebInfo -DLLVM_ENABLE_CXX1Y=ON          \
      -DLLVM_BUILD_LLVM_DYLIB=ON            \
      -DLLVM_TARGETS_TO_BUILD="host" \
      -DLLVM_BINUTILS_INCDIR=/path/to/gold/binutils/include \
      -Wno-dev --enable-optimized --enable-targets=host-only \
      ../llvm-3.9.1.src
```
这里要注意的是` -DLLVM_BINUTILS_INCDIR=/path/to/gold/binutils/include`，这里是指明了binutils (gold plugin)提供的include文件的位置。

