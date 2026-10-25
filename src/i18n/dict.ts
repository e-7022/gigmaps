import type { Locale } from "./config";

type PluralForms = { one: string; few?: string; many?: string; other: string };

export interface Dict {
  meta: { title: string; description: string; tagline: string };
  nav: { jobs: string; countries: string; payouts: string; about: string; language: string };
  hero: { eyebrow: string; h1: string; lede: string; ctaJobs: string; ctaPayouts: string };
  stats: { jobs: string; platforms: string; countries: string };
  country: { label: string; any: string; regions: Record<"na" | "eu" | "ee" | "cn", string>; hint: string };
  filters: {
    search: string;
    placeholder: string;
    direction: string;
    all: string;
    available: string;
    noFluent: string;
    openOnly: string;
    noDegree: string;
    sort: string;
    sortRec: string;
    sortPay: string;
    sortNew: string;
    reset: string;
    empty: string;
    showMore: string;
    seeAll: string;
    jobs: PluralForms;
  };
  cat: Record<"audio" | "design" | "language" | "tech" | "science" | "medicine" | "law" | "business" | "general", string>;
  elig: Record<"yes" | "likely" | "unknown" | "no", string>;
  payout: Record<"works" | "likely" | "unknown" | "blocked", string>;
  overall: Record<"available" | "maybe" | "unavailable", string>;
  eligLabel: string;
  payoutLabel: string;
  english: Record<"basic" | "written" | "fluent" | "unknown", string>;
  status: Record<"open" | "maybe" | "pool" | "closed", string>;
  job: {
    platform: string;
    pay: string;
    payUnknown: string;
    englishLabel: string;
    languageLabel: string;
    degree: string;
    posted: string;
    statusLabel: string;
    apply: string;
    applyRef: string;
    refNote: string;
    details: string;
    official: string;
    byCountry: string;
    payoutRails: string;
    verified: string;
    about: string;
    otherJobs: string;
  };
  platform: {
    jobs: string;
    rule: Record<"allow" | "deny" | "global" | "none", string>;
    source: string;
    rails: string;
    railsUnknown: string;
    allPlatforms: string;
  };
  countryPage: {
    title: string; // {country}
    lede: string; // {country} {n}
    available: string;
    maybe: string;
    unavailable: string;
    all: string;
    intro: string;
  };
  payouts: {
    title: string;
    lede: string;
    p1: string;
    p2: string;
    p3: string;
    tableCaption: string;
    country: string;
  };
  disclosure: { title: string; lede: string; rules: string[]; errorsTitle: string; errors: string };
  faq: { q: string; a: string }[];
  footer: { verified: string; disclaimer: string };
  skip: string;
  breadcrumbHome: string;
}

