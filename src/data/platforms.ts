import type { L } from "@/i18n/config";
import { EU27, SANCTIONED } from "./countries";
import type { Rail } from "./rails";
import referrals from "./generated/referrals.json";

// Реферальные ссылки хранятся в data/referrals.json (редактируются через админку).

export type Elig = "yes" | "likely" | "unknown" | "no";

export type EligRule =
  | { kind: "allow"; list: string[]; source: string } // официальный список разрешённых стран
  | { kind: "deny"; list: string[]; source: string } // официальный список запрещённых стран
  | { kind: "global" } // площадка заявляет «работа откуда угодно», без списка
  | { kind: "none" }; // данных нет

export interface Platform {
  slug: string;
  name: string;
  owner?: string;
  url: string;
  signupUrl?: string; // страница входа/регистрации исполнителя
  referralTemplate?: string; // шаблон ссылки с кодом, например "https://x.com/signup?ref={code}"
  summary: L;
  rails: Rail[];
  rule: EligRule;
  overrides?: Record<string, Elig>;
  priority: number;
  verified: string;
}

const NA_EU = ["US", "CA", "MX", ...EU27];

export const platforms: Platform[] = [
  {
    slug: "micro1",
    name: "micro1",
    url: "https://jobs.micro1.ai",
    summary: {
      en: "Expert network with an AI interviewer. Strong demand for music, audio and language experts; no degree required for audio roles.",
      ru: "Экспертная сеть с AI-собеседованием. Много ролей для музыкантов, звукорежиссёров и носителей языков; для аудиоролей диплом не нужен.",
      es: "Red de expertos con entrevista por IA. Mucha demanda de expertos en música, audio e idiomas; sin título para roles de audio.",
      fr: "Réseau d’experts avec entretien par IA. Forte demande en musique, audio et langues ; pas de diplôme exigé pour l’audio.",
      zh: "通过 AI 面试的专家网络。大量音乐、音频和语言类岗位，音频岗位不要求学位。",
    },
    rails: ["deel"],
    rule: { kind: "global" },
    priority: 1,
    verified: "2026-10-25",
  },
  {
    slug: "alignerr",
    name: "Alignerr",
    owner: "Labelbox",
    url: "https://www.alignerr.com",
    signupUrl: "https://app.alignerr.com",
    summary: {
      en: "Labelbox’s expert platform. Audio Engineer roles name Ableton and mixing skills directly; one test attempt per role.",
      ru: "Экспертная платформа Labelbox. В ролях Audio Engineer прямо указаны Ableton и навыки сведения; тест — одна попытка.",
      es: "Plataforma de expertos de Labelbox. Los roles de Audio Engineer piden Ableton y mezcla; un solo intento de prueba.",
      fr: "Plateforme d’experts de Labelbox. Les rôles Audio Engineer citent Ableton et le mixage ; un seul essai au test.",
      zh: "Labelbox 旗下专家平台。音频工程师岗位明确要求 Ableton 和混音技能；每个岗位仅一次测试机会。",
    },
    rails: ["deel"],
    rule: { kind: "none" },
    overrides: { CN: "no" },
    priority: 2,
    verified: "2026-10-25",
  },
  {
    slug: "meridial",
    name: "Meridial AI",
    owner: "Invisible Technologies",
    url: "https://marketplace.inv.tech",
    summary: {
      en: "Invisible’s task marketplace: stem separation, voice and audio editing projects. Invites usually arrive within 48 hours.",
      ru: "Маркетплейс задач Invisible: разделение на стемы, голос, аудиомонтаж. Приглашения обычно приходят за 48 часов.",
      es: "Marketplace de Invisible: separación de stems, voz y edición de audio. Las invitaciones suelen llegar en 48 horas.",
      fr: "Marketplace d’Invisible : séparation de stems, voix, montage audio. Invitations en général sous 48 heures.",
      zh: "Invisible 的任务市场：分轨分离、配音和音频剪辑项目。通常 48 小时内收到邀请。",
    },
    rails: [],
    rule: { kind: "global" },
    overrides: { ME: "yes" },
    priority: 3,
    verified: "2026-10-25",
  },
  {
    slug: "mindrift",
    name: "Mindrift",
    owner: "Toloka",
    url: "https://mindrift.ai",
    summary: {
      en: "Toloka’s expert platform. Eligibility is based on country of residence, with a published list of restricted jurisdictions.",
      ru: "Экспертная платформа Toloka. Допуск по стране проживания, есть опубликованный список запрещённых юрисдикций.",
      es: "Plataforma de expertos de Toloka. La elegibilidad depende del país de residencia; publica una lista de jurisdicciones restringidas.",
      fr: "Plateforme d’experts de Toloka. L’éligibilité dépend du pays de résidence ; liste publique des juridictions exclues.",
      zh: "Toloka 旗下专家平台。按居住国审核资格，并公布了受限地区名单。",
    },
    rails: ["payoneer", "paypal"],
    rule: { kind: "deny", list: ["RU", "BY", "CN"], source: "https://mindrift.ai/legal/eligibility-and-geographic-restrictions" },
    priority: 4,
    verified: "2026-10-25",
  },
  {
    slug: "rex",
    name: "REX",
    owner: "Remo Experts",
    url: "https://www.rex.zone",
    summary: {
      en: "Expert network with an entry exam. Asks only for basic English plus a bachelor’s degree.",
      ru: "Экспертная сеть со вступительным экзаменом. Нужны базовый английский и бакалавриат.",
      es: "Red de expertos con examen de ingreso. Solo pide inglés básico y un grado universitario.",
      fr: "Réseau d’experts avec examen d’entrée. Anglais de base et licence suffisent.",
      zh: "需通过入门考试的专家网络。只要求基础英语和学士学位。",
    },
    rails: ["stripe", "payoneer", "wise"],
    rule: { kind: "global" },
    priority: 5,
    verified: "2026-10-25",
  },
  {
    slug: "outlier",
    name: "Outlier",
    owner: "Scale AI",
    url: "https://outlier.ai",
    signupUrl: "https://app.outlier.ai/login",
    summary: {
      en: "Scale AI’s large contributor platform with an official list of allowed work locations. VPNs are banned.",
      ru: "Крупная платформа Scale AI с официальным списком разрешённых стран. VPN запрещён.",
      es: "Gran plataforma de Scale AI con lista oficial de países permitidos. VPN prohibida.",
      fr: "Grande plateforme de Scale AI avec liste officielle des pays autorisés. VPN interdit.",
      zh: "Scale AI 旗下大型平台，公布了允许工作的国家名单。禁止使用 VPN。",
    },
    rails: ["paypal", "airtm", "ach"],
    rule: {
      kind: "allow",
      list: [...NA_EU, "RS", "ME", "BA", "MK", "AL"],
      source: "https://outlier.ai/legal/flexible-working-guidelines",
    },
    priority: 6,
    verified: "2026-10-25",
  },
  {
    slug: "turing",
    name: "Turing",
    url: "https://www.turing.com",
    summary: {
      en: "Technical talent company with creative AI-training roles for Photoshop, Premiere, Blender and DaVinci users.",
      ru: "Технологическая компания с творческими AI-ролями для пользователей Photoshop, Premiere, Blender и DaVinci.",
      es: "Empresa tecnológica con roles creativos para usuarios de Photoshop, Premiere, Blender y DaVinci.",
      fr: "Entreprise tech avec des rôles créatifs pour utilisateurs de Photoshop, Premiere, Blender et DaVinci.",
      zh: "技术人才公司，提供面向 Photoshop、Premiere、Blender、DaVinci 用户的创意类 AI 训练岗位。",
    },
    rails: [],
    rule: { kind: "none" },
    priority: 7,
    verified: "2026-10-25",
  },
  {
    slug: "telus-digital",
    name: "TELUS Digital",
    url: "https://www.telusinternational.ai",
    summary: {
      en: "Large data company; launched an AI Music & Audio Expert community in October 2026. Lower pay.",
      ru: "Крупная дата-компания; в октябре 2026 открыла сообщество AI Music & Audio Expert. Ставки ниже.",
      es: "Gran empresa de datos; lanzó una comunidad de expertos en música y audio en octubre de 2026. Pago más bajo.",
      fr: "Grande société de données ; communauté d’experts musique et audio lancée en octobre 2026. Rémunération plus basse.",
      zh: "大型数据公司，2026 年 10 月推出音乐与音频专家社区。报酬较低。",
    },
    rails: ["hyperwallet", "bank"],
    rule: { kind: "none" },
    priority: 8,
    verified: "2026-10-25",
  },
  {
    slug: "pareto",
    name: "Pareto.AI",
    url: "https://pareto.ai/careers/ai-trainer",
    summary: {
      en: "Generalist AI-trainer tasks, advertised as work from anywhere.",
      ru: "Генералистские задачи AI-тренера, заявлена работа откуда угодно.",
      es: "Tareas generalistas de entrenador de IA, anunciadas como trabajo desde cualquier lugar.",
      fr: "Tâches généralistes d’entraîneur d’IA, annoncées comme travail depuis n’importe où.",
      zh: "通用 AI 训练任务，宣称可在任何地方工作。",
    },
    rails: ["paypal", "wise"],
    rule: { kind: "global" },
    priority: 9,
    verified: "2026-10-25",
  },
  {
    slug: "invisible",
    name: "Invisible Technologies",
    url: "https://www.invisible.co",
    summary: {
      en: "AI-trainer roles on language and reasoning projects, open to applicants anywhere.",
      ru: "Роли AI-тренера на языковых и аналитических проектах, открыты для кандидатов отовсюду.",
      es: "Roles de entrenador de IA en proyectos de idiomas y razonamiento, abiertos desde cualquier lugar.",
      fr: "Rôles d’entraîneur d’IA sur des projets de langue et de raisonnement, ouverts partout.",
      zh: "语言与推理项目的 AI 训练岗位，面向全球申请者。",
    },
    rails: [],
    rule: { kind: "global" },
    priority: 10,
    verified: "2026-10-25",
  },
  {
    slug: "xai",
    name: "xAI",
    url: "https://x.ai/careers",
    summary: {
      en: "Hires AI tutors directly, including language and audio specialists.",
      ru: "Напрямую нанимает AI-тьюторов, включая языковых и аудиоспециалистов.",
      es: "Contrata tutores de IA directamente, incluidos especialistas en idiomas y audio.",
      fr: "Recrute directement des tuteurs d’IA, dont des spécialistes langue et audio.",
      zh: "直接招聘 AI 导师，包括语言和音频专家。",
    },
    rails: [],
    rule: { kind: "none" },
    priority: 11,
    verified: "2026-10-25",
  },
  {
    slug: "appen",
    name: "Appen",
    owner: "CrowdGen",
    url: "https://www.appen.com",
    summary: {
      en: "Country-specific data projects: speech recordings, search evaluation, local-language tasks.",
      ru: "Проекты с привязкой к стране: записи речи, оценка поиска, задачи на местных языках.",
      es: "Proyectos por país: grabaciones de voz, evaluación de búsqueda, tareas en idiomas locales.",
      fr: "Projets par pays : enregistrements vocaux, évaluation de recherche, tâches en langues locales.",
      zh: "按国家开展的数据项目：语音录制、搜索评估、本地语言任务。",
    },
    rails: ["payoneer", "bank"],
    rule: { kind: "none" },
    priority: 12,
    verified: "2026-10-25",
  },
  {
    slug: "oneforma",
    name: "OneForma",
    owner: "Centific",
    url: "https://www.oneforma.com",
    summary: {
      en: "Language and data projects; payout method depends on your country.",
      ru: "Языковые проекты и разметка; способ выплаты зависит от страны.",
      es: "Proyectos lingüísticos y de datos; el método de pago depende del país.",
      fr: "Projets linguistiques et de données ; le mode de paiement dépend du pays.",
      zh: "语言与数据项目；付款方式因国家而异。",
    },
    rails: ["payoneer", "paypal"],
    rule: { kind: "none" },
    priority: 13,
    verified: "2026-10-25",
  },
  {
    slug: "clickworker",
    name: "Clickworker",
    url: "https://www.clickworker.com",
    summary: {
      en: "Microtasks including UHRS. Low barrier to entry, low earnings, many payout options.",
      ru: "Микрозадачи, включая UHRS. Низкий порог входа, невысокий доход, много способов выплат.",
      es: "Microtareas, incluido UHRS. Fácil acceso, ingresos bajos, muchas opciones de pago.",
      fr: "Microtâches, dont UHRS. Accès facile, revenus faibles, nombreux moyens de paiement.",
      zh: "微任务（含 UHRS）。门槛低、收入低、付款方式多。",
    },
    rails: ["paypal", "payoneer", "sepa", "airtm", "swift"],
    rule: { kind: "global" },
    priority: 14,
    verified: "2026-10-25",
  },
  {
    slug: "snorkel",
    name: "Snorkel AI",
    url: "https://snorkel.ai/expert-community/",
    summary: {
      en: "Expert community including humanities and arts; usually requires an advanced degree.",
      ru: "Экспертное сообщество, включая гуманитарные науки и искусство; обычно нужна учёная степень.",
      es: "Comunidad de expertos, incluidas humanidades y artes; suele exigir posgrado.",
      fr: "Communauté d’experts, y compris sciences humaines et arts ; diplôme avancé souvent requis.",
      zh: "专家社区，涵盖人文与艺术领域；通常要求研究生学历。",
    },
    rails: [],
    rule: { kind: "none" },
    priority: 15,
    verified: "2026-10-25",
  },
  {
    slug: "mercor",
    name: "Mercor",
    url: "https://work.mercor.com",
    signupUrl: "https://work.mercor.com",
    summary: {
      en: "Large expert network with high rates for music, language and design experts. Publishes an official supported-countries list.",
      ru: "Крупная экспертная сеть с высокими ставками для музыкантов, лингвистов и дизайнеров. Публикует официальный список стран.",
      es: "Gran red de expertos con tarifas altas en música, idiomas y diseño. Publica una lista oficial de países.",
      fr: "Grand réseau d’experts bien rémunéré en musique, langues et design. Liste officielle des pays publiée.",
      zh: "大型专家网络，音乐、语言和设计专家报酬高。公布官方支持国家名单。",
    },
    rails: ["stripe"],
    rule: {
      kind: "allow",
      list: [...NA_EU, "RS", "BA", "MK", "AL"],
      source: "https://talent.docs.mercor.com/policies/supported-countries",
    },
    priority: 16,
    verified: "2026-10-25",
  },
  {
    slug: "dataannotation",
    name: "DataAnnotation",
    url: "https://dataannotation.tech",
    summary: {
      en: "Popular platform with coding, writing and bilingual tracks. Pays via PayPal only.",
      ru: "Популярная платформа: код, тексты, двуязычные задачи. Платит только через PayPal.",
      es: "Plataforma popular con tareas de código, redacción y bilingües. Paga solo por PayPal.",
      fr: "Plateforme populaire : code, rédaction, bilingue. Paie uniquement via PayPal.",
      zh: "热门平台，提供编程、写作和双语任务。仅通过 PayPal 付款。",
    },
    rails: ["paypal"],
    rule: { kind: "none" },
    priority: 17,
    verified: "2026-10-25",
  },
  {
    slug: "prolific",
    name: "Prolific",
    url: "https://www.prolific.com",
    summary: {
      en: "Research studies and AI tasks. Eligibility by country of residence from an official list.",
      ru: "Исследования и AI-задачи. Допуск по стране проживания из официального списка.",
      es: "Estudios de investigación y tareas de IA. Elegibilidad por país de residencia según lista oficial.",
      fr: "Études et tâches IA. Éligibilité selon le pays de résidence, liste officielle.",
      zh: "研究调查与 AI 任务。按官方名单中的居住国审核资格。",
    },
    rails: ["paypal"],
    rule: { kind: "allow", list: NA_EU, source: "https://participant-help.prolific.com/en/article/628d72" },
    priority: 18,
    verified: "2026-10-25",
  },
  {
    slug: "handshake-ai",
    name: "Handshake AI",
    url: "https://joinhandshake.com",
    summary: {
      en: "Fellowship for experts with advanced degrees, mainly for US residents.",
      ru: "Программа для экспертов с учёной степенью, в основном для жителей США.",
      es: "Programa para expertos con posgrado, principalmente para residentes en EE. UU.",
      fr: "Programme pour experts diplômés, surtout pour les résidents américains.",
      zh: "面向高学历专家的项目，主要针对美国居民。",
    },
    rails: ["stripe", "deel"],
    rule: { kind: "allow", list: ["US", "CA", "MX"], source: "https://joinhandshake.com" },
    overrides: { CA: "likely", MX: "likely" },
    priority: 19,
    verified: "2026-10-25",
  },
  {
    slug: "afterquery",
    name: "AfterQuery",
    url: "https://www.afterquery.com",
    summary: {
      en: "Bilingual audio contributor projects. Pays via Stripe only.",
      ru: "Двуязычные аудиопроекты. Платит только через Stripe.",
      es: "Proyectos de audio bilingües. Paga solo por Stripe.",
      fr: "Projets audio bilingues. Paie uniquement via Stripe.",
      zh: "双语音频项目。仅通过 Stripe 付款。",
    },
    rails: ["stripe"],
    rule: { kind: "none" },
    priority: 20,
    verified: "2026-10-25",
  },
  {
    slug: "welocalize",
    name: "Welo Data",
    owner: "Welocalize",
    url: "https://www.welocalize.com",
    summary: {
      en: "Localization company with AI-trainer networks per language; each network lists eligible countries.",
      ru: "Локализационная компания с сетями AI-тренеров по языкам; у каждой сети свой список стран.",
      es: "Empresa de localización con redes de entrenadores por idioma; cada red tiene sus países.",
      fr: "Société de localisation avec des réseaux d’entraîneurs par langue ; pays éligibles par réseau.",
      zh: "本地化公司，按语种组建 AI 训练网络，每个网络有各自的适用国家。",
    },
    rails: [],
    rule: { kind: "none" },
    priority: 21,
    verified: "2026-10-25",
  },
];

export function getPlatform(slug: string) {
  return platforms.find((p) => p.slug === slug);
}

export function platformElig(p: Platform, cc: string): Elig {
  const o = p.overrides?.[cc];
  if (o) return o;
  switch (p.rule.kind) {
    case "allow":
      return p.rule.list.includes(cc) ? "yes" : "no";
    case "deny":
      return p.rule.list.includes(cc) ? "no" : "yes";
    case "global":
      return SANCTIONED.has(cc) ? "no" : "likely";
    case "none":
      return SANCTIONED.has(cc) ? "no" : "unknown";
  }
}

type Ref = { url?: string; code?: string };
const REFS = referrals as Record<string, Ref>;

export function platformApply(p: Platform): { href: string; isRef: boolean } {
  const r = REFS[p.slug];
  if (r?.url) return { href: r.url, isRef: true };
  if (r?.code && p.referralTemplate) return { href: p.referralTemplate.replace("{code}", encodeURIComponent(r.code)), isRef: true };
  return { href: p.signupUrl || p.url, isRef: false };
}
