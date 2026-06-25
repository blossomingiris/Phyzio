import { TimestampFields } from "#app/domains/shared/dto/index.ts";
import Type from "typebox";

const ClientOriginLiteral = Type.Union([
  Type.Literal("whats_up"),
  Type.Literal("phone"),
  Type.Literal("walk_in"),
  Type.Literal("other"),
]);

const ClientCommunicationLiteral = Type.Union([
  Type.Literal("whats_up"),
  Type.Literal("phone"),
  Type.Literal("email"),
]);

export const CreateClientBody = Type.Object({
  therapistId: Type.Optional(Type.Integer({ minimum: 1 })),
  firstName: Type.String({ minLength: 1, maxLength: 255 }),
  lastName: Type.String({ minLength: 1, maxLength: 255 }),
  birthDate: Type.Optional(Type.String({ format: "date" })),
  email: Type.Optional(Type.String({ format: "email", maxLength: 255 })),
  origin: Type.Optional(ClientOriginLiteral),
  preferredCommunication: Type.Optional(ClientCommunicationLiteral),
  medicalNotes: Type.Optional(Type.String()),
});

export const UpdateClientBody = Type.Partial(CreateClientBody);

export const ClientResponse = Type.Object({
  id: Type.Integer(),
  therapistId: Type.Union([Type.Integer(), Type.Null()]),
  firstName: Type.String(),
  lastName: Type.String(),
  birthDate: Type.Union([Type.String({ format: "date" }), Type.Null()]),
  email: Type.Union([Type.String({ format: "email" }), Type.Null()]),
  origin: Type.Union([ClientOriginLiteral, Type.Null()]),
  preferredCommunication: ClientCommunicationLiteral,
  medicalNotes: Type.Union([Type.String(), Type.Null()]),
  deletedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  ...TimestampFields,
});

export const ClientListResponse = Type.Array(ClientResponse);
