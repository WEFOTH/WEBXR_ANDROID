import * as THREE from 'https://esm.sh/three@0.160.0';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { ARButton } from 'https://esm.sh/three@0.160.0/examples/jsm/webxr/ARButton.js';

const scene = new THREE.Scene();
const defaultBackground = new THREE.Color(0xf4f7fb);
const defaultFog = new THREE.Fog(0xf4f7fb, 2, 8);
scene.background = defaultBackground;
scene.fog = defaultFog;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.set(0, 1.2, 2.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.6, 0);
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(3, 4, 2);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 12;
dirLight.shadow.camera.left = -3;
dirLight.shadow.camera.right = 3;
dirLight.shadow.camera.top = 3;
dirLight.shadow.camera.bottom = -3;
scene.add(dirLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(1.2, 64),
  new THREE.ShadowMaterial({ opacity: 0.2 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0.001;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(6, 12, 0x94a3b8, 0x334155);
grid.position.y = 0.002;
scene.add(grid);

const hud = document.getElementById('hud');
const fileInput = document.getElementById('fileInput');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const resetViewBtn = document.getElementById('resetViewBtn');
const statusText = document.getElementById('statusText');
const precisionText = document.getElementById('precisionText');
const selectionText = document.getElementById('selectionText');
const prevObjBtn = document.getElementById('prevObjBtn');
const nextObjBtn = document.getElementById('nextObjBtn');
const snapToggle = document.getElementById('snapToggle');
const angleStepSelect = document.getElementById('angleStep');

const sampleModelUrl = '../assets/Test.glb';

// modelRoot hält das zentrierte Modell; AR-Klone kopieren die ganze Gruppe.
const modelRoot = new THREE.Group();
scene.add(modelRoot);
let activeModel = null;

function createDefaultModel() {
  const group = new THREE.Group();

  const geometry = new THREE.BoxGeometry(0.35, 0.35, 0.35);
  const material = new THREE.MeshStandardMaterial({
    color: 0x4f46e5,
    emissive: 0x1e1b4b,
    emissiveIntensity: 0.1,
    metalness: 0.2,
    roughness: 0.35,
  });

  const cube = new THREE.Mesh(geometry, material);
  cube.position.y = 0.18;
  group.add(cube);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 0.08, 24),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 })
  );
  base.position.y = 0.04;
  group.add(base);

  return group;
}

function setModel(model) {
  if (activeModel) {
    modelRoot.remove(activeModel);
  }

  activeModel = model;
  activeModel.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  modelRoot.add(activeModel);
  fitModelToScene();
}

function fitModelToScene() {
  if (!activeModel) return;

  activeModel.position.set(0, 0, 0);
  activeModel.rotation.set(0, 0, 0);
  activeModel.scale.set(1, 1, 1);

  const box = new THREE.Box3().setFromObject(activeModel);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const targetScale = 1.2 / maxDim;

  activeModel.scale.setScalar(targetScale);

  // Auf x/z zentrieren, Unterkante auf den Boden (y = 0) setzen.
  const center = box.getCenter(new THREE.Vector3());
  activeModel.position.set(
    -center.x * targetScale,
    -box.min.y * targetScale,
    -center.z * targetScale
  );
}

function resetView() {
  camera.position.set(0, 1.2, 2.2);
  controls.target.set(0, 0.6, 0);
  controls.update();
}

function updateStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function loadModelFromUrl(url, label = 'Modell', revokeAfterLoad = false) {
  const loader = new GLTFLoader();
  updateStatus(`Lade ${label}…`);
  console.log(`Lade Modell von: ${url}`);

  loader.load(
    url,
    (gltf) => {
      console.log(`${label} erfolgreich geladen`);
      setModel(gltf.scene);
      updateStatus(`${label} geladen.`);
      if (revokeAfterLoad) URL.revokeObjectURL(url);
    },
    (progress) => {
      if (progress.total > 0) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        updateStatus(`Lade ${label}… ${percent}%`);
      }
    },
    (error) => {
      console.error('Fehler beim Laden des Modells', error);
      updateStatus(`Fehler: ${label} konnte nicht geladen werden.`);
      if (revokeAfterLoad) URL.revokeObjectURL(url);
    }
  );
}

