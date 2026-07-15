/* eslint-disable react-refresh/only-export-components -- compound component (Tabs.List, Tabs.Tab, Tabs.Panel) */
import {
  Tabs as MantineTabs,
  type TabsProps as MantineTabsProps,
} from "@mantine/core";
import classes from "./tabs.module.css";
import { useTabSearchParam } from "./use-tab-search-param";

export type TabsProps = Omit<MantineTabsProps, "value" | "onChange"> & {
  defaultValue: string;
  param?: string;
  onChange?: (value: string) => void;
};

function TabsRoot({
  param = "tab",
  defaultValue,
  classNames,
  onChange,
  style,
  ...props
}: TabsProps) {
  const [value, setValue] = useTabSearchParam(param, defaultValue);

  return (
    <MantineTabs
      value={value}
      onChange={(next) => {
        const resolved = next ?? defaultValue;
        setValue(resolved);
        onChange?.(resolved);
      }}
      classNames={{ tab: classes.tab, ...classNames }}
      style={{
        "--tab-border-color": "var(--mantine-color-accent-2)",
        ...style,
      }}
      {...props}
    />
  );
}

export const Tabs = Object.assign(TabsRoot, {
  List: MantineTabs.List,
  Tab: MantineTabs.Tab,
  Panel: MantineTabs.Panel,
});
