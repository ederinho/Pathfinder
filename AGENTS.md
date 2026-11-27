# Praca nad Pathfinderem

## Środowisko i zakres

- Punkt odniesienia tej konfiguracji to gałąź `living-characters`, tag `v0.24.3`, build 2403. Sprawdzaj stan zadania przez `git status --short --branch`, `git log -1 --oneline` i `cat www/version.json`.
- W Codex Cloud korzystaj z checkoutu `/workspace/Pathfinder`. Każde zadanie dostaje izolowane środowisko. Dodatkowy Git worktree twórz na wyraźną prośbę użytkownika.
- Zachowuj istniejące zmiany użytkownika. Przed zakończeniem przejrzyj diff i wyniki testów. Operacje zdalne zmieniające stan, podpisywanie wydania i wdrożenia wymagają osobnej zgody.

## Architektura

- `www/` jest źródłem aktualnej aplikacji webowej i katalogiem `webDir` Capacitor. `www/version.json` podaje wersję gry. Pliki PWA w katalogu głównym pochodzą ze starszego wydania.
- `www/app-921.js` spina interfejs i stan. Moduły dziennika, dialogów, Living Characters i Living Chronicle znajdują się w `www/` wraz z zasobami. Zapis aplikacji korzysta z IndexedDB, a eksport kopii jest szyfrowany.
- `android/` zawiera projekt Capacitor, wrapper Gradle i kod natywny. Identyfikator aplikacji to `com.ederinho.pathfinder`. Capacitor kopiuje zasoby podczas synchronizacji. Interfejsy konsultacji Kaela i Wyroczni są przeznaczone dla natywnego Androida.
- `backend/` zawiera serwer Node.js, protokoły konsultacji i kronikarza, limity oraz integrację z dostawcą AI. Do rutynowego rozwoju używaj testów lokalnych i symulacji.
- Dokumentacja funkcji: [Living Characters](docs/LIVING_CHARACTERS.md) i [Living Chronicle](docs/LIVING_CHRONICLE.md).

## Uruchomienie i testy

Z katalogu głównego uruchom `python3 -m http.server 8243 --bind 127.0.0.1 --directory www`. Sprawdź `/version.json` przez HTTP na tym samym porcie. W świeżym profilu Chromium przejdź przez ekran powitalny, utwórz próbne zlecenie i po potwierdzeniu zapisu sprawdź jego obecność po odświeżeniu.

```bash
node scripts/test-dialogue-pilot.cjs
node scripts/test-living-characters.cjs
node scripts/test-living-chronicle.cjs
node backend/server.cjs --self-test
node backend/server.cjs --ai-self-test
node scripts/build-android.cjs --check-only
```

`npm test` jest atrapą. Pełny helper `npm run build:android` obsługuje Windows z JDK 21. Na Linuksie użyj etapów opisanych w [propozycji kompilacji](docs/ANDROID_CI.md) po zatwierdzeniu. Sprawdzaj SRI bez `--refresh-integrity`. Świadoma zmiana zasobu objętego SRI wymaga dopasowanej aktualizacji hasha i ponownej weryfikacji.

## Dane i bezpieczeństwo

- Do testów używaj syntetycznych danych i świeżych, izolowanych profili. Zachowaj zapisy graczy, kopie, istniejące pliki i stan limitów.
- Trzymaj sekrety, keystore, tokeny, eksporty graczy i dane diagnostyczne poza repozytorium, logami i artefaktami. Kluczem podpisującym zarządza właściciel wydania.
- Lokalna weryfikacja korzysta z backendu w trybie mock lub atrap dostawcy. Płatne API, zmiany Railway, produkcyjnych ustawień i limitów są poza zakresem zwykłego testowania.
