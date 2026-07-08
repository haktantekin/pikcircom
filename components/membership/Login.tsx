import Link from "next/link";
import GoogleSignInButton from "./GoogleSignInButton";
import { IconLockOpen, IconUser } from "@tabler/icons-react";
import { Box, TextInput, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../src/store/UserSlices";
import type { AppDispatch, RootState } from "../../src/store";
import { dispatchAuthSessionChanged } from "@/src/authSessionEvent";

export default function LoginMember() {
  const { t } = useTranslation();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      password: "",
      userName: "",
    },
    validate: {
      userName: (value) =>
        !value?.trim() ? i18n.t("usernameNullError") : null,
      password: (value) =>
        value === "" ? i18n.t("passwordNullError") : null,
    },
  });

  const dispatch = useDispatch<AppDispatch>();

  const handleLoginEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }

    const userCredentials = {
      userName: form.values.userName.trim(),
      password: form.values.password,
    };

    const action = await dispatch(loginUser(userCredentials));

    if (loginUser.fulfilled.match(action)) {
      form.reset();
      dispatchAuthSessionChanged();
      window.location.assign("/");
    }
  };

  return (
    <>
      <div className="w-full mt-2 lg:mt-2">
        <Box
          component="form"
          className="flex flex-col gap-2"
          onSubmit={(e) => void handleLoginEvent(e)}
        >
          <div className="flex flex-col gap-2">
            <div className="mt-2">
              <TextInput
                icon={<IconUser size={15} />}
                type="text"
                autoComplete="username"
                label={t("userName")}
                placeholder={t("userNamePlaceholder")}
                {...form.getInputProps("userName")}
              />
            </div>
            <div className="mt-2">
              <TextInput
                icon={<IconLockOpen size={15} />}
                type="password"
                autoComplete="current-password"
                label={t("password")}
                placeholder="********"
                {...form.getInputProps("password")}
              />
            </div>
            <div className="flex h-8 items-center justify-between">
              <Checkbox
                label={t("dontForget")}
                className="text-base"
                defaultChecked
              />
              <Link href="/forgot-password" className="text-sm text-58b4d1">
                {t("forgotPassword")}
              </Link>
            </div>
            {error && (
              <div className="text-sm font-bold text-red-500">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="ml-auto mt-0 flex h-full min-h-[40px] w-full cursor-pointer items-center justify-center rounded bg-58b4d1 text-center text-base font-bold text-white disabled:opacity-70"
            >
              {loading ? `${t("logIn")}…` : t("logIn")}
            </button>
          </div>
        </Box>
      </div>
      <Link
        href="/register"
        className="mx-auto mt-2 flex w-full items-center justify-center rounded border border-58b4d1 p-2 px-0 text-center text-sm text-58b4d1"
      >
        {t("beMember")}
      </Link>
      <GoogleSignInButton />
    </>
  );
}
