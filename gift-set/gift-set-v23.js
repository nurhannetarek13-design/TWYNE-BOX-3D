import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// TWYNE GIFT SET v23 — FINAL RESET
// Horizontal all-paper presentation case inspired by the supplied reference.
// Book-style hinged lid opens 180° to the left. Four 2 ml testers sit in one horizontal row.
// No poster artwork, no graphite band, no split lid, no ribs, no portrait box.

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090908);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 1, 2200);
camera.position.set(255, 175, 260);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(-22, 13, 0);
controls.minDistance = 135;
controls.maxDistance = 700;

scene.add(new THREE.HemisphereLight(0xf7f2ea, 0x1c1c1a, 1.45));
const key = new THREE.DirectionalLight(0xfff3e3, 2.45);
key.position.set(190, 300, 190);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -420;
key.shadow.camera.right = 420;
key.shadow.camera.top = 320;
key.shadow.camera.bottom = -320;
scene.add(key);
const fill = new THREE.DirectionalLight(0xe9efff, 0.72);
fill.position.set(-260, 185, 120);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffd7bd, 0.95);
rim.position.set(90, 150, -250);
scene.add(rim);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1400, 1400),
  new THREE.ShadowMaterial({ opacity: 0.16 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.15;
ground.receiveShadow = true;
scene.add(ground);

function paperTexture(base = 0xE7E4DD) {
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
    const n = (Math.random() - 0.5) * 6;
    img.data[i] = Math.max(0, Math.min(255, r + n));
    img.data[i + 1] = Math.max(0, Math.min(255, g + n));
    img.data[i + 2] = Math.max(0, Math.min(255, b + n));
  }
  ctx.putImageData(img, 0, 0);
  ctx.globalAlpha = 0.085;
  ctx.strokeStyle = '#918d84';
  ctx.lineWidth = 0.65;
  for (let y = 0; y < size; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + (Math.random() - 0.5) * 1.2);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.04;
  for (let x = 0; x < size; x += 13) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 0.8, size);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.4, 1.8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const linenMat = new THREE.MeshStandardMaterial({ map: paperTexture(0xE7E4DD), roughness: 0.99, metalness: 0 });
const insertMat = new THREE.MeshStandardMaterial({ map: paperTexture(0xDFDCD4), roughness: 0.99, metalness: 0 });
const recessMat = new THREE.MeshStandardMaterial({ color: 0xd0cdc5, roughness: 1.0, metalness: 0 });
const capMat = new THREE.MeshStandardMaterial({ color: 0x171715, roughness: 0.48, metalness: 0.05 });
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.06, transmission: 0.92, transparent: true, opacity: 0.48, thickness: 1, ior: 1.5 });
const liquidColors = [0xd7c8b9, 0xd8cab8, 0xd9cfbf, 0xc8b08c];

function roundedBox(w, h, d, r, mat) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 5, r), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function trackedTexture(text, opts = {}) {
  const { fontSize = 110, weight = 600, tracking = 16, color = '#1f1f1d', align = 'center' } = opts;
  const cv = document.createElement('canvas');
  cv.width = 1800;
  cv.height = 360;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.font = `${weight} ${fontSize}px Manrope, Arial, sans-serif`;
  const chars = [...text];
  const widths = chars.map(ch => ctx.measureText(ch).width);
  const total = widths.reduce((a,b)=>a+b,0) + tracking * Math.max(0, chars.length - 1);
  let x = align === 'left' ? 30 : (cv.width - total) / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, cv.height / 2);
    x += widths[i] + tracking;
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

function textPlane(text, w, h, opts = {}) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: trackedTexture(text, opts), transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

const root = new THREE.Group();
scene.add(root);

// Reference-like wide, shallow proportions.
const BOX_W = 190;
const BOX_D = 104;
const BASE_H = 12;
const INSERT_H = 5.5;
const LID_T = 4.2;
const BEVEL = 0.65;

// BASE + PAPER INSERT
const baseGroup = new THREE.Group();
root.add(baseGroup);
const base = roundedBox(BOX_W, BASE_H, BOX_D, BEVEL, linenMat);
base.position.y = BASE_H / 2;
baseGroup.add(base);

const insert = roundedBox(BOX_W - 10, INSERT_H, BOX_D - 10, 0.9, insertMat);
insert.position.y = BASE_H - INSERT_H / 2 + 0.15;
baseGroup.add(insert);
const INSERT_TOP = insert.position.y + INSERT_H / 2;

const slotGroup = new THREE.Group();
baseGroup.add(slotGroup);
let vials = [];
const names = ['SOTTO VOCE', 'LOW FEVER', 'LACUNA', 'PALE HUM'];

