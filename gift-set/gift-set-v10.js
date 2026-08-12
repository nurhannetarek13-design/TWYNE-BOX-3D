import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// TWYNE GIFT SET — v10 standalone clean rebuild
// No legacy imports. No external seam/lip geometry.

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090908);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2200);
camera.position.set(235, 150, 245);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 16, -3);
controls.minDistance = 120;
controls.maxDistance = 650;

scene.add(new THREE.HemisphereLight(0xf5f0e7, 0x20201e, 1.35));
const key = new THREE.DirectionalLight(0xfff2e2, 2.25);
key.position.set(180, 280, 190);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -300;
key.shadow.camera.right = 300;
key.shadow.camera.top = 300;
key.shadow.camera.bottom = -300;
scene.add(key);
const fill = new THREE.DirectionalLight(0xe8edff, 0.85);
fill.position.set(-230, 165, 105);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffd8bd, 1.15);
rim.position.set(55, 175, -235);
scene.add(rim);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.ShadowMaterial({ opacity: 0.18 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
ground.receiveShadow = true;
scene.add(ground);

function noiseTexture(base, amp = 7, fibres = false) {
  const size = 768;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const c = new THREE.Color(base);
  const r = Math.round(c.r * 255), g = Math.round(c.g * 255), b = Math.round(c.b * 255);
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
    ctx.globalAlpha = 0.10;
    ctx.strokeStyle = '#8e8a82';
    ctx.lineWidth = 0.8;
    for (let y = 0; y < size; y += 7) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y + (Math.random() - 0.5)); ctx.stroke();
    }
    ctx.globalAlpha = 0.055;
    for (let x = 0; x < size; x += 11) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (Math.random() - 0.5), size); ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.4, 1.8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const linenMat = new THREE.MeshStandardMaterial({ map: noiseTexture(0xE7E4DD, 6, true), roughness: 0.98, metalness: 0 });
const mineralMat = new THREE.MeshStandardMaterial({ map: noiseTexture(0x4D4D49, 5, false), roughness: 0.92, metalness: 0 });
const insertMat = new THREE.MeshStandardMaterial({ color: 0xe2dfd7, roughness: 0.98, metalness: 0 });
const recessMat = new THREE.MeshStandardMaterial({ color: 0x302f2c, roughness: 1.0, metalness: 0 });
const capMat = new THREE.MeshStandardMaterial({ color: 0x171715, roughness: 0.52, metalness: 0.06 });
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.06, transmission: 0.92, transparent: true, opacity: 0.50, thickness: 1.0, ior: 1.5 });
const liquidColors = [0xd9d2c4, 0xd5c4b2, 0xd7c6b5, 0xcdb279];

