---
title: Maintaining My Blog (with Gatsby at the moment)
date: "2022-11-12T23:49:22.330Z"
template: post
draft: false
slug: "maintaining-my-blog" 
category: "frontend"
tags:
  - "frontend"
  - "Gatsby"
  - "blog"
---

Maintaining a blog is both easy and tricky. It is easy because there are so many tools today, from the most foolproof tools to more advanced solutions which gives you significant freedom. But it can be tricky because once you stop posting for a (long) while, the advanced solutions, along with its updates, partial updates and stopped maintenance of some dependencies, can cause real troubles you might or might not be able to get through.

My current solution is the follwoing:
1. [Gatsby](https://www.gatsbyjs.com/): the website building framework, ever-evolving
2. [Lumen](https://github.com/alxshelepenok/gatsby-starter-lumen): the gatsby starter kit (predefined settings) for static pages, well-maintained
3. [Netlify](https://app.netlify.com): site building and hosting service, stable and fast

Which involves concepts like:
1. [React](https://reactjs.org/)
2. GraphQL: Gatsby provides a tool to check site data through ta GraphQL interface
3. Markdown: **Sticking to Markdown for contents for portability. This is essential!**
4. npm: JavaScript package manager

Formerly I have written this article regarding using Gatsby to create and maintain blogs - [How to build a blog with Gatsby](https://zzxxian.netlify.app/posts/2018-09-18-gatsby-blog/gatsby-blog). Most of the stuff there still applies even now. However, all the concepts and tools mentioned are evolving, and dependencies change. I stopped writing for a couple of years and resuming the old git repo of my site with the same toolset of newer versions turned out to be rather painful. I feel thankful that Gatsby and Lumen are both well-maintained, so at least I get to carry over my existing contents successfully.

This is to note down some procedures I've taken when I get back to resume this site:
1. Update npm itself
2. Install/Update gatsby-cli and its dependencies (`npm i -g gatsby-cli`), which globally installs and updates the dependencies; `npm outdated` can help list all the deps and check outdated ones, then `npm update` can be used there to update them along with the package.json (updates all the dependencies in a project)
3. Install/Update lumen and its dependencies: `npm i -g gatsby-starter-lumen`
4. Also do `npm i -g react-disqus-comments `
5. Building the site: `gatsby build`
6. Deploy locally: `gatsby develop`
7. Run and fix local tests `npm test -- -u`

What is the process to post new blog posts? ==> In `content/posts`, create a folder and an `index.md` with all the metadata (title, tags, category, etc.) Then use `gatsby develop` to deploy and test locally. Then push it to the repo, after which one watches the build on netlify if the update is not deployed through the site url after a couple of minutes.

What is the process to create dedicated pages instead of blog posts? ==> Start with `content/pages`. For e.g., check out `content/pages/tools/index.md`, which contains link to other places like `public/tools/<some-dir>/index.html`, where I create a self-contained page. The tricky part is the path - how to reference resources in `./public` from `./content`.

In the end, the key assets are the posts and tools/pages on the site, as long as they are maintained in a way that can be easily ported to other places or frameworks, the site is "secure".

Other notes:
1. For tags, uppercase and lowercase letters are treated differently, thus the rule for me is to use all lowercase by default, but for special names I use uppercase or capitalized (essentially respecting the original names) -- "finance", "GraphQL", "technical". Only those rare cases though.
2. For tags, I use dash `-` to concatenate words if absolutely necessary. No camelCase.
3. For static assets like images, gatsby supports a couple of ways to include them (https://www.gatsbyjs.com/docs/how-to/images-and-media/). Generally one can just use relative path to do the trick – put xx.image in the same folder as index.md, and in index.md, do `./xx.image` to refer to it, and when the pages are generated, the image will be copied to the public folder's static folders and the html page will have a reasonable path.
4. How to link to other pages? One way would of course be use public links, that could be a little bit hard to maintain from the developer's side though. Another way will be through the `slug` field in each post .md. Notice the how the URL to each post is made up of. Essentially the yaml metadata's `slug` field denotes the final part of its eventual URL. And simply use that and relative path will do the trick. Same goes across directories.
5. How to modify the index page?
    - `content/config.json` does some major configurations, including the sidebar links in the index - see this earlier [commit](https://github.com/vanryan/zzxxian_blog/commit/da6a8c6fd8b094dfc33ae3c93f91241237f4b767). 
    - now that we added a link in the index like `pages/tools`, how do we add content to the *tools* page (Suppose we add a link to a valid page) → the corresponding page content is added in the `content` folder: `content/pages/tools/index.md`, which is similar to posts in the `content` folder.
    - Say we use the `tools` page as a root for all pages that serve as tools. For example there is a link in the `tools` page called `test_tool`, we might want it to go with a link `tools/test_tool`.. how to do that? Just write this page in `src/pages/tools/`. For example, `src/pages/tools/test_tool.js`, in which file add `export default IndexPage` if the React element created for the page is called `IndexPage`.
    - Let us review: to add a `test_tool` for `tools` in the index page, modify/add: {`content/config.json`, `pages/tools`, `src/pages/tools/test_tool.js`}
    - A little alternative, say you want the page to be rendered by gatsby, what can be done is to use a link `pages/tools/test_tool`, which requires a file `content/pages/tools/test_tool.md` with a **slug** of `golang` ==> modify/add: {`content/config.json`, `pages/tools/test_tool`, `content/pages/tools/test_tool.md`}. The link on `pages/tools` to this page will be simply `golang`.