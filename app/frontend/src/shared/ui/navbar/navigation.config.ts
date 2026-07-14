import { USER_ROLES } from "@/shared/domain/user";
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
  {
    key: "users",
    title: "Users",
    icon: IconUsers,
    path: ROUTES.USERS,
    roles: [USER_ROLES.ADMIN],
  },
  {
    key: "therapists",
    title: "Therapists",
    icon: IconStethoscope,
    path: ROUTES.THERAPISTS,
    roles: [USER_ROLES.ADMIN],
  },
  {
    key: "clients",
    title: "Clients",
    icon: IconUserCircle,
    path: ROUTES.CLIENTS,
    roles: [USER_ROLES.ADMIN],
  },
  {
    key: "treatments",
    title: "Treatments",
    icon: IconActivity,
    path: ROUTES.TREATMENTS,
    roles: [USER_ROLES.ADMIN],
  },
  {
    key: "treatment-plans",
    title: "Treatment Plans",
    icon: IconClipboardList,
    path: ROUTES.TREATMENT_PLANS,
    roles: [USER_ROLES.ADMIN],
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
