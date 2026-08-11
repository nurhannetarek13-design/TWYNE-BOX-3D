import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// 1 Three.js unit = 1 mm

// Micro-bevel radius: imperceptible in shape, catches light cleanly on every edge
const CHAMFER = 0.6;

const params = {
  width:      90,    // lid outer width
  depth:      90,    // lid outer depth
  totalH:     92,    // total closed-box height
  lidH:       76,    // lid piece height (top panel + deep skirt)
  board:       2.5,  // wall / panel thickness
  clearance:   0.8,  // gap per side — controls both interior sliding gap and visible seam height
  open:        0,    // 0 = closed, 1 = fully open
};

// ─── Renderer ────────────────────────────────────────────────────────────────

const canvas   = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.88;
renderer.outputColorSpace    = THREE.SRGBColorSpace;

// ─── Scene / camera ──────────────────────────────────────────────────────────

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0c0a);

const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(175, 110, 220);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping  = true;
controls.dampingFactor  = 0.06;
controls.minDistance    = 80;
controls.maxDistance    = 900;

// ─── Lighting — product photography setup ──────────────────────────────────────

scene.add(new THREE.AmbientLight(0xf8f8f8, 0.30));

// Key — large soft source, upper-right-front
const keyLight = new THREE.DirectionalLight(0xfff0e8, 0.78);
keyLight.position.set(160, 380, 180);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
const ksc = keyLight.shadow.camera;
ksc.left = ksc.bottom = -300;
ksc.right = ksc.top   =  300;
ksc.near  =  10;
ksc.far   = 900;
scene.add(keyLight);

// Fill — cool left fill, lifted to avoid flat shadows on dark surface
const fillLight = new THREE.DirectionalLight(0xe4ecff, 0.28);
fillLight.position.set(-280, 200, 80);
scene.add(fillLight);

// Kicker — warm rear-upper edge light to reveal silhouette on dark surface
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
  const px  = img.data;
  for (let i = 0; i < px.length; i += 4) {
    const n = (Math.random() - 0.5) * amp;
    px[i]     = Math.max(0, Math.min(255, r0 + n));
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

// A — Warm Ash  #CEC8BD  warm grey-putty, dense and dry
const matWarmAsh = new THREE.MeshStandardMaterial({
  map:       makeTex(0xCE, 0xC8, 0xBD, 14, 0.96, 0.90),
  roughness: 0.97,
  metalness: 0.0,
});

// B — Sora Dora  #D2CEC8  pale mineral taupe, lighter and cleaner
const matSoraDora = new THREE.MeshStandardMaterial({
  map:       makeTex(0xD2, 0xCE, 0xC8, 10, 0.97, 0.94),
  roughness: 0.96,
  metalness: 0.0,
});

// C — Deep Gunmetal  #454649  dense, architectural, satin-matte
const matTwyneGrey = new THREE.MeshStandardMaterial({
  color:     0x454649,
  roughness: 0.84,   // satin-matte: slight controlled sheen without metallic read
  metalness: 0.0,
});

let boxMat = matTwyneGrey;

// Glass body and dark cap for the bottle placeholder
const matGlass = new THREE.MeshPhysicalMaterial({
  color:        0xf2ede0,
  roughness:    0.04,
  metalness:    0.0,
  transmission: 0.80,
  thickness:    1.2,
  ior:          1.52,
  transparent:  true,
});

const matCap = new THREE.MeshStandardMaterial({
  color:     0x151210,
  roughness: 0.5,
  metalness: 0.0,
});

// Dark socket mark on base top surface
const matRecess = new THREE.MeshStandardMaterial({
  color:     0x1c1a16,
  roughness: 0.97,
  metalness: 0.0,
});

function applyMaterial(mat) {
  boxMat = mat;
  if (!rootGroup) return;
  rootGroup.traverse(obj => {
    if (obj.isMesh && obj.material !== matGlass && obj.material !== matCap && obj.material !== matRecess)
      obj.material = checkActive ? matBasicCheck : mat;
  });
}

// Flat MeshBasicMaterial (unlit) — all faces must show identical grey if material is correct
const matBasicCheck = new THREE.MeshBasicMaterial({ color: 0x858582 });
let checkActive = false;

function toggleCheck() {
  checkActive = !checkActive;
  const btn = document.getElementById('btn-matcheck');
  btn.textContent = checkActive ? 'Check: ON – lighting OFF' : 'Material Check';
  btn.classList.toggle('active', checkActive);
  // swap every exterior mesh; non-exterior mats are unchanged
  const skip = new Set([matGlass, matCap, matRecess]);
  if (rootGroup) rootGroup.traverse(obj => {
    if (!obj.isMesh || skip.has(obj.material)) return;
    obj.material = checkActive ? matBasicCheck : boxMat;
  });
}

// ─── Box groups ──────────────────────────────────────────────────────────────

let rootGroup = null;
let lidGroup  = null;

function slab(group, w, h, d, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), boxMat);
  mesh.position.set(x, y, z);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  group.add(mesh);
}

