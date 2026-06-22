import { timestamp } from "drizzle-orm/pg-core";
import Type from "typebox";

export const Timestamp = Type.Object({
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
