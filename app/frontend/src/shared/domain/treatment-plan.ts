import { rqClient } from "@/shared/api/http-client";
import type { MethodResponse } from "openapi-react-query";

type TreatmentPlanListResponse = MethodResponse<
  typeof rqClient,
  "get",
  "/treatment-plans/"
>;

export type TreatmentPlan = TreatmentPlanListResponse["data"][number];

export const TREATMENT_PLAN_STATUS_LABELS: Record<
  TreatmentPlan["status"],
  string
> = {
  open: "Open",
  in_progress: "In Progress",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const TREATMENT_PLAN_STATUS_COLORS: Record<
  TreatmentPlan["status"],
  string
> = {
  open: "accent",
  in_progress: "blue",
  paused: "yellow",
  completed: "success",
  cancelled: "error",
};

export function getTreatmentPlanProgress(plan: TreatmentPlan) {
  const total = plan.items.reduce((sum, item) => sum + item.treatment.quantity, 0);
  const completed = plan.items.reduce((sum, item) => sum + item.quantityCompleted, 0);

  return { total, completed, left: total - completed };
}
