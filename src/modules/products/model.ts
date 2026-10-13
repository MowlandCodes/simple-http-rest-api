import { Elysia, t, type UnwrapSchema } from "elysia";

const model = {
  createProduct: t.Object({
    nama: t.String(),
    harga: t.Number(),
    stok: t.Number(),
  }),
  getProductByIdParams: t.Object({
    id: t.Numeric(),
  }),
};

export const ProductModel = new Elysia().model(model);

export type ProductModel = {
  [K in keyof typeof model]: UnwrapSchema<(typeof model)[K]>;
};
