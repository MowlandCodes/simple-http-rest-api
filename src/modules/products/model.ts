import { Elysia, t, type UnwrapSchema } from "elysia";

const product = t.Object({
  id: t.Number(),
  nama: t.String(),
  harga: t.Number(),
  stok: t.Number(),
  created_at: t.Date(),
});

const model = {
  createProduct: t.Object({
    nama: t.String(),
    harga: t.Number(),
    stok: t.Number(),
  }),
  getProductById: product,
  getAllProducts: t.Array(product),
  getProductByIdParams: t.Object({
    id: t.Numeric(),
  }),
  successResponse: t.Object({
    message: t.String(),
    data: t.Union([t.Array(product), product]),
  }),
  notFoundResponse: t.Object({
    message: t.String(),
    data: t.Null(),
  }),
};

export const ProductModel = new Elysia().model(model);

export type ProductModel = {
  [K in keyof typeof model]: UnwrapSchema<(typeof model)[K]>;
};
