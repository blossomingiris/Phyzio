import { ActionIcon, Menu } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import { IconDotsVertical } from "@tabler/icons-react";

export type CardAction = {
  label: string;
  icon: Icon;
  onClick: () => void;
  color?: string;
};

export function CardActionsMenu({
  label,
  actions,
}: {
  label: string;
  actions: CardAction[];
}) {
  return (
    <Menu
      position="right-start"
      withArrow
      width={150}
      styles={{ item: { minHeight: 44 } }}
    >
      <Menu.Target>
        <ActionIcon variant="default" radius="md" size={44} aria-label={label}>
          <IconDotsVertical size={20} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {actions.map((action) => (
          <Menu.Item
            key={action.label}
            color={action.color}
            leftSection={<action.icon size={16} />}
            onClick={action.onClick}
          >
            {action.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
