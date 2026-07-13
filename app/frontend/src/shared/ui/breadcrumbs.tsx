import {
  Anchor,
  Breadcrumbs as MantineBreadcrumbs,
  Text,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "react-router";

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <MantineBreadcrumbs
        separator={
          <IconChevronRight
            size={14}
            stroke={1.5}
            color="var(--mantine-color-dimmed)"
          />
        }
      >
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          if (isCurrent) {
            return (
              <Text key={item.label} size="sm" aria-current="page">
                {item.label}
              </Text>
            );
          }

          if (item.path) {
            return (
              <Anchor
                key={item.label}
                component={Link}
                to={item.path}
                size="sm"
                c="dimmed"
              >
                {item.label}
              </Anchor>
            );
          }

          return (
            <Text key={item.label} size="sm" c="dimmed">
              {item.label}
            </Text>
          );
        })}
      </MantineBreadcrumbs>
    </nav>
  );
}
