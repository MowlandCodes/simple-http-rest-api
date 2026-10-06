import { Elysia } from "elysia";
import { mahasiswa } from "@/modules/mahasiswa";

const app = new Elysia({
  prefix: "/api",
});

app
  .use(mahasiswa)
  .onError((ctx) => {
    if (ctx.code === "NOT_FOUND") {
      return {
        message: "Not Found",
      };
    }
  })
  .listen(3100, (app) => {
    console.log(
      `🦊 Server is running on http://${app.url.hostname}:${app.url.port}`,
    );
  });
