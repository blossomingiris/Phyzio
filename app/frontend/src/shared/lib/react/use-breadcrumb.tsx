/* eslint-disable react-refresh/only-export-components -- co-locates the context, provider, and hooks for one small feature */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type BreadcrumbContextValue = {
  label: string | null;
  setLabel: (label: string | null) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);

  return (
    <BreadcrumbContext.Provider value={{ label, setLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

function useBreadcrumbContext() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
}

export function useBreadcrumb(label: string) {
  const { setLabel } = useBreadcrumbContext();

  useEffect(() => {
    setLabel(label);
    return () => setLabel(null);
  }, [label, setLabel]);
}

export function useBreadcrumbLabel() {
  return useBreadcrumbContext().label;
}
