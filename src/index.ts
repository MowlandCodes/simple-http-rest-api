import "dotenv/config";
import { Elysia } from "elysia";
import { mahasiswa } from "@/modules/mahasiswa";
import { products } from "@/modules/products";

new Elysia({
  prefix: "/api",
})
  .use(mahasiswa)
  .use(products)
  .onError((ctx) => {
    if (ctx.code === "NOT_FOUND") {
      return {
        message: "Not Found",
      };
    }
  })
  .listen(process.env.APP_PORT ?? 3100, (app) => {
    console.log(
      `🦊 Server is running on http://${app.url.hostname}:${app.url.port}`,
    );
  });
