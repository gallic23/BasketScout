/* ==============================================================
       1. STATO DELL'APPLICAZIONE (MULTI-PARTITA & OFFLINE FIRST)
       ============================================================== */
    const APP_CONFIG = {
      BACKUP_FILE_NAME: 'BasketScout_Data.json',
      STORAGE_KEYS: {
        CLIENT_ID: 'basketscout_gdrive_client_id',
        AUTH_TOKEN: 'basketscout_gdrive_token',
        USER_EMAIL: 'basketscout_gdrive_email',
        MATCH_DATA: 'basketscout_match_state_v150'
      }
    };

    const DEFAULT_PLAYERS_TEMPLATE = [
      { id: 1, number: 4, name: "Marco Rossi", role: "Playmaker", active: true },
      { id: 2, number: 7, name: "Andrea Bianchi", role: "Guardia", active: true },
      { id: 3, number: 9, name: "Luca Ferrari", role: "Ala Piccola", active: true },
      { id: 4, number: 12, name: "Matteo Conti", role: "Ala Grande", active: true },
      { id: 5, number: 15, name: "Davide Ricci", role: "Centro", active: true },
      { id: 6, number: 21, name: "Stefano De Luca", role: "Guardia", active: true }
    ];

    function createEmptyPlayerStats(player) {
      return {
        id: player.id,
        number: player.number,
        name: player.name,
        role: player.role,
        active: player.active !== false,
        pts: 0, fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0,
        rebO: 0, rebD: 0, ast: 0, stl: 0, tov: 0, blk: 0, fouls: 0
      };
    }

    const todayIso = new Date().toISOString().slice(0, 10);

    let appState = {
      currentTab: 'livescout',
      activeMatchId: 'match_1',
      // Archivio Multi-Partite
      matches: [
        {
          id: 'match_1',
          date: todayIso,
          homeTeam: "C.R.A.C. BIONICS Gialla",
          awayTeam: "Ospiti",
          category: "Under 17 Regionale",
          venue: "PalaTiziano - Via Tiziano 7, Buccinasco (MI)",
          quarter: "1Q",
          homeScore: 0,
          awayScore: 0,
          isClosed: false,
          actionsHistory: [],
          players: DEFAULT_PLAYERS_TEMPLATE.map(p => createEmptyPlayerStats(p))
        }
      ],
      // Master Roster atleti
      masterRoster: [...DEFAULT_PLAYERS_TEMPLATE],
      selectedPlayerId: null,
      statsFilter: {
        matchId: 'active', // 'active', 'all', o id specifico
        dateStart: '',
        dateEnd: ''
      },
      cloud: {
        tokenClient: null,
        accessToken: null,
        userEmail: null,
        lastSync: null
      }
    };

    function getActiveMatch() {
      let m = appState.matches.find(item => item.id === appState.activeMatchId);
      if (!m && appState.matches.length > 0) {
        appState.activeMatchId = appState.matches[0].id;
        m = appState.matches[0];
      }
      return m;
    }

/* ==============================================================
       2. INIZIALIZZAZIONE & SWITCHING TAB NAVIGATION
       ============================================================== */
    window.addEventListener('DOMContentLoaded', () => {
      loadSavedLocalData();
      syncMasterRosterToActiveMatch();
      initGoogleDriveIntegration();
      initFilterDates();
      renderAll();
      switchTab(appState.currentTab || 'livescout');
    });

    function initFilterDates() {
      const today = new Date().toISOString().slice(0, 10);
      const ds = document.getElementById('statsFilterDateStart');
      const de = document.getElementById('statsFilterDateEnd');
      if (de && !de.value) de.value = today;
    }

    function switchTab(tabId) {
      if (tabId === 'scout') tabId = 'livescout';
      appState.currentTab = tabId;

      const tabs = [
        { key: 'roster', sectionId: 'sectionRoster', btnId: 'tabBtn-roster' },
        { key: 'partita', sectionId: 'sectionPartita', btnId: 'tabBtn-partita' },
        { key: 'livescout', sectionId: 'sectionLivescout', btnId: 'tabBtn-livescout' },
        { key: 'statistiche', sectionId: 'sectionStatistiche', btnId: 'tabBtn-statistiche' }
      ];

      tabs.forEach(t => {
        const sec = document.getElementById(t.sectionId);
        const btn = document.getElementById(t.btnId);
        if (!sec || !btn) return;

        if (t.key === tabId) {
          sec.classList.remove('hidden');
          btn.className = "flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-orange-600 text-white shadow-lg shadow-orange-950/60 transition";
        } else {
          sec.classList.add('hidden');
          btn.className = "flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition";
        }
      });

      if (tabId === 'statistiche') {
        populateStatsMatchDropdown();
        applyStatsFilters();
      }
      if (tabId === 'roster') renderRosterTable();
      if (tabId === 'partita') {
        renderMatchesGrid();
        updateMatchInputs();
      }
      if (tabId === 'livescout') {
        renderLiveRosterBar();
        updateScoreboardUI();
      }
    }

    function renderAll() {
      updateHeaderMatchSelector();
      updateScoreboardUI();
      renderLiveRosterBar();
      renderRosterTable();
      renderMatchesGrid();
      updateMatchInputs();
      populateStatsMatchDropdown();
      applyStatsFilters();
    }
