import { rqClient } from "@/shared/api/http-client";
import type { MethodResponse } from "openapi-react-query";

type TreatmentListResponse = MethodResponse<
  typeof rqClient,
  "get",
  "/treatments/"
>;

export type Treatment = TreatmentListResponse["data"][number];

export const TREATMENT_CATEGORY_LABELS: Record<Treatment["category"], string> = {
  ortho_sports: "Ortho / Sports",
  neuro_vestibular: "Neuro / Vestibular",
  pediatrics: "Pediatrics",
  geriatrics: "Geriatrics",
  specialized_pt: "Specialized PT",
  general_tech: "General Technique",
  evaluations: "Evaluations",
};
