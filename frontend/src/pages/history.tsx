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

export default function History() {
  const {
    query: { customer_id },
  } = useRouter();

  const timeout = useRef<NodeJS.Timeout>();

  const [operation, setOperation] = useState<Operation>();

  const [customer, setCustomer] = useState(customer_id);

  const [loading, setLoading] = useState(false);

  const [errorJ, setError] = useState("");

  const [filter, setFilter] = useState<string[]>([]);

  const getOperation = async (customer: string) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get<Operation>(`${BACKEND_URL}${customer}`);
      setOperation(data);
      setLoading(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error);
        setLoading(false);
        setOperation(undefined);
        setError(JSON.stringify(error.response?.data));
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
    <main>
      <h1>History</h1>
      <label htmlFor="customer_id">customer_id</label>
      <input
        type="text"
        name="customer_id"
        id="customer_id"
        value={customer}
        className="text-slate-900"
        onChange={handleChange}
      />
      {loading && <p className="text-yellow-700">loading...</p>}
      {errorJ && <p className="text-red-600">{errorJ}</p>}
      {operation && operation.rides && (
        <>
          <ul>
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
                  <button
                    onClick={() => {
                      if (filter.includes(name))
                        setFilter(filter.filter((val) => val !== name));
                      else setFilter([...filter, name]);
                    }}
                  >
                    <p>{name}</p>
                    <div
                      className="w-3 bg-slate-50 h-3 rounded-sm data-[active=true]:bg-red-500"
                      data-active={filter.includes(name)}
                    ></div>
                  </button>
                </li>
              ))}
            <button onClick={() => setFilter([])}>clear filter</button>
          </ul>
          <ul>
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
                  <li key={id}>
                    <p>{name}</p>
                    <p>{date}</p>
                    <p>origin: {origin}</p>
                    <p>destination: {destination}</p>
                    <p>distance: {distance}</p>
                    <p>duration: {duration}</p>
                    <p>value: {value}</p>
                  </li>
                )
              )}
          </ul>
        </>
      )}
    </main>
  );
}
