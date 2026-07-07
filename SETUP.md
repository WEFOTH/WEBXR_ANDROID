# Setup & lokale Entwicklung

*Stand: 07.07.2026*

## Voraussetzungen

- Git
- Ein AR-fähiges Testgerät: Android-Smartphone mit Chrome (z. B. Google Pixel)
- Optional: Python 3 (für `python -m http.server` bzw. den QR-Generator `make_qr.py`)

## Lokal starten

```powershell
git clone https://github.com/WEFOTH/WEBXR_ANDROID.git
cd WEBXR_ANDROID
.\serve.ps1                      # Windows; alternativ: python -m http.server 8000
```

→ App unter `http://localhost:8000/src/index.html`. Es gibt keinen Build-Schritt; Änderungen in `src/` sind nach einem Browser-Reload sichtbar.

**AR lokal testen geht nur eingeschränkt:** WebXR verlangt HTTPS (Ausnahme: `localhost` am Rechner selbst). Vom Handy aus `http://<rechner-ip>:8000` zu öffnen funktioniert daher **nicht** für AR. Praxis-Workflow: pushen und auf dem Handy die GitHub-Pages-URL (per QR-Code) testen.

## Wo was liegt

| Datei | Zweck |
|-------|-------|
| `src/index.html` | Seite: HUD-Panel, Fehler-Panel, Import-Map |
| `src/app.js` | gesamte Logik (Szene, Laden, AR, Platzierung, Anker) |
| `src/styles.css` | Styling; AR-Kompaktleiste unter `body.ar-active` |
| `assets/` | Beispielmodelle (Testmodell-Button lädt `Test.glb`) |
| `qr-codes/` | QR-Einstiegsseite + PNG |
| `src/xr-test.html` | veraltete Testseite, nicht mehr gepflegt |

## Eigenes Modell einbinden

1. In Rhino als **.glb** exportieren (`Datei → Exportieren → GLTF`)
2. Entweder zur Laufzeit über „Rhino-Modell laden" öffnen (kein Deploy nötig), oder
3. dauerhaft: Datei nach `assets/` legen und in `src/app.js` die `sampleModelUrl` anpassen

Zielgröße < 10 MB; .glb ist .gltf vorzuziehen (Texturen eingebettet).

## QR-Code aktualisieren

Nur nötig, wenn sich eine Seiten-**URL** ändert (der Inhalt hinter der URL darf sich beliebig ändern):

- `python make_qr.py`, oder QR-PNG über einen Generator erzeugen und in `qr-codes/qrcode.png` ablegen
- Link/Text in `qr-codes/qrcode.html` mitpflegen

## Veröffentlichen

```powershell
git add <dateien>
git commit -m "…"
git push origin main
```

GitHub Pages („pages build and deployment") veröffentlicht automatisch; nach 1–2 Minuten ist der Stand live. Details und Troubleshooting: [DEPLOYMENT.md](DEPLOYMENT.md).

## Typische Stolpersteine

- **Handy zeigt alten Stand:** Chrome-Cache → Seite hart neu laden oder Websitedaten löschen
- **Modell lädt nicht:** Fehler-Panel auf der Seite lesen; Format/Größe prüfen
- **AR-Button fehlt/inaktiv:** Gerät/Browser prüfen (Android + Chrome), HTTPS-URL verwenden
- **iPhone:** zeigt nur die 3D-Vorschau — iOS unterstützt kein WebXR-AR (siehe README, Geräte-Tabelle)