function loadModelFromFile(file) {
  if (!file) {
    updateStatus('Keine Datei ausgewählt.');
    return;
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith('.glb') && !name.endsWith('.gltf')) {
    updateStatus('Bitte nur .glb oder .gltf Dateien auswählen.');
    window.alert('Bitte nur .glb oder .gltf Dateien auswählen.');
    return;
  }

  if (name.endsWith('.gltf')) {
    updateStatus('Hinweis: .gltf mit externen Texturen/Buffern funktioniert hier nicht – .glb ist zuverlässiger.');
  }

  const url = URL.createObjectURL(file);
  loadModelFromUrl(url, file.name, true);
}

fileInput.addEventListener('change', (event) => {
  const files = event.target.files;
  const file = files && files[0];
  if (file) {
    loadModelFromFile(file);
  } else {
    updateStatus('Keine Datei ausgewählt.');
  }
});

loadSampleBtn.addEventListener('click', () => {
  loadModelFromUrl(sampleModelUrl, 'Testmodell');
});

resetViewBtn.addEventListener('click', resetView);

setModel(createDefaultModel());
resetView();
updateStatus('Klicke auf einen Button, um ein Modell zu laden.');

// --- Augmented Reality ---

const arButton = ARButton.createButton(renderer, {
  optionalFeatures: ['hit-test', 'dom-overlay'],
  domOverlay: { root: document.body },
});
document.body.appendChild(arButton);

// Taps auf das HUD sollen kein Objekt platzieren.
hud.addEventListener('beforexrselect', (event) => event.preventDefault());

const reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.08, 0.11, 32).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({ color: 0x4f46e5 })
);
reticle.matrixAutoUpdate = false;
reticle.visible = false;
scene.add(reticle);

let hitTestSource = null;
const placedObjects = [];
let selectedObjectIndex = -1;
let isArSessionActive = false;

const maxPlacedObjects = 24;
const snapStep = 0.005;
const fallbackStep = 0.01;
const arPixelRatioCap = 1.5;

const controller = renderer.xr.getController(0);
controller.addEventListener('select', placeModel);
scene.add(controller);

function toDegrees(rad) {
  return (rad * 180) / Math.PI;
}

function getSelectedObject() {
  if (selectedObjectIndex < 0 || selectedObjectIndex >= placedObjects.length) {
    return null;
  }
  return placedObjects[selectedObjectIndex];
}

function updatePrecisionText() {
  const selected = getSelectedObject();
  if (!precisionText) return;

  if (!selected) {
    precisionText.textContent = 'Pos: 0.000, 0.000, 0.000 | Rot: 0.0, 0.0, 0.0';
    return;
  }

  const p = selected.group.position;
  const r = selected.group.rotation;
  precisionText.textContent =
    `Pos: ${p.x.toFixed(3)}, ${p.y.toFixed(3)}, ${p.z.toFixed(3)} | Rot: ${toDegrees(r.x).toFixed(1)}, ${toDegrees(r.y).toFixed(1)}, ${toDegrees(r.z).toFixed(1)}`;
}

function updateSelectionText() {
  if (!selectionText) return;
  if (selectedObjectIndex === -1 || placedObjects.length === 0) {
    selectionText.textContent = `Auswahl: kein Objekt (${placedObjects.length} platziert)`;
  } else {
    selectionText.textContent = `Auswahl: Objekt ${selectedObjectIndex + 1} von ${placedObjects.length}`;
  }
}

function setObjectHighlight(placed, active) {
  placed.axes.visible = active;
  placed.group.traverse((child) => {
    if (!child.isMesh || !child.material || !child.material.color) return;
    const emissive = child.material.emissive;
    if (active) {
      if (emissive && emissive.setHex) emissive.setHex(0x111111);
      child.material.emissiveIntensity = 0.35;
    } else {
      if (emissive && emissive.setHex) emissive.setHex(0x000000);
      child.material.emissiveIntensity = 0;
    }
  });
}

