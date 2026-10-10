/* ==============================================================
       3. GESTIONE MULTI-PARTITA
       ============================================================== */
    function syncMasterRosterToActiveMatch() {
      const match = getActiveMatch();
      if (!match) return;

      // Sincronizza atleti dal master al match corrente se mancano
      appState.masterRoster.forEach(mr => {
        let p = match.players.find(x => x.id === mr.id);
        if (!p) {
          match.players.push(createEmptyPlayerStats(mr));
        } else {
          p.name = mr.name;
          p.number = mr.number;
          p.role = mr.role;
        }
      });
    }

    function updateHeaderMatchSelector() {
      const selector = document.getElementById('headerMatchSelector');
      if (!selector) return;
      selector.innerHTML = '';

      appState.matches.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        const statusText = m.isClosed ? '🏁' : '🟢';
        opt.innerText = `${statusText} ${m.homeTeam} vs ${m.awayTeam} (${m.date || 'Data N/D'})`;
        if (m.id === appState.activeMatchId) opt.selected = true;
        selector.appendChild(opt);
      });
    }

    function changeActiveMatchFromHeader(matchId) {
      setActiveMatch(matchId);
    }

    function setActiveMatch(matchId) {
      if (appState.activeMatchId === matchId) return;
      appState.activeMatchId = matchId;
      appState.selectedPlayerId = null;
      syncMasterRosterToActiveMatch();
      saveLocalState();
      renderAll();
      const match = getActiveMatch();
      if (match) {
        updateActionsLogUI(`Partita attivata: ${match.homeTeam} vs ${match.awayTeam}`);
      }
    }

    function renderMatchesGrid() {
      const container = document.getElementById('matchesListGrid');
      if (!container) return;
      container.innerHTML = '';

      appState.matches.forEach(m => {
        const isActive = m.id === appState.activeMatchId;
        const card = document.createElement('div');
        card.className = `p-4 rounded-xl border transition flex flex-col justify-between ${
          isActive
            ? 'bg-orange-950/20 border-orange-500 shadow-md ring-1 ring-orange-500/50'
            : 'bg-[#0d1424] border-slate-800 hover:border-slate-700'
        }`;

        const formattedDate = m.date || 'Data n.d.';
        const statusBadge = m.isClosed 
          ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">Chiusa</span>`
          : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">In Corso</span>`;

        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <i class="fa-regular fa-calendar text-slate-500"></i> ${formattedDate}
              </span>
              ${statusBadge}
            </div>
            
            <div class="text-sm font-bold text-white leading-snug">
              ${m.homeTeam} <span class="text-orange-400 font-normal">vs</span> ${m.awayTeam}
            </div>
            <div class="text-xs text-slate-400 mt-0.5 truncate">
              ${m.category || 'Amichevole'} ${m.venue ? '• ' + m.venue : ''}
            </div>

            <div class="my-3 py-2 px-3 rounded-lg bg-[#080d18] border border-slate-800/80 flex items-center justify-around">
              <div class="text-center">
                <div class="text-[10px] uppercase font-bold text-slate-400">Casa</div>
                <div class="text-xl font-black font-mono-code text-white">${m.homeScore}</div>
              </div>
              <span class="text-slate-600 font-black text-xs">-</span>
              <div class="text-center">
                <div class="text-[10px] uppercase font-bold text-slate-400">Ospiti</div>
                <div class="text-xl font-black font-mono-code text-white">${m.awayScore}</div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2 border-t border-slate-800/60 justify-between">
            ${
              isActive 
                ? `<span class="text-xs font-bold text-orange-400 flex items-center gap-1.5"><i class="fa-solid fa-check-circle"></i> Attiva</span>`
                : `<button onclick="setActiveMatch('${m.id}')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition">Seleziona</button>`
            }

            <div class="flex items-center gap-1">
              <button onclick="deleteMatch('${m.id}')" class="p-1.5 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-lg text-xs transition" title="Elimina Partita">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }

    function openNewMatchModal() {
      const modal = document.getElementById('newMatchModal');
      document.getElementById('newMatchHome').value = "C.R.A.C. BIONICS Gialla";
      document.getElementById('newMatchDate').value = new Date().toISOString().slice(0, 10);
      document.getElementById('newMatchVenue').value = "PalaTiziano - Via Tiziano 7, Buccinasco (MI)";
      modal.classList.remove('hidden');
    }

    function closeNewMatchModal() {
      document.getElementById('newMatchModal').classList.add('hidden');
    }

    function confirmCreateMatch() {
      const home = document.getElementById('newMatchHome').value.trim() || "C.R.A.C. BIONICS Gialla";
      const away = document.getElementById('newMatchAway').value.trim() || "Ospiti";
      const date = document.getElementById('newMatchDate').value || new Date().toISOString().slice(0, 10);
      const category = document.getElementById('newMatchCategory').value.trim() || "Campionato";
      const venue = document.getElementById('newMatchVenue').value.trim() || "PalaTiziano - Via Tiziano 7, Buccinasco (MI)";

      const newMatchId = 'match_' + Date.now();
      const newMatch = {
        id: newMatchId,
        date: date,
        homeTeam: home,
        awayTeam: away,
        category: category,
        venue: venue,
        quarter: "1Q",
        homeScore: 0,
        awayScore: 0,
        isClosed: false,
        actionsHistory: [],
        players: appState.masterRoster.map(p => createEmptyPlayerStats(p))
      };

      appState.matches.push(newMatch);
      appState.activeMatchId = newMatchId;
      appState.selectedPlayerId = null;

      closeNewMatchModal();
      saveLocalState();
      renderAll();
      switchTab('livescout');
    }

    function deleteMatch(matchId) {
      if (appState.matches.length <= 1) {
        alert("Non puoi eliminare l'unica partita presente. Creane un'altra prima di eliminare questa.");
        return;
      }
      if (!confirm("Sei sicuro di voler eliminare questa partita e tutti i dati registrati al suo interno?")) return;

      appState.matches = appState.matches.filter(m => m.id !== matchId);
      if (appState.activeMatchId === matchId) {
        appState.activeMatchId = appState.matches[0].id;
      }
      saveLocalState();
      renderAll();
    }
