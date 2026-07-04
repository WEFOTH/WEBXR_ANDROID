# Deployment Guide: GitHub Pages

## Overview

Diese Anwendung wird automatisch auf GitHub Pages deployed wenn Code in den `main` Branch gepusht wird.

**Live URL:** https://wefoth.github.io/WEBXR_TEST/

## Automatisches Deployment (GitHub Actions)

### Konfiguration

Die Deployment-Pipeline ist in `.github/workflows/deploy-pages.yml` konfiguriert:

```yaml
name: Deploy to Pages
on:
  push:
    branches: ["main"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/configure-pages@v3
      - uses: actions/upload-pages-artifact@v2
      - uses: actions/deploy-pages@v2
```

### Wie es funktioniert

1. **Code pushen:**
   ```bash
   git add .
   git commit -m "Deine Nachricht"
   git push origin main
   ```

2. **GitHub Actions triggered automatisch** (in Actions Tab sichtbar)

3. **Build & Deploy** (< 1 Minute)

4. **Live unter:** https://wefoth.github.io/WEBXR_TEST/src/index.html ✅

## Manuelle Konfiguration (einmalig)

Falls Actions noch nicht konfiguriert:

### 1. Repo Settings
```
GitHub Repo → Settings → Pages
├── Source: Deploy from a branch
├── Branch: main
└── Folder: / (root)
```

### 2. Branch Protection (optional aber empfohlen)
```
Repo → Settings → Branches
├── Branch name pattern: main
├── Require a pull request review: ✓
└── Require status checks: ✓ (Actions)
```

## Dateien & Verzeichnisse

### Wichtig: Root-Level Access

GitHub Pages served Dateien vom Root (`/`), daher:

```
Repository Root
├── src/                 → https://.../ src/ index.html
├── assets/              → https://.../assets/Test.glb
├── qr-codes/           → https://.../qr-codes/ qrcode.html
├── .nojekyll           → GitHub Pages Skip Processing
├── .github/            → Actions Configuration
└── *.md                → Dokumentation
```

**Wichtig:** `.nojekyll` Datei muss im Root sein!

### Path Resolution in HTML

Wenn von `src/index.html` auf `assets/Test.glb` zugegriffen wird:

```javascript
// ✅ Lokal (localhost:8000)
const modelUrl = '../assets/Test.glb';
// → http://localhost:8000/assets/Test.glb

// ✅ GitHub Pages
const modelUrl = '../assets/Test.glb';
// → https://wefoth.github.io/WEBXR_TEST/assets/Test.glb
```

## HTTPS Anforderung

WebXR funktioniert **NUR mit HTTPS** (außer localhost).

### GitHub Pages
- ✅ HTTPS automatisch enabled
- ✅ Certificate automatisch verwaltet
- ✅ Keine zusätzliche Konfiguration nötig

### Lokale Entwicklung
- ✅ `http://localhost:8000` funktioniert auch ohne HTTPS
- ✅ Aber: IP-Adresse `http://192.168.x.x:8000` braucht HTTPS um WebXR zu testen

**Lösung:** Lokal testen mit GitHub Pages URL auf dem Pixel!

## Deployment Checklist

Vor jedem Push:

- [ ] Tests lokal durchführt (F5, Chrome DevTools)
- [ ] Modell-Paths korrekt (`../assets/...`)
- [ ] Keine absoluten Pfade (`/assets/...` funktioniert nicht!)
- [ ] CSS/JS Syntax korrekt (F12 → Console auf Fehler prüfen)
- [ ] Mobile responsiv getestet
- [ ] QR-Code Links aktuell

## Troubleshooting

### 🔴 Seite zeigt 404
**Problem:** File wird nicht gefunden

**Lösungen:**
1. URL prüfen: `https://wefoth.github.io/WEBXR_TEST/src/index.html`
2. `.nojekyll` vorhanden? (verhindert Jekyll Processing)
3. 5 Min warten (Deployment nicht sofort live)
4. Browser Cache: Hard Reload (Ctrl+Shift+R)

### 🔴 Modelle laden nicht
**Problem:** 404 bei Modell-Load

**Lösungen:**
1. Dateipfad prüfen in `app.js`: `../assets/Test.glb`
2. Modell in `assets/` Upload? (GitHub Actions zeigt Fehler)
3. Modell-Dateigröße? (sollte < 10MB sein)

```bash
# Lokal Dateigröße prüfen:
ls -lh assets/
```

### 🔴 GitHub Actions schlägt fehl
**Problem:** Rotes X in Actions Tab

**Lösungen:**
1. Actions Tab öffnen: https://github.com/WEFOTH/WEBXR_TEST/actions
2. Fehlgeschlagenen Workflow klicken
3. Error-Details lesen
4. Common Errors:
   - Syntax errors in `.github/workflows/deploy-pages.yml`
   - Protected branch requirements
   - File encoding issues

### 🔴 WebXR funktioniert nicht online
**Problem:** AR-Button sichtbar aber nicht nutzbar

**Lösungen:**
1. HTTPS prüfen (sollte 🔒 im URL-Bar sein)
2. Chrome Version aktuell? (95+)
3. Immersive-ar Support? (Info-Box prüfen)
4. DevTools → Console auf Fehler prüfen

## Performance Monitoring

### GitHub Pages Stats
```
Repo → Insights → Traffic → Pages
```

Zeigt:
- Besucherzahlen
- Traffic pro Seite
- Bandwidth-Verbrauch

### Größe überwachen

```bash
# Lokal testen wie größe für Deployment:
du -sh assets/
# → sollte < 50MB total sein
```

## Branches & Workflows

### Main Branch
- **Deployment:** Automatisch
- **Status:** Produkion
- **Revert möglich:** Ja, mit `git revert`

### Testing (optional)
```bash
# Feature Branch erstellen
git checkout -b feature/neue-funktion

# Testen...
git push origin feature/neue-funktion

# Wenn OK → Pull Request + Merge zu main
```

## CMS Alternativen (nicht nötig hier!)

GitHub Pages unterstützt auch:
- ⏸️ Jekyll (nicht nötig, `.nojekyll` disabelt es)
- ⏸️ Hugo / Gatsby (zu komplex für dieses Projekt)
- ✅ Plain HTML (das ist was wir verwenden!)

## Sicherheit & Privacy

### Secrets (nicht vorhanden, aber wenn nötig)
```
Repo → Settings → Secrets and Variables → Actions
```

### Branch Protection
```
Repo → Settings → Branches → main → Add Rule
├── Require status checks: ✓
├── Require pull requests: ✓
└── Dismiss stale reviews: ✓
```

## Rollback / Revert

Falls Deployment schiefgeht:

```bash
# Letzten Commit anschauen
git log --oneline

# Zu älterem Commit zurück
git revert <commit-hash>
git push origin main

# GitHub Pages updated automatisch!
```

## Analytics Setup (optional)

Wenn Besucher-Daten gewünscht:

1. **Google Analytics:**
   ```html
   <!-- In src/index.html HEAD -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

2. **GitHub Pages Built-in:**
   - Kostenlos in Repo → Insights → Traffic

## Weitere Resources

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [WebXR HTTPS Requirement](https://www.w3.org/TR/webxr/)

---

**Status:** ✅ Automatisches Deployment aktiv  
**Zuletzt aktualisiert:** Juli 2026
