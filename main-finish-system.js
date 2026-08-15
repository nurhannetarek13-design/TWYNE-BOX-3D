import * as THREE from 'three';

// FINAL TWYNE FINISH SYSTEM
// TOP + BASE: identical blind emboss, graphite-on-graphite (same wordmark,
// spacing, proportions, colour and raised finish)
// FRONT: existing flat tonal typography remains untouched

const EXACT_TWYNE_PATHS = [
  'M3 1L1 3L1 38L3 40L70 40L72 43L72 158L118 159L120 157L120 42L122 40L191 39L192 3L189 1Z',
  'M368 3L422 159L486 159L516 67L522 54L526 59L537 90L558 158L623 159L676 5L676 2L674 1L630 1L628 3L594 110L590 115L587 112L550 2L497 2L494 6L457 113L454 115L451 111L416 2L370 1Z',
  'M848 3L934 103L936 159L982 158L983 103L1070 4L1068 1L1012 2L964 60L958 64L907 2L850 1Z',
  'M1256 2L1256 159L1302 158L1302 49L1304 46L1331 77L1395 159L1472 158L1471 1L1425 2L1423 114L1417 110L1333 2Z',
  'M1677 15L1672 25L1670 35L1670 127L1676 144L1683 152L1696 158L1709 160L1841 160L1854 158L1860 154L1864 142L1864 127L1862 125L1729 125L1724 123L1718 114L1718 100L1721 97L1862 96L1863 66L1861 63L1727 62L1719 57L1718 50L1720 42L1725 37L1730 35L1862 35L1864 34L1863 14L1855 4L1836 0L1713 0L1690 5Z',
];

const sourceW = 1867;
const sourceH = 163;
const nativeGroupAdd = THREE.Group.prototype.add;

function drawWordmarkTexture() {
  const cv = document.createElement('canvas');
  cv.width = 2048;
  cv.height = 180;
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

  // TOP and BASE use the exact same wordmark geometry ratio, spacing and material.
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
    // Centre the identical top-view wordmark on the 16 mm visible pedestal.
    mesh.position.x = 0;
    mesh.position.y = 8.0;
    mesh.position.z += 0.012;
    mesh.renderOrder = 51;
  }

  mesh.userData.finish = 'blind-emboss';
  mesh.userData.matchesTopExactly = true;
}

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.userData?.isExactTwyneLogo) continue;

    // Other legacy polish layers finish during the same add call.
    // Apply the final house finish after that stack has unwound.
    queueMicrotask(() => applyFinalFinish(obj));
  }

  return result;
};

await import('./main-base-polish.js');