const en: Dict = {
  meta: {
    title: "Gigmap — AI training jobs you can actually get paid for",
    description:
      "Verified catalog of AI-training jobs (micro1, Alignerr, Outlier, Mindrift, Mercor and more): pay rates, English requirements, eligibility by country of residence and payout methods that actually work. Referral links are labeled.",
    tagline: "AI training jobs by country",
  },
  nav: { jobs: "Jobs", countries: "Countries", payouts: "Payouts", about: "Referrals", language: "Language" },
  hero: {
    eyebrow: "Data verified {date}",
    h1: "AI training jobs that actually pay out in your country",
    lede: "Individual vacancies from micro1, Alignerr, Outlier, Mindrift and others — with honest statuses: can you join from your country, will the money reach you, and how much English you need.",
    ctaJobs: "Browse jobs",
    ctaPayouts: "How payouts work",
  },
  stats: { jobs: "vacancies tracked", platforms: "platforms checked", countries: "countries covered" },
  country: {
    label: "Country of residence",
    any: "All countries",
    regions: { na: "North America", eu: "European Union", ee: "Eastern Europe & Balkans", cn: "China" },
    hint: "Pick your country to see eligibility and payout status for every job.",
  },
  filters: {
    search: "Search jobs",
    placeholder: "e.g. Ableton, Russian, designer…",
    direction: "Field",
    all: "All",
    available: "Only jobs available to me",
    noFluent: "No fluent English required",
    openOnly: "Open now",
    noDegree: "No degree required",
    sort: "Sort",
    sortRec: "Recommended",
    sortPay: "Highest pay",
    sortNew: "Newest",
    reset: "Reset filters",
    showMore: "Show more",
    seeAll: "See all {n} jobs",
    empty: "No jobs match these filters. Try relaxing one of them.",
    jobs: { one: "job", other: "jobs" },
  },
  cat: { audio: "Music & audio", design: "Design, photo, video", language: "Languages", tech: "Tech & data", science: "Science & engineering", medicine: "Medicine", law: "Law", business: "Business & finance", general: "General tasks" },
  elig: { yes: "Eligible (official)", likely: "Likely eligible", unknown: "Eligibility unknown", no: "Not eligible" },
  payout: { works: "Payouts work", likely: "Payouts likely", unknown: "Payouts unclear", blocked: "No working payout" },
  overall: { available: "Available", maybe: "Check first", unavailable: "Not available" },
  eligLabel: "Eligibility",
  payoutLabel: "Payouts",
  english: { basic: "Basic", written: "Clear written", fluent: "Fluent", unknown: "Not stated" },
  status: { open: "Open", maybe: "Open, may be filled", pool: "Talent pool", closed: "Closed" },
  job: {
    platform: "Platform",
    pay: "Pay",
    payUnknown: "Rate not published",
    englishLabel: "English",
    languageLabel: "Language",
    degree: "Advanced degree required",
    posted: "Posted",
    statusLabel: "Status",
    apply: "Apply",
    applyRef: "Apply (referral link)",
    refNote: "referral link",
    details: "Details",
    official: "Official site",
    byCountry: "Availability by country",
    payoutRails: "Payout methods",
    verified: "Verified",
    about: "About the platform",
    otherJobs: "Other jobs on this platform",
  },
  platform: {
    jobs: "Jobs",
    rule: {
      allow: "The platform publishes an official list of allowed countries.",
      deny: "The platform publishes an official list of restricted countries; others are allowed.",
      global: "The platform says it hires globally but publishes no country list.",
      none: "No official country list found.",
    },
    source: "Source",
    rails: "Payout methods",
    railsUnknown: "Not published",
    allPlatforms: "All platforms",
  },
  countryPage: {
    title: "AI training jobs from {country}",
    lede: "{n} of the tracked vacancies are open to residents of {country} with a working payout method. Statuses come from official country lists and payout coverage.",
    available: "Available",
    maybe: "Check before applying",
    unavailable: "Not available from {country}",
    all: "All countries",
    intro: "Eligibility depends on where you live, not your passport. Payout availability is checked separately for each payment method.",
  },
  payouts: {
    title: "How payouts work by country",
    lede: "Platforms decide who can join by country of residence, but the money arrives through payment providers — and those have their own country coverage.",
    p1: "Stripe Connect pays out only to a set of countries (US, Canada, EEA and a few others). A Stripe-only platform cannot pay you elsewhere, even if it accepts you.",
    p2: "PayPal can only send — not receive — money in some countries, such as Montenegro. Deel and Payoneer cover most countries and withdraw to a local bank account in your name.",
    p3: "Residents of Russia and Belarus are blocked by US sanctions on most platforms; EU payment providers also restrict Russian nationals without an EU/EEA/Swiss residence permit.",
    tableCaption: "Payout method status by country of residence",
    country: "Country",
  },
  disclosure: {
    title: "Referral links",
    lede: "Some Apply buttons use a referral link: if you join and work on the platform, the site author may receive a bonus from the platform. Your pay and terms do not change.",
    rules: [
      "Every referral link is labeled, and the official link is always next to it.",
      "Eligibility statuses and ordering do not depend on whether a platform has a referral program.",
      "Platforms that do not accept or cannot pay residents of a country are marked as such, even with a generous referral program.",
      "Rates come from official listings; every entry has a verification date and sources.",
    ],
    errorsTitle: "Found a mistake?",
    errors: "If a status is outdated or a rate has changed, let us know — data is updated at every check.",
  },
  faq: [
    { q: "Which AI training platforms accept residents of my country?", a: "Mercor, Outlier and Prolific publish official lists of allowed countries; Mindrift publishes a list of restricted ones. Pick your country in the catalog to see the status of every job." },
    { q: "Does my passport matter?", a: "Most platforms check country of residence, not citizenship. Payment providers are stricter: EU-licensed services restrict Russian nationals without an EU/EEA/Swiss residence permit." },
    { q: "Why can’t I get paid even though the platform accepted me?", a: "The payout method may not serve your country. Stripe Connect and PayPal receiving are unavailable in several countries; Deel, Payoneer and bank transfers have wider coverage." },
    { q: "Where can musicians and audio engineers find AI training work?", a: "micro1 (Music & Sound Annotation, $30–45/h), Alignerr (Audio Engineer, $40–80/h) and Meridial AI (stem separation) accept practitioners without a music degree. Outlier, Turing and Handshake music roles require an advanced degree." },
    { q: "Do I need fluent English?", a: "Not always. REX and Appen ask for basic English, micro1’s music role only needs clear written notes. Turing and Mercor require fluency, and AI interviews are usually in English." },
  ],
  footer: { verified: "Data verified {date}. Rates are indicative — the listing has the final word.", disclaimer: "Not legal or tax advice." },
  skip: "Skip to content",
  breadcrumbHome: "Jobs",
};

