import type { Locale } from "./config";
import { fill, plural } from "./dict";

type Forms = { one: string; few?: string; many?: string; other: string };
interface AvailText {
  yoursAndMore: string;
  yoursOnly: string;
  checkYours: string;
  notYours: string;
  count: string;
  none: string;
  countries: Forms;
  more: Forms;
}

const T: Record<Locale, AvailText> = {
  en: {
    yoursAndMore: "Available in your country and {n} more {countries}",
    yoursOnly: "Available in your country",
    checkYours: "Check eligibility in your country · available in {n} {countries}",
    notYours: "Not available in your country · available in {n} {countries}",
    count: "Available in {n} {countries}",
    none: "No confirmed countries yet",
    countries: { one: "country", other: "countries" },
    more: { one: "country", other: "countries" },
  },
  ru: {
    yoursAndMore: "Доступно в вашей стране и ещё в {n} {countries}",
    yoursOnly: "Доступно в вашей стране",
    checkYours: "Проверьте доступ в вашей стране · доступно в {n} {countries}",
    notYours: "Недоступно в вашей стране · доступно в {n} {countries}",
    count: "Доступно в {n} {countries}",
    none: "Пока нет подтверждённых стран",
    countries: { one: "стране", few: "странах", many: "странах", other: "странах" },
    more: { one: "стране", few: "странах", many: "странах", other: "странах" },
  },
  es: {
    yoursAndMore: "Disponible en tu país y en {n} {countries} más",
    yoursOnly: "Disponible en tu país",
    checkYours: "Comprueba tu país · disponible en {n} {countries}",
    notYours: "No disponible en tu país · disponible en {n} {countries}",
    count: "Disponible en {n} {countries}",
    none: "Aún no hay países confirmados",
    countries: { one: "país", other: "países" },
    more: { one: "país", other: "países" },
  },
  fr: {
    yoursAndMore: "Accessible dans votre pays et {n} autres {countries}",
    yoursOnly: "Accessible dans votre pays",
    checkYours: "À vérifier pour votre pays · accessible dans {n} {countries}",
    notYours: "Inaccessible dans votre pays · accessible dans {n} {countries}",
    count: "Accessible dans {n} {countries}",
    none: "Aucun pays confirmé pour l’instant",
    countries: { one: "pays", other: "pays" },
    more: { one: "pays", other: "pays" },
  },
  zh: {
    yoursAndMore: "你所在国家及另外 {n} 个国家可申请",
    yoursOnly: "你所在国家可申请",
    checkYours: "请确认你所在国家 · {n} 个国家可申请",
    notYours: "你所在国家不可申请 · {n} 个国家可申请",
    count: "{n} 个国家可申请",
    none: "暂无已确认的国家",
    countries: { one: "", other: "" },
    more: { one: "", other: "" },
  },
};

export type Overall = "available" | "maybe" | "unavailable";

export function availText(locale: Locale, total: number, here?: Overall) {
  const a = T[locale];
  const cw = (n: number, f: Forms) => plural(locale, n, f);
  if (!here) return total ? fill(a.count, { n: total, countries: cw(total, a.countries) }) : a.none;
  if (here === "available") {
    const others = total - 1;
    return others > 0 ? fill(a.yoursAndMore, { n: others, countries: cw(others, a.more) }) : a.yoursOnly;
  }
  const key = here === "maybe" ? a.checkYours : a.notYours;
  return fill(key, { n: total, countries: cw(total, a.countries) });
}
