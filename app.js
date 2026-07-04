import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/ARButton.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4f7fb);
scene.fog = new THREE.Fog(0xf4f7fb, 2, 8);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.set(0, 1.2, 2.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
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
scene.add(dirLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(1.2, 64),
  new THREE.ShadowMaterial({ opacity: 0.2 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0.001;
scene.add(floor);

const grid = new THREE.GridHelper(6, 12, 0x94a3b8, 0x334155);
grid.position.y = 0.002;
scene.add(grid);

const fileInput = document.getElementById('fileInput');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const resetViewBtn = document.getElementById('resetViewBtn');
const statusText = document.getElementById('statusText');

const sampleModelUrl = './Test.glb';
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
    scene.remove(activeModel);
  }

  activeModel = model;
  activeModel.position.set(0, 0, 0);
  activeModel.rotation.set(0, 0, 0);
  activeModel.scale.set(1, 1, 1);
  scene.add(activeModel);
  centerModel();
}

function centerModel() {
  if (!activeModel) return;

  const box = new THREE.Box3().setFromObject(activeModel);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const targetScale = 1.2 / maxDim;

  activeModel.scale.setScalar(targetScale);
  const centered = new THREE.Vector3();
  box.getCenter(centered);
  activeModel.position.sub(centered);
  activeModel.position.y = 0;
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

function loadModelFromUrl(url, label = 'Modell') {
  const loader = new GLTFLoader();
  updateStatus(`Lade ${label}…`);
  console.log(`Lade Modell von: ${url}`);

  loader.load(
    url,
    (gltf) => {
      console.log(`${label} erfolgreich geladen`);
      const model = gltf.scene;
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setModel(model);
      updateStatus(`${label} geladen.`);
    },
    (progress) => {
      const percent = Math.round((progress.loaded / progress.total) * 100);
      updateStatus(`Lade ${label}… ${percent}%`);
    },
    (error) => {
      console.error('Fehler beim Laden des Modells', error);
      updateStatus(`Fehler: ${label} konnte nicht geladen werden.`);
      console.error('Error details:', error.message);
    }
  );
}

function loadModelFromFile(file) {
  if (!file) {
    updateStatus('Keine Datei ausgewählt.');
    return;
  }

  const isGlbOrGltf = file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf');
  if (!isGlbOrGltf) {
    updateStatus('Bitte nur .glb oder .gltf Dateien auswählen.');
    window.alert('Bitte nur .glb oder .gltf Dateien auswählen.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const arrayBuffer = reader.result;
    if (!arrayBuffer) {
      updateStatus('Die Datei konnte nicht gelesen werden.');
      return;
    }

    const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    loadModelFromUrl(url, file.name);
  };

  reader.onerror = () => {
    updateStatus('Die Datei konnte nicht gelesen werden.');
    console.error('FileReader error');
  };

  reader.readAsArrayBuffer(file);
}

fileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
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

const arButton = ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] });
document.body.appendChild(arButton);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
