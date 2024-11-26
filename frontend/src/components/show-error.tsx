import { HTMLProps, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";

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
  INVALID_DATA: `Something went wrong :( check your fields`,
  DRIVER_NOT_FOUND: "Something went wrong :( driver not found",
  INVALID_DISTANCE: "Something went wrong :( invalid distance",
  INVALID_DRIVER: "Something went wrong :( invalid driver",
  NO_RIDES_FOUND: "Something went wrong :( no rides found",
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
      <Alert {...props} variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{e.error_description}</AlertTitle>
        <AlertDescription>{ERROR[e.error_code] || "Ops.."}</AlertDescription>
      </Alert>
    )
  );
};
