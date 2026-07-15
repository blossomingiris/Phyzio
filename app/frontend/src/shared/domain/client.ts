import { rqClient } from "@/shared/api/http-client";
import type { MethodResponse } from "openapi-react-query";

type ClientListResponse = MethodResponse<typeof rqClient, "get", "/clients/">;

export type Client = ClientListResponse["data"][number];

export type ClientDetail = MethodResponse<typeof rqClient, "get", "/clients/{id}">;

export const PREFERRED_COMMUNICATION_LABELS: Record<
  ClientDetail["preferredCommunication"],
  string
> = {
  whats_up: "WhatsApp",
  phone: "Phone",
  email: "Email",
};

export const CLIENT_ORIGIN_LABELS: Record<
  NonNullable<ClientDetail["origin"]>,
  string
> = {
  whats_up: "WhatsApp",
  phone: "Phone",
  walk_in: "Walk-in",
  other: "Other",
};
