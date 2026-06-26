import { clients, therapists, users } from "./schemas.ts";
export type User = typeof users.$inferSelect;
export type UserRole = (typeof users.$inferSelect)["role"];
export type Speciality = (typeof therapists.$inferSelect)["speciality"];
export type ClientOrigin = NonNullable<(typeof clients.$inferSelect)["origin"]>;
export type ClientCommunication = (typeof clients.$inferSelect)["preferredCommunication"];
