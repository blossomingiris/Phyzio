import { Navbar } from "@/shared/components/navbar/navbar";
import { navigationConfig } from "@/shared/components/navbar/navigation.config";
import { AppShell as MantineAppShell } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { Outlet } from "react-router";

export function AppShell() {
  const [opened, setOpened] = useLocalStorage({
    key: "phyzio-sidebar-opened",
    defaultValue: true,
    getInitialValueInEffect: false,
  });
  const toggle = () => setOpened((prev) => !prev);

  return (
    <MantineAppShell
      navbar={{
        width: opened ? 260 : 80,
        breakpoint: "xs",
      }}
      padding="md"
    >
      <Navbar collapsed={!opened} onToggleCollapse={toggle}>
        <Navbar.Header>Phyzio</Navbar.Header>
        <Navbar.Section grow>
          {navigationConfig.map((item) => (
            <Navbar.Link key={item.key} item={item} />
          ))}
        </Navbar.Section>
        <Navbar.Footer />
      </Navbar>
      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
