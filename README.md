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
