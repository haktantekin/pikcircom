import {
  IconAlignJustified,
  IconAt,
  IconCake,
  IconDeviceMobile,
  IconLockOpen,
  IconMail,
  IconPhotoEdit,
  IconUser,
} from "@tabler/icons-react";
import { FileButton, Loader, PasswordInput, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { DatePickerInput } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { pickAvatarUrlFromMap } from "@/src/avatarUrl";
import { optimizeProfileImage } from "@/src/profileImage";
import { updateProfile } from "@/configs/client-services";
import ProfileAccountOverview, {
  type ProfileAccountOverviewStats,
} from "./ProfileAccountOverview";

export type ProfileSettingsPublicSlice = {
  userName?: string;
  coverUrls?: Record<string, string>;
  coverImageUrl?: string | null;
  avatarUrls?: Record<string, string>;
};

interface ProfileSettingsModalProps {
  publicProfileUser?: ProfileSettingsPublicSlice;
  onSuccess: () => void;
}

type SessionShape = {
  userName?: string;
  email?: string | null;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userDescription?: string | null;
  phoneNumber?: string | null;
  birthDate?: string | null;
  avatarUrls?: Record<string, string>;
  coverUrls?: Record<string, string>;
  coverImageUrl?: string | null;
};

function parseApiDate(value: string | null | undefined): Date | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const d = new Date(value);

  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateForApi(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

export default function ProfileSettingsModal({
  publicProfileUser,
  onSuccess,
}: ProfileSettingsModalProps) {
  const { t } = useTranslation();
  const avatarResetRef = useRef<() => void>(null);
  const coverResetRef = useRef<() => void>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionShape | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [accountOverview, setAccountOverview] =
    useState<ProfileAccountOverviewStats | null>(null);
  const [accountOverviewLoading, setAccountOverviewLoading] = useState(false);

  const form = useForm({
    initialValues: {
      displayName: "",
      firstName: "",
      lastName: "",
      userDescription: "",
      email: "",
      password: "",
      phoneNumber: "",
      birthDate: null as Date | null,
    },
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      setAvatarDataUrl(null);
      setCoverDataUrl(null);
      avatarResetRef.current?.();
      coverResetRef.current?.();

      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
          cache: "no-store",
        });

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          const message =
            response.status === 401
              ? "Profili guncellemek icin giris yapmalisin."
              : "Profil bilgileri yuklenemedi.";
          setLoadError(message);
          setSession(null);
          return;
        }

        const data = (await response.json()) as SessionShape;
        setSession(data);

        form.setValues({
          displayName: data.displayName ?? "",
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          userDescription: data.userDescription ?? "",
          email: data.email ?? "",
          password: "",
          phoneNumber: data.phoneNumber ?? "",
          birthDate: parseApiDate(data.birthDate ?? undefined),
        });
      } catch {
        if (!cancelled) {
          setLoadError("Profil bilgileri yuklenemedi.");
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
    // Modal kapandiginda unmount olur; her acilista yeniden fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const username = session?.userName;

    if (!username) {
      setAccountOverview(null);
      setAccountOverviewLoading(false);

      return;
    }

    let cancelled = false;

    const loadOverview = async () => {
      setAccountOverviewLoading(true);

      try {
        const response = await fetch(
          `/api/profile/${encodeURIComponent(username)}`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setAccountOverview(null);

          return;
        }

        const data = (await response.json()) as {
          user?: {
            postCount?: number;
            followedCount?: number;
            followersCount?: number;
            collections?: unknown;
          };
        };

        const u = data.user;

        if (!u) {
          setAccountOverview(null);

          return;
        }

        const collectionsLen = Array.isArray(u.collections)
          ? u.collections.length
          : 0;

        setAccountOverview({
          posts: typeof u.postCount === "number" ? u.postCount : 0,
          collections: collectionsLen,
          following:
            typeof u.followedCount === "number" ? u.followedCount : 0,
          followers:
            typeof u.followersCount === "number" ? u.followersCount : 0,
        });
      } catch {
        if (!cancelled) {
          setAccountOverview(null);
        }
      } finally {
        if (!cancelled) {
          setAccountOverviewLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, [session?.userName]);

  const coverBackgroundUrl = useMemo(() => {
    if (coverDataUrl) {
      return coverDataUrl;
    }

    const fromSession =
      typeof session?.coverUrls?.full === "string"
        ? session.coverUrls.full
        : typeof session?.coverImageUrl === "string"
          ? session.coverImageUrl
          : null;

    if (fromSession) {
      return fromSession;
    }

    const fromPublic =
      typeof publicProfileUser?.coverUrls?.full === "string"
        ? publicProfileUser.coverUrls.full
        : typeof publicProfileUser?.coverImageUrl === "string"
          ? publicProfileUser.coverImageUrl
          : null;

    if (fromPublic) {
      return fromPublic;
    }

    return "/coverExample.jpg";
  }, [
    coverDataUrl,
    publicProfileUser?.coverImageUrl,
    publicProfileUser?.coverUrls?.full,
    session?.coverImageUrl,
    session?.coverUrls?.full,
  ]);

  const avatarImageSrc = useMemo(() => {
    if (avatarDataUrl) {
      return avatarDataUrl;
    }

    return pickAvatarUrlFromMap(
      session?.avatarUrls ?? publicProfileUser?.avatarUrls,
    );
  }, [avatarDataUrl, publicProfileUser?.avatarUrls, session?.avatarUrls]);

  const handleAvatarFile = async (file: File | null) => {
    if (!file) {
      return;
    }

    try {
      const optimized = await optimizeProfileImage(file);
      setAvatarDataUrl(optimized);
    } catch {
      showNotification({
        title: "Hata",
        message: "Profil fotografi islenemedi.",
        color: "red",
      });
    }
  };

  const handleCoverFile = async (file: File | null) => {
    if (!file) {
      return;
    }

    try {
      const optimized = await optimizeProfileImage(file, {
        maxDimension: 1920,
        maxBytes: 2 * 1024 * 1024,
      });
      setCoverDataUrl(optimized);
    } catch {
      showNotification({
        title: "Hata",
        message: "Kapak fotografi islenemedi.",
        color: "red",
      });
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!session?.userName) {
      return;
    }

    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        displayName: values.displayName.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        userDescription: values.userDescription.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        birthDate: values.birthDate
          ? formatDateForApi(values.birthDate)
          : "",
      };

      if (values.password.trim()) {
        payload.password = values.password.trim();
      }

      if (avatarDataUrl) {
        payload.profileImageData = avatarDataUrl;
      }

      if (coverDataUrl) {
        payload.coverImageData = coverDataUrl;
      }

      await updateProfile(payload);

      showNotification({
        title: t("profileUpdateSuccessCms"),
        color: "teal",
      });
      form.setFieldValue("password", "");
      onSuccess();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Profil guncellenemedi."
        : "Profil guncellenemedi.";

      showNotification({
        title: "Hata",
        message,
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center py-12">
        <Loader color="#58b4d1" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-8 text-center text-sm text-red-700">{loadError}</div>
    );
  }

  return (
    <form className="space-y-2" onSubmit={form.onSubmit(handleSubmit)}>
      <div
        className="relative z-0 mb-4 flex min-h-[200px] items-center justify-center overflow-hidden rounded-tl rounded-tr bg-cover bg-center bg-no-repeat before:absolute before:left-0 before:top-0 before:z-0 before:h-full before:w-full before:bg-black before:bg-opacity-50"
        style={{ backgroundImage: `url(${coverBackgroundUrl})` }}
      >
        <FileButton
          resetRef={coverResetRef}
          onChange={handleCoverFile}
          accept="image/png,image/jpeg"
        >
          {(props) => (
            <button
              type="button"
              className="relative z-[1] rounded-full bg-white p-4 text-126782"
              {...props}
            >
              <IconPhotoEdit color="#58b4d1" />
            </button>
          )}
        </FileButton>
      </div>

      <div className="relative -mt-16 left-1/2 w-28 -translate-x-1/2">
        <FileButton
          resetRef={avatarResetRef}
          onChange={handleAvatarFile}
          accept="image/png,image/jpeg,image/webp,image/gif"
        >
          {(props) => (
            <button
              type="button"
              {...props}
              className="relative h-full w-full overflow-hidden rounded-full border-2 border-white"
            >
              <Image
                alt=""
                width={300}
                height={300}
                src={avatarImageSrc}
                className="h-full w-full object-cover"
                unoptimized={
                  avatarImageSrc.startsWith("http") ||
                  avatarImageSrc.startsWith("data:")
                }
              />
              <IconPhotoEdit
                className="absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-2 text-58b4d1"
                size={40}
                color="#58b4d1"
              />
            </button>
          )}
        </FileButton>
      </div>

      <ProfileAccountOverview
        loading={accountOverviewLoading}
        stats={accountOverview}
      />

      <Textarea
        icon={<IconAlignJustified size={15} />}
        maxLength={80}
        label={t("profileText")}
        {...form.getInputProps("userDescription")}
      />

      <TextInput
        icon={<IconUser size={15} />}
        type="text"
        label={t("profileName")}
        {...form.getInputProps("displayName")}
      />

      <TextInput
        icon={<IconUser size={15} />}
        type="text"
        label={t("memberName")}
        {...form.getInputProps("firstName")}
      />

      <TextInput
        icon={<IconUser size={15} />}
        type="text"
        label={t("memberSurname")}
        {...form.getInputProps("lastName")}
      />

      <TextInput
        icon={<IconAt size={15} />}
        type="text"
        label={t("userName")}
        value={session?.userName ?? ""}
        disabled
        readOnly
      />

      <TextInput
        icon={<IconMail size={15} />}
        type="email"
        label={t("mail")}
        {...form.getInputProps("email")}
      />

      <PasswordInput
        icon={<IconLockOpen size={15} />}
        label={t("password")}
        placeholder="********"
        autoComplete="new-password"
        {...form.getInputProps("password")}
      />

      <TextInput
        icon={<IconDeviceMobile size={15} />}
        type="tel"
        label={t("phone")}
        {...form.getInputProps("phoneNumber")}
      />

      <DatePickerInput
        icon={<IconCake size={15} />}
        clearable
        label={t("birthdayDate")}
        placeholder={t("birthdayDatePlaceholder")}
        valueFormat="YYYY-MM-DD"
        locale="tr"
        mx="auto"
        maw={400}
        {...form.getInputProps("birthDate")}
      />

      <button
        type="submit"
        disabled={submitting}
        className="mx-auto mt-4 flex max-w-[220px] min-h-[44px] w-full cursor-pointer items-center justify-center rounded bg-58b4d1 text-base font-bold text-white disabled:opacity-60"
      >
        {submitting ? "…" : t("update")}
      </button>
    </form>
  );
}
