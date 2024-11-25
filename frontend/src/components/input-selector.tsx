import { useSuggestions } from "@/hooks/use_suggestions";
import {
  HTMLProps,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useRef,
} from "react";

export const InputSelector = ({
  value,
  setValue,
  ...props
}: HTMLProps<HTMLInputElement> & {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}) => {
  const [suggestions] = useSuggestions(value);
  const [cursor, setCursor] = useState(0);

  const buttons = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    setCursor(0);
  }, [suggestions]);

  return (
    <div className="flex flex-col">
      <input
        {...props}
        autoComplete="off"
        type="text"
        name="text"
        id="text"
        value={value}
        onKeyDown={(e) => {
          e.stopPropagation();
          const sw = {
            ArrowDown: () =>
              setCursor((cursor) =>
                suggestions.length - 1 === cursor ? cursor : cursor + 1
              ),
            ArrowUp: () =>
              setCursor((cursor) => (0 === cursor ? cursor : cursor - 1)),
            Enter: () => {
              buttons.current[cursor].click();
            },
            default: () => {},
          };
          sw[
            Object.keys(sw).includes(e.key)
              ? (e.key as keyof typeof sw)
              : "default"
          ]();
        }}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <div className="relative ">
        <div className="absolute w-full z-10">
          {suggestions.map((suggestion, i) => (
            <button
              ref={(el) => {
                if (el) buttons.current[i] = el;
              }}
              key={suggestion}
              data-cursor={i === cursor}
              className="min-h-10 text-lg data-[cursor=true]:bg-slate-400 py-0.5 text-left bg-slate-300 text-slate-900 invisible data-[show=false]:hidden data-[show=true]:visible hover:bg-slate-400 w-full"
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
