import { InputSelector } from "@/components/input-selector";
import { Loading } from "@/components/loading";
import { Maps } from "@/components/maps";
import { ResponseError, ShowError } from "@/components/show-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sizes, useMediaQuery } from "@/hooks/use_media_query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { FormEvent, MouseEvent, ReactNode, useCallback, useState } from "react";
import { ArrowDownUpIcon, ArrowRight } from "lucide-react";

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

  const swapOriginDestination = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDestination(origin);
    setOrigin(destination);
  };

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
        className=" flex flex-col space-y-4"
      >
        <Label htmlFor="customer_id">customer</Label>
        <Input
          value={customer_id}
          onChange={(e) => setCustomer(e.target.value)}
          type="text"
          name="customer_id"
          id="customer_id"
        />
        <div className="flex justify-center items-center w-full space-x-2">
          <div className="w-full flex flex-col space-y-4">
            <InputSelector
              placeholder="origin"
              value={origin}
              setValue={setOrigin}
            />

            <InputSelector
              placeholder="destination"
              value={destination}
              setValue={setDestination}
            />
          </div>
          <Button variant={"default"} onClick={(e) => swapOriginDestination(e)}>
            <ArrowDownUpIcon />
          </Button>
        </div>
        <Maps
          className="h-64 rounded-lg overflow-hidden"
          {...{ destination, origin }}
        />

        <Button>submit</Button>
      </form>
    );

    const md = () => (
      <form
        onSubmit={handleSubmit}
        action="submit"
        className=" flex  space-x-2"
      >
        <div className="flex flex-col w-5/12  h-[450px] justify-between ">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="customer_id">customer</Label>
            <Input
              value={customer_id}
              onChange={(e) => setCustomer(e.target.value)}
              type="text"
              name="customer_id"
              id="customer_id"
            />
            <div className="flex justify-center items-center w-full space-x-2">
              <div className="w-full flex flex-col space-y-4">
                <InputSelector
                  placeholder="origin"
                  value={origin}
                  setValue={setOrigin}
                />

                <InputSelector
                  placeholder="destination"
                  value={destination}
                  setValue={setDestination}
                />
              </div>
              <Button variant={"default"} onClick={swapOriginDestination}>
                <ArrowDownUpIcon />
              </Button>
            </div>
          </div>
          <div className="flex flex-col">
            <Loading loading={loading} />
            <ShowError time_out error={errorJ} />
            <Button className=" mt-2">submit</Button>
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
      lg: xs,
      xl: md,
      "2xl": md,
    };
    return dict[query]();
  };

  return (
    <main className=" px-3 sm:px-0 sm:mx-auto sm:w-[600px] md:w-[700px] lg:w-[900px] xl:w-[1000px]">
      <h1 className=" py-5 text-xl">trip</h1>
      {renderForm()}
      <div
        data-show={loading}
        className="mt-3 data-[show=false]:hidden xl:hidden"
      >
        <Loading loading={loading} />
      </div>
      <ShowError className="mt-3 xl:hidden" time_out error={errorJ} />
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
                  className="rounded-xl bg-slate-100 flex justify-between items-center  p-2 border"
                >
                  <div>
                    <p className="text-slate-950 ">{name}</p>
                    <p className="text-green-600">$ {value.toFixed(2)}</p>
                    <p className="text-gray-500">vehicle: {vehicle}</p>
                    <p className="text-orange-600">{"☆".repeat(rating)}</p>
                  </div>

                  <Button
                    className="mr-6"
                    size={"icon"}
                    onClick={() => confirm(driver)}
                  >
                    <ArrowRight />
                  </Button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
