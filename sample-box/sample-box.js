import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e8e3da');

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(92, 62, 112);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 7, 0);
controls.minDistance = 70;
controls.maxDistance = 220;

scene.add(new THREE.HemisphereLight(0xf7f1e8, 0x6f6a63, 2.0));

const key = new THREE.DirectionalLight(0xfff6e9, 4.1);
key.position.set(-70, 110, 80);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -100;
key.shadow.camera.right = 100;
key.shadow.camera.top = 120;
key.shadow.camera.bottom = -90;
scene.add(key);

const fill = new THREE.DirectionalLight(0xcbd4df, 1.15);
fill.position.set(90, 45, -80);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffead1, 1.0);
rim.position.set(20, 85, -100);
scene.add(rim);

const floorMat = new THREE.MeshStandardMaterial({ color: '#ded8ce', roughness: 0.96, metalness: 0 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -43;
floor.receiveShadow = true;
scene.add(floor);

const CREAM = '#ECE8DF';
const INK = '#191919';
const W = 28;
const H = 75;
const D = 16;
const T = 0.72;

const cartonMat = new THREE.MeshStandardMaterial({
  color: CREAM,
  roughness: 0.92,
  metalness: 0,
  bumpScale: 0.035
});

const innerMat = new THREE.MeshStandardMaterial({ color: '#D9D3C9', roughness: 0.96, metalness: 0 });

const boxGroup = new THREE.Group();
boxGroup.rotation.y = -0.08;
scene.add(boxGroup);

function panel(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  boxGroup.add(mesh);
  return mesh;
}

// Folding-carton shell, open at the top.
panel(W, H, T, cartonMat, 0, 0, D / 2);
panel(W, H, T, cartonMat, 0, 0, -D / 2);
panel(T, H, D - T, cartonMat, -W / 2, 0, 0);
panel(T, H, D - T, cartonMat, W / 2, 0, 0);
panel(W - T, T, D - T, innerMat, 0, -H / 2, 0);

// Rear hinged closure flap.
const flapPivot = new THREE.Group();
flapPivot.position.set(0, H / 2, -D / 2);
boxGroup.add(flapPivot);

const flap = new THREE.Mesh(new THREE.BoxGeometry(W, D + 1.8, T), cartonMat);
flap.position.y = (D + 1.8) / 2;
flap.castShadow = true;
flap.receiveShadow = true;
flapPivot.add(flap);

// Small tuck tab at the end of the closure flap.
const tuckPivot = new THREE.Group();
tuckPivot.position.set(0, D + 1.8, 0);
flapPivot.add(tuckPivot);
const tuck = new THREE.Mesh(new THREE.BoxGeometry(W - 2.4, 8.5, T * 0.92), cartonMat);
tuck.position.y = 4.25;
tuck.castShadow = true;
tuckPivot.add(tuck);

function canvasTexture(draw, width = 768, height = 2048) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, width, height);
  draw(ctx, width, height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

async function frontTexture() {
  await document.fonts.ready;
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 2048;
  const ctx = c.getContext('2d');
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, c.width, c.height);

  const logo = new Image();
  logo.src = '../assets/twyne-wordmark-tight-black.svg';
  await new Promise((resolve) => {
    logo.onload = resolve;
    logo.onerror = resolve;
  });

  if (logo.naturalWidth) {
    const targetW = 390;
    const ratio = logo.naturalHeight / logo.naturalWidth;
    const targetH = targetW * ratio;
    ctx.drawImage(logo, (c.width - targetW) / 2, (c.height - targetH) / 2, targetW, targetH);
  } else {
    ctx.fillStyle = INK;
    ctx.font = '500 58px Manrope';
    ctx.textAlign = 'center';
    ctx.fillText('TWYNE', c.width / 2, c.height / 2);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

function backTexture() {
  return canvasTexture((ctx, w, h) => {
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '500 56px Manrope';
    ctx.letterSpacing = '4px';
    ctx.fillText('SOTTO VOCE', w / 2, 455);

    ctx.font = '400 38px Manrope';
    ctx.fillText('2ml', w / 2, 560);

    ctx.font = '600 42px Manrope';
    ctx.fillText('WEAR THIS FIRST.', w / 2, 1235);

    ctx.font = '400 28px Manrope';
    ctx.fillText('Open the 50ml only when', w / 2, 1462);
    ctx.fillText("you're sure.", w / 2, 1506);
  });
}

function labelPlane(texture, z, rotY = 0) {
  const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.55, H - 0.55), mat);
  mesh.position.set(0, 0, z);
  mesh.rotation.y = rotY;
  mesh.castShadow = false;
  boxGroup.add(mesh);
  return mesh;
}

const frontTex = await frontTexture();
labelPlane(frontTex, D / 2 + T / 2 + 0.03, 0);
labelPlane(backTexture(), -D / 2 - T / 2 - 0.03, Math.PI);

// 2 ml spray vial.
const vial = new THREE.Group();
scene.add(vial);

const glass = new THREE.MeshPhysicalMaterial({
  color: '#2a211d',
  roughness: 0.18,
  metalness: 0,
  transmission: 0.12,
  transparent: true,
  opacity: 0.92,
  thickness: 1.3,
  ior: 1.46
});

const liquidMat = new THREE.MeshPhysicalMaterial({ color: '#5a3823', roughness: 0.24, transparent: true, opacity: 0.62 });
const blackMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.28, metalness: 0.18 });