function buildBox() {
  if (rootGroup) scene.remove(rootGroup);

  const { width: W, depth: D, totalH: H, lidH: LH, board: T, clearance: C } = params;

  const seamY = H - LH;

  // Safe chamfer: must not exceed half of the smallest dimension
  const ch = Math.min(CHAMFER, seamY / 2 - 0.01, W / 2 - 0.01, D / 2 - 0.01);

  rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // ── Outer base (thin ring, solid chamfered block) ─────────────────────
  const baseMesh = new THREE.Mesh(new RoundedBoxGeometry(W, seamY, D, 3, ch), boxMat);
  baseMesh.position.set(0, seamY / 2, 0);
  baseMesh.castShadow    = true;
  baseMesh.receiveShadow = true;
  rootGroup.add(baseMesh);

  // ── Bottle recess — 0.3 mm dark mark on base top, hidden by bottle ──────
  const recessT    = 0.3;
  const recessMesh = new THREE.Mesh(new THREE.BoxGeometry(50, recessT, 50), matRecess);
  recessMesh.position.set(0, seamY + recessT / 2, 0);
  rootGroup.add(recessMesh);

  // ── Bottle — exact TWYNE dimensions ───────────────────────────────────────
  const bW      = 49.07;
  const bD      = 49.60;
  const bBodyH  = 49.68;
  const bCapH   = 27.3;              // fixed — 55% of glass body, neck hidden inside cap

  const sinkDepth = 7;
  const bBaseY  = seamY - sinkDepth; // bottle bottom 7 mm inside solid base
  const bBodyY  = bBaseY + bBodyH / 2;

  // Glass body
  const bodyMesh = new THREE.Mesh(new RoundedBoxGeometry(bW, bBodyH, bD, 3, 1.2), matGlass);
  bodyMesh.position.set(0, bBodyY, 0);
  bodyMesh.castShadow = true;
  rootGroup.add(bodyMesh);

  const bCapY      = bBaseY + bBodyH + bCapH / 2;   // cap flush on glass body
  const capMesh = new THREE.Mesh(new RoundedBoxGeometry(bW - 4, bCapH, bD - 4, 3, 0.8), matCap);
  capMesh.position.set(0, bCapY, 0);
  capMesh.castShadow = true;
  rootGroup.add(capMesh);

  // Y-stack debug — verify capTopY < lidInnerCeilingY < lidOuterTopY
  const baseTopY         = seamY;
  const bottleBottomY    = bBaseY;
  const bottleTopY       = bBaseY + bBodyH;
  const capTopY          = bBaseY + bBodyH + bCapH;
  const lidInnerCeilingY = H - T;
  const lidOuterTopY     = H;
  console.table({ baseTopY, bottleBottomY, bottleTopY, capTopY, lidInnerCeilingY, lidOuterTopY });
  console.assert(capTopY < lidInnerCeilingY, `CAP PROTRUDES: capTop ${capTopY.toFixed(2)} >= lidCeiling ${lidInnerCeilingY}`);
  console.assert(lidInnerCeilingY < lidOuterTopY, 'lidCeiling >= lidTop: board thickness error');

  // ── Lid (single solid block, chamfered all edges) ──────────────────
  //  Height is reduced by C so that base + gap + lid = totalH exactly.
  lidGroup = new THREE.Group();
  rootGroup.add(lidGroup);

  const lidBlockH  = Math.max(LH - C, 1);
  const lidChamfer = Math.min(ch, lidBlockH / 2 - 0.01);
  const lidMesh    = new THREE.Mesh(new RoundedBoxGeometry(W, lidBlockH, D, 3, lidChamfer), boxMat);
  lidMesh.position.set(0, lidBlockH / 2, 0);  // local origin at lid bottom face
  lidMesh.castShadow    = true;
  lidMesh.receiveShadow = true;
  lidGroup.add(lidMesh);

  //  Gap C between base top and lid bottom → prevents z-fighting, reads as reveal seam.
  lidGroup.position.y = seamY + C;

  controls.target.set(0, H / 2, 0);
  applyOpen();
}

function applyOpen() {
  if (!lidGroup) return;
  const { totalH: H, lidH: LH, clearance: C } = params;
  const seamY = H - LH;
  lidGroup.position.y = (seamY + C) + params.open * (LH + 20);
}

// Camera presets — snap to position then let OrbitControls take over
const CAM_PRESETS = {
  front: { p: [0,   55, 290], t: [0, 46, 0] },
  '3q':  { p: [175, 110, 220], t: [0, 46, 0] },
  side:  { p: [290,  55,   0], t: [0, 46, 0] },
  top:   { p: [0,  340,  12], t: [0, 46, 0] },
};
function goPreset(key) {
  const { p, t } = CAM_PRESETS[key];
  camera.position.set(...p);
  controls.target.set(...t);
  controls.update();
}

const dimInputs = {
  'ctrl-width':  'width',
  'ctrl-depth':  'depth',
  'ctrl-height': 'totalH',
  'ctrl-lidH':   'lidH',
  'ctrl-board':  'board',
  'ctrl-clear':  'clearance',
};

for (const [id, key] of Object.entries(dimInputs)) {
  document.getElementById(id)?.addEventListener('input', (e) => {
    params[key] = parseFloat(e.target.value) || 0;
    buildBox();
  });
}

document.getElementById('ctrl-open')?.addEventListener('input', (e) => {
  params.open = parseFloat(e.target.value);
  applyOpen();
});

const btnA = document.getElementById('btn-a');
const btnB = document.getElementById('btn-b');
const btnC = document.getElementById('btn-c');
const colorBtns = [btnA, btnB, btnC];
const setColor = (mat, active) => { applyMaterial(mat); colorBtns.forEach(b => b?.classList.remove('active')); active?.classList.add('active'); };
btnA?.addEventListener('click', () => setColor(matWarmAsh,   btnA));
btnB?.addEventListener('click', () => setColor(matSoraDora,  btnB));
btnC?.addEventListener('click', () => setColor(matTwyneGrey, btnC));

document.getElementById('btn-matcheck')?.addEventListener('click', toggleCheck);

['front','3q','side','top'].forEach(k =>
  document.getElementById(`btn-cam-${k}`)?.addEventListener('click', () => goPreset(k))
);

// ─── Resize ──────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Render loop ─────────────────────────────────────────────────────────────

(function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
})();

// ─── Init ────────────────────────────────────────────────────────────────────

buildBox();
buildDisplayBottle();
