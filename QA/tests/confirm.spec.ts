import test, { expect } from "@playwright/test";

const URL = "http://localhost:8080/ride/confirm";

type Success = {
  success: true;
};

type ErrorRes = {
  error_code: "INVALID_DATA";
  error_description: string;
};

type Request = {
  customer_id?: string;
  origin?: string;
  destination?: string;
  distance: number;
  duration: string;
  driver?: {
    id: number;
    name: string;
  };
  value: number;
};

const getRequest = (): Request => ({
  customer_id: "12345",
  origin: "New York",
  destination: "Los Angeles",
  distance: 10000,
  duration: "5h 30m",
  driver: {
    id: 1,
    name: "Homer Simpson",
  },
  value: 200.5,
});

test("empty origin", async ({ request }) => {
  const req = getRequest();
  delete req.origin;
  const res = await request.patch(URL, { data: req });
  expect(res.status()).toBe(400);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("INVALID_DATA");
});

test("empty destination", async ({ request }) => {
  const req = getRequest();
  delete req.destination;
  const res = await request.patch(URL, { data: req });
  expect(res.status()).toBe(400);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("INVALID_DATA");
});

test("empty customer_id", async ({ request }) => {
  const req = getRequest();
  delete req.customer_id;
  const res = await request.patch(URL, { data: req });
  expect(res.status()).toBe(400);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("INVALID_DATA");
});

test("empty same origin", async ({ request }) => {
  const req = getRequest();
  req.origin = req.destination;
  const res = await request.patch(URL, { data: req });
  expect(res.status()).toBe(400);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("INVALID_DATA");
});

test("empty no driver", async ({ request }) => {
  const req = getRequest();
  delete req.driver;
  const res = await request.patch(URL, { data: req });
  expect(res.status()).toBe(404);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("DRIVER_NOT_FOUND");
});

test("empty invalid driver", async ({ request }) => {
  const req = getRequest();
  if (req.driver) req.driver.id = Infinity;
  const res = await request.patch(URL, { data: req });
  expect(res.status()).toBe(404);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("DRIVER_NOT_FOUND");
});
test("empty invalid distance", async ({ request }) => {
  const req = getRequest();
  req.distance = 200;
  const res = await request.patch(URL, { data: req });
  expect(res.status()).toBe(406);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("INVALID_DISTANCE");
});

test("success", async ({ request }) => {
  const req = getRequest();
  const res = await request.patch(URL, { data: req });
  expect(res.status()).toBe(200);
  const json: Success = await res.json();
  expect(json.success).toBe(true);
});
