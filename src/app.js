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
const viewModeSelect = document.getElementById('viewModeSelect');
const objectSelect = document.getElementById('objectSelect');
const scaleSlider = document.getElementById('scaleSlider');
const scaleValue = document.getElementById('scaleValue');

const sampleModelUrl = '../assets/Test.glb';
const viewModes = ['original', 'color', 'wireframe', 'metall', 'matt'];
const viewModeLabels = {
  original: 'Original',
  color: 'Farbe',
  wireframe: 'Wireframe',
  metall: 'Metall',
  matt: 'Matt',
};
const selectionTint = new THREE.Color(0xfacc15);

// modelRoot hält das zentrierte Modell; AR-Klone kopieren die ganze Gruppe.
const modelRoot = new THREE.Group();
scene.add(modelRoot);
let activeModel = null;
let currentViewMode = 'original';
let currentScaleFactor = 1;

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

function updateScaleText(value) {
  if (scaleValue) {
    scaleValue.textContent = `${value.toFixed(2)}×`;
  }
  if (precisionText) {
    precisionText.textContent = `Skalierung: ${value.toFixed(2)}×`;
  }
}

function updateViewModeText(mode) {
  if (viewModeSelect) {
    viewModeSelect.value = mode;
  }
}

function applyViewModeToNode(node, mode) {
  if (!node) return;

  node.traverse((child) => {
    if (!child.isMesh) return;

    if (!child.baseMaterial) {
      child.baseMaterial = child.material.clone();
    }
    if (!child.shadeMaterial) {
      child.shadeMaterial = child.material.clone();
    }

    const material = mode === 'original' ? child.baseMaterial : child.shadeMaterial;
    if (mode !== 'original') {
      material.color.copy(child.baseMaterial.color || new THREE.Color(0x4f46e5));
      material.wireframe = mode === 'wireframe';
      material.transparent = mode === 'matt' ? false : material.transparent;
      material.opacity = mode === 'matt' ? 1 : material.opacity;
      if (mode === 'metall') {
        material.metalness = 1;
        material.roughness = 0.15;
      } else if (mode === 'matt') {
        material.metalness = 0;
        material.roughness = 1;
      } else {
        material.metalness = 0.35;
        material.roughness = 0.35;
      }
      material.needsUpdate = true;
    }

    child.material = material;
  });
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
updateScaleText(currentScaleFactor);
updateViewModeText(currentViewMode);

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
const arPixelRatioCap = 1.5;

const placementGrid = new THREE.GridHelper(0.5, 10, 0x4ade80, 0x4ade80);
placementGrid.visible = false;
placementGrid.renderOrder = 5;
scene.add(placementGrid);
const placementGridPosition = new THREE.Vector3();
const placementGridQuaternion = new THREE.Quaternion();
const placementGridScale = new THREE.Vector3();

const controller = renderer.xr.getController(0);
const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();

function selectObjectFromTap() {
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  const hits = raycaster.intersectObjects(placedObjects.map((obj) => obj.group), true);
  if (hits.length === 0) {
    return false;
  }

  let target = hits[0].object;
  let selected = null;
  while (target && !selected) {
    selected = placedObjects.find((obj) => obj.group === target) || null;
    target = target.parent;
  }

  if (selected) {
    selectObject(placedObjects.indexOf(selected));
    updateStatus('Objekt ausgewählt.');
    return true;
  }

  return false;
}

controller.addEventListener('select', () => {
  if (selectObjectFromTap()) return;
  placeModel();
});
scene.add(controller);

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
    precisionText.textContent = `Skalierung: ${currentScaleFactor.toFixed(2)}×`;
    return;
  }

  precisionText.textContent = `Skalierung: ${selected.scaleFactor.toFixed(2)}× | Ansicht: ${viewModeLabels[selected.viewMode] || selected.viewMode}`;
}

function updateSelectionText() {
  if (!selectionText) return;
  if (selectedObjectIndex === -1 || placedObjects.length === 0) {
    selectionText.textContent = `Auswahl: kein Objekt (${placedObjects.length} platziert)`;
  } else {
    selectionText.textContent = `Auswahl: Objekt ${selectedObjectIndex + 1} von ${placedObjects.length}`;
  }
}

function syncObjectDropdown() {
  if (!objectSelect) return;

  objectSelect.innerHTML = '';
  const noneOption = document.createElement('option');
  noneOption.value = '';
  noneOption.textContent = 'Kein Objekt';
  objectSelect.appendChild(noneOption);

  placedObjects.forEach((_, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `Objekt ${index + 1}`;
    objectSelect.appendChild(option);
  });

  if (selectedObjectIndex >= 0) {
    objectSelect.value = String(selectedObjectIndex);
  } else {
    objectSelect.value = '';
  }

  objectSelect.disabled = placedObjects.length === 0;
}

