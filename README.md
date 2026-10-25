# Gigmap — AI training jobs by country

Статический сайт на Next.js 16: 35 вакансий, 21 платформа, 42 страны, 5 языков (en, ru, es, fr, zh), ~517 страниц.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # статический экспорт в папку out/
```

## Как устроены данные

| Файл | Что внутри |
|---|---|
| `src/data/jobs.ts` | **Вакансии** — основная единица каталога: платформа, ставка, английский, требуемый язык, степень, статус, дата, прямая ссылка, ограничения по странам |
| `src/data/platforms.ts` | Платформы: описание на 5 языках, способы выплат, правило допуска по странам, `referralUrl` |
| `src/data/countries.ts` | Регионы и страны (коды ISO). Новый регион = новый массив кодов |
| `src/data/rails.ts` | Где работает каждый способ выплат (Deel, Payoneer, Stripe, PayPal, Wise, банк…) |
| `src/i18n/dict.ts` | Все тексты интерфейса на 5 языках |
| `src/i18n/config.ts` | Список языков. Новый язык = добавить код сюда и словарь в `dict.ts` |

Названия стран и языков переводятся автоматически через `Intl.DisplayNames` — вручную их писать не нужно.

### Как считается статус вакансии для страны

1. **Допуск** (`platformElig`): официальный список разрешённых стран (`allow`) или запрещённых (`deny`); «работаем по всему миру» без списка (`global` → «вероятно»); нет данных (`none` → «неизвестно»). Россия и Беларусь — «нет» по санкциям. Вакансия может сузить список (`countries.allow/deny`).
2. **Выплаты** (`bestPayout`): лучший из способов выплат платформы для этой страны.
3. **Итог**: «Доступно» (допуск подтверждён/вероятен и выплаты работают/вероятны), «Проверить» или «Недоступно».

Официальные списки стран сверены 25.10.2026: Mercor, Outlier, Mindrift, Prolific.

## Реферальные ссылки

Впишите ссылку в `referralUrl` нужной платформы в `src/data/platforms.ts`. Все кнопки «Откликнуться» этой платформы начнут вести по ней с `rel="sponsored"` и пометкой «реферальная ссылка». Официальная ссылка остаётся рядом.

## SEO и нейросети

- Каждая страница на 5 языках с `hreflang` и `x-default` (английский).
- `/` определяет язык браузера и перенаправляет на `/en`, `/ru`, `/es`, `/fr` или `/zh`.
- Страница на каждую страну (`/ru/countries/me`) — под запросы вида «AI-работа из Черногории».
- Разметка schema.org: `JobPosting`, `FAQPage`, `ItemList`, `BreadcrumbList`.
- `robots.txt` открыт для GPTBot, ClaudeBot, PerplexityBot, Google-Extended и др.
- `sitemap.xml` с языковыми альтернативами, `llms.txt` с полной сводкой вакансий по странам.

## Публикация на Cloudflare Pages

Домен задаётся переменной `NEXT_PUBLIC_SITE_URL` (по умолчанию `https://gigmap.pages.dev`). Пересоберите после смены адреса.

**Без GitHub:** Workers & Pages → Create → Pages → Upload assets → загрузить содержимое `out/` (архив `gigmap-site.zip`).

**С автообновлением:** залить проект на GitHub → Pages → Connect to Git → Build command `npm run build`, Output directory `out`, переменная `NEXT_PUBLIC_SITE_URL`.

---

## Автообновление вакансий

```
GitHub Actions (каждый день 11:00 UTC = 12:00 в Черногории зимой)
  └─ scripts/fetch-jobs.mjs  → data/jobs.scraped.json → коммит → Cloudflare пересобирает сайт
Админка /admin
  └─ загрузка CSV/JSON       → data/jobs.upload.* или data/referrals.json → коммит → пересборка
Сборка (npm run build)
  └─ scripts/build-data.mjs  → объединяет upload + manual + scraped → страницы сайта
```

### Скрапер

- Источники описаны в `scripts/sources.json`. Поддерживаются открытые API **Greenhouse**, **Lever**, **Ashby** и Mercor. Добавить компанию: узнать токен доски вакансий (`job-boards.greenhouse.io/<token>`, `jobs.lever.co/<token>`, `jobs.ashbyhq.com/<token>`) и добавить запись с `platform` из `src/data/platforms.ts`.
- Открытые вакансии получают `status: open`, исчезнувшие — `closed` с датой `closedAt`; закрытые хранятся `retentionDays` дней (по умолчанию 90).
- Если источник не ответил, его вакансии не трогаются.
- Локальный запуск: `npm run fetch-jobs` (или `node scripts/fetch-jobs.mjs --dry-run`).
- Платформы без открытого API (micro1, Alignerr, Outlier, Mindrift и др.) обновляются через админку или `data/jobs.manual.json`. Перед подключением новых источников проверьте условия использования сайта.

### Админка (`/admin`)

Работает через Cloudflare Pages Functions (папка `functions/`). Задайте в Cloudflare → проект → **Settings → Variables and Secrets**:

| Переменная | Значение |
|---|---|
| `ADMIN_PASSWORD` | пароль админки (Secret) |
| `GITHUB_TOKEN` | fine-grained token на репозиторий: **Contents — Read and write**, **Actions — Read and write** (Secret) |
| `GITHUB_REPO` | `e-7022/gigmaps` |
| `GITHUB_BRANCH` | `main` |
| `NEXT_PUBLIC_SITE_URL` | адрес сайта, например `https://gigmaps.pages.dev` |

Возможности: загрузить вакансии (CSV/JSON, файл заменяет прошлую загрузку), скачать текущие вакансии в CSV, сохранить реферальные ссылки, запустить скрапер вручную, посмотреть последние запуски.

**Формат CSV вакансий** — см. `/admin/template.csv`. Удобный цикл: «Скачать текущие (CSV)» → правка в Excel/Google Sheets → загрузка обратно. Колонка `id` сохраняет связь с существующей вакансией; для новой оставьте пустой.

### Реферальные ссылки

`data/referrals.json` (или загрузка через админку): `{ "micro1": { "url": "https://…ваша ссылка…" } }`. Кнопка «Откликнуться» на всех вакансиях платформы ведёт на эту ссылку (`rel="sponsored"`). Без ссылки — на страницу входа/регистрации платформы (`signupUrl`).
