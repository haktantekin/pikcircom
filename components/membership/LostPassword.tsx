import { TextInput } from "@mantine/core";
import { IconPassword } from "@tabler/icons-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function LostPassword() {
  const {t} = useTranslation();
  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-col'>
          <TextInput
            icon={<IconPassword size={15} />}
            type="text"
            label={t("mail")}
            placeholder={t("mailAddressPlaceholder")}
          />
        </div>
        <button
          className="w-full h-full flex text-center justify-center items-center rounded font-bold text-white text-base mx-auto min-h-[40px] bg-58b4d1 mt-2">
          {t("refresh")}
        </button>
        <Link href="/login" className=' text-58b4d1 text-sm text-center border border-58b4d1 rounded p-2 px-0 flex mx-auto w-full items-center justify-center mt-1'>
        {t("logIn")}
        </Link>
      </div>
    </>
  )
}
