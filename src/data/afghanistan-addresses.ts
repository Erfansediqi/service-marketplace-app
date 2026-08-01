/**
 * Afghanistan administrative divisions for address selection.
 * Generated from afg_admin_boundaries.gdb (ADM1/ADM2).
 * Contains 34 provinces and 401 districts with English and Dari names.
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
    "id": "badakhshan",
    "code": "AF17",
    "nameEn": "Badakhshan",
    "nameFa": "بدخشان",
    "districts": [
      {
        "id": "arghanj-khwah",
        "code": "AF1703",
        "nameEn": "Arghanj Khwah",
        "nameFa": "ارغنچخواه"
      },
      {
        "id": "argo",
        "code": "AF1702",
        "nameEn": "Argo",
        "nameFa": "ارگو"
      },
      {
        "id": "baharak",
        "code": "AF1706",
        "nameEn": "Baharak",
        "nameFa": "بهارک"
      },
      {
        "id": "darayem",
        "code": "AF1707",
        "nameEn": "Darayem",
        "nameFa": "درایم"
      },
      {
        "id": "darwaz-e-balla",
        "code": "AF1727",
        "nameEn": "Darwaz-e-Balla",
        "nameFa": "دروازبالا ( نیسی)"
      },
      {
        "id": "darwaz-e-payin",
        "code": "AF1722",
        "nameEn": "Darwaz-e-Payin",
        "nameFa": "درواز پائین (ما می )"
      },
      {
        "id": "eshkashem",
        "code": "AF1723",
        "nameEn": "Eshkashem",
        "nameFa": "اشکاشم"
      },
      {
        "id": "fayzabad",
        "code": "AF1701",
        "nameEn": "Fayzabad",
        "nameFa": "فیض آباد"
      },
      {
        "id": "jorm",
        "code": "AF1710",
        "nameEn": "Jorm",
        "nameFa": "جرم"
      },
      {
        "id": "keshem",
        "code": "AF1715",
        "nameEn": "Keshem",
        "nameFa": "کشم"
      },
      {
        "id": "khash",
        "code": "AF1705",
        "nameEn": "Khash",
        "nameFa": "خاش"
      },
      {
        "id": "khwahan",
        "code": "AF1720",
        "nameEn": "Khwahan",
        "nameFa": "خواهان"
      },
      {
        "id": "kofab",
        "code": "AF1721",
        "nameEn": "Kofab",
        "nameFa": "کوف آب"
      },
      {
        "id": "kohistan",
        "code": "AF1708",
        "nameEn": "Kohistan",
        "nameFa": "کوهستان"
      },
      {
        "id": "koran-wa-monjan",
        "code": "AF1726",
        "nameEn": "Koran Wa Monjan",
        "nameFa": "کران ومنجان"
      },
      {
        "id": "raghestan",
        "code": "AF1714",
        "nameEn": "Raghestan",
        "nameFa": "راغستان"
      },
      {
        "id": "shahr-e-buzorg",
        "code": "AF1713",
        "nameEn": "Shahr-e-Buzorg",
        "nameFa": "شهر بزرگ"
      },
      {
        "id": "shaki",
        "code": "AF1724",
        "nameEn": "Shaki",
        "nameFa": "شکی"
      },
      {
        "id": "shighnan",
        "code": "AF1719",
        "nameEn": "Shighnan",
        "nameFa": "شغنان"
      },
      {
        "id": "shuhada",
        "code": "AF1712",
        "nameEn": "Shuhada",
        "nameFa": "شهدا"
      },
      {
        "id": "tagab",
        "code": "AF1717",
        "nameEn": "Tagab",
        "nameFa": "تگاب"
      },
      {
        "id": "teshkan",
        "code": "AF1711",
        "nameEn": "Teshkan",
        "nameFa": "تشکان"
      },
      {
        "id": "wakhan",
        "code": "AF1728",
        "nameEn": "Wakhan",
        "nameFa": "واخان"
      },
      {
        "id": "warduj",
        "code": "AF1716",
        "nameEn": "Warduj",
        "nameFa": "وردوج"
      },
      {
        "id": "yaftal-e-sufla",
        "code": "AF1704",
        "nameEn": "Yaftal-e-Sufla",
        "nameFa": "یفتل سفلی"
      },
      {
        "id": "yamgan",
        "code": "AF1718",
        "nameEn": "Yamgan",
        "nameFa": "یمگان"
      },
      {
        "id": "yawan",
        "code": "AF1709",
        "nameEn": "Yawan",
        "nameFa": "یاوان"
      },
      {
        "id": "zebak",
        "code": "AF1725",
        "nameEn": "Zebak",
        "nameFa": "زیباک"
      }
    ]
  },
  {
    "id": "badghis",
    "code": "AF31",
    "nameEn": "Badghis",
    "nameFa": "بادغیس",
    "districts": [
      {
        "id": "ab-kamari",
        "code": "AF3102",
        "nameEn": "Ab Kamari",
        "nameFa": "آب کمری"
      },
      {
        "id": "bala-murghab",
        "code": "AF3105",
        "nameEn": "Bala Murghab",
        "nameFa": "بالا مرغاب"
      },
      {
        "id": "ghormach",
        "code": "AF3107",
        "nameEn": "Ghormach",
        "nameFa": "غورماچ"
      },
      {
        "id": "jawand",
        "code": "AF3106",
        "nameEn": "Jawand",
        "nameFa": "جوند"
      },
      {
        "id": "muqur",
        "code": "AF3103",
        "nameEn": "Muqur",
        "nameFa": "مقر"
      },
      {
        "id": "qadis",
        "code": "AF3104",
        "nameEn": "Qadis",
        "nameFa": "قادیس"
      },
      {
        "id": "qala-e-naw",
        "code": "AF3101",
        "nameEn": "Qala-e-Naw",
        "nameFa": "قلعه نو"
      }
    ]
  },
  {
    "id": "baghlan",
    "code": "AF09",
    "nameEn": "Baghlan",
    "nameFa": "بغلان",
    "districts": [
      {
        "id": "andarab",
        "code": "AF0907",
        "nameEn": "Andarab",
        "nameFa": "اندراب"
      },
      {
        "id": "baghlan-e-jadid",
        "code": "AF0905",
        "nameEn": "Baghlan-e-Jadid",
        "nameFa": "بغلان جدید"
      },
      {
        "id": "burka",
        "code": "AF0910",
        "nameEn": "Burka",
        "nameFa": "بورکه"
      },
      {
        "id": "dahana-e-ghori",
        "code": "AF0902",
        "nameEn": "Dahana-e-Ghori",
        "nameFa": "دهنۀ غوری"
      },
      {
        "id": "deh-salah",
        "code": "AF0908",
        "nameEn": "Deh Salah",
        "nameFa": "ده صلاح"
      },
      {
        "id": "doshi",
        "code": "AF0903",
        "nameEn": "Doshi",
        "nameFa": "دوشی"
      },
      {
        "id": "fereng-wa-gharu",
        "code": "AF0915",
        "nameEn": "Fereng Wa Gharu",
        "nameFa": "فرنگ وغارو"
      },
      {
        "id": "guzargah-e-nur",
        "code": "AF0914",
        "nameEn": "Guzargah-e-Nur",
        "nameFa": "گذرگاه نور"
      },
      {
        "id": "khinjan",
        "code": "AF0906",
        "nameEn": "Khinjan",
        "nameFa": "خنجان"
      },
      {
        "id": "khost-wa-fereng",
        "code": "AF0913",
        "nameEn": "Khost Wa Fereng",
        "nameFa": "خوست و فرنگ"
      },
      {
        "id": "khwaja-hejran",
        "code": "AF0909",
        "nameEn": "Khwaja Hejran",
        "nameFa": "خواجه هجران"
      },
      {
        "id": "nahrin",
        "code": "AF0904",
        "nameEn": "Nahrin",
        "nameFa": "نهرین"
      },
      {
        "id": "pul-e-hisar",
        "code": "AF0912",
        "nameEn": "Pul-e-Hisar",
        "nameFa": "پل حصار"
      },
      {
        "id": "pul-e-khumri",
        "code": "AF0901",
        "nameEn": "Pul-e-Khumri",
        "nameFa": "پلخمری"
      },
      {
        "id": "tala-wa-barfak",
        "code": "AF0911",
        "nameEn": "Tala Wa Barfak",
        "nameFa": "تاله وبرفک"
      }
    ]
  },
  {
    "id": "balkh",
    "code": "AF21",
    "nameEn": "Balkh",
    "nameFa": "بلخ",
    "districts": [
      {
        "id": "balkh",
        "code": "AF2106",
        "nameEn": "Balkh",
        "nameFa": "بلخ"
      },
      {
        "id": "char-bolak",
        "code": "AF2111",
        "nameEn": "Char Bolak",
        "nameFa": "چار بولک"
      },
      {
        "id": "charkent",
        "code": "AF2104",
        "nameEn": "Charkent",
        "nameFa": "چار کنت"
      },
      {
        "id": "chemtal",
        "code": "AF2108",
        "nameEn": "Chemtal",
        "nameFa": "چمتال"
      },
      {
        "id": "dawlat-abad",
        "code": "AF2109",
        "nameEn": "Dawlat Abad",
        "nameFa": "دولت آباد"
      },
      {
        "id": "dehdadi",
        "code": "AF2103",
        "nameEn": "Dehdadi",
        "nameFa": "دهدادی"
      },
      {
        "id": "kaldar",
        "code": "AF2113",
        "nameEn": "Kaldar",
        "nameFa": "کلدار"
      },
      {
        "id": "keshendeh",
        "code": "AF2114",
        "nameEn": "Keshendeh",
        "nameFa": "کشنده"
      },
      {
        "id": "marmul",
        "code": "AF2105",
        "nameEn": "Marmul",
        "nameFa": "مارمُل"
      },
      {
        "id": "mazar-e-sharif",
        "code": "AF2101",
        "nameEn": "Mazar-e-Sharif",
        "nameFa": "مزار شریف"
      },
      {
        "id": "nahr-e-shahi",
        "code": "AF2102",
        "nameEn": "Nahr-e-Shahi",
        "nameFa": "نهر شاهی"
      },
      {
        "id": "sharak-e-hayratan",
        "code": "AF2116",
        "nameEn": "Sharak-e-Hayratan",
        "nameFa": "شهرک حیرتان"
      },
      {
        "id": "sholgareh",
        "code": "AF2107",
        "nameEn": "Sholgareh",
        "nameFa": "شولگره"
      },
      {
        "id": "shortepa",
        "code": "AF2112",
        "nameEn": "Shortepa",
        "nameFa": "شور تیپه"
      },
      {
        "id": "zari",
        "code": "AF2115",
        "nameEn": "Zari",
        "nameFa": "زاری"
      }
    ]
  },
  {
    "id": "bamyan",
    "code": "AF10",
    "nameEn": "Bamyan",
    "nameFa": "بامیان",
    "districts": [
      {
        "id": "bamyan",
        "code": "AF1001",
        "nameEn": "Bamyan",
        "nameFa": "بامیان"
      },
      {
        "id": "kahmard",
        "code": "AF1004",
        "nameEn": "Kahmard",
        "nameFa": "کهمرد"
      },
      {
        "id": "panjab",
        "code": "AF1006",
        "nameEn": "Panjab",
        "nameFa": "پنجاب"
      },
      {
        "id": "sayghan",
        "code": "AF1003",
        "nameEn": "Sayghan",
        "nameFa": "سیغان"
      },
      {
        "id": "shibar",
        "code": "AF1002",
        "nameEn": "Shibar",
        "nameFa": "شیبر"
      },
      {
        "id": "waras",
        "code": "AF1007",
        "nameEn": "Waras",
        "nameFa": "ورث"
      },
      {
        "id": "yakawlang",
        "code": "AF1005",
        "nameEn": "Yakawlang",
        "nameFa": "یکاولنگ"
      }
    ]
  },
  {
    "id": "daykundi",
    "code": "AF24",
    "nameEn": "Daykundi",
    "nameFa": "دایکندی",
    "districts": [
      {
        "id": "ashtarlay",
        "code": "AF2403",
        "nameEn": "Ashtarlay",
        "nameFa": "اشترلی"
      },
      {
        "id": "kajran",
        "code": "AF2408",
        "nameEn": "Kajran",
        "nameFa": "کجران"
      },
      {
        "id": "khadir",
        "code": "AF2404",
        "nameEn": "Khadir",
        "nameFa": "خدیر"
      },
      {
        "id": "kiti",
        "code": "AF2405",
        "nameEn": "Kiti",
        "nameFa": "کیتی"
      },
      {
        "id": "miramor",
        "code": "AF2406",
        "nameEn": "Miramor",
        "nameFa": "میرامور"
      },
      {
        "id": "nili",
        "code": "AF2401",
        "nameEn": "Nili",
        "nameFa": "نیلی"
      },
      {
        "id": "patoo",
        "code": "AF2409",
        "nameEn": "Patoo",
        "nameFa": "پاتو"
      },
      {
        "id": "sang-e-takht",
        "code": "AF2407",
        "nameEn": "Sang-e-Takht",
        "nameFa": "سنگ تخت"
      },
      {
        "id": "shahrestan",
        "code": "AF2402",
        "nameEn": "Shahrestan",
        "nameFa": "شهرستان"
      }
    ]
  },
  {
    "id": "farah",
    "code": "AF33",
    "nameEn": "Farah",
    "nameFa": "فراه",
    "districts": [
      {
        "id": "anar-dara",
        "code": "AF3307",
        "nameEn": "Anar Dara",
        "nameFa": "انار دره"
      },
      {
        "id": "bakwa",
        "code": "AF3308",
        "nameEn": "Bakwa",
        "nameFa": "بکواه"
      },
      {
        "id": "bala-buluk",
        "code": "AF3306",
        "nameEn": "Bala Buluk",
        "nameFa": "بالا بلوک"
      },
      {
        "id": "farah",
        "code": "AF3301",
        "nameEn": "Farah",
        "nameFa": "فراه"
      },
      {
        "id": "gulistan",
        "code": "AF3310",
        "nameEn": "Gulistan",
        "nameFa": "گلستان"
      },
      {
        "id": "khak-e-safed",
        "code": "AF3303",
        "nameEn": "Khak-e-Safed",
        "nameFa": "خاک سفید"
      },
      {
        "id": "lash-e-juwayn",
        "code": "AF3309",
        "nameEn": "Lash-e-Juwayn",
        "nameFa": "لاش جوین"
      },
      {
        "id": "pur-chaman",
        "code": "AF3311",
        "nameEn": "Pur Chaman",
        "nameFa": "پُرچمن"
      },
      {
        "id": "pushtrod",
        "code": "AF3302",
        "nameEn": "Pushtrod",
        "nameFa": "پشترود"
      },
      {
        "id": "qala-e-kah",
        "code": "AF3304",
        "nameEn": "Qala-e-Kah",
        "nameFa": "قلعه کاه"
      },
      {
        "id": "shibkoh",
        "code": "AF3305",
        "nameEn": "Shibkoh",
        "nameFa": "شیب کوه"
      }
    ]
  },
  {
    "id": "faryab",
    "code": "AF29",
    "nameEn": "Faryab",
    "nameFa": "فاریاب",
    "districts": [
      {
        "id": "almar",
        "code": "AF2904",
        "nameEn": "Almar",
        "nameFa": "المار"
      },
      {
        "id": "andkhoy",
        "code": "AF2913",
        "nameEn": "Andkhoy",
        "nameFa": "اندخوی"
      },
      {
        "id": "bilcheragh",
        "code": "AF2905",
        "nameEn": "Bilcheragh",
        "nameFa": "بلچراغ"
      },
      {
        "id": "dawlat-abad",
        "code": "AF2909",
        "nameEn": "Dawlat Abad",
        "nameFa": "دولت آباد"
      },
      {
        "id": "garzewan",
        "code": "AF2908",
        "nameEn": "Garzewan",
        "nameFa": "گرزیوان"
      },
      {
        "id": "khan-e-char-bagh",
        "code": "AF2914",
        "nameEn": "Khan-e-Char Bagh",
        "nameFa": "خان چارباغ"
      },
      {
        "id": "khwaja-sabz-posh",
        "code": "AF2903",
        "nameEn": "Khwaja Sabz Posh",
        "nameFa": "خواجه سبزپوش"
      },
      {
        "id": "kohistan",
        "code": "AF2910",
        "nameEn": "Kohistan",
        "nameFa": "کوهستان"
      },
      {
        "id": "maymana",
        "code": "AF2901",
        "nameEn": "Maymana",
        "nameFa": "میمنه"
      },
      {
        "id": "pashtun-kot",
        "code": "AF2902",
        "nameEn": "Pashtun Kot",
        "nameFa": "پشتون کوټ"
      },
      {
        "id": "qaram-qul",
        "code": "AF2911",
        "nameEn": "Qaram Qul",
        "nameFa": "قرم قل"
      },
      {
        "id": "qaysar",
        "code": "AF2907",
        "nameEn": "Qaysar",
        "nameFa": "قیصار"
      },
      {
        "id": "qurghan",
        "code": "AF2912",
        "nameEn": "Qurghan",
        "nameFa": "قرغان"
      },
      {
        "id": "shirin-tagab",
        "code": "AF2906",
        "nameEn": "Shirin Tagab",
        "nameFa": "شیرین تگاب"
      }
    ]
  },
  {
    "id": "ghazni",
    "code": "AF11",
    "nameEn": "Ghazni",
    "nameFa": "غزنی",
    "districts": [
      {
        "id": "ab-band",
        "code": "AF1113",
        "nameEn": "Ab Band",
        "nameFa": "آب بند"
      },
      {
        "id": "ajristan",
        "code": "AF1118",
        "nameEn": "Ajristan",
        "nameFa": "اجرستان"
      },
      {
        "id": "andar",
        "code": "AF1107",
        "nameEn": "Andar",
        "nameFa": "اندړ"
      },
      {
        "id": "deh-yak",
        "code": "AF1105",
        "nameEn": "Deh Yak",
        "nameFa": "ده یک"
      },
      {
        "id": "gelan",
        "code": "AF1117",
        "nameEn": "Gelan",
        "nameFa": "گیلان"
      },
      {
        "id": "ghazni",
        "code": "AF1101",
        "nameEn": "Ghazni",
        "nameFa": "غزنی"
      },
      {
        "id": "giro",
        "code": "AF1112",
        "nameEn": "Giro",
        "nameFa": "گیرو"
      },
      {
        "id": "jaghatu",
        "code": "AF1106",
        "nameEn": "Jaghatu",
        "nameFa": "جغتو"
      },
      {
        "id": "jaghuri",
        "code": "AF1114",
        "nameEn": "Jaghuri",
        "nameFa": "جاغوری"
      },
      {
        "id": "khwaja-umari",
        "code": "AF1103",
        "nameEn": "Khwaja Umari",
        "nameFa": "خواجه عمری"
      },
      {
        "id": "malistan",
        "code": "AF1116",
        "nameEn": "Malistan",
        "nameFa": "مالستان"
      },
      {
        "id": "muqur",
        "code": "AF1115",
        "nameEn": "Muqur",
        "nameFa": "مقر"
      },
      {
        "id": "nawa",
        "code": "AF1119",
        "nameEn": "Nawa",
        "nameFa": "ناوه"
      },
      {
        "id": "nawur",
        "code": "AF1110",
        "nameEn": "Nawur",
        "nameFa": "ناور"
      },
      {
        "id": "qara-bagh",
        "code": "AF1111",
        "nameEn": "Qara Bagh",
        "nameFa": "قره باغ"
      },
      {
        "id": "rashidan",
        "code": "AF1109",
        "nameEn": "Rashidan",
        "nameFa": "رشیدان"
      },
      {
        "id": "waghaz",
        "code": "AF1104",
        "nameEn": "Waghaz",
        "nameFa": "واغظ"
      },
      {
        "id": "wal-e-muhammad-e-shahid",
        "code": "AF1102",
        "nameEn": "Wal-e-Muhammad-e-Shahid",
        "nameFa": "ولی محمد شهید"
      },
      {
        "id": "zanakhan",
        "code": "AF1108",
        "nameEn": "Zanakhan",
        "nameFa": "زنه خان"
      }
    ]
  },
  {
    "id": "ghor",
    "code": "AF23",
    "nameEn": "Ghor",
    "nameFa": "غور",
    "districts": [
      {
        "id": "charsadra",
        "code": "AF2304",
        "nameEn": "Charsadra",
        "nameFa": "چار صد ره"
      },
      {
        "id": "dawlatyar",
        "code": "AF2303",
        "nameEn": "Dawlatyar",
        "nameFa": "دولت یار"
      },
      {
        "id": "dolayna",
        "code": "AF2302",
        "nameEn": "DoLayna",
        "nameFa": "دو لینه"
      },
      {
        "id": "feroz-koh",
        "code": "AF2301",
        "nameEn": "Feroz Koh",
        "nameFa": "فیروزکوه"
      },
      {
        "id": "lal-wa-sarjangal",
        "code": "AF2307",
        "nameEn": "Lal Wa Sarjangal",
        "nameFa": "لعل و سرجنگل"
      },
      {
        "id": "pasaband",
        "code": "AF2305",
        "nameEn": "Pasaband",
        "nameFa": "پسابند"
      },
      {
        "id": "saghar",
        "code": "AF2310",
        "nameEn": "Saghar",
        "nameFa": "ساغر"
      },
      {
        "id": "shahrak",
        "code": "AF2306",
        "nameEn": "Shahrak",
        "nameFa": "شهرک"
      },
      {
        "id": "taywarah",
        "code": "AF2308",
        "nameEn": "Taywarah",
        "nameFa": "تیوره"
      },
      {
        "id": "tolak",
        "code": "AF2309",
        "nameEn": "Tolak",
        "nameFa": "تولک"
      }
    ]
  },
  {
    "id": "hilmand",
    "code": "AF30",
    "nameEn": "Hilmand",
    "nameFa": "هلمند",
    "districts": [
      {
        "id": "baghran",
        "code": "AF3012",
        "nameEn": "Baghran",
        "nameFa": "باغران"
      },
      {
        "id": "deh-e-shu",
        "code": "AF3013",
        "nameEn": "Deh-e-Shu",
        "nameFa": "دیشو"
      },
      {
        "id": "garmser",
        "code": "AF3006",
        "nameEn": "Garmser",
        "nameFa": "گرم سیر"
      },
      {
        "id": "kajaki",
        "code": "AF3010",
        "nameEn": "Kajaki",
        "nameFa": "کجکی"
      },
      {
        "id": "lashkargah",
        "code": "AF3001",
        "nameEn": "Lashkargah",
        "nameFa": "لشکرگاه"
      },
      {
        "id": "musa-qala",
        "code": "AF3009",
        "nameEn": "Musa Qala",
        "nameFa": "موسی قلعه"
      },
      {
        "id": "nad-e-ali",
        "code": "AF3002",
        "nameEn": "Nad-e-Ali",
        "nameFa": "نادعلی"
      },
      {
        "id": "nahr-e-saraj",
        "code": "AF3004",
        "nameEn": "Nahr-e-Saraj",
        "nameFa": "نهر سراج"
      },
      {
        "id": "nawa-e-barakzaiy",
        "code": "AF3003",
        "nameEn": "Nawa-e-Barakzaiy",
        "nameFa": "ناوه بارکزائی"
      },
      {
        "id": "nawzad",
        "code": "AF3007",
        "nameEn": "Nawzad",
        "nameFa": "نوزاد"
      },
      {
        "id": "reg-i-khan-nishin",
        "code": "AF3011",
        "nameEn": "Reg-i-Khan Nishin",
        "nameFa": "ریگ خان نشین"
      },
      {
        "id": "sangin",
        "code": "AF3008",
        "nameEn": "Sangin",
        "nameFa": "سنگین"
      },
      {
        "id": "washer",
        "code": "AF3005",
        "nameEn": "Washer",
        "nameFa": "واشیر"
      }
    ]
  },
  {
    "id": "hirat",
    "code": "AF32",
    "nameEn": "Hirat",
    "nameFa": "هرات",
    "districts": [
      {
        "id": "adraskan",
        "code": "AF3209",
        "nameEn": "Adraskan",
        "nameFa": "ادرسکن"
      },
      {
        "id": "chisht-e-sharif",
        "code": "AF3216",
        "nameEn": "Chisht-e-Sharif",
        "nameFa": "چشت شریف"
      },
      {
        "id": "farsi",
        "code": "AF3215",
        "nameEn": "Farsi",
        "nameFa": "فرسی"
      },
      {
        "id": "ghoryan",
        "code": "AF3211",
        "nameEn": "Ghoryan",
        "nameFa": "غوریان"
      },
      {
        "id": "gulran",
        "code": "AF3208",
        "nameEn": "Gulran",
        "nameFa": "گلران"
      },
      {
        "id": "guzara",
        "code": "AF3203",
        "nameEn": "Guzara",
        "nameFa": "گذره"
      },
      {
        "id": "hirat",
        "code": "AF3201",
        "nameEn": "Hirat",
        "nameFa": "هرات"
      },
      {
        "id": "injil",
        "code": "AF3202",
        "nameEn": "Injil",
        "nameFa": "انجیل"
      },
      {
        "id": "karukh",
        "code": "AF3204",
        "nameEn": "Karukh",
        "nameFa": "کرُخ"
      },
      {
        "id": "kohsan",
        "code": "AF3213",
        "nameEn": "Kohsan",
        "nameFa": "کوهسان"
      },
      {
        "id": "kushk",
        "code": "AF3207",
        "nameEn": "Kushk",
        "nameFa": "کُشک"
      },
      {
        "id": "kushk-e-kuhna",
        "code": "AF3210",
        "nameEn": "Kushk-e-Kuhna",
        "nameFa": "کُشک کهنه"
      },
      {
        "id": "obe",
        "code": "AF3212",
        "nameEn": "Obe",
        "nameFa": "اوبی"
      },
      {
        "id": "pashtun-zarghun",
        "code": "AF3206",
        "nameEn": "Pashtun Zarghun",
        "nameFa": "پشتون زرغون"
      },
      {
        "id": "shindand",
        "code": "AF3214",
        "nameEn": "Shindand",
        "nameFa": "شیندند"
      },
      {
        "id": "zindajan",
        "code": "AF3205",
        "nameEn": "Zindajan",
        "nameFa": "زنده جان"
      }
    ]
  },
  {
    "id": "jawzjan",
    "code": "AF28",
    "nameEn": "Jawzjan",
    "nameFa": "جوزجان",
    "districts": [
      {
        "id": "aqcha",
        "code": "AF2807",
        "nameEn": "Aqcha",
        "nameFa": "آقچه"
      },
      {
        "id": "darzab",
        "code": "AF2811",
        "nameEn": "Darzab",
        "nameFa": "درز آب"
      },
      {
        "id": "fayzabad",
        "code": "AF2808",
        "nameEn": "Fayzabad",
        "nameFa": "فیض آباد"
      },
      {
        "id": "khamyab",
        "code": "AF2806",
        "nameEn": "Khamyab",
        "nameFa": "خمیاب"
      },
      {
        "id": "khanaqa",
        "code": "AF2803",
        "nameEn": "Khanaqa",
        "nameFa": "خانقا"
      },
      {
        "id": "khwaja-dukoh",
        "code": "AF2802",
        "nameEn": "Khwaja Dukoh",
        "nameFa": "خواجه دوکوه"
      },
      {
        "id": "mardyan",
        "code": "AF2809",
        "nameEn": "Mardyan",
        "nameFa": "مردیان"
      },
      {
        "id": "mingajik",
        "code": "AF2804",
        "nameEn": "Mingajik",
        "nameFa": "منگجک"
      },
      {
        "id": "qarqin",
        "code": "AF2810",
        "nameEn": "Qarqin",
        "nameFa": "قرقین"
      },
      {
        "id": "qush-tepa",
        "code": "AF2805",
        "nameEn": "Qush Tepa",
        "nameFa": "قوش تیپه"
      },
      {
        "id": "shiberghan",
        "code": "AF2801",
        "nameEn": "Shiberghan",
        "nameFa": "شبرغان"
      }
    ]
  },
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
  {
    "id": "kandahar",
    "code": "AF27",
    "nameEn": "Kandahar",
    "nameFa": "کندهار",
    "districts": [
      {
        "id": "arghandab",
        "code": "AF2702",
        "nameEn": "Arghandab",
        "nameFa": "ارغنداب"
      },
      {
        "id": "arghestan",
        "code": "AF2708",
        "nameEn": "Arghestan",
        "nameFa": "ارغستان"
      },
      {
        "id": "daman",
        "code": "AF2703",
        "nameEn": "Daman",
        "nameFa": "دامان"
      },
      {
        "id": "ghorak",
        "code": "AF2709",
        "nameEn": "Ghorak",
        "nameFa": "غورک"
      },
      {
        "id": "kandahar",
        "code": "AF2701",
        "nameEn": "Kandahar",
        "nameFa": "کندهار"
      },
      {
        "id": "khakrez",
        "code": "AF2707",
        "nameEn": "Khakrez",
        "nameFa": "خاکریز"
      },
      {
        "id": "maruf",
        "code": "AF2715",
        "nameEn": "Maruf",
        "nameFa": "معروف"
      },
      {
        "id": "maywand",
        "code": "AF2710",
        "nameEn": "Maywand",
        "nameFa": "میوند"
      },
      {
        "id": "miyanshin",
        "code": "AF2713",
        "nameEn": "Miyanshin",
        "nameFa": "میانشین"
      },
      {
        "id": "nesh",
        "code": "AF2712",
        "nameEn": "Nesh",
        "nameFa": "نیش"
      },
      {
        "id": "panjwayi",
        "code": "AF2704",
        "nameEn": "Panjwayi",
        "nameFa": "پنجوائی"
      },
      {
        "id": "reg",
        "code": "AF2716",
        "nameEn": "Reg",
        "nameFa": "ریگ ( شگه )"
      },
      {
        "id": "shah-wali-kot",
        "code": "AF2706",
        "nameEn": "Shah Wali Kot",
        "nameFa": "شاه ولی کوت"
      },
      {
        "id": "shorabak",
        "code": "AF2714",
        "nameEn": "Shorabak",
        "nameFa": "شور آبک"
      },
      {
        "id": "spin-boldak",
        "code": "AF2711",
        "nameEn": "Spin Boldak",
        "nameFa": "سپین بولدک"
      },
      {
        "id": "zheray",
        "code": "AF2705",
        "nameEn": "Zheray",
        "nameFa": "ژړۍ"
      }
    ]
  },
  {
    "id": "kapisa",
    "code": "AF02",
    "nameEn": "Kapisa",
    "nameFa": "کاپیسا",
    "districts": [
      {
        "id": "alasay",
        "code": "AF0207",
        "nameEn": "Alasay",
        "nameFa": "اله سای"
      },
      {
        "id": "hisa-e-awal-e-kohistan",
        "code": "AF0204",
        "nameEn": "Hisa-e-Awal-e-Kohistan",
        "nameFa": "حصه اول کوهستان"
      },
      {
        "id": "hisa-e-duwum-e-kohistan",
        "code": "AF0202",
        "nameEn": "Hisa-e-Duwum-e-Kohistan",
        "nameFa": "حصه دوم کوهستان"
      },
      {
        "id": "koh-band",
        "code": "AF0203",
        "nameEn": "Koh Band",
        "nameFa": "کوه بند"
      },
      {
        "id": "mahmood-e-raqi",
        "code": "AF0201",
        "nameEn": "Mahmood-e-Raqi",
        "nameFa": "محمود راقی"
      },
      {
        "id": "nijrab",
        "code": "AF0205",
        "nameEn": "Nijrab",
        "nameFa": "نجراب"
      },
      {
        "id": "tagab",
        "code": "AF0206",
        "nameEn": "Tagab",
        "nameFa": "تگاب"
      }
    ]
  },
  {
    "id": "khost",
    "code": "AF14",
    "nameEn": "Khost",
    "nameFa": "خوست",
    "districts": [
      {
        "id": "bak",
        "code": "AF1409",
        "nameEn": "Bak",
        "nameFa": "باک"
      },
      {
        "id": "gurbuz",
        "code": "AF1403",
        "nameEn": "Gurbuz",
        "nameFa": "گربز"
      },
      {
        "id": "jaji-maydan",
        "code": "AF1413",
        "nameEn": "Jaji Maydan",
        "nameFa": "جاجی میدان"
      },
      {
        "id": "mandozayi",
        "code": "AF1402",
        "nameEn": "Mandozayi",
        "nameFa": "مندوزائی"
      },
      {
        "id": "matun",
        "code": "AF1401",
        "nameEn": "Matun",
        "nameFa": "خوست (متون)"
      },
      {
        "id": "musa-khel",
        "code": "AF1405",
        "nameEn": "Musa Khel",
        "nameFa": "موسی خیل"
      },
      {
        "id": "nadir-shah-kot",
        "code": "AF1406",
        "nameEn": "Nadir Shah Kot",
        "nameFa": "نادرشاه کوت"
      },
      {
        "id": "qalandar",
        "code": "AF1410",
        "nameEn": "Qalandar",
        "nameFa": "قلندر"
      },
      {
        "id": "sabari",
        "code": "AF1407",
        "nameEn": "Sabari",
        "nameFa": "صبری"
      },
      {
        "id": "shamal",
        "code": "AF1412",
        "nameEn": "Shamal",
        "nameFa": "شمل"
      },
      {
        "id": "spera",
        "code": "AF1411",
        "nameEn": "Spera",
        "nameFa": "سپیره"
      },
      {
        "id": "tani",
        "code": "AF1404",
        "nameEn": "Tani",
        "nameFa": "تنی"
      },
      {
        "id": "terezayi",
        "code": "AF1408",
        "nameEn": "Terezayi",
        "nameFa": "تری زائی"
      }
    ]
  },
  {
    "id": "kunar",
    "code": "AF15",
    "nameEn": "Kunar",
    "nameFa": "کنر ها",
    "districts": [
      {
        "id": "asad-abad",
        "code": "AF1501",
        "nameEn": "Asad Abad",
        "nameFa": "اسد آباد"
      },
      {
        "id": "bar-kunar",
        "code": "AF1508",
        "nameEn": "Bar Kunar",
        "nameFa": "برکنر"
      },
      {
        "id": "chapa-dara",
        "code": "AF1513",
        "nameEn": "Chapa Dara",
        "nameFa": "چپه دره"
      },
      {
        "id": "chawkay",
        "code": "AF1509",
        "nameEn": "Chawkay",
        "nameFa": "چوکی"
      },
      {
        "id": "dangam",
        "code": "AF1512",
        "nameEn": "Dangam",
        "nameFa": "دانگام"
      },
      {
        "id": "dara-e-pech",
        "code": "AF1507",
        "nameEn": "Dara-e-Pech",
        "nameFa": "دره پیچ"
      },
      {
        "id": "ghazi-abad",
        "code": "AF1511",
        "nameEn": "Ghazi Abad",
        "nameFa": "غازی آباد"
      },
      {
        "id": "khas-kunar",
        "code": "AF1510",
        "nameEn": "Khas Kunar",
        "nameFa": "خاص کنر"
      },
      {
        "id": "marawara",
        "code": "AF1502",
        "nameEn": "Marawara",
        "nameFa": "مروره"
      },
      {
        "id": "narang",
        "code": "AF1504",
        "nameEn": "Narang",
        "nameFa": "نرنگ"
      },
      {
        "id": "nari",
        "code": "AF1515",
        "nameEn": "Nari",
        "nameFa": "ناړی"
      },
      {
        "id": "nurgal",
        "code": "AF1514",
        "nameEn": "Nurgal",
        "nameFa": "نورگل"
      },
      {
        "id": "sar-kani",
        "code": "AF1505",
        "nameEn": "Sar Kani",
        "nameFa": "سرکانی"
      },
      {
        "id": "shigal",
        "code": "AF1506",
        "nameEn": "Shigal",
        "nameFa": "شیگل وشلتن"
      },
      {
        "id": "watapur",
        "code": "AF1503",
        "nameEn": "Watapur",
        "nameFa": "وته پور"
      }
    ]
  },
  {
    "id": "kunduz",
    "code": "AF19",
    "nameEn": "Kunduz",
    "nameFa": "کندز",
    "districts": [
      {
        "id": "ali-abad",
        "code": "AF1903",
        "nameEn": "Ali Abad",
        "nameFa": "علی آباد"
      },
      {
        "id": "chahar-darah",
        "code": "AF1902",
        "nameEn": "Chahar Darah",
        "nameFa": "چهار دره"
      },
      {
        "id": "dasht-e-archi",
        "code": "AF1906",
        "nameEn": "Dasht-e-Archi",
        "nameFa": "دشت ارچی"
      },
      {
        "id": "imam-sahib",
        "code": "AF1905",
        "nameEn": "Imam Sahib",
        "nameFa": "امام صاحب"
      },
      {
        "id": "khan-abad",
        "code": "AF1904",
        "nameEn": "Khan Abad",
        "nameFa": "خان آباد"
      },
      {
        "id": "kunduz",
        "code": "AF1901",
        "nameEn": "Kunduz",
        "nameFa": "کندز"
      },
      {
        "id": "qala-e-zal",
        "code": "AF1907",
        "nameEn": "Qala-e-Zal",
        "nameFa": "قلعه ذال"
      }
    ]
  },
  {
    "id": "laghman",
    "code": "AF07",
    "nameEn": "Laghman",
    "nameFa": "لغمان",
    "districts": [
      {
        "id": "alingar",
        "code": "AF0704",
        "nameEn": "Alingar",
        "nameFa": "علینگار"
      },
      {
        "id": "alishang",
        "code": "AF0703",
        "nameEn": "Alishang",
        "nameFa": "علیشنگ"
      },
      {
        "id": "dawlatshah",
        "code": "AF0705",
        "nameEn": "Dawlatshah",
        "nameFa": "دولت شاه"
      },
      {
        "id": "mehtarlam",
        "code": "AF0701",
        "nameEn": "Mehtarlam",
        "nameFa": "مهتر لام"
      },
      {
        "id": "qarghayi",
        "code": "AF0702",
        "nameEn": "Qarghayi",
        "nameFa": "قرغه ئی"
      }
    ]
  },
  {
    "id": "logar",
    "code": "AF05",
    "nameEn": "Logar",
    "nameFa": "لوگر",
    "districts": [
      {
        "id": "azra",
        "code": "AF0507",
        "nameEn": "Azra",
        "nameFa": "ازره"
      },
      {
        "id": "baraki-barak",
        "code": "AF0502",
        "nameEn": "Baraki Barak",
        "nameFa": "برکی برک"
      },
      {
        "id": "charkh",
        "code": "AF0503",
        "nameEn": "Charkh",
        "nameFa": "چرخ"
      },
      {
        "id": "kharwar",
        "code": "AF0506",
        "nameEn": "Kharwar",
        "nameFa": "خروار"
      },
      {
        "id": "khoshi",
        "code": "AF0504",
        "nameEn": "Khoshi",
        "nameFa": "خوشی"
      },
      {
        "id": "mohammad-agha",
        "code": "AF0505",
        "nameEn": "Mohammad Agha",
        "nameFa": "محمدآغه"
      },
      {
        "id": "pul-e-alam",
        "code": "AF0501",
        "nameEn": "Pul-e-Alam",
        "nameFa": "پل علم"
      }
    ]
  },
  {
    "id": "maidan-wardak",
    "code": "AF04",
    "nameEn": "Maidan Wardak",
    "nameFa": "میدان وردک",
    "districts": [
      {
        "id": "chak-e-wardak",
        "code": "AF0404",
        "nameEn": "Chak-e-Wardak",
        "nameFa": "چک"
      },
      {
        "id": "daymirdad",
        "code": "AF0406",
        "nameEn": "Daymirdad",
        "nameFa": "دایمیرداد"
      },
      {
        "id": "hesa-e-awal-e-behsud",
        "code": "AF0407",
        "nameEn": "Hesa-e-Awal-e-Behsud",
        "nameFa": "حصه اول بهسود"
      },
      {
        "id": "jaghatu",
        "code": "AF0408",
        "nameEn": "Jaghatu",
        "nameFa": "جغتو"
      },
      {
        "id": "jalrez",
        "code": "AF0403",
        "nameEn": "Jalrez",
        "nameFa": "جلریز"
      },
      {
        "id": "markaz-e-behsud",
        "code": "AF0409",
        "nameEn": "Markaz-e-Behsud",
        "nameFa": "مدکز بهسود"
      },
      {
        "id": "maydan-shahr",
        "code": "AF0401",
        "nameEn": "Maydan Shahr",
        "nameFa": "میدان شهر"
      },
      {
        "id": "nerkh",
        "code": "AF0402",
        "nameEn": "Nerkh",
        "nameFa": "نرخ"
      },
      {
        "id": "saydabad",
        "code": "AF0405",
        "nameEn": "Saydabad",
        "nameFa": "سید آباد"
      }
    ]
  },
  {
    "id": "nangarhar",
    "code": "AF06",
    "nameEn": "Nangarhar",
    "nameFa": "ننگرهار",
    "districts": [
      {
        "id": "achin",
        "code": "AF0615",
        "nameEn": "Achin",
        "nameFa": "اچین"
      },
      {
        "id": "bati-kot",
        "code": "AF0609",
        "nameEn": "Bati Kot",
        "nameFa": "بتی کوټ"
      },
      {
        "id": "behsud",
        "code": "AF0602",
        "nameEn": "Behsud",
        "nameFa": "بهسود"
      },
      {
        "id": "chaparhar",
        "code": "AF0604",
        "nameEn": "Chaparhar",
        "nameFa": "چپر هار"
      },
      {
        "id": "dara-e-nur",
        "code": "AF0612",
        "nameEn": "Dara-e-Nur",
        "nameFa": "دره نور"
      },
      {
        "id": "deh-bala",
        "code": "AF0610",
        "nameEn": "Deh Bala",
        "nameFa": "ده بالا"
      },
      {
        "id": "dur-baba",
        "code": "AF0622",
        "nameEn": "Dur Baba",
        "nameFa": "دُر بابا"
      },
      {
        "id": "goshta",
        "code": "AF0614",
        "nameEn": "Goshta",
        "nameFa": "گوشته"
      },
      {
        "id": "hesarak",
        "code": "AF0621",
        "nameEn": "Hesarak",
        "nameFa": "حصارک"
      },
      {
        "id": "jalalabad",
        "code": "AF0601",
        "nameEn": "Jalalabad",
        "nameFa": "جلال آباد"
      },
      {
        "id": "kama",
        "code": "AF0605",
        "nameEn": "Kama",
        "nameFa": "کامه"
      },
      {
        "id": "khogyani",
        "code": "AF0608",
        "nameEn": "Khogyani",
        "nameFa": "خوگیانی"
      },
      {
        "id": "kot",
        "code": "AF0613",
        "nameEn": "Kot",
        "nameFa": "کوټ"
      },
      {
        "id": "kuz-kunar",
        "code": "AF0606",
        "nameEn": "Kuz Kunar",
        "nameFa": "کوز کنر"
      },
      {
        "id": "lalpur",
        "code": "AF0618",
        "nameEn": "Lalpur",
        "nameFa": "لعل پور"
      },
      {
        "id": "muhmand-dara",
        "code": "AF0617",
        "nameEn": "Muhmand Dara",
        "nameFa": "مهمند دره"
      },
      {
        "id": "nazyan",
        "code": "AF0620",
        "nameEn": "Nazyan",
        "nameFa": "نازیان"
      },
      {
        "id": "pachir-wa-agam",
        "code": "AF0611",
        "nameEn": "Pachir Wa Agam",
        "nameFa": "پچیراگام"
      },
      {
        "id": "rodat",
        "code": "AF0607",
        "nameEn": "Rodat",
        "nameFa": "رودات"
      },
      {
        "id": "sherzad",
        "code": "AF0619",
        "nameEn": "Sherzad",
        "nameFa": "شیرزاد"
      },
      {
        "id": "shinwar",
        "code": "AF0616",
        "nameEn": "Shinwar",
        "nameFa": "شینوار"
      },
      {
        "id": "surkh-rod",
        "code": "AF0603",
        "nameEn": "Surkh Rod",
        "nameFa": "سرخ رود"
      }
    ]
  },
  {
    "id": "nimroz",
    "code": "AF34",
    "nameEn": "Nimroz",
    "nameFa": "نیمروز",
    "districts": [
      {
        "id": "chakhansur",
        "code": "AF3403",
        "nameEn": "Chakhansur",
        "nameFa": "چخانسور"
      },
      {
        "id": "char-burjak",
        "code": "AF3404",
        "nameEn": "Char Burjak",
        "nameFa": "چاربرجک"
      },
      {
        "id": "kang",
        "code": "AF3402",
        "nameEn": "Kang",
        "nameFa": "کنگ"
      },
      {
        "id": "khashrod",
        "code": "AF3405",
        "nameEn": "Khashrod",
        "nameFa": "خاش رود"
      },
      {
        "id": "zaranj",
        "code": "AF3401",
        "nameEn": "Zaranj",
        "nameFa": "زرنج"
      }
    ]
  },
  {
    "id": "nuristan",
    "code": "AF16",
    "nameEn": "Nuristan",
    "nameFa": "نورستان",
    "districts": [
      {
        "id": "barg-e-matal",
        "code": "AF1608",
        "nameEn": "Barg-e-Matal",
        "nameFa": "برگ متال"
      },
      {
        "id": "duab",
        "code": "AF1605",
        "nameEn": "Duab",
        "nameFa": "دو آب"
      },
      {
        "id": "kamdesh",
        "code": "AF1606",
        "nameEn": "Kamdesh",
        "nameFa": "کامدیش"
      },
      {
        "id": "mandol",
        "code": "AF1607",
        "nameEn": "Mandol",
        "nameFa": "مندول"
      },
      {
        "id": "nurgaram",
        "code": "AF1604",
        "nameEn": "Nurgaram",
        "nameFa": "نورگرام"
      },
      {
        "id": "parun",
        "code": "AF1601",
        "nameEn": "Parun",
        "nameFa": "پرونس"
      },
      {
        "id": "wama",
        "code": "AF1603",
        "nameEn": "Wama",
        "nameFa": "واما"
      },
      {
        "id": "waygal",
        "code": "AF1602",
        "nameEn": "Waygal",
        "nameFa": "وایگل"
      }
    ]
  },
  {
    "id": "paktika",
    "code": "AF12",
    "nameEn": "Paktika",
    "nameFa": "پکتیکا",
    "districts": [
      {
        "id": "barmal",
        "code": "AF1214",
        "nameEn": "Barmal",
        "nameFa": "برمل"
      },
      {
        "id": "dila",
        "code": "AF1216",
        "nameEn": "Dila",
        "nameFa": "دیله"
      },
      {
        "id": "giyan",
        "code": "AF1215",
        "nameEn": "Giyan",
        "nameFa": "گیان"
      },
      {
        "id": "gomal",
        "code": "AF1208",
        "nameEn": "Gomal",
        "nameFa": "گومل"
      },
      {
        "id": "jani-khel",
        "code": "AF1209",
        "nameEn": "Jani Khel",
        "nameFa": "جانی خیل"
      },
      {
        "id": "mata-khan",
        "code": "AF1202",
        "nameEn": "Mata Khan",
        "nameFa": "متاخان"
      },
      {
        "id": "nika",
        "code": "AF1213",
        "nameEn": "Nika",
        "nameFa": "نیکه"
      },
      {
        "id": "omna",
        "code": "AF1206",
        "nameEn": "Omna",
        "nameFa": "اومنه"
      },
      {
        "id": "sar-rawzah",
        "code": "AF1205",
        "nameEn": "Sar Rawzah",
        "nameFa": "سرروضه (سرحوضه)"
      },
      {
        "id": "sharan",
        "code": "AF1201",
        "nameEn": "Sharan",
        "nameFa": "شرن"
      },
      {
        "id": "surobi",
        "code": "AF1210",
        "nameEn": "Surobi",
        "nameFa": "سروبی"
      },
      {
        "id": "turwo",
        "code": "AF1219",
        "nameEn": "Turwo",
        "nameFa": "تروو"
      },
      {
        "id": "urgun",
        "code": "AF1211",
        "nameEn": "Urgun",
        "nameFa": "ارگون"
      },
      {
        "id": "wazakhah",
        "code": "AF1217",
        "nameEn": "Wazakhah",
        "nameFa": "وازه خواه"
      },
      {
        "id": "wormamay",
        "code": "AF1218",
        "nameEn": "Wormamay",
        "nameFa": "وړ ممی"
      },
      {
        "id": "yahya-khel",
        "code": "AF1204",
        "nameEn": "Yahya Khel",
        "nameFa": "یحی خیل"
      },
      {
        "id": "yosuf-khel",
        "code": "AF1203",
        "nameEn": "Yosuf Khel",
        "nameFa": "یوسف خیل"
      },
      {
        "id": "zarghun-shahr",
        "code": "AF1207",
        "nameEn": "Zarghun Shahr",
        "nameFa": "زرغون شهر"
      },
      {
        "id": "ziruk",
        "code": "AF1212",
        "nameEn": "Ziruk",
        "nameFa": "زیړوک"
      }
    ]
  },
  {
    "id": "paktya",
    "code": "AF13",
    "nameEn": "Paktya",
    "nameFa": "پکتیا",
    "districts": [
      {
        "id": "ahmadaba",
        "code": "AF1302",
        "nameEn": "Ahmadaba",
        "nameFa": "احمد آبا"
      },
      {
        "id": "chamkani",
        "code": "AF1310",
        "nameEn": "Chamkani",
        "nameFa": "څمکنی"
      },
      {
        "id": "dand-wa-patan",
        "code": "AF1311",
        "nameEn": "Dand Wa Patan",
        "nameFa": "دند وپټان"
      },
      {
        "id": "gardez",
        "code": "AF1301",
        "nameEn": "Gardez",
        "nameFa": "گردیز"
      },
      {
        "id": "jaji",
        "code": "AF1307",
        "nameEn": "Jaji",
        "nameFa": "علی خیل"
      },
      {
        "id": "jani-khel",
        "code": "AF1309",
        "nameEn": "Jani Khel",
        "nameFa": "جانی خیل"
      },
      {
        "id": "lija-ahmad-khel",
        "code": "AF1308",
        "nameEn": "Lija Ahmad Khel",
        "nameFa": "لجه احمد خیل"
      },
      {
        "id": "sayed-karam",
        "code": "AF1306",
        "nameEn": "Sayed Karam",
        "nameFa": "سیدکرم"
      },
      {
        "id": "shawak",
        "code": "AF1304",
        "nameEn": "Shawak",
        "nameFa": "شواک"
      },
      {
        "id": "zadran",
        "code": "AF1305",
        "nameEn": "Zadran",
        "nameFa": "حّدران"
      },
      {
        "id": "zurmat",
        "code": "AF1303",
        "nameEn": "Zurmat",
        "nameFa": "زُرمت"
      }
    ]
  },
  {
    "id": "panjsher",
    "code": "AF08",
    "nameEn": "Panjsher",
    "nameFa": "پنجشیر",
    "districts": [
      {
        "id": "anawa",
        "code": "AF0805",
        "nameEn": "Anawa",
        "nameFa": "عنابه"
      },
      {
        "id": "bazarak",
        "code": "AF0801",
        "nameEn": "Bazarak",
        "nameFa": "بازارک"
      },
      {
        "id": "dara",
        "code": "AF0803",
        "nameEn": "Dara",
        "nameFa": "دره"
      },
      {
        "id": "khenj",
        "code": "AF0804",
        "nameEn": "Khenj",
        "nameFa": "خنج (حصه اول)"
      },
      {
        "id": "paryan",
        "code": "AF0807",
        "nameEn": "Paryan",
        "nameFa": "پریان"
      },
      {
        "id": "rukha",
        "code": "AF0802",
        "nameEn": "Rukha",
        "nameFa": "رُخه"
      },
      {
        "id": "shutul",
        "code": "AF0806",
        "nameEn": "Shutul",
        "nameFa": "شُتل"
      }
    ]
  },
  {
    "id": "parwan",
    "code": "AF03",
    "nameEn": "Parwan",
    "nameFa": "پروان",
    "districts": [
      {
        "id": "bagram",
        "code": "AF0302",
        "nameEn": "Bagram",
        "nameFa": "بگرام"
      },
      {
        "id": "charikar",
        "code": "AF0301",
        "nameEn": "Charikar",
        "nameFa": "چاریکار"
      },
      {
        "id": "ghorband",
        "code": "AF0307",
        "nameEn": "Ghorband",
        "nameFa": "غوربند"
      },
      {
        "id": "jabal-saraj",
        "code": "AF0305",
        "nameEn": "Jabal Saraj",
        "nameFa": "جبل السراج"
      },
      {
        "id": "koh-e-safi",
        "code": "AF0308",
        "nameEn": "Koh-e-Safi",
        "nameFa": "کوه صافی"
      },
      {
        "id": "salang",
        "code": "AF0306",
        "nameEn": "Salang",
        "nameFa": "سالنگ"
      },
      {
        "id": "sayed-khel",
        "code": "AF0304",
        "nameEn": "Sayed Khel",
        "nameFa": "سیدخیل"
      },
      {
        "id": "shekh-ali",
        "code": "AF0310",
        "nameEn": "Shekh Ali",
        "nameFa": "شیخ علی"
      },
      {
        "id": "shinwari",
        "code": "AF0303",
        "nameEn": "Shinwari",
        "nameFa": "شینواری"
      },
      {
        "id": "surkh-e-parsa",
        "code": "AF0309",
        "nameEn": "Surkh-e-Parsa",
        "nameFa": "سرخ پارسا"
      }
    ]
  },
  {
    "id": "samangan",
    "code": "AF20",
    "nameEn": "Samangan",
    "nameFa": "سمنگان",
    "districts": [
      {
        "id": "aybak",
        "code": "AF2001",
        "nameEn": "Aybak",
        "nameFa": "ایبک"
      },
      {
        "id": "dara-e-suf-e-bala",
        "code": "AF2007",
        "nameEn": "Dara-e-Suf-e-Bala",
        "nameFa": "درۀ صوف بالا"
      },
      {
        "id": "dara-e-suf-e-payin",
        "code": "AF2006",
        "nameEn": "Dara-e-Suf-e-Payin",
        "nameFa": "درۀ صوف پائین"
      },
      {
        "id": "feroz-nakhchir",
        "code": "AF2004",
        "nameEn": "Feroz Nakhchir",
        "nameFa": "فیروز نخچیر"
      },
      {
        "id": "hazrat-e-sultan",
        "code": "AF2002",
        "nameEn": "Hazrat-e-Sultan",
        "nameFa": "حضرت سلطان"
      },
      {
        "id": "khulm",
        "code": "AF2008",
        "nameEn": "Khulm",
        "nameFa": "خلم"
      },
      {
        "id": "khuram-wa-sarbagh",
        "code": "AF2003",
        "nameEn": "Khuram Wa Sarbagh",
        "nameFa": "خرم وسارباغ"
      },
      {
        "id": "ruy-e-duab",
        "code": "AF2005",
        "nameEn": "Ruy-e-Duab",
        "nameFa": "روی دو آب"
      }
    ]
  },
  {
    "id": "sar-e-pul",
    "code": "AF22",
    "nameEn": "Sar-e-Pul",
    "nameFa": "سرپل",
    "districts": [
      {
        "id": "balkhab",
        "code": "AF2207",
        "nameEn": "Balkhab",
        "nameFa": "بلخاب"
      },
      {
        "id": "gosfandi",
        "code": "AF2206",
        "nameEn": "Gosfandi",
        "nameFa": "گوسفندی"
      },
      {
        "id": "kohestanat",
        "code": "AF2203",
        "nameEn": "Kohestanat",
        "nameFa": "کوهستانات"
      },
      {
        "id": "sancharak",
        "code": "AF2205",
        "nameEn": "Sancharak",
        "nameFa": "سانچارك"
      },
      {
        "id": "sar-e-pul",
        "code": "AF2201",
        "nameEn": "Sar-e-Pul",
        "nameFa": "سرپل"
      },
      {
        "id": "sayad",
        "code": "AF2202",
        "nameEn": "Sayad",
        "nameFa": "صیاد"
      },
      {
        "id": "sozmaqala",
        "code": "AF2204",
        "nameEn": "Sozmaqala",
        "nameFa": "سوزمه قلعه"
      }
    ]
  },
  {
    "id": "takhar",
    "code": "AF18",
    "nameEn": "Takhar",
    "nameFa": "تخار",
    "districts": [
      {
        "id": "baharak",
        "code": "AF1803",
        "nameEn": "Baharak",
        "nameFa": "بهارک"
      },
      {
        "id": "bangi",
        "code": "AF1804",
        "nameEn": "Bangi",
        "nameFa": "بنگی"
      },
      {
        "id": "chahab",
        "code": "AF1816",
        "nameEn": "Chahab",
        "nameFa": "چاه آب"
      },
      {
        "id": "chal",
        "code": "AF1805",
        "nameEn": "Chal",
        "nameFa": "چال"
      },
      {
        "id": "darqad",
        "code": "AF1815",
        "nameEn": "Darqad",
        "nameFa": "درقد"
      },
      {
        "id": "dasht-e-qala",
        "code": "AF1812",
        "nameEn": "Dasht-e-Qala",
        "nameFa": "دشت قلعه"
      },
      {
        "id": "eshkmesh",
        "code": "AF1811",
        "nameEn": "Eshkmesh",
        "nameFa": "اشکمش"
      },
      {
        "id": "farkhar",
        "code": "AF1808",
        "nameEn": "Farkhar",
        "nameFa": "فرخار"
      },
      {
        "id": "hazar-sumuch",
        "code": "AF1802",
        "nameEn": "Hazar Sumuch",
        "nameFa": "هزار سموچ"
      },
      {
        "id": "kalafgan",
        "code": "AF1807",
        "nameEn": "Kalafgan",
        "nameFa": "کلفگان"
      },
      {
        "id": "khwaja-bahawuddin",
        "code": "AF1814",
        "nameEn": "Khwaja Bahawuddin",
        "nameFa": "خواجه بهاوالدین"
      },
      {
        "id": "khwaja-ghar",
        "code": "AF1809",
        "nameEn": "Khwaja Ghar",
        "nameFa": "خواجه غار"
      },
      {
        "id": "namak-ab",
        "code": "AF1806",
        "nameEn": "Namak Ab",
        "nameFa": "نمک آب"
      },
      {
        "id": "rostaq",
        "code": "AF1810",
        "nameEn": "Rostaq",
        "nameFa": "رُستاق"
      },
      {
        "id": "taloqan",
        "code": "AF1801",
        "nameEn": "Taloqan",
        "nameFa": "تالقان"
      },
      {
        "id": "warsaj",
        "code": "AF1813",
        "nameEn": "Warsaj",
        "nameFa": "ورسج"
      },
      {
        "id": "yangi-qala",
        "code": "AF1817",
        "nameEn": "Yangi Qala",
        "nameFa": "ینگی قلعه"
      }
    ]
  },
  {
    "id": "uruzgan",
    "code": "AF25",
    "nameEn": "Uruzgan",
    "nameFa": "ارزگان",
    "districts": [
      {
        "id": "chinarto",
        "code": "AF2506",
        "nameEn": "Chinarto",
        "nameFa": "چنارتو"
      },
      {
        "id": "chora",
        "code": "AF2503",
        "nameEn": "Chora",
        "nameFa": "چوره"
      },
      {
        "id": "dehrawud",
        "code": "AF2502",
        "nameEn": "Dehrawud",
        "nameFa": "دهراود"
      },
      {
        "id": "gizab",
        "code": "AF2507",
        "nameEn": "Gizab",
        "nameFa": "گیزاب"
      },
      {
        "id": "khas-uruzgan",
        "code": "AF2505",
        "nameEn": "Khas Uruzgan",
        "nameFa": "خاص ارزگان"
      },
      {
        "id": "shahid-e-hassas",
        "code": "AF2504",
        "nameEn": "Shahid-e-Hassas",
        "nameFa": "شهید حساس"
      },
      {
        "id": "tirinkot",
        "code": "AF2501",
        "nameEn": "Tirinkot",
        "nameFa": "تیرینکوت"
      }
    ]
  },
  {
    "id": "zabul",
    "code": "AF26",
    "nameEn": "Zabul",
    "nameFa": "زابل",
    "districts": [
      {
        "id": "arghandab",
        "code": "AF2605",
        "nameEn": "Arghandab",
        "nameFa": "ارغنداب"
      },
      {
        "id": "atghar",
        "code": "AF2608",
        "nameEn": "Atghar",
        "nameFa": "اتغر"
      },
      {
        "id": "daychopan",
        "code": "AF2607",
        "nameEn": "Daychopan",
        "nameFa": "دای چوپان"
      },
      {
        "id": "kakar",
        "code": "AF2611",
        "nameEn": "Kakar",
        "nameFa": "کاکړ"
      },
      {
        "id": "mizan",
        "code": "AF2604",
        "nameEn": "Mizan",
        "nameFa": "میزان"
      },
      {
        "id": "nawbahar",
        "code": "AF2609",
        "nameEn": "Nawbahar",
        "nameFa": "نوبهار"
      },
      {
        "id": "qalat",
        "code": "AF2601",
        "nameEn": "Qalat",
        "nameFa": "قلات"
      },
      {
        "id": "shah-joi",
        "code": "AF2606",
        "nameEn": "Shah Joi",
        "nameFa": "شاه جوی"
      },
      {
        "id": "shamul-zayi",
        "code": "AF2610",
        "nameEn": "Shamul Zayi",
        "nameFa": "شملزائی"
      },
      {
        "id": "shinkay",
        "code": "AF2603",
        "nameEn": "Shinkay",
        "nameFa": "شینکی"
      },
      {
        "id": "tarnak-wa-jaldak",
        "code": "AF2602",
        "nameEn": "Tarnak Wa Jaldak",
        "nameFa": "ترنک و جلدک"
      }
    ]
  }
];

export const provinceById = new Map(
  provinces.map((province) => [province.id, province] as const),
);

export const provinceByCode = new Map(
  provinces.map((province) => [province.code, province] as const),
);
