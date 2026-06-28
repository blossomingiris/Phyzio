import { appointments, clients, therapists, treatments, users } from "./schemas.ts";
export type User = typeof users.$inferSelect;
export type UserRole = (typeof users.$inferSelect)["role"];
export type Speciality = (typeof therapists.$inferSelect)["speciality"];
export type ClientOrigin = NonNullable<(typeof clients.$inferSelect)["origin"]>;
export type ClientCommunication = (typeof clients.$inferSelect)["preferredCommunication"];
export type AppointmentStatus = (typeof appointments.$inferSelect)["status"];
export type CancellationReason = NonNullable<(typeof appointments.$inferSelect)["cancellationReason"]>;
export type TreatmentCategory = (typeof treatments.$inferSelect)["category"];
