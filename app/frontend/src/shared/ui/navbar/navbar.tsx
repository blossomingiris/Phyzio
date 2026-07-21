/* eslint-disable react-refresh/only-export-components -- compound component (Navbar.Header, Navbar.Section, Navbar.Link, Navbar.Footer) */
import type { UserRole } from "@/shared/domain/user";
import {
  ActionIcon,
  AppShell,
  Badge,
  Group,
  Stack,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import {
  IconChevronLeft,
  IconChevronRight,
  type Icon,
} from "@tabler/icons-react";
import { createContext, useContext, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import classes from "./navbar.module.css";

export type NavItem = {
  key: string;
  title: string;
  icon: Icon;
  path?: string;
  count?: number;
  roles?: UserRole[];
  onClick?: () => void;
};

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

const NavbarContext = createContext<{
  collapsed: boolean;
  onToggleCollapse?: () => void;
}>({ collapsed: false });

type NavbarState = {
  opened: boolean;
  toggle: () => void;
};

const NavbarStateContext = createContext<NavbarState | null>(null);

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useLocalStorage({
    key: "phyzio-sidebar-opened",
    defaultValue: true,
    getInitialValueInEffect: false,
  });
  const toggle = () => setOpened((prev) => !prev);

  return (
    <NavbarStateContext.Provider value={{ opened, toggle }}>
      {children}
    </NavbarStateContext.Provider>
  );
}

export function useNavbarState() {
  const context = useContext(NavbarStateContext);
  if (!context) {
    throw new Error("useNavbarState must be used within a NavbarProvider");
  }
  return context;
}

function NavbarRoot({ children }: { children: ReactNode }) {
  const { opened, toggle } = useNavbarState();
  const collapsed = !opened;

  return (
    <NavbarContext.Provider value={{ collapsed, onToggleCollapse: toggle }}>
      <AppShell.Navbar
        p="sm"
        bg="var(--surface-subtle)"
        style={{ transitionProperty: "width, transform, top, height" }}
      >
        {children}
      </AppShell.Navbar>
    </NavbarContext.Provider>
  );
}

function NavbarToggle() {
  const { collapsed, onToggleCollapse } = useContext(NavbarContext);

  if (!onToggleCollapse) return null;

  const label = collapsed ? "Expand Sidebar" : "Collapse Sidebar";

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <ActionIcon
        onClick={onToggleCollapse}
        variant="default"
        radius="md"
        size={44}
        aria-label={label}
      >
        {collapsed ? (
          <IconChevronRight size={20} />
        ) : (
          <IconChevronLeft size={20} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

function NavbarHeader({ children }: { children: ReactNode }) {
  const { collapsed } = useContext(NavbarContext);
  return (
    <Group
      h={44}
      mb="lg"
      justify={collapsed ? "center" : "space-between"}
      wrap="nowrap"
    >
      {!collapsed && (
        <Group gap="xs" wrap="nowrap">
          <img src="/logo.png" alt="" width={48} height={48} />
          <Title order={3}>{children}</Title>
        </Group>
      )}
      <NavbarToggle />
    </Group>
  );
}

function NavbarSectionLayout({ children }: { children: ReactNode }) {
  const { collapsed } = useContext(NavbarContext);
  return (
    <Stack
      gap="xs"
      justify={collapsed ? "center" : undefined}
      align={collapsed ? "center" : undefined}
    >
      {children}
    </Stack>
  );
}

function NavbarSection({
  grow,
  children,
}: {
  grow?: boolean;
  children: ReactNode;
}) {
  return (
    <AppShell.Section grow={grow}>
      <NavbarSectionLayout>{children}</NavbarSectionLayout>
    </AppShell.Section>
  );
}

function NavbarExpandedLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const content = (
    <>
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.title}</span>
      {!item.path && !item.onClick && (
        <Badge
          className={classes.badge}
          variant="light"
          color="accent"
          size="sm"
        >
          Coming soon
        </Badge>
      )}
      {item.path && !!item.count && (
        <Badge
          className={classes.badge}
          variant="filled"
          color="accent"
          size="sm"
        >
          {formatBadgeCount(item.count)}
        </Badge>
      )}
    </>
  );

  if (item.path) {
    return (
      <Link
        to={item.path}
        className={classes.link}
        data-active={active || undefined}
      >
        {content}
      </Link>
    );
  }

  if (item.onClick) {
    return (
      <UnstyledButton onClick={item.onClick} className={classes.link}>
        {content}
      </UnstyledButton>
    );
  }

  return (
    <div className={classes.link} data-disabled="true">
      {content}
    </div>
  );
}

function NavbarCollapsedLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const iconWithBadge = (
    <span className={classes.railIcon}>
      <item.icon size={20} stroke={1.5} />
      {item.path && !!item.count && (
        <Badge
          className={classes.railBadge}
          variant="filled"
          color="accent"
          size="xs"
        >
          {formatBadgeCount(item.count)}
        </Badge>
      )}
    </span>
  );

  const label =
    item.path || item.onClick ? item.title : `${item.title} — Coming soon`;

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      {item.path ? (
        <UnstyledButton
          component={Link}
          to={item.path}
          className={classes.railLink}
          data-active={active || undefined}
          aria-label={item.title}
        >
          {iconWithBadge}
        </UnstyledButton>
      ) : item.onClick ? (
        <UnstyledButton
          onClick={item.onClick}
          className={classes.railLink}
          aria-label={item.title}
        >
          {iconWithBadge}
        </UnstyledButton>
      ) : (
        <UnstyledButton
          className={classes.railLink}
          aria-disabled="true"
          aria-label={item.title}
        >
          {iconWithBadge}
        </UnstyledButton>
      )}
    </Tooltip>
  );
}

function NavbarLink({ item }: { item: NavItem }) {
  const { collapsed } = useContext(NavbarContext);
  const { pathname } = useLocation();
  const active =
    pathname === item.path ||
    (!!item.path &&
      item.path !== "/" &&
      pathname.startsWith(`${item.path}/`));

  return collapsed ? (
    <NavbarCollapsedLink item={item} active={active} />
  ) : (
    <NavbarExpandedLink item={item} active={active} />
  );
}

function NavbarFooter({ children }: { children: ReactNode }) {
  return (
    <AppShell.Section className={classes.footer}>
      <NavbarSectionLayout>{children}</NavbarSectionLayout>
    </AppShell.Section>
  );
}

export const Navbar = Object.assign(NavbarRoot, {
  Header: NavbarHeader,
  Section: NavbarSection,
  Link: NavbarLink,
  Footer: NavbarFooter,
});
