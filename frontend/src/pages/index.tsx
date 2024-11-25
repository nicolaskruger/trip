import { InputSelector } from "@/components/input-selector";
import { Maps } from "@/components/maps";
import { ResponseError, ShowError } from "@/components/show-error";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { FormEvent, useCallback, useState } from "react";

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

type Confirm = {
  customer_id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  driver: {
    id: number;
    name: string;
  };
  value: number;
};

export default function Home() {
  const [customer_id, setCustomer] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [estimate, setEstimate] = useState<Estimate>();

  const [loading, setLoading] = useState(false);

  const [errorJ, setError] = useState<ResponseError>();

  const { push } = useRouter();

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
        setError(error.response?.data);
      }
    }
  };

  const confirm = useCallback(
    async (driver: Option) => {
      const confirmDto: Confirm = {
        customer_id,
        destination,
        origin,
        driver,
        value: driver.value,
        distance: estimate!.distance,
        duration: estimate!.duration,
      };

      try {
        setLoading(true);
        await axios.patch(BACKEND_URL + "confirm", confirmDto);
        setLoading(false);
        push(`/history?customer_id=${customer_id}`);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log(error);
          setLoading(false);
          setError(error.response?.data);
        }
      }
    },
    [origin, destination, estimate, customer_id, push]
  );

  return (
    <main className="px-3">
      <h1 className=" py-5 text-xl">trip</h1>
      <form
        onSubmit={handleSubmit}
        action="submit"
        className=" flex flex-col space-y-2"
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
        <InputSelector value={origin} setValue={setOrigin} />

        <label htmlFor="destination">destination:</label>
        <InputSelector value={destination} setValue={setDestination} />
        <Maps {...{ destination, origin }} />

        <button className="bg-pink-700">submit</button>
      </form>
      {loading && <p className="p-3 text-yellow-500">loading...</p>}
      <ShowError className="mt-3" error={errorJ} />
      {estimate && (
        <>
          <ul className=" mt-2 space-y-2 mb-3">
            {estimate?.options.map((driver) => {
              const {
                id,
                name,
                value,
                vehicle,
                review: { rating },
              } = driver;
              return (
                <li
                  key={id}
                  className="rounded-xl bg-slate-100 flex justify-between items-center  py-2"
                >
                  <div>
                    <p className="text-slate-950 ">{name}</p>
                    <p className="text-green-600">$ {value}</p>
                    <p className="text-gray-500">vehicle: {vehicle}</p>
                    <p className="text-orange-600">{"☆".repeat(rating)}</p>
                  </div>

                  <button
                    className=" bg-gray-500 h-9 w-32 rounded-lg"
                    onClick={() => confirm(driver)}
                  >
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
