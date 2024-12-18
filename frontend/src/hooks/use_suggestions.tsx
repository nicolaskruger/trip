import axios, { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";

const DEBOUNCE = 300;

export const useSuggestions = (value: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(async () => {
      try {
        console.log({ value });
        const { data } = await axios.get(`/api/auto-complete?place=${value}`);
        setSuggestions(data);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log(error.toJSON());
        }
        setSuggestions([]);
      }
    }, DEBOUNCE);
  }, [value]);

  return [
    suggestions,
    () => {
      setSuggestions([]);
    },
  ] as const;
};
