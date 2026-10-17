# BasketScout

## Struttura

- `index.html`: struttura delle schermate e collegamenti alle risorse.
- `assets/css/styles.css`: stili personalizzati; Tailwind e le icone restano caricati dai CDN.
- `assets/js/app.js`: configurazione, stato condiviso, inizializzazione e navigazione.
- `assets/js/matches.js`: archivio e selezione delle partite.
- `assets/js/live-scout.js`: registrazione delle azioni e tabellone live.
- `assets/js/roster.js`: gestione degli atleti.
- `assets/js/match-config.js`: configurazione e stato della partita.
- `assets/js/statistics.js`: statistiche ed esportazione CSV.
- `assets/js/drive.js`: autenticazione Google e sincronizzazione Drive.
- `assets/js/storage.js`: salvataggio locale e backup JSON.

Gli script sono caricati come script classici, nell'ordine indicato in `index.html`. Questo mantiene compatibili lo stato condiviso e gli handler `onclick` usati nelle schermate. Per passare in futuro ai moduli JavaScript, occorrerà spostare quegli handler in listener registrati dal codice.

## Pubblicazione e versione

GitHub Actions pubblica il sito su GitHub Pages quando viene aggiornato il branch `main` o viene inviato un tag di versione nel formato `vX.Y.Z` (ad esempio `v1.6.0`). Il workflow ricava la versione dal tag e la usa nell'interfaccia e nei backup. Se non esistono ancora tag, usa la versione iniziale in `assets/js/version.js`.

Per abilitare la pubblicazione tramite Actions, in GitHub apri **Settings > Pages** e imposta **Build and deployment > Source** su **GitHub Actions**. Per pubblicare una nuova versione, crea e invia un tag:

```sh
git tag v1.6.0
git push origin v1.6.0
```

I push successivi su `main` mantengono la versione dell'ultimo tag raggiungibile.
