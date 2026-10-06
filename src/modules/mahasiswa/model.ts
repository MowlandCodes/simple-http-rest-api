import { t, type UnwrapSchema } from "elysia";

export const MahasiswaModel = {
  mahasiswa: t.Object({
    name: t.String(),
    studentId: t.String(),
    major: t.String(),
  }),
} as const;

export type MahasiswaModel = {
  [k in keyof typeof MahasiswaModel]: UnwrapSchema<(typeof MahasiswaModel)[k]>;
};
