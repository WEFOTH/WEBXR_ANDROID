# Rhino → WebXR (Smartphone-AR)

Web-App zum Visualisieren und Platzieren von Rhino-3D-Modellen (.glb/.gltf) in Augmented Reality — direkt im Browser, ohne App-Installation.

**Live-Demo:** https://wefoth.github.io/WEBXR_TEST/src/index.html
**QR-Code zum Scannen:** https://wefoth.github.io/WEBXR_TEST/qr-codes/qrcode.html

> **Meta-Quest-Variante:** Die Weiterentwicklung für Meta Quest (Passthrough-MR, Ebenen-Snap, persistente Anker) liegt im Schwester-Repo [WEBXR_QUEST](https://github.com/WEFOTH/WEBXR_QUEST). Dieses Repo ist dessen Upstream: gemeinsame Verbesserungen entstehen hier und werden per `git merge upstream/main` übernommen.

## Funktionen

### 3D-Vorschau (Desktop & Mobil)
- **Modell laden:** eigenes .glb/.gltf per Datei-Dialog oder eingebautes Testmodell
- **Orbit-Navigation** (drehen/zoomen), „Ansicht zurücksetzen"
- Automatische Skalierung und Zentrierung des Modells (Unterkante auf Boden)

### AR-Modus (Android + Chrome)
- **Platzieren:** Hit-Test-Ring zeigt erkannte Flächen, Tippen platziert das Modell (bis zu 24 Objekte)
- **Verankerung:** platzierte Objekte werden per WebXR Anchors API an der realen Position fixiert und driften nicht, wenn das Gerät sein Tracking korrigiert
- **Automatische Ausrichtung:** Objekte drehen sich beim Platzieren mit der Vorderseite zum Betrachter
- **Auswählen:** Tap auf ein platziertes Objekt (gelbe Hervorhebung) oder Auswahl per Dropdown
- **Bearbeiten pro Objekt:** Ansicht (Original/Farbe/Wireframe/Metall/Matt), Skalierung (0,25–3×), Drehung (±180° in 5°-Schritten)
- **Kompakte AR-Leiste:** Im AR-Modus schrumpft die Bedienoberfläche auf eine schmale Leiste am unteren Rand, damit die Umgebung sichtbar bleibt

### Robustheit
- Fehler-Panel direkt auf der Seite (zeigt JavaScript-/Lade-Fehler ohne DevTools)
- Fallback-Platzierung 1,5 m in Blickrichtung, wenn kein Hit-Test verfügbar ist
- Anchors/DOM-Overlay sind optionale Features — fehlen sie, läuft die App trotzdem

## Bedienung (Kurzfassung)

1. Seite auf dem Handy öffnen (QR-Code scannen) — Android mit Chrome
2. Modell laden („Rhino-Modell laden" oder „Testmodell laden")
3. „START AR" tippen, Kamera-Berechtigung erteilen
4. Handy langsam bewegen, bis der Ring auf einer Fläche erscheint
5. Tippen = platzieren; auf ein Objekt tippen = auswählen
6. Untere Leiste: Ansicht, Skalierung, Drehung des ausgewählten Objekts anpassen

### Rhino-Export
`Rhino → Datei → Exportieren → GLTF (*.glb)` — .glb bettet Texturen ein und ist zuverlässiger als .gltf mit externen Dateien. Zielgröße < 10 MB.

## Geräte-Unterstützung

| Plattform | AR-Modus | 3D-Vorschau |
|-----------|----------|-------------|
| Android + Chrome/Chromium (z. B. Pixel) | ✅ | ✅ |
| Meta Quest Browser | ✅ (siehe [WEBXR_QUEST](https://github.com/WEFOTH/WEBXR_QUEST)) | ✅ |
| iPhone/iPad (Safari & alle iOS-Browser) | ❌ kein WebXR-AR¹ | ✅ |
| Desktop-Browser | ❌ | ✅ |

¹ Apple unterstützt WebXR `immersive-ar` auf iOS nicht. Möglicher Ausweg: AR Quick Look mit .usdz-Export (siehe [PROJEKTSTAND.md](PROJEKTSTAND.md), offene Punkte).

## Projektstruktur

```
WEBXR_TEST/
├── src/
│   ├── index.html        # App-Seite (HUD, Fehler-Panel)
│   ├── app.js            # Gesamte Logik: Szene, Laden, AR, Platzierung, Anker
│   ├── styles.css        # Styling inkl. AR-Kompaktleiste (body.ar-active)
│   └── xr-test.html      # Veraltete Testseite (nicht mehr gepflegt)
├── assets/               # Beispielmodelle (Test.glb, Test_01.glb, TEST.gltf)
├── qr-codes/             # QR-Einstieg fürs Handy (qrcode.html + qrcode.png)
├── docs/                 # Screenshots
├── index.html            # Weiterleitung auf src/index.html
├── serve.ps1             # Lokaler Dev-Server (Windows)
├── make_qr.py            # QR-Generator (Python, optional)
└── *.md                  # Dokumentation (siehe unten)
```

## Entwicklung

```powershell
git clone https://github.com/WEFOTH/WEBXR_TEST.git
cd WEBXR_TEST
.\serve.ps1                # oder: python -m http.server 8000
# → http://localhost:8000/src/index.html
```

Kein Build-Schritt, keine Abhängigkeiten: three.js 0.160 kommt per CDN/Import-Map. Deployment = `git push origin main` → GitHub Pages („Deploy from a branch", Details in [DEPLOYMENT.md](DEPLOYMENT.md)).

**Wichtig:** WebXR braucht HTTPS. Auf dem Handy daher über die GitHub-Pages-URL testen (localhost funktioniert nur am Rechner selbst). Ändert sich eine Seiten-URL, den QR-Code in `qr-codes/` mit regenerieren.

## Dokumentation

| Datei | Inhalt |
|-------|--------|
| [PROJEKTSTAND.md](PROJEKTSTAND.md) | Aktueller Stand, erledigte Meilensteine, offene Punkte |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Wie die App technisch funktioniert |
| [PROJECT_SPEC.md](PROJECT_SPEC.md) | Anforderungen, unterstützte Formate/Geräte |
| [SETUP.md](SETUP.md) | Lokale Entwicklung Schritt für Schritt |
| [DEPLOYMENT.md](DEPLOYMENT.md) | GitHub-Pages-Deployment & Troubleshooting |

## Häufige Probleme

- **Altes Verhalten nach Update:** Chrome cached aggressiv → Hard-Reload (Adresse neu laden, ggf. Browserdaten der Seite löschen)
- **AR-Button zeigt „AR NOT SUPPORTED":** falscher Browser/Gerät (siehe Tabelle oben) oder Seite nicht über HTTPS geöffnet
- **Modell lädt nicht:** Format prüfen (.glb bevorzugt), Fehler-Panel auf der Seite lesen
- **Pages-Deploy schlägt fehl:** Actions-Tab prüfen; der Deploy-Schritt scheitert gelegentlich transient → leerer Commit stößt ihn neu an

---

**Entwickler:** Florian Weininger · OTH Regensburg
*Stand: 07.07.2026*
