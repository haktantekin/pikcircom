import ContentLeft from "@/components/layout/content/ContentLeft";
import TagsPageContent from "@/components/layout/content/tags/TagsPage";
import Footer from "@/components/main/footer/Footer";
import Header from "@/components/main/header/Index";
import Head from "next/head";
import { useTranslation } from "react-i18next";

export default function TagsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("tagsMenu")} / Pikcir</title>
        <meta
          id="meta-description"
          name="description"
          content="Etiketlere göre Pikcir gönderilerini keşfet."
        />
      </Head>
      <Header />
      <main className="h-auto pb-10 lg:pb-0">
        <div className="container lg:mt-3">
          <div className="grid grid-cols-12 gap-4">
            <ContentLeft />
            <TagsPageContent />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
