import React, { useState, useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"

const IndexPage = () => {
  // ----------------------
  // RUNTIME DATA FETCHING
  // ----------------------

  const collection_map = new Map();
  collection_map.set('moonbirds', 'proof-moonbirds');
  let collection_element;
  
  for (var [key, value] of collection_map.entries()) { 
    const [x, y] = useState('') 
    const url = 'https://api.opensea.io/api/v1/collection/' + value + '/stats?format=json';
  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(resultData => {
        y(resultData.stats)
      })
  },[])
    collection_element = (<>{collection_element}<li>{JSON.stringify(x)}</li></>)
  }

  return (
    <>
      <h2>OpenSea Collections Data</h2>
      <p>
        {collection_element}
      </p>
    </>
  )
  
}

export default IndexPage 