const ru: Dict = {
  meta: {
    title: "Gigmap — вакансии в обучении ИИ, за которые реально платят",
    description:
      "Проверенный каталог вакансий AI-тренинга (micro1, Alignerr, Outlier, Mindrift, Mercor и др.): ставки, требования к английскому, доступность по стране проживания и работающие способы выплат. Реферальные ссылки помечены.",
    tagline: "Вакансии в AI-тренинге по странам",
  },
  nav: { jobs: "Вакансии", countries: "Страны", payouts: "Выплаты", about: "О ссылках", language: "Язык" },
  hero: {
    eyebrow: "Данные сверены {date}",
    h1: "Работа по обучению ИИ, которая реально платит в вашу страну",
    lede: "Отдельные вакансии micro1, Alignerr, Outlier, Mindrift и других — с честными статусами: можно ли работать из вашей страны, дойдут ли деньги и какой нужен английский.",
    ctaJobs: "Смотреть вакансии",
    ctaPayouts: "Как устроены выплаты",
  },
  stats: { jobs: "вакансий в базе", platforms: "платформ проверено", countries: "стран в покрытии" },
  country: {
    label: "Страна проживания",
    any: "Все страны",
    regions: { na: "Северная Америка", eu: "Евросоюз", ee: "Восточная Европа и Балканы", cn: "Китай" },
    hint: "Выберите страну, чтобы увидеть доступность и выплаты для каждой вакансии.",
  },
  filters: {
    search: "Поиск вакансий",
    placeholder: "Например: Ableton, Russian, дизайнер…",
    direction: "Направление",
    all: "Все",
    available: "Только доступные мне",
    noFluent: "Без свободного английского",
    openOnly: "Открыты сейчас",
    noDegree: "Без учёной степени",
    sort: "Порядок",
    sortRec: "Рекомендуемый",
    sortPay: "По ставке",
    sortNew: "Новые",
    reset: "Сбросить фильтры",
    showMore: "Показать ещё",
    seeAll: "Все вакансии ({n})",
    empty: "Под эти фильтры ничего не нашлось. Ослабьте один из них.",
    jobs: { one: "вакансия", few: "вакансии", many: "вакансий", other: "вакансии" },
  },
  cat: { audio: "Музыка и аудио", design: "Дизайн, фото, видео", language: "Языки", tech: "IT и данные", science: "Наука и инженерия", medicine: "Медицина", law: "Право", business: "Бизнес и финансы", general: "Общие задачи" },
  elig: { yes: "Допуск подтверждён", likely: "Вероятно допустят", unknown: "Допуск неизвестен", no: "Не допускают" },
  payout: { works: "Выплаты работают", likely: "Выплаты вероятно", unknown: "Выплаты неясны", blocked: "Нет рабочих выплат" },
  overall: { available: "Доступно", maybe: "Проверить", unavailable: "Недоступно" },
  eligLabel: "Допуск",
  payoutLabel: "Выплаты",
  english: { basic: "Базовый", written: "Письменный", fluent: "Свободный", unknown: "Не указан" },
  status: { open: "Открыта", maybe: "Открыта, может быть закрыта", pool: "Пул кандидатов", closed: "Закрыта" },
  job: {
    platform: "Платформа",
    pay: "Ставка",
    payUnknown: "Ставка не опубликована",
    englishLabel: "Английский",
    languageLabel: "Язык",
    degree: "Нужна учёная степень",
    posted: "Опубликована",
    statusLabel: "Статус",
    apply: "Откликнуться",
    applyRef: "Откликнуться (реф. ссылка)",
    refNote: "реферальная ссылка",
    details: "Подробнее",
    official: "Официальный сайт",
    byCountry: "Доступность по странам",
    payoutRails: "Способы выплат",
    verified: "Проверено",
    about: "О платформе",
    otherJobs: "Другие вакансии платформы",
  },
  platform: {
    jobs: "Вакансии",
    rule: {
      allow: "Платформа публикует официальный список разрешённых стран.",
      deny: "Платформа публикует официальный список запрещённых стран; остальные разрешены.",
      global: "Платформа заявляет набор по всему миру, но списка стран не публикует.",
      none: "Официальный список стран не найден.",
    },
    source: "Источник",
    rails: "Способы выплат",
    railsUnknown: "Не опубликованы",
    allPlatforms: "Все платформы",
  },
  countryPage: {
    title: "Вакансии в AI-тренинге из страны: {country}",
    lede: "{n} вакансий из базы доступны жителям страны «{country}» с рабочим способом выплат. Статусы взяты из официальных списков стран и покрытия платёжных сервисов.",
    available: "Доступно",
    maybe: "Проверить перед откликом",
    unavailable: "Недоступно из страны «{country}»",
    all: "Все страны",
    intro: "Допуск зависит от страны проживания, а не от паспорта. Выплаты проверяются отдельно для каждого платёжного способа.",
  },
  payouts: {
    title: "Как устроены выплаты по странам",
    lede: "Платформы решают, кого допустить, по стране проживания, но деньги приходят через платёжные сервисы — а у них своё покрытие стран.",
    p1: "Stripe Connect выплачивает только в ряд стран (США, Канада, ЕЭЗ и несколько других). Платформа, работающая только через Stripe, не заплатит в другую страну, даже если допустила вас.",
    p2: "В некоторых странах, например в Черногории, PayPal работает только на отправку. Deel и Payoneer покрывают большинство стран и выводят деньги на ваш счёт в местном банке.",
    p3: "Жители России и Беларуси заблокированы на большинстве платформ из-за санкций США; платёжные сервисы ЕС ограничивают граждан РФ без ВНЖ ЕС/ЕЭЗ/Швейцарии.",
    tableCaption: "Статус способов выплат по стране проживания",
    country: "Страна",
  },
  disclosure: {
    title: "Реферальные ссылки",
    lede: "Часть кнопок «Откликнуться» ведёт по реферальной ссылке: если вы зарегистрируетесь и отработаете на платформе, автор сайта может получить бонус. Ваша ставка и условия не меняются.",
    rules: [
      "Каждая реферальная ссылка подписана, рядом всегда есть официальная.",
      "Статусы и порядок в каталоге не зависят от наличия реферальной программы.",
      "Платформы, которые не допускают жителей страны или не могут им платить, помечаются честно — даже с щедрой реферальной программой.",
      "Ставки взяты из официальных вакансий; у каждой записи есть дата проверки и источники.",
    ],
    errorsTitle: "Нашли ошибку?",
    errors: "Если статус устарел или ставка изменилась, напишите — данные обновляются при каждой проверке.",
  },
  faq: [
    { q: "Какие платформы AI-тренинга принимают жителей моей страны?", a: "Mercor, Outlier и Prolific публикуют официальные списки разрешённых стран, Mindrift — список запрещённых. Выберите страну в каталоге, чтобы увидеть статус каждой вакансии." },
    { q: "Важен ли паспорт?", a: "Большинство платформ проверяют страну проживания, а не гражданство. Платёжные сервисы строже: лицензированные в ЕС ограничивают граждан РФ без ВНЖ ЕС/ЕЭЗ/Швейцарии." },
    { q: "Почему платформа меня приняла, а заплатить не может?", a: "Способ выплаты может не работать в вашей стране. Stripe Connect и приём через PayPal недоступны в ряде стран; у Deel, Payoneer и банковских переводов покрытие шире." },
    { q: "Где найти AI-работу музыкантам и звукорежиссёрам?", a: "micro1 (Music & Sound Annotation, $30–45/ч), Alignerr (Audio Engineer, $40–80/ч) и Meridial AI (разделение на стемы) берут практиков без музыкального диплома. Музыкальные роли Outlier, Turing и Handshake требуют учёной степени." },
    { q: "Нужен ли свободный английский?", a: "Не везде. REX и Appen просят базовый английский, музыкальная роль micro1 — только понятные письменные заметки. Turing и Mercor требуют свободного английского, AI-собеседования обычно на английском." },
  ],
  footer: { verified: "Данные сверены {date}. Ставки ориентировочные — итог указан в вакансии.", disclaimer: "Не является юридической или налоговой консультацией." },
  skip: "Перейти к содержимому",
  breadcrumbHome: "Вакансии",
};

