import axios from "axios";

export const AUTH_TOKEN_COOKIE_NAME = "auth_token";

export function getWordPressSiteRoot(): string {
  const baseUrl =
    process.env.WORDPRESS_API_URL ?? process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

  let root = baseUrl?.replace(/\/$/, "") ?? "";

  if (
    root.startsWith("http://") &&
    process.env.NODE_ENV === "production" &&
    process.env.WORDPRESS_FORCE_HTTP !== "1"
  ) {
    root = `https://${root.slice("http://".length)}`;
  }

  return root;
}

export function getWordPressPikcirApiRoot(siteRoot?: string): string {
  const root = siteRoot ?? getWordPressSiteRoot();
  return root ? `${root}/wp-json/pikcir/v1` : "";
}

export type FlatAuthMeProfilePayload = {
  id: unknown;
  userName: unknown;
  email: string | null;
  displayName: unknown;
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  userDescription: string | null;
  profileImageId: unknown;
  avatarUrls: Record<string, unknown>;
  coverUrls: Record<string, unknown>;
  coverImageUrl: string | null;
};

export async function fetchFlatAuthProfileFromWordPress(
  wordPressSiteRoot: string,
  bearerToken: string,
): Promise<
  | { ok: true; data: FlatAuthMeProfilePayload }
  | { ok: false; status: number; message: string }
> {
  try {
    const { data } = await axios.get(
      `${wordPressSiteRoot}/wp-json/pikcir/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: { _nocache: Date.now() },
      },
    );

    const u = data?.user;

    return {
      ok: true,
      data: {
        id: u?.id,
        userName: u?.userName,
        email: u?.email ?? null,
        displayName: u?.displayName,
        firstName: u?.firstName ?? null,
        lastName: u?.lastName ?? null,
        birthDate: u?.birthDate ?? null,
        userDescription: u?.userDescription ?? null,
        profileImageId: u?.profileImageId ?? null,
        avatarUrls: u?.avatarUrls ?? {},
        coverUrls:
          u?.coverUrls && typeof u.coverUrls === "object" ? u.coverUrls : {},
        coverImageUrl:
          typeof u?.coverImageUrl === "string" ? u.coverImageUrl : null,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Profil bilgisi alinamadi";

      return { ok: false, status: statusCode, message };
    }

    return {
      ok: false,
      status: 500,
      message: "WordPress profil istegi sirasinda beklenmeyen bir hata olustu",
    };
  }
}
