import { useEffect, useRef, useState } from "react";
import { getGeocode } from "use-places-autocomplete";

const DEBOUNCE = 300;

export const useSuggestions = (value: string, ready: boolean) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (ready) {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(async () => {
        try {
          const results = await getGeocode({ address: value });
          setSuggestions(
            results.map(({ formatted_address }) => formatted_address)
          );
        } catch (error) {
          setSuggestions([]);
        }
      }, DEBOUNCE);
    }
  }, [value, ready]);

  return [
    suggestions,
    () => {
      setSuggestions([]);
    },
  ] as const;
};
