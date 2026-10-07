import { type MahasiswaModel } from "@/modules/mahasiswa/model";

const mahasiswas: MahasiswaModel["mahasiswas"] = [
  {
    studentId: "108084256279",
    name: "Marian Mossdale",
    major: "English",
  },
  {
    studentId: "382530322782",
    name: "Ibbie Josifovic",
    major: "Engineering",
  },
  {
    studentId: "866327519714",
    name: "Woody Yell",
    major: "English",
  },
  {
    studentId: "311994102630",
    name: "Nichole Bew",
    major: "History",
  },
  {
    studentId: "034641822982",
    name: "Ephrem Clowser",
    major: "Psychology",
  },
  {
    studentId: "372053973125",
    name: "Yorgo Ortner",
    major: "English",
  },
  {
    studentId: "414207936113",
    name: "Griz Fripp",
    major: "Psychology",
  },
  {
    studentId: "345691443690",
    name: "Bret Haycox",
    major: "History",
  },
  {
    studentId: "596747647878",
    name: "Upton Gaize",
    major: "Psychology",
  },
  {
    studentId: "792240056035",
    name: "Sybil St. Clair",
    major: "English",
  },
  {
    studentId: "147703992747",
    name: "Moyra Buttress",
    major: "History",
  },
  {
    studentId: "965633226302",
    name: "Adrea Sedworth",
    major: "Psychology",
  },
  {
    studentId: "333395723581",
    name: "Thebault Stopford",
    major: "Engineering",
  },
  {
    studentId: "040451851640",
    name: "Douglass Swinburne",
    major: "English",
  },
  {
    studentId: "589292514644",
    name: "Ginger Polfer",
    major: "Engineering",
  },
  {
    studentId: "202785516110",
    name: "Maurits Tabor",
    major: "Computer Science",
  },
  {
    studentId: "345104592444",
    name: "Sheelagh Evers",
    major: "Biology",
  },
  {
    studentId: "706247814348",
    name: "Delainey Josuweit",
    major: "Psychology",
  },
  {
    studentId: "166050992187",
    name: "Amii Bartolozzi",
    major: "Engineering",
  },
  {
    studentId: "548798405421",
    name: "Ethel Field",
    major: "History",
  },
  {
    studentId: "788407902627",
    name: "Debor Gregoriou",
    major: "Engineering",
  },
  {
    studentId: "974116530432",
    name: "Terri Esterbrook",
    major: "Psychology",
  },
  {
    studentId: "368504731821",
    name: "Thorsten Bumfrey",
    major: "Biology",
  },
  {
    studentId: "735496775506",
    name: "Eirena Gehrels",
    major: "Computer Science",
  },
  {
    studentId: "340380528229",
    name: "Sybilla Petrelli",
    major: "Computer Science",
  },
  {
    studentId: "504027428833",
    name: "Trixie Bushby",
    major: "Computer Science",
  },
  {
    studentId: "134195118773",
    name: "Tuckie Cape",
    major: "Biology",
  },
  {
    studentId: "722388760394",
    name: "Ramon Dawidman",
    major: "Psychology",
  },
  {
    studentId: "568630307858",
    name: "Aleksandr Callander",
    major: "Psychology",
  },
  {
    studentId: "618745431028",
    name: "Von Croft",
    major: "Engineering",
  },
  {
    studentId: "765854817842",
    name: "Aveline Poyntz",
    major: "Psychology",
  },
  {
    studentId: "066372735547",
    name: "Troy Pashan",
    major: "History",
  },
  {
    studentId: "512804278953",
    name: "Carlynn Galley",
    major: "Engineering",
  },
  {
    studentId: "218165345060",
    name: "Claudia Elintune",
    major: "Engineering",
  },
  {
    studentId: "635318924050",
    name: "Amabelle Halden",
    major: "Psychology",
  },
  {
    studentId: "454665542597",
    name: "Fanchette Darey",
    major: "English",
  },
  {
    studentId: "945278304983",
    name: "Glenine Batter",
    major: "English",
  },
  {
    studentId: "021959122649",
    name: "Vilma Nice",
    major: "English",
  },
  {
    studentId: "594202819644",
    name: "Gothart Bellward",
    major: "Engineering",
  },
  {
    studentId: "444803607765",
    name: "Emilio Keast",
    major: "Biology",
  },
  {
    studentId: "157478758781",
    name: "Chloris Sandercock",
    major: "Biology",
  },
  {
    studentId: "353533420825",
    name: "Mei Matt",
    major: "Psychology",
  },
  {
    studentId: "333921260872",
    name: "Correna Hennemann",
    major: "English",
  },
  {
    studentId: "429870874731",
    name: "Jacquelynn McGilmartin",
    major: "Psychology",
  },
  {
    studentId: "973181357826",
    name: "Davey Sprowle",
    major: "Computer Science",
  },
  {
    studentId: "276028299266",
    name: "Florida Grubb",
    major: "English",
  },
  {
    studentId: "440507839231",
    name: "Berna Boord",
    major: "Computer Science",
  },
  {
    studentId: "241673520049",
    name: "Pansy Scorton",
    major: "English",
  },
  {
    studentId: "377102507736",
    name: "Catriona Nisuis",
    major: "Engineering",
  },
  {
    studentId: "993435926630",
    name: "Garrard Josilevich",
    major: "Biology",
  },
];

export default abstract class Mahasiswa {
  static getAllMahasiswas() {
    return mahasiswas;
  }

  static getMahasiswaByStudentId(
    studentId: string,
  ): MahasiswaModel["mahasiswa"] | null {
    const mahasiswa = mahasiswas.find((m) => m.studentId === studentId);

    if (!mahasiswa) {
      return null;
    }

    return mahasiswa;
  }

  static createMahasiswa(mahasiswa: MahasiswaModel["mahasiswa"]) {
    const oldLength = mahasiswas.length;
    const newLength = mahasiswas.push(mahasiswa);

    // Make sure the mahasiswa was added successfully, and only 1 mahasiswa was added
    return newLength === oldLength + 1;
  }

  static updateMahasiswa(
    studentId: string,
    mahasiswa: MahasiswaModel["updateMahasiswa"],
  ): boolean {
    const index = mahasiswas.findIndex((m) => m.studentId === studentId);

    if (index === -1 || !mahasiswas[index]) {
      return false;
    }

    mahasiswas[index] = { ...mahasiswas[index], ...mahasiswa }; // bisa buat put sama patch, karena data lama di timpa sama data baru
    return true;
  }

  static deleteMahasiswa(studentId: string): boolean {
    const index = mahasiswas.findIndex((m) => m.studentId === studentId);

    if (index === -1 || !mahasiswas[index]) {
      return false;
    }

    mahasiswas.splice(index, 1);
    return true;
  }
}
