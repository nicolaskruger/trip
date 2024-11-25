import { InputSelector } from "@/components/input-selector";
import { Loading } from "@/components/loading";
import { Maps } from "@/components/maps";
import { ResponseError, ShowError } from "@/components/show-error";
import { Sizes, useMediaQuery } from "@/hooks/use_media_query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { FormEvent, ReactNode, useCallback, useState } from "react";

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

type Dictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
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

  const query = useMediaQuery();

  const renderForm = () => {
    const xs = () => (
      <form
        onSubmit={handleSubmit}
        action="submit"
        className=" flex flex-col space-y-2"
      >
        <label htmlFor="customer_id">customer</label>
        <input
          value={customer_id}
          onChange={(e) => setCustomer(e.target.value)}
          type="text"
          name="customer_id"
          id="customer_id"
          className="text-slate-900 h-10 text-lg rounded-lg pl-2"
        />
        <label htmlFor="origin">origin:</label>
        <InputSelector
          className="text-slate-900 h-10 text-lg rounded-lg pl-2 outline-none"
          value={origin}
          setValue={setOrigin}
        />

        <label htmlFor="destination">destination:</label>
        <InputSelector
          className="text-slate-900 h-10 text-lg rounded-lg pl-2"
          value={destination}
          setValue={setDestination}
        />
        <Maps
          className="h-64 rounded-lg overflow-hidden"
          {...{ destination, origin }}
        />

        <button className="bg-pink-700 h-10 rounded-lg">submit</button>
      </form>
    );

    const md = () => (
      <form
        onSubmit={handleSubmit}
        action="submit"
        className=" flex  space-x-2"
      >
        <div className="flex flex-col w-5/12  h-96 justify-between">
          <div className="flex flex-col space-y-2">
            <label htmlFor="customer_id">customer_id:</label>
            <input
              value={customer_id}
              onChange={(e) => setCustomer(e.target.value)}
              type="text"
              name="customer_id"
              id="customer_id"
              className="text-slate-900 h-10 text-lg rounded-lg pl-2"
            />
            <label htmlFor="origin">origin:</label>
            <InputSelector
              className="text-slate-900 h-10 text-lg rounded-lg pl-2 outline-none"
              value={origin}
              setValue={setOrigin}
            />

            <label htmlFor="destination">destination:</label>
            <InputSelector
              className="text-slate-900 h-10 text-lg rounded-lg pl-2 outline-none"
              value={destination}
              setValue={setDestination}
            />
          </div>
          <div className="flex flex-col">
            <Loading loading={loading} />
            <ShowError error={errorJ} />
            <button className="bg-pink-700 h-10 rounded-lg mt-2">submit</button>
          </div>
        </div>
        <Maps
          className=" flex grow  rounded-lg overflow-hidden"
          {...{ destination, origin }}
        />
      </form>
    );

    const dict: Dictionary<Sizes, () => ReactNode> = {
      xs: xs,
      sm: xs,
      md: xs,
      lg: md,
      xl: md,
      "2xl": md,
    };
    return dict[query]();
  };

  return (
    <main className="px-3 sm:px-0 sm:mx-auto sm:w-[600px] md:w-[700px] lg:w-[1000px]">
      <h1 className=" py-5 text-xl">trip</h1>
      {renderForm()}
      <div
        data-show={loading}
        className="mt-3 data-[show=false]:hidden lg:hidden"
      >
        <Loading loading={loading} />
      </div>
      <ShowError className="mt-3 lg:hidden" error={errorJ} />
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
                  className="rounded-xl bg-slate-100 flex justify-between items-center  p-2"
                >
                  <div>
                    <p className="text-slate-950 ">{name}</p>
                    <p className="text-green-600">$ {value.toFixed(2)}</p>
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