const bottle = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.0, 49, 40), glass);
bottle.castShadow = true;
vial.add(bottle);

const liquid = new THREE.Mesh(new THREE.CylinderGeometry(4.25, 4.25, 37, 32), liquidMat);
liquid.position.y = -4.5;
vial.add(liquid);

const collar = new THREE.Mesh(new THREE.CylinderGeometry(5.05, 5.05, 6.0, 36), blackMat);
collar.position.y = 27.4;
collar.castShadow = true;
vial.add(collar);

const actuator = new THREE.Mesh(new THREE.CylinderGeometry(3.45, 3.45, 7.2, 32), blackMat);
actuator.position.y = 33.6;
actuator.castShadow = true;
vial.add(actuator);

const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.35, 16), blackMat);
nozzle.rotation.x = Math.PI / 2;
nozzle.position.set(0, 34.7, 3.55);
vial.add(nozzle);

const vialLabelTex = canvasTexture((ctx, w, h) => {
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 88px Manrope';
  ctx.fillText('TWYNE', w / 2, 720);
  ctx.font = '500 48px Manrope';
  ctx.fillText('SOTTO VOCE', w / 2, 910);
  ctx.font = '400 34px Manrope';
  ctx.fillText('2ml', w / 2, 1015);
}, 512, 1536);

const vialLabel = new THREE.Mesh(
  new THREE.PlaneGeometry(8.3, 25.5),
  new THREE.MeshStandardMaterial({ map: vialLabelTex, roughness: 0.9, metalness: 0 })
);
vialLabel.position.set(0, -2.5, 5.02);
vial.add(vialLabel);

let openAmount = 0.72;
function updateOpen() {
  // Closed = flap flat across top. Open = flap standing upward behind the carton.
  flapPivot.rotation.x = (1 - openAmount) * Math.PI / 2;
  tuckPivot.rotation.x = -openAmount * 0.55;

  vial.position.set(0, -9 + openAmount * 46, 0.15 + openAmount * 1.3);
  vial.rotation.z = -0.055 * openAmount;
  vial.rotation.x = 0.04 * openAmount;
}
updateOpen();

// Fine paper-edge lines.
const edgeMat = new THREE.LineBasicMaterial({ color: 0x9a958d, transparent: true, opacity: 0.22 });
const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, D));
const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
edgeLines.position.y = 0;
boxGroup.add(edgeLines);

function setCamera(pos, target = new THREE.Vector3(0, 8, 0), keyName) {
  camera.position.set(...pos);
  controls.target.copy(target);
  controls.update();
  document.querySelectorAll('.camera-grid .ui-btn').forEach(b => b.classList.remove('active'));
  const active = document.getElementById(keyName);
  if (active) active.classList.add('active');
}

document.getElementById('ctrl-open').addEventListener('input', (e) => {
  openAmount = Number(e.target.value);
  updateOpen();
});

document.getElementById('cam-3q').addEventListener('click', () => setCamera([92, 62, 112], new THREE.Vector3(0, 7, 0), 'cam-3q'));
document.getElementById('cam-front').addEventListener('click', () => setCamera([0, 9, 145], new THREE.Vector3(0, 3, 0), 'cam-front'));
document.getElementById('cam-back').addEventListener('click', () => setCamera([0, 9, -145], new THREE.Vector3(0, 3, 0), 'cam-back'));
document.getElementById('cam-top').addEventListener('click', () => setCamera([0, 150, 74], new THREE.Vector3(0, 5, 0), 'cam-top'));

document.getElementById('btn-render').addEventListener('click', () => {
  renderer.render(scene, camera);
  const link = document.createElement('a');
  link.download = 'TWYNE_matching_sample_box_render.png';
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
});

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
