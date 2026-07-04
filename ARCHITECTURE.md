# Architektur & Technische Details

## Systemarchitektur

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Chrome)                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │          WebXR API (immersive-ar)                │   │
│  │  - AR Session Management                         │   │
│  │  - Reference Space (local)                       │   │
│  │  - Frame Input Handling                          │   │
│  └──────────────────────────────────────────────────┘   │
│                        ↓                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Three.js 0.160.0 (WebGL)                │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │ Scene Management                            │  │   │
│  │  │ - 3D Objects (Meshes)                      │  │   │
│  │  │ - Camera (PerspectiveCamera)               │  │   │
│  │  │ - Lighting (Ambient + Directional)         │  │   │
│  │  │ - Helpers (GridHelper, ShadowMaterial)     │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │                                                   │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │ Renderer                                    │  │   │
│  │  │ - WebGL 2.0 Context                        │  │   │
│  │  │ - XR Enabled (xr.enabled = true)           │  │   │
│  │  │ - setReferenceSpaceType('local')           │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │                                                   │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │ Loaders                                     │  │   │
│  │  │ - GLTFLoader (für .glb/.gltf)             │  │   │
│  │  │ - FileReader (für Upload)                  │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │                                                   │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │ Controls                                    │  │   │
│  │  │ - OrbitControls (3D Navigation)            │  │   │
│  │  │ - ARButton (XR Session Start)              │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                        ↓                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Device Hardware (Pixel)                  │   │
│  │  - Camera (Videostream)                         │   │
│  │  - IMU (Rotation/Position)                      │   │
│  │  - GPU (WebGL Rendering)                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Datenflusss: Von Rhino zu AR

```
Rhino Model
    ↓ (Export als .glb)
assets/mymodel.glb (Binary Format)
    ↓ (HTTP GET oder FileReader)
GLTFLoader.parse()
    ↓
THREE.Group (Scene Graph)
    ├── Meshes (Geometries + Materials)
    ├── Lights
    └── Armatures (wenn animiert)
    ↓ (Automatic Centering)
Box3.getCenter() → Position Offset
Box3.getSize() → Scale Calculation
    ↓ (Scene.add())
Three.js Scene
    ↓ (renderer.render() in animate loop)
WebGL Canvas
    ↓ (XR Mode or Desktop)
┌─────────────────────────────────────┐
│  Desktop: 2D Canvas Display         │
│  AR Mode: Device Camera + Overlay   │
└─────────────────────────────────────┘
```

## Module & Komponenten

### 1. Scene Setup (`app.js`)

```javascript
// Initialisierung
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

// Konfiguration für AR
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local');
```

**Eigenschaften:**
- FOV: 45° (Mobil-optimiert)
- Near Plane: 0.01 (für kleine Objekte)
- Far Plane: 100 (für große Szenen)
- Alpha: true (für Kamera-Hintergrund in AR)

### 2. Model Loading Pipeline

```javascript
async function loadModelFromUrl(url, label) {
  // 1. Validierung
  if (!url.endsWith('.glb') && !url.endsWith('.gltf')) {
    throw new Error('Nur .glb/.gltf Formate unterstützt');
  }

  // 2. GLTFLoader instanziieren
  const loader = new THREE.GLTFLoader();

  // 3. Progress-Tracking
  loader.load(url, 
    (gltf) => {
      // 4. Asset extrahieren
      const model = gltf.scene;
      
      // 5. Auto-Centering
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.2 / maxDim;
      
      model.scale.multiplyScalar(scale);
      
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.position.y += 0.6;
      
      // 6. Scene hinzufügen
      scene.add(model);
      activeModel = model;
    },
    (progress) => {
      // 7. UI Update
      updateStatus(`Lädt: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
    },
    (error) => {
      // 8. Error Handling
      console.error('Fehler beim Laden:', error);
      updateStatus('❌ Modell konnte nicht geladen werden');
    }
  );
}
```

### 3. AR Session Handling (`xr-test.html`)

```javascript
// AR-Modus Aktivierung
renderer.xr.addEventListener('sessionstart', async () => {
  isARActive = true;
  placeBtn.style.display = 'block'; // Platzierungs-Button zeigen
  
  // AR-spezifische Anpassungen
  scene.background = null; // Transparenz für Live-Kamera
  // GridHelper bereits sichtbar (wird bei Scene-Add hinzugefügt)
});

