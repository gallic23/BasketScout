/* ==============================================================
       4. SEZIONE LIVE SCOUT & STATISTICHE TOUCH
       ============================================================== */
    function renderLiveRosterBar() {
      const container = document.getElementById('liveRosterBar');
      if (!container) return;
      container.innerHTML = '';

      const match = getActiveMatch();
      if (!match) return;

      const activePlayers = match.players
        .filter(p => p.active !== false)
        .sort((a, b) => a.number - b.number);

      if (activePlayers.length === 0) {
        container.innerHTML = `
          <div class="col-span-3 sm:col-span-6 p-4 rounded-xl bg-[#0d1424] text-center text-xs text-slate-400 border border-slate-800">
            Nessun atleta convocato attivo. <button onclick="switchTab('roster')" class="text-orange-400 underline font-bold ml-1">Vai alla gestione Roster</button>
          </div>
        `;
        return;
      }

      activePlayers.forEach(p => {
        const isSelected = p.id === appState.selectedPlayerId;
        const card = document.createElement('button');
        card.type = 'button';
        card.onclick = () => selectPlayer(p.id);
        card.className = `p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
          isSelected 
            ? 'bg-orange-600/30 border-orange-500 shadow-lg shadow-orange-950/50 ring-1 ring-orange-500' 
            : 'bg-[#0d1424] border-slate-800 hover:border-slate-700'
        }`;

        card.innerHTML = `
          <div class="flex justify-between items-center w-full">
            <span class="text-xs font-black px-1.5 py-0.5 rounded ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 font-mono'}">#${p.number}</span>
            <span class="text-[10px] font-bold text-slate-400 font-mono">${p.pts} pt</span>
          </div>
          <div class="mt-1.5">
            <div class="text-xs font-bold text-white truncate">${p.name}</div>
            <div class="text-[10px] text-slate-400 flex justify-between mt-0.5">
              <span>Falli: <b class="${p.fouls >= 4 ? 'text-rose-400' : 'text-slate-300'}">${p.fouls}</b></span>
              <span>Ast: ${p.ast}</span>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }

    function selectPlayer(id) {
      appState.selectedPlayerId = id;
      const match = getActiveMatch();
      if (!match) return;

      const player = match.players.find(p => p.id === id);
      if (!player) return;

      document.getElementById('activePlayerBadge').innerText = `#${player.number}`;
      document.getElementById('activePlayerName').innerText = `${player.name} (${player.role})`;
      document.getElementById('activePlayerStats').innerHTML = `
        <div>Punti <b class="text-white">${player.pts}</b></div>
        <div>Falli <b class="${player.fouls >= 4 ? 'text-rose-400' : 'text-white'}">${player.fouls}</b></div>
        <div>2PT <b class="text-white">${player.fg2m}/${player.fg2a}</b></div>
        <div>3PT <b class="text-white">${player.fg3m}/${player.fg3a}</b></div>
        <div>TL <b class="text-white">${player.ftm}/${player.fta}</b></div>
        <div>Rimb. Off <b class="text-white">${player.rebO}</b></div>
        <div>Rimb. Dif <b class="text-white">${player.rebD}</b></div>
        <div>Assist <b class="text-white">${player.ast}</b></div>
        <div>Recuperate <b class="text-white">${player.stl}</b></div>
        <div>Perse <b class="text-white">${player.tov}</b></div>
        <div>Stoppate <b class="text-white">${player.blk}</b></div>
      `;

      document.getElementById('stat2pt').innerText = `${player.fg2m}/${player.fg2a}`;
      document.getElementById('stat3pt').innerText = `${player.fg3m}/${player.fg3a}`;
      document.getElementById('statFt').innerText = `${player.ftm}/${player.fta}`;

      renderLiveRosterBar();
    }

    function recordStat(type) {
      const match = getActiveMatch();
      if (!match) return;

      if (match.isClosed) {
        alert("Questa partita è chiusa e terminata. Riaprila dalla scheda 'Partita' per registrare altre azioni.");
        return;
      }

      if (!appState.selectedPlayerId) {
        alert("Seleziona prima un giocatore dal roster convocati!");
        return;
      }

      const p = match.players.find(x => x.id === appState.selectedPlayerId);
      if (!p) return;

      const actionSnapshot = {
        playerId: p.id,
        playerName: p.name,
        playerNumber: p.number,
        type: type,
        time: new Date().toLocaleTimeString().slice(0, 5),
        quarter: match.quarter
      };

      let actionDesc = "";

      switch(type) {
        case '2pt_made':
          p.pts += 2; p.fg2m += 1; p.fg2a += 1;
          match.homeScore += 2;
          actionDesc = `+2 Segnato da #${p.number} ${p.name}`;
          break;
        case '2pt_miss':
          p.fg2a += 1;
          actionDesc = `2PT Errato di #${p.number} ${p.name}`;
          break;
        case '3pt_made':
          p.pts += 3; p.fg3m += 1; p.fg3a += 1;
          match.homeScore += 3;
          actionDesc = `+3 BOMBA di #${p.number} ${p.name}!`;
          break;
        case '3pt_miss':
          p.fg3a += 1;
          actionDesc = `3PT Errato di #${p.number} ${p.name}`;
          break;
        case 'ft_made':
          p.pts += 1; p.ftm += 1; p.fta += 1;
          match.homeScore += 1;
          actionDesc = `+1 Libero a bersaglio #${p.number} ${p.name}`;
          break;
        case 'ft_miss':
          p.fta += 1;
          actionDesc = `Libero Errato #${p.number} ${p.name}`;
          break;
        case 'reb_off':
          p.rebO += 1;
          actionDesc = `+1 Rimbalzo OFF #${p.number} ${p.name}`;
          break;
        case 'reb_def':
          p.rebD += 1;
          actionDesc = `+1 Rimbalzo DIF #${p.number} ${p.name}`;
          break;
        case 'assist':
          p.ast += 1;
          actionDesc = `+1 Assist di #${p.number} ${p.name}`;
          break;
        case 'stl':
          p.stl += 1;
          actionDesc = `+1 Recuperata da #${p.number} ${p.name}`;
          break;
        case 'tov':
          p.tov += 1;
          actionDesc = `+1 Palla Persa #${p.number} ${p.name}`;
          break;
        case 'blk':
          p.blk += 1;
          actionDesc = `+1 Stoppata di #${p.number} ${p.name}`;
          break;
        case 'foul':
          p.fouls += 1;
          actionDesc = `Fallo #${p.number} ${p.name} (${p.fouls}° fallo)`;
          if (p.fouls === 5) alert(`⚠️ ATTENZIONE: ${p.name} ha raggiunto 5 falli personali!`);
          break;
      }

      actionSnapshot.description = actionDesc;
      match.actionsHistory.push(actionSnapshot);

      updateActionsLogUI(actionDesc);
      saveLocalState();
      updateScoreboardUI();
      selectPlayer(p.id);
    }

    function undoLastAction() {
      const match = getActiveMatch();
      if (!match || match.actionsHistory.length === 0) {
        alert("Nessuna azione da annullare nella partita attiva.");
        return;
      }

      const last = match.actionsHistory.pop();
      const p = match.players.find(x => x.id === last.playerId);
      if (!p) return;

      switch(last.type) {
        case '2pt_made':
          p.pts -= 2; p.fg2m -= 1; p.fg2a -= 1;
          match.homeScore = Math.max(0, match.homeScore - 2);
          break;
        case '2pt_miss': p.fg2a -= 1; break;
        case '3pt_made':
          p.pts -= 3; p.fg3m -= 1; p.fg3a -= 1;
          match.homeScore = Math.max(0, match.homeScore - 3);
          break;
        case '3pt_miss': p.fg3a -= 1; break;
        case 'ft_made':
          p.pts -= 1; p.ftm -= 1; p.fta -= 1;
          match.homeScore = Math.max(0, match.homeScore - 1);
          break;
        case 'ft_miss': p.fta -= 1; break;
        case 'reb_off': p.rebO = Math.max(0, p.rebO - 1); break;
        case 'reb_def': p.rebD = Math.max(0, p.rebD - 1); break;
        case 'assist': p.ast = Math.max(0, p.ast - 1); break;
        case 'stl': p.stl = Math.max(0, p.stl - 1); break;
        case 'tov': p.tov = Math.max(0, p.tov - 1); break;
        case 'blk': p.blk = Math.max(0, p.blk - 1); break;
        case 'foul': p.fouls = Math.max(0, p.fouls - 1); break;
      }

      updateActionsLogUI(`↩️ Annullata azione: ${last.description}`);
      saveLocalState();
      updateScoreboardUI();
      if (appState.selectedPlayerId) selectPlayer(appState.selectedPlayerId);
      renderLiveRosterBar();
    }

    function updateActionsLogUI(text) {
      const container = document.getElementById('liveActionsLog');
      if (!container) return;
      container.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30 text-xs font-semibold mr-2">${new Date().toLocaleTimeString().slice(0, 5)}</span> <span>${text}</span>`;
    }

    function adjustHomeScore(delta) {
      const match = getActiveMatch();
      if (!match) return;
      match.homeScore = Math.max(0, match.homeScore + delta);
      updateScoreboardUI();
      saveLocalState();
    }

    function adjustAwayScore(delta) {
      const match = getActiveMatch();
      if (!match) return;
      match.awayScore = Math.max(0, match.awayScore + delta);
      updateScoreboardUI();
      saveLocalState();
    }

    function setQuarter(q) {
      const match = getActiveMatch();
      if (!match) return;
      match.quarter = q;
      ['1Q', '2Q', '3Q', '4Q', 'OT'].forEach(id => {
        const btn = document.getElementById(`btnQ-${id}`);
        if (!btn) return;
        if (id === q) {
          btn.className = "py-2 rounded-lg font-bold text-xs bg-orange-600 text-white shadow";
        } else {
          btn.className = "py-2 rounded-lg font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300";
        }
      });
      saveLocalState();
    }

    function updateScoreboardUI() {
      const match = getActiveMatch();
      if (!match) return;

      const sh = document.getElementById('scoreHome');
      const sa = document.getElementById('scoreAway');
      if (sh) sh.innerText = match.homeScore;
      if (sa) sa.innerText = match.awayScore;
      const homeName = match.homeTeam || "CASA";
      const awayName = match.awayTeam || "OSPITI";
      const lh = document.getElementById('labelTeamHome');
      const la = document.getElementById('labelTeamAway');
      if (lh) lh.innerText = homeName;
      if (la) la.innerText = awayName;

      const liveBar = document.getElementById('liveMatchInfoBar');
      if (liveBar) {
        liveBar.innerText = `${homeName} vs ${awayName} (${match.date || 'Data n.d.'})`;
      }

      setQuarter(match.quarter || '1Q');
    }
