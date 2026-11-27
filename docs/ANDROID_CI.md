# Projekt kompilacji APK w GitHub Actions

Do zatwierdzenia. [Projekt YAML](android-apk.workflow.example.yml) jest w `docs/`. Aktywacja wymaga skopiowania go po przeglądzie do `.github/workflows/android-apk.yml`.

## Stan i narzędzia

| Element | Ustalenie |
| --- | --- |
| Node.js | Lockfile wymaga Node ≥22 dla Capacitor CLI. Proponowana linia Node 24. |
| Capacitor | CLI, Core i Android rozwiązywane przez lockfile do 8.6.3. Filesystem 8.1.5, Share 8.0.3. |
| JDK | Java 21 według skryptu Windows i konfiguracji kompilacji Capacitor. Proponowany Temurin 21. |
| Gradle | Wrapper 8.14.3, Android Gradle Plugin 8.13.0. |
| Android SDK | Konfiguracja compile/target 36, min 24. Workflow instaluje platformę 36 i Build Tools 35.0.0. |
| Metadane APK | `com.ederinho.pathfinder`, versionCode 1, versionName 1.0. Wersja gry 0.24.3 i build 2403 pochodzą z `www/version.json`. |

Skrypt repozytorium używa `cmd.exe`, `java.exe` i `gradlew.bat`. Tryb `--check-only` działa na Linuksie. Workflow odtwarza pełną sekwencję przez `npm ci`, testy, kontrolę SRI, `npx --no-install cap sync android`, porównanie zasobów i `bash ./gradlew`. Wrapper zapisany w Git ma tryb 0644. Wywołanie przez Bash obsługuje go bez zmiany metadanych.

Proponowane wyzwalacze to pull request do `living-characters` oraz ręczne uruchomienie. Zadanie ma uprawnienie `contents: read`. Po sukcesie pojawi się artefakt ZIP z APK, sumą SHA-256 i raportem certyfikatu. Pobierz ZIP z zakładki Actions i rozpakuj APK do instalacji na telefonie testowym. Budowa wymaga dostępu runnera do npm, Android SDK, dystrybucji Gradle i repozytoriów Maven. Pierwsze uruchomienie na GitHubie potwierdzi dostęp i zgodność całego łańcucha. Przed aktywacją przypnij użyte Actions do zweryfikowanych pełnych SHA wybranych wydań i włącz aktualizacje tych przypięć.

## Podpis i aktualizacja na telefonie

- Projekt buduje `assembleDebug` z domyślnym podpisem debug Androida. Śledzona konfiguracja nie definiuje własnego podpisu ani konfiguracji podpisywania release. Efemeryczny runner może wygenerować inny certyfikat debug dla każdego przebiegu. Artefakt PR służy do testów na osobnym urządzeniu, emulatorze lub profilu bez istniejącej instalacji.
- Przed aktualizacją ustal publiczny odcisk SHA-256 certyfikatu z zaufanego APK odpowiadającego instalacji na telefonie, np. przez `apksigner verify --print-certs stary.apk`. Porównaj też identyfikator pakietu i versionCode z APK lub urządzenia. Zachowaj kopię danych i przetestuj aktualizację na kopii instalacji. Plan kolejnych wydań powinien zapewniać rosnący versionCode. Build 2403 gry sam go nie ustawia.
- Zgodny APK musi mieć ten sam identyfikator, pasujący certyfikat (lub obsługiwaną historię rotacji) oraz versionCode dopuszczający aktualizację. Jeśli obecna instalacja pochodzi z lokalnego debug APK, zgodność wymaga dostępu do tego samego klucza, po potwierdzeniu odcisku. Jeśli pochodzi z Google Play, sprawdź certyfikat podpisywania aplikacji, który może się różnić od certyfikatu klucza przesyłania.
- Preferowany pierwszy krok to podpisanie zweryfikowanego APK na zaufanej maszynie właściciela klucza. Przy zastępowaniu podpisu artefaktu debug użyj Android Build Tools i zweryfikuj ostateczny podpis, zgodność wyrównania oraz odcisk certyfikatu. Wygeneruj nową sumę SHA-256 dla podpisanego pliku. W razie braku oryginalnego klucza lub wspieranej ścieżki rotacji zaplanuj migrację danych dopiero po sprawdzeniu eksportu i odtworzenia.
- Jeśli podpisywanie w CI zostanie osobno zatwierdzone, użyj osobnego ręcznego workflow z chronionym środowiskiem GitHub, zaufaną referencją i akceptacją właściciela. Przekazuj do zadania podpisującego zweryfikowany artefakt z zaufanego przebiegu. Keystore i hasła umieść w sekretach środowiska, ogranicz dostęp do kroku podpisu, usuń plik tymczasowy po procesie i publikuj tylko wynik oraz publiczną metrykę certyfikatu. Nie udostępniaj sekretów przebiegom PR.

Do zatwierdzenia pozostają aktywacja workflow i wybór ścieżki podpisywania aktualizacji po potwierdzeniu podpisu obecnej instalacji.
