import { USER_ROLE_LABELS, type UserRole } from "@/shared/domain/user";
import { useHeaderActions } from "@/shared/lib/react/use-header-actions";
import { AddButton } from "@/shared/ui/add-button";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import { TabCountBadge } from "@/shared/ui/tabs/tab-count-badge";
import { Tabs } from "@/shared/ui/tabs/tabs";
import { Group, Select, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUserOff, IconUsers, IconUserX } from "@tabler/icons-react";
import { useState } from "react";
import { useUserListStatusCounts } from "./model/use-user-list-status-counts";
import { UserCreateModal } from "./ui/user-create-modal";
import { UserTable } from "./ui/user-table";

const ROLE_FILTER_OPTIONS = Object.entries(USER_ROLE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function UserListPage() {
  const table = useServerTable();
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [role, setRole] = useState<UserRole | null>(null);

  useHeaderActions(<AddButton label="New Admin" onClick={openCreate} />);

  const resetPage = () =>
    table.onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }));

  const handleRoleChange = (value: string | null) => {
    setRole(value as UserRole | null);
    resetPage();
  };

  const counts = useUserListStatusCounts();

  const toolbarActions = (
    <Group gap="sm" wrap="nowrap">
      <Select
        placeholder="All Roles"
        data={ROLE_FILTER_OPTIONS}
        value={role}
        onChange={handleRoleChange}
        clearable
        w={180}
      />
    </Group>
  );

  return (
    <Stack style={{ flex: 1, minHeight: 0 }}>
      <Title>Users</Title>
      <Tabs
        defaultValue="active"
        onChange={resetPage}
        keepMounted={false}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Tabs.List>
          <Tabs.Tab
            value="active"
            leftSection={<IconUserX size={16} />}
            rightSection={<TabCountBadge count={counts.active} />}
          >
            Active
          </Tabs.Tab>
          <Tabs.Tab
            value="deleted"
            leftSection={<IconUserOff size={16} />}
            rightSection={<TabCountBadge count={counts.deleted} />}
          >
            Deleted
          </Tabs.Tab>
          <Tabs.Tab
            value="all"
            leftSection={<IconUsers size={16} />}
            rightSection={<TabCountBadge count={counts.all} />}
          >
            All
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <UserTable
            table={table}
            status="active"
            role={role ?? undefined}
            toolbarActions={toolbarActions}
          />
        </Tabs.Panel>

        <Tabs.Panel value="all" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <UserTable
            table={table}
            status="all"
            role={role ?? undefined}
            toolbarActions={toolbarActions}
          />
        </Tabs.Panel>

        <Tabs.Panel value="deleted" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <UserTable
            table={table}
            status="deleted"
            role={role ?? undefined}
            toolbarActions={toolbarActions}
          />
        </Tabs.Panel>
      </Tabs>

      <UserCreateModal opened={createOpened} onClose={closeCreate} />
    </Stack>
  );
}
