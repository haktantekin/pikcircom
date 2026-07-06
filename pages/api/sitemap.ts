import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const SITE_URL = "https://pikcir.com";

const getWordPressBaseUrl = () => {
  const baseUrl =
    process.env.WORDPRESS_API_URL ?? process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  return baseUrl?.replace(/\/$/, "") ?? "";
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }

  const wordPressBaseUrl = getWordPressBaseUrl();

  let posts: Array<{ id: string; userName: string; modified: string }> = [];
  let users: Array<{ userName: string; registered: string }> = [];

  if (wordPressBaseUrl) {
    try {
      const { data } = await axios.get(
        `${wordPressBaseUrl}/wp-json/pikcir/v1/sitemap`,
        { timeout: 15000 },
      );
      posts = Array.isArray(data?.posts) ? data.posts : [];
      users = Array.isArray(data?.users) ? data.users : [];
    } catch {
      // WP unreachable — return static pages only
    }
  }

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/explore", priority: "0.9", changefreq: "hourly" },
    { loc: "/login", priority: "0.3", changefreq: "monthly" },
    { loc: "/register", priority: "0.3", changefreq: "monthly" },
    { loc: "/lists", priority: "0.7", changefreq: "daily" },
    { loc: "/search", priority: "0.5", changefreq: "daily" },
    { loc: "/tags", priority: "0.6", changefreq: "daily" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  for (const user of users) {
    xml += `
  <url>
    <loc>${SITE_URL}/${escapeXml(encodeURIComponent(user.userName))}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }

  for (const post of posts) {
    const lastmod = post.modified || undefined;
    xml += `
  <url>
    <loc>${SITE_URL}/${escapeXml(encodeURIComponent(post.userName))}/posts/${escapeXml(encodeURIComponent(post.id))}</loc>${lastmod ? `
    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");
  res.setHeader("CDN-Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");
  return res.status(200).send(xml);
}
