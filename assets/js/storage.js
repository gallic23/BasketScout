/* ==============================================================
       9. SALVATAGGIO LOCALE & EXPORT JSON
       ============================================================== */
    function saveLocalState() {
      const dataToSave = {
        activeMatchId: appState.activeMatchId,
        matches: appState.matches,
        masterRoster: appState.masterRoster
      };
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.MATCH_DATA, JSON.stringify(dataToSave));
    }

    function loadSavedLocalData() {
      // Prova nuova versione v150
      let raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.MATCH_DATA);
      // Fallback da vecchia versione v140 se presente
      if (!raw) raw = localStorage.getItem('basketscout_match_state_v140');

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          // Se proviene da v140 (formato singola partita)
          if (!parsed.matches && parsed.players) {
            const singleMatch = {
              id: 'match_1',
              date: new Date().toISOString().slice(0, 10),
              homeTeam: parsed.matchConfig?.homeTeam || "Basket Club",
              awayTeam: parsed.matchConfig?.awayTeam || "Ospiti",
              category: parsed.matchConfig?.category || "Campionato",
              venue: parsed.matchConfig?.venue || "",
              quarter: parsed.quarter || '1Q',
              homeScore: parsed.homeScore || 0,
              awayScore: parsed.awayScore || 0,
              isClosed: !!parsed.isMatchClosed,
              actionsHistory: parsed.actionsHistory || [],
              players: parsed.players
            };
            appState.matches = [singleMatch];
            appState.activeMatchId = 'match_1';
            appState.masterRoster = parsed.players.map(p => ({
              id: p.id, number: p.number, name: p.name, role: p.role, active: p.active !== false
            }));
          } else {
            // Struttura multi-partita completa
            if (parsed.matches && parsed.matches.length > 0) {
              appState.matches = parsed.matches;
              appState.activeMatchId = parsed.activeMatchId || parsed.matches[0].id;
            }
            if (parsed.masterRoster && parsed.masterRoster.length > 0) {
              appState.masterRoster = parsed.masterRoster;
            }
          }
        } catch(e) { console.error("Errore caricamento dati locali:", e); }
      }
    }

    function exportLocalJson() {
      const exportObject = {
        appVersion: "1.5.0",
        exportDate: new Date().toISOString(),
        activeMatchId: appState.activeMatchId,
        matches: appState.matches,
        masterRoster: appState.masterRoster
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `BasketScout_MultiMatch_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    function logSyncMessage(msg) {
      const logBox = document.getElementById('syncLog');
      if (!logBox) return;
      const time = new Date().toLocaleTimeString();
      const item = document.createElement('div');
      item.innerText = `[${time}] • ${msg}`;
      logBox.prepend(item);
    }

    function openDriveModal() {
      document.getElementById('driveModal').classList.remove('hidden');
    }
    function closeDriveModal() {
      document.getElementById('driveModal').classList.add('hidden');
    }
