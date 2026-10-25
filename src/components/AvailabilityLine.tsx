"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { availText, type Overall } from "@/i18n/avail";
import { COUNTRY_SET } from "@/data/countries";

const STORE = "gigmap.country";

// Строка «Доступно в вашей стране и ещё N странах».
// byCountry — статусы по всем странам (считаются на сервере и передаются компактно).
export function AvailabilityLine({
  locale,
  total,
  byCountry,
  cc: ccProp,
}: {
  locale: Locale;
  total: number;
  byCountry: Record<string, Overall>;
  cc?: string;
}) {
  const [saved, setSaved] = useState<string | undefined>();
  useEffect(() => {
    if (ccProp !== undefined) return;
    try {
      const v = localStorage.getItem(STORE);
      if (v && COUNTRY_SET.has(v)) setSaved(v);
    } catch {}
  }, [ccProp]);
  const cc = ccProp ?? saved;
  const here = cc ? byCountry[cc] : undefined; // cc === "" — страна явно не выбрана
  return (
    <p className={`avail-line o-${here ?? (total ? "available" : "maybe")}`}>
      <i aria-hidden="true" />
      {availText(locale, total, here)}
    </p>
  );
}
