import * as THREE from 'three';

// FINAL TWYNE FINISH SYSTEM
// Uses the NEW approved TWYNE wordmark supplied by the user.
// TOP + BASE: identical blind emboss, graphite-on-graphite.
// FRONT: existing flat tonal typography remains untouched.

// Vector trace of the new supplied TWYNE artwork, cropped to its visible bounds.
// Source visible bounds: 1834 x 204 px.
const EXACT_TWYNE_PATHS = [
  'M1 3L2 18L30 15L82 15L84 17L84 191L82 200L111 201L112 199L110 189L110 17L115 15L162 15L195 18L196 4Z',
  'M359 3L367 17L437 185L445 201L463 200L539 31L543 35L573 106L613 194L614 199L616 201L634 200L689 76L707 40L715 20L724 4L701 3L700 13L693 32L632 169L630 170L624 160L599 99L556 3L522 3L528 16L473 144L460 171L454 161L430 100L403 38L394 13L393 4Z',
  'M881 3L972 117L972 190L970 200L999 201L1000 200L998 191L998 115L1094 3L1069 3L1067 9L1060 19L991 103L937 37L920 14L915 3Z',
  'M1260 3L1262 13L1262 183L1259 198L1260 201L1281 200L1278 186L1279 33L1450 200L1471 200L1470 17L1472 3L1452 3L1454 11L1455 28L1455 165L1453 167L1399 116L1285 3Z',
  'M1657 3L1659 13L1659 188L1656 200L1831 201L1833 195L1833 186L1831 185L1819 187L1687 187L1685 185L1685 109L1687 107L1800 108L1801 94L1800 92L1780 94L1687 94L1687 16L1808 15L1832 17L1833 3Z',
];

const sourceW = 1834;
const sourceH = 204;
const nativeGroupAdd = THREE.Group.prototype.add;

function drawWordmarkTexture() {
  const cv = document.createElement('canvas');
  cv.width = 2048;
  cv.height = 260;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const paths = EXACT_TWYNE_PATHS.map(d => new Path2D(d));
  const targetW = 1840;
  const scale = targetW / sourceW;
  const markH = sourceH * scale;
  const ox = (cv.width - targetW) / 2;
  const oy = (cv.height - markH) / 2;

  const draw = (dx, dy, fill) => {
    ctx.save();
    ctx.translate(ox + dx, oy + dy);
    ctx.scale(scale, scale);
    ctx.fillStyle = fill;
    paths.forEach(path => ctx.fill(path));
    ctx.restore();
  };

  // Raised blind emboss: same graphite-on-graphite treatment for TOP and BASE.
  // No cream ink, no foil, no separate base-specific styling.
  draw(-3.2, -3.2, 'rgba(0,0,0,0.46)');
  draw(3.0, 3.0, 'rgba(238,236,229,0.19)');
  draw(0, 0, 'rgba(77,77,73,0.22)');

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// Single source of truth for both TOP and BASE logo finish.
const sharedEmbossMaterial = new THREE.MeshBasicMaterial({
  map: drawWordmarkTexture(),
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  toneMapped: false,
});

function applyFinalFinish(mesh) {
  if (!mesh?.isMesh || !mesh.userData?.isExactTwyneLogo) return;

  const isBase = !!mesh.userData.isExactTwyneBaseLogo;
  const isTop = !isBase && Math.abs(mesh.rotation.x + Math.PI / 2) < 0.08;
  if (!isTop && !isBase) return;

  // New logo is wider-and-taller than the previous artwork, so preserve its
  // exact supplied proportions on both faces.
  const logoW = 72;
  const logoH = logoW * (sourceH / sourceW);
  mesh.geometry?.dispose?.();
  mesh.geometry = new THREE.PlaneGeometry(logoW, logoH);
  mesh.material = sharedEmbossMaterial.clone();
  mesh.material.map = sharedEmbossMaterial.map;
  mesh.material.needsUpdate = true;

  if (isTop) {
    mesh.position.y += 0.010;
    mesh.renderOrder = 50;
  } else {
    // Centre the identical wordmark on the 16 mm visible pedestal.
    mesh.position.x = 0;
    mesh.position.y = 8.0;
    mesh.position.z += 0.012;
    mesh.renderOrder = 51;
  }

  mesh.userData.finish = 'blind-emboss';
  mesh.userData.matchesTopExactly = true;
  mesh.userData.wordmarkVersion = 'TWYNE-new-2026-08-15';
}

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.userData?.isExactTwyneLogo) continue;

    // Other legacy polish layers finish during the same add call.
    // Apply the final approved logo after that stack has unwound.
    queueMicrotask(() => applyFinalFinish(obj));
  }

  return result;
};

await import('./main-base-polish.js');