const es: Dict = {
  meta: {
    title: "Gigmap — empleos de entrenamiento de IA que realmente pagan",
    description:
      "Catálogo verificado de empleos de entrenamiento de IA (micro1, Alignerr, Outlier, Mindrift, Mercor y más): tarifas, nivel de inglés, elegibilidad por país de residencia y métodos de pago que funcionan. Los enlaces de referido están señalados.",
    tagline: "Empleos de entrenamiento de IA por país",
  },
  nav: { jobs: "Empleos", countries: "Países", payouts: "Pagos", about: "Referidos", language: "Idioma" },
  hero: {
    eyebrow: "Datos verificados el {date}",
    h1: "Empleos de entrenamiento de IA que realmente pagan en tu país",
    lede: "Vacantes concretas de micro1, Alignerr, Outlier, Mindrift y otras, con estados honestos: si puedes unirte desde tu país, si te llegará el dinero y cuánto inglés necesitas.",
    ctaJobs: "Ver empleos",
    ctaPayouts: "Cómo funcionan los pagos",
  },
  stats: { jobs: "vacantes en seguimiento", platforms: "plataformas revisadas", countries: "países cubiertos" },
  country: {
    label: "País de residencia",
    any: "Todos los países",
    regions: { na: "Norteamérica", eu: "Unión Europea", ee: "Europa del Este y Balcanes", cn: "China" },
    hint: "Elige tu país para ver la elegibilidad y los pagos de cada vacante.",
  },
  filters: {
    search: "Buscar empleos",
    placeholder: "p. ej. Ableton, ruso, diseñador…",
    direction: "Área",
    all: "Todas",
    available: "Solo disponibles para mí",
    noFluent: "Sin inglés fluido",
    openOnly: "Abiertas ahora",
    noDegree: "Sin posgrado",
    sort: "Orden",
    sortRec: "Recomendado",
    sortPay: "Mejor pagadas",
    sortNew: "Más recientes",
    reset: "Restablecer filtros",
    showMore: "Mostrar más",
    seeAll: "Ver las {n} vacantes",
    empty: "Ninguna vacante coincide. Prueba a relajar algún filtro.",
    jobs: { one: "vacante", other: "vacantes" },
  },
  cat: { audio: "Música y audio", design: "Diseño, foto, vídeo", language: "Idiomas", tech: "Tecnología y datos", science: "Ciencia e ingeniería", medicine: "Medicina", law: "Derecho", business: "Negocios y finanzas", general: "Tareas generales" },
  elig: { yes: "Elegible (oficial)", likely: "Probablemente elegible", unknown: "Elegibilidad desconocida", no: "No elegible" },
  payout: { works: "Pagos funcionan", likely: "Pagos probables", unknown: "Pagos inciertos", blocked: "Sin método de pago" },
  overall: { available: "Disponible", maybe: "Comprobar", unavailable: "No disponible" },
  eligLabel: "Elegibilidad",
  payoutLabel: "Pagos",
  english: { basic: "Básico", written: "Escrito claro", fluent: "Fluido", unknown: "No indicado" },
  status: { open: "Abierta", maybe: "Abierta, puede cubrirse", pool: "Bolsa de talento", closed: "Cerrada" },
  job: {
    platform: "Plataforma",
    pay: "Tarifa",
    payUnknown: "Tarifa no publicada",
    englishLabel: "Inglés",
    languageLabel: "Idioma",
    degree: "Requiere posgrado",
    posted: "Publicada",
    statusLabel: "Estado",
    apply: "Postularse",
    applyRef: "Postularse (enlace de referido)",
    refNote: "enlace de referido",
    details: "Detalles",
    official: "Sitio oficial",
    byCountry: "Disponibilidad por país",
    payoutRails: "Métodos de pago",
    verified: "Verificado",
    about: "Sobre la plataforma",
    otherJobs: "Otras vacantes de la plataforma",
  },
  platform: {
    jobs: "Vacantes",
    rule: {
      allow: "La plataforma publica una lista oficial de países permitidos.",
      deny: "La plataforma publica una lista oficial de países restringidos; el resto está permitido.",
      global: "La plataforma dice contratar a nivel mundial, pero no publica lista de países.",
      none: "No se encontró una lista oficial de países.",
    },
    source: "Fuente",
    rails: "Métodos de pago",
    railsUnknown: "No publicados",
    allPlatforms: "Todas las plataformas",
  },
  countryPage: {
    title: "Empleos de entrenamiento de IA desde {country}",
    lede: "{n} de las vacantes en seguimiento están abiertas a residentes de {country} con un método de pago que funciona. Los estados provienen de listas oficiales de países y de la cobertura de pagos.",
    available: "Disponibles",
    maybe: "Comprobar antes de postularse",
    unavailable: "No disponibles desde {country}",
    all: "Todos los países",
    intro: "La elegibilidad depende de dónde vives, no de tu pasaporte. Los pagos se comprueban por separado para cada método.",
  },
  payouts: {
    title: "Cómo funcionan los pagos por país",
    lede: "Las plataformas deciden quién entra según el país de residencia, pero el dinero llega mediante proveedores de pago, y estos tienen su propia cobertura.",
    p1: "Stripe Connect solo paga en ciertos países (EE. UU., Canadá, EEE y algunos más). Una plataforma que solo usa Stripe no podrá pagarte en otro país aunque te acepte.",
    p2: "En algunos países, como Montenegro, PayPal solo permite enviar dinero, no recibirlo. Deel y Payoneer cubren la mayoría de países y retiran a una cuenta bancaria local a tu nombre.",
    p3: "Los residentes de Rusia y Bielorrusia están bloqueados por sanciones de EE. UU. en la mayoría de plataformas; los proveedores de pago de la UE también restringen a ciudadanos rusos sin residencia en la UE/EEE/Suiza.",
    tableCaption: "Estado de los métodos de pago por país de residencia",
    country: "País",
  },
  disclosure: {
    title: "Enlaces de referido",
    lede: "Algunos botones de postulación usan un enlace de referido: si te registras y trabajas en la plataforma, el autor del sitio puede recibir un bono. Tu pago y condiciones no cambian.",
    rules: [
      "Cada enlace de referido está señalado y siempre hay un enlace oficial al lado.",
      "Los estados y el orden del catálogo no dependen de los programas de referidos.",
      "Las plataformas que no aceptan o no pueden pagar a residentes de un país se marcan así, aunque tengan un buen programa de referidos.",
      "Las tarifas provienen de anuncios oficiales; cada entrada tiene fecha de verificación y fuentes.",
    ],
    errorsTitle: "¿Encontraste un error?",
    errors: "Si un estado está desactualizado o una tarifa cambió, avísanos: los datos se actualizan en cada revisión.",
  },
  faq: [
    { q: "¿Qué plataformas de entrenamiento de IA aceptan residentes de mi país?", a: "Mercor, Outlier y Prolific publican listas oficiales de países permitidos; Mindrift publica una de países restringidos. Elige tu país en el catálogo para ver el estado de cada vacante." },
    { q: "¿Importa mi pasaporte?", a: "La mayoría de plataformas revisa el país de residencia, no la nacionalidad. Los proveedores de pago son más estrictos: los servicios con licencia de la UE restringen a ciudadanos rusos sin residencia en la UE/EEE/Suiza." },
    { q: "¿Por qué no puedo cobrar si la plataforma me aceptó?", a: "Puede que el método de pago no funcione en tu país. Stripe Connect y la recepción por PayPal no están disponibles en varios países; Deel, Payoneer y las transferencias bancarias tienen mayor cobertura." },
    { q: "¿Dónde encuentran trabajo de IA los músicos e ingenieros de sonido?", a: "micro1 (Music & Sound Annotation, 30–45 $/h), Alignerr (Audio Engineer, 40–80 $/h) y Meridial AI (separación de stems) aceptan profesionales sin título musical. Outlier, Turing y Handshake exigen posgrado." },
    { q: "¿Necesito inglés fluido?", a: "No siempre. REX y Appen piden inglés básico; el rol musical de micro1 solo requiere notas escritas claras. Turing y Mercor exigen fluidez, y las entrevistas con IA suelen ser en inglés." },
  ],
  footer: { verified: "Datos verificados el {date}. Las tarifas son orientativas: manda el anuncio.", disclaimer: "No constituye asesoramiento legal ni fiscal." },
  skip: "Saltar al contenido",
  breadcrumbHome: "Empleos",
};

