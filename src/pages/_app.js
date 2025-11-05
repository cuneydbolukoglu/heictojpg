import Head from "next/head";
import GlobalLayout from "@/components/layout";
import "@/styles/globals.css";
import { ConfigProvider, theme } from "antd";
import { useEffect, useState } from "react";

const { darkAlgorithm, defaultAlgorithm } = theme;

export default function App({ Component, pageProps }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <Head>
        <title>HEIC to JPG Free Converter</title>
        <meta name="description" content="Convert HEIC to JPG easily" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
          token: {
          },
          components: {
            Button: {
              colorPrimary: 'linear-gradient(135deg, #1890ff, #722ed1)',
              colorPrimaryHover: 'linear-gradient(135deg, #40a9ff, #9254de)',
              colorPrimaryActive: 'linear-gradient(135deg, #096dd9, #722ed1)',
              primaryShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
            },
          },
        }}
      >
        <GlobalLayout>
          <Component {...pageProps} />
        </GlobalLayout>
      </ConfigProvider>
    </>
  );
}
