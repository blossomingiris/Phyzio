import { AppointmentListPage } from "@/features/appointments/appointment-list.page";
import { ForgotPasswordPage } from "@/features/auth/forgot-password.page";
import { LoginPage } from "@/features/auth/login.page";
import { ClientItemPage } from "@/features/clients/client-item.page";
import { ClientListPage } from "@/features/clients/client-list.page";
import { SettingsPage } from "@/features/settings/settings.page";
import { TherapistItemPage } from "@/features/therapists/therapist-item.page";
import { TherapistListPage } from "@/features/therapists/therapist-list.page";
import { TreatmentPlanItemPage } from "@/features/treatment-plans/treatment-plan-item.page";
import { TreatmentPlanListPage } from "@/features/treatment-plans/treatment-plan-list.page";
import { TreatmentItemPage } from "@/features/treatments/treatment-item.page";
import { TreatmentListPage } from "@/features/treatments/treatment-list.page";
import { UserItemPage } from "@/features/users/user-item.page";
import { UserListPage } from "@/features/users/user-list.page";
import { ROUTES } from "@/shared/model/routes";
import { createBrowserRouter } from "react-router";
import { App } from "./app";
import { AppShell } from "./app-shell";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: <ForgotPasswordPage />,
      },
      {
        element: <AppShell />,
        children: [
          {
            path: ROUTES.HOME,
            element: <AppointmentListPage />,
          },
          {
            path: ROUTES.USERS,
            element: <UserListPage />,
          },
          {
            path: ROUTES.USER_ITEM,
            element: <UserItemPage />,
          },
          {
            path: ROUTES.THERAPISTS,
            element: <TherapistListPage />,
          },
          {
            path: ROUTES.THERAPIST_ITEM,
            element: <TherapistItemPage />,
          },
          {
            path: ROUTES.CLIENTS,
            element: <ClientListPage />,
          },
          {
            path: ROUTES.CLIENT_ITEM,
            element: <ClientItemPage />,
          },
          {
            path: ROUTES.TREATMENTS,
            element: <TreatmentListPage />,
          },
          {
            path: ROUTES.TREATMENT_ITEM,
            element: <TreatmentItemPage />,
          },
          {
            path: ROUTES.TREATMENT_PLANS,
            element: <TreatmentPlanListPage />,
          },
          {
            path: ROUTES.TREATMENT_PLAN_ITEM,
            element: <TreatmentPlanItemPage />,
          },
          {
            path: ROUTES.SETTINGS,
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);
