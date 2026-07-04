# WebXR Rhino 3D Viewer 🚀

Ein modernes **Augmented Reality (AR)** System zum Visualisieren und Platzieren von 3D-Modellen (Rhino-Exporte) auf mobilen Geräten wie Google Pixel.

**Live Demo:** https://wefoth.github.io/WEBXR_TEST/src/index.html

## Features ✨

### 🎯 Hauptfunktionen
- ✅ **3D-Modelle laden** (.glb, .gltf) vom Gerät oder aus der Cloud
- ✅ **Augmented Reality** - Modelle in realer Umgebung anzeigen
- ✅ **Intuitive Platzierung** - Button-basiertes Positionieren in AR
- ✅ **Visuelle Hilfsmittel** - Fadenkreuz, Grid, Schatten für präzises Platzieren
- ✅ **Rhino-Integration** - Direkt Rhino-Modelle exportieren und laden

### 📱 Mobiloptimiert
- Responsive Design für alle Bildschirmgrößen
- QR-Code für schnellen Zugriff vom Handy
- Funktioniert auf Google Pixel mit Chrome
- Automatische Modell-Skalierung und Zentrierung

### ⚡ Technologie
- **Three.js 0.160.0** - 3D-Rendering
- **WebXR API** - Browser-native AR
- **GitHub Pages** - HTTPS Hosting
- **Keine Server** - Reine Client-Side Anwendung

## Quick Start 🚀

### Online testen (sofort)
```
Handy: Scan QR-Code oder öffne:
https://wefoth.github.io/WEBXR_TEST/qr-codes/qrcode.html

AR testen: 
https://wefoth.github.io/WEBXR_TEST/qr-codes/xr-qrcode.html
```

### Lokal entwickeln (auf deinem Computer)
```bash
# 1. Repository klonen
git clone https://github.com/WEFOTH/WEBXR_TEST.git
cd WEBXR_TEST

# 2. Server starten (Windows)
.\serve.ps1

# 3. Browser öffnen
http://localhost:8000/src/index.html
```

Siehe [SETUP.md](SETUP.md) für detaillierte Anleitung.

## Projektstruktur 📁

```
WEBXR_TEST/
├── src/                    # 🔧 Quellcode (ändern hier!)
│   ├── index.html         # Hauptanwendung
│   ├── xr-test.html       # AR Test-Seite
│   ├── app.js             # 3D-Logik
│   └── styles.css         # Styling
│
├── assets/                # 📦 3D-Modelle
│   ├── Test.glb           # Standard Test-Modell
│   └── TEST.gltf          # Alternative Format
│
├── qr-codes/              # 📲 Mobile-Zugriff
│   ├── qrcode.html        # App QR-Link
│   └── xr-qrcode.html     # XR Test QR-Link
│
├── docs/                  # 📚 Dokumentation
│   ├── PROJECT_SPEC.md    # Technische Specs
│   ├── SETUP.md           # Installation Guide
│   ├── ARCHITECTURE.md    # Technische Details
│   └── DEPLOYMENT.md      # GitHub Pages Deploy
│
└── 📄 Wurzel
    ├── README.md          # Diese Datei
    ├── make_qr.py         # QR-Generator
    ├── serve.ps1          # Dev-Server
    └── .nojekyll          # GitHub Pages Config
```

## Wie es funktioniert 🔧

### 1️⃣ Modell laden (3D-Ansicht)
```
Rhino Modell → Exportieren als .glb
    ↓
App lädt .glb Datei
    ↓
Three.js rendert 3D-Szene
    ↓
Browser zeigt 3D-Ansicht mit OrbitControls
```

### 2️⃣ Augmented Reality aktivieren
```
Tippe auf AR-Button
    ↓
Browser startet AR-Session
    ↓
Camera macht Live-Video
    ↓
3D-Objekt wird auf reale Szene gelegt
    ↓
Tippe "Objekt platzieren" um zu duplizieren
```

### 3️⃣ Platzierung verfeinern
```
Fadenkreuz (oben) = Zielpunkt
Grid (unten)      = Referenzebene
Schatten          = Höhe & Tiefe
    ↓
Tipp: Button mehrmals klicken um mehrere Objekte zu platzieren
```

## Häufig gefragt ❓

**F: Wie lade ich mein Rhino-Modell?**
```
1. Rhino öffnen → Datei → Exportieren
2. Format: GLTF (*.gltf;*.glb) wählen
3. App öffnen → "Rhino-Modell laden" 
4. .glb Datei vom Handy wählen → Fertig!
```

**F: Funktioniert es auf meinem iPhone?**
```
Nein, nur Chrome auf Android (z.B. Google Pixel) ist zuverlässig.
Firefox, Safari haben begrenzte WebXR-Unterstützung.
```

**F: Warum lädt mein Modell nicht?**
```
Häufige Gründe:
1. Falsches Format (.obj, .fbx nicht unterstützt → .glb exportieren)
2. Zu groß (> 10MB) → Modell in Rhino optimieren
3. Browser Cache (Hard Reload: Ctrl+Shift+R)
4. HTTP statt HTTPS (GitHub Pages ist HTTPS ✓)
```

**F: Kann ich mehrere Objekte platzieren?**
```
Ja! Button mehrmals tippen = mehrere Klone platzieren.
```

