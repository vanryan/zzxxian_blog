---
title: How to build a blog with Gatsby / 如何使用Gatsby建立博客
date: "2018-09-18T22:38:22.330Z"
template: post
draft: false
slug: "gatsby-blog" 
category: "frontend"
tags:
  - "technical"
  - "Blog"
  - "React"
  - "Gatsby"
  - "Frontend"
  - "GraphQL"
description: "Your new blog site will be powered by React and GraphQL"
---

Nowadays we all gotta get on board and use [React](https://reactjs.org/) and [GraphQL](https://graphql.org/), like this [friend of mine](https://36kr.com/p/5148992.html) in his company.

The idea of a flexible and customizable alternative to REST does sound like something brilliant if you ask me.

But I always have a problem with the "new technologies" around the Front End (if any of us is still using this term). I am not saying I do not like them. c'mon, I came from jQuery, why would I not like the dazzling frameworks like React or Vue? It is just that there are so much innovation in this field and I find it hard to keep up with the steps of others since I do not work on these stuff myself that often, and last time I checked, Bootsrap and Angular are trending. A 5 min read is not enough to understand how React works, and that is my whole point. A couple years apart, you are going to have to remold your eyes to see the front end world even if you are only trying to build an up to date blog.

Anyways, React and GraphQL look kind of cool so I took the time to read a bit by giving up kayaking in Lake Tahoe. It did make me feel I'm behind the steering wheel when learning to use Gatsby.

# Gatsby

1. Install Gatsby
```
npm install gatsby-cli --save
```
2. Use a "starter" to start your Gatsby project unless you want to write even the `package.json` yourself.

For example, if you use the default starter -- [gatsby-starter-default](https://github.com/gatsbyjs/gatsby-starter-default), you get a directory structure like this:

```
├── node_modules
├── src
├── .gitignore
├── .prettierrc
├── gatsby-browser.js
├── gatsby-config.js
├── gatsby-node.js
├── gatsby-ssr.js
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
└── yarn.lock
```

There are a few things we should pay attention to here:

- `gatsby-browser.js`: where you implement [Gatsby browser APIs](https://next.gatsbyjs.org/docs/browser-apis). Use it sometimes for debugging and analytics, etc.
- `gatsby-config.js` is the major configuration file where you configure all the constants (your site metadata like author, site url, etc.) as well as the plugins you use
- `gatsby-node.js`
  - when building the project, we use (Node APIs to ) the plugins to control our blog site. Essentially we are implementing some APIs in this file
  - for example `createPages` is for the plugins to add pages to our site. ["This extension point is called only after the initial sourcing and transformation of nodes plus creation of the GraphQL schema are complete so you can query your data in order to create pages."](https://next.gatsbyjs.org/docs/node-apis/#createPages) Which means you kind of direct how to process your markdown files (your blog posts articles) to GraphQL
- `gatsby-ssr.js`: implementing Gatsby Server Rendering APIs. It can be useful as it gives you more freedom to modify your site during server rendering. Like  `onPreRenderHTML` allows you to check/change head/body/post-body components, etc.
- `package.json`: people with Node.js programming experiences will know about this file, which essentially defines your gatsby site as a node project -- mainly configures the dependencies. The `package-lock.json` above is just a verbose version of this.
- `yarn.lock`: if you use yarn as the package manager instead of `npm`, you need to care about this file. Ignore it otherwise.

Besides the default, there are a [whole lot of other starters](https://www.gatsbyjs.org/docs/gatsby-starters/) you can choose from. Most of which goes under MIT license so we are good using them if all we what is a configurable and good-looking blog site.

3. Build it.
```
gatsby develop
```
builds and hosts the site locally. Ideal for testing as it dynamically loads your changes without stopping the server and rebuild.

```
gatsby build
```
does a full production build. You get properly generated static HTMLs and JS bundles. You can test this production package by
```
gatsby serve
```

## Markdown
Back in the days when we built blogs using Jekyll or Hexo we have the practice of producing posts from the markdown files in a separate directory. Gatsby keeps the tradition.

In order to transform markdown to HTML, we will need to use the help of GraphQL and this [Transformer plugin](https://www.gatsbyjs.org/tutorial/part-six/).

Let us add this plugin to your project by injecting it into your `package.json`:

```
npm install --save gatsby-transformer-remark
```

Check your `gatsby-config.js` file, be sure you add this plugin:
```
module.exports = {
  siteMetadata: {
    title: `Pandas Eating Lots`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    `gatsby-transformer-remark`,
    `gatsby-plugin-emotion`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
```
Then GraphQL is granted with the data of `allMarkdownRemark` from which you can access your markdown files. Like:

```
export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(
        limit: 1000,
        filter: { frontmatter: { layout: { eq: "post" }, draft: { ne: true } } },
        sort: { order: DESC, fields: [frontmatter___date] }
      ){
      edges {
        node {
          fields {
            slug
            categorySlug
          }
          frontmatter {
            title
            date
          }
        }
      }
    }
  }
`;
```


## Code highlighting

Now that we have the transformer plugin, we then use [PrismJs](https://prismjs.com/) to enable code highlighting:
```
  {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              classPrefix: "language-",
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
            }
          },
        ]
      }
    }
```

There are different ways to mark up the code but in markdown files, the easiest way would be using something like this:
```
  ```python
```
Instead of just ``` in front of your code snippet.

There is [a good note](https://using-remark.gatsbyjs.org/code-and-syntax-highlighting/) where you can read more about this.

# A word on hosting -- Netlify

Well, I know there has been some debates going on over which hosting service works better or smoother than the other ones and stuff like that. You might think about Firebase, Heroku, and even Github Pages. Netlify is used here because they have good marketing. Well, the truth is, I chose it cuz it has got the catchiest name among them all and I do not have any interest in wasting my time on understanding how these services are different from each other. Seriously.

It is unbelievably easy to deploy a Gatsby project on Netlify. You hit this, that and that, and you are done.

No, I am serious. If you get on Netlify, you hit this:

![New site](https://upload-images.jianshu.io/upload_images/72299-0107626c1e5053ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

that:
![that](https://upload-images.jianshu.io/upload_images/72299-41f5b7fba35987b4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

(authorize its access to Github) and that:

![that](https://upload-images.jianshu.io/upload_images/72299-5cca91da0c091d78.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

and you are done.

Like it or not, it just works [this way](https://www.netlify.com/blog/2016/02/24/a-step-by-step-guide-gatsby-on-netlify/).

The thing is, we might or might not want to configure our [deploy context](https://www.netlify.com/docs/continuous-deployment/#deploy-contexts). Basically you will want to configure a `netlify.toml` file which kind of looks like this:

```
[Settings]
ID = "Your_Site_ID"

# Settings in the [build] context are global and are applied to all contexts unless otherwise overridden by more specific contexts.

[build]
  # This is the directory to change to before starting a build.
  base  = "project/"
  # NOTE: This is where we will look for package.json/.nvmrc/etc, not root.
  # This is the directory that you are publishing from (relative to root of your repo)
  publish = "project/build-output/"
  # This will be your default build command
  command = "echo 'default context'"
  # This is where we will look for your lambda functions
  functions = "project/functions/"

# Production context: All deploys from the Production branch set in your site's deploy settings will inherit these settings.
[context.production]
  publish = "output/"
  command = "make publish"
  environment = { ACCESS_TOKEN = "super secret", NODE_ENV = "8.0.1" }
```

In which you get to play with a lot of configs like build and output directories, commands for deployment, redirects and even headers.

Also, sometimes you would want to specify the node version you are using especially if you are trying to be weird and use some old version just because you like that number, and you should configure this info on the Netlify backend:
![Env Vars](https://upload-images.jianshu.io/upload_images/72299-59edf43f2df29e7d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

or through a `.nvmrc` file: [#set-node-ruby-or-python-version](https://www.netlify.com/docs/continuous-deployment/#set-node-ruby-or-python-version)

One thing that makes Netlify think highly of itself is that it uses HTTPS. But from time to time, you will see the Mixed Content issue coming up. Meaning, HTTP contents are being referenced or showing up in your site and both HTTP and HTTPS are being used when loading the same page. There is an article [here](https://developers.google.com/web/fundamentals/security/prevent-mixed-content/fixing-mixed-content) to help clarify the idea and Mozilla helped [categorize the issues](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content).

Like what you do with Github Pages and most other hosting services, whenever you push your new posts to your Github repositoy for this Gatsby project, the blog deployed gets automatically updated. Along with the other stuff I mentioned above, basically you have minimum transitional cognitive cost when switching from other blog generators as well as hosting services.

---

>I looked up through the smoke of my cigarette and my eye lodged for a moment upon the burning coals, and that old fancy of the crimson flag flapping from the castle tower came into my mind, and I thought of the cavalcade of red knights riding up the side of the black rock. Rather to my relief the sight of the mark interrupted the fancy, for it is an old fancy, an automatic fancy, made as a child perhaps. The mark was a small round mark, black upon the white wall, about six or seven inches above the mantelpiece. <br/>
> --"The Mark on the Wall" by Virginia Woolf (1882-1941)
