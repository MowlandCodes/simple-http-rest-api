import { db } from "@/db";
import { productTable } from "@/db/schema";
import { Elysia } from "elysia";
import { ProductModel } from "@/modules/products/model";
import { eq } from "drizzle-orm";
import ProductService from "@/modules/products/service";

export const products = new Elysia({ prefix: "/products" });

products
  .use(ProductModel)
  .get(
    "/",
    async (ctx) => {
      const data = await ProductService.getAllProducts();

      if (data.length === 0) {
        ctx.set.status = 404;
        return { message: "No product found", data: null };
      }

      return { message: "Products found successfully", data };
    },
    {
      response: {
        200: "successResponse",
        404: "notFoundResponse",
      },
    },
  )
  .get(
    "/:id",
    async (ctx) => {
      const data = await ProductService.getProductById(ctx.params.id);

      if (!data) {
        ctx.set.status = 404;
        return { message: "Product not found", data: null };
      }

      return { message: "Product found successfully", data };
    },
    {
      params: "getProductByIdParams",
      response: {
        200: "successResponse",
        404: "notFoundResponse",
      },
    },
  )
  .post(
    "/",
    async ({ body }) => {
      const data = await db.insert(productTable).values(body).returning();

      return data;
    },
    {
      body: "createProduct",
    },
  );
