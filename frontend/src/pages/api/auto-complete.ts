// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios, { AxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type Prediction = {
  predictions: { description: string }[];
};

const URL = (input: string) =>
  `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=geocode&key=${
    process.env.GOOGLE_API_KEY || ""
  }`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string[]>
) {
  const { place } = req.query;
  if (typeof place == "string") {
    try {
      const {
        data: { predictions },
      } = await axios.get<Prediction>(URL(place));
      return res
        .status(200)
        .json(predictions.map(({ description }) => description));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response);
        console.log(error.response?.statusText);
      }
      return res.status(404);
    }
  }
  return res.status(404);
}
