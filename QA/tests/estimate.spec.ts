const URL = "http://localhost:8080/ride/estimate";

import { expect, test } from "@playwright/test";

type ErrorRes = {
  error_code: "INVALID_DATA";
  error_description: string;
};

type Request = {
  customer_id?: string;
  origin?: string;
  destination?: string;
};

const getRequest = (): Request => ({
  customer_id: "12345",
  origin: "New York",
  destination: "Los Angeles",
});

test("empty origin", async ({ request }) => {
  const req = getRequest();
  delete req.origin;
  const res = await request.post(URL, { data: req });
  expect(res.status()).toBe(400);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("INVALID_DATA");
});
