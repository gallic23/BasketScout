/* ==============================================================
       8. GOOGLE IDENTITY SERVICES (GSI) & CLOUD SYNC DRIVE REST API
       ============================================================== */
    function initGoogleDriveIntegration() {
      const savedClientId = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CLIENT_ID) || '';
      const inputEl = document.getElementById('clientIdInput');
      if (inputEl) {
        inputEl.value = savedClientId;
        inputEl.addEventListener('change', (e) => {
          localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CLIENT_ID, e.target.value.trim());
          logSyncMessage(`Client ID aggiornato.`);
        });
      }

      const savedEmail = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_EMAIL);
      const savedToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);

      if (savedEmail && savedToken) {
        appState.cloud.accessToken = savedToken;
        appState.cloud.userEmail = savedEmail;
        updateDriveUIState(true, savedEmail);
      } else {
        updateDriveUIState(false, null);
      }
    }

    function requestGoogleAuth(selectAccountPrompt = false) {
      const clientId = document.getElementById('clientIdInput').value.trim();
      
      if (!clientId) {
        alert("Inserisci prima il tuo 'Google OAuth Client ID' nell'apposito campo della finestra.");
        document.getElementById('clientIdInput').focus();
        return;
      }

      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CLIENT_ID, clientId);

      if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
        alert("L'SDK Google Identity Services non è ancora caricato. Verifica la connessione a Internet.");
        return;
      }

      appState.cloud.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
        prompt: selectAccountPrompt ? 'select_account' : '',
        callback: async (response) => {
          if (response.error) {
            console.error("Errore OAuth:", response);
            logSyncMessage(`Errore autorizzazione: ${response.error}`);
            return;
          }

          appState.cloud.accessToken = response.access_token;
          localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.access_token);

          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { 'Authorization': `Bearer ${response.access_token}` }
            });
            if (userInfoRes.ok) {
              const userInfo = await userInfoRes.json();
              appState.cloud.userEmail = userInfo.email;
              localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_EMAIL, userInfo.email);
            } else {
              appState.cloud.userEmail = "Account Google Connesso";
            }
          } catch (e) {
            appState.cloud.userEmail = "Account Google Connesso";
          }

          updateDriveUIState(true, appState.cloud.userEmail);
          logSyncMessage(`Autenticazione riuscita: ${appState.cloud.userEmail}`);
          syncNowToDrive();
        }
      });

      appState.cloud.tokenClient.requestAccessToken();
    }

    function disconnectGoogleAccount() {
      if (appState.cloud.accessToken && typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        google.accounts.oauth2.revoke(appState.cloud.accessToken, () => {
          console.log("Token revocato.");
        });
      }

      appState.cloud.accessToken = null;
      appState.cloud.userEmail = null;
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_EMAIL);

      updateDriveUIState(false, null);
      logSyncMessage("Disconnessione completata. Token rimosso dal browser.");
    }

    function updateDriveUIState(isConnected, email) {
      const headerIconWrap = document.getElementById('driveHeaderIconWrap');
      const headerBadge = document.getElementById('driveHeaderBadge');
      const headerSub = document.getElementById('driveHeaderSub');

      const modalIconBox = document.getElementById('modalDriveIconBox');
      const modalBadge = document.getElementById('modalDriveStatusBadge');
      const accountDisplay = document.getElementById('accountDisplay');
      const btnSignIn = document.getElementById('btnGoogleSignIn');
      const btnChange = document.getElementById('btnChangeAccount');
      const btnDisconnect = document.getElementById('btnDisconnect');

      if (!headerIconWrap) return;

      if (isConnected && email) {
        headerIconWrap.className = 'w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm transition-colors border border-emerald-500/30';
        headerBadge.className = 'text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
        headerBadge.innerText = 'ATTIVO';
        headerSub.className = 'text-[10px] text-emerald-400 font-medium';
        headerSub.innerText = 'Sync Cloud Attivo';

        modalIconBox.className = 'w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl';
        modalBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
        modalBadge.innerText = 'CONNESSO';

        accountDisplay.innerText = email;
        accountDisplay.className = 'text-xs font-mono px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 font-semibold';

        btnSignIn.classList.add('hidden');
        btnChange.classList.remove('hidden');
        btnDisconnect.classList.remove('hidden');
      } else {
        headerIconWrap.className = 'w-7 h-7 rounded-lg bg-slate-700/80 text-slate-400 flex items-center justify-center text-sm transition-colors border border-slate-700';
        headerBadge.className = 'text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700';
        headerBadge.innerText = 'OFFLINE';
        headerSub.className = 'text-[10px] text-slate-400';
        headerSub.innerText = 'Non collegato';

        modalIconBox.className = 'w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-xl';
        modalBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700';
        modalBadge.innerText = 'NON CONNESSO';

        accountDisplay.innerText = 'Nessun account collegato';
        accountDisplay.className = 'text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700';

        btnSignIn.classList.remove('hidden');
        btnChange.classList.add('hidden');
        btnDisconnect.classList.add('hidden');
      }
    }

    async function syncNowToDrive() {
      if (!appState.cloud.accessToken) {
        alert("Autenticati con il tuo account Google prima di avviare la sincronizzazione.");
        return;
      }

      logSyncMessage("Avvio sincronizzazione su Google Drive...");

      const payload = {
        updatedAt: new Date().toISOString(),
        device: navigator.userAgent,
        appVersion: "1.5.0",
        state: {
          activeMatchId: appState.activeMatchId,
          matches: appState.matches,
          masterRoster: appState.masterRoster
        }
      };

      try {
        const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${APP_CONFIG.BACKUP_FILE_NAME}' and trashed=false&fields=files(id,name)`;
        const searchRes = await fetch(searchUrl, {
          headers: { 'Authorization': `Bearer ${appState.cloud.accessToken}` }
        });
        const searchData = await searchRes.json();

        let fileId = null;
        if (searchData.files && searchData.files.length > 0) {
          fileId = searchData.files[0].id;
        }

        const fileContent = JSON.stringify(payload, null, 2);

        if (fileId) {
          const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${appState.cloud.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: fileContent
          });

          if (updateRes.ok) {
            logSyncMessage(`File aggiornato con successo (${payload.state.matches.length} partite sincronizzate).`);
          } else {
            throw new Error(`Errore PATCH: ${updateRes.status}`);
          }
        } else {
          const metadata = { name: APP_CONFIG.BACKUP_FILE_NAME, mimeType: 'application/json' };
          const boundary = '-------314159265358979323846';
          const multipartRequestBody =
            `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
            JSON.stringify(metadata) +
            `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
            fileContent +
            `\r\n--${boundary}--`;

          const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${appState.cloud.accessToken}`,
              'Content-Type': `multipart/related; boundary=${boundary}`
            },
            body: multipartRequestBody
          });

          if (createRes.ok) {
            logSyncMessage("Nuovo file di backup creato su Drive.");
          } else {
            throw new Error(`Errore POST: ${createRes.status}`);
          }
        }

        const nowStr = new Date().toLocaleTimeString();
        document.getElementById('driveHeaderSub').innerText = `Sync: ${nowStr}`;

      } catch (err) {
        console.error("Errore sync Drive:", err);
        logSyncMessage(`Errore: ${err.message}`);
      }
    }

    async function restoreFromDrive() {
      if (!appState.cloud.accessToken) {
        alert("Autenticati con il tuo account Google prima di ripristinare i dati.");
        return;
      }

      logSyncMessage("Download ultimo backup da Google Drive...");

      try {
        const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${APP_CONFIG.BACKUP_FILE_NAME}' and trashed=false&fields=files(id,name,modifiedTime)`;
        const searchRes = await fetch(searchUrl, {
          headers: { 'Authorization': `Bearer ${appState.cloud.accessToken}` }
        });
        const searchData = await searchRes.json();

        if (!searchData.files || searchData.files.length === 0) {
          alert("Nessun backup trovato su questo account Google Drive.");
          logSyncMessage("Nessun backup trovato sul cloud.");
          return;
        }

        const fileId = searchData.files[0].id;
        const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { 'Authorization': `Bearer ${appState.cloud.accessToken}` }
        });

        if (!downloadRes.ok) throw new Error("Errore durante il download da Drive.");

        const backupData = await downloadRes.json();
        if (backupData && backupData.state) {
          if (backupData.state.matches && backupData.state.matches.length > 0) {
            appState.matches = backupData.state.matches;
            appState.activeMatchId = backupData.state.activeMatchId || appState.matches[0].id;
          }
          if (backupData.state.masterRoster) {
            appState.masterRoster = backupData.state.masterRoster;
          }

          saveLocalState();
          renderAll();

          logSyncMessage(`Dati ripristinati da Drive! Aggiornato al: ${new Date(backupData.updatedAt).toLocaleTimeString()}`);
          alert("Partite e statistiche ripristinate da Google Drive!");
        }
      } catch (err) {
        console.error("Errore ripristino:", err);
        logSyncMessage(`Errore ripristino: ${err.message}`);
      }
    }
