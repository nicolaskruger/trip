import { expect, test } from "@playwright/test";

const URL_GET = (customer_id: string, driver_id?: string) =>
  `http://localhost:8080/ride/${customer_id}?${
    driver_id && `driver_id=${driver_id}`
  }`;

const URL_PATCH = "http://localhost:8080/ride/confirm";

type ErrorRes = {
  error_code: "INVALID_DATA";
  error_description: string;
};

type ConfirmReq = {
  customer_id: string;
  origin: string;
  destination?: string;
  distance: number;
  duration: string;
  driver: {
    id: number;
    name: string;
  };
  value: number;
};

type Response = {
  customer_id: string;
  rides: {
    id: number;
    date: string;
    origin: string;
    destination: string;
    distance: number;
    duration: string;
    driver: {
      id: number;
      name: string;
    };
    value: number;
  }[];
};

const getConfirmReq = (): ConfirmReq => ({
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

test.describe("get rides", () => {
  test.beforeAll(async ({ request }) => {
    const homer = getConfirmReq();
    const dom = getConfirmReq();
    dom.driver.id = 2;
    dom.driver.name = "Dominic Toretto";

    const promises = [homer, dom].map((data) =>
      request.patch(URL_PATCH, { data })
    );

    await Promise.all(promises);
  });
  test("invalid driver", async ({ request }) => {
    const response = await request.get(URL_GET("12345", "4"));

    expect(response.status()).toBe(400);

    const json: ErrorRes = await response.json();

    expect(json.error_code).toBe("INVALID_DRIVER");
  });

  test("no rides found", async ({ request }) => {
    const response = await request.get(URL_GET("12345", "3"));

    expect(response.status()).toBe(404);

    const json: ErrorRes = await response.json();

    expect(json.error_code).toBe("NO_RIDES_FOUND");
  });

  test("all rides", async ({ request }) => {
    const response = await request.get(URL_GET("12345"));

    expect(response.status()).toBe(200);

    const json: Response = await response.json();

    expect(json.rides.length).toBeGreaterThanOrEqual(2);
  });

  test("dom rides", async ({ request }) => {
    const response = await request.get(URL_GET("12345", "2"));

    expect(response.status()).toBe(200);

    const json: Response = await response.json();

    json.rides.forEach(({ driver: { id } }) => {
      expect(id).toBe(2);
    });

    expect(json.rides.length).toBeGreaterThanOrEqual(1);
  });
});
