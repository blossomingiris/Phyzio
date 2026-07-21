import type { UserRole } from "@/shared/domain/user";
import {
  BreadcrumbProvider,
  useBreadcrumbLabel,
} from "@/shared/lib/react/use-breadcrumb";
import {
  HeaderActionsProvider,
  HeaderActionsSlot,
} from "@/shared/lib/react/use-header-actions";
import { Breadcrumbs } from "@/shared/ui/breadcrumbs";
import { useLogout, useSessionStore } from "@/services/session";
import {
  Navbar,
  NavbarProvider,
  useNavbarState,
  type NavItem,
} from "@/shared/ui/navbar/navbar";
import {
  adminNavigationConfig,
  footerNavigationConfig,
  navigationConfig,
} from "@/shared/ui/navbar/navigation.config";
import { SectionLabel } from "@/shared/ui/section-label";

import { Divider, Group, AppShell as MantineAppShell, Paper } from "@mantine/core";
import { Outlet, useLocation } from "react-router";

const navItems = [
  ...navigationConfig,
  ...adminNavigationConfig,
  ...footerNavigationConfig,
];

function filterVisibleNavItems(items: NavItem[], role: UserRole | undefined) {
  return items.filter(
    (item) => !item.roles || (!!role && item.roles.includes(role)),
  );
}

export function AppShell() {
  return (
    <NavbarProvider>
      <BreadcrumbProvider>
        <AppShellLayout />
      </BreadcrumbProvider>
    </NavbarProvider>
  );
}

function AppShellLayout() {
  const { opened } = useNavbarState();
  const { pathname } = useLocation();
  const detailLabel = useBreadcrumbLabel();
  const currentNavItem = navItems.find((item) => item.path === pathname);
  const parentNavItem = navItems.find(
    (item) => item.path !== "/" && pathname.startsWith(`${item.path}/`),
  );

  const currentUser = useSessionStore((state) => state.user);
  const logout = useLogout();

  const visibleNavItems = filterVisibleNavItems(
    navigationConfig,
    currentUser?.role,
  );
  const visibleAdminNavItems = filterVisibleNavItems(
    adminNavigationConfig,
    currentUser?.role,
  );
  const footerItems = footerNavigationConfig.map((item) =>
    item.key === "logout" ? { ...item, onClick: () => void logout() } : item,
  );

  const crumbs = currentNavItem
    ? [{ label: currentNavItem.title }]
    : parentNavItem
      ? [
          { label: parentNavItem.title, path: parentNavItem.path },
          ...(detailLabel ? [{ label: detailLabel }] : []),
        ]
      : [];

  return (
    <MantineAppShell
      layout="alt"
      withBorder={false}
      header={{ height: 84 }}
      navbar={{
        width: opened ? 260 : 80,
        breakpoint: "xs",
      }}
      padding="xs"
    >
      <HeaderActionsProvider>
        <MantineAppShell.Header pt="xs" px="xs" bg="var(--surface-subtle)">
          <Paper
            withBorder
            h="100%"
            p="md"
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius:
                "var(--mantine-radius-sm) var(--mantine-radius-sm) 0 0",
            }}
          >
            <Group justify="space-between" w="100%">
              <Breadcrumbs items={crumbs} />
              <HeaderActionsSlot />
            </Group>
          </Paper>
        </MantineAppShell.Header>
        <Navbar>
          <Navbar.Header>Phyzio</Navbar.Header>
          <Navbar.Section grow>
            {visibleNavItems.map((item) => (
              <Navbar.Link key={item.key} item={item} />
            ))}
            {visibleAdminNavItems.length > 0 && (
              <>
                <Divider my="xs" style={{ width: "100%" }} />
                {opened && <SectionLabel>Admin</SectionLabel>}
                {visibleAdminNavItems.map((item) => (
                  <Navbar.Link key={item.key} item={item} />
                ))}
              </>
            )}
          </Navbar.Section>
          <Navbar.Footer>
            {footerItems.map((item) => (
              <Navbar.Link key={item.key} item={item} />
            ))}
          </Navbar.Footer>
        </Navbar>
        <MantineAppShell.Main
          bg="var(--surface-subtle)"
          pt="var(--app-shell-header-offset)"
          style={{ display: "flex" }}
        >
          <Paper
            p="md"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              borderRadius:
                "0 0 var(--mantine-radius-sm) var(--mantine-radius-sm)",
              borderLeft: "1px solid var(--paper-border-color)",
              borderRight: "1px solid var(--paper-border-color)",
              borderBottom: "1px solid var(--paper-border-color)",
            }}
          >
            <Outlet />
          </Paper>
        </MantineAppShell.Main>
      </HeaderActionsProvider>
    </MantineAppShell>
  );
}
