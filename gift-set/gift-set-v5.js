import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// TWYNE GIFT SET — v5
// Deep lift-off / telescope construction.
// Seam ratio mirrors 50 ml box: ~17.4% from bottom.
// Tester target: ~58 mm overall length, ~11 mm diameter.

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
camera.position.set(245, 165, 250);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 13, 0);
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
  new THREE.ShadowMaterial({ opacity: 0.18 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.6;
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

const insertMat = new THREE.MeshStandardMaterial({ color: 0xe3e0d8, roughness: 0.97, metalness: 0 });
const recessMat = new THREE.MeshStandardMaterial({ color: 0x272724, roughness: 0.99, metalness: 0 });
const capMat = new THREE.MeshStandardMaterial({ color: 0x171715, roughness: 0.52, metalness: 0.08 });
const liquidMat = new THREE.MeshPhysicalMaterial({ color: 0xe4d5b3, roughness: 0.08, transmission: 0.54, transparent: true, opacity: 0.88, ior: 1.35 });
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.06, transmission: 0.94, transparent: true, opacity: 0.44, thickness: 1.1, ior: 1.5 });

function roundedBox(w, h, d, r, mat) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 5, r), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeTextTexture(text, size = 100, weight = 700, alpha = 1) {
  const cv = document.createElement('canvas');
  cv.width = 1800;
  cv.height = 360;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = `rgba(231,228,221,${alpha})`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${weight} ${size}px Manrope, Arial`;
  ctx.fillText(text, cv.width / 2, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeNewLogoTexture() {
  const cv = document.createElement('canvas');
  cv.width = 2200;
  cv.height = 420;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const paths = [
    'M 91 174 L 283 174 L 283 214 L 211 214 L 211 335 L 161 335 L 161 215 L 91 215 Z',
    'M 455 175 L 507 175 L 540 292 L 580 175 L 643 175 L 680 292 L 718 175 L 768 175 L 712 336 L 648 336 L 611 224 L 574 336 L 511 336 Z',
    'M 937 175 L 997 175 L 1051 238 L 1103 175 L 1163 175 L 1077 270 L 1077 336 L 1025 336 L 1025 270 Z',
    'M 1344 175 L 1395 175 L 1514 276 L 1514 175 L 1564 175 L 1564 336 L 1514 336 L 1394 235 L 1394 336 L 1344 336 Z',
    'M 1760 175 L 1957 175 L 1957 214 L 1812 214 L 1812 236 L 1937 236 L 1937 274 L 1812 274 L 1812 296 L 1957 296 L 1957 336 L 1760 336 Z'
  ];

  const sourceCX = (91 + 1957) / 2;
  const sourceCY = (174 + 336) / 2;
  const targetW = 1880;
  const scale = targetW / (1957 - 91);

  ctx.save();
  ctx.translate(cv.width / 2, cv.height / 2);
  ctx.scale(scale, scale);
  ctx.translate(-sourceCX, -sourceCY);
  ctx.fillStyle = '#E7E4DD';
  for (const d of paths) ctx.fill(new Path2D(d));
  ctx.restore();

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const root = new THREE.Group();
scene.add(root);

// CLOSED GIFT SET: flat object. We borrow the 50 ml seam ratio, not its height.
const BOX_W = 178;
const BOX_D = 112;
const CLOSED_TOTAL_H = 30;
const SEAM_RATIO = 16 / 92;
const VISIBLE_BASE_H = CLOSED_TOTAL_H * SEAM_RATIO; // ≈ 5.22 mm
const LID_H = CLOSED_TOTAL_H - VISIBLE_BASE_H;      // ≈ 24.78 mm
const BASE_CORE_H = 18;
const INSERT_T = 8;
const CLEARANCE = 0.8;
const MICRO_BEVEL = 0.6;
const LID_WALL = 2.4;
const LID_TOP = 3.0;

// Deep lid slides over this hidden neck. Outer lid and lower base remain flush.
const NECK_W = BOX_W - (LID_WALL + CLEARANCE) * 2;
const NECK_D = BOX_D - (LID_WALL + CLEARANCE) * 2;

// BASE
const baseGroup = new THREE.Group();
root.add(baseGroup);

const lowerBase = roundedBox(BOX_W, VISIBLE_BASE_H, BOX_D, MICRO_BEVEL, linenMat);
lowerBase.position.y = VISIBLE_BASE_H / 2;
baseGroup.add(lowerBase);

const neckH = BASE_CORE_H - VISIBLE_BASE_H;
const neck = roundedBox(NECK_W, neckH, NECK_D, MICRO_BEVEL, linenMat);
neck.position.y = VISIBLE_BASE_H + neckH / 2;
baseGroup.add(neck);

const insert = roundedBox(NECK_W - 7, INSERT_T, NECK_D - 7, 1.4, insertMat);
insert.position.y = BASE_CORE_H - INSERT_T / 2 - 1.0;
baseGroup.add(insert);
const INSERT_TOP_Y = insert.position.y + INSERT_T / 2;

// TESTERS: 5–6 cm overall, Ø 10–12 mm.
const TESTER_BODY_LEN = 48;
const TESTER_BODY_D = 10.5;
const TESTER_CAP_LEN = 12;
const TESTER_CAP_D = 11.5;
const TESTER_CAP_Z = TESTER_BODY_LEN / 2 + TESTER_CAP_LEN / 2 - 2; // 2 mm overlap => ~58 mm overall
const SLOT_LEN = 62;
const SLOT_W = 13.5;

const slotGroup = new THREE.Group();
baseGroup.add(slotGroup);

function addSlot(x) {
  const slot = roundedBox(SLOT_W, 0.72, SLOT_LEN, 5.3, recessMat);
  slot.position.set(x, INSERT_TOP_Y + 0.03, 0);
  slotGroup.add(slot);
}

function makeVial(x, label) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(TESTER_BODY_D / 2, TESTER_BODY_D / 2, TESTER_BODY_LEN, 32),
    glassMat
  );
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  g.add(body);

  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(4.0, 4.0, TESTER_BODY_LEN - 8, 24),
    liquidMat
  );
  liquid.rotation.x = Math.PI / 2;
  liquid.position.z = -1;
  g.add(liquid);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(TESTER_CAP_D / 2, TESTER_CAP_D / 2, TESTER_CAP_LEN, 28),
    capMat
  );
  cap.rotation.x = Math.PI / 2;
  cap.position.z = TESTER_CAP_Z;
  cap.castShadow = true;
  g.add(cap);

  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(23, 6),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture(label, 48, 700, 1),
      transparent: true,
      side: THREE.DoubleSide,
      toneMapped: false,
      depthWrite: false
    })
  );
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.position.set(0, TESTER_BODY_D / 2 + 0.04, -2);
  g.add(labelMesh);

  // Seat the vial inside the insert so it does not visually float above it.
  g.position.set(x, INSERT_TOP_Y - 4.4, -1.0);
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

// LID — deep lift-off shell.
const lidGroup = new THREE.Group();
root.add(lidGroup);

const lidTop = roundedBox(BOX_W, LID_TOP, BOX_D, MICRO_BEVEL, linenMat);
lidTop.position.y = LID_H - LID_TOP / 2;
lidGroup.add(lidTop);

const skirtH = LID_H - LID_TOP;
const frontSkirt = roundedBox(BOX_W, skirtH, LID_WALL, MICRO_BEVEL, linenMat);
frontSkirt.position.set(0, skirtH / 2, BOX_D / 2 - LID_WALL / 2);
lidGroup.add(frontSkirt);

const backSkirt = frontSkirt.clone();
backSkirt.position.z = -BOX_D / 2 + LID_WALL / 2;
lidGroup.add(backSkirt);

const sideDepth = BOX_D - LID_WALL * 2;
const leftSkirt = roundedBox(LID_WALL, skirtH, sideDepth, MICRO_BEVEL, linenMat);
leftSkirt.position.set(-BOX_W / 2 + LID_WALL / 2, skirtH / 2, 0);
lidGroup.add(leftSkirt);

const rightSkirt = leftSkirt.clone();
rightSkirt.position.x = BOX_W / 2 - LID_WALL / 2;
lidGroup.add(rightSkirt);

// Mineral Graphite centre plaque.
const plaque = roundedBox(104, 2.4, 58, 1.1, mineralMat);
plaque.position.set(0, LID_H + 1.18, 0);
lidGroup.add(plaque);

// KENPOSIA
const title = new THREE.Mesh(
  new THREE.PlaneGeometry(58, 8.6),
  new THREE.MeshBasicMaterial({
    map: makeTextTexture('KENPOSIA', 118, 700, 1),
    transparent: true,
    toneMapped: false,
    depthWrite: false,
    side: THREE.DoubleSide
  })
);
title.rotation.x = -Math.PI / 2;
title.position.set(0, LID_H + 2.44, -13.5);
title.renderOrder = 30;
lidGroup.add(title);

// VOLUME I — smaller under KENPOSIA.
const volume = new THREE.Mesh(
  new THREE.PlaneGeometry(31, 4.6),
  new THREE.MeshBasicMaterial({
    map: makeTextTexture('VOLUME I', 72, 600, 0.84),
    transparent: true,
    toneMapped: false,
    depthWrite: false,
    side: THREE.DoubleSide
  })
);
volume.rotation.x = -Math.PI / 2;
volume.position.set(0, LID_H + 2.45, -2.2);
volume.renderOrder = 31;
lidGroup.add(volume);

// New TWYNE logo supplied by user, rendered directly from its approved vector geometry.
const logo = new THREE.Mesh(
  new THREE.PlaneGeometry(84, 10.5),
  new THREE.MeshBasicMaterial({
    map: makeNewLogoTexture(),
    transparent: true,
    toneMapped: false,
    depthWrite: false,
    side: THREE.DoubleSide
  })
);
logo.rotation.x = -Math.PI / 2;
logo.position.set(0, LID_H + 2.46, 14.0);
logo.renderOrder = 32;
lidGroup.add(logo);

let openAmount = 0.86;
function applyOpen(v) {
  openAmount = v;
  // Closed lid starts exactly at the seam; no printed line and no external step.
  lidGroup.position.set(0, VISIBLE_BASE_H + 58 * v, -58 * v);
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

function animateCamera(pos, target = new THREE.Vector3(0, 13, 0)) {
  camera.position.set(...pos);
  controls.target.copy(target);
  controls.update();
}

document.getElementById('cam-3q').onclick = () => animateCamera([245, 165, 250]);
document.getElementById('cam-top').onclick = () => animateCamera([0, 390, 6]);
document.getElementById('cam-front').onclick = () => animateCamera([0, 105, 310]);
document.getElementById('cam-closed').onclick = () => {
  applyOpen(0);
  ctrlOpen.value = 0;
  animateCamera([220, 105, 240], new THREE.Vector3(0, 14, 0));
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
