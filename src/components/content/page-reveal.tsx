"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface PageRevealContextValue {
  ready: boolean;
  setReady: (ready: boolean) => void;
}

const PageRevealContext = createContext<PageRevealContextValue | null>(null);

export function PageRevealProvider({
  children,
  autoReady = false,
}: {
  children: ReactNode;
  autoReady?: boolean;
}) {
  const [ready, setReadyState] = useState(autoReady);
  const setReady = useCallback((value: boolean) => {
    setReadyState((prev) => prev || value);
  }, []);
  const value = useMemo(() => ({ ready, setReady }), [ready, setReady]);
  return (
    <PageRevealContext.Provider value={value}>{children}</PageRevealContext.Provider>
  );
}

export function usePageReveal(): PageRevealContextValue {
  const ctx = useContext(PageRevealContext);
  if (!ctx) {
    throw new Error("usePageReveal must be used within PageRevealProvider");
  }
  return ctx;
}
