/**
 * Kabul administrative divisions for address selection.
 * Generated from afg_admin_boundaries.gdb (ADM1/ADM2).
 * Contains Kabul province and its 15 districts with English and Dari names.
 * Administrative codes are preserved as stable identifiers.
 */

export type District = {
  id: string;
  code: string;
  nameEn: string;
  nameFa: string;
};

export type Province = {
  id: string;
  code: string;
  nameEn: string;
  nameFa: string;
  districts: District[];
};

export const provinces: Province[] = [
  
  {
    "id": "kabul",
    "code": "AF01",
    "nameEn": "Kabul",
    "nameFa": "کابل",
    "districts": [
      {
        "id": "bagrami",
        "code": "AF0104",
        "nameEn": "Bagrami",
        "nameFa": "بگرامی"
      },
      {
        "id": "chahar-asyab",
        "code": "AF0103",
        "nameEn": "Chahar Asyab",
        "nameFa": "چهار آسیاب"
      },
      {
        "id": "deh-sabz",
        "code": "AF0105",
        "nameEn": "Deh Sabz",
        "nameFa": "ده سبز"
      },
      {
        "id": "estalef",
        "code": "AF0113",
        "nameEn": "Estalef",
        "nameFa": "استالف"
      },
      {
        "id": "farza",
        "code": "AF0112",
        "nameEn": "Farza",
        "nameFa": "فرزه"
      },
      {
        "id": "guldara",
        "code": "AF0111",
        "nameEn": "Guldara",
        "nameFa": "گلدره"
      },
      {
        "id": "kabul",
        "code": "AF0101",
        "nameEn": "Kabul",
        "nameFa": "کابل"
      },
      {
        "id": "kalakan",
        "code": "AF0110",
        "nameEn": "Kalakan",
        "nameFa": "کلکان"
      },
      {
        "id": "khak-e-jabbar",
        "code": "AF0109",
        "nameEn": "Khak-e-Jabbar",
        "nameFa": "خاک جبار"
      },
      {
        "id": "mir-bacha-kot",
        "code": "AF0108",
        "nameEn": "Mir Bacha Kot",
        "nameFa": "میر بچه کوت"
      },
      {
        "id": "musahi",
        "code": "AF0107",
        "nameEn": "Musahi",
        "nameFa": "موسهی"
      },
      {
        "id": "paghman",
        "code": "AF0102",
        "nameEn": "Paghman",
        "nameFa": "پغمان"
      },
      {
        "id": "qara-bagh",
        "code": "AF0114",
        "nameEn": "Qara Bagh",
        "nameFa": "قره باغ"
      },
      {
        "id": "shakar-dara",
        "code": "AF0106",
        "nameEn": "Shakar Dara",
        "nameFa": "شکردره"
      },
      {
        "id": "surobi",
        "code": "AF0115",
        "nameEn": "Surobi",
        "nameFa": "سروبی"
      }
    ]
  },
];

export const provinceById = new Map(
  provinces.map((province) => [province.id, province] as const),
);

export const provinceByCode = new Map(
  provinces.map((province) => [province.code, province] as const),
);
