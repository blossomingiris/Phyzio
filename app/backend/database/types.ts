import { therapists, users } from "./schemas.ts";
export type User = typeof users.$inferSelect;
export type UserRole = (typeof users.$inferSelect)["role"];
export type Speciality = (typeof therapists.$inferSelect)["speciality"];
