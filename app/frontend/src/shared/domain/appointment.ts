import { rqClient } from "@/shared/api/http-client";
import type { MethodResponse } from "openapi-react-query";

type AppointmentListResponse = MethodResponse<
  typeof rqClient,
  "get",
  "/appointments/"
>;

export type Appointment = AppointmentListResponse["data"][number];

export const APPOINTMENT_STATUS_LABELS: Record<Appointment["status"], string> = {
  requested: "Requested",
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  no_show: "No Show",
  cancelled: "Cancelled",
};

export const APPOINTMENT_STATUS_COLORS: Record<Appointment["status"], string> = {
  requested: "accent",
  scheduled: "blue",
  confirmed: "cyan",
  completed: "success",
  no_show: "error",
  cancelled: "error",
};