function roundedBox(w, h, d, r, mat) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 5, r), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function textTexture(text, size = 90, weight = 600, alpha = 1) {
  const cv = document.createElement('canvas');
  cv.width = 1600; cv.height = 320;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = `rgba(231,228,221,${alpha})`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${weight} ${size}px Manrope, Arial, sans-serif`;
  ctx.fillText(text, cv.width / 2, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const root = new THREE.Group();
scene.add(root);

const BOX_W = 178;
const BOX_D = 112;
const BASE_H = 16;
const LID_H = 14;
const INSERT_T = 8;
const BEVEL = 0.6;

const baseGroup = new THREE.Group();
root.add(baseGroup);
const base = roundedBox(BOX_W, BASE_H, BOX_D, BEVEL, linenMat);
base.position.y = BASE_H / 2;
baseGroup.add(base);

const insert = roundedBox(BOX_W - 12, INSERT_T, BOX_D - 12, 1.25, insertMat);
insert.position.y = BASE_H - INSERT_T / 2 + 0.2;
baseGroup.add(insert);
const INSERT_TOP = insert.position.y + INSERT_T / 2;

const slotGroup = new THREE.Group();
baseGroup.add(slotGroup);
let vials = [];
const names = ['SOTTO VOCE', 'LOW FEVER', 'LACUNA', 'PALE HUM'];

function makeVial(x, label, i) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 44, 32), glassMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  g.add(body);

  const liquidMat = new THREE.MeshPhysicalMaterial({ color: liquidColors[i], roughness: 0.08, transmission: 0.42, transparent: true, opacity: 0.78, ior: 1.34 });
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(4.55, 4.55, 34, 24), liquidMat);
  liquid.rotation.x = Math.PI / 2;
  liquid.position.z = -2.5;
  g.add(liquid);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(5.55, 5.55, 14, 28), capMat);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 29;
  cap.castShadow = true;
  g.add(cap);

  const labelTex = textTexture(label, 42, 700, 0.92);
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(25, 5.3), new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.position.set(0, 5.56, -4);
  g.add(labelMesh);

  g.position.set(x, INSERT_TOP - 4.7, -5);
  baseGroup.add(g);
  return g;
}

function setSpacing(spacing) {
  while (slotGroup.children.length) slotGroup.remove(slotGroup.children[0]);
  vials.forEach(v => baseGroup.remove(v));
  vials = [];
  const xs = [-1.5, -0.5, 0.5, 1.5].map(n => n * spacing);
  xs.forEach(x => {
    const slot = roundedBox(13.4, 0.65, 63, 5.1, recessMat);
    slot.position.set(x, INSERT_TOP + 0.03, -5);
    slotGroup.add(slot);
  });
  xs.forEach((x, i) => vials.push(makeVial(x, names[i], i)));
}
setSpacing(37);

const lidGroup = new THREE.Group();
root.add(lidGroup);
const lid = roundedBox(BOX_W, LID_H, BOX_D, BEVEL, linenMat);
lid.position.y = LID_H / 2;
lidGroup.add(lid);

const plaque = roundedBox(104, 1.8, 58, 1.0, mineralMat);
plaque.position.set(0, LID_H + 0.90, 0);
lidGroup.add(plaque);

const ken = new THREE.Mesh(new THREE.PlaneGeometry(66, 8.6), new THREE.MeshBasicMaterial({ map: textTexture('KENPOSIA', 144, 600, 1), transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
ken.rotation.x = -Math.PI / 2;
ken.position.set(0, LID_H + 1.84, -14);
ken.renderOrder = 100;
lidGroup.add(ken);

const vol = new THREE.Mesh(new THREE.PlaneGeometry(30, 4.0), new THREE.MeshBasicMaterial({ map: textTexture('VOLUME I', 76, 500, 0.88), transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
vol.rotation.x = -Math.PI / 2;
vol.position.set(0, LID_H + 1.85, -3);
vol.renderOrder = 101;
lidGroup.add(vol);

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 49"><path fill="#E7E4DD" fill-rule="evenodd" d="M 502 5 L 502 6 L 501 7 L 501 10 L 500 11 L 500 37 L 501 38 L 501 41 L 502 42 L 502 43 L 505 46 L 506 46 L 507 47 L 510 47 L 511 48 L 553 48 L 554 47 L 557 47 L 558 46 L 558 44 L 559 43 L 559 38 L 558 37 L 518 37 L 515 34 L 515 30 L 516 29 L 558 29 L 558 19 L 557 18 L 517 18 L 515 16 L 515 13 L 517 11 L 518 11 L 519 10 L 559 10 L 559 5 L 558 4 L 558 2 L 557 2 L 555 0 L 509 0 L 508 1 L 506 1 Z M 376 0 L 376 47 L 377 48 L 389 48 L 390 47 L 390 15 L 391 14 L 396 19 L 396 20 L 400 24 L 400 25 L 403 28 L 403 29 L 407 33 L 407 34 L 410 37 L 410 38 L 414 42 L 414 43 L 419 48 L 440 48 L 441 47 L 441 0 L 427 0 L 427 33 L 426 34 L 424 32 L 424 31 L 421 28 L 421 27 L 417 23 L 417 22 L 413 18 L 413 17 L 409 13 L 409 12 L 406 9 L 406 8 L 402 4 L 402 3 L 399 0 Z M 254 0 L 254 1 L 258 5 L 258 6 L 264 12 L 264 13 L 270 19 L 270 20 L 276 26 L 276 27 L 280 31 L 280 47 L 281 48 L 293 48 L 294 47 L 294 32 L 295 31 L 295 30 L 301 24 L 301 23 L 307 17 L 307 16 L 314 9 L 314 8 L 321 1 L 321 0 L 303 0 L 301 2 L 301 3 L 297 7 L 297 8 L 292 13 L 292 14 L 287 19 L 285 17 L 285 16 L 280 11 L 280 10 L 276 6 L 276 5 L 272 1 L 272 0 Z M 110 0 L 110 2 L 111 3 L 111 5 L 112 6 L 112 8 L 113 9 L 113 11 L 114 12 L 114 14 L 116 17 L 116 19 L 117 20 L 117 22 L 118 23 L 118 25 L 119 26 L 119 28 L 120 29 L 120 31 L 122 34 L 122 36 L 123 37 L 123 39 L 124 40 L 124 43 L 125 44 L 125 46 L 127 48 L 145 48 L 146 47 L 146 45 L 147 44 L 147 42 L 148 41 L 148 39 L 150 36 L 150 33 L 151 32 L 151 30 L 152 29 L 152 27 L 153 26 L 153 24 L 154 23 L 154 21 L 155 20 L 155 17 L 156 16 L 158 19 L 158 21 L 159 22 L 159 24 L 161 27 L 161 29 L 162 30 L 162 32 L 163 33 L 163 36 L 164 37 L 164 39 L 165 40 L 165 42 L 166 43 L 166 45 L 167 46 L 167 47 L 168 48 L 186 48 L 188 45 L 188 42 L 190 39 L 190 37 L 191 36 L 191 34 L 192 33 L 192 31 L 193 30 L 193 28 L 194 27 L 194 25 L 195 24 L 195 22 L 196 21 L 196 19 L 198 16 L 198 13 L 199 12 L 199 10 L 200 9 L 200 7 L 201 6 L 201 5 L 202 4 L 202 2 L 203 1 L 202 0 L 188 0 L 188 1 L 187 2 L 187 4 L 186 5 L 186 7 L 185 8 L 185 11 L 184 12 L 184 14 L 183 15 L 183 17 L 182 18 L 182 20 L 181 21 L 181 23 L 180 24 L 180 27 L 178 30 L 178 32 L 177 33 L 176 33 L 175 32 L 175 30 L 174 29 L 174 26 L 172 23 L 172 21 L 171 20 L 171 18 L 170 17 L 170 15 L 169 14 L 169 12 L 168 11 L 168 9 L 167 8 L 167 6 L 166 5 L 166 3 L 165 2 L 165 1 L 164 0 L 149 0 L 147 3 L 147 5 L 146 6 L 146 8 L 145 9 L 145 11 L 144 12 L 144 14 L 143 15 L 143 17 L 141 20 L 141 22 L 140 23 L 140 25 L 139 26 L 139 28 L 138 29 L 138 30 L 137 31 L 137 33 L 136 34 L 135 33 L 135 31 L 134 30 L 134 28 L 133 27 L 133 25 L 132 24 L 132 22 L 131 21 L 131 19 L 130 18 L 130 16 L 129 15 L 129 13 L 128 12 L 128 10 L 127 9 L 127 6 L 126 5 L 126 3 L 125 2 L 125 1 L 124 0 Z M 0 0 L 0 11 L 1 12 L 20 12 L 21 13 L 21 47 L 22 48 L 35 48 L 36 47 L 36 13 L 37 12 L 56 12 L 57 11 L 57 0 Z"/></svg>`;
const logoUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;
const logoTex = new THREE.TextureLoader().load(logoUrl);
logoTex.colorSpace = THREE.SRGBColorSpace;
const logo = new THREE.Mesh(new THREE.PlaneGeometry(78, 6.83), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
logo.rotation.x = -Math.PI / 2;
logo.position.set(0, LID_H + 1.86, 14.5);
logo.renderOrder = 102;
lidGroup.add(logo);

let openAmount = 0.86;
function applyOpen(v) {
  openAmount = v;
  lidGroup.position.set(0, BASE_H + 50 * v, -72 * v);
  lidGroup.rotation.set(0, 0, 0);
}
applyOpen(openAmount);

const ctrlOpen = document.getElementById('ctrl-open');
if (ctrlOpen) ctrlOpen.addEventListener('input', e => applyOpen(parseFloat(e.target.value)));
const ctrlSpacing = document.getElementById('ctrl-spacing');
const readout = document.getElementById('spacing-readout');
if (ctrlSpacing) ctrlSpacing.addEventListener('input', e => {
  const v = parseFloat(e.target.value);
  setSpacing(v);
  if (readout) readout.textContent = `${v} mm centre spacing`;
});

function animateCamera(pos, target = new THREE.Vector3(0, 16, -3)) {
  camera.position.set(...pos);
  controls.target.copy(target);
  controls.update();
}

document.getElementById('cam-3q').onclick = () => animateCamera([235, 150, 245]);
document.getElementById('cam-top').onclick = () => animateCamera([0, 385, 4], new THREE.Vector3(0, 10, -8));
document.getElementById('cam-front').onclick = () => animateCamera([0, 100, 300], new THREE.Vector3(0, 15, -6));
document.getElementById('cam-closed').onclick = () => {
  applyOpen(0);
  if (ctrlOpen) ctrlOpen.value = 0;
  animateCamera([220, 118, 240], new THREE.Vector3(0, 12, 0));
};

document.getElementById('btn-render').onclick = () => {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.download = 'TWYNE-GIFT-SET-v10.png';
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
