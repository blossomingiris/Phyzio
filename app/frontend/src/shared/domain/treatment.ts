import { rqClient } from "@/shared/api/http-client";
import {
  IconBabyCarriage,
  IconBone,
  IconBrain,
  IconClipboardList,
  IconStethoscope,
  IconTool,
  IconWalk,
  type Icon,
} from "@tabler/icons-react";
import type { MethodResponse } from "openapi-react-query";

type TreatmentListResponse = MethodResponse<
  typeof rqClient,
  "get",
  "/treatments/"
>;

export type Treatment = TreatmentListResponse["data"][number];

export type TreatmentDetail = MethodResponse<
  typeof rqClient,
  "get",
  "/treatments/{id}"
>;

export const TREATMENT_CATEGORY_LABELS: Record<Treatment["category"], string> = {
  ortho_sports: "Ortho / Sports",
  neuro_vestibular: "Neuro / Vestibular",
  pediatrics: "Pediatrics",
  geriatrics: "Geriatrics",
  specialized_pt: "Specialized PT",
  general_tech: "General Technique",
  evaluations: "Evaluations",
};

export const TREATMENT_CATEGORY_ICONS: Record<Treatment["category"], Icon> = {
  ortho_sports: IconBone,
  neuro_vestibular: IconBrain,
  pediatrics: IconBabyCarriage,
  geriatrics: IconWalk,
  specialized_pt: IconStethoscope,
  general_tech: IconTool,
  evaluations: IconClipboardList,
};