// AR-Modus Beendigung
renderer.xr.addEventListener('sessionend', () => {
  isARActive = false;
  placeBtn.style.display = 'none';
  scene.background = new THREE.Color(0x1a1a1a); // Zurück zu schwarzem Hintergrund
});
```

### 4. Objekt-Platzierung System

#### Button-Based Approach (aktuell)
```javascript
placeBtn.addEventListener('click', () => {
  if (!isARActive) return;

  // 1. Mesh klonen
  const newMesh = mesh.clone();

  // 2. Position vor Camera setzen
  const cameraWorldPos = camera.getWorldPosition(new THREE.Vector3());
  newMesh.position.copy(cameraWorldPos);
  newMesh.position.z -= 2; // 2 Einheiten vor Camera

  // 3. Scaling
  newMesh.scale.set(0.6, 0.6, 0.6);

  // 4. Schatten erstellen
  const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
  const shadow = new THREE.Mesh(shadowGeo, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.copy(newMesh.position);
  shadow.position.y = newMesh.position.y - 0.6;

  // 5. Scene hinzufügen
  scene.add(newMesh);
  scene.add(shadow);
  placedObjects.push({mesh: newMesh, shadow: shadow});
});
```

**Vorher (Hit-Test Ansatz - problematisch):**
```javascript
// ❌ Komplexer, nicht zuverlässig auf Mobile
// Erforderte: Controller Tracking, Reference Space, Hit Test Source
// Resultat: Reticle sichtbar aber Platzierung unreliabel
```

## Rendering Pipeline

### Desktop Mode
```
Browser.animate() 
  → camera.update()
  → scene.render()
  → Canvas.display()
  → 60 FPS
```

### AR Mode
```
Browser.animate(time, frame) 
  → frame.getViewerPose()
  → camera.matrix.fromArray()
  → scene.render() 
  → XR Compositor
  → Device Display (Overlay)
  → 30-60 FPS (je nach Gerät)
```

## Performance Optimizations

### 1. Memory Management
- ✅ Modelle: Buffer-Geometrien (keine Duplikate)
- ✅ Texturen: Automatisch vom GLTFLoader optimiert
- ✅ Lights: Nur 2 (Ambient + Directional)
- ✅ Helpers: GridHelper (efficient mesh)

### 2. Rendering Optimizations
- ✅ WebGL 2.0 (Hardware Acceleration)
- ✅ Pixel Ratio Anpassung (nicht über 2x)
- ✅ Frustum Culling (Three.js automatic)
- ✅ Efficient ShadowMaterial (keine echten Schatten)

### 3. AR Optimizations
- ✅ Reference Space: 'local' (schneller als 'viewer')
- ✅ Keine Hit-Test Source (vereinfacht Logik)
- ✅ Minimal Geometry für Visuals (Grid, Crosshair)

## Visual Features

### 1. Crosshair (AR Positioning Aid)
```css
#crosshair::before {
  width: 40px;
  height: 2px;
  background: rgba(255, 255, 255, 0.6);
}
/* Horizontal line in center */

#crosshair::after {
  width: 2px;
  height: 40px;
  background: rgba(255, 255, 255, 0.6);
}
/* Vertical line in center */
```

### 2. Ground Grid
```javascript
const gridHelper = new THREE.GridHelper(
  10,           // Size
  20,           // Divisions
  0x4ade80,     // Center line color (green)
  0x666666      // Grid color (gray)
);
gridHelper.position.y = -2.5; // Below objects
```

### 3. Shadow System
```javascript
const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
// Creates soft shadows under placed objects
// Updates position every frame: shadow.position.y = mesh.position.y - 0.6
```

## Browser APIs Verwendet

| API | Zweck | Status |
|-----|-------|--------|
| WebXR | AR Sessions | ✅ Stabil |
| WebGL 2.0 | Rendering | ✅ Stabil |
| FileReader | Local Upload | ✅ Stabil |
| Fetch/XMLHttpRequest | Model Download | ✅ Stabil |
| Geolocation | Nicht verwendet | ⏸️ Optional |
| Accelerometer | Nicht verwendet | ⏸️ Optional |
| Gyroscope | Automatic via XR | ✅ Stabil |

## Fehlerbehandlung

### Model Loading Errors
```javascript
try {
  // GLTFLoader throws on invalid file
  loader.load(url, onSuccess, onProgress, onError);
} catch(e) {
  console.error('Parse error:', e);
  updateStatus('❌ Modell-Format ungültig');
}
```

### AR Session Errors
```javascript
navigator.xr.requestSession('immersive-ar', {
  requiredFeatures: ['hit-test'],
  optionalFeatures: ['dom-overlay']
}).catch((error) => {
  console.error('AR nicht verfügbar:', error);
  // Fallback zu Desktop-3D
});
```

## Skalierungsmöglichkeiten

### Für mehr Performance
- [ ] Instancing für mehrfache Objekte
- [ ] Level of Detail (LOD) für Modelle
- [ ] Texture Compression (KTX2)
- [ ] Web Workers für Model Loading

### Für mehr Features
- [ ] Persistente Platzierungs-Speicherung
- [ ] Multi-Touch Gesten
- [ ] Modell-Animation Support
- [ ] Collaborative AR (WebRTC)

---

**Weitere Details:** Siehe [PROJECT_SPEC.md](PROJECT_SPEC.md)