function setObjectHighlight(placed, active) {
  placed.axes.visible = active;
  placed.group.traverse((child) => {
    if (!child.isMesh || !child.material || !child.material.color) return;
    if (active) {
      child._selectionState = {
        color: child.material.color.clone(),
        emissive: child.material.emissive ? child.material.emissive.clone() : null,
        emissiveIntensity: child.material.emissiveIntensity,
      };
    }

    const saved = child._selectionState;
    if (active) {
      child.material.color.copy(selectionTint);
      if (child.material.emissive && child.material.emissive.setHex) {
        child.material.emissive.setHex(0x3b2f00);
      }
      child.material.emissiveIntensity = 0.4;
    } else {
      if (saved) {
        child.material.color.copy(saved.color);
        if (saved.emissive && child.material.emissive) {
          child.material.emissive.copy(saved.emissive);
        }
        child.material.emissiveIntensity = saved.emissiveIntensity || 0;
      }
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
    currentViewMode = next.viewMode || currentViewMode;
    currentScaleFactor = next.scaleFactor || currentScaleFactor;
    if (scaleSlider) {
      scaleSlider.value = currentScaleFactor;
    }
    updateScaleText(currentScaleFactor);
    updateViewModeText(currentViewMode);
    setObjectHighlight(next, true);
  }

  updateSelectionText();
  updatePrecisionText();
  syncObjectDropdown();
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

function applyPlacementSettingsToNode(node, viewMode, scaleFactor) {
  applyViewModeToNode(node, viewMode);
  node.scale.setScalar(scaleFactor);
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
  applyPlacementSettingsToNode(clone, currentViewMode, currentScaleFactor);

  scene.add(clone);
  placedObjects.push({ group: clone, axes, viewMode: currentViewMode, scaleFactor: currentScaleFactor });
  selectObject(placedObjects.length - 1);
  updateStatus(`${placedObjects.length} Objekt(e) platziert – erneut tippen fuer mehr.`);
}

renderer.xr.addEventListener('sessionstart', () => {
  isArSessionActive = true;
  document.body.classList.add('ar-active');

  // Hintergrund/Fog würden das Kamerabild übermalen.
  scene.background = null;
  scene.fog = null;
  grid.visible = false;
  floor.visible = false;
  modelRoot.visible = false;
  placementGrid.visible = false;

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

  updateStatus('AR aktiv: Ring suchen und tippen zum Platzieren oder Objekt antippen zum Auswählen.');
  updateSelectionText();
  updatePrecisionText();
});

renderer.xr.addEventListener('sessionend', () => {
  isArSessionActive = false;
  document.body.classList.remove('ar-active');

  scene.background = defaultBackground;
  scene.fog = defaultFog;
  grid.visible = true;
  floor.visible = true;
  modelRoot.visible = true;
  reticle.visible = false;
  placementGrid.visible = false;
  hitTestSource = null;

  renderer.setPixelRatio(window.devicePixelRatio);

  placedObjects.forEach((obj) => scene.remove(obj.group));
  placedObjects.length = 0;
  selectedObjectIndex = -1;

  updateStatus('AR beendet.');
  updateSelectionText();
  updatePrecisionText();
  syncObjectDropdown();
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

if (viewModeSelect) {
  viewModeSelect.addEventListener('change', () => {
    currentViewMode = viewModeSelect.value;
    updateViewModeText(currentViewMode);

    const selected = getSelectedObject();
    if (selected) {
      selected.viewMode = currentViewMode;
      applyViewModeToNode(selected.group, selected.viewMode);
      setObjectHighlight(selected, true);
    }

    updateStatus(`Ansicht: ${viewModeLabels[currentViewMode] || currentViewMode}`);
  });
}

if (objectSelect) {
  objectSelect.addEventListener('change', () => {
    const value = objectSelect.value;
    if (value === '') {
      selectObject(-1);
      return;
    }
    selectObject(Number(value));
  });
}

if (scaleSlider) {
  scaleSlider.addEventListener('input', () => {
    currentScaleFactor = Number(scaleSlider.value);
    updateScaleText(currentScaleFactor);

    const selected = getSelectedObject();
    if (selected) {
      selected.scaleFactor = currentScaleFactor;
      selected.group.scale.setScalar(currentScaleFactor);
      updateStatus(`Skalierung: ${currentScaleFactor.toFixed(2)}×`);
    }
  });
}

updateSelectionText();
updatePrecisionText();
syncObjectDropdown();

function animate(timestamp, frame) {
  if (frame && hitTestSource) {
    const hits = frame.getHitTestResults(hitTestSource);
    if (hits.length > 0) {
      const pose = hits[0].getPose(renderer.xr.getReferenceSpace());
      reticle.visible = true;
      reticle.matrix.fromArray(pose.transform.matrix);

      placementGrid.visible = true;
      placementGrid.matrix.fromArray(pose.transform.matrix);
      placementGrid.matrix.decompose(placementGridPosition, placementGridQuaternion, placementGridScale);
      placementGrid.position.copy(placementGridPosition);
      placementGrid.quaternion.copy(placementGridQuaternion);
      placementGrid.position.y += 0.002;
    } else {
      reticle.visible = false;
      placementGrid.visible = false;
    }
  }

  if (!renderer.xr.isPresenting) {
    controls.update();
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
