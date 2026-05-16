import ContentCenter from "@/components/layout/content/ContentCenter";
import ContentLeft from "@/components/layout/content/ContentLeft";
import ContentRight from "@/components/layout/content/ContentRight";
import Footer from "@/components/main/footer/Footer";
import Header from "@/components/main/header/Index";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useGuestFeedReadOnly } from "@/src/useGuestFeedReadOnly";

export default function Search() {
  const router = useRouter();
  const { t } = useTranslation();
  const { feedReadOnly } = useGuestFeedReadOnly();
  const q = typeof router.query.q === "string" ? router.query.q.trim() : "";
  const pageTitle = q
    ? `${q} / ${t("searchPageTitle")} / Pikcir`
    : `${t("searchPageTitle")} / Pikcir`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          id="meta-description"
          name="description"
          content={t("searchMetaDescription")}
        />
      </Head>
      <Header />
      <main className="h-auto pb-10 lg:pb-0">
        <div className="container lg:mt-3">
          <div className="grid grid-cols-12 gap-4">
            <ContentLeft />
            <ContentCenter type="search" feedReadOnly={feedReadOnly} />
            <ContentRight readOnly={feedReadOnly} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
