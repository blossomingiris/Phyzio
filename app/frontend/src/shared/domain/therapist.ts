import { rqClient } from "@/shared/api/http-client";
import type { MethodResponse } from "openapi-react-query";

type TherapistListResponse = MethodResponse<
  typeof rqClient,
  "get",
  "/therapists/"
>;

export type Therapist = TherapistListResponse["data"][number];

export const SPECIALITY_LABELS: Record<Therapist["speciality"], string> = {
  orthopedic: "Orthopedic",
  sports: "Sports",
  neurology: "Neurology",
  pediatric: "Pediatric",
  geriatric: "Geriatric",
  cardio_pulmonary: "Cardio-Pulmonary",
  pelvic_floor: "Pelvic Floor",
  oncology: "Oncology",
  vestibular: "Vestibular",
};
