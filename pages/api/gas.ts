// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const gasInfo = await fetch("https://blocknative-api.herokuapp.com/data");
  const { estimatedPrices } = await gasInfo.json();

  res.status(200).json(estimatedPrices[0]);
}
