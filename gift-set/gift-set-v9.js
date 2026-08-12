import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// TWYNE GIFT SET — v9 standalone clean rebuild
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

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1200, 1200),
  new THREE.ShadowMaterial({ opacity: 0.18 })
);
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

  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: liquidColors[i], roughness: 0.08, transmission: 0.42,
    transparent: true, opacity: 0.78, ior: 1.34
  });
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
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 5.3),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })
  );
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.position.set(0, 5.56, -4);
  g.add(labelMesh);

  g.position.set(x, INSERT_TOP - 4.0, -5);
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

const ken = new THREE.Mesh(
  new THREE.PlaneGeometry(66, 8.6),
  new THREE.MeshBasicMaterial({ map: textTexture('KENPOSIA', 144, 600, 1), transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })
);
ken.rotation.x = -Math.PI / 2;
ken.position.set(0, LID_H + 1.84, -14);
ken.renderOrder = 100;
lidGroup.add(ken);

const vol = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 4.0),
  new THREE.MeshBasicMaterial({ map: textTexture('VOLUME I', 76, 500, 0.88), transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })
);
vol.rotation.x = -Math.PI / 2;
vol.position.set(0, LID_H + 1.85, -3);
vol.renderOrder = 101;
lidGroup.add(vol);

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 49" preserveAspectRatio="xMidYMid meet"><image width="560" height="49" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjAAAAAxCAYAAADEMpPjAAA5uUlEQVR42u29eXxkV3Unfs69971Xu7ZW793ubru7bbfcYFpgDI6RsI1tiCEBJLM4wRDGDmEyyWQg4RMmSILfb4CZQEgCBBz4QX6TSYIExAQCXnAkFhs3qLHdVu/7vqi11vK2e8+ZP15Vt9xWS1Va7F7qfD7VapWqXr26y7nfc873nIMjgwdvUwLfXSh4IFAAAAAgIVDpl/NEAAjEyf+Ek78HAcAATH696JKTXlCIC3wSCjBEk18PecJNCFCWMAXX7Wlcdu3DzCwQkeASFmaWiGhOHtx2WzKdek/gBbI4TAIAUAiB0ZCzIAAUjMgAWBx9adv2s4OHh//2qo0bRzo6OkRXV9ecjEfpWtu3b29YviDxYQBOaa0ZECUACAYWAoUgMgIRhTFGRbcLGM00oGGyErHk7mwYfnXhwlWnAADnar6YGRGRR0cPNUsjPux7rpRCAAEgMKNABAGIKBAYAIkBhQQABpJSxpjMTu/M8c80XndL9rJYP4d2vDWVTt3rhz5bIJBL+5SIJ3sfAfCEfc7ELNKJRCE7mv/rhqvWbnsp9xb39ipsbdWnjmx/eyqZfmcY+IoReeLWJ4DiLyZSIQxIjBitNkAGAGOMTKYyw2Njg59bvGLj1tLYwGUgpfU+eOzAtVYM/5QDIxEBDLMovgAnalchMBocgLPrf3KdCmAAQAI6gLg7k4cOWLUqAABGRJ6n7yIQkQZP7L4nnUzd57ounX9m0ORnCCkpE6z1DzOLr3mIuVsgtl8W81vJOgAAhYghAMDmzY83LF2waFkyEb+VCW8CgGVMZokmvRRRZJj5Zb1fBAQCMgLlGSnwFCIOocRDyPxz7dGTX/zmP+/t6urSpTWhyOiOZKrmN4w2oKQ898Ur/uCpRU09zBX/RQkx7T1pbSCRqoEwNCuY+d8BwJQ29qW6ILdt2yYBwCDCG1KZzAeyZgRQCIiUD79gzMQLFzIAIMRs+7ftjBgGgC+2bdiguYX9/TCjQlbITwAAABJRU5ErkJggg=="/></svg>`;
const logoUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;
const logoTex = new THREE.TextureLoader().load(logoUrl);
logoTex.colorSpace = THREE.SRGBColorSpace;
const logo = new THREE.Mesh(
  new THREE.PlaneGeometry(78, 6.83),
  new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })
);
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
  a.download = 'TWYNE-GIFT-SET-v9.png';
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
