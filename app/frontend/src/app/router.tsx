import { ROUTES } from "@/shared/config/routes";
import { createBrowserRouter, redirect } from "react-router";
import App from "./App";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: ROUTES.LOGIN,
      },
      {
        path: ROUTES.HOME,
        loader: () => redirect(ROUTES.LOGIN),
      },
    ],
  },
]);
