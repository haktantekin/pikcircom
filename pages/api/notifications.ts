import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  AUTH_TOKEN_COOKIE_NAME,
  getWordPressSiteRoot,
} from "@/src/server/wp-auth-me-profile";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

function normalizeNotificationsPatchBody(
  req: NextApiRequest,
): Record<string, unknown> {
  const raw = req.body;

  if (raw === null || raw === undefined) {
    return {};
  }

  if (Buffer.isBuffer(raw)) {
    try {
      const parsed: unknown = JSON.parse(raw.toString("utf8"));
      return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }

  return {};
}

function expandNotificationMutateBody(
  patchBody: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...patchBody };

  if (patchBody.markAllRead === true) {
    out.mark_all_read = true;
  }

  const rawIds = patchBody.ids;
  if (Array.isArray(rawIds) && rawIds.length > 0) {
    const asStrings = rawIds.map((x) => String(x));
    out.ids = asStrings;
    out.notificationIds = asStrings;
    out.notification_ids = asStrings;
    if (asStrings.length === 1) {
      const only = asStrings[0];
      out.id = only;
      out.notificationId = only;
      out.notification_id = only;
    }
  }

  return out;
}

async function forwardNotificationMutationToWordPress(
  mutateUrl: string,
  patchBody: Record<string, unknown>,
  headers: Record<string, string>,
) {
  const wpBody = expandNotificationMutateBody(patchBody);
  try {
    return await axios.patch(mutateUrl, wpBody, { headers });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const code = error.response?.status;
      if (code === 405 || code === 501) {
        return await axios.post(mutateUrl, wpBody, { headers });
      }
    }
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET" && req.method !== "PATCH" && req.method !== "POST") {
    res.setHeader("Allow", ["GET", "PATCH", "POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressSiteRoot = getWordPressSiteRoot();
  const authToken = req.cookies[AUTH_TOKEN_COOKIE_NAME];

  if (!wordPressSiteRoot) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  if (!authToken) {
    return res.status(401).json({
      message: "Yetkilendirme bilgisi bulunamadi",
    });
  }

  const baseUrl = `${wordPressSiteRoot}/wp-json/pikcir/v1/auth/notifications`;

  try {
    if (req.method === "GET") {
      const limitRaw = req.query.limit;
      const limit =
        typeof limitRaw === "string" && /^\d+$/.test(limitRaw)
          ? parseInt(limitRaw, 10)
          : 50;
      const clamped = Math.min(100, Math.max(1, limit));

      const { data, status } = await axios.get(baseUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: {
          limit: clamped,
          _nocache: Date.now(),
        },
      });

      res.setHeader("Cache-Control", "private, no-store, max-age=0");
      return res.status(status).json(data);
    }

    const patchBody = normalizeNotificationsPatchBody(req);

    const qOut = new URLSearchParams();

    if (patchBody.markAllRead === true) {
      qOut.set("markAllRead", "1");
      qOut.set("mark_all_read", "1");
    }

    const mutateSuffix = qOut.toString().length > 0 ? `?${qOut.toString()}` : "";

    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const mutateUrl = `${baseUrl}${mutateSuffix}`;

    const { data, status } = await forwardNotificationMutationToWordPress(
      mutateUrl,
      patchBody,
      headers,
    );

    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    return res.status(status).json(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return res.status(502).json({
          message:
            "WordPress API'ye baglanilamadi. WORDPRESS_API_URL ve WP sunucusunu kontrol edin.",
        });
      }
      const statusCode = error.response.status;
      const body = error.response.data as { message?: string };
      const message =
        typeof body?.message === "string"
          ? body.message
          : error.message ?? "Bildirim istegi basarisiz";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "Bildirim sirasinda beklenmeyen bir hata olustu",
    });
  }
}
