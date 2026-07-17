import { USER_ROLES } from "@/shared/domain/user";
import { ROUTES } from "@/shared/model/routes";
import { createBrowserRouter } from "react-router";
import { App } from "./app";
import { AppShell } from "./app-shell";
import { RequireAuth, RequireGuest, RequireRole } from "./route-guards";
import { RouteErrorBoundary } from "./route-error-boundary";

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <RequireGuest />,
        children: [
          {
            path: ROUTES.LOGIN,
            lazy: () =>
              import("@/features/auth/login.page").then((module) => ({
                Component: module.LoginPage,
              })),
          },
        ],
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        lazy: () =>
          import("@/features/auth/forgot-password.page").then((module) => ({
            Component: module.ForgotPasswordPage,
          })),
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShell />,
            children: [
              {
                path: ROUTES.HOME,
                lazy: () =>
                  import("@/features/appointments/appointment-list.page").then(
                    (module) => ({ Component: module.AppointmentListPage }),
                  ),
              },
              {
                path: ROUTES.SETTINGS,
                lazy: () =>
                  import("@/features/settings/settings.page").then(
                    (module) => ({ Component: module.SettingsPage }),
                  ),
              },
              {
                element: <RequireRole role={USER_ROLES.ADMIN} />,
                children: [
                  {
                    path: ROUTES.USERS,
                    lazy: () =>
                      import("@/features/users/user-list.page").then(
                        (module) => ({ Component: module.UserListPage }),
                      ),
                  },
                  {
                    path: ROUTES.USER_ITEM,
                    lazy: () =>
                      import("@/features/users/user-item.page").then(
                        (module) => ({ Component: module.UserItemPage }),
                      ),
                  },
                  {
                    path: ROUTES.THERAPISTS,
                    lazy: () =>
                      import("@/features/therapists/therapist-list.page").then(
                        (module) => ({ Component: module.TherapistListPage }),
                      ),
                  },
                  {
                    path: ROUTES.THERAPIST_ITEM,
                    lazy: () =>
                      import("@/features/therapists/therapist-item.page").then(
                        (module) => ({ Component: module.TherapistItemPage }),
                      ),
                  },
                  {
                    path: ROUTES.CLIENTS,
                    lazy: () =>
                      import("@/features/clients/client-list.page").then(
                        (module) => ({ Component: module.ClientListPage }),
                      ),
                  },
                  {
                    path: ROUTES.CLIENT_ITEM,
                    lazy: () =>
                      import("@/features/clients/client-item.page").then(
                        (module) => ({ Component: module.ClientItemPage }),
                      ),
                  },
                  {
                    path: ROUTES.TREATMENTS,
                    lazy: () =>
                      import("@/features/treatments/treatment-list.page").then(
                        (module) => ({ Component: module.TreatmentListPage }),
                      ),
                  },
                  {
                    path: ROUTES.TREATMENT_ITEM,
                    lazy: () =>
                      import("@/features/treatments/treatment-item.page").then(
                        (module) => ({ Component: module.TreatmentItemPage }),
                      ),
                  },
                  {
                    path: ROUTES.TREATMENT_PLANS,
                    lazy: () =>
                      import(
                        "@/features/treatment-plans/treatment-plan-list.page"
                      ).then((module) => ({
                        Component: module.TreatmentPlanListPage,
                      })),
                  },
                  {
                    path: ROUTES.TREATMENT_PLAN_ITEM,
                    lazy: () =>
                      import(
                        "@/features/treatment-plans/treatment-plan-item.page"
                      ).then((module) => ({
                        Component: module.TreatmentPlanItemPage,
                      })),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
