import { Maps } from "@/components/maps";
import { useSuggestions } from "@/hooks/use_suggestions";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { FormEvent, useCallback, useEffect, useState } from "react";

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

  const [errorJ, setError] = useState("");

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
        setError(JSON.stringify(error.response?.data));
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
          setError(JSON.stringify(error.response?.data));
        }
      }
    },
    [origin, destination, estimate, customer_id]
  );
  const [maps, setMaps] = useState(false);

  const [originsSuggestion, clearOriginSuggestions] = useSuggestions(origin);

  useEffect(() => {
    setCursor(0);
  }, [originsSuggestion]);

  const [cursor, setCursor] = useState(0);

  const [[destinationSuggestion], clearDestinationSuggestions] = useSuggestions(
    destination,
    maps
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
        <div className="flex flex-col">
          <input
            onFocus={() => clearDestinationSuggestions()}
            type="text"
            name="origin"
            id="origin"
            value={origin}
            onKeyDown={(e) => {
              const sw = {
                ArrowDown: () =>
                  setCursor((cursor) =>
                    originsSuggestion.length - 1 === cursor
                      ? cursor
                      : cursor + 1
                  ),
                ArrowUp: () =>
                  setCursor((cursor) => (0 === cursor ? cursor : cursor - 1)),
                Enter: () => setOrigin(originsSuggestion[cursor]),
                default: () => {},
              };
              sw[Object.keys(sw).includes(e.key) ? e.key : "default"]();
            }}
            className="text-slate-900"
            onChange={(e) => setOrigin(e.target.value)}
          />
          <div className="relative ">
            <div className="absolute w-full z-10">
              {originsSuggestion.map((suggestion, i) => (
                <button
                  key={suggestion}
                  data-cursor={i === cursor}
                  className="data-[cursor=true]:bg-slate-400 py-0.5 text-left bg-slate-300 text-slate-900 invisible data-[show=true]:visible hover:bg-slate-400 w-full"
                  data-show={!!suggestion && origin !== originsSuggestion[0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOrigin(suggestion);
                  }}
                >
                  {suggestion || "no suggestions"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label htmlFor="destination">destination:</label>
        <div className="flex flex-col">
          <input
            onFocus={() => clearOriginSuggestions()}
            type="text"
            name="destination"
            id="destination"
            value={destination}
            className="text-slate-900"
            onChange={(e) => setDestination(e.target.value)}
          />
          <button
            className="py-1 text-left bg-slate-900 invisible data-[show=true]:visible hover:bg-slate-800"
            data-show={
              !!destinationSuggestion && destination !== destinationSuggestion
            }
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setDestination(destinationSuggestion);
            }}
          >
            {destinationSuggestion || "no suggestions"}
          </button>
        </div>
        <Maps onLoad={() => setMaps(true)} {...{ destination, origin }} />

        <button className="bg-pink-700">submit</button>
      </form>
      {loading && <p className="p-3 text-yellow-500">loading...</p>}
      {errorJ && <p className="text-red-700">error {errorJ}</p>}
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
