import { useSessionStore } from "@/services/session";
import { Tabs } from "@/shared/ui/tabs/tabs";
import { Stack, Title } from "@mantine/core";
import { IconClock, IconLock, IconUserCircle } from "@tabler/icons-react";
import { SettingsPasswordCard } from "./ui/settings-password-card";
import { SettingsProfileCard } from "./ui/settings-profile-card";
import { SettingsWorkingHoursCard } from "./ui/settings-working-hours-card";

export function SettingsPage() {
  const user = useSessionStore((state) => state.user);
  if (!user) return null;

  const isTherapist = !!user.therapist;

  return (
    <Stack gap="sm" align="flex-start" style={{ width: "100%" }}>
      <Title>Settings</Title>

      <Tabs defaultValue="profile" keepMounted={false} style={{ width: "100%" }}>
        <Tabs.List>
          <Tabs.Tab value="profile" leftSection={<IconUserCircle size={16} />}>
            Profile
          </Tabs.Tab>
          {isTherapist && (
            <Tabs.Tab value="working-hours" leftSection={<IconClock size={16} />}>
              Working Hours
            </Tabs.Tab>
          )}
          <Tabs.Tab value="password" leftSection={<IconLock size={16} />}>
            Password
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile" pt="xl">
          <SettingsProfileCard user={user} />
        </Tabs.Panel>

        {isTherapist && (
          <Tabs.Panel value="working-hours" pt="xl">
            <SettingsWorkingHoursCard user={user} />
          </Tabs.Panel>
        )}

        <Tabs.Panel value="password" pt="xl">
          <SettingsPasswordCard />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
