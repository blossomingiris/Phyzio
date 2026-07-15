import { rqClient } from "@/shared/api/http-client";
import type { MethodResponse } from "openapi-react-query";

export const USER_ROLES = {
  ADMIN: "admin",
  THERAPIST: "therapist",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type User = MethodResponse<typeof rqClient, "get", "/me/">;
