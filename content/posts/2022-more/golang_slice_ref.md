---
title: Passing slices into functions
date: "2022-11-29T00:11:00.000Z"
template: post
draft: false
slug: "2022-11-passing-slices-into-functions" 
category: "tech"
tags:
  - "technical"
  - "tech"
  - "golang"
  - "go"
  - "productivity"
  - "coding"
  - "programming"
  - "pointer"
  - "reference"
description: "Should we pass a slice or a slice's reference into a function?"
---

```
Everything in Go is passed by value.
But what is the value, that is the question.
```

We are to examine what happens when we pass a slice or a slice's reference as a parameter into a function.

Some basic questions to explore:
- Will the original slice be modified?
- If so, in what cases?
- Why?
- What is a better practice?
- What about arrays and strings?


---

This code snippet will help shed some light on *passing by value* and a slice as a function parameter --> https://go.dev/play/p/I1g36xprhIr.


```
package main

import "fmt"

func main() {
	var t []int = make([]int, 5)
	t[0] = 1
	tstslice(t)
	tstptr(&t)
	tstappend(t)
	tstappend2(&t)
	tstmixed(t)
	t = append(t, 99)
	fmt.Println(t)
}

func tstslice(t []int) {
	t[1] = 2
}

func tstptr(t *[]int) {
	(*t)[2] = 3
}

func tstappend(t []int) {
	t = append(t, 55)
}

func tstappend2(t *[]int) {
	*t = append(*t, 56)
}

func tstmixed(t []int) {
	t[3] = 57
	t = append(t, 58)
}
```

What is the output here?

The answer is `[1 2 3 57 0 56 99]`.

Let us go through this example:

1. t[0]. Straightforward
2. t[1] is modified by `tstslice(t []int)`, as the slice is passed directly as a parameter.
3. t[2] is modified by `tstptr(t *[]int)`. Sure.
4. `t[3] = 57` worked. But why the other part of `tstmixed(t []int)` did not work? And why 56 is appended to the slice but 55 is not, i.e. why `tstappend2(t *[]int)` worked but not `tstappend(t []int)`

## How? Why?

To understand the fourth point, a couple of concepts need to be clarified.

- Everything in Go is passed by value.
- What is *passed by value* or *call by value* anyways? --> The value of each parameter is copied into local copies of the function stack. (so if the parameter is a *pointer*, then we get a local copy of the pointer in the function stack)
- A slice variable represents... actually a `SliceHeader`, or a representation of a segment of an array -- see https://pkg.go.dev/reflect#SliceHeader. This [stackoverflow post](https://stackoverflow.com/questions/39993688/are-slices-passed-by-value) will help too. Basically, if we know that the runtime representation for a slice is --
```
type SliceHeader struct {
	Data uintptr
	Len  int
	Cap  int
}
```

- It is not hard to understand that a slice variable's *value* does not contain the contents of the underlying array at all.
- How does `slice.append()` work? When the capacity (`Cap`) is reached, and when you `append()` on it -- a new array is created with a larger capacity underneath. See the example here: https://go.dev/play/p/q1AcfTcDJW7 for append(), length, capacity.
- Back to point 4, the latter part of `tstmixed(t []int)` does not work because the slice header is passed by value and the function tries to length the local copy of the header and add elements -- the local copy is assigned a new, longer array underneath, but the original slice is **not** changed at all. The same goes for `tstappend(t []int)`
- The reason why `tstappend2(t *[]int)` works is easy to understand -- the reference to the slice header itself is passed --> then whatever is done to the slice in the function, is actually done to the original slice.

## What can we conclude?

- Everything in Go is passed by value ("Call by value"), but some values are pointers (or struct of pointers)
- A function can modify a parameter slice's elements, but cannot append to/lengthen it.
- Passing the reference of a slice as a function parameter is preferred most of the time (whenever we want to refer to the original slice). This way the behavior is more consistent with most other common programming languages (Java, Javascript, Ruby etc.).

**Arrays**

How about passing arrays into functions as parameter? If this is done at all (always use slices instead of arrays, as arrays are too rigid) --> see example [here](https://go.dev/play/p/oplXz_h1JLf).

**Strings**

Btw, a string is actually an array -- just look at [this](https://pkg.go.dev/reflect#StringHeader) (The runtime representation of a string):

```
type StringHeader struct {
	Data uintptr
	Len  int
}
```
