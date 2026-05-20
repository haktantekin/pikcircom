import axios from "axios";

function responseBodyAsString(data: unknown): string {
  if (typeof data === "string") {
    return data;
  }
  if (Buffer.isBuffer(data)) {
    return data.toString("utf8");
  }
  return "";
}

export function isWordPressUnreachableResponse(
  status: number,
  data: unknown,
): boolean {
  if (status !== 404 && status !== 502 && status !== 503) {
    return false;
  }
  const body = responseBodyAsString(data);
  if (!body) {
    return false;
  }
  return (
    body.includes("DEPLOYMENT_NOT_FOUND") ||
    body.includes("<!DOCTYPE") ||
    body.includes("<html")
  );
}

export function mapWordPressProxyError(
  error: unknown,
  fallbackMessage: string,
): { status: number; message: string; code?: string } {
  if (!axios.isAxiosError(error)) {
    return { status: 500, message: fallbackMessage };
  }

  const statusCode = error.response?.status ?? 500;
  const data = error.response?.data;

  if (isWordPressUnreachableResponse(statusCode, data)) {
    return {
      status: 502,
      code: "wordpress_unreachable",
      message:
        "CMS (WORDPRESS_API_URL) yanlis veya erisilemiyor. WordPress REST API adresini ve cms alt alan adinin Vercel yerine WP sunucusuna isaret ettigini kontrol edin.",
    };
  }

  if (statusCode === 404) {
    return {
      status: 502,
      code: "wordpress_route_missing",
      message:
        "WordPress auth endpoint bulunamadi (/wp-json/pikcir/v1/auth/login). Pikcir temasinin CMS uzerinde aktif oldugunu dogrulayin.",
    };
  }

  const message =
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: string }).message === "string"
      ? (data as { message: string }).message
      : responseBodyAsString(data) || fallbackMessage;

  return { status: statusCode, message };
}
