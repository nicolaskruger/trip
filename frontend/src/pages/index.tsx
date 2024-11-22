import { Maps } from "@/components/maps";
import axios, { AxiosError } from "axios";
import { FormEvent, useState } from "react";

const BACKEND_URL = "http://localhost:8080/ride/";

export type Option = {
  id: number;
  name: string;
  description: string;
  vehicle: string;
  review: {
    rating: number;
    comment: string;
  };
  value: number;
};

export type Estimate = {
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
  options: Option[];
  routeResponse: object;
};

export default function Home() {
  const [customer_id, setCustomer] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [estimate, setEstimate] = useState<Estimate>();

  const [loading, setLoading] = useState(false);

  const [errorJ, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      setLoading(true);
      const { data } = await axios.post(BACKEND_URL + "estimate", {
        customer_id,
        origin,
        destination,
      });
      setLoading(false);
      setEstimate(data);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error);
        setLoading(false);
        setError(JSON.stringify(error.response?.data));
      }
    }
  };

  return (
    <main>
      <h1 className=" pl-3 py-5 text-xl">trip</h1>
      <form
        onSubmit={handleSubmit}
        action="submit"
        className="px-3 flex flex-col space-y-2"
      >
        <label htmlFor="customer_id">customer_id:</label>
        <input
          value={customer_id}
          onChange={(e) => setCustomer(e.target.value)}
          type="text"
          name="customer_id"
          id="customer_id"
          className="text-slate-900"
        />
        <label htmlFor="origin">origin:</label>
        <input
          type="text"
          name="origin"
          id="origin"
          value={origin}
          className="text-slate-900"
          onChange={(e) => setOrigin(e.target.value)}
        />
        <label htmlFor="destination">destination:</label>
        <input
          type="text"
          name="destination"
          id="destination"
          value={destination}
          className="text-slate-900"
          onChange={(e) => setDestination(e.target.value)}
        />
        <Maps {...{ destination, origin }} />
        <button className="bg-pink-700">submit</button>
      </form>
      {loading && <p className="p-3 text-yellow-500">loading...</p>}
      {errorJ && <p className="text-red-700">error {errorJ}</p>}
      {estimate && (
        <>
          <ul>
            {estimate?.options.map(({ id, review, ...driver }) => {
              return (
                <li key={id}>
                  <ul>
                    {(
                      [
                        "name",
                        "description",
                        "vehicle",
                        "value",
                      ] as (keyof typeof driver)[]
                    ).map((key) => (
                      <li key={key}>
                        {key}: {driver[key]}
                      </li>
                    ))}
                    <li>
                      review: <p className="text-purple-500">{review.rating}</p>{" "}
                      {review.comment}
                    </li>
                  </ul>
                  <button>select</button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
