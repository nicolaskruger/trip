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

type Response = {
  origin: {
    latitude: number;
    longitude: number;
  };
  destination: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  duration: string;
  options: [
    {
      id: number;
      name: string;
      description: string;
      vehicle: string;
      review: {
        rating: number;
        comment: string;
      };
      value: number;
    }
  ];
  routeResponse: object;
};

const objComp = {
  origin: {
    latitude: true,
    longitude: true,
  },
  destination: {
    latitude: true,
    longitude: true,
  },
  distance: true,
  duration: true,
};
const getRequest = (): Request => ({
  customer_id: "12345",
  origin: "New York",
  destination: "Los Angeles",
});

const deepValidationTruthy = (data: any, ref: any) => {
  Object.keys(ref).forEach((key) => {
    if (typeof ref[key] === "object") deepValidationTruthy(data[key], ref[key]);
    else expect(data[key]).toBeTruthy();
  });
};

test("empty origin", async ({ request }) => {
  const req = getRequest();
  delete req.origin;
  const res = await request.post(URL, { data: req });
  expect(res.status()).toBe(400);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("INVALID_DATA");
});

test("empty destination", async ({ request }) => {
  const req = getRequest();
  delete req.destination;
  const res = await request.post(URL, { data: req });
  expect(res.status()).toBe(400);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("INVALID_DATA");
});

test("empty customer id", async ({ request }) => {
  const req = getRequest();
  delete req.customer_id;
  const res = await request.post(URL, { data: req });
  expect(res.status()).toBe(400);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("INVALID_DATA");
});

test("empty same origin", async ({ request }) => {
  const req = getRequest();
  req.origin = req.destination;
  const res = await request.post(URL, { data: req });
  expect(res.status()).toBe(400);
  const json: ErrorRes = await res.json();
  expect(json.error_code).toBe("INVALID_DATA");
});

test("susses", async ({ request }) => {
  const req = getRequest();
  const res = await request.post(URL, { data: req });
  expect(res.status()).toBe(200);
  const json: Response = await res.json();

  deepValidationTruthy(json, objComp);
  expect(json.options.length).toBe(3);
  expect(json.routeResponse).toBeTruthy();
});
