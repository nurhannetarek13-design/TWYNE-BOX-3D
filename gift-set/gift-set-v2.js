import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// TWYNE GIFT SET — v2
// Lid + base are equal in footprint, completely separate, and meet flush.
// 1 Three.js unit = 1 mm.

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0a);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2500);
camera.position.set(245, 180, 255);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 15, 0);
controls.minDistance = 120;
controls.maxDistance = 700;

scene.add(new THREE.HemisphereLight(0xf3efe6, 0x252521, 1.25));

const key = new THREE.DirectionalLight(0xfff1df, 2.15);
key.position.set(190, 310, 200);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -300;
key.shadow.camera.right = 300;
key.shadow.camera.top = 300;
key.shadow.camera.bottom = -300;
scene.add(key);

const fill = new THREE.DirectionalLight(0xe7ecff, 0.9);
fill.position.set(-250, 180, 120);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffd6b6, 1.2);
rim.position.set(40, 180, -260);
scene.add(rim);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1200, 1200),
  new THREE.ShadowMaterial({ opacity: 0.19 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -13;
ground.receiveShadow = true;
scene.add(ground);

function noiseTexture(base, amp = 8, fibres = false) {
  const size = 1024;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const c = new THREE.Color(base);
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * amp;
    img.data[i] = Math.max(0, Math.min(255, r + n));
    img.data[i + 1] = Math.max(0, Math.min(255, g + n));
    img.data[i + 2] = Math.max(0, Math.min(255, b + n));
  }
  ctx.putImageData(img, 0, 0);

  if (fibres) {
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#8f8b83';
    ctx.lineWidth = 1;
    for (let y = 0; y < size; y += 7) {
      ctx.beginPath();
      ctx.moveTo(0, y + (Math.random() - 0.5) * 2);
      ctx.lineTo(size, y + (Math.random() - 0.5) * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.075;
    for (let x = 0; x < size; x += 11) {
      ctx.beginPath();
      ctx.moveTo(x + (Math.random() - 0.5) * 2, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 2, size);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.6, 2.0);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const linenMat = new THREE.MeshStandardMaterial({
  map: noiseTexture(0xE7E4DD, 6, true),
  roughness: 0.98,
  metalness: 0,
});

const mineralMat = new THREE.MeshStandardMaterial({
  map: noiseTexture(0x4D4D49, 5, false),
  roughness: 0.90,
  metalness: 0,
});

const insertMat = new THREE.MeshStandardMaterial({
  color: 0xe3e0d8,
  roughness: 0.97,
  metalness: 0,
});

const recessMat = new THREE.MeshStandardMaterial({
  color: 0x272724,
  roughness: 0.99,
  metalness: 0,
});

const capMat = new THREE.MeshStandardMaterial({
  color: 0x171715,
  roughness: 0.52,
  metalness: 0.08,
});

const liquidMat = new THREE.MeshPhysicalMaterial({
  color: 0xe4d5b3,
  roughness: 0.08,
  transmission: 0.54,
  transparent: true,
  opacity: 0.88,
  ior: 1.35,
});

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.06,
  transmission: 0.94,
  transparent: true,
  opacity: 0.44,
  thickness: 1.1,
  ior: 1.5,
});

function roundedBox(w, h, d, r, mat) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 5, r), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function smallTextTexture(text) {
  const cv = document.createElement('canvas');
  cv.width = 1400;
  cv.height = 220;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = 'rgba(231,228,221,.78)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 54px Manrope, Arial';
  ctx.fillText(text, cv.width / 2, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const root = new THREE.Group();
scene.add(root);

// EXACTLY THE SAME OUTER FOOTPRINT.
const BOX_W = 178;
const BOX_D = 112;
const BASE_H = 18;
const LID_H = 12;
const INSERT_T = 8;
const CLOSED_LID_BOTTOM = BASE_H / 2;

// ─── BASE: one clean linen-wrapped piece ────────────────────────────────────
const baseGroup = new THREE.Group();
root.add(baseGroup);

const base = roundedBox(BOX_W, BASE_H, BOX_D, 1.8, linenMat);
base.position.y = 0;
baseGroup.add(base);

const insert = roundedBox(BOX_W - 9, INSERT_T, BOX_D - 9, 1.5, insertMat);
insert.position.y = BASE_H / 2 + INSERT_T / 2 - 1.6;
baseGroup.add(insert);
const INSERT_TOP_Y = insert.position.y + INSERT_T / 2;

const slotGroup = new THREE.Group();
baseGroup.add(slotGroup);

function addSlot(x) {
  const slot = roundedBox(13.5, 0.72, 78, 5.3, recessMat);
  slot.position.set(x, INSERT_TOP_Y + 0.02, 0);
  slotGroup.add(slot);
}

function makeVial(x, label) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 55, 32), glassMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  g.add(body);

  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(4.15, 4.15, 43, 24), liquidMat);
  liquid.rotation.x = Math.PI / 2;
  liquid.position.z = 2;
  g.add(liquid);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(5.55, 5.55, 15, 28), capMat);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 34.5;
  cap.castShadow = true;
  g.add(cap);

  const cv = document.createElement('canvas');
  cv.width = 720;
  cv.height = 180;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 720, 180);
  ctx.fillStyle = '#242421';
  ctx.font = '700 48px Manrope, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 360, 90);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(23, 6),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, toneMapped: false })
  );
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.position.set(0, 5.24, 0);
  g.add(labelMesh);

  // Tester is seated deeply into the insert; only a slim crown remains above it.
  g.position.set(x, INSERT_TOP_Y - 4.25, -1.5);
  baseGroup.add(g);
  return g;
}

