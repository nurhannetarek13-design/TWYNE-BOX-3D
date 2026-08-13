import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// TWYNE GIFT SET v22 — TRUE PORTRAIT OBJECT
// Standalone rebuild: portrait lid + portrait base + 4 horizontal testers stacked vertically.
// Warm paper throughout. Full supplied halftone face retained. No extra copy under VOLUME I.

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
camera.position.set(215, 185, 285);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(-10, 20, 0);
controls.minDistance = 135;
controls.maxDistance = 700;

scene.add(new THREE.HemisphereLight(0xf5f0e7, 0x20201e, 1.35));
const key = new THREE.DirectionalLight(0xfff2e2, 2.25);
key.position.set(180, 280, 190);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -320;
key.shadow.camera.right = 320;
key.shadow.camera.top = 320;
key.shadow.camera.bottom = -320;
scene.add(key);
const fill = new THREE.DirectionalLight(0xe8edff, 0.85);
fill.position.set(-230, 165, 105);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffd8bd, 1.1);
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
    ctx.globalAlpha = 0.05;
    for (let x = 0; x < size; x += 11) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (Math.random() - 0.5), size); ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.8, 2.6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const linenMat = new THREE.MeshStandardMaterial({
  map: noiseTexture(0xE7E4DD, 6, true), roughness: 0.98, metalness: 0
});
const insertMat = new THREE.MeshStandardMaterial({
  map: noiseTexture(0xE2DFD7, 5, true), roughness: 0.99, metalness: 0
});
const recessMat = new THREE.MeshStandardMaterial({ color: 0x302f2c, roughness: 1.0, metalness: 0 });
const capMat = new THREE.MeshStandardMaterial({ color: 0x171715, roughness: 0.52, metalness: 0.06 });
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, roughness: 0.06, transmission: 0.92,
  transparent: true, opacity: 0.50, thickness: 1.0, ior: 1.5
});
const liquidColors = [0xd9d2c4, 0xd5c4b2, 0xd7c6b5, 0xcdb279];

