import "antd/dist/antd.css"
import "./styles.css"
import type { AppProps } from "next/app"
import { ContextProvider } from "../context/provider"
import LayoutWrapper from "../src/components/layoutWrapper"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ContextProvider>
      <LayoutWrapper>
        <Component {...pageProps} />
      </LayoutWrapper>
    </ContextProvider>
  )
}

export default MyApp
