# Setup & Installation Guide

## Voraussetzungen

- Windows / macOS / Linux
- Git
- Python 3.7+ (für QR-Code Generator, optional)
- Google Pixel oder anderes AR-fähiges Gerät
- Chrome Browser (95+)

## Lokale Installation

### 1. Repository klonen
```bash
git clone https://github.com/WEFOTH/WEBXR_TEST.git
cd WEBXR_TEST
```

### 2. Lokalen Server starten

**Windows (PowerShell):**
```powershell
.\serve.ps1
```

**macOS/Linux (Python):**
```bash
python -m http.server 8000
```

Server läuft dann unter: `http://localhost:8000/src/`

## Entwicklungs-Workflow

### Dateistruktur verstehen

```
src/                    → Quellcode (wird im Browser geladen)
├── index.html          → Hauptanwendung
├── xr-test.html        → AR Test-Seite
├── app.js              → Logik
└── styles.css          → Styling

assets/                 → 3D-Modelle
├── Test.glb            → Test-Modell
└── TEST.gltf           → Alternative

qr-codes/               → Mobile-Zugriff
├── qrcode.html         → App QR-Link
└── xr-qrcode.html      → Test QR-Link
```

### Änderungen testen

1. **Lokal:** Änderungen in `src/` machen
2. **Refresh:** Browser neu laden (F5)
3. **Mobile:** IP-Adresse im Browser eingeben:
   ```
   http://<deine-computer-ip>:8000/src/index.html
   ```

### Code Änderungen

Alle wesentlichen Dateien:

| Datei | Bearbeite für |
|-------|---|
| `src/index.html` | HTML-Struktur, UI-Elemente |
| `src/app.js` | 3D-Logik, Modell-Laden |
| `src/xr-test.html` | AR-Funktionen, Platzierung |
| `src/styles.css` | Design, Responsive Layout |

## Modelle hinzufügen

### Von Rhino exportieren

1. Modell in Rhino öffnen
2. **Datei → Exportieren**
3. Format wählen: **GLTF (*.gltf;*.glb)**
4. Speichere in `assets/`
5. In `app.js` die URL anpassen:
   ```javascript
   const myModelUrl = '../assets/mein-modell.glb';
   ```

### Größe optimieren

- ✅ **Ziel:** < 5MB pro Modell
- ✅ **Tipp:** In Rhino → Exportoptionen → Geometrie komprimieren
- ✅ **Format:** `.glb` ist kleiner als `.gltf`

## QR-Code aktualisieren

Wenn sich die URL ändert (z.B. anderes Projekt):

```bash
# QR-Code neu generieren
python make_qr.py

# Dann QR-Bilder updaten
```

## GitHub Pages Deployment

### Automatisch (empfohlen)

```bash
# Änderungen committen und pushen
git add .
git commit -m "Deine Nachricht"
git push origin main
```

GitHub Actions deploys dann automatisch! ✅

### Live URL
```
https://wefoth.github.io/WEBXR_TEST/src/index.html
```

## Häufige Probleme

### 🔴 Modell lädt nicht
**Symptome:** Grauer Bildschirm, keine Fehlermeldung

**Lösungen:**
1. Browser-Konsole öffnen (F12 → Console)
2. Fehler-Meldungen lesen
3. Datei-Pfad prüfen (`../assets/modell.glb`)
4. Modell-Format prüfen (`.glb` oder `.gltf`)

### 🔴 AR funktioniert nicht
**Symptome:** AR-Button sichtbar aber nicht klickbar

**Lösungen:**
1. Chrome verwenden (nicht andere Browser!)
2. HTTPS prüfen (lokal OK, online muss HTTPS sein)
3. AR-Support prüfen: Info-Box sollte "✓ AR wird unterstützt" zeigen
4. Gerät neu starten

### 🔴 Mobile Cache Problem
**Symptome:** Alte Version wird angezeigt nach Code-Änderung

**Lösungen:**
1. Hard-Reload: `Ctrl+Shift+R` (Windows) oder `Cmd+Shift+R` (Mac)
2. Incognito-Modus öffnen
3. Browser-Cache leeren in Chrome-Einstellungen

### 🔴 Button überlagern sich
→ Siehe `src/xr-test.html`, CSS wird korrekt positioniert (bottom: 5.5rem für Status, bottom: 0.5rem für Button)

## Tipps für optimale Entwicklung

### Debugging in VS Code
```javascript
// Console Logs verwenden
console.log('Modell geladen:', model);
console.error('Fehler:', error);
```

### Editor empfehlungen
- **VS Code** mit Erweiterungen:
  - `Three.js Snippets`
  - `Prettier` (Code Formatter)
  - `Live Server` (Alternative zu serve.ps1)

### Performance testen
- **Chrome DevTools** (F12 → Performance)
- **Chrome DevTools** (F12 → Network) für Modell-Größe

## Nächste Schritte

1. ✅ Setup erfolgreich? → Repository testen
2. ✅ Änderungen machen? → `src/app.js` bearbeiten
3. ✅ Neues Modell? → `assets/` Ordner nutzen
4. ✅ Publizieren? → `git push` zu GitHub

---

**Fragen?** → Siehe [PROJECT_SPEC.md](PROJECT_SPEC.md) für technische Details
