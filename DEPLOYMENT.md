# Deployment: GitHub Pages

*Stand: 07.07.2026*

**Live-URL:** https://wefoth.github.io/WEBXR_TEST/src/index.html

## Konfiguration

GitHub Pages ist auf **„Deploy from a branch"** eingestellt (Branch `main`, Ordner `/ (root)`). GitHubs eingebauter Workflow „pages build and deployment" veröffentlicht bei jedem Push automatisch den kompletten Repo-Inhalt — ein eigener Actions-Workflow ist **nicht** nötig und wurde bewusst entfernt (er scheiterte, weil die Pages-Quelle nicht auf „GitHub Actions" steht).

Wichtige Dateien:

- `.nojekyll` im Root — verhindert Jekyll-Verarbeitung, muss vorhanden bleiben
- relative Pfade verwenden (`../assets/…`), keine absoluten (`/assets/…` bricht unter `/WEBXR_TEST/`)

## Ablauf

```powershell
git push origin main
# → Actions-Tab: "pages build and deployment" läuft
# → nach ~1–2 Minuten live
```

WebXR setzt HTTPS voraus — GitHub Pages liefert das automatisch.

## Troubleshooting

### Seite zeigt alten Stand
1. 1–2 Minuten warten (Deploy + CDN)
2. Hard-Reload am Gerät; notfalls Websitedaten löschen (Chrome cached aggressiv)
3. Prüfen, ob der Push wirklich auf `main` gelandet ist

### „pages build and deployment" schlägt fehl
Kommt vor — auch **transient auf GitHub-Seite** (beobachtet am 06.07.2026: Build ok, Deploy-Schritt failed).

1. Actions-Tab öffnen: https://github.com/WEFOTH/WEBXR_TEST/actions → fehlgeschlagenen Lauf ansehen
2. Wenn nur der Deploy-Schritt scheitert: leeren Commit pushen, um den Lauf neu anzustoßen:
   ```powershell
   git commit --allow-empty -m "Retrigger Pages deploy"
   git push
   ```
3. Ob der neue Stand live ist, lässt sich am schnellsten per Abruf prüfen (Suchstring aus dem letzten Commit in `src/app.js` suchen)

### 404 auf einer Unterseite
- URL exakt prüfen (Groß-/Kleinschreibung zählt)
- `.nojekyll` vorhanden?

## Rollback

```powershell
git revert <commit-hash>
git push origin main
```

## Hinweis Quest-Repo

Das Schwester-Repo [WEBXR_QUEST](https://github.com/WEFOTH/WEBXR_QUEST) ist identisch aufgesetzt (Branch-Deploy von `main`): Live-URL `https://wefoth.github.io/WEBXR_QUEST/src/index.html`. Gemeinsame Änderungen dort per `git fetch upstream && git merge upstream/main` übernehmen und pushen.
