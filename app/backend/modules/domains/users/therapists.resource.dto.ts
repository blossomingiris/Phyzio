import Type, { type Static } from "typebox";
import { therapistResponse, workingHoursSchema } from "./therapists.admin.dto.ts";

export const updateMyScheduleBody = Type.Object(
  {
    phone: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
    workingHours: Type.Optional(workingHoursSchema),
  },
  { additionalProperties: false },
);

export const updateMyScheduleSchema = {
  tags: ["Me"],
  summary: "Update own schedule",
  body: updateMyScheduleBody,
  response: { 200: therapistResponse },
};

export type UpdateMyScheduleBody = Static<typeof updateMyScheduleBody>;
