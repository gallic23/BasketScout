/* ==============================================================
       5. SEZIONE ROSTER
       ============================================================== */
    function renderRosterTable() {
      const tbody = document.getElementById('rosterTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (appState.masterRoster.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Nessun giocatore registrato. Clicca su "Nuovo Giocatore" per iniziare.</td></tr>`;
        return;
      }

      appState.masterRoster.sort((a, b) => a.number - b.number).forEach(p => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/40 transition";
        tr.innerHTML = `
          <td class="p-3.5 text-center">
            <input type="checkbox" ${p.active !== false ? 'checked' : ''} onchange="togglePlayerActive(${p.id})" class="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 bg-slate-900 border-slate-700 cursor-pointer">
          </td>
          <td class="p-3.5 text-center font-black font-mono text-orange-400">#${p.number}</td>
          <td class="p-3.5 font-bold text-white">${p.name}</td>
          <td class="p-3.5 text-slate-400">${p.role}</td>
          <td class="p-3.5 text-center">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.active !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}">
              ${p.active !== false ? 'Convocato' : 'Inattivo'}
            </span>
          </td>
          <td class="p-3.5 text-right space-x-1">
            <button onclick="editPlayer(${p.id})" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition" title="Modifica"><i class="fa-solid fa-pen"></i></button>
            <button onclick="deletePlayer(${p.id})" class="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900 text-rose-400 rounded text-xs transition" title="Elimina"><i class="fa-solid fa-trash"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function togglePlayerActive(id) {
      const p = appState.masterRoster.find(x => x.id === id);
      if (p) {
        p.active = !(p.active !== false);
        const match = getActiveMatch();
        if (match) {
          const matchP = match.players.find(x => x.id === id);
          if (matchP) matchP.active = p.active;
        }
        saveLocalState();
        renderLiveRosterBar();
        renderRosterTable();
      }
    }

    function openPlayerModal(editingId = null) {
      const modal = document.getElementById('playerModal');
      const title = document.getElementById('playerModalTitle');
      const inputId = document.getElementById('editPlayerId');
      const inputNum = document.getElementById('inputPlayerNum');
      const inputName = document.getElementById('inputPlayerName');
      const inputRole = document.getElementById('inputPlayerRole');

      if (editingId) {
        const p = appState.masterRoster.find(x => x.id === editingId);
        if (!p) return;
        inputId.value = p.id;
        inputNum.value = p.number;
        inputName.value = p.name;
        inputRole.value = p.role;
        title.innerHTML = `<i class="fa-solid fa-user-pen text-orange-400"></i> Modifica Giocatore`;
      } else {
        inputId.value = "";
        inputNum.value = "";
        inputName.value = "";
        inputRole.value = "---";
        title.innerHTML = `<i class="fa-solid fa-user-plus text-orange-400"></i> Nuovo Giocatore`;
      }
      modal.classList.remove('hidden');
    }

    function closePlayerModal() {
      document.getElementById('playerModal').classList.add('hidden');
    }

    function savePlayerFromModal() {
      const idVal = document.getElementById('editPlayerId').value;
      const num = parseInt(document.getElementById('inputPlayerNum').value);
      const name = document.getElementById('inputPlayerName').value.trim();
      const role = document.getElementById('inputPlayerRole').value;

      if (isNaN(num) || !name) {
        alert("Inserisci un numero e un nome valido!");
        return;
      }

      if (idVal) {
        const p = appState.masterRoster.find(x => x.id === parseInt(idVal));
        if (p) {
          p.number = num;
          p.name = name;
          p.role = role;
        }
      } else {
        const newId = Date.now();
        const newPlayer = {
          id: newId,
          number: num,
          name: name,
          role: role,
          active: true
        };
        appState.masterRoster.push(newPlayer);
      }

      syncMasterRosterToActiveMatch();
      closePlayerModal();
      saveLocalState();
      renderAll();
    }

    function editPlayer(id) {
      openPlayerModal(id);
    }

    function deletePlayer(id) {
      if (!confirm("Sei sicuro di voler rimuovere questo atleta dal roster?")) return;
      appState.masterRoster = appState.masterRoster.filter(p => p.id !== id);
      appState.matches.forEach(m => {
        m.players = m.players.filter(p => p.id !== id);
      });
      if (appState.selectedPlayerId === id) appState.selectedPlayerId = null;
      saveLocalState();
      renderAll();
    }
