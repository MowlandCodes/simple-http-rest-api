import { Elysia, t, type UnwrapSchema } from "elysia";

// Tidak pernah ikut dikirim ke client: password_hash disembunyikan lewat
// select eksplisit di service, bukan lewat response schema.
const authUser = t.Object({
  id: t.Number(),
  name: t.String(),
  email: t.String(),
  age: t.Nullable(t.Number()),
});

const model = {
  registerBody: t.Object({
    name: t.String({ minLength: 1 }),
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8 }),
    // Kolom age di users sekarang nullable (lihat migration add_password_hash_and_optional_age)
    age: t.Optional(t.Integer({ minimum: 0 })),
  }),
  loginBody: t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 1 }),
  }),
  authUser,
  registerSuccess: t.Object({
    message: t.String(),
    data: authUser,
  }),
  authSuccess: t.Object({
    message: t.String(),
    data: authUser,
  }),
  loginSuccess: t.Object({
    message: t.String(),
    data: t.Object({
      token: t.String(),
      user: authUser,
    }),
  }),
  authError: t.Object({
    message: t.String(),
    data: t.Null(),
  }),
};

export const AuthModel = new Elysia().model(model);

export type AuthModel = {
  [K in keyof typeof model]: UnwrapSchema<(typeof model)[K]>;
};
