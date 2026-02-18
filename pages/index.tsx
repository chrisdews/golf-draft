import React from "react"
import Head from "next/head"
import type { NextPage } from "next"
import GolfDraft from "../src/components/golfDraft"

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Golf Draft</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GolfDraft />
    </div>
  )
}

export default Home
