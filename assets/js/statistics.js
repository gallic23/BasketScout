/* ==============================================================
       7. SEZIONE STATISTICHE CON FILTRI AVANZATI (PER PARTITA E DATA)
       ============================================================== */
    function populateStatsMatchDropdown() {
      const sel = document.getElementById('statsFilterMatch');
      if (!sel) return;
      const currentVal = appState.statsFilter.matchId || 'active';

      sel.innerHTML = `
        <option value="active">Partita Attiva</option>
        <option value="all">Tutte le Partite (${appState.matches.length})</option>
      `;

      appState.matches.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.innerText = `${m.homeTeam} vs ${m.awayTeam} (${m.date || 'Data n.d.'})`;
        sel.appendChild(opt);
      });

      sel.value = currentVal;
    }

    function setQuickDateFilter(type) {
      const startEl = document.getElementById('statsFilterDateStart');
      const endEl = document.getElementById('statsFilterDateEnd');
      const matchEl = document.getElementById('statsFilterMatch');
      const today = new Date();

      if (type === 'latest') {
        if (matchEl) matchEl.value = 'active';
        if (startEl) startEl.value = '';
        if (endEl) endEl.value = '';
      } else if (type === '30days') {
        const d30 = new Date();
        d30.setDate(today.getDate() - 30);
        if (startEl) startEl.value = d30.toISOString().slice(0, 10);
        if (endEl) endEl.value = today.toISOString().slice(0, 10);
        if (matchEl) matchEl.value = 'all';
      } else if (type === 'all') {
        if (startEl) startEl.value = '';
        if (endEl) endEl.value = '';
        if (matchEl) matchEl.value = 'all';
      }

      applyStatsFilters();
    }

    function applyStatsFilters() {
      const matchSelect = document.getElementById('statsFilterMatch');
      const dateStartInput = document.getElementById('statsFilterDateStart');
      const dateEndInput = document.getElementById('statsFilterDateEnd');

      const matchMode = matchSelect ? matchSelect.value : 'active';
      const startDate = dateStartInput ? dateStartInput.value : '';
      const endDate = dateEndInput ? dateEndInput.value : '';

      appState.statsFilter = { matchId: matchMode, dateStart: startDate, dateEnd: endDate };

      // Seleziona le partite che soddisfano i criteri
      let targetMatches = [];

      if (matchMode === 'active') {
        const act = getActiveMatch();
        if (act) targetMatches = [act];
      } else if (matchMode === 'all') {
        targetMatches = [...appState.matches];
      } else {
        const specific = appState.matches.find(m => m.id === matchMode);
        if (specific) targetMatches = [specific];
      }

      // Filtro data opzionale
      if (startDate) {
        targetMatches = targetMatches.filter(m => m.date && m.date >= startDate);
      }
      if (endDate) {
        targetMatches = targetMatches.filter(m => m.date && m.date <= endDate);
      }

      const statusLabel = document.getElementById('filterStatusLabel');
      if (statusLabel) {
        statusLabel.innerText = `Partite incluse nel calcolo: ${targetMatches.length}`;
      }

      renderAggregatedStats(targetMatches);
    }

    function renderAggregatedStats(matchesList) {
      const tbody = document.getElementById('statsTableBody');
      const tfoot = document.getElementById('statsTableFoot');
      if (!tbody || !tfoot) return;
      tbody.innerHTML = '';

      if (matchesList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" class="p-8 text-center text-slate-400">Nessuna partita corrisponde ai filtri di ricerca selezionati.</td></tr>`;
        tfoot.innerHTML = '';
        return;
      }

      // Aggrega le statistiche per giocatore dal masterRoster
      const aggregatedPlayers = appState.masterRoster.map(masterP => {
        let agg = {
          id: masterP.id,
          number: masterP.number,
          name: masterP.name,
          role: masterP.role,
          pts: 0, fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0,
          rebO: 0, rebD: 0, ast: 0, stl: 0, tov: 0, blk: 0, fouls: 0,
          gamesCount: 0
        };

        matchesList.forEach(m => {
          const matchPlayer = m.players.find(p => p.id === masterP.id);
          if (matchPlayer) {
            agg.pts += matchPlayer.pts || 0;
            agg.fg2m += matchPlayer.fg2m || 0;
            agg.fg2a += matchPlayer.fg2a || 0;
            agg.fg3m += matchPlayer.fg3m || 0;
            agg.fg3a += matchPlayer.fg3a || 0;
            agg.ftm += matchPlayer.ftm || 0;
            agg.fta += matchPlayer.fta || 0;
            agg.rebO += matchPlayer.rebO || 0;
            agg.rebD += matchPlayer.rebD || 0;
            agg.ast += matchPlayer.ast || 0;
            agg.stl += matchPlayer.stl || 0;
            agg.tov += matchPlayer.tov || 0;
            agg.blk += matchPlayer.blk || 0;
            agg.fouls += matchPlayer.fouls || 0;
            if (matchPlayer.pts > 0 || matchPlayer.fg2a > 0 || matchPlayer.fg3a > 0 || matchPlayer.fouls > 0 || matchPlayer.rebO > 0 || matchPlayer.rebD > 0 || matchPlayer.ast > 0) {
              agg.gamesCount++;
            }
          }
        });

        return agg;
      });

      let totals = {
        pts: 0, fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0,
        rebO: 0, rebD: 0, ast: 0, stl: 0, tov: 0, blk: 0, fouls: 0, val: 0
      };

      aggregatedPlayers.forEach(p => {
        const val = calculateEfficiency(p);
        totals.pts += p.pts;
        totals.fg2m += p.fg2m; totals.fg2a += p.fg2a;
        totals.fg3m += p.fg3m; totals.fg3a += p.fg3a;
        totals.ftm += p.ftm; totals.fta += p.fta;
        totals.rebO += p.rebO; totals.rebD += p.rebD;
        totals.ast += p.ast; totals.stl += p.stl;
        totals.tov += p.tov; totals.blk += p.blk;
        totals.fouls += p.fouls;
        totals.val += val;

        const perc2 = p.fg2a > 0 ? Math.round((p.fg2m / p.fg2a) * 100) + '%' : '-';
        const perc3 = p.fg3a > 0 ? Math.round((p.fg3m / p.fg3a) * 100) + '%' : '-';
        const percFt = p.fta > 0 ? Math.round((p.ftm / p.fta) * 100) + '%' : '-';

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/40 transition";
        tr.innerHTML = `
          <td class="p-3 text-left font-black text-orange-400">#${p.number}</td>
          <td class="p-3 text-left font-bold text-white">${p.name}</td>
          <td class="p-3 text-center font-black text-white bg-slate-900/40">${p.pts}</td>
          <td class="p-3 text-center text-slate-300">${p.fg2m}/${p.fg2a} <span class="text-[10px] text-slate-500">(${perc2})</span></td>
          <td class="p-3 text-center text-slate-300">${p.fg3m}/${p.fg3a} <span class="text-[10px] text-slate-500">(${perc3})</span></td>
          <td class="p-3 text-center text-slate-300">${p.ftm}/${p.fta} <span class="text-[10px] text-slate-500">(${percFt})</span></td>
          <td class="p-3 text-center text-slate-300">${p.rebO + p.rebD} <span class="text-[10px] text-slate-500">(${p.rebO}/${p.rebD})</span></td>
          <td class="p-3 text-center text-amber-300">${p.ast}</td>
          <td class="p-3 text-center text-emerald-300">${p.stl}</td>
          <td class="p-3 text-center text-rose-300">${p.tov}</td>
          <td class="p-3 text-center text-blue-300">${p.blk}</td>
          <td class="p-3 text-center font-bold ${p.fouls >= 4 ? 'text-rose-400' : 'text-slate-300'}">${p.fouls}</td>
          <td class="p-3 text-center font-black ${val >= 10 ? 'text-emerald-400' : (val < 0 ? 'text-rose-400' : 'text-orange-400')}">${val}</td>
        `;
        tbody.appendChild(tr);
      });

      const totPerc2 = totals.fg2a > 0 ? Math.round((totals.fg2m / totals.fg2a) * 100) + '%' : '-';
      const totPerc3 = totals.fg3a > 0 ? Math.round((totals.fg3m / totals.fg3a) * 100) + '%' : '-';
      const totPercFt = totals.fta > 0 ? Math.round((totals.ftm / totals.fta) * 100) + '%' : '-';

      tfoot.innerHTML = `
        <tr>
          <td class="p-3 text-left">TOT</td>
          <td class="p-3 text-left uppercase">Totale Squadra (${matchesList.length} Gare)</td>
          <td class="p-3 text-center text-orange-400 text-sm font-black">${totals.pts}</td>
          <td class="p-3 text-center">${totals.fg2m}/${totals.fg2a} (${totPerc2})</td>
          <td class="p-3 text-center">${totals.fg3m}/${totals.fg3a} (${totPerc3})</td>
          <td class="p-3 text-center">${totals.ftm}/${totals.fta} (${totPercFt})</td>
          <td class="p-3 text-center">${totals.rebO + totals.rebD} (${totals.rebO}/${totals.rebD})</td>
          <td class="p-3 text-center text-amber-400">${totals.ast}</td>
          <td class="p-3 text-center text-emerald-400">${totals.stl}</td>
          <td class="p-3 text-center text-rose-400">${totals.tov}</td>
          <td class="p-3 text-center text-blue-400">${totals.blk}</td>
          <td class="p-3 text-center">${totals.fouls}</td>
          <td class="p-3 text-center text-orange-400 text-sm">${totals.val}</td>
        </tr>
      `;
    }

    function calculateEfficiency(p) {
      const missedFg = (p.fg2a - p.fg2m) + (p.fg3a - p.fg3m);
      const missedFt = (p.fta - p.ftm);
      const positive = p.pts + (p.rebO + p.rebD) + p.ast + p.stl + p.blk;
      const negative = missedFg + missedFt + p.tov + p.fouls;
      return positive - negative;
    }

    function exportStatsCsv() {
      const match = getActiveMatch();
      let csv = "Numero;Nome;Ruolo;Punti;2PT_Segnati;2PT_Tentati;3PT_Segnati;3PT_Tentati;TL_Segnati;TL_Tentati;Rimb_Off;Rimb_Dif;Assist;Recuperate;Perse;Stoppate;Falli;Valutazione\n";
      
      const playersToExport = match ? match.players : appState.masterRoster.map(p => createEmptyPlayerStats(p));
      playersToExport.forEach(p => {
        const val = calculateEfficiency(p);
        csv += `${p.number};"${p.name}";"${p.role}";${p.pts};${p.fg2m};${p.fg2a};${p.fg3m};${p.fg3a};${p.ftm};${p.fta};${p.rebO};${p.rebD};${p.ast};${p.stl};${p.tov};${p.blk};${p.fouls};${val}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Referto_BasketScout_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
