import React from "react";
import Head from "next/head";
import GolfDraft from "../src/components/golfDraft";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Golf Draft</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <GolfDraft />
    </div>
  );
}
