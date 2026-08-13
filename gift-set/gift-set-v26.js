import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// TWYNE GIFT SET v26 — SLEEVE + SLIDING TRAY
// Complete structural reset.
// Outer paper sleeve stays fixed. Inner paper tray slides horizontally in/out from the right.
// No hinged lid. No telescope lid over base. The tray physically fits INSIDE the sleeve like a drawer.

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090908);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 1, 2400);
camera.position.set(330, 190, 310);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(38, 12, 0);
controls.minDistance = 140;
controls.maxDistance = 800;

scene.add(new THREE.HemisphereLight(0xf7f2e9, 0x1d1d1b, 1.5));
const key = new THREE.DirectionalLight(0xfff1df, 2.5);
key.position.set(210, 320, 190);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -480;
key.shadow.camera.right = 480;
key.shadow.camera.top = 340;
key.shadow.camera.bottom = -340;
scene.add(key);
const fill = new THREE.DirectionalLight(0xe7efff, 0.78);
fill.position.set(-270, 190, 135);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffd8bd, 0.92);
rim.position.set(120, 165, -280);
scene.add(rim);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1500, 1500),
  new THREE.ShadowMaterial({ opacity: 0.16 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
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
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#908b82';
  ctx.lineWidth = 0.65;
  for (let y = 0; y < size; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + (Math.random() - 0.5) * 1.1);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.04;
  for (let x = 0; x < size; x += 13) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5), size);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.3, 1.7);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const sleeveMat = new THREE.MeshStandardMaterial({ map: paperTexture(0xE7E4DD), roughness: 0.99, metalness: 0 });
const trayMat = new THREE.MeshStandardMaterial({ map: paperTexture(0xE2DFD7), roughness: 0.99, metalness: 0 });
const insertMat = new THREE.MeshStandardMaterial({ map: paperTexture(0xDDDAD2), roughness: 0.99, metalness: 0 });
const recessMat = new THREE.MeshStandardMaterial({ color: 0xc9c6be, roughness: 1, metalness: 0 });
const capMat = new THREE.MeshStandardMaterial({ color: 0x171715, roughness: 0.48, metalness: 0.05 });
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.06,
  transmission: 0.92,
  transparent: true,
  opacity: 0.5,
  thickness: 1,
  ior: 1.5,
});
const liquidColors = [0xd9cbbb, 0xd8c5ae, 0xd6cdbd, 0xc9b18e];

