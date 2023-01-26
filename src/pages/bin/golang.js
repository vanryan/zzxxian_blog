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
  collection_map.set('MB Oddities', 'moonbirds-oddities');
  collection_map.set('MirrorPass', 'mirror-passes');
  collection_map.set('FTC', 'ftc-official');
  collection_map.set('sensei', 'nftsensei');
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
  collection_map.set('clonex', 'clonex');
  collection_map.set('azuki', 'azuki');
  collection_map.set('beanz', 'beanzofficial');
  collection_map.set('CA', 'champions-ascension-prime-eternal');
  collection_map.set('XDIV4', 'bystanding')
  collection_map.set('PA', 'psychedelics-anonymous-genesis');
  collection_map.set('mfers', 'mfers');
  collection_map.set('fanglijun', 'elemental-fang-lijun');
  collection_map.set('cyberbrokers', 'cyberbrokers');
  collection_map.set('JamesJean', 'fragments-by-james-jean');
  collection_map.set('VeeCon', 'veecon-tickets');
  collection_map.set('rektguy', 'rektguy');
  collection_map.set('BeginAsNothing', 'begin-as-nothing');
  let collection_element = <tr><th>Collection</th><th>FloorPrice&nbsp;</th><th>DailyAve&nbsp;</th>
    <th>1DayVol&nbsp;</th><th>7DayVol&nbsp;</th><th>#Owner</th></tr>;
  
  const [baseFee, setBaseFee] = useState('');
  const [basics, setBasics] = useState('');
  const [speed0, setSpeed0] = useState('');
  const [speed1, setSpeed1] = useState('');
  const [speed2, setSpeed2] = useState('');
  const [speed3, setSpeed3] = useState('');
  
  const gasUrl = 'https://owlracle.info/eth/gas';
  useEffect(() => {
    fetch(gasUrl)
      .then(response => response.json())
    .then(data => {
      setBaseFee(data["baseFee"]);
      setBasics(data);
      setSpeed0(data["speeds"][0]);
      setSpeed1(data["speeds"][1]);
      setSpeed2(data["speeds"][2]);
      setSpeed3(data["speeds"][3]);
    })
  },[]);
  
  
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
      const [x, y] = useState(''); 
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
      <h3>Eth Gas</h3>
      <table>
      <tr>
        <th>BaseFee</th>
        <th>AvgTime</th>
        <th>LastBlock</th>
        <th>Timestamp</th>
      </tr>
      <tr>
        <td>{parseFloat(baseFee).toFixed(3)}</td>
        <td>{parseFloat(basics.avgTime).toFixed(3)}</td>
        <td>{basics.lastBlock}</td>
        <td>{basics.timestamp}</td>
      </tr>
      </table>
      <table>
      <tr>
          <th>0-accept</th><th>gas</th><th>estimatedFee</th>&nbsp;|
          <th>1-accept</th><th>gas</th><th>estimatedFee</th>&nbsp;|
          <th>2-accept</th><th>gas</th><th>estimatedFee</th>&nbsp;|
          <th>3-accept</th><th>gas</th><th>estimatedFee</th>
      </tr>
      <tr>
        <td>{speed0.acceptance}</td><td>{parseFloat(speed0.gasPrice).toFixed(2)},&nbsp;</td><td>{parseFloat(speed0.estimatedFee).toFixed(2)}</td>&nbsp;|
        <td>{speed1.acceptance}</td><td>{parseFloat(speed1.gasPrice).toFixed(2)},&nbsp;</td><td>{parseFloat(speed1.estimatedFee).toFixed(2)}</td>&nbsp;|
        <td>{speed2.acceptance}</td><td>{parseFloat(speed2.gasPrice).toFixed(2)},&nbsp;</td><td>{parseFloat(speed2.estimatedFee).toFixed(2)}</td>&nbsp;|
        <td>{speed3.acceptance}</td><td>{parseFloat(speed3.gasPrice).toFixed(2)},&nbsp;</td><td>{parseFloat(speed3.estimatedFee).toFixed(2)}</td>
      </tr>
      </table>

      <h2>OpenSeas Data</h2>
    
      
      <p>
        <table>
        {collection_element}
        </table>
      </p>
    </>
  )
  
}

export default IndexPage 
