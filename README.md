# Jotform Frontend Challenge Project

## User Information

Please fill in your information after forking this repository:

* **Name**: Keren Demirören

## Project Description

An investigation dashboard that unifies submissions into a single detective-style case file.

## Getting Started

\### Prerequisites

\- \*\*Node.js 20 or newer\*\* (Vite 8 requires >= 20.19). Check with `node -v`.

\- \*\*npm 10+\*\* (ships with recent Node versions).

\- A \*\*Jotform API key\*\*. Create one at <https://www.jotform.com/myaccount/api>.



\### 1. Install dependencies

```bash

cd jotform-app

npm install

```



\### 2. Configure your API key

Copy the example env file and fill in your key:



```bash

\# macOS / Linux

cp .env.example .env



\# Windows (PowerShell)

Copy-Item .env.example .env

```



Open `.env` and replace the placeholder:

```env

VITE\_JOTFORM\_API\_KEY=your\_real\_api\_key\_here

```

The `.env` file is git-ignored and is read at build time by Vite.



\### 3. Run the dev server

```bash

npm run dev

```

Vite prints a local URL (default <http://localhost:5173>). Open it in a browser — the app will fetch form metadata and submissions for the five investigation forms (Checkins, Messages, Sightings, Personal Notes, Anonymous Tips) and render the People / Records / Detail layout.



\### 4. Production build

```bash

npm run build     # type-checks + builds into dist/

npm run preview   # serves the built bundle locally

```



\### Other scripts

| Script          | What it does                                  |

| --------------- | --------------------------------------------- |

| `npm run dev`   | Start Vite dev server with HMR                |

| `npm run build` | Type-check (`tsc -b`) and build to `dist/`    |

| `npm run preview` | Preview the production build locally        |

| `npm run lint`  | Run ESLint over the project                   |



\### Troubleshooting

\- \*\*Blank page / "Missing API key" banner\*\*: ensure `.env` exists in `jotform-app/` (not the repo root) and that the variable name is exactly `VITE\_JOTFORM\_API\_KEY`. Restart `npm run dev` after changing env vars.

\- \*\*403 / 401 from Jotform\*\*: the key is invalid, revoked, or hit its rate limit. Generate a fresh one in the Jotform account panel.

\- \*\*`node` version errors during `npm install`\*\*: upgrade to Node 20.19+ (or use `nvm install 20 \&\& nvm use 20`).

\- \*\*Map tiles don't load\*\*: OpenStreetMap tiles need network access; corporate proxies sometimes block `\*.tile.openstreetmap.org`.



\### Project layout

```

jotform-app/

├── index.html              # Loads Google Fonts (Lora) + Vite entry

├── .env                    # Your local API key (git-ignored)

├── src/

│   ├── components/         # PeoplePanel, RecordsPanel, DetailPanel, MapModal, ...

│   ├── constants/          # Form IDs

│   ├── services/           # jotformApi (fetch wrapper)

│   ├── store/              # Redux Toolkit slices: forms, records, ui

│   ├── types/              # Jotform + normalized record types

│   ├── utils/              # Parsers, formatters, name-matching

│   ├── App.tsx             # Top-level shell

│   ├── index.css           # Design tokens (cream detective theme)

│   └── main.tsx            # App entry

└── vite.config.ts

```🚀 Challenge Duyurusu

## 📅 Tarih ve Saat

Cumartesi günü başlama saatinden itibaren üç saattir.

## 🎯 Challenge Konsepti

Bu challenge'da, size özel hazırlanmış bir senaryo üzerine web uygulaması geliştirmeniz istenecektir. Challenge başlangıcında senaryo detayları paylaşılacaktır.Katılımcılar, verilen GitHub reposunu fork ederek kendi geliştirme ortamlarını oluşturacaklardır.

## 📦 GitHub Reposu

Challenge için kullanılacak repo: https://github.com/cemjotform/2026-frontend-challenge-ankara

## 🛠️ Hazırlık Süreci

1. GitHub reposunu fork edin
2. Tercih ettiğiniz framework ile geliştirme ortamınızı hazırlayın
3. Hazırladığınız setup'ı fork ettiğiniz repoya gönderin

## 💡 Önemli Notlar

* Katılımcılar kendi tercih ettikleri framework'leri kullanabilirler

