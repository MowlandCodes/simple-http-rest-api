import Elysia, { t, type UnwrapSchema } from "elysia";

const genericResponse = t.Object({
  message: t.String(),
  data: t.Any(),
});

const models = {
  notFoundResponse: genericResponse,
  successResponse: genericResponse,
  errorResponse: genericResponse,
};

export const GeneralModel = new Elysia().model(models);

export type GeneralModel = {
  [K in keyof typeof models]: UnwrapSchema<(typeof models)[K]>;
};
