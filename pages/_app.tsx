import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '../src/I18n';
import { Provider } from "react-redux"
import store from "../src/store";
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { NotificationProvider } from "@/components/main/header/notifications/NotificationProvider";
import ContentProtection from "@/components/ContentProtection";
import Script from "next/script";

const mantineTheme = {
  defaultRadius: "md" as const,
  shadows: {
    xs: "0 1px 2px rgba(33, 35, 38, 0.05)",
    sm: "0 4px 14px -4px rgba(33, 35, 38, 0.08), 0 2px 6px -2px rgba(33, 35, 38, 0.06)",
    md: "0 8px 24px -6px rgba(33, 35, 38, 0.12), 0 4px 8px -4px rgba(33, 35, 38, 0.08)",
    lg: "0 12px 32px -8px rgba(33, 35, 38, 0.14), 0 6px 12px -4px rgba(33, 35, 38, 0.1)",
    xl: "0 20px 48px -12px rgba(33, 35, 38, 0.18)",
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-K8YC6CMM37"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-K8YC6CMM37');
        `}
      </Script>
      <Provider store={store}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS={false}
        theme={mantineTheme}
      >
        <Notifications position="top-center" />
        <NotificationProvider>
          <ContentProtection />
          <Component {...pageProps} />
        </NotificationProvider>
      </MantineProvider>
    </Provider>
    </>
  )
}
