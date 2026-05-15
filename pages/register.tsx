import MemberLayout from '@/components/membership/MemberLayout'
import RegisterMember from '@/components/membership/Register'
import Head from 'next/head'
import Image from 'next/image'
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>Üye Girişi / Pikcir</title>
        <meta id="meta-description" name="description" content="Kafanın içinde biri var ve sürekli espri yapıyorsa bize katıl. Resmini al gel, koleksiyonlar oluştur, eğlen!" />
      </Head>
      <MemberLayout>
        <div className='absolute left-1/2 -translate-x-1/2 lg:pl-0 -top-[70px]'>
          <Image src="/logo.png" alt="Pickup" width={60} height={48} className="w-[60px] h-[72px] mx-auto" priority></Image>
        </div>
        <h1 className='font-bold text-xl lg:text-2xl text-343a40 w-full text-center'>
        <span className='font-bold text-58b4d1'>PİKİ&nbsp;</span>{t("memberTitle")}
        </h1>
        <p className='text-sm lg:text-sm text-center text-343a40'>3 dakikada üye ol, eşsiz dünyaya katıl!</p>
        <RegisterMember />
      </MemberLayout>
    </>
  )
}
