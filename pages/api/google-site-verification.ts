import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send("google-site-verification: google-site-verification=SVoB2fTtMXd1btaIhmknHDqVF-q0lmVQ1Ba6NZte2fo.txt");
}
