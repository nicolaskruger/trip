const URL = "http://localhost:8080";

import { expect, test } from "@playwright/test";

test("Hello World!", async ({ request }) => {
  const response = await request.get(URL);

  expect(response.status()).toBe(200);

  const hello = await response.text();

  expect(hello).toBe("Hello World!");
});
