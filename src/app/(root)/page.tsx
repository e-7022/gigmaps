import { LOCALES, LOCALE_NAMES } from "@/i18n/config";
import { site } from "@/lib/site";

// Статический хостинг не умеет серверных редиректов по языку,
// поэтому выбираем язык в браузере: сохранённый выбор → языки браузера → английский.
const script = `(function(){try{var L=${JSON.stringify(LOCALES)};var s=localStorage.getItem("gigmap.lang");
if(!s||L.indexOf(s)<0){var n=navigator.languages||[navigator.language||"en"];for(var i=0;i<n.length;i++){var c=(n[i]||"").slice(0,2).toLowerCase();if(L.indexOf(c)>=0){s=c;break}}}
location.replace("/"+(s||"en")+location.search+location.hash)}catch(e){location.replace("/en")}})();`;

export default function Root() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <main className="container" style={{ padding: "96px 16px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32 }} translate="no">{site.name}</h1>
        <p className="muted">AI training jobs by country</p>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {LOCALES.map((l) => (
            <li key={l}>
              <a className="btn btn-ghost btn-sm" href={`/${l}`} lang={l}>
                {LOCALE_NAMES[l]}
              </a>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
