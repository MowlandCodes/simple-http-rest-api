import Elysia, { t, type UnwrapSchema } from "elysia";
import { GeneralModel } from "@/modules/general/model";

const mahasiswa = t.Object({
  name: t.String(),
  studentId: t.String(),
  major: t.String(),
});

const model = {
  mahasiswa,
  mahasiswas: t.Array(mahasiswa),
  getMahasiswaByStudentIdParams: t.Object({
    id: t.String(),
  }),
  updateMahasiswa: t.Partial(mahasiswa),
  idMahasiswaParams: t.Object({
    id: t.String(),
  }),
};

export const MahasiswaModel = new Elysia().use(GeneralModel).model(model);

export type MahasiswaModel = {
  [K in keyof typeof model]: UnwrapSchema<(typeof model)[K]>;
};