**F: Kann ich meine Platzierung speichern?**
```
Noch nicht, aber geplant! Momentan nur temporär während Session.
```

## Anforderungen 📋

### Hardware
- 🔴 **Gerät:** Google Pixel oder ähnlich (mit WebXR Support)
- 🔴 **Browser:** Chrome 95+ (Android)
- 🔴 **Internet:** 4G/5G empfohlen

### Software (lokal entwickeln)
- Git
- Python 3.7+ (optional, nur für QR-Generator)
- VS Code (empfohlen)

## Entwicklung 👨‍💻

### Änderungen machen

**App-Logik:** `src/app.js`
```javascript
// Hier 3D-Modelle verwalten, Events handlen, etc.
const sampleModelUrl = '../assets/Test.glb'; // ← Modell URL
```

**UI Styling:** `src/styles.css`
```css
/* Button-Farben, Layouts, etc. */
background: #4f46e5; /* ← Farben ändern */
```

**AR Funktionen:** `src/xr-test.html`
```javascript
// AR-Session, Objektplatzierung, Visuals
renderer.xr.addEventListener('sessionstart', () => { ... });
```

### Debuggen
```
Browser F12 → Console
Dort sehen Sie:
✅ Modell geladen
❌ Fehler beim Laden
ℹ️ AR-Support Infos
```

### Testen
```bash
# 1. Lokal im Browser
http://localhost:8000/src/index.html

# 2. Mit Handy im lokalen Netzwerk
http://<computer-ip>:8000/src/index.html

# 3. Online (GitHub Pages)
https://wefoth.github.io/WEBXR_TEST/src/index.html
```

## Publikation 📤

```bash
# Änderungen committen
git add .
git commit -m "Neue Funktion hinzugefügt"

# Zu GitHub pushen
git push origin main

# ✅ Automatisch deployed zu GitHub Pages!
```

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für Details.

## Browser Support 🌐

| Browser | Platform | Status | Notes |
|---------|----------|--------|-------|
| Chrome | Android | ✅ Vollständig | Best-in-class WebXR |
| Chromium | Android | ✅ Vollständig | Brave, Samsung Internet |
| Firefox | Android | ⏸️ Begrenzt | WebXR experimentell |
| Safari | iOS | ❌ Nicht | Kein WebXR Support |
| Edge | Android | ✅ Vollständig | Chromium-basiert |

## Performance ⚡

### Ziele auf Google Pixel
- **3D-Modus:** 60 FPS
- **AR-Modus:** 30-45 FPS
- **Modell-Load:** < 2s
- **RAM-Verbrauch:** < 100MB

### Optimierungen
- Three.js aus CDN (kein lokales Bundle)
- Effiziente Geometrien
- Grid Helper (pre-optimiert)
- Hardware-Beschleunigung

## Erweiterungen 🔮

Geplante Features für später:
- [ ] Touch-Gesten (Rotate, Scale)
- [ ] Multi-Objekt Bearbeitung
- [ ] Persistente Speicherung
- [ ] Animation Support
- [ ] Collaborative AR

## Dokumentation 📚

| Datei | Inhalt |
|-------|--------|
| [SETUP.md](SETUP.md) | Installation & lokale Entwicklung |
| [PROJECT_SPEC.md](PROJECT_SPEC.md) | Technische Spezifikationen |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architektur & Code Details |
| [DEPLOYMENT.md](DEPLOYMENT.md) | GitHub Pages Deployment |

## Behebung von Problemen 🔧

### Modell erscheint nicht
```
→ F12 Console prüfen auf Fehler
→ Dateipfad korrekt? (../assets/...)
→ Format .glb oder .gltf?
→ Browser Cache löschen (Ctrl+Shift+R)
```

### AR-Button funktioniert nicht
```
→ Chrome verwenden (nicht Firefox!)
→ Immersive-ar Support? (Info-Box prüfen)
→ HTTPS? (lokal OK, online HTTPS nötig)
→ Kamera-Berechtigung geben?
```

### Buttons überlagern sich
```
→ Fenster vergrößern oder Handy drehen
→ Mobile-responsive Design wird angepasst
```

## Performance Tipps 💡

1. **Für Echtzeit-Arbeit:** `http://localhost:8000` nutzen
2. **Modell optimieren:** In Rhino Polygone reduzieren
3. **Cache-Probleme:** Hard-Reload oder Incognito
4. **Große Modelle:** In mehrere Parts aufteilen

## Credits 📝

- **Three.js:** 3D-Rendering Engine
- **WebXR Spec:** W3C Standardisierung
- **GitHub Pages:** Hosting & CI/CD

## License 📜

Offen zur Verwendung und Erweiterung.

## Support & Kontakt 💬

**Repository:** https://github.com/WEFOTH/WEBXR_TEST  
**Issues:** GitHub Issues Tab für Bugs/Fehler  
**Entwickler:** Florian Weininger

---

## Nächste Schritte 🎯

1. ✅ **Quick Start** → [SETUP.md](SETUP.md)
2. ✅ **Technisches Verständnis** → [ARCHITECTURE.md](ARCHITECTURE.md)
3. ✅ **Code-Änderungen machen** → `src/` Dateien bearbeiten
4. ✅ **Testen & Debuggen** → F12 Console
5. ✅ **Publizieren** → `git push origin main`

**Viel Spaß! 🚀**

---

*Zuletzt aktualisiert: Juli 2026*