const vialNames = ['SOTTO VOCE', 'LOW FEVER', 'LACUNA', 'PALE HUM'];
let vials = [];

function setSpacing(spacing) {
  while (slotGroup.children.length) slotGroup.remove(slotGroup.children[0]);
  vials.forEach(v => baseGroup.remove(v));
  vials = [];

  const xs = [-1.5, -0.5, 0.5, 1.5].map(n => n * spacing);
  xs.forEach(addSlot);
  xs.forEach((x, i) => vials.push(makeVial(x, vialNames[i])));
}
setSpacing(37);

// ─── LID: one single linen-wrapped piece, same W × D as base ────────────────
const lidGroup = new THREE.Group();
root.add(lidGroup);

const lid = roundedBox(BOX_W, LID_H, BOX_D, 1.8, linenMat);
lid.position.y = LID_H / 2;
lidGroup.add(lid);

// Mineral Graphite centre field only.
const plaque = roundedBox(104, 2.4, 58, 1.1, mineralMat);
plaque.position.set(0, LID_H + 1.18, 0);
lidGroup.add(plaque);

// Exact TWYNE wordmark embedded directly so it cannot disappear because of MIME/path issues.
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="70 155 1905 190" preserveAspectRatio="xMidYMid meet"><g fill="#E7E4DD"><path d="M 91 174 L 283 174 L 283 214 L 211 214 L 211 335 L 161 335 L 161 215 L 91 215 Z"/><path d="M 455 175 L 507 175 L 540 292 L 580 175 L 643 175 L 680 292 L 718 175 L 768 175 L 712 336 L 648 336 L 611 224 L 574 336 L 511 336 Z"/><path d="M 937 175 L 997 175 L 1051 238 L 1103 175 L 1163 175 L 1077 270 L 1077 336 L 1025 336 L 1025 270 Z"/><path d="M 1344 175 L 1395 175 L 1514 276 L 1514 175 L 1564 175 L 1564 336 L 1514 336 L 1394 235 L 1394 336 L 1344 336 Z"/><path d="M 1760 175 L 1957 175 L 1957 214 L 1812 214 L 1812 236 L 1937 236 L 1937 274 L 1812 274 L 1812 296 L 1957 296 L 1957 336 L 1760 336 Z"/></g></svg>`;
const logoUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;
const logoTex = new THREE.TextureLoader().load(logoUrl);
logoTex.colorSpace = THREE.SRGBColorSpace;

const logo = new THREE.Mesh(
  new THREE.PlaneGeometry(86, 8.6),
  new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })
);
logo.rotation.x = -Math.PI / 2;
logo.position.set(0, LID_H + 2.44, -7.0);
logo.renderOrder = 30;
lidGroup.add(logo);

const volumeCopy = new THREE.Mesh(
  new THREE.PlaneGeometry(78, 8),
  new THREE.MeshBasicMaterial({
    map: smallTextTexture('VOLUME I — KENOPSIA'),
    transparent: true,
    toneMapped: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
);
volumeCopy.rotation.x = -Math.PI / 2;
volumeCopy.position.set(0, LID_H + 2.45, 14.0);
volumeCopy.renderOrder = 31;
lidGroup.add(volumeCopy);

let openAmount = 0.86;
function applyOpen(v) {
  openAmount = v;
  // CLOSED: lid bottom touches base top exactly. No overlap, no telescope, no inset.
  lidGroup.position.set(0, CLOSED_LID_BOTTOM + 56 * v, -68 * v);
  lidGroup.rotation.set(0, 0, 0);
}
applyOpen(openAmount);

const ctrlOpen = document.getElementById('ctrl-open');
ctrlOpen.addEventListener('input', e => applyOpen(parseFloat(e.target.value)));

const ctrlSpacing = document.getElementById('ctrl-spacing');
const readout = document.getElementById('spacing-readout');
ctrlSpacing.addEventListener('input', e => {
  const v = parseFloat(e.target.value);
  setSpacing(v);
  readout.textContent = `${v} mm centre spacing`;
});

function animateCamera(pos, target = new THREE.Vector3(0, 15, 0)) {
  camera.position.set(...pos);
  controls.target.copy(target);
  controls.update();
}

document.getElementById('cam-3q').onclick = () => animateCamera([245, 180, 255]);
document.getElementById('cam-top').onclick = () => animateCamera([0, 390, 6]);
document.getElementById('cam-front').onclick = () => animateCamera([0, 120, 310]);
document.getElementById('cam-closed').onclick = () => {
  applyOpen(0);
  ctrlOpen.value = 0;
  animateCamera([220, 125, 240], new THREE.Vector3(0, 8, 0));
};

document.getElementById('btn-render').onclick = () => {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.download = 'TWYNE-GIFT-SET.png';
  a.href = renderer.domElement.toDataURL('image/png');
  a.click();
};

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function tick() {
  requestAnimationFrame(tick);
  controls.update();
  renderer.render(scene, camera);
}

tick();
