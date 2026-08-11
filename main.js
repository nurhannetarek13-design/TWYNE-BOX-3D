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
renderer.toneMappingExposure = 0.88;
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
scene.add(new THREE.AmbientLight(0xf8f8f8, 0.30));

const keyLight = new THREE.DirectionalLight(0xfff0e8, 0.78);
keyLight.position.set(160, 380, 180);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
const ksc = keyLight.shadow.camera;
ksc.left = ksc.bottom = -300;
ksc.right = ksc.top = 300;
ksc.near = 10;
ksc.far = 900;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xe4ecff, 0.28);
fillLight.position.set(-280, 200, 80);
scene.add(fillLight);

const kickLight = new THREE.DirectionalLight(0xffd8b8, 0.50);
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
function makeTex(r0, g0, b0, amp, rg, rb) {
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

// Current TWYNE exterior color — unchanged.
const matTwyneGrey = new THREE.MeshStandardMaterial({
  color: 0x454649,
  roughness: 0.84,
  metalness: 0.0,
});

let boxMat = matTwyneGrey;

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

// Recessed line treatment — tonal, never printed-looking.
const matFrameShadow = new THREE.MeshBasicMaterial({
  color: 0x1f2022,
  transparent: true,
  opacity: 0.44,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const matFrameHighlight = new THREE.MeshBasicMaterial({
  color: 0x858689,
  transparent: true,
  opacity: 0.11,
  depthWrite: false,
  side: THREE.DoubleSide,
});

// Exact custom TWYNE artwork.
const wordmarkTexture = new THREE.TextureLoader().load('./assets/twyne-wordmark.svg');
wordmarkTexture.colorSpace = THREE.SRGBColorSpace;

const matWordmarkShadow = new THREE.MeshBasicMaterial({
  map: wordmarkTexture,
  color: 0x151618,
  transparent: true,
  opacity: 0.72,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const matWordmarkHighlight = new THREE.MeshBasicMaterial({
  map: wordmarkTexture,
  color: 0xa1a2a4,
  transparent: true,
  opacity: 0.13,
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

// ─── Typography / blind-deboss preview ───────────────────────────────────────
function makeTextMaterial(lines, {
  width = 1024,
  height = 256,
  padding = 56,
  fontSize = 78,
  leading = 1.12,
  align = 'left',
  colorDark = 'rgba(8,8,8,0.48)',
  colorLight = 'rgba(255,255,255,0.075)',
  fontFamily = 'Arial, Helvetica, sans-serif',
  fontWeight = '500',
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

  ctx.fillStyle = colorLight;
  lines.forEach((line, i) => ctx.fillText(line, x + 2, y0 + i * lineH + 2));

  ctx.fillStyle = colorDark;
  lines.forEach((line, i) => ctx.fillText(line, x, y0 + i * lineH));

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  return new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function addLabel(parent, lines, {
  w,
  h,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
  ...textOpts
}) {
  const mat = makeTextMaterial(lines, textOpts);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.userData.isLabel = true;
  mesh.renderOrder = 20;
  parent.add(mesh);
  return mesh;
}

function addWordmark(parent, {
  w,
  h,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
}) {
  const hi = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matWordmarkHighlight);
  hi.position.set(x - 0.08, y + 0.08, z);
  hi.rotation.set(rx, ry, rz);
  hi.userData.isLabel = true;
  hi.renderOrder = 18;
  parent.add(hi);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matWordmarkShadow);
  shadow.position.set(x + 0.06, y - 0.06, z + 0.008);
  shadow.rotation.set(rx, ry, rz);
  shadow.userData.isLabel = true;
  shadow.renderOrder = 19;
  parent.add(shadow);
}

// ─── Double recessed panel system ────────────────────────────────────────────
function addReliefStrip(parent, w, h, x, y, orientation = 'horizontal') {
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matFrameShadow);
  shadow.position.set(x, y, 0);
  shadow.userData.isGroove = true;
  shadow.renderOrder = 8;
  parent.add(shadow);

  const hiGeo = orientation === 'vertical'
    ? new THREE.PlaneGeometry(w * 0.42, h)
    : new THREE.PlaneGeometry(w, h * 0.42);

  const hi = new THREE.Mesh(hiGeo, matFrameHighlight);
  if (orientation === 'vertical') {
    hi.position.set(x + 0.10, y, 0.007);
  } else {
    hi.position.set(x, y + 0.10, 0.007);
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

  const outerW = Math.max(faceW - 14, 2);
  const outerH = Math.max(faceH - 14, 2);
  const innerW = Math.max(faceW - 21, 2);
  const innerH = Math.max(faceH - 21, 2);

  addRectFrame2D(face, outerW, outerH, 0.34);
  addRectFrame2D(face, innerW, innerH, 0.24);
}

function addAllLidFrames(parent, W, D, lidBlockH) {
  const o = 0.105;
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

  // Double recessed panel language on every lid face + top.
  addAllLidFrames(lidGroup, W, D, lidBlockH);

  const SURFACE_OFFSET = 0.135;

  // TOP — TWYNE is the hero face, using the exact custom wordmark.
  // Width nearly fills the inner recessed panel, like the supplied reference.
  addWordmark(lidGroup, {
    w: 66,
    h: 6.46,
    x: 0,
    y: lidBlockH + SURFACE_OFFSET + 0.02,
    z: 0,
    rx: -Math.PI / 2,
  });

  // FRONT — volume identity.
  addLabel(lidGroup, ['VOLUME I', 'KENOPSIA'], {
    w: 54,
    h: 18,
    x: 0,
    y: lidBlockH / 2,
    z: D / 2 + SURFACE_OFFSET,
    fontSize: 118,
    leading: 1.12,
    align: 'center',
    padding: 22,
    fontWeight: '600',
  });

  // BACK — house code.
  addLabel(lidGroup, ['TWO STATES.', 'A THIRD FORM.'], {
    w: 58,
    h: 18,
    x: 0,
    y: lidBlockH / 2,
    z: -D / 2 - SURFACE_OFFSET,
    ry: Math.PI,
    fontSize: 108,
    leading: 1.14,
    align: 'center',
    padding: 18,
    fontWeight: '600',
  });

  // LEFT — state nomenclature.
  addLabel(lidGroup, ['STATE / LIGHT'], {
    w: 46,
    h: 10,
    x: -W / 2 - SURFACE_OFFSET,
    y: lidBlockH / 2,
    z: 0,
    ry: -Math.PI / 2,
    fontSize: 108,
    align: 'center',
    padding: 16,
    fontWeight: '600',
  });

  // RIGHT — house descriptor.
  addLabel(lidGroup, ['A HAUS OF VOLUMES'], {
    w: 54,
    h: 10,
    x: W / 2 + SURFACE_OFFSET,
    y: lidBlockH / 2,
    z: 0,
    ry: Math.PI / 2,
    fontSize: 92,
    align: 'center',
    padding: 14,
    fontWeight: '600',
  });

  // THIN BASE — technical information only.
  addLabel(rootGroup, ['PERFUME / PARFUM', '50 ML / 1.7 FL. OZ.'], {
    w: 46,
    h: 11,
    x: 0,
    y: seamY / 2,
    z: D / 2 + SURFACE_OFFSET,
    fontSize: 70,
    leading: 1.14,
    align: 'center',
    padding: 16,
    fontWeight: '600',
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
btnC?.addEventListener('click', () => setColor(matTwyneGrey, btnC));

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
