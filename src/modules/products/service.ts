import { db } from "@/db";
import { productTable } from "@/db/schemas/products";
import type { ProductModel } from "@/modules/products/model";
import { eq } from "drizzle-orm";

export default abstract class ProductService {
  static async getAllProducts(): Promise<ProductModel["getAllProducts"]> {
    const data = await db.select().from(productTable);

    return data;
  }

  static async getProductById(
    id: number,
  ): Promise<ProductModel["getProductById"] | null> {
    const data = await db
      .select()
      .from(productTable)
      .where(eq(productTable.id, id));

    return data[0] || null;
  }
}
