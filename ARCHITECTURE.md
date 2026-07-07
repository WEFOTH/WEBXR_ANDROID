# Architektur & technische Details

*Stand: 07.07.2026 — beschreibt den aktuellen Code in `src/app.js`.*

## Überblick

Die gesamte Anwendung ist eine statische Seite (`src/index.html`) mit einem ES-Modul (`src/app.js`). three.js 0.160 wird über eine Import-Map vom CDN geladen; es gibt keinen Build-Schritt.

```
Browser (Chrome/Android)
└── WebXR API (immersive-ar)
    ├── hit-test      → Flächenerkennung für den Platzierungs-Ring
    ├── anchors       → räumliche Fixierung platzierter Objekte
    └── dom-overlay   → HTML-Bedienleiste über dem Kamerabild
        └── three.js (WebGL): Szene, GLTFLoader, OrbitControls, ARButton
```

## Zustandsmodell

| Variable | Bedeutung |
|----------|-----------|
| `modelRoot` / `activeModel` | zentriertes, skaliertes Ausgangsmodell (Vorschau); AR-Objekte sind Klone davon |
| `placedObjects[]` | pro platziertem Objekt: `group` (Klon), `axes`, `viewMode`, `scaleFactor`, `baseYaw`, `rotationDeg`, `anchor` |
| `selectedObjectIndex` | aktuell ausgewähltes Objekt (Slider/Dropdown wirken darauf) |
| `currentViewMode/-ScaleFactor/-RotationDeg` | Voreinstellungen für das nächste platzierte Objekt |
| `hitTestSource`, `latestHitTestResult` | Hit-Test der laufenden Session; letztes Ergebnis für die Anker-Erzeugung |

## Ablauf: Modell laden

1. Datei-Dialog (`.glb`/`.gltf`) oder Testmodell-Button → `GLTFLoader`
2. `fitModelToScene()`: Bounding-Box → auf max. 1,2 m skalieren, x/z zentrieren, Unterkante auf y=0
3. Vorschau in der 3D-Szene mit OrbitControls, Grid und Schattenfläche

## Ablauf: AR-Platzierung

1. **Session-Start** (`sessionstart`): Hintergrund/Fog/Grid aus, Pixel-Ratio gedeckelt (1,5), Hit-Test-Source aus `viewer`-Space angefordert, `body.ar-active` gesetzt (CSS schaltet das HUD auf die kompakte Bottom-Bar um)
2. **Jeden Frame** (`animate`): erstes Hit-Test-Ergebnis → Ring (`reticle`) und grünes Platzierungs-Grid folgen der erkannten Fläche; das Ergebnis wird in `latestHitTestResult` gemerkt
3. **Select-Event** (Tap / Controller-Trigger auf `renderer.xr.getController(0)`):
   - Raycast auf `placedObjects` → Treffer = **auswählen** (gelbe Hervorhebung + Achsen)
   - kein Treffer = **platzieren**: Klon an Ring-Position (Fallback: 1,5 m in Blickrichtung)
4. **Ausrichtung:** `baseYaw = atan2(cam − obj)` dreht die Modell-Vorderseite (+Z) zum Betrachter; der Dreh-Slider addiert `rotationDeg` obendrauf (`applyRotationToPlaced`)
5. **Verankerung:** `latestHitTestResult.createAnchor()` → Anker am Objekt gespeichert; `animate` liest pro Frame `frame.getPose(anchor.anchorSpace, referenceSpace)` und setzt die Objekt-**Position** nach. Die Rotation bleibt app-gesteuert (Anker-Orientierung von Böden ist beliebig um die Hochachse)
6. **Session-Ende:** Szene zurücksetzen, platzierte Objekte entfernen, `ar-active` entfernen

Das HUD verhindert mit `beforexrselect`, dass Taps auf Bedienelemente gleichzeitig platzieren.

## Ansichtsmodi

`applyViewModeToNode()` hält pro Mesh zwei Materialien vor: `baseMaterial` (Original) und `shadeMaterial` (wird für Farbe/Wireframe/Metall/Matt umkonfiguriert). Die Auswahl wirkt auf das selektierte Objekt bzw. als Voreinstellung für neue Objekte.

## AR-Bedienleiste (dom-overlay)

`styles.css` definiert unter `body.ar-active … { }` den Kompaktmodus: HUD wandert als schmale Leiste an den unteren Rand (Ansicht-Dropdown, Skalieren- und Drehen-Slider, Statuszeile); Titel, Erklärtexte und Lade-Buttons werden ausgeblendet. Der von three.js erzeugte `#ARButton` („STOP AR") wird per CSS über die Leiste verschoben.

Hinweis: Der Meta-Quest-Browser unterstützt kein dom-overlay — dort ist die Leiste in der Session unsichtbar. Die Quest-Variante ([WEBXR_QUEST](https://github.com/WEFOTH/WEBXR_QUEST)) plant dafür ein In-Headset-Menü aus three.js-Objekten.

## Fehlerbehandlung

- `index.html` registriert global `error`/`unhandledrejection` und zeigt Fehler im Seiten-Panel (`#errorPanel`) — Debugging ohne DevTools am Handy
- Alle XR-Features sind `optionalFeatures`; `createAnchor`-Fehler werden geschluckt (Objekt bleibt dann unverankert), Hit-Test-Ausfall aktiviert die Blickrichtungs-Platzierung

## Performance-Maßnahmen

- Pixel-Ratio in AR auf 1,5 gedeckelt (`arPixelRatioCap`)
- Klone platzierter Objekte werfen keine Schatten (`castShadow = false`)
- Obergrenze 24 platzierte Objekte (`maxPlacedObjects`)
