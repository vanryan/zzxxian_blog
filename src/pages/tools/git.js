import React, { useState, useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"

const IndexPage = () => {
  // ----------------------
  // RUNTIME DATA FETCHING
  // ----------------------
  const [starsCount, setStarsCount] = useState(0)
  useEffect(() => {
    // get data from GitHub api
    fetch(`https://api.github.com/repos/gatsbyjs/gatsby`)
      .then(response => response.json()) // parse JSON from request
      .then(resultData => {
        setStarsCount(resultData.stargazers_count)
      }) // set data for the number of stars
  }, [])

  return (
    <>
      <h2>Runtime</h2>
      <p>
        This data from GitHub is fetched using the Fetch API at runtime. This
        data will update every time you refresh this page.{` `}
      </p>
      <p>Star count for the Gatsby repo: {starsCount}</p>
    </>
  )
  
}

export default IndexPage 
