# ZUS Nawigator

MVP HackNation 2026 — responsywna aplikacja pomagająca Polakom planującym rodzicielstwo odnaleźć właściwe świadczenia, przygotować dokumenty i ocenić ryzyka.

## Funkcje

- Kreator danych o zatrudnieniu i sytuacji rodzinnej
- Kalkulator chorobowego, macierzyńskiego, rodzicielskiego, adopcyjnego i innych świadczeń
- Lista wymaganych dokumentów i ocena kompletności sprawy
- Silnik prostych ostrzeżeń o ryzyku
- Mock PUE/eZUS: status ubezpieczenia, zadłużenie i historia świadczeń
- Mock logowania mObywatel
- Mock parsera PDF i generowania pakietu ZAM/ZUR3/ZAO4
- Asystent czatu z API openAI-compatible
- Responsywny, mobile-first interfejs

## Uruchomienie

```bash
npm run dev:api
npm run dev:web
```

Frontend: http://localhost:3000
Backend: http://localhost:4000

## Budowa

```bash
npm run build
```

## Struktura

- `apps/web` — Next.js, React, TypeScript, Tailwind CSS
- `apps/api` — NestJS, TypeScript, REST mock API

## API demo

- `GET /api/profile`
- `GET /api/zus/status`
- `POST /api/benefits/calculate`
- `POST /api/risk/check`
- `POST /api/documents/parse`
- `POST /api/documents/generate`
- `POST /api/chat`
- `POST /api/auth/login`

> Projekt ma charakter demonstracyjny i nie zastępuje oficjalnych wyliczeń ZUS. Integracja PUE/eZUS, autentyczne podpisywanie formularzy i generowanie PDF wymagają formalnej integracji i bezpieczeństwa produkcyjnego.