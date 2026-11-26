import { logging } from "@/lib/logging";
import { AuthModel } from "@/modules/auth/model";
import AuthService from "@/modules/auth/service";
import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

// Wajib ada sebelum boot, sama seperti DATABASE_URL di src/db/index.ts.
// Kalau tidak, token yang di-sign tidak akan bisa diverifikasi lagi.
const secret = Bun.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not defined");
}

export const auth = new Elysia({ prefix: "/auth" });

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

auth
  .use(logging)
  .use(
    jwt({
      name: "jwt",
      secret,
      // Berlaku sebagai default waktu sign (lihat JWTOption -> defaultValues)
      exp: Bun.env.JWT_EXPIRES_IN ?? "7d",
    }),
  )
  .use(AuthModel)
  .post(
    "/register",
    async ({ body, set, log }) => {
      try {
        if (await AuthService.emailExists(body.email)) {
          set.status = 409;
          return { message: "Email already registered", data: null };
        }

        const user = await AuthService.register(body);

        if (!user) {
          set.status = 500;
          return { message: "Internal server error", data: null };
        }

        set.status = 201;
        return { message: "User registered successfully", data: user };
      } catch (err) {
        log.error(err, { route: "POST /auth/register" });
        set.status = 500;
        return { message: "Internal server error", data: null };
      }
    },
    {
      body: "registerBody",
      response: {
        201: "registerSuccess",
        409: "authError",
        500: "authError",
      },
    },
  )
  .post(
    "/login",
    async ({ body, set, jwt, log }) => {
      try {
        const user = await AuthService.findByEmail(body.email);

        // Pesan yang sama untuk email tidak dikenal dan password salah,
        // biar tidak bocor info akun mana yang ada.
        const invalid = () => {
          set.status = 401;
          return { message: "Invalid email or password", data: null };
        };

        if (!user) return invalid();

        const valid = await AuthService.verifyPassword(
          body.password,
          user.passwordHash,
        );
        if (!valid) return invalid();

        const token = await jwt.sign({
          sub: String(user.id),
          email: user.email,
        });

        return {
          message: "Login successful",
          data: {
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              age: user.age,
            },
          },
        };
      } catch (err) {
        log.error(err, { route: "POST /auth/login" });
        set.status = 500;
        return { message: "Internal server error", data: null };
      }
    },
    {
      body: "loginBody",
      response: {
        200: "loginSuccess",
        401: "authError",
        500: "authError",
      },
    },
  )
  .get(
    "/profile",
    async ({ headers, jwt, set, log }) => {
      try {
        const token = getBearerToken(headers.authorization);

        if (!token) {
          set.status = 401;
          return { message: "Missing or invalid Authorization header", data: null };
        }

        // jwt.verify menangkap semua error dan mengembalikan false,
        // jadi token rusak/kadaluarsa jatuh ke sini, bukan ke catch.
        const payload = await jwt.verify(token);

        if (!payload || typeof payload.sub !== "string") {
          set.status = 401;
          return { message: "Invalid or expired token", data: null };
        }

        const id = Number(payload.sub);
        if (!Number.isInteger(id)) {
          set.status = 401;
          return { message: "Invalid or expired token", data: null };
        }

        // Di-read ulang dari database supaya user yang sudah dihapus
        // tidak tetap bisa dapat profile dari token lama.
        const user = await AuthService.findById(id);
        if (!user) {
          set.status = 401;
          return { message: "Invalid or expired token", data: null };
        }

        return { message: "Profile fetched successfully", data: user };
      } catch (err) {
        log.error(err, { route: "GET /auth/profile" });
        set.status = 500;
        return { message: "Internal server error", data: null };
      }
    },
    {
      response: {
        200: "authSuccess",
        401: "authError",
        500: "authError",
      },
    },
  );