function roundedBox(w, h, d, r, mat) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 5, r), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function textTexture(text, size = 90, weight = 600, color = '#1D1D1C') {
  const cv = document.createElement('canvas');
  cv.width = 1600;
  cv.height = 320;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${weight} ${size}px Manrope, Arial, sans-serif`;
  ctx.fillText(text, cv.width / 2, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function verticalWordTexture(text, fontSize = 150, weight = 700) {
  const cv = document.createElement('canvas');
  cv.width = 320;
  cv.height = 1600;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#1D1D1C';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${weight} ${fontSize}px Manrope, Arial, sans-serif`;
  const chars = [...text];
  const top = 110;
  const bottom = cv.height - 110;
  const step = (bottom - top) / Math.max(1, chars.length - 1);
  chars.forEach((ch, i) => ctx.fillText(ch, cv.width / 2, top + i * step));
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function rotatedLineTexture(text) {
  const cv = document.createElement('canvas');
  cv.width = 300;
  cv.height = 1200;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.save();
  ctx.translate(cv.width / 2, cv.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#1D1D1C';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 92px Manrope, Arial, sans-serif';
  ctx.fillText(text, 0, 0);
  ctx.restore();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

// Exact monochrome face bitmap previously sampled from the supplied reference.
const FACE_W = 100;
const FACE_H = 90;
const FACE_BITS = 'AAAAAAAAAAAAf/+4AAAAAAAAAAAAB//9wAAAAAAAAAAAAH//7gAAAAAAAAAAAAP//+AAAAAAAAAAAAA///8AAAAAAAAACAAB//94AAAAAAAAAWAAH///gAAAAAAAAABIAP///AAAAAAAAAQNAA///+AAAAAAAABAIAD///4AAAAAAAA/+AAH///gAAAAAAAf/+cAf///AAAAAAAH///gA///8AAAAAID+f/4AD///wAAAAAC+A///AP///AAAAAAPgCT/gAf//8AAAAAB4AAH+AB///wAAAAQOgAAP4AD///AAAAAB6AAl/4AP//8AAABANgAB//AAf//4AAABTwAAD/8AB///wAAAE/IAAP/wAD///gAAAP+AAA/ngAP//+AAAAZ8BAB+/AAf//8AAADH/yAAHYAB///8AAAfAAAAAAAAD///wAABCDAAAAAAAP///gAAAAEAAAAAAAf///AAAABAAAAAAAB///+AAAADAAAAAAAD///4AAAKPAAAAAAAP///gAAAEfgAAAAAAf///AAAABgAAAAAAB///+AAAAAAAAAAAAD///wAAAAAAAAAAAAP///gAAAAAAAAAAAAf//8AAAAAAAAAAAAB///4AAAAAAAAAAAAD///gAAAAAAAAAAAAP//+AAAAAAAAAAAAAf//gAAAAAAAAAAAAB///AAAAAAAAAAAAAD//8AAAAAAAAAAAAAP//gAAAAAAAAAAAAA///gAAAAAAAAAAAAB//+AAAAAAAAAAAAAD//5AAAAAAAAAAAAAP//kAAAAAAAAAAAAAf//gAAAAAAAAAAAAB///QAAAAAAAAAAAAD//8AAAAAAAAAAAAAP//8AAAAAAAAAAAAA///wAAAAAAAAAAAAB///wAAAAAAAAAAAAH///gAAAAAAAAAAAAP///AAAAAAAAAAAAA///+AAAAAAAAAAAAD///8AAAAAAAAAAAAP///wAAAAAAAAAAAAf///AAAAAAAAAAAAB///+AAAAAAAAAAAAH///8AAAAAAAAAAAAf///4AgAAAAAAAAAB////wPAAAAAAAAAAD////B+AAAAAAAAAAP///+P8AAAAAAAAAA////4/4AAAAAAAAAD////j/gAAAAAAAAAP///+f/AAAAAAAAAA////5/+AAAAAAAAAD////n/4AAAAAAAAAP///+P/wAAAAAAAAA////4f/AAAAAAAAAD////A/8AAAAAAAAAP///+B/gAAAAAAAAA////4BwAAAAAAAAAD////gAAAAAAAAAAAP///+AAAAAAAAAAAA////wAAAAAAAAAAAD///+AAAAAAAAAAAAP///wAAAAAAAAAAAA////AAAAAAAAAAAAH///9AAAAAAAAAAAAf///gAAAAAAAAAAAD///wAAAAAAAAAAAAP//9AAAAAAAAAAAAB///4QAAAAAAAAAAAH///gAAAAAAAAAAAA///8AAAAAAAAAAAAD///QAAAAAAAAAAAAP';

function faceTexture() {
  const raw = atob(FACE_BITS);
  const cv = document.createElement('canvas');
  cv.width = FACE_W;
  cv.height = FACE_H;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, FACE_W, FACE_H);
  ctx.fillStyle = '#1D1D1C';
  let bitIndex = 0;
  for (let y = 0; y < FACE_H; y++) {
    for (let x = 0; x < FACE_W; x++) {
      const byte = raw.charCodeAt(bitIndex >> 3);
      const bit = 7 - (bitIndex & 7);
      if ((byte >> bit) & 1) ctx.fillRect(x, y, 1, 1);
      bitIndex++;
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

const root = new THREE.Group();
scene.add(root);

// TRUE PORTRAIT PROPORTIONS.
const BOX_W = 118;
const BOX_D = 178;
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

function makeVial(z, label, i) {
  const g = new THREE.Group();

  // 44 mm glass body, horizontal left-to-right.
  const body = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 44, 32), glassMat);
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  g.add(body);

  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: liquidColors[i], roughness: 0.08, transmission: 0.42,
    transparent: true, opacity: 0.78, ior: 1.34
  });
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(4.55, 4.55, 34, 24), liquidMat);
  liquid.rotation.z = Math.PI / 2;
  liquid.position.x = -2.5;
  g.add(liquid);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(5.55, 5.55, 14, 28), capMat);
  cap.rotation.z = Math.PI / 2;
  cap.position.x = 29;
  cap.castShadow = true;
  g.add(cap);

  const labelTex = textTexture(label, 42, 700, '#262522');
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 5.3),
    new THREE.MeshBasicMaterial({
      map: labelTex, transparent: true, toneMapped: false,
      depthWrite: false, side: THREE.DoubleSide
    })
  );
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.position.set(-4, 5.56, 0);
  g.add(labelMesh);

  g.position.set(0, INSERT_TOP - 4.7, z);
  baseGroup.add(g);
  return g;
}

