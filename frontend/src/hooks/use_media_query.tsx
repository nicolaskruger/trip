import { useEffect, useState } from "react";

export type Sizes = "xs" | "sm" | "md" | "md" | "lg" | "xl" | "2xl";

export const useMediaQuery = () => {
  const [query, setQuery] = useState<Sizes>("xs");

  useEffect(() => {
    const getBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= 1536) {
        setQuery("2xl");
      } else if (width >= 1280) {
        setQuery("xl");
      } else if (width >= 1024) {
        setQuery("lg");
      } else if (width >= 768) {
        setQuery("md");
      } else if (width >= 640) {
        setQuery("sm");
      } else {
        setQuery("xs");
      }
    };

    // Chama a função ao carregar
    getBreakpoint();

    // Atualiza quando a tela é redimensionada
    window.addEventListener("resize", getBreakpoint);

    return () => {
      window.removeEventListener("resize", getBreakpoint);
    };
  }, []);

  return query;
};
