import "antd/dist/antd.css";
import "./styles.css"
import { ContextProvider } from "../context/provider";
import LayoutWrapper from "../src/components/layoutWrapper";

function MyApp({ Component, pageProps }) {
  return (
    <ContextProvider>
      <LayoutWrapper>
        <Component {...pageProps} />
      </LayoutWrapper>
    </ContextProvider>
  );
}

export default MyApp;
