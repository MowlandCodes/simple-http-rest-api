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
    id: t.String(), // Seharusnya bisa pake t.Numeric() tapi ada bug di elysia (Issue #2045 [https://github.com/elysiajs/elysia/issues/2045])
      // Solusi sementara pake t.String() dan nanti di controller diubah ke number
  }),
  successResponse: t.Object({
    message: t.String(),
    data: t.Union([t.Array(product), product]),
  }),
  notFoundResponse: t.Object({
    message: t.String(),
    data: t.Null(),
  }),
  errorResponse: t.Object({
    message: t.String(),
    data: t.Null(),
  })
};

export const ProductModel = new Elysia().model(model);

export type ProductModel = {
  [K in keyof typeof model]: UnwrapSchema<(typeof model)[K]>;
};
