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

## Bezpieczeństwo, prywatność i samodzielność systemu AI

Wersja demonstracyjna używa modelu sztucznej inteligencji uruchomionego lokalnie na osobistym komputerze, bez wysyłania pytań ani danych do zewnętrznego dostawcy chmury. Taka konfiguracja została zastosowana ze względów prywatności i bezpieczeństwa danych: pytania do asystenta, pliki i informacje użytkownika pozostają w lokalnym środowisku podczas prezentacji.

Projekt symuluje wymagania bezpieczeństwa stosowane w systemach publicznych i dojrzałych usług e-government:

- mock logowania mObywatel i mock PUE/eZUS zamiast połączenia z realnym kontem urzędowym,
- brak przesyłania prawdziwych danych osobowych, PESEL-ów lub dokumentów do zewnętrznych usług,
- testowanie formularzy i walidacji dokumentów bez korzystania z produkcyjnego podpisu elektronicznego,
- lokalne przetwarzanie odpowiedzi AI przez LM Studio na osobistym komputerze,
- przejrzysta informacja o trybie awaryjnym i o tym, że rozwiązanie jest MVP,
- możliwość rozbudowy o uwierzytelnianie, szyfrowanie danych, kontrolę uprawnień i audyt działań przed wdrożeniem produkcyjnym.

Celem tej konfiguracji jest ograniczenie ryzyka wycieku informacji i zwiększenie niezależności rozwiązania od usług zewnętrznych. Nie jest to jednak wdrożenie produkcyjne ZUS ani oficjalny kanał wymiany danych z administracją publiczną. Mock PUE/eZUS nie zastępuje rzeczywistego systemu państwowego i powinien być zastąpiony autoryzowaną integracją z odpowiednimi usługami urzędowymi przed użyciem z realnymi danymi.

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