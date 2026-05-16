import Cloud from "@/components/membership/Cloud";
import LoginMember from "@/components/membership/Login";
import MemberLayout from "@/components/membership/MemberLayout";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fetchAuthProfile } from "@/src/fetchAuthProfile";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const result = await fetchAuthProfile({ refresh: true });
        if (cancelled || !result.ok) {
          return;
        }
        const name =
          typeof result.data?.userName === "string"
            ? result.data.userName.trim()
            : "";
        if (name) {
          void router.replace("/");
        }
      } catch {
        /* misafir — login sayfasında kal */
      }
    };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>Giriş / Pikcir</title>
        <meta
          id="meta-description"
          name="description"
          content="Kafanın içinde biri var ve sürekli espri yapıyorsa bize katıl. Resmini al gel, koleksiyonlar oluştur, eğlen!"
        />
      </Head>
      <div className="absolute -top-[70px] left-1/2 hidden -translate-x-1/2 animate-piki opacity-0 lg:block lg:pl-0">
        <Image
          src="/logo.png"
          alt="Pickup"
          width={60}
          height={48}
          className="mx-auto h-[72px] w-[60px]"
          priority
        />
      </div>
      <MemberLayout>
        <div className="absolute -top-[70px] left-1/2 block -translate-x-1/2 lg:hidden lg:pl-0">
          <Image
            src="/logo.png"
            alt="Pickup"
            width={60}
            height={48}
            className="mx-auto h-[72px] w-[60px]"
            priority
          />
        </div>
        <h1 className="w-full text-center text-xl font-bold text-343a40 lg:text-2xl">
          <span className="font-bold text-58b4d1">PİKİ</span> {t("loginTitle")}
        </h1>
        <p className="text-center text-sm text-343a40 lg:text-sm">{t("loginSubText")}</p>
        <LoginMember />
      </MemberLayout>
      <Cloud />
    </>
  );
}
