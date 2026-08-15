import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#dedbd4');

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(84, 58, 108);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 5, 0);
controls.minDistance = 68;
controls.maxDistance = 220;

scene.add(new THREE.HemisphereLight(0xf7f2e8, 0x5c5955, 2.2));

const key = new THREE.DirectionalLight(0xfff7eb, 4.1);
key.position.set(-65, 105, 75);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -100;
key.shadow.camera.right = 100;
key.shadow.camera.top = 120;
key.shadow.camera.bottom = -100;
scene.add(key);

const fill = new THREE.DirectionalLight(0xc8d1dc, 1.2);
fill.position.set(90, 42, -70);
scene.add(fill);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: '#d5d1c8', roughness: 0.98 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -45;
floor.receiveShadow = true;
scene.add(floor);

const W = 22;
const H = 78;
const D = 15;
const T = 0.7;
const BLACK = '#171717';
const CREAM = '#E7E4DD';
const INK = '#F0ECE4';

const cartonMat = new THREE.MeshStandardMaterial({ color: BLACK, roughness: 0.93, metalness: 0.01 });
const edgeMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.88 });
const creamMat = new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.95, metalness: 0 });
const glassMat = new THREE.MeshPhysicalMaterial({
  color: '#241d1a', roughness: 0.18, transmission: 0.08, transparent: true,
  opacity: 0.95, thickness: 1.1, ior: 1.46
});
const sprayMat = new THREE.MeshStandardMaterial({ color: '#0c0c0c', roughness: 0.3, metalness: 0.2 });

const box = new THREE.Group();
box.rotation.y = -0.08;
scene.add(box);

function makePanel(w, h, d, mat, x, y, z, parent = box) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// Slim rectangular folding-carton shell.
makePanel(W, H, T, cartonMat, 0, 0, D / 2);
makePanel(W, H, T, cartonMat, 0, 0, -D / 2);
makePanel(T, H, D - T, cartonMat, -W / 2, 0, 0);
makePanel(T, H, D - T, cartonMat, W / 2, 0, 0);
makePanel(W - T, T, D - T, edgeMat, 0, -H / 2, 0);

// Cream inner cradle visible at the opening, like the reference.
const inner = new THREE.Group();
box.add(inner);
makePanel(W - 3.2, 8.5, D - 3.0, creamMat, 0, H / 2 - 7.0, 0, inner);
makePanel(W - 5.2, 2.0, D - 4.4, new THREE.MeshStandardMaterial({ color: '#d6d2ca', roughness: 0.97 }), 0, H / 2 - 2.8, 0, inner);

// Main top flap hinged from the back edge.
const flapPivot = new THREE.Group();
flapPivot.position.set(0, H / 2, -D / 2);
box.add(flapPivot);

const flap = makePanel(W, D + 0.6, T, cartonMat, 0, (D + 0.6) / 2, 0, flapPivot);

const tuckPivot = new THREE.Group();
tuckPivot.position.set(0, D + 0.6, 0);
flapPivot.add(tuckPivot);
const tuck = makePanel(W - 2.0, 9.2, T * 0.9, cartonMat, 0, 4.6, 0, tuckPivot);

// Two small side dust flaps to echo real folding-carton construction.
const leftDust = new THREE.Group();
leftDust.position.set(-W / 2, H / 2 - 0.4, 0);
box.add(leftDust);
const ld = makePanel(D - 2.3, 6.2, T * 0.8, cartonMat, 0, 3.1, 0, leftDust);
ld.rotation.z = Math.PI / 2;

const rightDust = new THREE.Group();
rightDust.position.set(W / 2, H / 2 - 0.4, 0);
box.add(rightDust);
const rd = makePanel(D - 2.3, 6.2, T * 0.8, cartonMat, 0, 3.1, 0, rightDust);
rd.rotation.z = -Math.PI / 2;

// 2ml sample vial inside.
const vial = new THREE.Group();
box.add(vial);

const bottle = new THREE.Mesh(new THREE.CylinderGeometry(4.7, 4.7, 50, 40), glassMat);
bottle.castShadow = true;
vial.add(bottle);

const collar = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.8, 5.6, 36), sprayMat);
collar.position.y = 27.2;
collar.castShadow = true;
vial.add(collar);

