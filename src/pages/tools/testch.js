import React, { useState, useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"
import {Helmet} from "react-helmet";

const IndexPage = () => {
  let title = <h2>AI 和 Web3 营销将如何争夺广告收入？</h2>;

  let p1 = <div><p>人工智能，尤其是生成式人工智能，是营销人员疯狂进行创造性实验的最新技术。但就在一年前，随着各类品牌不断推出 NFT 项目、出现在虚拟世界中并参与加密社区，Web3 技术正在以类似的方式出现在营销人员的视野中。
  </p>
  <p>人们可能很容易相信生成式 AI 已经取代 Web3 成为新时尚，但行业资深人士已经明确表示 Web3 会持续发展。</p>
  <p>与此同时，在可能出现经济衰退的背景下，各大品牌已经在削减成本，
    并且不得不就广告预算的投资方向做出艰难的决定。
    研究公司 Forrester 的副总裁兼首席分析师 Martha Bennett 指出他们的下一个选择很可能会结合 AI 和 Web3 技术来创新性制定营销预算。</p>
  </div>;

  let p2 = <div>
    <h3>
    那么营销人员应该如何调和这两种技术呢？它们是相互竞争还是互补的？
    </h3>
    <p>AI 和 Web3 在广告中的起源和用例截然不同。
      在过去十几年来，AI 一直是广告行业不可或缺的技术，
      因为它支持推荐、程序化广告购买和构建客户数据。
      另一方面，Web3 与其说是一种自动化，不如说是一套原则，这些原则体现在技术工具中。
      例如 NFT、DAO 和区块链使数字所有权、参与和记录保存民主化。</p>
    <p>「AI 不在与 Web3 并行的开发过程中」，代理机构 Mekanism 的社会战略总监 Jeff MacDonald 说。 MacDonald 指出了人工智能领域存在过度中心化现实，该领域目前由规模庞大的营利性公司运营，并得到更大公司的支持。
      例如在之前投资30亿美元的基础上，微软刚刚又向 ChatGPT 和 DALL-E 创建者
      OpenAI 投资了100亿美元。
    </p>
    <p>这种情况与 Web3 形成鲜明对比，或者至少与 Web3 的目标形成鲜明对比，因为后者渴望建立去中心化机制，不再强调护城河。
      尽管这两种技术在广告功能上有所不同，但营销人员可以通过多种方式将它们结合起来以获得更大的潜在效果。
    </p>
  </div>;

  const centeredDiv = {
    width: "60%", /* Set the width to 60% */
    margin: "0 auto", /* Center the div by setting left and right margins to auto */
    backgroundColor: "#f0f0f0", /* Optional: Add a background color for better visualization */
    padding: "20px" /* Optional: Add padding for content inside the div */
  }

  // useEffect(() => {
  //   const linkHeti = document.createElement('link');
  //   linkHeti.setAttribute('rel', 'stylesheet');
  //   linkHeti.setAttribute('href', '//unpkg.com/heti/umd/heti.min.css');
  //   document.head.appendChild(linkHeti);

  //   const script = document.createElement('script');
  //   script.setAttribute('src', '//unpkg.com/heti/umd/heti-addon.min.js');
  //   document.body.appendChild(script);

  //   const script2 = document.createElement('script');
  //   const code = `

  //   `;
  //   const codeTextNode = document.createTextNode(code);
  //   script2.appendChild(codeTextNode);
  //   document.body.appendChild(script2);
  // }, []);

  return (
    <>
      <Helmet>
        <link rel="stylesheet" href="//unpkg.com/heti/umd/heti.min.css"/>
        <script src="//unpkg.com/heti/umd/heti-addon.min.js"></script>
      </Helmet>
      <div style={centeredDiv}>
        <h1>Test Chinese Typesetting</h1>
        <div>
          <p>
            <i>Reference: https://foresightnews.pro/article/detail/24200</i>
          </p>
        </div>
        <div name="main" className="entry heti">
          {p1}
          {p2}
        </div>
        <div>
          <h3>Above - with `heti`</h3>
          <h3>Below - without `heti`</h3>
        </div>
        <div name="main">
          {p1}
          {p2}
        </div>
      </div>
    </>
  )

}

export default IndexPage
