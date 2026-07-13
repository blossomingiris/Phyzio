import { ROUTES } from "@/shared/model/routes";
import {
  IconActivity,
  IconCalendar,
  IconClipboardList,
  IconLogout,
  IconSettings,
  IconStethoscope,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import type { NavItem } from "./navbar";

export const navigationConfig: NavItem[] = [
  {
    key: "appointments",
    title: "Appointments",
    icon: IconCalendar,
    path: ROUTES.HOME,
  },
  { key: "users", title: "Users", icon: IconUsers, path: ROUTES.USERS },
  {
    key: "therapists",
    title: "Therapists",
    icon: IconStethoscope,
    path: ROUTES.THERAPISTS,
  },
  {
    key: "clients",
    title: "Clients",
    icon: IconUserCircle,
    path: ROUTES.CLIENTS,
  },
  {
    key: "treatments",
    title: "Treatments",
    icon: IconActivity,
    path: ROUTES.TREATMENTS,
  },
  {
    key: "treatment-plans",
    title: "Treatment Plans",
    icon: IconClipboardList,
    path: ROUTES.TREATMENT_PLANS,
  },
];

export const footerNavigationConfig: NavItem[] = [
  {
    key: "settings",
    title: "Settings",
    icon: IconSettings,
    path: ROUTES.SETTINGS,
  },
  { key: "logout", title: "Log out", icon: IconLogout },
];
