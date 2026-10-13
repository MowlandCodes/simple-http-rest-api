import { db } from "@/db";
import { productTable } from "@/db/schema";
import { Elysia } from "elysia";
import { ProductModel } from "@/modules/products/model";
import { eq } from "drizzle-orm";

export const products = new Elysia({ prefix: "/products" });

products
  .use(ProductModel)
  .get("/", async () => {
    const data = await db.select().from(productTable);
    return data;
  })
  .get(
    "/:id",
    async ({ params }) => {
      const data = await db
        .select()
        .from(productTable)
        .where(eq(productTable.id, params.id));

      return data[0] || null;
    },
    { params: "getProductByIdParams" },
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