function selectObject(index) {
  const prev = getSelectedObject();
  if (prev) {
    setObjectHighlight(prev, false);
  }

  if (placedObjects.length === 0) {
    selectedObjectIndex = -1;
  } else {
    selectedObjectIndex = Math.max(0, Math.min(index, placedObjects.length - 1));
  }

  const next = getSelectedObject();
  if (next) {
    setObjectHighlight(next, true);
  }

  updateSelectionText();
  updatePrecisionText();
}

function cycleSelection(step) {
  if (placedObjects.length === 0) {
    updateStatus('Kein platziertes Objekt vorhanden.');
    return;
  }

  const baseIndex = selectedObjectIndex === -1 ? 0 : selectedObjectIndex;
  const nextIndex = (baseIndex + step + placedObjects.length) % placedObjects.length;
  selectObject(nextIndex);
}

function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

function moveSelectedObject(axis, direction) {
  const selected = getSelectedObject();
  if (!selected) {
    updateStatus('Bitte zuerst ein Objekt auswaehlen.');
    return;
  }

  const useSnap = snapToggle ? snapToggle.checked : true;
  const step = useSnap ? snapStep : fallbackStep;
  selected.group.position[axis] += direction * step;
  if (useSnap) {
    selected.group.position[axis] = roundToStep(selected.group.position[axis], step);
  }

  updatePrecisionText();
}

function rotateSelectedObject(axis, direction) {
  const selected = getSelectedObject();
  if (!selected) {
    updateStatus('Bitte zuerst ein Objekt auswaehlen.');
    return;
  }

  const stepDeg = Number(angleStepSelect ? angleStepSelect.value : 5);
  const stepRad = THREE.MathUtils.degToRad(stepDeg);
  selected.group.rotation[axis] += direction * stepRad;

  if (snapToggle ? snapToggle.checked : true) {
    selected.group.rotation[axis] = roundToStep(selected.group.rotation[axis], stepRad);
  }

  updatePrecisionText();
}

function createPlacedAxes() {
  const axes = new THREE.AxesHelper(0.35);
  axes.visible = false;
  axes.renderOrder = 10;
  axes.traverse((child) => {
    if (child.isLine) {
      child.material.depthTest = false;
      child.material.transparent = true;
      child.material.opacity = 0.95;
    }
  });
  return axes;
}

function placeModel() {
  if (!renderer.xr.isPresenting || !activeModel) return;

  if (placedObjects.length >= maxPlacedObjects) {
    updateStatus(`Maximal ${maxPlacedObjects} Objekte erreicht. Bitte ein Objekt entfernen oder Session neu starten.`);
    return;
  }

  const clone = modelRoot.clone(true);
  clone.visible = true;

  clone.traverse((child) => {
    if (child.isMesh) {
      // Schattencasting im AR-Modus begrenzen, um Last bei grossen GLB zu reduzieren.
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });

  if (reticle.visible) {
    clone.position.setFromMatrixPosition(reticle.matrix);
  } else {
    // Fallback ohne Hit-Test: 1,5 m in Blickrichtung platzieren.
    const xrCamera = renderer.xr.getCamera();
    const direction = new THREE.Vector3();
    xrCamera.getWorldDirection(direction);
    xrCamera.getWorldPosition(clone.position);
    clone.position.addScaledVector(direction, 1.5);
  }

  const axes = createPlacedAxes();
  clone.add(axes);

  scene.add(clone);
  placedObjects.push({ group: clone, axes });
  selectObject(placedObjects.length - 1);
  updateStatus(`${placedObjects.length} Objekt(e) platziert – erneut tippen fuer mehr.`);
}

renderer.xr.addEventListener('sessionstart', () => {
  isArSessionActive = true;

  // Hintergrund/Fog würden das Kamerabild übermalen.
  scene.background = null;
  scene.fog = null;
  grid.visible = false;
  floor.visible = false;
  modelRoot.visible = false;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, arPixelRatioCap));

  const session = renderer.xr.getSession();
  if (session.requestHitTestSource) {
    session
      .requestReferenceSpace('viewer')
      .then((space) => session.requestHitTestSource({ space }))
      .then((source) => {
        hitTestSource = source;
      })
      .catch(() => {
        hitTestSource = null;
      });
  }

  updateStatus('AR aktiv: Ring suchen, tippen zum Platzieren, dann ueber XYZ-Buttons fein ausrichten.');
  updateSelectionText();
  updatePrecisionText();
});

