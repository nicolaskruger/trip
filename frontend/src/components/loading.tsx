export const Loading = ({ loading }: { loading: boolean }) => {
  return (
    <div
      data-loading={loading}
      className="data-[loading=false]:invisible w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
    />
  );
};
