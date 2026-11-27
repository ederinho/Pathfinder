# Pathfinder Dev w GitHub Actions

Workflow [android-dev.yml](../.github/workflows/android-dev.yml) uruchamia się po pushu na `feature/visual-integration-v0.1` w `ederinho/Pathfinder`. Wypchnięta gałąź musi zawierać zmiany wizualne w `www/`, wariant Android `android/app/src/dev/` i `android/app/build.gradle` oraz workflow. Złączenie z gałęzią domyślną jest zbędne.

## Jednorazowe przygotowanie podpisu Dev

W repozytorium skonfiguruj środowisko `pathfinder-dev-signing`. Ogranicz deployment branches do dokładnej gałęzi `feature/visual-integration-v0.1` i wyznacz zaufanego recenzenta. Przed jakimkolwiek udostępnieniem klucza sprawdź dostępność tych zabezpieczeń i treść workflow. Recenzent zatwierdza zadanie podpisywania po weryfikacji commitu. Zadanie kompilacji i testów działa bez sekretów. Zadanie podpisu pobiera tylko artefakt bieżącego przebiegu i nie korzysta z checkoutu.

Do środowiska dodaj wyłącznie dedykowany klucz deweloperski. Sekrety środowiska to `PATHFINDER_DEV_KEYSTORE_B64` (keystore zakodowany w base64), `PATHFINDER_DEV_STORE_PASSWORD` i `PATHFINDER_DEV_KEY_PASSWORD`. Zmienne środowiska to `PATHFINDER_DEV_KEY_ALIAS` i `PATHFINDER_DEV_CERT_SHA256` (64 znaki szesnastkowe z publicznego certyfikatu, bez dwukropków). Przechowuj kopię klucza poza repozytorium. Base64 służy do przenoszenia pliku, a wartość powinna zostać zapisana bezpośrednio w sekretach GitHub.

Oczekiwany odcisk jest sprawdzany przed użyciem klucza i ponownie na gotowym APK. Zachowaj ten sam klucz oraz `versionCode` co najmniej równy zainstalowanemu przy kolejnych aktualizacjach. Jeśli Dev z tego środowiska Codex jest już zainstalowany, jego certyfikat debug ma odcisk `fc0c029fa8df80b167c4c9f5a489681193edcda8221d21aaf5ac747073a013eb`. Aktualizacja tego egzemplarza wymaga odpowiadającego mu klucza. Przy przejściu na inny klucz zabezpiecz zapis Dev przez eksport przed odinstalowaniem Dev. Główna aplikacja ma osobny pakiet i osobny zapis.

## Pobranie

W zakładce **Actions** otwórz udany przebieg **Pathfinder Dev APK**. Z sekcji **Artifacts** pobierz `Pathfinder-Dev-…`, rozpakuj ZIP i użyj `Pathfinder-Dev.apk`. W tym samym ZIP są suma kontrolna i raport certyfikatu. Artefakt `pathfinder-dev-signing-input` jest plikiem pośrednim. Instaluj wyłącznie końcowy APK ze sprawdzonym podpisem. Repozytorium źródłowe jest publiczne, więc podpisane artefakty służą do publicznie dostępnych buildów testowych.
