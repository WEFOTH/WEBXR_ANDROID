# Projektspezifikation — Rhino → WebXR (Smartphone)

*Stand: 07.07.2026*

## Zweck & Zielplattform

AR-Visualisierung von Rhino-Exporten (.glb/.gltf) im Browser, ohne App-Installation.

- **Primäre Zielplattform:** Android-Smartphone mit Chrome/Chromium (getestet: Google Pixel)
- **Sekundär:** 3D-Vorschau auf jedem Desktop-/Mobil-Browser (ohne AR)
- **Nicht unterstützt:** AR auf iOS (Apple bietet kein WebXR `immersive-ar`); Meta Quest wird im Schwester-Repo [WEBXR_QUEST](https://github.com/WEFOTH/WEBXR_QUEST) bedient

## Technik-Stack

| Baustein | Wahl |
|----------|------|
| 3D-Engine | three.js 0.160 (CDN / Import-Map, kein Build) |
| AR | WebXR `immersive-ar` mit `hit-test`, `anchors`, `dom-overlay` (alle optional angefordert) |
| UI | Vanilla HTML/CSS/JS, ein HUD-Panel (`src/index.html`) |
| Hosting | GitHub Pages (Branch-Deploy von `main`, `.nojekyll`), HTTPS ist Pflicht für WebXR |

## Funktionale Anforderungen (umgesetzt)

1. Modell laden: eigenes .glb/.gltf (Datei-Dialog) oder Beispielmodell; automatische Skalierung/Zentrierung
2. 3D-Vorschau mit Orbit-Navigation und „Ansicht zurücksetzen"
3. AR-Platzierung per Hit-Test-Ring und Tap; bis zu 24 Objekte; Fallback ohne Hit-Test: 1,5 m in Blickrichtung
4. Räumliche Verankerung platzierter Objekte (WebXR Anchors) gegen Tracking-Drift
5. Automatische Ausrichtung der Modell-Vorderseite zum Betrachter beim Platzieren
6. Auswahl platzierter Objekte per Tap oder Dropdown; Hervorhebung (Tint + Achsen)
7. Pro Objekt einstellbar: Ansichtsmodus (Original/Farbe/Wireframe/Metall/Matt), Skalierung 0,25–3×, Drehung ±180° (5°-Raster)
8. Kompakte AR-Bedienleiste (dom-overlay), damit die Umgebung sichtbar bleibt
9. QR-Code-Einstieg (`qr-codes/qrcode.html`), da die Seite auf dem Handy ausschließlich per QR geöffnet wird
10. Fehleranzeige direkt auf der Seite (ohne DevTools nutzbar)

## Modell-Anforderungen

- **Format:** .glb bevorzugt (bettet Texturen ein); .gltf nur mit eingebetteten Ressourcen zuverlässig
- **Größe:** Ziel < 10 MB; große Modelle in Rhino reduzieren
- **Export:** `Rhino → Datei → Exportieren → GLTF (*.glb)`

## Nicht-Ziele (bewusst)

- Kein Framework, kein Bundler, kein Server-Backend
- Keine Persistenz platzierter Objekte auf dem Smartphone (Objekte enden mit der AR-Session); persistente Anker sind Quest-spezifisch im Schwester-Repo umgesetzt
- Keine iOS-AR-Unterstützung im WebXR-Pfad (möglicher separater Quick-Look-Fallback: siehe PROJEKTSTAND.md)

## Qualitätsanforderungen

- App muss ohne jedes optionale XR-Feature lauffähig bleiben (graceful degradation)
- Laufzeitfehler müssen auf der Seite sichtbar werden (Fehler-Panel)
- Nach jedem Push ist der Stand automatisch via GitHub Pages live; URL-Änderungen erfordern neuen QR-Code
