import Type from "typebox";

const UserRoleLiteral = Type.Union([
  Type.Literal("admin"),
  Type.Literal("threrapist"),
]);

export const CreateUserBody = Type.Object({
  firstName: Type.String({ minLength: 1, maxLength: 255 }),
  lastName: Type.String({ minLength: 1, maxLength: 255 }),
  birthDate: Type.String({ format: "date" }),
  email: Type.String({ format: "email", maxLength: 255 }),
  password: Type.String({
    description: "Min 8 characters with uppercase, lowercase, and digit",
    minLength: 8,
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", //
  }),
  origin: Type.Optional(UserRoleLiteral),
});

export const UpdateUserBody = Type.Partial(CreateUserBody);
