"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { getChromeTone, type ChromeTone } from "./chrome";

interface ChromeToneContextValue {
  tone: ChromeTone;
  /** Resume (and other photo stages) can override pathname defaults. */
  setToneOverride: (tone: ChromeTone | null) => void;
}

const ChromeToneContext = createContext<ChromeToneContextValue | null>(null);

export function ChromeToneProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const base = getChromeTone(pathname);
  const [override, setOverride] = useState<ChromeTone | null>(null);

  const setToneOverride = useCallback((tone: ChromeTone | null) => {
    setOverride(tone);
  }, []);

  const value = useMemo(
    () => ({
      tone: override ?? base,
      setToneOverride,
    }),
    [override, base, setToneOverride],
  );

  return (
    <ChromeToneContext.Provider value={value}>{children}</ChromeToneContext.Provider>
  );
}

export function useChromeTone(): ChromeTone {
  const ctx = useContext(ChromeToneContext);
  const pathname = usePathname();
  return ctx?.tone ?? getChromeTone(pathname);
}

export function useChromeToneOverride(): (tone: ChromeTone | null) => void {
  const ctx = useContext(ChromeToneContext);
  return ctx?.setToneOverride ?? (() => undefined);
}
