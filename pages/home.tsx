import ContentCenter from "@/components/layout/content/ContentCenter";
import ContentLeft from "@/components/layout/content/ContentLeft";
import ContentRight from "@/components/layout/content/ContentRight";
import Footer from "@/components/main/footer/Footer";
import Header from "@/components/main/header/Index";
import { profile } from "@/configs/client-services";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";

export default function Home() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState<boolean>(false);

  const loadUser = useCallback(() => {
    setReady(false);
    profile()
      .then((res) => {
        if (res.status === 200) {
          setUser(res.data);
        } else {
          setUser(null);
        }
        setReady(true);
      })
      .catch(() => {
        setUser(null);
        setReady(true);
      });
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => subscribeAuthSessionChanged(loadUser), [loadUser]);
  return (
    <>
      <Head>
        <title>Ana Sayfa / Pikcir</title>
        <meta id="meta-description" name="description" content="Kafanın içinde biri var ve sürekli espri yapıyorsa bize katıl. Resmini al gel, koleksiyonlar oluştur, eğlen!" />
      </Head>
      <Header user={user} />
      <main className={`h-auto pb-10 lg:pb-0`}>
        <div className="container lg:mt-3">
          <div className="grid grid-cols-12 gap-4">
            <ContentLeft />
            <ContentCenter type="home" />
            <ContentRight />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
