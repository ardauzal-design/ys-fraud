(function() {
    if (document.getElementById("ys-fraud-panel")) {
        alert("Fraud Takip Paneli zaten aktif!");
        return;
    }

    // ==========================================
    // YÖNETİCİ (ADMIN) ŞİFRESİ, FORM VE BULUT AYARLARI
    // ==========================================
    var ADMIN_SIFRE = "1453";
    var FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdpY8CIHk4aNL6TxRPR3qFCOpNJh02HWvw4Rz2CmWyaYvLTXw/viewform";
    var FIREBASE_URL = "https://balcova-pano-default-rtdb.europe-west1.firebasedatabase.app";
    var sonIslemZamani = 0;

    // Oturumu ve sayfayı canlı tutma
    if (window.location.href.indexOf("yemeksepeti.com") !== -1) {
        setTimeout(function() { window.location.reload(); }, 5 * 60 * 1000);
        setInterval(function() {
            try { window.dispatchEvent(new Event('mousemove')); } catch(e) {}
        }, 30 * 1000);
    }

    var VARSAYILAN_MAGAZALAR = [
        "Balçova (İzmir)",
        "Buca (İzmir)",
        "Çiğli (İzmir)",
        "Menteşe (Muğla)",
        "Kuşadası (Aydın)"
    ];

    function adminDogrula() {
        var girilen = prompt("🔒 Yönetici (Admin) Şifresini Girin:");
        if (girilen === null) return false;
        if (girilen.trim() === ADMIN_SIFRE) return true;
        alert("❌ Hatalı Admin Şifresi! İşlem iptal edildi.");
        return false;
    }

    function injectStyles() {
        if (document.getElementById("ys-f-style")) return;
        var style = document.createElement("style");
        style.id = "ys-f-style";
        style.innerHTML = `
            #ys-fraud-panel { position: fixed !important; bottom: 20px !important; right: 20px !important; width: 365px !important; background: rgba(255, 255, 255, 0.98) !important; backdrop-filter: blur(12px) !important; border: 1px solid rgba(226, 232, 240, 0.95) !important; border-radius: 18px !important; box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.04) !important; z-index: 2147483647 !important; font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; display: block !important; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important; overflow: hidden !important; }
            #ys-fraud-panel.minimized { width: 265px !important; border-radius: 999px !important; }
            #ys-fraud-panel.minimized #ys-f-body { display: none !important; }
            
            #ys-f-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; color: #ffffff !important; padding: 12px 16px !important; font-weight: 700 !important; font-size: 13px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; user-select: none !important; cursor: move !important; border-bottom: 2px solid #ea002a !important; }
            .ys-f-header-title { display: flex !important; align-items: center !important; gap: 8px !important; }
            .ys-f-brand-mini { background: #ea002a !important; color: #ffffff !important; padding: 2px 7px !important; border-radius: 6px !important; font-size: 10px !important; font-weight: 900 !important; letter-spacing: 0.3px !important; text-transform: uppercase !important; }
            #ys-f-badge { background: rgba(255,255,255,0.14) !important; color: #f8fafc !important; padding: 3px 9px !important; border-radius: 999px !important; font-size: 10px !important; font-weight: 700 !important; border: 1px solid rgba(255,255,255,0.15) !important; }
            #ys-f-cloud-dot { width: 8px !important; height: 8px !important; border-radius: 50% !important; background: #10b981 !important; display: inline-block !important; box-shadow: 0 0 8px #10b981 !important; }
            #ys-f-toggle-btn { background: rgba(255,255,255,0.12) !important; color: #fff !important; border: none !important; border-radius: 999px !important; width: 24px !important; height: 24px !important; font-size: 11px !important; font-weight: 800 !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; margin-left: 6px !important; transition: 0.15s !important; }
            #ys-f-toggle-btn:hover { background: #ea002a !important; }
            
            #ys-f-tab-status { padding: 7px 12px !important; border-radius: 10px !important; font-size: 11px !important; font-weight: 700 !important; text-align: center !important; margin-bottom: 10px !important; letter-spacing: -0.1px !important; }
            .ys-tab-active { background: #ecfdf5 !important; color: #047857 !important; border: 1px solid #a7f3d0 !important; }
            .ys-tab-inactive { background: #fffbeb !important; color: #b45309 !important; border: 1px solid #fde68a !important; }
            
            #ys-f-body { padding: 14px !important; background: transparent !important; }
            .ys-f-btn-sub { background: #f8fafc !important; color: #334155 !important; border: 1px solid #e2e8f0 !important; padding: 6px 10px !important; border-radius: 10px !important; font-size: 10px !important; font-weight: 700 !important; cursor: pointer !important; transition: 0.15s !important; }
            .ys-f-btn-sub:hover { background: #f1f5f9 !important; border-color: #cbd5e1 !important; }
            
            .ys-f-group { display: flex !important; gap: 6px !important; margin-bottom: 8px !important; }
            .ys-f-group input, .ys-f-group select { flex: 1 !important; padding: 8px 12px !important; border: 1.5px solid #e2e8f0 !important; border-radius: 10px !important; font-size: 11px !important; outline: none !important; background: #f8fafc !important; color: #0f172a !important; font-weight: 600 !important; transition: 0.15s !important; }
            .ys-f-group input:focus, .ys-f-group select:focus { border-color: #ea002a !important; background: #ffffff !important; box-shadow: 0 0 0 3px rgba(234, 0, 42, 0.08) !important; }
            .ys-f-group button { background: #ea002a !important; color: #ffffff !important; border: none !important; padding: 8px 15px !important; border-radius: 10px !important; font-size: 11px !important; font-weight: 700 !important; cursor: pointer !important; transition: 0.15s !important; white-space: nowrap !important; }
            .ys-f-group button:hover { background: #c80024 !important; }
            
            .ys-f-filter-bar { display: flex !important; gap: 5px !important; margin-bottom: 8px !important; align-items: center !important; }
            #ys-f-search-inp { flex: 1 !important; padding: 7px 11px !important; border: 1px solid #e2e8f0 !important; border-radius: 10px !important; font-size: 10px !important; outline: none !important; background: #f8fafc !important; color: #0f172a !important; }
            #ys-f-search-inp:focus { border-color: #0f172a !important; background: #ffffff !important; }
            
            .ys-f-scope-btn { background: #f1f5f9 !important; border: 1px solid #e2e8f0 !important; color: #475569 !important; padding: 6px 9px !important; border-radius: 9px !important; font-size: 9px !important; font-weight: 800 !important; cursor: pointer !important; white-space: nowrap !important; transition: 0.15s !important; }
            .ys-f-scope-btn.active { background: #0f172a !important; color: #ffffff !important; border-color: #0f172a !important; }
            
            #ys-f-list { max-height: 120px !important; overflow-y: auto !important; background: #f8fafc !important; border: 1px solid #e2e8f0 !important; border-radius: 12px !important; padding: 6px !important; }
            .ys-f-item { padding: 7px 10px !important; margin-bottom: 5px !important; background: #ffffff !important; border-radius: 9px !important; border: 1px solid #f1f5f9 !important; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03) !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
            .ys-f-item:last-child { margin-bottom: 0 !important; }
            .ys-f-item-info { display: flex !important; flex-direction: column !important; gap: 2px !important; }
            .ys-f-item-name { font-size: 11px !important; font-weight: 700 !important; color: #0f172a !important; }
            .ys-f-store-tag { font-size: 9px !important; font-weight: 700 !important; color: #64748b !important; background: #f1f5f9 !important; padding: 1px 6px !important; border-radius: 5px !important; display: inline-block !important; width: fit-content !important; }
            .ys-f-store-tag.own { background: #fee2e2 !important; color: #b91c1c !important; }
            
            .ys-f-del { color: #94a3b8 !important; cursor: pointer !important; font-weight: 800 !important; padding: 3px 7px !important; border-radius: 6px !important; font-size: 10px !important; transition: 0.15s !important; }
            .ys-f-del:hover { color: #ea002a !important; background: #fee2e2 !important; }
            
            .ys-f-settings-box { border-top: 1px solid #e2e8f0 !important; padding-top: 10px !important; margin-top: 10px !important; }
            .ys-f-lbl { font-size: 10px !important; font-weight: 800 !important; color: #475569 !important; margin-bottom: 5px !important; letter-spacing: 0.3px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
            
            .ys-f-alert-badge { background: linear-gradient(135deg, #ea002a 0%, #b91c1c 100%) !important; color: #ffffff !important; padding: 3px 9px !important; border-radius: 999px !important; font-size: 10px !important; font-weight: 800 !important; margin-left: 6px !important; display: inline-block !important; box-shadow: 0 2px 6px rgba(234, 0, 42, 0.3) !important; }
            .ys-f-quick-add { background: #0f172a !important; color: #ffffff !important; border: none !important; padding: 3px 9px !important; border-radius: 999px !important; font-size: 9px !important; font-weight: 700 !important; cursor: pointer !important; margin-left: 6px !important; display: inline-block !important; vertical-align: middle !important; transition: 0.15s !important; }
            .ys-f-quick-add:hover { background: #ea002a !important; }
            
            #ys-copy-toast { position: fixed !important; top: 20px !important; left: 50% !important; transform: translateX(-50%) !important; background: #0f172a !important; color: #ffffff !important; padding: 11px 24px !important; border-radius: 12px !important; font-size: 12px !important; font-weight: 700 !important; box-shadow: 0 15px 30px rgba(0,0,0,0.28) !important; z-index: 2147483647 !important; display: none !important; border-left: 4px solid #ea002a !important; }
            
            .ys-f-tools-btn { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; color: #334155 !important; padding: 6px 10px !important; border-radius: 9px !important; font-size: 10px !important; font-weight: 700 !important; cursor: pointer !important; flex: 1 !important; transition: 0.15s !important; }
            .ys-f-tools-btn:hover { background: #f1f5f9 !important; }
            .ys-f-danger-btn { background: #fef2f2 !important; border: 1px solid #fecaca !important; color: #dc2626 !important; padding: 6px 10px !important; border-radius: 9px !important; font-size: 10px !important; font-weight: 700 !important; cursor: pointer !important; transition: 0.15s !important; }
            .ys-f-danger-btn:hover { background: #fee2e2 !important; }
            
            .ys-f-form-btn { display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; width: 100% !important; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important; color: #ffffff !important; border: none !important; padding: 8px 12px !important; border-radius: 10px !important; font-size: 11px !important; font-weight: 700 !important; cursor: pointer !important; text-decoration: none !important; margin-top: 6px !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.22) !important; transition: 0.15s !important; box-sizing: border-box !important; }
            .ys-f-form-btn:hover { background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important; transform: translateY(-1px) !important; }

            .ys-f-counter-pill { background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%) !important; color: #be123c !important; border: 1px solid #fecdd3 !important; padding: 7px 12px !important; border-radius: 10px !important; font-size: 11px !important; font-weight: 800 !important; text-align: center !important; margin-top: 6px !important; }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function sesliUyariKonus() {
        try {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            var msg = new SpeechSynthesisUtterance("Dikkat! Fraud kullanıcı.");
            msg.lang = "tr-TR";
            msg.volume = 1.0;
            msg.rate = 0.95;
            msg.pitch = 1.05;
            window.speechSynthesis.speak(msg);
        } catch(e) {}
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
            var alarmSuresiMs = 1500;

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
                alarmSuresiMs = 600;
            } else {
                osc.type = 'sawtooth';
                for (var i = 0; i < 4; i++) {
                    var step = 1.6 / 4;
                    var t = now + (i * step);
                    osc.frequency.setValueAtTime(1000, t);
                    osc.frequency.exponentialRampToValueAtTime(2500, t + (step / 2));
                    osc.frequency.exponentialRampToValueAtTime(1000, t + step);
                }
                gain.gain.setValueAtTime(1.0, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1.6);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 1.6);
                alarmSuresiMs = 1650;
            }

            setTimeout(function() {
                sesliUyariKonus();
            }, alarmSuresiMs);

        } catch(e) {
            sesliUyariKonus();
        }
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
            setTimeout(function() { toast.style.display = "none"; }, 2600);
        } catch(e) {}
    }

    function normalizeKayitlar(rawArr) {
        if (!Array.isArray(rawArr)) return [];
        return rawArr.map(function(item) {
            if (typeof item === "string") {
                return { name: item, store: "Ortak Havuz" };
            }
            if (item && typeof item === "object" && item.name) {
                return { name: item.name, store: item.store || "Ortak Havuz" };
            }
            return null;
        }).filter(Boolean);
    }

    function getAktifMagaza() {
        var magazalar = getMagazalar();
        return localStorage.getItem("YS_USER_DEPO") || magazalar[0];
    }

    function getListe() {
        try {
            var s = localStorage.getItem("YS_PORTAL_FRAUD_LIST");
            if (s !== null) {
                return normalizeKayitlar(JSON.parse(s));
            }
        } catch(e) {}
        return [];
    }

    function setListe(l) {
        try {
            sonIslemZamani = Date.now();
            var temizListe = normalizeKayitlar(l);
            localStorage.setItem("YS_PORTAL_FRAUD_LIST", JSON.stringify(temizListe));
            bulutaGonder(temizListe);
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
            if (dot) dot.style.background = "#10b981";
        }).catch(function() {
            if (dot) dot.style.background = "#ef4444";
            toastGoster("⚠️ Buluta yazılamadı!");
        });
    }

    function getMagazalar() {
        try {
            var s = localStorage.getItem("YS_PORTAL_MAGAZALAR");
            if (s !== null) {
                var parsed = JSON.parse(s);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch(e) {}
        return VARSAYILAN_MAGAZALAR.slice();
    }

    function setMagazalar(mList) {
        try {
            sonIslemZamani = Date.now();
            localStorage.setItem("YS_PORTAL_MAGAZALAR", JSON.stringify(mList));
            fetch(FIREBASE_URL + "/ys_magaza_listesi.json", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(mList)
            });
        } catch(e) {}
    }

    function magazaSelectGuncelle() {
        var selEl = document.getElementById("ys-f-depo-select");
        if (!selEl) return;
        var magazalar = getMagazalar();
        var savedDepo = localStorage.getItem("YS_USER_DEPO") || magazalar[0];
        selEl.innerHTML = magazalar.map(function(m) {
            var sel = (savedDepo === m) ? "selected" : "";
            return `<option value="${m}" ${sel}>Yemeksepeti Market, ${m}</option>`;
        }).join("");
    }

    function buluttanCek() {
        if (Date.now() - sonIslemZamani < 7000) return;

        fetch(FIREBASE_URL + "/ys_fraud_listesi.json?t=" + Date.now())
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (Date.now() - sonIslemZamani < 7000) return;
                var dot = document.getElementById("ys-f-cloud-dot");
                if (dot) dot.style.background = "#10b981";
                var cloudList = normalizeKayitlar(data);
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

        fetch(FIREBASE_URL + "/ys_magaza_listesi.json?t=" + Date.now())
            .then(function(res) { return res.json(); })
            .then(function(mData) {
                if (Array.isArray(mData) && mData.length > 0) {
                    var localM = getMagazalar();
                    if (JSON.stringify(mData) !== JSON.stringify(localM)) {
                        localStorage.setItem("YS_PORTAL_MAGAZALAR", JSON.stringify(mData));
                        magazaSelectGuncelle();
                    }
                }
            }).catch(function() {});
    }

    function norm(str) {
        return str ? str.replace(/İ/g, "i").replace(/I/g, "ı").replace(/Ğ/g, "g").replace(/ğ/g, "g").replace(/Ü/g, "u").replace(/ü/g, "u").replace(/Ş/g, "s").replace(/ş/g, "s").replace(/Ö/g, "o").replace(/ö/g, "o").replace(/Ç/g, "c").replace(/ç/g, "c").toLowerCase().trim() : "";
    }

    var listeGorunumKapsami = "store";
    var tespitEdilenler = new Set();

    function renderListe(filterText) {
        try {
            var fullList = getListe();
            var aktifMagaza = getAktifMagaza();
            var box = document.getElementById("ys-f-list");
            var badge = document.getElementById("ys-f-badge");
            if (!box) return;

            var magazaKayitlari = fullList.filter(function(item) {
                return norm(item.store) === norm(aktifMagaza);
            });

            badge.innerText = magazaKayitlari.length + " / " + fullList.length + " Kişi";
            box.innerHTML = "";

            var kaynakListe = (listeGorunumKapsami === "store") ? magazaKayitlari : fullList;
            var filter = filterText ? norm(filterText) : "";
            var filteredList = kaynakListe.filter(function(item) {
                return filter === "" || norm(item.name).indexOf(filter) !== -1 || norm(item.store).indexOf(filter) !== -1;
            });

            if (kaynakListe.length === 0) {
                var bosMesaj = (listeGorunumKapsami === "store")
                    ? aktifMagaza + " mağazasına ait kayıt yok.<br><span style='font-size:9px; color:#64748b;'>(Diğer mağazalardaki " + fullList.length + " kayıt arka planda taranıyor)</span>"
                    : "Bulut havuzunda kayıtlı kişi yok.";
                box.innerHTML = "<div style='text-align:center; padding:14px 8px; color:#94a3b8; font-size:11px; line-height:1.4;'>" + bosMesaj + "</div>";
                return;
            }

            if (filteredList.length === 0) {
                box.innerHTML = "<div style='text-align:center; padding:12px; color:#94a3b8; font-size:11px;'>Eşleşen sonuç bulunamadı.</div>";
                return;
            }

            filteredList.forEach(function(itemObj) {
                var isOwnStore = norm(itemObj.store) === norm(aktifMagaza);
                var item = document.createElement("div");
                item.className = "ys-f-item";
                item.innerHTML = `
                    <div class='ys-f-item-info'>
                        <span class='ys-f-item-name'>${itemObj.name}</span>
                        <span class='ys-f-store-tag ${isOwnStore ? "own" : ""}'>📍 ${itemObj.store}</span>
                    </div>
                    <span class='ys-f-del' title='Admin Şifresi ile Tüm Havuzdan Sil'>🔒 ✕</span>
                `;
                item.querySelector(".ys-f-del").onclick = function() {
                    if (!adminDogrula()) return;
                    var silinecekNorm = norm(itemObj.name);
                    var current = getListe();
                    // Bu ismin tüm mağazalardaki tüm eşleşen kayıtlarını tamamen sil
                    var guncelListe = current.filter(function(x) {
                        var kayitNorm = norm(x.name);
                        return kayitNorm !== silinecekNorm && kayitNorm.indexOf(silinecekNorm) === -1 && silinecekNorm.indexOf(kayitNorm) === -1;
                    });
                    setListe(guncelListe);
                    renderListe(filterText);
                    toastGoster("🗑️ Admin onayı ile tamamen silindi: " + itemObj.name);
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

    function musteriKayitEkle(musteriAdi) {
        var aktifMagaza = getAktifMagaza();
        var list = getListe();
        var zatenBuMagazadaVar = list.some(function(x) {
            return norm(x.name) === norm(musteriAdi) && norm(x.store) === norm(aktifMagaza);
        });
        if (!zatenBuMagazadaVar) {
            list.unshift({ name: musteriAdi, store: aktifMagaza });
            setListe(list);
            renderListe();
            toastGoster("☁️ " + musteriAdi + " (" + aktifMagaza + ") eklendi!");
        } else {
            toastGoster("⚠️ " + musteriAdi + " bu mağaza listesinde zaten var!");
        }
    }

    function initFraudSystem() {
        try {
            injectStyles();
            var targetBody = document.body || document.documentElement;
            if (!targetBody || document.getElementById("ys-fraud-panel")) return;

            var magazalar = getMagazalar();
            var savedDepo = localStorage.getItem("YS_USER_DEPO") || magazalar[0];
            var isMuted = localStorage.getItem("YS_SOUND_MUTED") === "true";
            var isMinimized = localStorage.getItem("YS_PANEL_MINIMIZED") === "true";
            var soundMode = localStorage.getItem("YS_SOUND_MODE") || "siren";

            var optionsHtml = magazalar.map(function(m) {
                var sel = (savedDepo === m) ? "selected" : "";
                return `<option value="${m}" ${sel}>Yemeksepeti Market, ${m}</option>`;
            }).join("");

            var panel = document.createElement("div");
            panel.id = "ys-fraud-panel";
            if (isMinimized) panel.classList.add("minimized");

            panel.innerHTML = `
                <div id="ys-f-header">
                    <div class="ys-f-header-title">
                        <span id="ys-f-cloud-dot" title="Bulut Senkronizasyonu Aktif"></span>
                        <span class="ys-f-brand-mini">çarşı</span>
                        <span id="ys-f-title-txt">Fraud Takip</span>
                    </div>
                    <div style="display:flex; align-items:center;">
                        <span id="ys-f-badge" title="Bu Mağaza / Tüm Mağazalar">0 / 0 Kişi</span>
                        <button id="ys-f-toggle-btn" title="Küçült / Genişlet">${isMinimized ? '▲' : '—'}</button>
                    </div>
                </div>
                <div id="ys-f-body">
                    <div id="ys-f-tab-status" class="ys-tab-inactive">⏳ Sekme kontrol ediliyor...</div>
                    <div style="display:flex; gap:6px; margin-bottom:8px;">
                        <button class="ys-f-btn-sub" id="ys-f-test-sound" style="flex:1;">📢 Alarm + Ses</button>
                        <select id="ys-f-sound-mode" style="width:85px; font-size:10px; font-weight:700; border-radius:10px; border:1px solid #e2e8f0; padding:0 8px; outline:none; background:#f8fafc;">
                            <option value="siren" ${soundMode === 'siren' ? 'selected' : ''}>🚨 Siren</option>
                            <option value="bip" ${soundMode === 'bip' ? 'selected' : ''}>🔔 Bip</option>
                        </select>
                        <button class="ys-f-btn-sub" id="ys-f-mute-btn" style="width:74px;">${isMuted ? '🔇 Sessiz' : '🔊 Açık'}</button>
                    </div>
                    <div class="ys-f-group">
                        <input type="text" id="ys-f-input" placeholder="Müşteri Adı Soyadı...">
                        <button id="ys-f-add">Ekle</button>
                    </div>
                    <div class="ys-f-filter-bar">
                        <input type="text" id="ys-f-search-inp" placeholder="🔍 İsim veya mağaza ara...">
                        <button class="ys-f-scope-btn active" id="ys-f-scope-store" title="Sadece seçili mağazaya eklenenleri göster">Bu Mağaza</button>
                        <button class="ys-f-scope-btn" id="ys-f-scope-all" title="Tüm mağazalardaki ortak havuzu göster">Tümü</button>
                    </div>
                    <div id="ys-f-list"></div>
                    <div style="display:flex; gap:6px; margin-top:8px;">
                        <button class="ys-f-tools-btn" id="ys-f-exp-btn">📥 İndir</button>
                        <button class="ys-f-tools-btn" id="ys-f-imp-btn">📤 Yükle</button>
                        <button class="ys-f-danger-btn" id="ys-f-clear-btn" title="Admin Şifresi Gerekir">🔒 Temizle</button>
                        <input type="file" id="ys-f-file-inp" accept=".json" style="display:none;">
                    </div>
                    <div class="ys-f-settings-box">
                        <div class="ys-f-lbl">
                            <span>🏢 AKTİF MAĞAZA</span>
                            <span id="ys-f-toggle-new-store" style="color:#ea002a; cursor:pointer; font-weight:800;">+ Yeni Mağaza</span>
                        </div>
                        <div class="ys-f-group">
                            <select id="ys-f-depo-select">${optionsHtml}</select>
                        </div>
                        <div id="ys-f-new-store-box" class="ys-f-group" style="display:none;">
                            <input type="text" id="ys-f-new-store-inp" placeholder="Örn: Bornova (İzmir)">
                            <button id="ys-f-new-store-save" style="background:#0f172a !important;">Kaydet</button>
                        </div>
                        <a href="${FORM_URL}" target="_blank" rel="noopener noreferrer" class="ys-f-form-btn">📋 Fraud Formu Doldur</a>
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

            document.getElementById("ys-f-scope-store").onclick = function() {
                listeGorunumKapsami = "store";
                this.classList.add("active");
                document.getElementById("ys-f-scope-all").classList.remove("active");
                renderListe(document.getElementById("ys-f-search-inp").value);
            };

            document.getElementById("ys-f-scope-all").onclick = function() {
                listeGorunumKapsami = "all";
                this.classList.add("active");
                document.getElementById("ys-f-scope-store").classList.remove("active");
                renderListe(document.getElementById("ys-f-search-inp").value);
            };

            document.getElementById("ys-f-toggle-new-store").onclick = function() {
                var box = document.getElementById("ys-f-new-store-box");
                box.style.display = (box.style.display === "none") ? "flex" : "none";
            };

            document.getElementById("ys-f-new-store-save").onclick = function() {
                var inp = document.getElementById("ys-f-new-store-inp");
                var yeniMagaza = inp.value.trim();
                if (!yeniMagaza) return;
                var mList = getMagazalar();
                if (!mList.includes(yeniMagaza)) {
                    mList.push(yeniMagaza);
                    setMagazalar(mList);
                    localStorage.setItem("YS_USER_DEPO", yeniMagaza);
                    magazaSelectGuncelle();
                    renderListe();
                    toastGoster("🏢 Yeni mağaza buluta eklendi: " + yeniMagaza);
                } else {
                    toastGoster("⚠️ Bu mağaza zaten listede mevcut!");
                }
                inp.value = "";
                document.getElementById("ys-f-new-store-box").style.display = "none";
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
                    musteriKayitEkle(val);
                    inp.value = "";
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
                if (!adminDogrula()) return;
                if (confirm("⚠️ Tüm mağazaların ortak bulut havuzu silinecek. Emin misiniz?")) {
                    setListe([]);
                    tespitEdilenler.clear();
                    renderListe();
                    toastGoster("🗑️ Admin onayı ile bulut listesi temizlendi");
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
                renderListe(document.getElementById("ys-f-search-inp").value);
                toastGoster("📍 Aktif Mağaza: " + this.value);
            };

            renderListe();
            sayacGuncelle();
            buluttanCek();
        } catch(e) {}
    }

    setInterval(buluttanCek, 5000);

    setInterval(function() {
        initFraudSystem();
        try {
            var aktifMi = devamEdiyorAktifMi();
            var statusEl = document.getElementById("ys-f-tab-status");
            var titleEl = document.getElementById("ys-f-title-txt");

            if (statusEl) {
                if (aktifMi) {
                    statusEl.className = "ys-tab-active";
                    statusEl.innerText = "🟢 Devam Ediyor Açık (Çapraz Tarama Aktif)";
                    if (titleEl) titleEl.innerText = "Fraud Takip [AKTİF]";
                } else {
                    statusEl.className = "ys-tab-inactive";
                    statusEl.innerText = "⏸️ Beklemede ('Devam ediyor' sekmesine geçin)";
                    if (titleEl) titleEl.innerText = "Fraud Takip [PASİF]";
                }
            }

            if (!aktifMi) return;

            var TUM_BULUT_LISTESI = getListe();
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
                        musteriKayitEkle(rawName);
                    };
                    musteriCell.appendChild(qBtn);
                }

                var musteriNorm = norm(rawName);
                var eslesenKayit = TUM_BULUT_LISTESI.find(function(kayit) {
                    var isimNorm = norm(kayit.name);
                    return isimNorm.length > 2 && musteriNorm.indexOf(isimNorm) !== -1;
                });

                var mevcutRozet = musteriCell.querySelector(".ys-f-alert-badge");

                if (eslesenKayit) {
                    rowEl.style.setProperty("background-color", "#ffe4e6", "important");
                    rowEl.style.setProperty("border-left", "4px solid #ea002a", "important");

                    if (!mevcutRozet) {
                        var badge = document.createElement("span");
                        badge.className = "ys-f-alert-badge";
                        badge.innerText = "🚨 FRAUD (" + eslesenKayit.store + ")";
                        musteriCell.appendChild(badge);
                    }

                    if (!tespitEdilenler.has(orderKey)) {
                        tespitEdilenler.add(orderKey);
                        bugunSayac++;
                        sayacGuncelle();
                        acilDurumAlarmiCal();
                        toastGoster("🚨 DİKKAT! Fraud Müşteri (" + rawName + " - Kayıt: " + eslesenKayit.store + ")");
                    }
                } else {
                    // Müşteri listeden silindiyse satır rengini ve rozetini anında temizle
                    if (mevcutRozet) {
                        mevcutRozet.remove();
                        rowEl.style.removeProperty("background-color");
                        rowEl.style.removeProperty("border-left");
                    }
                    tespitEdilenler.delete(orderKey);
                }
            });
        } catch(e) {}
    }, 1000);
})();