const actuator = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 7.2, 32), sprayMat);
actuator.position.y = 33.4;
actuator.castShadow = true;
vial.add(actuator);

const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.35, 16), sprayMat);
nozzle.rotation.x = Math.PI / 2;
nozzle.position.set(0, 34.4, 3.35);
vial.add(nozzle);

function makeCanvasTexture(draw, w = 700, h = 1800) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

async function frontTexture() {
  await document.fonts.ready;
  const c = document.createElement('canvas');
  c.width = 700;
  c.height = 1800;
  const ctx = c.getContext('2d');
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, c.width, c.height);

  const logo = new Image();
  logo.src = '../assets/twyne-wordmark-new-cream.svg';
  await new Promise(resolve => { logo.onload = resolve; logo.onerror = resolve; });

  if (logo.naturalWidth) {
    const targetW = 310;
    const ratio = logo.naturalHeight / logo.naturalWidth;
    const targetH = targetW * ratio;
    ctx.drawImage(logo, (c.width - targetW) / 2, 1390, targetW, targetH);
  } else {
    ctx.fillStyle = INK;
    ctx.font = '500 44px Manrope';
    ctx.textAlign = 'center';
    ctx.fillText('TWYNE', c.width / 2, 1470);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

function backTexture() {
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '500 42px Manrope';
    ctx.fillText('SOTTO VOCE', w / 2, 420);
    ctx.font = '400 30px Manrope';
    ctx.fillText('2ml', w / 2, 500);
    ctx.font = '600 34px Manrope';
    ctx.fillText('WEAR THIS FIRST.', w / 2, 1250);
  });
}

function addArtwork(texture, z, ry = 0) {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.45, H - 0.45),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.93, metalness: 0 })
  );
  plane.position.set(0, 0, z);
  plane.rotation.y = ry;
  box.add(plane);
}

addArtwork(await frontTexture(), D / 2 + T / 2 + 0.025, 0);
addArtwork(backTexture(), -D / 2 - T / 2 - 0.025, Math.PI);

// Minimal cream vial label.
const vialLabelTex = makeCanvasTexture((ctx, w, h) => {
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#171717';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 70px Manrope';
  ctx.fillText('TWYNE', w / 2, 650);
  ctx.font = '500 38px Manrope';
  ctx.fillText('SOTTO VOCE', w / 2, 820);
  ctx.font = '400 28px Manrope';
  ctx.fillText('2ml', w / 2, 900);
}, 500, 1500);

const vialLabel = new THREE.Mesh(
  new THREE.PlaneGeometry(8.0, 23.0),
  new THREE.MeshStandardMaterial({ map: vialLabelTex, roughness: 0.94 })
);
vialLabel.position.set(0, -3.5, 4.74);
vial.add(vialLabel);

let openAmount = 0.68;
function updateOpen() {
  // 0 = shut, 1 = upright open flap.
  flapPivot.rotation.x = (1 - openAmount) * Math.PI / 2;
  tuckPivot.rotation.x = -0.62 * openAmount;
  leftDust.rotation.z = -0.5 * openAmount;
  rightDust.rotation.z = 0.5 * openAmount;

  // Vial lifts only slightly when open, keeping the reference silhouette.
  vial.position.set(0, -6 + openAmount * 27, 0.15);
  vial.rotation.z = -0.018 * openAmount;
}
updateOpen();

function setCamera(pos, target, id) {
  camera.position.set(...pos);
  controls.target.set(...target);
  controls.update();
  document.querySelectorAll('.camera-grid .ui-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

document.getElementById('ctrl-open').addEventListener('input', e => {
  openAmount = Number(e.target.value);
  updateOpen();
});
document.getElementById('cam-3q').addEventListener('click', () => setCamera([84,58,108],[0,5,0],'cam-3q'));
document.getElementById('cam-front').addEventListener('click', () => setCamera([0,5,138],[0,2,0],'cam-front'));
document.getElementById('cam-side').addEventListener('click', () => setCamera([128,10,0],[0,2,0],'cam-side'));
document.getElementById('cam-top').addEventListener('click', () => setCamera([0,145,66],[0,4,0],'cam-top'));

document.getElementById('btn-render').addEventListener('click', () => {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.download = 'TWYNE_matching_sample_box_v2.png';
  a.href = renderer.domElement.toDataURL('image/png');
  a.click();
});

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