const fr: Dict = {
  meta: {
    title: "Gigmap — des missions d’entraînement d’IA vraiment payées",
    description:
      "Catalogue vérifié d’offres d’entraînement d’IA (micro1, Alignerr, Outlier, Mindrift, Mercor, etc.) : tarifs, niveau d’anglais, éligibilité selon le pays de résidence et moyens de paiement qui fonctionnent. Liens de parrainage signalés.",
    tagline: "Offres d’entraînement d’IA par pays",
  },
  nav: { jobs: "Offres", countries: "Pays", payouts: "Paiements", about: "Parrainage", language: "Langue" },
  hero: {
    eyebrow: "Données vérifiées le {date}",
    h1: "Des missions d’entraînement d’IA qui paient vraiment dans votre pays",
    lede: "Des offres précises de micro1, Alignerr, Outlier, Mindrift et d’autres, avec des statuts honnêtes : pouvez-vous postuler depuis votre pays, l’argent vous parviendra-t-il, quel niveau d’anglais faut-il.",
    ctaJobs: "Voir les offres",
    ctaPayouts: "Comment fonctionnent les paiements",
  },
  stats: { jobs: "offres suivies", platforms: "plateformes vérifiées", countries: "pays couverts" },
  country: {
    label: "Pays de résidence",
    any: "Tous les pays",
    regions: { na: "Amérique du Nord", eu: "Union européenne", ee: "Europe de l’Est et Balkans", cn: "Chine" },
    hint: "Choisissez votre pays pour voir l’éligibilité et les paiements de chaque offre.",
  },
  filters: {
    search: "Rechercher des offres",
    placeholder: "ex. Ableton, russe, designer…",
    direction: "Domaine",
    all: "Tous",
    available: "Seulement celles accessibles pour moi",
    noFluent: "Sans anglais courant",
    openOnly: "Ouvertes",
    noDegree: "Sans diplôme avancé",
    sort: "Tri",
    sortRec: "Recommandé",
    sortPay: "Mieux payées",
    sortNew: "Plus récentes",
    reset: "Réinitialiser les filtres",
    showMore: "Afficher plus",
    seeAll: "Voir les {n} offres",
    empty: "Aucune offre ne correspond. Assouplissez un filtre.",
    jobs: { one: "offre", other: "offres" },
  },
  cat: { audio: "Musique et audio", design: "Design, photo, vidéo", language: "Langues", tech: "Tech et données", science: "Sciences et ingénierie", medicine: "Médecine", law: "Droit", business: "Business et finance", general: "Tâches générales" },
  elig: { yes: "Éligible (officiel)", likely: "Probablement éligible", unknown: "Éligibilité inconnue", no: "Non éligible" },
  payout: { works: "Paiements OK", likely: "Paiements probables", unknown: "Paiements incertains", blocked: "Aucun paiement possible" },
  overall: { available: "Accessible", maybe: "À vérifier", unavailable: "Inaccessible" },
  eligLabel: "Éligibilité",
  payoutLabel: "Paiements",
  english: { basic: "Basique", written: "Écrit clair", fluent: "Courant", unknown: "Non précisé" },
  status: { open: "Ouverte", maybe: "Ouverte, peut être pourvue", pool: "Vivier de talents", closed: "Fermée" },
  job: {
    platform: "Plateforme",
    pay: "Rémunération",
    payUnknown: "Tarif non publié",
    englishLabel: "Anglais",
    languageLabel: "Langue",
    degree: "Diplôme avancé requis",
    posted: "Publiée",
    statusLabel: "Statut",
    apply: "Postuler",
    applyRef: "Postuler (lien de parrainage)",
    refNote: "lien de parrainage",
    details: "Détails",
    official: "Site officiel",
    byCountry: "Disponibilité par pays",
    payoutRails: "Moyens de paiement",
    verified: "Vérifié",
    about: "À propos de la plateforme",
    otherJobs: "Autres offres de la plateforme",
  },
  platform: {
    jobs: "Offres",
    rule: {
      allow: "La plateforme publie une liste officielle des pays autorisés.",
      deny: "La plateforme publie une liste officielle des pays exclus ; les autres sont autorisés.",
      global: "La plateforme dit recruter partout mais ne publie aucune liste de pays.",
      none: "Aucune liste officielle de pays trouvée.",
    },
    source: "Source",
    rails: "Moyens de paiement",
    railsUnknown: "Non publiés",
    allPlatforms: "Toutes les plateformes",
  },
  countryPage: {
    title: "Missions d’entraînement d’IA depuis : {country}",
    lede: "{n} des offres suivies sont ouvertes aux résidents de ce pays ({country}) avec un moyen de paiement fonctionnel. Les statuts proviennent des listes officielles et de la couverture des paiements.",
    available: "Accessibles",
    maybe: "À vérifier avant de postuler",
    unavailable: "Inaccessibles depuis : {country}",
    all: "Tous les pays",
    intro: "L’éligibilité dépend de votre lieu de résidence, pas de votre passeport. Les paiements sont vérifiés séparément pour chaque moyen.",
  },
  payouts: {
    title: "Comment fonctionnent les paiements selon le pays",
    lede: "Les plateformes acceptent selon le pays de résidence, mais l’argent passe par des prestataires de paiement qui ont leur propre couverture.",
    p1: "Stripe Connect ne verse que dans certains pays (États-Unis, Canada, EEE et quelques autres). Une plateforme uniquement sur Stripe ne pourra pas vous payer ailleurs, même si elle vous accepte.",
    p2: "Dans certains pays, comme le Monténégro, PayPal permet seulement d’envoyer de l’argent, pas d’en recevoir. Deel et Payoneer couvrent la plupart des pays et virent vers un compte bancaire local à votre nom.",
    p3: "Les résidents de Russie et de Biélorussie sont bloqués par les sanctions américaines sur la plupart des plateformes ; les prestataires de paiement de l’UE restreignent aussi les ressortissants russes sans titre de séjour UE/EEE/Suisse.",
    tableCaption: "Statut des moyens de paiement selon le pays de résidence",
    country: "Pays",
  },
  disclosure: {
    title: "Liens de parrainage",
    lede: "Certains boutons « Postuler » utilisent un lien de parrainage : si vous vous inscrivez et travaillez sur la plateforme, l’auteur du site peut recevoir une prime. Votre rémunération et vos conditions ne changent pas.",
    rules: [
      "Chaque lien de parrainage est signalé, le lien officiel est toujours à côté.",
      "Les statuts et l’ordre du catalogue ne dépendent pas des programmes de parrainage.",
      "Les plateformes qui n’acceptent pas ou ne peuvent pas payer les résidents d’un pays sont indiquées comme telles, même avec un parrainage généreux.",
      "Les tarifs proviennent des offres officielles ; chaque fiche a une date de vérification et des sources.",
    ],
    errorsTitle: "Une erreur ?",
    errors: "Si un statut est périmé ou un tarif a changé, prévenez-nous : les données sont mises à jour à chaque vérification.",
  },
  faq: [
    { q: "Quelles plateformes d’entraînement d’IA acceptent les résidents de mon pays ?", a: "Mercor, Outlier et Prolific publient des listes officielles de pays autorisés ; Mindrift publie une liste de pays exclus. Choisissez votre pays dans le catalogue pour voir le statut de chaque offre." },
    { q: "Mon passeport compte-t-il ?", a: "La plupart des plateformes vérifient le pays de résidence, pas la nationalité. Les prestataires de paiement sont plus stricts : ceux agréés dans l’UE restreignent les ressortissants russes sans titre de séjour UE/EEE/Suisse." },
    { q: "Pourquoi ne suis-je pas payé alors que la plateforme m’a accepté ?", a: "Le moyen de paiement ne dessert peut-être pas votre pays. Stripe Connect et la réception PayPal sont indisponibles dans plusieurs pays ; Deel, Payoneer et les virements bancaires couvrent davantage." },
    { q: "Où les musiciens et ingénieurs du son trouvent-ils ce type de travail ?", a: "micro1 (Music & Sound Annotation, 30–45 $/h), Alignerr (Audio Engineer, 40–80 $/h) et Meridial AI (séparation de stems) acceptent des praticiens sans diplôme de musique. Outlier, Turing et Handshake exigent un diplôme avancé." },
    { q: "Faut-il un anglais courant ?", a: "Pas toujours. REX et Appen demandent un anglais de base ; le rôle musique de micro1 exige seulement des notes écrites claires. Turing et Mercor exigent un anglais courant, et les entretiens IA se font en général en anglais." },
  ],
  footer: { verified: "Données vérifiées le {date}. Tarifs indicatifs : l’offre fait foi.", disclaimer: "Ne constitue pas un conseil juridique ou fiscal." },
  skip: "Aller au contenu",
  breadcrumbHome: "Offres",
};