function roundedBox(w, h, d, r, mat) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 5, r), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function trackedTexture(text, opts = {}) {
  const {
    fontSize = 86,
    weight = 500,
    tracking = 12,
    color = '#141413',
    family = 'Manrope, Arial, sans-serif',
  } = opts;
  const cv = document.createElement('canvas');
  cv.width = 1800;
  cv.height = 360;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.font = `${weight} ${fontSize}px ${family}`;

  const chars = [...text];
  const widths = chars.map(ch => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
  let x = (cv.width - total) / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, cv.height / 2);
    x += widths[i] + tracking;
  });

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
    new THREE.MeshBasicMaterial({
      map: trackedTexture(text, opts),
      transparent: true,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

const root = new THREE.Group();
scene.add(root);

// OUTER SLEEVE — open on the RIGHT, closed on the LEFT.
const SLEEVE_W = 198;
const SLEEVE_D = 110;
const SLEEVE_H = 19;
const WALL = 3.2;
const BEVEL = 0.55;

const sleeveGroup = new THREE.Group();
root.add(sleeveGroup);

const bottom = roundedBox(SLEEVE_W, WALL, SLEEVE_D, BEVEL, sleeveMat);
bottom.position.set(0, WALL / 2, 0);
sleeveGroup.add(bottom);

const top = roundedBox(SLEEVE_W, WALL, SLEEVE_D, BEVEL, sleeveMat);
top.position.set(0, SLEEVE_H - WALL / 2, 0);
sleeveGroup.add(top);

const frontWall = roundedBox(SLEEVE_W, SLEEVE_H - 2 * WALL, WALL, BEVEL, sleeveMat);
frontWall.position.set(0, SLEEVE_H / 2, SLEEVE_D / 2 - WALL / 2);
sleeveGroup.add(frontWall);

const backWall = roundedBox(SLEEVE_W, SLEEVE_H - 2 * WALL, WALL, BEVEL, sleeveMat);
backWall.position.set(0, SLEEVE_H / 2, -SLEEVE_D / 2 + WALL / 2);
sleeveGroup.add(backWall);

const leftEnd = roundedBox(WALL, SLEEVE_H - 2 * WALL, SLEEVE_D - 2 * WALL, BEVEL, sleeveMat);
leftEnd.position.set(-SLEEVE_W / 2 + WALL / 2, SLEEVE_H / 2, 0);
sleeveGroup.add(leftEnd);

// COVER BRANDING — exact TWYNE wordmark, then compact stacked hierarchy.
const logoTex = new THREE.TextureLoader().load('../assets/twyne-wordmark-2026.svg');
logoTex.colorSpace = THREE.SRGBColorSpace;
logoTex.minFilter = THREE.LinearFilter;
logoTex.magFilter = THREE.LinearFilter;
logoTex.generateMipmaps = false;

const logo = new THREE.Mesh(
  new THREE.PlaneGeometry(86, 21.5),
  new THREE.MeshBasicMaterial({
    map: logoTex,
    color: 0x000000,
    transparent: true,
    toneMapped: false,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
  })
);
logo.rotation.x = -Math.PI / 2;
logo.position.set(0, SLEEVE_H + 0.18, -19);
logo.renderOrder = 500;
sleeveGroup.add(logo);

const volume = textPlane('VOLUME I', 46, 5.3, {
  fontSize: 92,
  weight: 600,
  tracking: 10,
  color: '#10100f',
});
volume.position.set(0, SLEEVE_H + 0.20, 1.5);
volume.renderOrder = 501;
sleeveGroup.add(volume);

// Deliberately different type feel for KENPOSIA: narrower, lighter, wider tracking.
const kenposia = textPlane('KENPOSIA', 72, 5.5, {
  fontSize: 82,
  weight: 500,
  tracking: 44,
  color: '#111110',
  family: 'Arial Narrow, Helvetica Neue, Arial, sans-serif',
});
kenposia.position.set(0, SLEEVE_H + 0.22, 12.0);
kenposia.renderOrder = 502;
sleeveGroup.add(kenposia);

const eau = textPlane('EAU DE PARFUM', 52, 4.2, {
  fontSize: 64,
  weight: 500,
  tracking: 12,
  color: '#1b1a18',
});
eau.position.set(0, SLEEVE_H + 0.24, 21.2);
eau.renderOrder = 503;
sleeveGroup.add(eau);

// INNER TRAY — genuinely smaller than the sleeve cavity.
const TRAY_W = 190;
const TRAY_D = 100;
const TRAY_H = 10.5;
const INSERT_H = 5.2;
const CLOSED_X = 2.0;
const OPEN_SLIDE = 145;

const trayGroup = new THREE.Group();
root.add(trayGroup);

const trayBase = roundedBox(TRAY_W, TRAY_H, TRAY_D, 0.7, trayMat);
trayBase.position.y = TRAY_H / 2 + WALL;
trayGroup.add(trayBase);

const insert = roundedBox(TRAY_W - 8, INSERT_H, TRAY_D - 8, 0.8, insertMat);
insert.position.y = WALL + TRAY_H - INSERT_H / 2 + 0.08;
trayGroup.add(insert);
const INSERT_TOP = insert.position.y + INSERT_H / 2;

const slotGroup = new THREE.Group();
trayGroup.add(slotGroup);
let vials = [];
let testerLabels = [];
const names = ['SOTTO VOCE', 'LOW FEVER', 'LACUNA', 'PALE HUM'];

function makeVial(x, i) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(new THREE.CylinderGeometry(5.3, 5.3, 43, 30), glassMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  g.add(body);

  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: liquidColors[i],
    roughness: 0.08,
    transmission: 0.42,
    transparent: true,
    opacity: 0.8,
    ior: 1.34,
  });
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 33, 24), liquidMat);
  liquid.rotation.x = Math.PI / 2;
  liquid.position.z = -2.2;
  g.add(liquid);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(5.45, 5.45, 14, 28), capMat);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 28.5;
  cap.castShadow = true;
  g.add(cap);

  g.position.set(x, INSERT_TOP - 3.55, -6);
  trayGroup.add(g);
  return g;
}

function setSpacing(spacing) {
  while (slotGroup.children.length) slotGroup.remove(slotGroup.children[0]);
  vials.forEach(v => trayGroup.remove(v));
  testerLabels.forEach(l => trayGroup.remove(l));
  vials = [];
  testerLabels = [];

  const xs = [-1.5, -0.5, 0.5, 1.5].map(n => n * spacing);

  xs.forEach(x => {
    const slot = roundedBox(13.1, 0.58, 61, 4.8, recessMat);
    slot.position.set(x, INSERT_TOP + 0.02, -6);
    slotGroup.add(slot);
  });

  xs.forEach((x, i) => {
    vials.push(makeVial(x, i));
    const label = textPlane(names[i], 32, 4.4, {
      fontSize: 62,
      weight: 600,
      tracking: 8,
      color: '#302f2c',
    });
    label.position.set(x, INSERT_TOP + 0.14, 35.8);
    label.renderOrder = 120;
    trayGroup.add(label);
    testerLabels.push(label);
  });
}
setSpacing(37);

const openCtrl = document.getElementById('ctrl-open');
const spacingCtrl = document.getElementById('ctrl-spacing');
const spacingReadout = document.getElementById('spacing-readout');

function updateOpen() {
  const v = Number(openCtrl?.value ?? 0.82);
  trayGroup.position.x = CLOSED_X + OPEN_SLIDE * v;
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

document.getElementById('cam-3q')?.addEventListener('click', () => setCam([330, 190, 310], [40, 12, 0]));
document.getElementById('cam-top')?.addEventListener('click', () => setCam([65, 410, 5], [55, 0, 0]));
document.getElementById('cam-front')?.addEventListener('click', () => setCam([55, 120, 390], [55, 10, 0]));
document.getElementById('cam-closed')?.addEventListener('click', () => {
  if (openCtrl) openCtrl.value = '0';
  updateOpen();
  setCam([250, 155, 250], [0, 10, 0]);
});

document.getElementById('btn-render')?.addEventListener('click', () => {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.download = 'TWYNE-GIFT-SET-v26.png';
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
