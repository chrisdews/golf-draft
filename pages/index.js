import React from "react";
import Head from "next/head";
import HomeLayout from "../src/components/homeLayout";



export default function Home() {
  return (
    <div>
      <Head>
        <title>Golf Draft</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeLayout />
    </div>
  );
}
