import type { UserRole } from "@/shared/domain/user";
import { useSessionStore } from "@/services/session";
import { ROUTES } from "@/shared/model/routes";
import { Center, Loader } from "@mantine/core";
import { Navigate, Outlet, useLocation } from "react-router";

function SessionLoader() {
  return (
    <Center mih={200} style={{ flex: 1 }}>
      <Loader type="bars" />
    </Center>
  );
}

export function RequireAuth() {
  const location = useLocation();
  const ready = useSessionStore((state) => state.ready);
  const authenticated = useSessionStore((state) => state.authenticated);

  if (!ready) return <SessionLoader />;

  if (!authenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}

export function RequireGuest() {
  const ready = useSessionStore((state) => state.ready);
  const authenticated = useSessionStore((state) => state.authenticated);

  if (!ready) return <SessionLoader />;
  if (authenticated) return <Navigate to={ROUTES.HOME} replace />;

  return <Outlet />;
}

export function RequireRole({ role }: { role: UserRole }) {
  const user = useSessionStore((state) => state.user);

  if (user?.role !== role) return <Navigate to={ROUTES.HOME} replace />;

  return <Outlet />;
}
