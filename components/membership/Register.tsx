import Image from "next/image";
import axios from "axios";
import { ChangeEvent, useState } from "react";
import {
  IconCake,
  IconDeviceMobile,
  IconPhoto,
  IconLockOpen,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import { Box, PasswordInput, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { register } from "../../configs/client-services";
import { useForm } from "@mantine/form";
import router from "next/router";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import i18n from 'i18next';
import { optimizeProfileImage } from "@/src/profileImage";

export default function RegisterMember() {
  const [profileImageData, setProfileImageData] = useState<string | null>(null);
  const [profileImageName, setProfileImageName] = useState("");

  //useForm example:
  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      FirstName: "",
      LastName: "",
      UserName: "",
      Password: "",
      EmailAddress: "",
      BirthDate: null,
      UserDescription: null,
      ProfileImageData: null as string | null,
    },
    //validation example:
    validate: (values) => ({
      FirstName:
        values.FirstName === ""
          ? i18n.t('nameNullError')
          : values.FirstName.length > 0 && values.FirstName.length < 2
            ? i18n.t('nameLimitError')
            : values.FirstName.length > 30
              ? i18n.t('nameTopLimitError')
              : null,
      LastName:
        values.LastName === ""
          ? i18n.t('surnameNullError')
          : values.LastName.length > 0 && values.LastName.length < 2
            ? i18n.t('surnameLimitError')
            : values.LastName.length > 30
              ? i18n.t('surnameTopLimitError')
              : null,
      UserName:
        values.UserName === ""
          ? i18n.t('usernameNullError')
          : values.UserName.length > 0 && values.UserName.length < 3
            ? i18n.t('usernameLimitError')
            : values.UserName.length > 20
              ? i18n.t('usernameNTopLimitError')
              : null,
      Password:
        values.Password === ""
          ? i18n.t('passwordNullError')
          : !/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[@$!%*#?&.-])[A-Za-z0-9@$!%*#?&.-\\]{8,}$/.test(
            values.Password
          )
            ? i18n.t('passwordRulesError')
            : null,
      EmailAddress:
        values.EmailAddress === ""
          ? i18n.t('mailNullError')
          : !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
            values.EmailAddress
          )
            ? i18n.t('mailValidateError')
            : null,
    }),
  });

  const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setProfileImageData(null);
      setProfileImageName("");
      form.setFieldValue("ProfileImageData", null);
      return;
    }

    try {
      const result = await optimizeProfileImage(file);
      setProfileImageData(result);
      setProfileImageName(file.name);
      form.setFieldValue("ProfileImageData", result);
    } catch {
      setProfileImageData(null);
      setProfileImageName("");
      form.setFieldValue("ProfileImageData", null);
      alert("Profil resmi islenemedi.");
    }
  };

  const handleRegisterUser = () => {
    const payload = {
      firstName: form.values.FirstName,
      lastName: form.values.LastName,
      username: form.values.UserName,
      password: form.values.Password,
      email: form.values.EmailAddress,
      birthDate: form.values.BirthDate,
      userDescription: form.values.UserDescription,
      profileImageData: form.values.ProfileImageData,
    };

    register({ params: payload }).then((res) => {
      if (res.status === 200 || res.status === 201)
        router.push('/')
    }).catch((error) => {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message ?? 'Kullanıcı kaydı başarısız.'
        : 'Kullanıcı kaydı başarısız.';

      alert(errorMessage)
    });
  };

  const { t } = useTranslation();

  return (
    <>
      <Box
        component="form"
        className="flex flex-col gap-2"
        onSubmit={form.onSubmit(() => {
          handleRegisterUser();
        })}
      >
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-202124 flex items-center gap-2">
              <IconPhoto size={15} />
              Profil Resmi
            </label>
            <label
              htmlFor="profile-image-upload"
              className="cursor-pointer rounded border border-58b4d1 px-3 py-1 text-xs font-bold text-58b4d1 hover:bg-58b4d1 hover:text-white transition-colors"
            >
              {profileImageData ? "Resmi Degistir" : "Resim Sec"}
            </label>
          </div>
          <input
            id="profile-image-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleProfileImageChange}
          />
          <div className="min-h-[20px] text-xs text-343a40">
            {profileImageName ? `${profileImageName} secildi` : "Henuz profil resmi secilmedi"}
          </div>
          {profileImageData && (
            <Image
              src={profileImageData}
              alt="Profil resmi onizleme"
              width={80}
              height={80}
              className="mt-2 h-20 w-20 rounded-lg object-cover border border-gray-200"
            />
          )}
        </div>
        <div className="mt-2">
          <TextInput
            icon={<IconUser size={15} />}
            type="text"
            label={t("memberName")}
            placeholder={t("memberNamePlaceholder")}
            {...form.getInputProps("FirstName")}
          />
        </div>
        <div className="mt-2">
          <TextInput
            icon={<IconUser size={15} />}
            type="text"
            label={t("memberSurname")}
            placeholder={t("memberSurnamePlaceholder")}
            {...form.getInputProps("LastName")}
          />
        </div>
        <div className="mt-2">
          <TextInput
            icon={<IconUser size={15} />}
            type="text"
            label={t("userName")}
            placeholder={t("memberUserNamePlaceholder")}
            {...form.getInputProps("UserName")}
          />
        </div>
        <div className="mt-2">
          <PasswordInput
            icon={<IconLockOpen size={15} />}
            label={t("password")}
            placeholder="********"
            {...form.getInputProps("Password")}
          />
        </div>
        <div className="mt-2">
          <TextInput
            icon={<IconMail size={15} />}
            type="text"
            label={t("mail")}
            placeholder={t("mailPlaceholder")}
            error={form.errors}
            {...form.getInputProps("EmailAddress")}
          />
        </div>
        <div className="mt-2">
          <TextInput
            icon={<IconDeviceMobile size={15} />}
            type="text"
            label="Kendini Tanıt"
            placeholder={t("UserDescription")}
            {...form.getInputProps("UserDescription")}
          />
        </div>
        <div className="mt-2">
          <DatePickerInput
            icon={<IconCake size={15} />}
            clearable
            label={t("birthdayDate")}
            placeholder={t("birthdayDatePlaceholder")}
            valueFormat="YYYY-MM-DD"
            locale="tr"
            {...form.getInputProps("BirthDate")}
          />
        </div>
        <button
          className="w-full h-full flex text-center justify-center items-center rounded font-bold text-white text-base mx-auto min-h-[40px] bg-58b4d1 mt-2"
          type="submit">
          {t("register")}
        </button>
        <Link href="/login" className=' text-58b4d1 text-sm text-center mt-1 border border-58b4d1 rounded p-2 px-0 flex mx-auto w-full items-center justify-center'>
          {t("logIn")}
        </Link>
      </Box>
    </>
  );
}