import * as THREE from 'three';

// FINAL TWYNE FINISH SYSTEM
// TOP + BASE: subtle BLIND DEBOSS, graphite-on-graphite.
// No raised extrusion, no ink, no foil. The mark reads through a shallow
// recessed edge response only, matching a ~0.22 mm production deboss intent.

const EXACT_TWYNE_PATHS = [
  'M1 3L2 18L30 15L82 15L84 17L84 191L82 200L111 201L112 199L110 189L110 17L115 15L162 15L195 18L196 4Z',
  'M359 3L367 17L437 185L445 201L463 200L539 31L543 35L573 106L613 194L614 199L616 201L634 200L689 76L707 40L715 20L724 4L701 3L700 13L693 32L632 169L630 170L624 160L599 99L556 3L522 3L528 16L473 144L460 171L454 161L430 100L403 38L394 13L393 4Z',
  'M881 3L972 117L972 190L970 200L999 201L1000 200L998 191L998 115L1094 3L1069 3L1067 9L1060 19L991 103L937 37L920 14L915 3Z',
  'M1260 3L1262 13L1262 183L1259 198L1260 201L1281 200L1278 186L1279 33L1450 200L1471 200L1470 17L1472 3L1452 3L1454 11L1455 28L1455 165L1453 167L1399 116L1285 3Z',
  'M1657 3L1659 13L1659 188L1656 200L1831 201L1833 195L1833 186L1831 185L1819 187L1687 187L1685 185L1685 109L1687 107L1800 108L1801 94L1800 92L1780 94L1687 94L1687 16L1808 15L1832 17L1833 3Z',
];

const sourceW = 1834;
const sourceH = 204;
const LOGO_W = 72;
const LOGO_H = LOGO_W * (sourceH / sourceW);
const nativeGroupAdd = THREE.Group.prototype.add;

function drawBlindDebossTexture() {
  const cv = document.createElement('canvas');
  cv.width = 2048;
  cv.height = 300;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const paths = EXACT_TWYNE_PATHS.map(d => new Path2D(d));
  const targetW = 1840;
  const scale = targetW / sourceW;
  const markH = sourceH * scale;
  const ox = (cv.width - targetW) / 2;
  const oy = (cv.height - markH) / 2;

  function draw(dx, dy, fill) {
    ctx.save();
    ctx.translate(ox + dx, oy + dy);
    ctx.scale(scale, scale);
    ctx.fillStyle = fill;
    paths.forEach(path => ctx.fill(path));
    ctx.restore();
  }

  // Recessed edge logic: invert the old emboss lighting.
  // A restrained pale upper-left inner edge + darker lower-right inner edge
  // makes the mark read as pressed INTO the wrap, not sitting on top of it.
  draw(-1.8, -1.8, 'rgba(232,230,223,0.105)');
  draw(1.9, 1.9, 'rgba(0,0,0,0.28)');

  // Centre stays almost the same graphite as the paper: no printed fill.
  draw(0, 0, 'rgba(53,53,50,0.16)');

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const sharedDebossTexture = drawBlindDebossTexture();

function makeDebossMaterial() {
  return new THREE.MeshBasicMaterial({
    map: sharedDebossTexture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function applyBlindDeboss(mesh) {
  if (!mesh?.isMesh || !mesh.userData?.isExactTwyneLogo) return;

  const isBase = !!mesh.userData.isExactTwyneBaseLogo;
  const isTop = !isBase && Math.abs(mesh.rotation.x + Math.PI / 2) < 0.08;
  if (!isTop && !isBase) return;

  // Keep the exact approved artwork and proportions on both faces.
  mesh.geometry?.dispose?.();
  mesh.geometry = new THREE.PlaneGeometry(LOGO_W, LOGO_H);
  mesh.material = makeDebossMaterial();

  if (isTop) {
    // Almost flush with the lid: no raised silhouette from side angles.
    mesh.position.y += 0.004;
    mesh.renderOrder = 50;
  } else {
    mesh.position.x = 0;
    mesh.position.y = 8.0;
    mesh.position.z += 0.004;
    mesh.renderOrder = 51;
  }

  mesh.visible = true;
  mesh.userData.finish = 'subtle-blind-deboss';
  mesh.userData.productionDebossDepthMM = 0.22;
  mesh.userData.isRaisedGeometry = false;
  mesh.userData.matchesTopExactly = true;
  mesh.userData.wordmarkVersion = 'TWYNE-new-2026-08-15';
}

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.userData?.isExactTwyneLogo) continue;
    // Let all legacy placement wrappers unwind, then enforce the final finish.
    queueMicrotask(() => applyBlindDeboss(obj));
  }

  return result;
};

await import('./main-base-polish.js');
