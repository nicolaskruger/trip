import { Loading } from "@/components/loading";
import { ResponseError, ShowError } from "@/components/show-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";

const BACKEND_URL = "http://localhost:8080/ride/";

type Ride = {
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
};

type Operation = {
  customer_id: string;
  rides: Ride[];
};

const formatSeconds = (seconds: string) => {
  const milliseconds = Number(seconds.replace("s", "")) * 1000;
  const date = new Date(milliseconds);
  return date.toISOString().substr(11, 8); // Retorna "hh:mm:ss"
};

export default function History() {
  const {
    query: { customer_id },
  } = useRouter();

  const timeout = useRef<NodeJS.Timeout>();

  const [operation, setOperation] = useState<Operation>();

  const [customer, setCustomer] = useState(customer_id);

  const [loading, setLoading] = useState(false);

  const [errorJ, setError] = useState<ResponseError>();

  const [filter, setFilter] = useState<string[]>([]);

  const getOperation = async (customer: string) => {
    try {
      setLoading(true);
      setError(undefined);
      const { data } = await axios.get<Operation>(`${BACKEND_URL}${customer}`);
      setOperation(data);
      setLoading(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error);
        setLoading(false);
        setOperation(undefined);
        setError(error.response?.data);
      }
    }
  };

  useEffect(() => {
    setCustomer(customer_id);
    if (typeof customer_id === "string") getOperation(customer_id);
  }, [customer_id]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    clearTimeout(timeout.current);
    const newCustomer = e.target.value;
    setCustomer(newCustomer);
    setLoading(true);
    timeout.current = setTimeout(getOperation, 500, newCustomer);
  };

  return (
    <main className="px-3 sm:px-0 sm:mx-auto sm:w-[600px] md:w-[700px] lg:w-[900px] xl:w-[1000px]">
      <h1 className="py-5 text-xl">History</h1>
      <div className="flex flex-col space-y-3 mb-3">
        <Label htmlFor="customer_id">customer</Label>
        <Input
          type="text"
          name="customer_id"
          id="customer_id"
          value={customer}
          onChange={handleChange}
        />
      </div>
      <ShowError className="mb-2" error={errorJ} />
      {loading && <Loading loading={loading} />}
      {operation && operation.rides && (
        <>
          <ul className="flex space-x-2 mb-2">
            {operation.rides
              .reduce(
                (acc, curr) =>
                  acc.includes(curr.driver.name)
                    ? acc
                    : [...acc, curr.driver.name],
                [] as string[]
              )
              .map((name) => (
                <li key={name}>
                  <Button
                    variant={"ghost"}
                    className="flex items-center space-x-2"
                    onClick={() => {
                      if (filter.includes(name))
                        setFilter(filter.filter((val) => val !== name));
                      else setFilter([...filter, name]);
                    }}
                  >
                    <Checkbox checked={filter.includes(name)} />
                    <Label>{name}</Label>
                  </Button>
                </li>
              ))}
            <Button variant={"secondary"} onClick={() => setFilter([])}>
              clear filter
            </Button>
          </ul>
          <ul className="flex flex-col space-y-2">
            {operation.rides
              .sort((a, b) => b.date.localeCompare(a.date))
              .filter(
                ({ driver: { name } }) =>
                  filter.length == 0 || filter.includes(name)
              )
              .map(
                ({
                  id,
                  driver: { name },
                  date,
                  origin,
                  destination,
                  distance,
                  duration,
                  value,
                }) => (
                  <li
                    className="bg-slate-50 rounded-lg p-3 space-y-1 border"
                    key={id}
                  >
                    <div className="flex justify-between">
                      <p className="text-slate-900">{name}</p>
                      <p className="text-slate-900">
                        {new Date(date).toLocaleDateString()}{" "}
                        {new Date(date).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-slate-900">
                          {(distance / 1000).toFixed(2)} km
                        </p>
                        <p className="text-slate-900">
                          {formatSeconds(duration)}
                        </p>
                      </div>
                      <p className="text-green-700">$ {value.toFixed()}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-slate-900">{origin}</p>
                      <div className="px-4 grow flex items-center">
                        <div className="w-2 h-2 bg-slate-200 rounded-full " />
                        <div className="h-0.5 grow bg-slate-200 " />
                        <div className="w-2 h-2 bg-slate-200 rounded-full " />
                      </div>
                      <p className="text-slate-900">{destination}</p>
                    </div>
                  </li>
                )
              )}
          </ul>
        </>
      )}
    </main>
  );
}
