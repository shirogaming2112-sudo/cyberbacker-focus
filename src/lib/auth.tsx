import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppRole } from "./permissions";

const STORAGE_KEY = "cb.role";

type AuthCtx = {
  role: AppRole | null;
  ready: boolean;
  login: (role: AppRole) => void;
  logout: () => void;
  setRole: (role: AppRole) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY) as AppRole | null;
      if (v) setRoleState(v);
    } catch {}
    setReady(true);
  }, []);

  const persist = (r: AppRole | null) => {
    try {
      if (r) localStorage.setItem(STORAGE_KEY, r);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <Ctx.Provider
      value={{
        role,
        ready,
        login: (r) => { setRoleState(r); persist(r); },
        logout: () => { setRoleState(null); persist(null); },
        setRole: (r) => { setRoleState(r); persist(r); },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