renderer.xr.addEventListener('sessionend', () => {
  isArSessionActive = false;

  scene.background = defaultBackground;
  scene.fog = defaultFog;
  grid.visible = true;
  floor.visible = true;
  modelRoot.visible = true;
  reticle.visible = false;
  hitTestSource = null;

  renderer.setPixelRatio(window.devicePixelRatio);

  placedObjects.forEach((obj) => scene.remove(obj.group));
  placedObjects.length = 0;
  selectedObjectIndex = -1;

  updateStatus('AR beendet.');
  updateSelectionText();
  updatePrecisionText();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (isArSessionActive) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, arPixelRatioCap));
  } else {
    renderer.setPixelRatio(window.devicePixelRatio);
  }
});

if (prevObjBtn) prevObjBtn.addEventListener('click', () => cycleSelection(-1));
if (nextObjBtn) nextObjBtn.addEventListener('click', () => cycleSelection(1));

const moveXNegBtn = document.getElementById('moveXNeg');
const moveXPosBtn = document.getElementById('moveXPos');
const moveYNegBtn = document.getElementById('moveYNeg');
const moveYPosBtn = document.getElementById('moveYPos');
const moveZNegBtn = document.getElementById('moveZNeg');
const moveZPosBtn = document.getElementById('moveZPos');
const rotXNegBtn = document.getElementById('rotXNeg');
const rotXPosBtn = document.getElementById('rotXPos');
const rotYNegBtn = document.getElementById('rotYNeg');
const rotYPosBtn = document.getElementById('rotYPos');
const rotZNegBtn = document.getElementById('rotZNeg');
const rotZPosBtn = document.getElementById('rotZPos');

if (moveXNegBtn) moveXNegBtn.addEventListener('click', () => moveSelectedObject('x', -1));
if (moveXPosBtn) moveXPosBtn.addEventListener('click', () => moveSelectedObject('x', 1));
if (moveYNegBtn) moveYNegBtn.addEventListener('click', () => moveSelectedObject('y', -1));
if (moveYPosBtn) moveYPosBtn.addEventListener('click', () => moveSelectedObject('y', 1));
if (moveZNegBtn) moveZNegBtn.addEventListener('click', () => moveSelectedObject('z', -1));
if (moveZPosBtn) moveZPosBtn.addEventListener('click', () => moveSelectedObject('z', 1));

if (rotXNegBtn) rotXNegBtn.addEventListener('click', () => rotateSelectedObject('x', -1));
if (rotXPosBtn) rotXPosBtn.addEventListener('click', () => rotateSelectedObject('x', 1));
if (rotYNegBtn) rotYNegBtn.addEventListener('click', () => rotateSelectedObject('y', -1));
if (rotYPosBtn) rotYPosBtn.addEventListener('click', () => rotateSelectedObject('y', 1));
if (rotZNegBtn) rotZNegBtn.addEventListener('click', () => rotateSelectedObject('z', -1));
if (rotZPosBtn) rotZPosBtn.addEventListener('click', () => rotateSelectedObject('z', 1));

if (snapToggle) {
  snapToggle.addEventListener('change', () => {
    updateStatus(snapToggle.checked ? 'Snap aktiv: 0.5 cm Raster' : 'Snap deaktiviert: freie Schritte');
  });
}

if (angleStepSelect) {
  angleStepSelect.addEventListener('change', () => {
    updateStatus(`Rotationsschritt: ${angleStepSelect.value} Grad`);
  });
}

updateSelectionText();
updatePrecisionText();

function animate(timestamp, frame) {
  if (frame && hitTestSource) {
    const hits = frame.getHitTestResults(hitTestSource);
    if (hits.length > 0) {
      const pose = hits[0].getPose(renderer.xr.getReferenceSpace());
      reticle.visible = true;
      reticle.matrix.fromArray(pose.transform.matrix);
    } else {
      reticle.visible = false;
    }
  }

  if (!renderer.xr.isPresenting) {
    controls.update();
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
