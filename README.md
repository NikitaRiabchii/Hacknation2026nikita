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

## Pobranie projektu

Wymagania:

- Node.js 20.9 lub nowszy (zalecany Node.js 22 LTS)
- npm dołączony do Node.js
- Git
- Opcjonalnie: LM Studio z modelem `openai/gpt-oss-20b`, jeśli chcesz używać lokalnego asystenta AI

### macOS

Zainstaluj narzędzia przez Homebrew:

```bash
brew install node git
```

Pobierz i zainstaluj projekt:

```bash
git clone https://github.com/NikitaRiabchii/Hacknation2026nikita.git
cd Hacknation2026nikita
npm install --prefix apps/api
npm install --prefix apps/web
```

### Windows

1. Zainstaluj Git for Windows: https://git-scm.com/download/win
2. Zainstaluj Node.js LTS: https://nodejs.org/
3. Otwórz PowerShell i wykonaj:

```powershell
git clone https://github.com/NikitaRiabchii/Hacknation2026nikita.git
cd Hacknation2026nikita
npm install --prefix apps/api
npm install --prefix apps/web
```

### Linux

Przykład dla Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y nodejs npm git
```

Jeśli dystrybucja ma starą wersję Node.js, zainstaluj Node.js 22 przez nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 22
nvm use 22
```

Następnie pobierz i zainstaluj projekt:

```bash
git clone https://github.com/NikitaRiabchii/Hacknation2026nikita.git
cd Hacknation2026nikita
npm install --prefix apps/api
npm install --prefix apps/web
```

## Uruchomienie aplikacji

Uruchom backend i frontend w dwóch osobnych terminalach z katalogu głównego projektu.

Terminal 1 — backend NestJS:

```bash
npm run dev:api
```

Terminal 2 — frontend Next.js:

```bash
npm run dev:web
```

Następnie otwórz:

- Frontend: http://localhost:3000
- Backend/API: http://localhost:4000

Zatrzymanie usług: naciśnij `Ctrl+C` w każdym terminalu.

## Opcjonalny asystent AI przez LM Studio

1. Zainstaluj LM Studio: https://lmstudio.ai/
2. Pobierz i załaduj model `openai/gpt-oss-20b`.
3. Uruchom lokalny serwer LM Studio pod adresem `http://127.0.0.1:1234/v1`.
4. Uruchom backend i frontend według instrukcji powyżej.

Jeśli LM Studio jest niedostępne, aplikacja nadal działa i asystent przechodzi w tryb awaryjny.

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