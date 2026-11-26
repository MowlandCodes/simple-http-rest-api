import { db } from "@/db";
import { usersTable } from "@/db/schemas/users";
import type { AuthModel } from "@/modules/auth/model";
import { eq } from "drizzle-orm";

export default abstract class AuthService {
  // Argon2id adalah default Bun.password; disebut eksplisit biar jelas
  // algoritmanya, bukan diam-diam berubah di versi Bun berikutnya.
  static async hashPassword(password: string): Promise<string> {
    return Bun.password.hash(password, { algorithm: "argon2id" });
  }

  static async verifyPassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return Bun.password.verify(password, passwordHash);
  }

  // Email dinormalisasi (trim + lowercase) sebelum dipakai untuk insert/lookup.
  // Catatan: unique constraint di Postgres case-sensitive, jadi normalisasi
  // harus dilakukan di sini, bukan di database.
  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  static async emailExists(email: string): Promise<boolean> {
    const data = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, this.normalizeEmail(email)))
      .limit(1);

    return data.length > 0;
  }

  static async register(
    payload: AuthModel["registerBody"],
  ): Promise<AuthModel["authUser"] | null> {
    const passwordHash = await this.hashPassword(payload.password);

    const data = await db
      .insert(usersTable)
      .values({
        name: payload.name,
        email: this.normalizeEmail(payload.email),
        age: payload.age ?? null,
        passwordHash,
      })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        age: usersTable.age,
      });

    return data[0] ?? null;
  }

  // Mengembalikan passwordHash karena dibutuhkan untuk verifikasi login,
  // tapi tidak pernah masuk response (dipetik manual di route login).
  static async findByEmail(email: string) {
    const data = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        age: usersTable.age,
        passwordHash: usersTable.passwordHash,
      })
      .from(usersTable)
      .where(eq(usersTable.email, this.normalizeEmail(email)))
      .limit(1);

    return data[0] ?? null;
  }

  static async findById(id: number): Promise<AuthModel["authUser"] | null> {
    const data = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        age: usersTable.age,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return data[0] ?? null;
  }
}
