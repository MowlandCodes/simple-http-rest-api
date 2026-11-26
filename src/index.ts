import "dotenv/config";
import { Elysia } from "elysia";
import { logging } from "@/lib/logging";
import { openapiPlugin } from "@/lib/openapi";
import { auth } from "@/modules/auth";
import { mahasiswa } from "@/modules/mahasiswa";
import { products } from "@/modules/products";

new Elysia({
  prefix: "/api",
})
  .use(logging)
  .use(openapiPlugin)
  .use(auth)
  .use(mahasiswa)
  .use(products)
  .onError((ctx) => {
    if (ctx.code === "NOT_FOUND") {
      return {
        message: "Not Found",
      };
    }
  })
  .listen(Bun.env.APP_PORT ?? 3100, (app) => {
    logging.store.pino.info(
      { url: `http://${app.url.hostname}:${app.url.port}` },
      "Server started",
    );
  });
