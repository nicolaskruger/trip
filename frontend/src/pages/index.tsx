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
          <ul className="px-3 mt-2 space-y-2 mb-3">
            {estimate?.options.map(({ id, name, value, vehicle }) => {
              return (
                <li
                  key={id}
                  className="rounded-xl bg-slate-100 flex justify-between items-center px-3 py-2"
                >
                  <div>
                    <p className="text-slate-950 ">{name}</p>
                    <p className="text-green-600">$ {value}</p>
                    <p className="text-gray-500">vehicle: {vehicle}</p>
                  </div>

                  <button className=" bg-gray-500 h-9 w-32 rounded-lg">
                    select
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
