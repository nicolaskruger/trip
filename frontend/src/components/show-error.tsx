import { HTMLProps, useCallback, useEffect, useRef, useState } from "react";

export type ResponseError = {
  error_code: string;
  error_description: string;
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
        className={`${props.className} rounded-xl p-3 bg-red-900 flex flex-col space-y-2`}
      >
        <div className="bg-red-600 p-3 flex justify-between rounded-xl items-center">
          <h1>{e.error_code}</h1>
          <div className="flex space-x-3">
            <p>{count} s</p>
            <button
              className="text-xs flex justify-center items-center rounded-full p-0 bg-red-950 h-6 w-6"
              onClick={stopCounter}
            >
              ✖
            </button>
          </div>
        </div>
        <p className="px-3">{e.error_description}</p>
      </div>
    )
  );
};
