import { useSuggestions } from "@/hooks/use_suggestions";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export const InputSelector = ({
  value,
  setValue,
}: {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}) => {
  const [suggestions] = useSuggestions(value);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    setCursor(0);
  }, [suggestions]);

  return (
    <div className="flex flex-col">
      <input
        autoComplete="off"
        type="text"
        name="origin"
        id="origin"
        value={value}
        onKeyDown={(e) => {
          const sw = {
            ArrowDown: () =>
              setCursor((cursor) =>
                suggestions.length - 1 === cursor ? cursor : cursor + 1
              ),
            ArrowUp: () =>
              setCursor((cursor) => (0 === cursor ? cursor : cursor - 1)),
            Enter: () => setValue(suggestions[cursor]),
            default: () => {},
          };
          sw[
            Object.keys(sw).includes(e.key)
              ? (e.key as keyof typeof sw)
              : "default"
          ]();
        }}
        className="text-slate-900"
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="relative ">
        <div className="absolute w-full z-10">
          {suggestions.map((suggestion, i) => (
            <button
              key={suggestion}
              data-cursor={i === cursor}
              className="data-[cursor=true]:bg-slate-400 py-0.5 text-left bg-slate-300 text-slate-900 invisible data-[show=false]:hidden data-[show=true]:visible hover:bg-slate-400 w-full"
              data-show={!!suggestion && value !== suggestions[0]}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setValue(suggestion);
              }}
            >
              {suggestion || "no suggestions"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
