import { ROUTES } from "@/shared/config/routes";
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
  { key: "users", title: "Users", icon: IconUsers },
  { key: "therapists", title: "Therapists", icon: IconStethoscope },
  { key: "clients", title: "Clients", icon: IconUserCircle },
  { key: "treatments", title: "Treatments", icon: IconActivity },
  { key: "treatment-plans", title: "Treatment Plans", icon: IconClipboardList },
];

export const footerNavigationConfig: NavItem[] = [
  {
    key: "settings",
    title: "Settings",
    icon: IconSettings,
  },
  { key: "logout", title: "Log out", icon: IconLogout },
];
