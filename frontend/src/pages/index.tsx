import axios, { AxiosError } from "axios";
import { FormEvent, useState } from "react";

const BACKEND_URL = "http://localhost:8080/ride/";

export default function Home() {
  const [customer_id, setCustomer] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [success, setSuccess] = useState("");

  const [errorJ, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const { data } = await axios.post(BACKEND_URL + "estimate", {
        customer_id,
        origin,
        destination,
      });
      setSuccess(JSON.stringify(data));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error);
        setError(JSON.stringify(error.response?.data));
      }
    }
  };

  return (
    <main>
      <h1>trip</h1>
      <form onSubmit={handleSubmit} action="submit" className="flex flex-col">
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
        <button>submit</button>
      </form>
      <p>success {success}</p>
      <p>error {errorJ}</p>
    </main>
  );
}
