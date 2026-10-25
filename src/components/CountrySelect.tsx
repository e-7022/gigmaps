import { countryName, type Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/dict";
import { REGION_ORDER, REGIONS } from "@/data/countries";

export function CountrySelect({
  locale,
  d,
  value,
  onChange,
  id = "country",
}: {
  locale: Locale;
  d: Dict;
  value: string;
  onChange: (cc: string) => void;
  id?: string;
}) {
  const coll = new Intl.Collator(locale === "zh" ? "zh-Hans" : locale);
  return (
    <div className="country-field">
      <label htmlFor={id} className="filter-label">
        {d.country.label}
      </label>
      <select id={id} name="c" className="select select-lg" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{d.country.any}</option>
        {REGION_ORDER.map((r) => (
          <optgroup key={r} label={d.country.regions[r]}>
            {[...REGIONS[r]]
              .map((cc) => ({ cc, name: countryName(cc, locale) }))
              .sort((a, b) => coll.compare(a.name, b.name))
              .map(({ cc, name }) => (
                <option key={cc} value={cc}>
                  {name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
