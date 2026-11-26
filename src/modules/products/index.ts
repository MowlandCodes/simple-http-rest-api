import { db } from "@/db";
import { productTable } from "@/db/schemas/products";
import { logging } from "@/lib/logging";
import { authGuard } from "@/modules/auth/plugin";
import { ProductModel } from "@/modules/products/model";
import ProductService from "@/modules/products/service";
import { Elysia } from "elysia";

export const products = new Elysia({
  prefix: "/products",
  detail: { tags: ["Products"] },
});

products
  .use(logging)
  .use(authGuard)
  .use(ProductModel)
  .get(
    "/",
    async (ctx) => {
      try {
        const data = await ProductService.getAllProducts();

        if (data.length === 0) {
          ctx.set.status = 404;
          return { message: "No product found", data: null };
        }

        return { message: "Products found successfully", data };
      } catch (err) {
        ctx.log.error(err, { route: "GET /products" });
        ctx.set.status = 500;
        return { message: "Internal server error", data: null };
      }
    },
    {
      response: {
        200: "successResponse",
        404: "notFoundResponse",
      },
      isAuth: true,
      detail: { summary: "List products" },
    },
  )
  .get(
    "/:id",
    async (ctx) => {
      try {
        if (isNaN(Number(ctx.params.id))) {
          ctx.set.status = 400;
          return { message: "Invalid product ID", data: null };
        }

        const data = await ProductService.getProductById(Number(ctx.params.id));

        if (!data) {
          ctx.set.status = 404;
          return { message: "Product not found", data: null };
        }

        return { message: "Product found successfully", data };
      } catch (err) {
        ctx.log.error(err, { route: "GET /products/:id" });
        ctx.set.status = 500;
        return { message: "Internal server error", data: null };
      }
    },
    {
      params: "getProductByIdParams",
      response: {
        200: "successResponse",
        404: "notFoundResponse",
      },
      isAuth: true,
      detail: { summary: "Get product by ID" },
    },
  )
  .post(
    "/",
    async ({ body, set, log }) => {
      try {
        const data = await db.insert(productTable).values(body).returning();

        set.status = 201;
        return { message: "Product created successfully", data: data[0] };
      } catch (err) {
        log.error(err, { route: "POST /products" });
        set.status = 500;
        return { message: "Internal server error", data: null };
      }
    },
    {
      body: "createProduct",
      response: {
        201: "successResponse",
        500: "errorResponse",
      },
      isAuth: true,
      detail: { summary: "Create product" },
    },
  );
