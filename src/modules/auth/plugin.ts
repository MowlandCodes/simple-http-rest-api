import { logging } from "@/lib/logging";
import { BEARER_SCHEME } from "@/lib/openapi";
import AuthService from "@/modules/auth/service";
import { jwt } from "@elysiajs/jwt";
import { Elysia, status } from "elysia";

// Wajib ada sebelum boot, sama seperti DATABASE_URL di src/db/index.ts.
// Kalau tidak, token yang di-sign tidak akan bisa diverifikasi lagi.
const secret = Bun.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not defined");
}

// Ambil token dari header "Authorization: Bearer <token>".
// return null kalau header tidak ada / bukan Bearer / token kosong.
function getBearerToken(authorization: string | undefined): string | null {
  if (!authorization) return null;

  const [scheme, token, ...rest] = authorization.split(" ");
  if (rest.length > 0) return null;
  if (scheme?.toLowerCase() !== "bearer") return null;
  if (!token) return null;

  return token;
}

export const authGuard = new Elysia({ name: "auth-guard" })
  .use(logging)
  .use(
    jwt({
      name: "jwt",
      secret,
      exp: Bun.env.JWT_EXPIRES_IN ?? "7d",
    }),
  )
  .macro({
    isAuth: {
      detail: { security: [{ [BEARER_SCHEME]: [] }] },
      async resolve({ jwt, headers, log }) {
        const token = getBearerToken(headers.authorization);

        if (!token) {
          return status(401, {
            message: "Missing or invalid Authorization header",
            data: null,
          });
        }

        try {
          const payload = await jwt.verify(token);

          if (!payload || typeof payload.sub !== "string") {
            return status(401, {
              message: "Invalid or expired token",
              data: null,
            });
          }

          const id = Number(payload.sub);
          if (!Number.isInteger(id)) {
            return status(401, {
              message: "Invalid or expired token",
              data: null,
            });
          }

          // Di-read ulang dari database supaya user yang sudah dihapus
          // tidak tetap bisa pakai token lamanya.
          const user = await AuthService.findById(id);
          if (!user) {
            return status(401, {
              message: "Invalid or expired token",
              data: null,
            });
          }

          return { user };
        } catch (err) {
          log.error(err, { route: "auth guard" });
          return status(500, {
            message: "Internal server error",
            data: null,
          });
        }
      },
    },
  });
