import React, { useState, useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"

const IndexPage = () => {
  // ----------------------
  // RUNTIME DATA FETCHING
  // ----------------------

  const collection_map = new Map();

  collection_map.set('XDIV1', 'Closely Watching')
  collection_map.set('bitcoin','bitcoin');
  collection_map.set('ethereum','ethereum');
  collection_map.set('bnb','binancecoin');
  collection_map.set('solana','solana');
  collection_map.set('terra-luna','terra-luna');
  collection_map.set('apecoin','apecoin');
  collection_map.set('avax','avalanche-2');
  
  collection_map.set('XDIV2', 'SmallCap');
  collection_map.set('cel','celsius-degree-token');
  

  let collection_element = <tr><th>Crypto</th><th>CurrentPrice&nbsp;</th><th>PriceChange24h&nbsp;</th>
    <th>MCChange24h&nbsp;</th><th>High24h&nbsp;</th><th>Low24h</th></tr>;
  
  for (var [key, value] of collection_map.entries()) { 
    if (key.startsWith('XDIV')) {
      collection_element = (<>{collection_element}
        <tr>
        <td></td>
        <td></td>
        <td><i>{value}</i></td>
        <td></td>
        <td></td>
        <td></td>
        </tr></>);
    }  else {
      // crypto
      const [price, setPrice] = useState('') 
      const [high_24h, setHigh24h] = useState('') 
      const [low_24h, setLow24h] = useState('') 
      const [mdata, setMarketData] = useState('')
      // TODO combine in one http call
      // const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + value;
      const url = "https://api.coingecko.com/api/v3/coins/" + value;
   
      useEffect(() => {
        fetch(url)
        .then(response => response.json())
        .then(result => {setMarketData(result["market_data"]);
        setPrice(result['market_data']['current_price']);
        setHigh24h(result['market_data']['high_24h']);
        setLow24h(result['market_data']['low_24h']);
        })
  },[])
    collection_element = (<>{collection_element}
      <tr>
          <td><b>&emsp;{key}&nbsp;</b></td>
        <td>{parseFloat(price.usd).toFixed(4)}</td>
        <td>{parseFloat(mdata.price_change_percentage_24h).toFixed(2)}</td>
        <td>{parseFloat(mdata.market_cap_change_percentage_24h).toFixed(2)}</td>
        <td>{parseFloat(high_24h.usd).toFixed(2)}</td>
        <td>{parseFloat(low_24h.usd).toFixed(2)}</td> 


      </tr></>)
    }
  }
/*
        <td>{parseFloat(x.current_price).toFixed(4)}</td>
        <td>{parseFloat(x.price_change_percentage_24h).toFixed(2)}</td>
        <td>{parseFloat(x.market_cap_change_percentage_24h).toFixed(2)}</td>
        <td>{parseFloat(x.high_24h).toFixed(2)}</td>
        <td>{parseFloat(x.low_24h).toFixed(2)}</td>  

       */

  return (
    <>
      <h2>Crypto Data</h2>
      <p>
        <table>
        {collection_element}
        </table>
      </p>
    </>
  )
  
}

export default IndexPage 
