import Elysia from "elysia";
import Mahasiswa from "@/modules/mahasiswa/service";
import { MahasiswaModel } from "@/modules/mahasiswa/model";

export const mahasiswa = new Elysia({
  prefix: "/mahasiswa",
  detail: { tags: ["Mahasiswa"] },
});

mahasiswa
  .use(MahasiswaModel)
  .get(
    "/",
    () => ({
      message: "Mahasiswa found successfully",
      data: Mahasiswa.getAllMahasiswas(),
    }),
    {
      response: {
        200: "successResponse",
      },
      detail: { summary: "List all mahasiswa" },
    },
  )
  .get(
    "/:id",
    (ctx) => {
      const mahasiswa = Mahasiswa.getMahasiswaByStudentId(ctx.params.id);

      if (!mahasiswa) {
        ctx.set.status = "Not Found";
        return {
          message: `Mahasiswa with id ${ctx.params.id} is Not Found`,
          data: null,
        };
      }

      return {
        message: "Mahasiswa found successfully",
        data: mahasiswa,
      };
    },
    {
      params: "getMahasiswaByStudentIdParams",
      response: {
        200: "successResponse",
        404: "notFoundResponse",
      },
      detail: { summary: "Get mahasiswa by student ID" },
    },
  )
  .post(
    "/",
    (ctx) => {
      const isAdded = Mahasiswa.createMahasiswa(ctx.body);

      if (!isAdded) {
        ctx.set.status = "Internal Server Error";
        return {
          message: "Failed to add mahasiswa",
          data: null,
        };
      }

      ctx.set.status = "Created";
      return {
        message: "Mahasiswa added successfully",
        data: ctx.body,
      };
    },
    {
      body: "mahasiswa",
      response: {
        201: "successResponse",
        500: "errorResponse",
      },
      detail: { summary: "Create mahasiswa" },
    },
  )
  .put(
    "/:id",
    (ctx) => {
      const updated = Mahasiswa.updateMahasiswa(ctx.params.id, ctx.body);

      if (!updated) {
        ctx.set.status = "Not Found";
        return {
          message: `Mahasiswa with id ${ctx.params.id} is Not Found`,
          data: null,
        };
      }

      const updatedMahasiswa = Mahasiswa.getMahasiswaByStudentId(ctx.params.id);

      return {
        message: "Mahasiswa updated successfully",
        data: updatedMahasiswa,
      };
    },
    {
      params: "idMahasiswaParams",
      body: "updateMahasiswa",
      response: {
        200: "successResponse",
        404: "notFoundResponse",
      },
      detail: { summary: "Replace mahasiswa" },
    },
  )
  .patch(
    "/:id",
    (ctx) => {
      const updated = Mahasiswa.updateMahasiswa(ctx.params.id, ctx.body);

      if (!updated) {
        ctx.set.status = "Not Found";
        return {
          message: `Mahasiswa with id ${ctx.params.id} is Not Found`,
          data: null,
        };
      }

      const updatedMahasiswa = Mahasiswa.getMahasiswaByStudentId(ctx.params.id);

      return {
        message: "Mahasiswa updated successfully",
        data: updatedMahasiswa,
      };
    },
    {
      params: "idMahasiswaParams",
      body: "updateMahasiswa",
      response: {
        200: "successResponse",
        404: "notFoundResponse",
      },
      detail: { summary: "Partially update mahasiswa" },
    },
  )
  .delete(
    "/:id",
    (ctx) => {
      const deleted = Mahasiswa.deleteMahasiswa(ctx.params.id);

      if (!deleted) {
        ctx.set.status = "Not Found";
        return {
          message: `Mahasiswa with id ${ctx.params.id} is Not Found`,
          data: null,
        };
      }

      return {
        message: "Mahasiswa deleted successfully",
        data: null,
      };
    },
    {
      params: "idMahasiswaParams",
      response: {
        200: "successResponse",
        404: "errorResponse",
      },
      detail: { summary: "Delete mahasiswa" },
    },
  )
  .connect("/", (ctx) => {
    return ctx.status(200, "Connection Established");
  });