function makeVial(x, label, i) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(5.3, 5.3, 43, 30), glassMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  g.add(body);

  const liquidMat = new THREE.MeshPhysicalMaterial({ color: liquidColors[i], roughness: 0.08, transmission: 0.42, transparent: true, opacity: 0.78, ior: 1.34 });
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 33, 24), liquidMat);
  liquid.rotation.x = Math.PI / 2;
  liquid.position.z = -2.2;
  g.add(liquid);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(5.45, 5.45, 14, 28), capMat);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 28.5;
  cap.castShadow = true;
  g.add(cap);

  g.position.set(x, INSERT_TOP - 3.7, -5.5);
  baseGroup.add(g);

  const namePlane = textPlane(label, 33, 4.6, { fontSize: 66, weight: 600, tracking: 9, color: '#32312f' });
  namePlane.position.set(x, INSERT_TOP + 0.12, 36.5);
  namePlane.renderOrder = 30;
  baseGroup.add(namePlane);

  return g;
}

function setSpacing(spacing) {
  while (slotGroup.children.length) slotGroup.remove(slotGroup.children[0]);
  vials.forEach(v => baseGroup.remove(v));
  // Remove old name labels.
  [...baseGroup.children].filter(c => c.userData?.testerName).forEach(c => baseGroup.remove(c));
  vials = [];

  const xs = [-1.5, -0.5, 0.5, 1.5].map(n => n * spacing);
  xs.forEach(x => {
    const slot = roundedBox(13.2, 0.62, 61, 4.8, recessMat);
    slot.position.set(x, INSERT_TOP + 0.03, -5.5);
    slotGroup.add(slot);
  });
  xs.forEach((x, i) => {
    const before = baseGroup.children.length;
    vials.push(makeVial(x, names[i], i));
    const label = baseGroup.children[baseGroup.children.length - 1];
    if (baseGroup.children.length > before) label.userData.testerName = true;
  });
}
setSpacing(37);

// HINGED LID — hinge runs along left edge and opens 180° to the left.
const lidPivot = new THREE.Group();
lidPivot.position.set(-BOX_W / 2, BASE_H + 0.35, 0);
root.add(lidPivot);

const lid = roundedBox(BOX_W, LID_T, BOX_D, BEVEL, linenMat);
lid.position.set(BOX_W / 2, LID_T / 2, 0);
lidPivot.add(lid);

// Very subtle paper spine/hinge bridge only for believable construction.
const hinge = roundedBox(2.2, 2.4, BOX_D - 4, 0.35, linenMat);
hinge.position.set(0.4, 0.75, 0);
lidPivot.add(hinge);

// COVER: quiet like the reference.
const coverLogo = textPlane('TWYNE', 76, 9.5, { fontSize: 126, weight: 600, tracking: 34, color: '#242421' });
coverLogo.position.set(BOX_W / 2, LID_T + 0.05, -4);
coverLogo.renderOrder = 100;
lidPivot.add(coverLogo);

const coverCode = textPlane('VOLUME I — KENPOSIA', 70, 5.0, { fontSize: 64, weight: 500, tracking: 14, color: '#45433f' });
coverCode.position.set(BOX_W / 2, LID_T + 0.06, 30);
coverCode.renderOrder = 101;
lidPivot.add(coverCode);

// Controls
const openCtrl = document.getElementById('ctrl-open');
const spacingCtrl = document.getElementById('ctrl-spacing');
const spacingReadout = document.getElementById('spacing-readout');

function updateOpen() {
  const v = Number(openCtrl?.value ?? 0.86);
  lidPivot.rotation.z = Math.PI * v;
}
openCtrl?.addEventListener('input', updateOpen);
updateOpen();

spacingCtrl?.addEventListener('input', () => {
  const value = Number(spacingCtrl.value);
  setSpacing(value);
  if (spacingReadout) spacingReadout.textContent = `${value} mm centre spacing`;
});

function setCam(pos, target) {
  camera.position.set(...pos);
  controls.target.set(...target);
  controls.update();
}

document.getElementById('cam-3q')?.addEventListener('click', () => setCam([255, 175, 260], [-28, 13, 0]));
document.getElementById('cam-top')?.addEventListener('click', () => setCam([0, 380, 8], [-70, 0, 0]));
document.getElementById('cam-front')?.addEventListener('click', () => setCam([0, 105, 360], [-45, 10, 0]));
document.getElementById('cam-closed')?.addEventListener('click', () => {
  if (openCtrl) openCtrl.value = '0';
  updateOpen();
  setCam([225, 145, 225], [0, 10, 0]);
});

document.getElementById('btn-render')?.addEventListener('click', () => {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.download = 'TWYNE-GIFT-SET-v23.png';
  a.href = renderer.domElement.toDataURL('image/png');
  a.click();
});

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
