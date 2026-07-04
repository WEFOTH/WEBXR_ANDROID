# WebXR Rhino 3D Viewer - Projektspezifikation

## Projektübersicht

**Name:** WebXR Rhino 3D Viewer  
**Zweck:** Augmented Reality (AR) Anwendung für die Anzeige und Platzierung von 3D-Modellen (Rhino-Exporte) auf mobilen Geräten  
**Zielplattform:** Google Pixel mit Chrome Browser  
**Deployment:** GitHub Pages mit HTTPS

## Technische Architektur

### Frontend Stack
- **3D Engine:** Three.js v0.160.0 (über CDN)
- **WebXR API:** Browser-native AR-Unterstützung (immersive-ar)
- **Rendering:** WebGL 2.0
- **UI:** Vanilla HTML/CSS/JavaScript (kein Framework)

### Wichtige Libraries
```
three@0.160.0
├── GLTFLoader (für .glb/.gltf Modelle)
├── OrbitControls (für 3D-Ansicht)
└── ARButton (für AR-Session)
```

## Projektstruktur

```
WEBXR_TEST/
├── src/                      # Quellcode
│   ├── index.html           # Hauptanwendung
│   ├── xr-test.html         # AR Test-Seite mit Platzierungs-Button
│   ├── app.js               # Hauptanwendungs-Logik
│   └── styles.css           # Globale Stile
│
├── assets/                   # 3D-Modelle und Ressourcen
│   ├── Test.glb             # Test-Modell (Icosahedron)
│   └── TEST.gltf            # Alternative Format
│
├── qr-codes/                # QR-Code Seiten für Mobile Access
│   ├── qrcode.html          # Hauptseite QR-Link
│   ├── qrcode.png           # QR-Code Bild
│   ├── xr-qrcode.html       # XR Test QR-Link
│   └── xr-qrcode.png        # XR QR-Code Bild
│
├── docs/                    # Dokumentation und Screenshots
│   ├── screenshots/         # Testscreenshots
│   ├── README.md            # Hauptdokumentation
│   ├── PROJECT_SPEC.md      # Diese Datei
│   ├── SETUP.md             # Installationanleitung
│   ├── ARCHITECTURE.md      # Architektur-Details
│   └── DEPLOYMENT.md        # GitHub Pages Deployment
│
└── [Root-Level]
    ├── .nojekyll            # GitHub Pages Config
    ├── .github/workflows/   # CI/CD Pipeline
    ├── make_qr.py          # QR-Code Generator
    ├── serve.ps1           # Local Development Server
    └── .git/               # Git Repository
```

## Funktionen

### 1. Hauptanwendung (index.html)
- ✅ 3D-Modelle laden (.glb, .gltf)
- ✅ Datei-Upload vom Gerät
- ✅ Test-Modell mit "Testmodell laden" Button
- ✅ OrbitControls für 3D-Rotation
- ✅ Automatische Modell-Zentrierung
- ✅ AR-Button für immersive AR
- ✅ Status-Updates für Benutzer

### 2. AR Test-Seite (xr-test.html)
- ✅ Vereinfachte AR-Umgebung
- ✅ Button-basierte Objekt-Platzierung
- ✅ **Visuelle Hilfsmittel:**
  - Fadenkreuz (Crosshair) in der Mitte
  - Grünes Grid am Boden
  - Schatten unter Objekten für Tiefenwahrnehmung
- ✅ Unterstützte AR-Features:
  - AR-Session Start/Stop
  - Immersive-ar Format
  - Local Reference Space

### 3. QR-Code Integration
- ✅ Mobile-optimierte Landing Pages
- ✅ Schneller Zugriff per QR-Scan
- ✅ Automatische Weiterleitung

## WebXR Support Matrix

### Getestete Geräte
| Gerät | Browser | immersive-ar | Status |
|-------|---------|--------------|--------|
| Google Pixel | Chrome 95+ | ✅ | Funktionierend |

### Erforderliche Features
```javascript
// Mindest-Features
requiredFeatures: ['hit-test']

// Optional
optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar']
```

## Modell-Anforderungen

### Unterstützte Formate
- `.glb` (empfohlen, Binary GLTF)
- `.gltf` (Text-GLTF mit externen Ressourcen)

### Rhino Export-Anleitung
```
Rhino → Datei → Exportieren → GLTF (*.gltf;*.glb)
```

### Modell-Optimierungen
- Automatische Skalierung auf Viewport-Größe
- Bounding-Box Berechnung
- Zentierung auf Y=0 (Boden-Ebene)

## Performance-Anforderungen

### Zielwerte (Google Pixel)
- **FPS:** ≥ 30 FPS in AR-Mode
- **Laden:** < 2s für kleine Modelle
- **Speicher:** < 100MB RAM

### Optimierungen implementiert
- CDN-basiertes Three.js (kein lokales Bundle)
- WebGL 2.0 mit Hardware-Acceleration
- Efficient Shadow Rendering
- Grid Helper (pre-rendered)

## Deployment-Anforderungen

### GitHub Pages
- ✅ Auto-HTTPS (erforderlich für WebXR)
- ✅ Keine Build-Tools notwendig
- ✅ Automatische Deployment über GitHub Actions
- ✅ `.nojekyll` File für korrekte File-Serving

### Sicherheit
- ✅ CORS: Datei-Upload funktioniert mit ArrayBuffer
- ✅ HTTPS: Automatisch von GitHub Pages
- ✅ Keine Third-Party API-Requests

## Browser-Kompatibilität

### Erforderlich
- Chrome/Chromium 95+
- Android 7.0+
- WebXR Support
- WebGL 2.0

### Nicht unterstützt
- Firefox (kein WebXR auf Android)
- Safari (iOS WebXR limited)
- HTTP (nur HTTPS funktioniert)

## Bekannte Limitierungen

1. **Hit-Testing kompliziert:** 
   - Vereinfachte Lösung: Button-basierte Platzierung
   - Grund: Mobile AR Hit-Test nicht zuverlässig

2. **Rhino-native Features nicht nutzbar:**
   - Nur geometrische Modelle unterstützt
   - Keine Rhino-Plugins/Extensions

3. **Cache-Probleme auf Mobile:**
   - Chrome cached aggressive
   - Lösung: Hard-Reload (Ctrl+Shift+R) notwendig

## Zukünftige Erweiterungen

- [ ] Touch-Gesten für Platzierungs-Rotation
- [ ] Multi-Objekt-Auswahl/Bearbeitung
- [ ] Modell-Speicherung/Export
- [ ] Animation Support
- [ ] Collaborative AR (mehrere Nutzer)

## Wichtige Dateien für Wartung

| Datei | Zweck | Änderungshäufigkeit |
|-------|-------|-------------------|
| `src/app.js` | Hauptlogik | Medium |
| `src/xr-test.html` | AR Testing | Low |
| `.github/workflows/deploy-pages.yml` | Deployment | Very Low |
| `PROJECT_SPEC.md` | Dokumentation | Low |
| `assets/` | 3D-Modelle | High |

## Kontakt & Support

**Entwicklung:** Florian Weininger  
**Repository:** https://github.com/WEFOTH/WEBXR_TEST  
**Live Demo:** https://wefoth.github.io/WEBXR_TEST/

---

*Zuletzt aktualisiert: Juli 2026*
