import "@/styles/global.scss";
import React, { Suspense } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";

import Loading from "@/components/Loading";
import PageWrapper from "@/components/pageWrapper";
import GlobalNav from "@/components/globalNav";
import BackgroundGradient from "@/components/backgroundGradient";

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  return (
    <Suspense fallback={<Loading />}>
      <Head>
        <title>DropHacker</title>
      </Head>
      <GlobalNav />
      <div className="app">
        <PageWrapper>
          <Component {...pageProps} />
        </PageWrapper>
      </div>
      <BackgroundGradient />
    </Suspense>
  );
}
