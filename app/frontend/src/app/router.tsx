import { AppointmentListPage } from "@/features/appointments/appointment-list.page";
import { ForgotPasswordPage } from "@/features/auth/forgot-password.page";
import { LoginPage } from "@/features/auth/login.page";
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
        ],
      },
    ],
  },
]);
