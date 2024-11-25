import { HTMLProps, useEffect, useRef, useState } from "react";

export type ResponseError = {
  error_code:
    | "INVALID_DATA"
    | "DRIVER_NOT_FOUND"
    | "INVALID_DISTANCE"
    | "INVALID_DRIVER"
    | "NO_RIDES_FOUND";
  error_description: string;
};

const ERROR = {
  INVALID_DATA: `Something went wrong :( maybe something related with:`,
  DRIVER_NOT_FOUND: "Something went wrong :( driver not found:",
  INVALID_DISTANCE: "Something went wrong :( invalid distance:",
  INVALID_DRIVER: "Something went wrong :( invalid driver:",
  NO_RIDES_FOUND: "Something went wrong :( no rides found:",
};

export const ShowError = ({
  error,
  ...props
}: {
  error?: ResponseError;
} & HTMLProps<HTMLDivElement>) => {
  const [e, setE] = useState<ResponseError>();

  const timeout = useRef<NodeJS.Timeout>();

  const [count, setCount] = useState(5);

  const stopCounter = () => {
    setE(undefined);
    clearTimeout(timeout.current);
  };

  useEffect(() => {
    if (count <= 0) {
      setE(undefined);
      return;
    }
  }, [count]);

  const startCounter = () => {
    setCount(5);
    const dec = () => {
      setCount((v) => --v);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(dec, 1000);
    };
    timeout.current = setTimeout(dec, 1000);
  };

  useEffect(() => {
    setE(error);
    if (error) startCounter();
  }, [error]);

  return (
    e && (
      <div
        {...props}
        className={`${props.className} rounded-xl p-3 bg-red-50 border-red-500 border flex flex-col space-y-2`}
      >
        <div className=" flex justify-between rounded-xl items-center space-x-2">
          <h1 className="text-red-500 ">
            {ERROR[e.error_code] || "Ops.."}{" "}
            <span className="p-1 font-bold">{e.error_description}</span>
          </h1>
          <div className="flex justify-end space-x-3 w-28">
            <p className="text-red-500">{count} s</p>
            <button
              className="text-xs flex justify-center items-center rounded-full p-0 text-red-50 bg-red-500 h-6 w-6"
              onClick={stopCounter}
            >
              ✖
            </button>
          </div>
        </div>
      </div>
    )
  );
};
