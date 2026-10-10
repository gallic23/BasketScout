/* ==============================================================
       6. CONFIGURAZIONE PARTITA ATTIVA
       ============================================================== */
    function updateMatchConfig() {
      const match = getActiveMatch();
      if (!match) return;

      match.homeTeam = document.getElementById('inputHomeTeamName').value.trim() || "Basket Club";
      match.awayTeam = document.getElementById('inputAwayTeamName').value.trim() || "Ospiti";
      match.category = document.getElementById('inputCategory').value.trim();
      match.date = document.getElementById('inputMatchDate').value;
      match.venue = document.getElementById('inputMatchVenue').value.trim();

      saveLocalState();
      updateScoreboardUI();
      updateHeaderMatchSelector();
      renderMatchesGrid();
      document.getElementById('currentActiveMatchTitle').innerText = `${match.homeTeam} vs ${match.awayTeam}`;
    }

    function updateMatchInputs() {
      const match = getActiveMatch();
      if (!match) return;

      const ih = document.getElementById('inputHomeTeamName');
      const ia = document.getElementById('inputAwayTeamName');
      const ic = document.getElementById('inputCategory');
      const idate = document.getElementById('inputMatchDate');
      const iv = document.getElementById('inputMatchVenue');
      const title = document.getElementById('currentActiveMatchTitle');

      if (ih) ih.value = match.homeTeam || "Basket Club";
      if (ia) ia.value = match.awayTeam || "Ospiti";
      if (ic) ic.value = match.category || "";
      if (idate) idate.value = match.date || "";
      if (iv) iv.value = match.venue || "";
      if (title) title.innerText = `${match.homeTeam || 'Casa'} vs ${match.awayTeam || 'Ospiti'}`;

      updateCloseMatchButton();
    }

    function toggleCloseMatch() {
      const match = getActiveMatch();
      if (!match) return;

      match.isClosed = !match.isClosed;
      updateCloseMatchButton();
      updateHeaderMatchSelector();
      renderMatchesGrid();
      saveLocalState();
    }

    function updateCloseMatchButton() {
      const match = getActiveMatch();
      if (!match) return;

      const btn = document.getElementById('btnCloseMatch');
      const badge = document.getElementById('matchStateBadge');
      const liveBadge = document.getElementById('liveStatusBadge');

      if (!btn || !badge || !liveBadge) return;

      if (match.isClosed) {
        btn.innerHTML = `<i class="fa-solid fa-lock-open"></i> <span>Riapri Partita</span>`;
        btn.className = "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow";
        badge.innerText = "PARTITA CONCLUSA";
        badge.className = "text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700";
        liveBadge.className = "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700";
        liveBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span> TERMINATA`;
      } else {
        btn.innerHTML = `<i class="fa-solid fa-flag-checkered"></i> <span>Termina / Chiudi Partita</span>`;
        btn.className = "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow";
        badge.innerText = "IN CORSO";
        badge.className = "text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
        liveBadge.className = "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
        liveBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE`;
      }
    }

    function resetMatch() {
      const match = getActiveMatch();
      if (!match) return;

      if (!confirm(`Sei sicuro di voler azzerare il tabellone e le statistiche per "${match.homeTeam} vs ${match.awayTeam}"?`)) return;
      match.homeScore = 0;
      match.awayScore = 0;
      match.quarter = '1Q';
      match.isClosed = false;
      match.actionsHistory = [];
      match.players.forEach(p => {
        p.pts = 0; p.fg2m = 0; p.fg2a = 0; p.fg3m = 0; p.fg3a = 0; p.ftm = 0; p.fta = 0;
        p.rebO = 0; p.rebD = 0; p.ast = 0; p.stl = 0; p.tov = 0; p.blk = 0; p.fouls = 0;
      });
      saveLocalState();
      renderAll();
      setQuarter('1Q');
      updateActionsLogUI("Partita azzerata con successo.");
    }
