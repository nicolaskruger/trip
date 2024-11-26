import { Loader2 } from "lucide-react";

export const Loading = ({ loading }: { loading: boolean }) => {
  return (
    <Loader2
      data-loading={loading}
      className="data-[loading=false]:invisible animate-spin"
    />
  );
};
