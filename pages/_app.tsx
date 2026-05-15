import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '../src/I18n';
import { Provider } from "react-redux"
import store from "../src/store";
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { NotificationProvider } from "@/components/main/header/notifications/NotificationProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <MantineProvider withGlobalStyles withNormalizeCSS={false}>
        <Notifications position="top-center" />
        <NotificationProvider>
          <Component {...pageProps} />
        </NotificationProvider>
      </MantineProvider>
    </Provider>
  )
}
