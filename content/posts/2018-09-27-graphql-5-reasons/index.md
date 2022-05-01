---
title: 5个用/不用GraphQL的理由 -- 5 reasons (not) to use GraphQL
date: "2018-09-27T22:37:43.330Z"
template: post
draft: false
slug: "graphql-5-reasons"
category: "DATASTORE"
collection: "technical"
tags:
    - "technical"
    - "Frontend"
    - "GraphQL"
    - "React"
    - "Datastore"
    - "Performance"
    - "Engineering"
description: "GraphQL能大大提升开发效率，但是也可能让你的数据库万劫不复。"
---

我在[如何使用Gatsby建立博客 / How to build a blog with Gatsby](https://www.jianshu.com/p/4f33f36bb034)这篇文章中提过GraphQL在Gatsby中的应用。总的来讲，它是一个新潮的技术，在适宜的使用场景威力无穷。这里我们来讨论一下用/不用GraphQL的理由吧。

# 简单介绍GraphQL
![GrahQL](https://upload-images.jianshu.io/upload_images/72299-4def6d1f462acb16.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

GraphQL是Facebook2015年开源的数据查询规范。现今的绝大多数Web Service都是RESTful的，也就是说，client和server的主要沟通模式还是靠client根据自己的需要向server的若干个endpoint (url)发起请求。由于功能的日渐丰富，对Web Application的要求变得复杂，REST的一些问题逐渐暴露，人们开始思考如何应对这些问题。GraphQL便是具有代表性的一种。GraphQL这个名字，Graph + Query Language，就表明了它的设计初衷是想要用类似图的方式表示数据：即不像在REST中，数据被各个API endpoint所分割，而是有关联和层次结构的被组织在一起。

比方说，假设这么一个提供user信息的REST API: `<server>/users/<id>`，和提供用户的关注者的API：`<server>/users/<id>/followers`，以及该用户关注对象的API: `<server>/users/<id>/followed-users`。传统的REST会需要3次API call才能请求出这三份信息（假设`<server>/users/<id>` 没有包含followers and followed-users信息，which will be a definite redundancy if it does）:
1 GET `<server>/users/<id>`
```
{
 "user": {
    "id" : "u3k2k3k178",
    "name" : "graph_ql_activist",
    "email" : "graph_ql@activist.com",
    "avatar" : "img-url"
  }
}
```

2 GET `<server>/users/<id>/followed-users`
3 GET `<server>/users/<id>/followers`

然而如果使用GraphQL，一次API请求即可获取所有信息并且只选取需要的信息（比如关于用户只需要name不要email, followers只要最前面的5个name，followed-users只要头像等等）:
```
query {
  user (id : "u3k2k3k178") {
    name
    followers (first: 5) {
      name
    }
    followed-users {
      avatar
    }
  }
}
```
我们会得到一个完全按照query定制的，不多不少的返回结果（一般是一个json对象）。

# 5个使用GraphQL的理由
使用GraphQL的理由， 必然是从讨论RESTful Service的局限性和问题开始。

1. 数据冗余和请求冗余 (overfetching & underfetching)
2. 灵活而强类型的schema
3. 接口校验 (validation)
4. 接口变动，维护与文档
5. 开发效率

##1 数据冗余和请求冗余 (overfetching & underfetching)
根据users API的例子，我们可以想见，GET用户信息的REST call，我们就算只是想要一个用户的一两条信息(比如name & avatar)，通过该API，我们也会得到他的整个信息。所谓的*overfetching*就是指的这种情况——请求包含当前不需要的信息。这种浪费会一定程度地整体影响performance，毕竟更多的信息会占用带宽和占用资源来处理。

同样从上面的例子我们可以看出来，在许多情况下，如果我们使用RESTful Application，我们常常会需要为联系紧密并总量不大的信息，对server进行多次请求，call复数个API。

举一个例子，获取ID为"abc1"和"abc2"的两个用户的信息，我们可能都需要两个API call，一百个用户就是一百个GET call，这是不是很莫名其妙呢？这种情况其实就是`underfetching`——API的response没有合理的包含足够信息。

然而在GraphQL，我们只需要非常简单地改变schema的处理方式，就可以用一个GET call解决：
```
query {
  user (ids : ["ab1", "abc2", ...])
}
```

我们新打开一个网页，如果是RESTful Application，可能请求数据就会马上有成百上千的HTTP Request，然而GraphQL的Application则可能只需要一两个，这相当于把复杂性和heavy lifting交给了server端和cache层，而不是资源有限，并且speed-sensitive的client端。

##2 灵活而强类型的schema
GraphQL是强类型的。也就是说，我们在定义schema时，类似于使用SQL，是显式地为每一个域定义类型的，比如说：
```
type User {
  id: ID!
  name: String!
  joinedAt: DateTime!
  profileViews: Int! @default(value: 0)
}

type Query {
  user(id: ID!): User
}
```
GraphQL的schema的写作语言，其实还有一个专门的名称——[Schema Definition Language](https://blog.graph.cool/graphql-sdl-schema-definition-language-6755bcb9ce51) (SDL)。

这件事情的一大好处是，在编译或者说build这个Application时，我们就可以检查并应对很多mis-typed的问题，而不需要等到runtime。同时，这样的写作方式，也为开发者提供了巨大的便利。比如说使用YAML来定义API时，编写本身就是十分麻烦的——可能没有理想的auto-complete，语法或者语义有错无法及时发现，文档也需要自己小心翼翼地编写。就算有许多工具(比如[Swagger](https://swagger.io/))帮助，这仍然是一个很令人头疼的问题。

##3 接口校验 (validation)
显而易见，由于强类型的使用，我们对收到的数据进行检验的操作变得更为容易和严格，自动化的简便度和有效性也大大提高。对query本身的结构的校验也相当于是在schema完成后就自动得到了，所以我们甚至不需要再引入任何别的工具或者依赖，就可以很方便地解决所有的validation。

##4 接口变动，维护与文档
RESTful Application里面，一旦要改动API，不管是增删值域，改变值域范围，还是增减API数量，改变API url，都很容易变成伤筋动骨的行为。

如果说改动API url(比如/posts --> /articles)，我们思考一下那些地方可能要改动呢？首先client端的代码定然要改变request的API endpoint；中间的caching service可能也需要改要访问的endpoint；如果有load balancer, reverse proxy，那也可能需要变动；server端自己当然也是需要做相应改变的，这根据application自己的编写情况而定。

相比之下，GraphQL就轻松多了。GraphQL的Service，API endpoint很可能就只有一个，根本不太会有改动URL path的情况。至始至终，数据的请求方都只需要说明自己需要什么内容，而不需要关心后端的任何表述和实现。数据提供方，比如server，只要提供的数据是请求方的母集，不论它们各自怎么变，都不需要因为对方牵一发而动全身。

在现有工具下，REST API的文档没有到过分难以编写和维护的程度，不过跟可以完全auto-generate并且可读性可以很好地保障的GraphQL比起来，还是略显逊色——毕竟GraphQL甚至不需要我们费力地引入多少其他的工具。

再一点，我们都知道REST API有一个versioning: V1, V2, etc.这件事非常的鸡肋而且非常麻烦，有时候还要考虑backward compatibility。GraphQL从本质上不存在这一点，大大减少了冗余。增加数据的fields和types甚至不需要数据请求方做任何改动，只需要按需添加相应queries即可。

另外，有了GraphQL的queries，我们可以非常精准地进行数据分析(Analytics)。比如说具体哪些queries下的fields / objects在哪些情况下是被请求的最多/最频繁的——而不像RESTful Application中，如果不进行复杂的Analytics，我们只能知道每个API被请求的情况，而不是具体到它们内含的数据。

##5 开发效率
相信上面说的这些点已经充分能够说明GraphQL对于开发效率能够得到怎样的提升了。

再补充几点。

GraphQL有一个非常好的ecosystem。由于它方便开发者上手和使用-->大家争相为它提供各种工具和支持-->GraphQL变得更好用-->社区文化和支持更盛-->... 如同其他好的开源项目一样，GraphQL有着一个非常好的循环正向反馈。

对于一套REST API，哪怕只是其使用者(consumer)，新接触的开发者需要一定时间去熟悉它的大致逻辑，要求乃至实现。然而GraphQL使用者甚至不需要去看类似API文档的东西，因为我们可以直接通过query查询query里面所有层级的type的所有域和它们各自的type，这不得不说很方便：

```
{
  __schema {
    types {
      name
    }
  }
}
```
==> 我们可以看到query所涉及的所有内容的类型：
```
{
  "data": {
    "__schema": {
      "types": [
        {
          "name": "Query"
        },
        {
          "name": "Episode"
        },
        {
          "name": "Character"
        },
        {
          "name": "ID"
        },
        {
          "name": "String"
        },
        {
          "name": "Int"
        },
        {
          "name": "FriendsConnection"
        },
        {
          "name": "FriendsEdge"
        },
        {
          "name": "PageInfo"
        }
        {
          "name": "__Schema"
        },
        {
          "name": "__Type"
        },
        {
          "name": "__TypeKind"
        },
        {
          "name": "__Field"
        },
        {
          "name": "__InputValue"
        },
        {
          "name": "__EnumValue"
        }
        }
      ]
    }
  }
}
```

对于GraphQL，我还有个非常个人的理由偏爱它：对于API的测试，相比于比较传统的Postman或者自己写脚本进行最基本的http call（或者curl），我更喜欢使用[insomnia](https://insomnia.rest/)这个更为优雅的工具。而在此之上，它还非常好地[支持了GraphQL](https://insomnia.rest/blog/introducing-graphql/)，这让我的开发和测试体验变得更好了。（Postman至今还不支持GraphQL，虽然本质上我们可以用它make GraphQL query call）

# 5个不用GraphQL的理由
1. 迁移成本
2. 牺牲Performance
3. 缺乏动态类型
4. 简单问题复杂化
5. 缓存能解决很多问题

##1 使用与迁移成本
现有的RESTful Application如果要改造成GraphQL Application？

hmmm...

我们需要三思。首先我就不说RESTful本来从end to end都有成熟高效解决方案这样的废话了。迁移的主要问题在于，它从根本上改变了我们组织并暴露数据的方式，也就是说对于application本身，从数据层到业务逻辑层，可能有极其巨大的影响。所以它非常不适合现有的复杂系统“先破后立”。一个跑着SpringMVC的庞大Web Application如果要改成时髦的GraphQL应用？这个成本和破坏性难以预计。

并且，尽管我们说GraphQL有着很好的社区支持，但本质上使用GraphQL，就等于要使用React与NodeJS。所以如果并不是正在使用或者计划使用React和Node，GraphQL是不适合的。

##2 牺牲Performance
Performance这件事是无数人所抱怨的。如同我们前面所说的，GraphQL的解决方案，相当于把复杂性和heavy lifting从用户的眼前，移到了后端——很多时候，就是数据库。

要讨论这一点，我们首先要提的是，为了支持GraphQL queries对于数据的查询，开发者需要编写resolvers。

比如说这样一个schema:

```
type Query {
  human(id: ID!): Human
}

type Human {
  name: String
  appearsIn: [Episode]
  starships: [Starship]
}

enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}

type Starship {
  name: String
}
```

对于human，我们就需要一个最基础的resolver:
```
Query: {
  human(obj, args, context, info) {
    return context.db.loadHumanByID(args.id).then(
      userData => new Human(userData)
    )
  }
}
```
当然这还没完，对不同的请求类型，我们要写不同的resolver——不仅原来REST API的CRUD我们都要照顾到，可能还要根据业务需求写更多的resolver。

这件事情造成的影响，除了开发者要写大量boilerplate code以外，还可能导致查询性能低下。一个RESTful Application，由于每个API的确定性，我们可以针对每一个API的逻辑，非常好的优化它们的性能，所以就算存在一定程度的overfetching/underfetching，前后端的性能都可以保持在能够接受的范围内。然而想要更普适性一些的GraphQL，则可能会因为一个层级结构复杂而且许多域都有很大数据量的query跑许多个resolvers，使得数据库的查询性能成为了瓶颈。

##3 缺乏动态类型
强类型的schema固然很省力，但是如果我们有时候想要一些自由(flexibility)呢？

比方说，有时候请求数据时，请求方并不打算定义好需要的所有层级结构和类型与域。比方说，我们想要单纯地打印一些数据，或者获取一个user的一部分fields直接使用，剩下部分保存起来之后可能使用可能不使用，但并不确定也不关心剩下的部分具体有那些fields——多余的部分可能作为additional info，有些域如果有则使用，没有则跳过。

这只是一个例子，但是并不是一个钻牛角尖的例子——因为有时候我们所要的objects的properties本来就可能是dynamic的，我们甚至可能会通过它的properties/fields来判定它是一个怎样的object。

我们要怎么处理这种问题呢？一种有些荒诞现实主义的做法是，往Type里加一个JSON string field，用来提供其相关的所有信息，这样就可以应对这种情况了。但是这是不是一个合理的做法呢？

##4 简单问题复杂化
最显著的例子，就是error handling。REST API的情况下，我们不需要解析Response的内容，只需要看HTTP status code和message，就能知道请求是否成功，大概问题是什么，处理错误的程序也十分容易编写。

然而GraphQL的情景下，hmmm...

只要Service本身还在正常运行，我们就会得到200的HTTP status，然后需要专门检查response的内容才知道是否有error：
```
 {
      "errors": [
        {
          "message": "Field \"name\" must not have a selection since type \"String\" has no subfields.",
          "locations": [
            {
              "line": 31,
              "column": 101
            }
          ]
        }
      ]
    }
```

Another layer of complexity.

同时，简单的Application，使用GraphQL其实是非常麻烦的——比如前面提到的resolvers，需要大量的boilerplate code。另外，还有各种各样的Types, Queries, Mutators, High-order components需要写。相比之下，反倒是REST API更好编写和维护。

##5 缓存能解决很多问题
编写过HTTP相关程序之后应该都知道，HTTP本身就是[涵盖caching的](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)，更不要提人们为了提高RESTful Application的performance而针对[缓存](http://www.kennethlange.com/posts/Boost-Your-REST-API-with-HTTP-Caching.html)作出的种种努力。

对于overfetching和请求次数冗余的问题，假设我们的整个application做了足够合理的设计，并且由于REST API的固定和单纯性，缓存已经能非常好地减少大量的traffic。

然而如果选择使用GraphQL，我们就没有了那么直白的caching解决方案。首先，只有一个API endpoint的情况下，每个query都可能不同，我们不可能非常轻松地对request分门别类做caching。当然并不是说真的没有现成的工具，比如说Appollo client就提供了[InMemoryCache](https://www.apollographql.com/docs/react/advanced/caching.html)并且，不论有多少queries，总是有hot queries和cold ones，那么pattern总是有的。针对一些特定的query我们还可以定向地缓存，比如说[PersistGraphQL](https://github.com/apollographql/persistgraphql)便是这样一个工具。然而这样做其实又是相当于从queries中提炼出类似于原来的REST API的部分了，并且又增加了一层complexity，不管是对于开发还是对于performance，这都可能有不容忽视的影响。

# 总结
GraphQL最大的优势，就是它能够大大提高开发者的效率，而且最大化地简化了前端的数据层的复杂性，并且使得前后端对数据的组织观点一致。只是使用时，需要考察scale, performance, tech stack, migration等等方面的要求，做合理的trade-off，否则它可能不仅没能提高开发者效率，反倒制造出更多的问题。

# References
- [Execution](https://graphql.org/learn/execution/)
- [Mutations](https://graphql.org/learn/queries/#mutations)
- [Introduction to GraphQL](https://graphql.org/learn/)
- [graphql/releases/tag/June2018](https://github.com/facebook/graphql/releases/tag/June2018)
- [Mocking your server is easy with GraphQL](https://graphql.org/blog/mocking-with-graphql/)

