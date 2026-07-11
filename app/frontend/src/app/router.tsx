import { ForgotPasswordPage } from "@/features/auth/forgot-password.page";
import { LoginPage } from "@/features/auth/login.page";
import { ROUTES } from "@/shared/config/routes";
import { createBrowserRouter, redirect } from "react-router";
import App from "./App";

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
        path: ROUTES.HOME,
        loader: () => redirect(ROUTES.LOGIN),
      },
    ],
  },
]);
