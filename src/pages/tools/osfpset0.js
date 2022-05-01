import React, { useState, useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"

const IndexPage = () => {
  // ----------------------
  // RUNTIME DATA FETCHING
  // ----------------------

  const collection_map = new Map();

  collection_map.set('XDIV1', 'Closely Watching')
  collection_map.set('moonbirds', 'proof-moonbirds');
  collection_map.set('MAYC', 'mutant-ape-yacht-club');
  collection_map.set('XDIV2', 'Holding')
  collection_map.set('WoW', 'world-of-women-nft');
  collection_map.set('Premint', 'premint-collector');
  collection_map.set('Coniun', 'coniun-pass');
  collection_map.set('GucciGrail', '10ktf-gucci-grail');
  collection_map.set('10ktf', '10ktf');
  collection_map.set('Llamav', 'llamaverse-genesis');
  collection_map.set('Okay Bears', 'okay-bears');
  collection_map.set('CaiGuoQiang', 'your-daytime-fireworks-firework-packets');
  collection_map.set('adidas', 'adidasoriginals');
  collection_map.set('XDIV3','WatchingBC');
  collection_map.set('doodles', 'doodles-official');
  collection_map.set('azuki', 'azuki');
  collection_map.set('clonex', 'clonex');
  collection_map.set('CA', 'champions-ascension-prime-eternal');
  collection_map.set('XDIV4', 'bystanding')
  collection_map.set('PA', 'psychedelics-anonymous-genesis');
  collection_map.set('mfers', 'mfers');
  let collection_element = <tr><th>Collection</th><th>FloorPrice&nbsp;</th><th>DailyAve&nbsp;</th>
    <th>1DayVol&nbsp;</th><th>7DayVol&nbsp;</th><th>#Owner</th></tr>;
  
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
    } else{
      const [x, y] = useState('') 
    const url = 'https://api.opensea.io/api/v1/collection/' + value + '/stats?format=json';
      useEffect(() => {
        fetch(url)
        .then(response => response.json())
        .then(resultData => {
        y(resultData.stats)
      })
  },[])
    collection_element = (<>{collection_element}
      <tr>
        <td><b>&emsp;{key}&nbsp;</b></td>
        <td>{parseFloat(x.floor_price).toFixed(2)}</td>
        <td>{parseFloat(x.one_day_average_price).toFixed(2)}</td>
        <td>{parseFloat(x.one_day_volume).toFixed(2)}</td>
        <td>{parseFloat(x.seven_day_volume).toFixed(2)}</td>
        <td>{parseFloat(x.num_owners).toFixed(2)}</td>  
      </tr>
      </>)
    }
  }

  return (
    <>
      <h2>OpenSea Collections Data</h2>
      <p>
        <table>
        {collection_element}
        </table>
      </p>
    </>
  )
  
}

export default IndexPage 
