import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// 1 Three.js unit = 1 mm
const CHAMFER = 0.6;

const params = {
  width: 90,
  depth: 90,
  totalH: 92,
  lidH: 76,
  board: 2.5,
  clearance: 0.8,
  open: 0,
};

// ─── Renderer ────────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.90;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ─── Scene / camera ──────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0c0a);

const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(175, 110, 220);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 80;
controls.maxDistance = 900;

// ─── Lighting ────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xf8f8f8, 0.28));

const keyLight = new THREE.DirectionalLight(0xfff0e8, 0.82);
keyLight.position.set(160, 380, 180);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
const ksc = keyLight.shadow.camera;
ksc.left = ksc.bottom = -300;
ksc.right = ksc.top = 300;
ksc.near = 10;
ksc.far = 900;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xe4ecff, 0.23);
fillLight.position.set(-280, 200, 80);
scene.add(fillLight);

const kickLight = new THREE.DirectionalLight(0xffd8b8, 0.46);
kickLight.position.set(-60, 220, -320);
scene.add(kickLight);

const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1200, 1200),
  new THREE.ShadowMaterial({ opacity: 0.14 })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// ─── Materials ───────────────────────────────────────────────────────────────
function makeTex(r0, g0, b0, amp = 8, rg = 1, rb = 1) {
  const sz = 1024;
  const cv = document.createElement('canvas');
  cv.width = cv.height = sz;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = `rgb(${r0},${g0},${b0})`;
  ctx.fillRect(0, 0, sz, sz);
  const img = ctx.getImageData(0, 0, sz, sz);
  const px = img.data;

  for (let i = 0; i < px.length; i += 4) {
    const n = (Math.random() - 0.5) * amp;
    px[i] = Math.max(0, Math.min(255, r0 + n));
    px[i + 1] = Math.max(0, Math.min(255, g0 + n * rg));
    px[i + 2] = Math.max(0, Math.min(255, b0 + n * rb));
    px[i + 3] = 255;
  }

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const matWarmAsh = new THREE.MeshStandardMaterial({
  map: makeTex(0xCE, 0xC8, 0xBD, 14, 0.96, 0.90),
  roughness: 0.97,
  metalness: 0.0,
});

const matSoraDora = new THREE.MeshStandardMaterial({
  map: makeTex(0xD2, 0xCE, 0xC8, 10, 0.97, 0.94),
  roughness: 0.96,
  metalness: 0.0,
});

// LOCKED EDP exterior: Mineral Graphite #4D4D49.
// Very fine mineral tooth so it feels like wrapped rigid-board, not flat CG grey.
const matMineralGraphite = new THREE.MeshStandardMaterial({
  map: makeTex(0x4D, 0x4D, 0x49, 5, 0.96, 0.88),
  roughness: 0.90,
  metalness: 0.0,
});

let boxMat = matMineralGraphite;

const matGlass = new THREE.MeshPhysicalMaterial({
  color: 0xf2ede0,
  roughness: 0.04,
  metalness: 0.0,
  transmission: 0.80,
  thickness: 1.2,
  ior: 1.52,
  transparent: true,
});

const matCap = new THREE.MeshStandardMaterial({
  color: 0x151210,
  roughness: 0.5,
  metalness: 0.0,
});

const matRecess = new THREE.MeshStandardMaterial({
  color: 0x1c1a16,
  roughness: 0.97,
  metalness: 0.0,
});

// Recessed double-rule: no ink / no foil. Only a dark inner edge + a tiny light lip.
const matFrameShadow = new THREE.MeshBasicMaterial({
  color: 0x1d1e1c,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const matFrameHighlight = new THREE.MeshBasicMaterial({
  color: 0xc0c0ba,
  transparent: true,
  opacity: 0.075,
  depthWrite: false,
  side: THREE.DoubleSide,
});

// ─── Box groups ──────────────────────────────────────────────────────────────
let rootGroup = null;
let lidGroup = null;

function applyMaterial(mat) {
  boxMat = mat;
  if (!rootGroup) return;

  rootGroup.traverse(obj => {
    if (
      obj.isMesh &&
      !obj.userData.isLabel &&
      !obj.userData.isGroove &&
      obj.material !== matGlass &&
      obj.material !== matCap &&
      obj.material !== matRecess
    ) {
      obj.material = checkActive ? matBasicCheck : mat;
    }
  });
}

const matBasicCheck = new THREE.MeshBasicMaterial({ color: 0x858582 });
let checkActive = false;

function toggleCheck() {
  checkActive = !checkActive;
  const btn = document.getElementById('btn-matcheck');
  btn.textContent = checkActive ? 'Check: ON – lighting OFF' : 'Material Check';
  btn.classList.toggle('active', checkActive);

  const skip = new Set([matGlass, matCap, matRecess]);
  if (rootGroup) rootGroup.traverse(obj => {
    if (!obj.isMesh || obj.userData.isLabel || obj.userData.isGroove || skip.has(obj.material)) return;
    obj.material = checkActive ? matBasicCheck : boxMat;
  });
}

// ─── Blind-deboss system ─────────────────────────────────────────────────────
// This is deliberately tone-on-tone. The cavity is read through a dark inner
// floor plus opposing micro highlight/shadow edges — no printed ink color.
function makeDebossTextMaterial(lines, {
  width = 1024,
  height = 256,
  padding = 56,
  fontSize = 78,
  leading = 1.12,
  align = 'center',
  fontFamily = 'Arial, Helvetica, sans-serif',
  fontWeight = '600',
  depth = 0.55,
} = {}) {
  const cv = document.createElement('canvas');
  cv.width = width;
  cv.height = height;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';

  let x = padding;
  if (align === 'center') {
    ctx.textAlign = 'center';
    x = width / 2;
  } else if (align === 'right') {
    ctx.textAlign = 'right';
    x = width - padding;
  } else {
    ctx.textAlign = 'left';
  }

  const lineH = fontSize * leading;
  const totalH = lines.length * lineH;
  const y0 = (height - totalH) / 2;
  const px = Math.max(1.2, 2.8 * depth);

  // lower/right inner lip catches a thread of light
  ctx.fillStyle = `rgba(235,235,228,${0.11 * depth})`;
  lines.forEach((line, i) => ctx.fillText(line, x + px, y0 + i * lineH + px));

  // upper/left inner wall goes dark
  ctx.fillStyle = `rgba(0,0,0,${0.34 * depth})`;
  lines.forEach((line, i) => ctx.fillText(line, x - px, y0 + i * lineH - px));

  // recessed floor — same color family, just compressed by shadow
  ctx.fillStyle = `rgba(10,10,9,${0.22 + 0.16 * depth})`;
  lines.forEach((line, i) => ctx.fillText(line, x, y0 + i * lineH));

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  return new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function addDebossLabel(parent, lines, {
  w,
  h,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
  depth = 0.55,
  ...textOpts
}) {
  const mat = makeDebossTextMaterial(lines, { ...textOpts, depth });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.userData.isLabel = true;
  mesh.renderOrder = 20;
  parent.add(mesh);
  return mesh;
}

// Exact custom TWYNE wordmark paths, drawn directly into a CanvasTexture.
// This avoids external SVG loading and gives the hero mark its own deeper stamp.
const TWYNE_PATHS = [
  'M 0 0 L 0 24 L 43 24 L 44 25 L 44 74 L 72 74 L 72 25 L 73 24 L 116 24 L 116 0 Z',
  'M 147 0 L 162 35 L 168 52 L 171 57 L 177 74 L 215 74 L 235 29 L 237 30 L 256 74 L 293 74 L 299 62 L 324 0 L 292 0 L 275 42 L 268 31 L 268 29 L 266 27 L 253 0 L 218 0 L 214 10 L 212 12 L 212 14 L 210 16 L 210 18 L 199 40 L 197 42 L 195 40 L 179 0 Z',
  'M 356 0 L 403 48 L 403 74 L 429 74 L 429 48 L 476 0 L 443 0 L 417 26 L 413 24 L 390 0 Z',
  'M 508 0 L 508 74 L 536 74 L 536 31 L 537 30 L 592 74 L 624 74 L 624 0 L 596 0 L 596 41 L 595 42 L 591 40 L 541 0 Z',
  'M 664 0 L 664 74 L 765 74 L 765 52 L 693 52 L 692 51 L 692 47 L 694 45 L 745 45 L 745 28 L 693 28 L 692 23 L 693 22 L 765 22 L 765 0 Z',
];

function makeWordmarkDebossMaterial(depth = 1) {
  const cv = document.createElement('canvas');
  cv.width = 1536;
  cv.height = 256;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const paths = TWYNE_PATHS.map(d => new Path2D(d));
  const targetW = 1340;
  const scale = targetW / 766;
  const markH = 75 * scale;
  const ox = (cv.width - targetW) / 2;
  const oy = (cv.height - markH) / 2;
  const edge = 2.4 * depth;

  function draw(dx, dy, fill) {
    ctx.save();
    ctx.translate(ox + dx, oy + dy);
    ctx.scale(scale, scale);
    ctx.fillStyle = fill;
    paths.forEach(p => ctx.fill(p));
    ctx.restore();
  }

  draw(edge, edge, `rgba(235,235,228,${0.15 * depth})`);
  draw(-edge, -edge, `rgba(0,0,0,${0.48 * depth})`);
  draw(0, 0, `rgba(8,8,7,${0.40 * depth})`);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  return new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function addDebossWordmark(parent, {
  w,
  h,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
  depth = 1,
}) {
  const mat = makeWordmarkDebossMaterial(depth);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.userData.isLabel = true;
  mesh.renderOrder = 24;
  parent.add(mesh);
  return mesh;
}

// ─── Double recessed panel system ────────────────────────────────────────────
function addReliefStrip(parent, w, h, x, y, orientation = 'horizontal') {
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matFrameShadow);
  shadow.position.set(x, y, 0);
  shadow.userData.isGroove = true;
  shadow.renderOrder = 8;
  parent.add(shadow);

  const hiGeo = orientation === 'vertical'
    ? new THREE.PlaneGeometry(w * 0.40, h)
    : new THREE.PlaneGeometry(w, h * 0.40);

  const hi = new THREE.Mesh(hiGeo, matFrameHighlight);
  if (orientation === 'vertical') {
    hi.position.set(x + 0.09, y, 0.006);
  } else {
    hi.position.set(x, y + 0.09, 0.006);
  }
  hi.userData.isGroove = true;
  hi.renderOrder = 9;
  parent.add(hi);
}

function addRectFrame2D(parent, frameW, frameH, lineW) {
  const leftX = -frameW / 2;
  const rightX = frameW / 2;
  const topY = frameH / 2;
  const bottomY = -frameH / 2;

  addReliefStrip(parent, frameW, lineW, 0, topY, 'horizontal');
  addReliefStrip(parent, frameW, lineW, 0, bottomY, 'horizontal');
  addReliefStrip(parent, lineW, frameH, leftX, 0, 'vertical');
  addReliefStrip(parent, lineW, frameH, rightX, 0, 'vertical');
}

function addDoubleFrameFace(parent, {
  faceW,
  faceH,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
}) {
  const face = new THREE.Group();
  face.position.set(x, y, z);
  face.rotation.set(rx, ry, rz);
  parent.add(face);

  // 7 mm outer inset, then a quiet 3.5 mm parallel echo.
  const outerW = Math.max(faceW - 14, 2);
  const outerH = Math.max(faceH - 14, 2);
  const innerW = Math.max(faceW - 21, 2);
  const innerH = Math.max(faceH - 21, 2);

  addRectFrame2D(face, outerW, outerH, 0.28);
  addRectFrame2D(face, innerW, innerH, 0.18);
}

function addAllLidFrames(parent, W, D, lidBlockH) {
  const o = 0.108;
  const cy = lidBlockH / 2;

  addDoubleFrameFace(parent, {
    faceW: W,
    faceH: lidBlockH,
    y: cy,
    z: D / 2 + o,
  });

  addDoubleFrameFace(parent, {
    faceW: W,
    faceH: lidBlockH,
    y: cy,
    z: -D / 2 - o,
    ry: Math.PI,
  });

  addDoubleFrameFace(parent, {
    faceW: D,
    faceH: lidBlockH,
    x: -W / 2 - o,
    y: cy,
    ry: -Math.PI / 2,
  });

  addDoubleFrameFace(parent, {
    faceW: D,
    faceH: lidBlockH,
    x: W / 2 + o,
    y: cy,
    ry: Math.PI / 2,
  });

  addDoubleFrameFace(parent, {
    faceW: W,
    faceH: D,
    y: lidBlockH + o,
    rx: -Math.PI / 2,
  });
}

// ─── Build box ───────────────────────────────────────────────────────────────
function buildBox() {
  if (rootGroup) scene.remove(rootGroup);

  const {
    width: W,
    depth: D,
    totalH: H,
    lidH: LH,
    board: T,
    clearance: C,
  } = params;

  const seamY = H - LH;
  const ch = Math.min(CHAMFER, seamY / 2 - 0.01, W / 2 - 0.01, D / 2 - 0.01);

  rootGroup = new THREE.Group();
  scene.add(rootGroup);

  const baseMesh = new THREE.Mesh(new RoundedBoxGeometry(W, seamY, D, 3, ch), boxMat);
  baseMesh.position.set(0, seamY / 2, 0);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  rootGroup.add(baseMesh);

  const recessT = 0.3;
  const recessMesh = new THREE.Mesh(new THREE.BoxGeometry(50, recessT, 50), matRecess);
  recessMesh.position.set(0, seamY + recessT / 2, 0);
  rootGroup.add(recessMesh);

  // Bottle placeholder — locked proportions.
  const bW = 49.07;
  const bD = 49.60;
  const bBodyH = 49.68;
  const bCapH = 27.3;
  const sinkDepth = 7;
  const bBaseY = seamY - sinkDepth;
  const bBodyY = bBaseY + bBodyH / 2;

  const bodyMesh = new THREE.Mesh(
    new RoundedBoxGeometry(bW, bBodyH, bD, 3, 1.2),
    matGlass
  );
  bodyMesh.position.set(0, bBodyY, 0);
  bodyMesh.castShadow = true;
  rootGroup.add(bodyMesh);

  const bCapY = bBaseY + bBodyH + bCapH / 2;
  const capMesh = new THREE.Mesh(
    new RoundedBoxGeometry(bW - 4, bCapH, bD - 4, 3, 0.8),
    matCap
  );
  capMesh.position.set(0, bCapY, 0);
  capMesh.castShadow = true;
  rootGroup.add(capMesh);

  const baseTopY = seamY;
  const bottleBottomY = bBaseY;
  const bottleTopY = bBaseY + bBodyH;
  const capTopY = bBaseY + bBodyH + bCapH;
  const lidInnerCeilingY = H - T;
  const lidOuterTopY = H;

  console.table({
    baseTopY,
    bottleBottomY,
    bottleTopY,
    capTopY,
    lidInnerCeilingY,
    lidOuterTopY,
  });

  console.assert(
    capTopY < lidInnerCeilingY,
    `CAP PROTRUDES: capTop ${capTopY.toFixed(2)} >= lidCeiling ${lidInnerCeilingY}`
  );

  lidGroup = new THREE.Group();
  rootGroup.add(lidGroup);

  const lidBlockH = Math.max(LH - C, 1);
  const lidChamfer = Math.min(ch, lidBlockH / 2 - 0.01);
  const lidMesh = new THREE.Mesh(
    new RoundedBoxGeometry(W, lidBlockH, D, 3, lidChamfer),
    boxMat
  );
  lidMesh.position.set(0, lidBlockH / 2, 0);
  lidMesh.castShadow = true;
  lidMesh.receiveShadow = true;
  lidGroup.add(lidMesh);

  lidGroup.position.y = seamY + C;

  // Construction language: double recessed frame on every lid face + top.
  addAllLidFrames(lidGroup, W, D, lidBlockH);

  const S = 0.145;

  // TOP — deepest hero blind deboss.
  addDebossWordmark(lidGroup, {
    w: 69,
    h: 6.75,
    x: 0,
    y: lidBlockH + S,
    z: 0,
    rx: -Math.PI / 2,
    depth: 1.0,
  });

  // FRONT — medium blind deboss.
  addDebossLabel(lidGroup, ['VOLUME I', 'KENOPSIA'], {
    w: 54,
    h: 18,
    x: 0,
    y: lidBlockH / 2,
    z: D / 2 + S,
    fontSize: 118,
    leading: 1.12,
    align: 'center',
    padding: 22,
    fontWeight: '600',
    depth: 0.68,
  });

  // BACK — house code, quieter than front.
  addDebossLabel(lidGroup, ['TWO STATES.', 'A THIRD FORM.'], {
    w: 58,
    h: 18,
    x: 0,
    y: lidBlockH / 2,
    z: -D / 2 - S,
    ry: Math.PI,
    fontSize: 108,
    leading: 1.14,
    align: 'center',
    padding: 18,
    fontWeight: '600',
    depth: 0.54,
  });

  // LEFT — micro blind deboss.
  addDebossLabel(lidGroup, ['STATE / LIGHT'], {
    w: 46,
    h: 10,
    x: -W / 2 - S,
    y: lidBlockH / 2,
    z: 0,
    ry: -Math.PI / 2,
    fontSize: 108,
    align: 'center',
    padding: 16,
    fontWeight: '600',
    depth: 0.46,
  });

  // RIGHT — micro blind deboss.
  addDebossLabel(lidGroup, ['A HAUS OF VOLUMES'], {
    w: 54,
    h: 10,
    x: W / 2 + S,
    y: lidBlockH / 2,
    z: 0,
    ry: Math.PI / 2,
    fontSize: 92,
    align: 'center',
    padding: 14,
    fontWeight: '600',
    depth: 0.46,
  });

  // THIN BASE — shallowest technical deboss.
  addDebossLabel(rootGroup, ['PERFUME / PARFUM', '50 ML / 1.7 FL. OZ.'], {
    w: 46,
    h: 11,
    x: 0,
    y: seamY / 2,
    z: D / 2 + S,
    fontSize: 70,
    leading: 1.14,
    align: 'center',
    padding: 16,
    fontWeight: '600',
    depth: 0.38,
  });

  controls.target.set(0, H / 2, 0);
  applyOpen();
}

function applyOpen() {
  if (!lidGroup) return;
  const { totalH: H, lidH: LH, clearance: C } = params;
  const seamY = H - LH;
  lidGroup.position.y = (seamY + C) + params.open * (LH + 20);
}

// ─── Camera presets ──────────────────────────────────────────────────────────
const CAM_PRESETS = {
  front: { p: [0, 55, 290], t: [0, 46, 0] },
  '3q': { p: [175, 110, 220], t: [0, 46, 0] },
  side: { p: [290, 55, 0], t: [0, 46, 0] },
  top: { p: [0, 340, 12], t: [0, 46, 0] },
};

function goPreset(key) {
  const { p, t } = CAM_PRESETS[key];
  camera.position.set(...p);
  controls.target.set(...t);
  controls.update();
}

// ─── Controls ────────────────────────────────────────────────────────────────
const dimInputs = {
  'ctrl-width': 'width',
  'ctrl-depth': 'depth',
  'ctrl-height': 'totalH',
  'ctrl-lidH': 'lidH',
  'ctrl-board': 'board',
  'ctrl-clear': 'clearance',
};

for (const [id, key] of Object.entries(dimInputs)) {
  document.getElementById(id)?.addEventListener('input', e => {
    params[key] = parseFloat(e.target.value) || 0;
    buildBox();
  });
}

document.getElementById('ctrl-open')?.addEventListener('input', e => {
  params.open = parseFloat(e.target.value);
  applyOpen();
});

const btnA = document.getElementById('btn-a');
const btnB = document.getElementById('btn-b');
const btnC = document.getElementById('btn-c');
const colorBtns = [btnA, btnB, btnC];

const setColor = (mat, active) => {
  applyMaterial(mat);
  colorBtns.forEach(b => b?.classList.remove('active'));
  active?.classList.add('active');
};

btnA?.addEventListener('click', () => setColor(matWarmAsh, btnA));
btnB?.addEventListener('click', () => setColor(matSoraDora, btnB));
btnC?.addEventListener('click', () => setColor(matMineralGraphite, btnC));

document.getElementById('btn-matcheck')?.addEventListener('click', toggleCheck);

['front', '3q', 'side', 'top'].forEach(k =>
  document.getElementById(`btn-cam-${k}`)?.addEventListener('click', () => goPreset(k))
);

// ─── Resize / render ─────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

(function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
})();

buildBox();