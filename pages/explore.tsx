import ContentCenter from "@/components/layout/content/ContentCenter";
import Footer from "@/components/main/footer/Footer";
import Header from "@/components/main/header/Index";
import Head from "next/head";
import { useGuestFeedReadOnly } from "@/src/useGuestFeedReadOnly";

export default function Explore() {
  const { feedReadOnly } = useGuestFeedReadOnly();

  return (
    <>
      <Head>
        <title>Keşfet / Pikcir</title>
        <meta id="meta-description" name="description" content="Kafanın içinde biri var ve sürekli espri yapıyorsa bize katıl. Resmini al gel, koleksiyonlar oluştur, eğlen!" />
      </Head>
      <Header />
      <main className="h-auto app-main-with-tab-bar">
        <div className="container lg:mt-3">
          <div className="grid grid-cols-12 gap-4">
            <ContentCenter type="explore" feedReadOnly={feedReadOnly} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
