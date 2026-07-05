import ProfilePageShell from "@/components/layout/content/profile/ProfilePageShell";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import axios from "axios";

interface SsrProfileMeta {
  displayName?: string;
  userName?: string;
  userDescription?: string;
  avatarUrl?: string;
}

export const getServerSideProps: GetServerSideProps<{
  ssrMeta: SsrProfileMeta | null;
}> = async (ctx) => {
  const profileSlug = typeof ctx.params?.profile === "string" ? ctx.params.profile : "";

  if (!profileSlug) {
    return { props: { ssrMeta: null } };
  }

  const wordPressBaseUrl = (
    process.env.WORDPRESS_API_URL ?? process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? ""
  ).replace(/\/$/, "");

  if (!wordPressBaseUrl) {
    return { props: { ssrMeta: null } };
  }

  try {
    const { data } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/profile/${encodeURIComponent(profileSlug)}`,
      { params: { posts_per_page: 1 }, timeout: 5000 },
    );

    const user = data?.user;
    if (!user) {
      return { props: { ssrMeta: null } };
    }

    const avatarUrls = user.avatarUrls as Record<string, string> | undefined;
    const avatarUrl = avatarUrls?.["96"] ?? avatarUrls?.["48"] ?? Object.values(avatarUrls ?? {})[0] ?? undefined;

    return {
      props: {
        ssrMeta: {
          displayName: user.displayName ?? user.firstName ?? user.userName ?? profileSlug,
          userName: user.userName ?? profileSlug,
          userDescription: user.userDescription ?? null,
          avatarUrl: avatarUrl ?? null,
        } as SsrProfileMeta,
      },
    };
  } catch {
    return { props: { ssrMeta: null } };
  }
};

export default function Profile({ ssrMeta }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <ProfilePageShell activeTab="piklerim" ssrMeta={ssrMeta} />;
}
