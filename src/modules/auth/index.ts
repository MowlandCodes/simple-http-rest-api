import { AuthModel } from "@/modules/auth/model";
import { authGuard } from "@/modules/auth/plugin";
import AuthService from "@/modules/auth/service";
import { Elysia } from "elysia";

export const auth = new Elysia({ prefix: "/auth" });

auth
  // authGuard nyediain: logging, `jwt` (sign di login), dan macro `isAuth`
  .use(authGuard)
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
  // Contoh endpoint yang diproteksi: tanpa `isAuth` route ini tetap publik.
  .get(
    "/profile",
    ({ user }) => ({ message: "Profile fetched successfully", data: user }),
    {
      isAuth: true,
      response: {
        200: "authSuccess",
        401: "authError",
        500: "authError",
      },
    },
  );
