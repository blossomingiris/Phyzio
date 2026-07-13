/* eslint-disable react-refresh/only-export-components -- co-locates the context, provider, hook, and slot for one small feature */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type HeaderActionsContextValue = {
  actions: ReactNode;
  setActions: (node: ReactNode) => void;
};

const HeaderActionsContext = createContext<HeaderActionsContextValue | null>(
  null,
);

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);

  return (
    <HeaderActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

function useHeaderActionsContext() {
  const context = useContext(HeaderActionsContext);
  if (!context) {
    throw new Error(
      "useHeaderActions must be used within a HeaderActionsProvider",
    );
  }
  return context;
}

export function useHeaderActions(node: ReactNode) {
  const { setActions } = useHeaderActionsContext();

  useEffect(() => {
    setActions(node);
    return () => setActions(null);
  }, [node, setActions]);
}

export function HeaderActionsSlot() {
  const { actions } = useHeaderActionsContext();
  return <>{actions}</>;
}
