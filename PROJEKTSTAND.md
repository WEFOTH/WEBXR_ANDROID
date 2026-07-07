# Projektstand WEBXR_TEST

*Stand: 07.07.2026*

## Zusammenfassung

Die Smartphone-AR-App ist funktionsfähig und live deployt. Modelle lassen sich laden, in AR platzieren, auswählen und pro Objekt anpassen (Ansicht/Skalierung/Drehung). Platzierte Objekte sind über die WebXR Anchors API räumlich verankert. Die Meta-Quest-Entwicklung wurde am 07.07.2026 in das eigenständige Repo [WEBXR_QUEST](https://github.com/WEFOTH/WEBXR_QUEST) ausgegliedert (dieses Repo ist dessen Upstream).

**Live:** https://wefoth.github.io/WEBXR_TEST/src/index.html

## Erledigte Meilensteine

| Datum | Meilenstein |
|-------|-------------|
| 04.07.2026 | Grundgerüst: three.js-Szene, GLB/GLTF-Laden, AR-Session mit Hit-Test-Ring, QR-Einstieg |
| 05.07.2026 | Fehler-Panel auf der Seite; UI vereinfacht auf Tap-Select + Ansicht/Skalierung; Ansichtsmodi als Dropdown |
| 06.07.2026 | AR-Kompaktleiste: HUD schrumpft im AR-Modus auf schmale Bottom-Bar (`body.ar-active`), STOP-AR-Button verschoben; Objekt-Dropdown zur Auswahl |
| 07.07.2026 | Automatische Ausrichtung zum Betrachter beim Platzieren + Drehregler (±180°, 5°-Schritte) |
| 07.07.2026 | **Verankerung:** WebXR Anchors API — Objekte bleiben bei Tracking-Korrekturen an ihrer realen Position (Stufe 1 der Robustheits-Roadmap) |
| 07.07.2026 | Quest-Variante ausgegliedert nach WEBXR_QUEST (inkl. eigener Pages-URL und eigenem QR-Code) |

## Architektur-Entscheidungen (Kurzform)

- **Kein Framework, kein Build:** eine HTML-Seite + `app.js`, three.js per CDN-Import-Map → einfaches Deployment über GitHub Pages (Branch-Deploy, `.nojekyll`)
- **Anchors statt fester Weltkoordinaten:** Positionen werden pro Frame aus `anchor.anchorSpace` gelesen; Drehung bleibt bewusst app-gesteuert (Auto-Ausrichtung + Slider)
- **Alle AR-Features optional angefordert** (`hit-test`, `dom-overlay`, `anchors`) → App degradiert sauber statt zu scheitern
- **Zwei-Repo-Modell:** gemeinsame Features entstehen hier, Quest-Spezifisches nur im Quest-Repo; gemeinsame Git-Historie ermöglicht `git merge upstream/main`

## Offene Punkte / Ideen

- [ ] **iOS-Fallback über AR Quick Look:** .usdz-Export aus Rhino 8 + `rel="ar"`-Link, da iOS kein WebXR-AR unterstützt (recherchiert 06.07.2026)
- [ ] `Test_01.glb` optional als (zweites) Testmodell im UI verdrahten (liegt bisher nur in `assets/`)
- [ ] Objekt löschen im AR-Modus (aktuell nur „alle weg" durch Session-Ende)
- [ ] Veraltete `src/xr-test.html` entfernen oder aktualisieren
- [ ] Git-Identität lokal setzen (Commits laufen derzeit über die automatisch erratene Hochschul-Adresse)

## Bekannte Einschränkungen

- **iOS:** keine AR-Unterstützung (Apple/WebKit), nur 3D-Vorschau
- **Objekte sind sessiongebunden:** Beim Beenden der AR-Session werden platzierte Objekte entfernt (persistente Anker gibt es nur in der Quest-Variante)
- **Chrome-Cache:** Nach Deploys auf dem Handy ggf. Hard-Reload nötig
