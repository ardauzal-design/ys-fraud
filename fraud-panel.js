(function() {
    if (document.getElementById("ys-fraud-panel")) {
        alert("Fraud Takip Paneli zaten aktif!");
        return;
    }

    // AKTİF FIREBASE REALTIME DATABASE ADRESİNİZ (balcova-pano)
    var FIREBASE_URL = "https://balcova-pano-default-rtdb.europe-west1.firebasedatabase.app";

    // Sayfayı ve oturumu canlı tutma
    if (window.location.href.indexOf("yemeksepeti.com") !== -1) {
        setTimeout(function() { window.location.reload(); }, 5 * 60 * 1000);
        setInterval(function() {
            try { window.dispatchEvent(new Event('mousemove')); } catch(e) {}
        }, 30 * 1000);
    }

    var MAGAZA_LISTESI = [
        "Balçova (İzmir)",
        "Buca (İzmir)",
        "Çiğli (İzmir)",
        "Menteşe (Muğla)",
        "Kuşadası (Aydın)"
    ];

    function injectStyles() {
        if (document.getElementById("ys-f-style")) return;
        var style = document.createElement("style");
        style.id = "ys-f-style";
        style.innerHTML = `
            #ys-fraud-panel { position: fixed !important; bottom: 20px !important; right: 20px !important; width: 345px !important; background: #ffffff !important; border: 1.5px solid #e5e7eb !important; border-top: 4px solid #ea002a !important; border-radius: 16px !important; box-shadow: 0 14px 36px rgba(15, 23, 42, 0.18) !important; z-index: 2147483647 !important; font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; display: block !important; transition: opacity 0.2s ease, width 0.25s ease !important; overflow: hidden !important; opacity: 0.98 !important; }
            #ys-fraud-panel:hover { opacity: 1 !important; }
            #ys-fraud-panel.minimized { width: 255px !important; border-radius: 999px !important; border-top: 1.5px solid #ea002a !important; }
            #ys-fraud-panel.minimized #ys-f-body { display: none !important; }
            
            #ys-f-header { background: #ea002a !important; color: #ffffff !important; padding: 11px 16px !important; font-weight: 800 !important; font-size: 13px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; user-select: none !important; cursor: move !important; }
            .ys-f-header-title { display: flex !important; align-items: center !important; gap: 7px !important; }
            .ys-f-brand-mini { background: #ffffff !important; color: #ea002a !important; padding: 2px 6px !important; border-radius: 5px !important; font-size: 10px !important; font-weight: 900 !important; letter-spacing: -0.2px !important; }
            #ys-f-badge { background: #0f172a !important; color: #ffffff !important; padding: 3px 9px !important; border-radius: 999px !important; font-size: 10px !important; font-weight: 800 !important; }
            #ys-f-cloud-dot { width: 8px !important; height: 8px !important; border-radius: 50% !important; background: #22c55e !important; display: inline-block !important; box-shadow: 0 0 0 2px rgba(255,255,255,0.4) !important; }
            #ys-f-toggle-btn { background: rgba(255,255,255,0.22) !important; color: #fff !important; border: none !important; border-radius: 999px !important; width: 24px !important; height: 24px !important; font-size: 11px !important; font-weight: 900 !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; margin-left: 6px !important; transition: 0.15s !important; }
            #ys-f-toggle-btn:hover { background: rgba(255,255,255,0.38) !important; }
            
            #ys-f-tab-status { padding: 7px 12px !important; border-radius: 999px !important; font-size: 11px !important; font-weight: 800 !important; text-align: center !important; margin-bottom: 10px !important; }
            .ys-tab-active { background: #dcfce7 !important; color: #15803d !important; }
            .ys-tab-inactive { background: #fef3c7 !important; color: #b45309 !important; }
            
            #ys-f-body { padding: 14px !important; background: #ffffff !important; }
            .ys-f-btn-sub { background: #f3f4f6 !important; color: #111827 !important; border: 1px solid #e5e7eb !important; padding: 6px 10px !important; border-radius: 999px !important; font-size: 10px !important; font-weight: 700 !important; cursor: pointer !important; transition: 0.15s !important; }
            .ys-f-btn-sub:hover { background: #e5e7eb !important; }
            
            .ys-f-group { display: flex !important; gap: 6px !important; margin-bottom: 8px !important; }
            .ys-f-group input, .ys-f-group select { flex: 1 !important; padding: 8px 12px !important; border: 1.5px solid #e5e7eb !important; border-radius: 999px !important; font-size: 11px !important; outline: none !important; background: #f9fafb !important; color: #111827 !important; font-weight: 600 !important; transition: 0.15s !important; }
            .ys-f-group input:focus, .ys-f-group select:focus { border-color: #ea002a !important; background: #ffffff !important; }
            .ys-f-group button { background: #ea002a !important; color: #ffffff !important; border: none !important; padding: 8px 16px !important; border-radius: 999px !important; font-size: 11px !important; font-weight: 800 !important; cursor: pointer !important; transition: 0.15s !important; }
            .ys-f-group button:hover { background: #c80024 !important; }
            
            #ys-f-search-inp { width: 100% !important; padding: 7px 12px !important; border: 1px solid #e5e7eb !important; border-radius: 999px !important; font-size: 10px !important; margin-bottom: 8px !important; outline: none !important; background: #f9fafb !important; }
            #ys-f-search-inp:focus { border-color: #0f172a !important; background: #ffffff !important; }
            
            #ys-f-list { max-height: 125px !important; overflow-y: auto !important; background: #f9fafb !important; border: 1px solid #e5e7eb !important; border-radius: 12px !important; padding: 6px !important; }
            .ys-f-item { padding: 7px 10px !important; margin-bottom: 4px !important; background: #ffffff !important; border-radius: 8px !important; border: 1px solid #f3f4f6 !important; box-shadow: 0 1px 2px rgba(0,0,0,0.03) !important; }
            .ys-f-head { display: flex !important; justify-content: space-between !important; align-items: center !important; font-size: 11px !important; font-weight: 700 !important; color: #1f2937 !important; }
            .ys-f-del { color: #9ca3af !important; cursor: pointer !important; font-weight: 900 !important; padding: 2px 5px !important; border-radius: 4px !important; }
            .ys-f-del:hover { color: #ea002a !important; background: #fee2e2 !important; }
            
            .ys-f-settings-box { border-top: 1px solid #e5e7eb !important; padding-top: 10px !important; margin-top: 10px !important; }
            .ys-f-lbl { font-size: 10px !important; font-weight: 800 !important; color: #6b7280 !important; margin-bottom: 5px !important; letter-spacing: 0.3px !important; }
            
            .ys-f-alert-badge { background: #ea002a !important; color: #ffffff !important; padding: 3px 9px !important; border-radius: 999px !important; font-size: 10px !important; font-weight: 800 !important; margin-left: 6px !important; display: inline-block !important; }
            .ys-f-quick-add { background: #0f172a !important; color: #ffffff !important; border: none !important; padding: 3px 9px !important; border-radius: 999px !important; font-size: 9px !important; font-weight: 800 !important; cursor: pointer !important; margin-left: 6px !important; display: inline-block !important; vertical-align: middle !important; transition: 0.15s !important; }
            .ys-f-quick-add:hover { background: #ea002a !important; }
            
            #ys-copy-toast { position: fixed !important; top: 20px !important; left: 50% !important; transform: translateX(-50%) !important; background: #0f172a !important; color: #ffffff !important; padding: 10px 22px !important; border-radius: 999px !important; font-size: 12px !important; font-weight: 800 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.22) !important; z-index: 2147483647 !important; display: none !important; border: 1.5px solid #ea002a !important; }
            
            .ys-f-tools-btn { background: #f3f4f6 !important; border: 1px solid #e5e7eb !important; color: #1f2937 !important; padding: 6px 10px !important; border-radius: 999px !important; font-size: 10px !important; font-weight: 700 !important; cursor: pointer !important; flex: 1 !important; transition: 0.15s !important; }
            .ys-f-tools-btn:hover { background: #e5e7eb !important; }
            .ys-f-danger-btn { background: #fee2e2 !important; border: 1px solid #fecaca !important; color: #dc2626 !important; padding: 6px 10px !important; border-radius: 999px !important; font-size: 10px !important; font-weight: 800 !important; cursor: pointer !important; transition: 0.15s !important; }
            .ys-f-danger-btn:hover { background: #fecaca !important; }
            
            .ys-f-counter-pill { background: #fff1f2 !important; color: #ea002a !important; border: 1px solid #fecdd3 !important; padding: 6px 12px !important; border-radius: 999px !important; font-size: 11px !important; font-weight: 800 !important; text-align: center !important; margin-top: 6px !important; }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    var audioCtx = null;
    function acilDurumAlarmiCal() {
        try {
            if (localStorage.getItem("YS_SOUND_MUTED") === "true") return;
            var soundMode = localStorage.getItem("YS_SOUND_MODE") || "siren";

            if (!audioCtx) {
                var AudioCtxClass = window.AudioContext || window.webkitAudioContext;
                if (AudioCtxClass) audioCtx = new AudioCtxClass();
            }
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

            var now = audioCtx.currentTime;
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();

            if (soundMode === "bip") {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.setValueAtTime(1200, now + 0.1);
                osc.frequency.setValueAtTime(800, now + 0.2);
                gain.gain.setValueAtTime(0.8, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.5);
            } else {
                osc.type = 'sawtooth';
                for (var i = 0; i < 6; i++) {
                    var step = 3.0 / 6;
                    var t = now + (i * step);
                    osc.frequency.setValueAtTime(1000, t);
                    osc.frequency.exponentialRampToValueAtTime(2500, t + (step / 2));
                    osc.frequency.exponentialRampToValueAtTime(1000, t + step);
                }
                gain.gain.setValueAtTime(1.0, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 3.0);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 3.0);
            }
        } catch(e) {}
    }

    function toastGoster(mesaj) {
        try {
            var toast = document.getElementById("ys-copy-toast");
            if (!toast) {
                toast = document.createElement("div");
                toast.id = "ys-copy-toast";
                document.body.appendChild(toast);
            }
            toast.innerText = mesaj;
            toast.style.display = "block";
            setTimeout(function() { toast.style.display = "none"; }, 2200);
        } catch(e) {}
    }

    function getListe() {
        try {
            var s = localStorage.getItem("YS_PORTAL_FRAUD_LIST");
            if (s !== null) {
                var parsed = JSON.parse(s);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch(e) {}
        return [];
    }

    function setListe(l) {
        try {
            localStorage.setItem("YS_PORTAL_FRAUD_LIST", JSON.stringify(l));
            bulutaGonder(l);
        } catch(e) {}
    }

    function bulutaGonder(liste) {
        var dot = document.getElementById("ys-f-cloud-dot");
        if (dot) dot.style.background = "#f59e0b";

        fetch(FIREBASE_URL + "/ys_fraud_listesi.json", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(liste)
        }).then(function(res) {
            if (!res.ok) throw new Error();
            if (dot) dot.style.background = "#22c55e";
        }).catch(function() {
            if (dot) dot.style.background = "#ef4444";
            toastGoster("⚠️ Buluta yazılamadı! Firebase izinlerini kontrol edin.");
        });
    }

    function buluttanCek() {
        fetch(FIREBASE_URL + "/ys_fraud_listesi.json?t=" + Date.now())
            .then(function(res) {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(function(data) {
                var dot = document.getElementById("ys-f-cloud-dot");
                if (dot) dot.style.background = "#22c55e";
                var cloudList = Array.isArray(data) ? data : [];
                var localList = getListe();
                if (JSON.stringify(cloudList) !== JSON.stringify(localList)) {
                    localStorage.setItem("YS_PORTAL_FRAUD_LIST", JSON.stringify(cloudList));
                    var searchVal = document.getElementById("ys-f-search-inp") ? document.getElementById("ys-f-search-inp").value : "";
                    renderListe(searchVal);
                }
            }).catch(function() {
                var dot = document.getElementById("ys-f-cloud-dot");
                if (dot) dot.style.background = "#ef4444";
            });
    }

    function norm(str) {
        return str ? str.replace(/İ/g, "i").replace(/I/g, "ı").replace(/Ğ/g, "g").replace(/ğ/g, "g").replace(/Ü/g, "u").replace(/ü/g, "u").replace(/Ş/g, "s").replace(/ş/g, "s").replace(/Ö/g, "o").replace(/ö/g, "o").replace(/Ç/g, "c").replace(/ç/g, "c").toLowerCase().trim() : "";
    }

    function renderListe(filterText) {
        try {
            var list = getListe(), box = document.getElementById("ys-f-list"), badge = document.getElementById("ys-f-badge");
            if (!box) return;

            badge.innerText = list.length + " Kişi";
            box.innerHTML = "";

            var filter = filterText ? norm(filterText) : "";
            var filteredList = list.filter(function(name) {
                return filter === "" || norm(name).indexOf(filter) !== -1;
            });

            if (list.length === 0) {
                box.innerHTML = "<div style='text-align:center; padding:12px; color:#9ca3af; font-size:11px;'>Bulut listesinde kayıtlı kişi yok.</div>";
                return;
            }

            if (filteredList.length === 0) {
                box.innerHTML = "<div style='text-align:center; padding:12px; color:#9ca3af; font-size:11px;'>Eşleşen sonuç bulunamadı.</div>";
                return;
            }

            filteredList.forEach(function(name) {
                var originalIndex = list.indexOf(name);
                var item = document.createElement("div");
                item.className = "ys-f-item";
                item.innerHTML = "<div class='ys-f-head'><span>" + name + "</span><span class='ys-f-del' title='Buluttan Sil'>✕</span></div>";
                item.querySelector(".ys-f-del").onclick = function() {
                    var current = getListe();
                    current.splice(originalIndex, 1);
                    setListe(current);
                    renderListe(filterText);
                };
                box.appendChild(item);
            });
        } catch(e) {}
    }

    function makeDraggable(el, handle) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        handle.onmousedown = function(e) {
            if (e.target.id === "ys-f-toggle-btn") return;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = function() { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = function(ev) {
                ev.preventDefault();
                pos1 = pos3 - ev.clientX;
                pos2 = pos4 - ev.clientY;
                pos3 = ev.clientX;
                pos4 = ev.clientY;
                el.style.top = (el.offsetTop - pos2) + "px";
                el.style.left = (el.offsetLeft - pos1) + "px";
                el.style.bottom = "auto";
                el.style.right = "auto";
            };
        };
    }

    var bugunSayac = 0;
    function sayacGuncelle() {
        var el = document.getElementById("ys-f-count-lbl");
        if (el) el.innerText = "Bugün Yakalanan: " + bugunSayac + " Adet";
    }

    function devamEdiyorAktifMi() {
        var allEls = document.querySelectorAll('button, [role="tab"], a, div, span');
        for (var i = 0; i < allEls.length; i++) {
            var el = allEls[i];
            if (el.children.length === 0 && (el.textContent || "").trim() === "Devam ediyor") {
                var curr = el;
                for (var k = 0; k < 6 && curr && curr !== document.body; k++) {
                    var cls = (curr.className && typeof curr.className === "string") ? curr.className.toLowerCase() : "";
                    var style = window.getComputedStyle(curr);
                    var bg = style.backgroundColor;

                    if (curr.getAttribute("aria-selected") === "true" || cls.includes("active") || cls.includes("selected") || cls.includes("dark") || cls.includes("black")) {
                        return true;
                    }
                    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
                        var rgb = bg.match(/\d+/g);
                        if (rgb && parseInt(rgb[0]) < 130 && parseInt(rgb[1]) < 130 && parseInt(rgb[2]) < 130) {
                            return true;
                        }
                    }
                    curr = curr.parentElement;
                }
            }
        }

        var pageText = document.body.innerText || "";
        var digerSekmeAktifMi = false;
        ["İade için beklemede", "Onay bekleyen", "Tümü"].forEach(function(sekmeAdi) {
            allEls.forEach(function(el) {
                if (el.children.length === 0 && (el.textContent || "").trim() === sekmeAdi) {
                    var p = el.parentElement;
                    if (p && window.getComputedStyle(p).backgroundColor === "rgb(0, 0, 0)") digerSekmeAktifMi = true;
                }
            });
        });

        if (!digerSekmeAktifMi && pageText.includes("KALAN ZAMAN") && (pageText.includes("Atanmamış") || pageText.includes("Başladı") || pageText.includes("Beklemede"))) {
            return true;
        }

        return false;
    }

    function getMusteriSutunIndeksi() {
        var headers = document.querySelectorAll('th, div[role="columnheader"]');
        for (var i = 0; i < headers.length; i++) {
            var hTxt = norm(headers[i].innerText || headers[i].textContent || "");
            if (hTxt === "musteri" || hTxt.includes("musteri")) {
                return i;
            }
        }
        return 6;
    }

    function initFraudSystem() {
        try {
            injectStyles();
            var targetBody = document.body || document.documentElement;
            if (!targetBody || document.getElementById("ys-fraud-panel")) return;

            var savedDepo = localStorage.getItem("YS_USER_DEPO") || MAGAZA_LISTESI[0];
            var isMuted = localStorage.getItem("YS_SOUND_MUTED") === "true";
            var isMinimized = localStorage.getItem("YS_PANEL_MINIMIZED") === "true";
            var soundMode = localStorage.getItem("YS_SOUND_MODE") || "siren";

            var optionsHtml = MAGAZA_LISTESI.map(function(m) {
                var sel = (savedDepo === m) ? "selected" : "";
                return `<option value="${m}" ${sel}>Yemeksepeti Market, ${m}</option>`;
            }).join("");

            var panel = document.createElement("div");
            panel.id = "ys-fraud-panel";
            if (isMinimized) panel.classList.add("minimized");

            panel.innerHTML = `
                <div id="ys-f-header">
                    <div class="ys-f-header-title">
                        <span id="ys-f-cloud-dot" title="Balçova-Pano Bulut Aktif"></span>
                        <span class="ys-f-brand-mini">çarşı</span>
                        <span id="ys-f-title-txt">Fraud Takip</span>
                    </div>
                    <div style="display:flex; align-items:center;">
                        <span id="ys-f-badge">0 Kişi</span>
                        <button id="ys-f-toggle-btn" title="Küçült / Genişlet">${isMinimized ? '▲' : '—'}</button>
                    </div>
                </div>
                <div id="ys-f-body">
                    <div id="ys-f-tab-status" class="ys-tab-inactive">⏳ Sekme kontrol ediliyor...</div>
                    <div style="display:flex; gap:6px; margin-bottom:8px;">
                        <button class="ys-f-btn-sub" id="ys-f-test-sound" style="flex:1;">📢 Alarm Test</button>
                        <select id="ys-f-sound-mode" style="width:90px; font-size:10px; font-weight:700; border-radius:999px; border:1px solid #e5e7eb; padding:0 8px; outline:none; background:#f3f4f6;">
                            <option value="siren" ${soundMode === 'siren' ? 'selected' : ''}>🚨 Siren</option>
                            <option value="bip" ${soundMode === 'bip' ? 'selected' : ''}>🔔 Bip</option>
                        </select>
                        <button class="ys-f-btn-sub" id="ys-f-mute-btn" style="width:78px;">${isMuted ? '🔇 Sessiz' : '🔊 Açık'}</button>
                    </div>
                    <div class="ys-f-group">
                        <input type="text" id="ys-f-input" placeholder="Müşteri Adı Soyadı...">
                        <button id="ys-f-add">Ekle</button>
                    </div>
                    <input type="text" id="ys-f-search-inp" placeholder="🔍 Bulut Listesinde Kişi Ara...">
                    <div id="ys-f-list"></div>
                    <div style="display:flex; gap:6px; margin-top:8px;">
                        <button class="ys-f-tools-btn" id="ys-f-exp-btn">📥 İndir</button>
                        <button class="ys-f-tools-btn" id="ys-f-imp-btn">📤 Yükle</button>
                        <button class="ys-f-danger-btn" id="ys-f-clear-btn">🗑️ Temizle</button>
                        <input type="file" id="ys-f-file-inp" accept=".json" style="display:none;">
                    </div>
                    <div class="ys-f-settings-box">
                        <div class="ys-f-lbl">🏢 AKTİF MAĞAZA</div>
                        <div class="ys-f-group">
                            <select id="ys-f-depo-select">${optionsHtml}</select>
                        </div>
                        <div class="ys-f-counter-pill" id="ys-f-count-lbl">Bugün Yakalanan: 0 Adet</div>
                    </div>
                </div>`;
            targetBody.appendChild(panel);

            makeDraggable(panel, document.getElementById("ys-f-header"));

            document.getElementById("ys-f-toggle-btn").onclick = function(e) {
                e.stopPropagation();
                var p = document.getElementById("ys-fraud-panel");
                var min = p.classList.toggle("minimized");
                localStorage.setItem("YS_PANEL_MINIMIZED", min.toString());
                this.innerText = min ? "▲" : "—";
            };

            document.getElementById("ys-f-sound-mode").onchange = function() {
                localStorage.setItem("YS_SOUND_MODE", this.value);
            };

            document.getElementById("ys-f-search-inp").oninput = function() {
                renderListe(this.value);
            };

            document.getElementById("ys-f-test-sound").onclick = acilDurumAlarmiCal;

            document.getElementById("ys-f-mute-btn").onclick = function() {
                var currentMute = localStorage.getItem("YS_SOUND_MUTED") === "true";
                localStorage.setItem("YS_SOUND_MUTED", (!currentMute).toString());
                this.innerText = (!currentMute) ? '🔇 Sessiz' : '🔊 Açık';
            };

            document.getElementById("ys-f-add").onclick = function() {
                var inp = document.getElementById("ys-f-input");
                var val = inp.value.trim();
                if (val) {
                    var list = getListe();
                    if (!list.includes(val)) { list.unshift(val); setListe(list); }
                    inp.value = "";
                    renderListe();
                    toastGoster("☁️ Buluta eklendi: " + val);
                }
            };

            document.getElementById("ys-f-exp-btn").onclick = function() {
                var blob = new Blob([JSON.stringify(getListe(), null, 2)], { type: 'application/json' });
                var a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "Fraud_Bulut_Yedek.json";
                a.click();
            };

            document.getElementById("ys-f-imp-btn").onclick = function() {
                document.getElementById("ys-f-file-inp").click();
            };

            document.getElementById("ys-f-clear-btn").onclick = function() {
                if (confirm("⚠️ Tüm mağazaların ortak kullandığı bulut listesi silinecek. Emin misiniz?")) {
                    setListe([]);
                    renderListe();
                    toastGoster("🗑️ Bulut listesi temizlendi");
                }
            };

            document.getElementById("ys-f-file-inp").onchange = function(e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(evt) {
                    try {
                        var importedList = JSON.parse(evt.target.result);
                        if (Array.isArray(importedList)) {
                            setListe(importedList);
                            renderListe();
                            toastGoster("☁️ Liste buluta aktarıldı!");
                        }
                    } catch(err) { alert("❌ Geçersiz JSON dosyası!"); }
                };
                reader.readAsText(file);
            };

            document.getElementById("ys-f-depo-select").onchange = function() {
                localStorage.setItem("YS_USER_DEPO", this.value);
            };

            renderListe();
            sayacGuncelle();
            buluttanCek();
        } catch(e) {}
    }

    setInterval(buluttanCek, 5000);

    var tespitEdilenler = new Set();

    setInterval(function() {
        initFraudSystem();
        try {
            var aktifMi = devamEdiyorAktifMi();
            var statusEl = document.getElementById("ys-f-tab-status");
            var titleEl = document.getElementById("ys-f-title-txt");

            if (statusEl) {
                if (aktifMi) {
                    statusEl.className = "ys-tab-active";
                    statusEl.innerText = "🟢 Devam Ediyor Açık (Tarama Aktif)";
                    if (titleEl) titleEl.innerText = "Fraud Takip [AKTİF]";
                } else {
                    statusEl.className = "ys-tab-inactive";
                    statusEl.innerText = "⏸️ Beklemede ('Devam ediyor' sekmesine geçin)";
                    if (titleEl) titleEl.innerText = "Fraud Takip [PASİF]";
                }
            }

            if (!aktifMi) return;

            var TAKIP_LISTESI = getListe();
            var musteriColIdx = getMusteriSutunIndeksi();
            var rows = document.querySelectorAll('tbody tr, div[role="row"]');

            rows.forEach(function(rowEl) {
                var cells = rowEl.querySelectorAll('td, div[role="gridcell"]');
                if (!cells || cells.length <= musteriColIdx) return;

                var siparisCell = cells[0];
                var siparisMatch = (siparisCell.innerText || "").match(/[a-z0-9]{3,6}-[0-9]{3,6}-[a-z0-9]{3,6}/i);
                if (!siparisMatch) return;
                var orderKey = siparisMatch[0].trim();

                if (!siparisCell.getAttribute("data-copy-bound")) {
                    siparisCell.setAttribute("data-copy-bound", "true");
                    siparisCell.style.cursor = "pointer";
                    siparisCell.title = "Tıkla ve Sipariş ID'sini Kopyala";
                    siparisCell.onclick = function(e) {
                        e.stopPropagation();
                        navigator.clipboard.writeText(orderKey);
                        toastGoster("📋 Sipariş ID Kopyalandı: " + orderKey);
                    };
                }

                var musteriCell = cells[musteriColIdx];
                if (!musteriCell) return;

                var cloneCell = musteriCell.cloneNode(true);
                var existingBtns = cloneCell.querySelectorAll("button, span.ys-f-alert-badge");
                existingBtns.forEach(function(b) { b.remove(); });
                var rawName = (cloneCell.innerText || cloneCell.textContent || "").trim();

                if (!rawName || rawName.length < 2) return;

                if (!musteriCell.querySelector(".ys-f-quick-add")) {
                    var qBtn = document.createElement("button");
                    qBtn.className = "ys-f-quick-add";
                    qBtn.innerText = "➕ Frauda Ekle";
                    qBtn.onclick = function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        var list = getListe();
                        if (!list.includes(rawName)) {
                            list.unshift(rawName);
                            setListe(list);
                            renderListe();
                            toastGoster("☁️ " + rawName + " buluta eklendi!");
                        } else {
                            toastGoster("⚠️ " + rawName + " zaten bulutta var!");
                        }
                    };
                    musteriCell.appendChild(qBtn);
                }

                var musteriNorm = norm(rawName);
                var isFraudMatch = TAKIP_LISTESI.some(function(isim) {
                    var isimNorm = norm(isim);
                    return isimNorm.length > 2 && musteriNorm.indexOf(isimNorm) !== -1;
                });

                if (isFraudMatch) {
                    rowEl.style.setProperty("background-color", "#ffe4e6", "important");
                    rowEl.style.setProperty("border-left", "4px solid #ea002a", "important");

                    if (!musteriCell.querySelector(".ys-f-alert-badge")) {
                        var badge = document.createElement("span");
                        badge.className = "ys-f-alert-badge";
                        badge.innerText = "🚨 FRAUD";
                        musteriCell.appendChild(badge);
                    }

                    if (!tespitEdilenler.has(orderKey)) {
                        tespitEdilenler.add(orderKey);
                        bugunSayac++;
                        sayacGuncelle();
                        acilDurumAlarmiCal();
                        toastGoster("🚨 DİKKAT! Fraud Müşteri (" + rawName + "): " + orderKey);
                    }
                }
            });
        } catch(e) {}
    }, 1000);
})();
