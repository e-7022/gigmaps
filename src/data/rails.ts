import { EU_SET, SANCTIONED } from "./countries";

export type Rail =
  | "deel"
  | "stripe"
  | "paypal"
  | "payoneer"
  | "wise"
  | "bank"
  | "airtm"
  | "ach"
  | "hyperwallet"
  | "sepa"
  | "swift";

export type PayoutStatus = "works" | "likely" | "unknown" | "blocked";

export const RAIL_ORDER: Rail[] = ["deel", "payoneer", "bank", "stripe", "paypal", "wise", "hyperwallet", "airtm", "swift", "sepa", "ach"];

export const railNames: Record<Rail, string> = {
  deel: "Deel",
  stripe: "Stripe",
  paypal: "PayPal",
  payoneer: "Payoneer",
  wise: "Wise",
  bank: "Bank transfer",
  airtm: "Airtm",
  ach: "ACH (US)",
  hyperwallet: "Hyperwallet",
  sepa: "SEPA",
  swift: "SWIFT",
};

const BANK: Record<string, string> = { en: "Bank transfer", ru: "Банковский перевод", es: "Transferencia bancaria", fr: "Virement bancaire", zh: "银行转账" };
export function railLabel(rail: Rail, locale: string) {
  return rail === "bank" ? BANK[locale] ?? railNames.bank : railNames[rail];
}

const NA_CORE = new Set(["US", "CA"]);

// Статус приёма денег через платёжный канал в стране проживания.
// Консервативно: если нет подтверждения — "unknown".
export function railStatus(rail: Rail, cc: string): PayoutStatus {
  if (SANCTIONED.has(cc)) return "blocked";
  const eu = EU_SET.has(cc);
  switch (rail) {
    case "deel":
      return eu || NA_CORE.has(cc) ? "works" : "likely";
    case "stripe":
      // Stripe Connect: США, Канада, ЕЭЗ; Мексика и часть Балкан подтверждены списком Mercor.
      if (eu || NA_CORE.has(cc) || ["MX", "RS", "BA", "MK", "AL"].includes(cc)) return "works";
      if (cc === "AM") return "likely";
      if (cc === "ME") return "blocked";
      return "unknown";
    case "paypal":
      if (eu || NA_CORE.has(cc) || cc === "MX" || cc === "UA") return "works";
      if (cc === "CN") return "likely";
      if (cc === "ME") return "blocked"; // в Черногории PayPal работает только на отправку
      return "unknown";
    case "payoneer":
      return eu || NA_CORE.has(cc) || cc === "MX" ? "works" : "likely";
    case "wise":
      return eu || NA_CORE.has(cc) ? "works" : "unknown";
    case "bank":
      return eu ? "works" : "likely";
    case "swift":
      return "likely";
    case "sepa":
      return eu ? "works" : ["ME", "RS", "AL", "MK", "MD"].includes(cc) ? "likely" : "blocked";
    case "hyperwallet":
      return eu || NA_CORE.has(cc) ? "works" : "unknown";
    case "ach":
      return cc === "US" ? "works" : "blocked";
    case "airtm":
      return "unknown";
  }
}

const RANK: Record<PayoutStatus, number> = { works: 3, likely: 2, unknown: 1, blocked: 0 };

export function bestPayout(rails: Rail[], cc: string): PayoutStatus {
  if (!rails.length) return SANCTIONED.has(cc) ? "blocked" : "unknown";
  let best: PayoutStatus = "blocked";
  for (const r of rails) {
    const s = railStatus(r, cc);
    if (RANK[s] > RANK[best]) best = s;
  }
  return best;
}
