import { rqClient } from "@/shared/api/http-client";
import {
  IconBabyCarriage,
  IconBone,
  IconBrain,
  IconEar,
  IconHeartbeat,
  IconRibbonHealth,
  IconRun,
  IconWalk,
  IconYoga,
  type Icon,
} from "@tabler/icons-react";
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

export const SPECIALITY_ICONS: Record<Therapist["speciality"], Icon> = {
  orthopedic: IconBone,
  sports: IconRun,
  neurology: IconBrain,
  pediatric: IconBabyCarriage,
  geriatric: IconWalk,
  cardio_pulmonary: IconHeartbeat,
  pelvic_floor: IconYoga,
  oncology: IconRibbonHealth,
  vestibular: IconEar,
};
