import "antd/dist/antd.css";
import { ContextProvider } from "../context/provider";

function MyApp({ Component, pageProps }) {
  return (
    <ContextProvider>
      <Component {...pageProps} />
    </ContextProvider>
  );
}

export default MyApp;