const zh: Dict = {
  meta: {
    title: "Gigmap — 真正能收到报酬的 AI 训练工作",
    description:
      "经核实的 AI 训练岗位目录（micro1、Alignerr、Outlier、Mindrift、Mercor 等）：报酬、英语要求、按居住国划分的申请资格，以及真正可用的收款方式。推荐链接均已标注。",
    tagline: "按国家查看 AI 训练岗位",
  },
  nav: { jobs: "岗位", countries: "国家", payouts: "收款", about: "推荐链接", language: "语言" },
  hero: {
    eyebrow: "数据核实于 {date}",
    h1: "在你所在的国家真正能收到报酬的 AI 训练工作",
    lede: "汇总 micro1、Alignerr、Outlier、Mindrift 等平台的具体岗位，并如实标注：能否从你所在国家申请、钱能否到账、需要什么英语水平。",
    ctaJobs: "浏览岗位",
    ctaPayouts: "收款说明",
  },
  stats: { jobs: "个跟踪岗位", platforms: "个已核查平台", countries: "个覆盖国家" },
  country: {
    label: "居住国",
    any: "所有国家",
    regions: { na: "北美", eu: "欧盟", ee: "东欧与巴尔干", cn: "中国" },
    hint: "选择你的国家，查看每个岗位的申请资格和收款情况。",
  },
  filters: {
    search: "搜索岗位",
    placeholder: "例如：Ableton、俄语、设计师…",
    direction: "领域",
    all: "全部",
    available: "只看我能申请的",
    noFluent: "不要求流利英语",
    openOnly: "正在招聘",
    noDegree: "不要求研究生学历",
    sort: "排序",
    sortRec: "推荐",
    sortPay: "报酬最高",
    sortNew: "最新",
    reset: "重置筛选",
    showMore: "显示更多",
    seeAll: "查看全部 {n} 个岗位",
    empty: "没有符合条件的岗位。请放宽筛选条件。",
    jobs: { one: "个岗位", other: "个岗位" },
  },
  cat: { audio: "音乐与音频", design: "设计、摄影、视频", language: "语言", tech: "技术与数据", science: "科学与工程", medicine: "医学", law: "法律", business: "商业与金融", general: "通用任务" },
  elig: { yes: "可申请（官方）", likely: "可能可申请", unknown: "资格未知", no: "不可申请" },
  payout: { works: "可收款", likely: "可能可收款", unknown: "收款不明", blocked: "无可用收款方式" },
  overall: { available: "可申请", maybe: "需确认", unavailable: "不可用" },
  eligLabel: "申请资格",
  payoutLabel: "收款",
  english: { basic: "基础", written: "书面清晰", fluent: "流利", unknown: "未说明" },
  status: { open: "招聘中", maybe: "招聘中，可能已满", pool: "人才库", closed: "已关闭" },
  job: {
    platform: "平台",
    pay: "报酬",
    payUnknown: "未公布报酬",
    englishLabel: "英语",
    languageLabel: "语言",
    degree: "需研究生学历",
    posted: "发布于",
    statusLabel: "状态",
    apply: "申请",
    applyRef: "申请（推荐链接）",
    refNote: "推荐链接",
    details: "详情",
    official: "官方网站",
    byCountry: "各国可用性",
    payoutRails: "收款方式",
    verified: "核实于",
    about: "平台介绍",
    otherJobs: "该平台其他岗位",
  },
  platform: {
    jobs: "岗位",
    rule: {
      allow: "该平台公布了官方允许国家名单。",
      deny: "该平台公布了官方受限国家名单，其余国家可申请。",
      global: "该平台称面向全球招聘，但未公布国家名单。",
      none: "未找到官方国家名单。",
    },
    source: "来源",
    rails: "收款方式",
    railsUnknown: "未公布",
    allPlatforms: "所有平台",
  },
  countryPage: {
    title: "{country}居民可做的 AI 训练工作",
    lede: "在跟踪的岗位中，有 {n} 个向{country}居民开放且有可用的收款方式。状态依据官方国家名单和收款服务覆盖情况。",
    available: "可申请",
    maybe: "申请前需确认",
    unavailable: "{country}居民不可申请",
    all: "所有国家",
    intro: "申请资格取决于居住地，而非护照。每种收款方式单独核查。",
  },
  payouts: {
    title: "各国收款方式说明",
    lede: "平台按居住国决定是否接纳，但报酬要通过支付服务到账，而支付服务有各自的覆盖范围。",
    p1: "Stripe Connect 只向部分国家付款（美国、加拿大、欧洲经济区等）。只用 Stripe 的平台即使接纳你，也无法向其他国家付款。",
    p2: "在部分国家（如黑山），PayPal 只能付款不能收款。Deel 和 Payoneer 覆盖大多数国家，可提现到你名下的本地银行账户。",
    p3: "由于美国制裁，俄罗斯和白俄罗斯居民在大多数平台被拒；欧盟支付服务也限制无欧盟/欧洲经济区/瑞士居留许可的俄罗斯公民。",
    tableCaption: "按居住国划分的收款方式状态",
    country: "国家",
  },
  disclosure: {
    title: "推荐链接",
    lede: "部分“申请”按钮使用推荐链接：如果你注册并在平台工作，网站作者可能获得平台奖励。你的报酬和条件不受影响。",
    rules: [
      "每个推荐链接都有标注，旁边始终提供官方链接。",
      "资格状态和排序与是否有推荐计划无关。",
      "不接纳某国居民或无法向其付款的平台会如实标注，即使其推荐奖励丰厚。",
      "报酬取自官方招聘信息；每条记录都有核实日期和来源。",
    ],
    errorsTitle: "发现错误？",
    errors: "如果状态过时或报酬有变，请告诉我们——每次核查都会更新数据。",
  },
  faq: [
    { q: "哪些 AI 训练平台接受我所在国家的居民？", a: "Mercor、Outlier 和 Prolific 公布了官方允许国家名单；Mindrift 公布了受限国家名单。在目录中选择你的国家，即可查看每个岗位的状态。" },
    { q: "护照重要吗？", a: "大多数平台看居住国而非国籍。支付服务更严格：欧盟持牌机构限制没有欧盟/欧洲经济区/瑞士居留许可的俄罗斯公民。" },
    { q: "平台接纳了我，为什么收不到钱？", a: "收款方式可能不覆盖你的国家。Stripe Connect 和 PayPal 收款在多个国家不可用；Deel、Payoneer 和银行转账覆盖更广。" },
    { q: "音乐人和音频工程师在哪里找 AI 训练工作？", a: "micro1（Music & Sound Annotation，30–45 美元/小时）、Alignerr（Audio Engineer，40–80 美元/小时）和 Meridial AI（分轨分离）接受无音乐学位的从业者。Outlier、Turing 和 Handshake 的音乐岗位要求研究生学历。" },
    { q: "需要流利的英语吗？", a: "不一定。REX 和 Appen 只要求基础英语，micro1 的音乐岗位只需清晰的书面笔记。Turing 和 Mercor 要求流利英语，AI 面试通常用英语进行。" },
  ],
  footer: { verified: "数据核实于 {date}。报酬仅供参考，以招聘信息为准。", disclaimer: "不构成法律或税务建议。" },
  skip: "跳到正文",
  breadcrumbHome: "岗位",
};

export const dicts: Record<Locale, Dict> = { en, ru, es, fr, zh };

export function t(locale: Locale) {
  return dicts[locale];
}

export function fill(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

const pluralRules = new Map<Locale, Intl.PluralRules>();
export function plural(locale: Locale, n: number, forms: PluralForms) {
  let pr = pluralRules.get(locale);
  if (!pr) {
    pr = new Intl.PluralRules(locale === "zh" ? "zh" : locale);
    pluralRules.set(locale, pr);
  }
  const f = pr.select(n) as keyof PluralForms;
  return forms[f] ?? forms.other;
}