function setSpacing(spacing) {
  while (slotGroup.children.length) slotGroup.remove(slotGroup.children[0]);
  vials.forEach(v => baseGroup.remove(v));
  vials = [];

  const zs = [-1.5, -0.5, 0.5, 1.5].map(n => n * spacing);
  zs.forEach(z => {
    const slot = roundedBox(63, 0.65, 13.4, 5.1, recessMat);
    slot.position.set(0, INSERT_TOP + 0.03, z);
    slotGroup.add(slot);
  });
  zs.forEach((z, i) => vials.push(makeVial(z, names[i], i)));
}
setSpacing(37);

const lidGroup = new THREE.Group();
root.add(lidGroup);
const lid = roundedBox(BOX_W, LID_H, BOX_D, BEVEL, linenMat);
lid.position.y = LID_H / 2;
lidGroup.add(lid);

function printPlane(w, d, tex, x, z, order = 100) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0.97,
      toneMapped: false, depthWrite: false, side: THREE.DoubleSide
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, LID_H + 0.11, z);
  mesh.renderOrder = order;
  lidGroup.add(mesh);
  return mesh;
}

// Full face is visible; no crop. It is stretched only to fit the portrait cover.
const face = printPlane(92, 118, faceTexture(), 0, -8, 210);
face.name = 'FULL_FACE_PRINT_PORTRAIT_V22';

const ken = printPlane(10.5, 82, verticalWordTexture('KENPOSIA', 142, 700), -51, 45, 230);
ken.name = 'KENPOSIA_LEFT_VERTICAL_V22';

const twyne = printPlane(12.5, 92, verticalWordTexture('TWYNE', 170, 700), 51, 0, 240);
twyne.name = 'TWYNE_RIGHT_VERTICAL_V22';

const volume = printPlane(7.0, 35, rotatedLineTexture('VOLUME I'), -42, -49, 235);
volume.name = 'VOLUME_I_ONLY_V22';

function setOpen(v) {
  const t = Math.max(0, Math.min(1, Number(v)));
  lidGroup.position.set(-58 * t, BASE_H + 44 * t, -48 * t);
  lidGroup.rotation.y = -0.035 * t;
}

const spacingCtrl = document.getElementById('ctrl-spacing');
const spacingReadout = document.getElementById('spacing-readout');
if (spacingCtrl) {
  spacingCtrl.value = '37';
  spacingCtrl.addEventListener('input', () => {
    const spacing = Number(spacingCtrl.value);
    setSpacing(spacing);
    if (spacingReadout) spacingReadout.textContent = `${spacing} mm centre spacing`;
  });
}

const openCtrl = document.getElementById('ctrl-open');
if (openCtrl) {
  openCtrl.value = '0.86';
  openCtrl.addEventListener('input', () => setOpen(openCtrl.value));
  setOpen(openCtrl.value);
} else {
  setOpen(0.86);
}

function setActive(id) {
  document.querySelectorAll('.camera-grid .ui-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

function cameraTo(position, target, id) {
  camera.position.copy(position);
  controls.target.copy(target);
  controls.update();
  setActive(id);
}

document.getElementById('cam-3q')?.addEventListener('click', () => {
  cameraTo(new THREE.Vector3(215, 185, 285), new THREE.Vector3(-10, 20, 0), 'cam-3q');
});

document.getElementById('cam-top')?.addEventListener('click', () => {
  cameraTo(new THREE.Vector3(0, 430, 0.1), new THREE.Vector3(-18, 18, 0), 'cam-top');
});

document.getElementById('cam-front')?.addEventListener('click', () => {
  cameraTo(new THREE.Vector3(0, 115, 365), new THREE.Vector3(-18, 20, 0), 'cam-front');
});

document.getElementById('cam-closed')?.addEventListener('click', () => {
  if (openCtrl) openCtrl.value = '0';
  setOpen(0);
  cameraTo(new THREE.Vector3(190, 165, 260), new THREE.Vector3(0, 14, 0), 'cam-closed');
});

document.getElementById('btn-render')?.addEventListener('click', () => {
  renderer.render(scene, camera);
  const link = document.createElement('a');
  link.download = 'TWYNE_GIFT_SET_V22.png';
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
