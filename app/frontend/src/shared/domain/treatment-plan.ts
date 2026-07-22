import { rqClient } from "@/shared/api/http-client";
import type { MethodResponse } from "openapi-react-query";

type TreatmentPlanListResponse = MethodResponse<
  typeof rqClient,
  "get",
  "/treatment-plans/"
>;

export type TreatmentPlan = TreatmentPlanListResponse["data"][number];

export type TreatmentPlanDetail = MethodResponse<
  typeof rqClient,
  "get",
  "/treatment-plans/{id}"
>;

export const TREATMENT_PLAN_CANCELLATION_REASON_LABELS: Record<
  NonNullable<TreatmentPlanDetail["cancellationReason"]>,
  string
> = {
  client_request: "Client Request",
  client_unreachable: "Client Unreachable",
  therapist_referral: "Therapist Referral",
  other: "Other",
  client_deleted: "Client Deleted",
};

const MANUALLY_SELECTABLE_CANCELLATION_REASONS = [
  "client_request",
  "client_unreachable",
  "therapist_referral",
  "other",
] as const satisfies readonly NonNullable<TreatmentPlanDetail["cancellationReason"]>[];

export type TreatmentPlanManualCancellationReason =
  (typeof MANUALLY_SELECTABLE_CANCELLATION_REASONS)[number];

export const TREATMENT_PLAN_MANUAL_CANCELLATION_REASON_OPTIONS =
  MANUALLY_SELECTABLE_CANCELLATION_REASONS.map((value) => ({
    value,
    label: TREATMENT_PLAN_CANCELLATION_REASON_LABELS[value],
  }));

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

export function getTreatmentPlanProgressColor(percent: number): string {
  if (percent <= 0) return "gray";
  if (percent >= 100) return "success";
  return "blue";
}
