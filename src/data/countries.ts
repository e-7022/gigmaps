// Страны, которые сейчас покрывает каталог. Добавить регион = добавить массив кодов ISO 3166-1.
export const EU27 = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

export const REGIONS = {
  na: ["US", "CA", "MX"],
  eu: [...EU27],
  ee: ["UA", "MD", "RS", "ME", "BA", "MK", "AL", "GE", "AM", "RU", "BY"],
  cn: ["CN"],
} as const;

export type Region = keyof typeof REGIONS;
export const REGION_ORDER: Region[] = ["na", "eu", "ee", "cn"];
export const COUNTRIES: string[] = REGION_ORDER.flatMap((r) => [...REGIONS[r]]);
export const COUNTRY_SET = new Set(COUNTRIES);
export const EU_SET = new Set<string>(EU27);

export function regionOf(cc: string): Region | undefined {
  return REGION_ORDER.find((r) => (REGIONS[r] as readonly string[]).includes(cc));
}

// Санкционные юрисдикции: американские платформы (OFAC) и платёжки ЕС не обслуживают проживающих там.
export const SANCTIONED = new Set(["RU", "BY"]);
