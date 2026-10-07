import Elysia from "elysia";
import Mahasiswa from "@/modules/mahasiswa/service";
import { MahasiswaModel } from "@/modules/mahasiswa/model";

export const mahasiswa = new Elysia({ prefix: "/mahasiswa" });

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
      response: {
        200: "successResponse",
        404: "notFoundResponse",
      },
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
      body: "updateMahasiswa",
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
      body: "updateMahasiswa",
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
    },
  )
  .connect("/", (ctx) => {
    return ctx.status(200, "Connection Established");
  });
