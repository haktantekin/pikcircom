/**
 * WordPress contract (implement in Pikcir REST plugin — not in this repo):
 *
 * Profil güncelleme WordPress'e **POST** ile gider (REST'te PATCH az kayıtlıdır).
 *
 * Varsayılan deneme sırası (404/405 alınırsa sıradaki denenir):
 * 1. POST .../wp-json/pikcir/v1/auth/profile  (GET /auth/me ile aynı namespace)
 * 2. POST .../wp-json/pikcir/v1/profile
 *
 * Tek adres kullanmak için ortam değişkeni (site köküne göre yol veya tam URL):
 *   WORDPRESS_PROFILE_POST_PATH=pikcir/v1/auth/profile
 * veya tam: https://cms.example/wp-json/pikcir/v1/auth/profile
 *
 * JSON gövde (alanlar opsiyonel): displayName, firstName, lastName, userDescription,
 * phoneNumber, birthDate, email, password, profileImageData, coverImageData (data URL).
 *
 * READ: kapak için user.coverUrls veya coverImageUrl — GET auth/me ve GET profile/{username}.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { handleProfileMe } from "./lib/profile-me-handler";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return handleProfileMe(req, res);
}
