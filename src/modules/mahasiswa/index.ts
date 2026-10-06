import Elysia from "elysia";
import Mahasiswa from "@/modules/mahasiswa/service";

export const mahasiswa = new Elysia({ prefix: "/mahasiswa" });

mahasiswa.get("/", () => Mahasiswa.getAllMahasiswas());
