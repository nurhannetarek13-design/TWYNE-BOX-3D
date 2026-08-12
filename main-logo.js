import * as THREE from 'three';

// Latest TWYNE wordmark supplied by the user. The silhouette is traced directly
// from the transparent PNG so the spacing and proportions stay faithful to the
// approved artwork while remaining reliable inside the local Three.js prototype.
const EXACT_TWYNE_PATHS = [
  'M3 1L1 3L1 38L3 40L70 40L72 43L72 158L118 159L120 157L120 42L122 40L191 39L192 3L189 1Z',
  'M368 3L422 159L486 159L516 67L522 54L526 59L537 90L558 158L623 159L676 5L676 2L674 1L630 1L628 3L594 110L590 115L587 112L550 2L497 2L494 6L457 113L454 115L451 111L416 2L370 1Z',
  'M848 3L934 103L936 159L982 158L983 103L1070 4L1068 1L1012 2L964 60L958 64L907 2L850 1Z',
  'M1256 2L1256 159L1302 158L1302 49L1304 46L1331 77L1395 159L1472 158L1471 1L1425 2L1423 114L1417 110L1333 2Z',
  'M1677 15L1672 25L1670 35L1670 127L1676 144L1683 152L1696 158L1709 160L1841 160L1854 158L1860 154L1864 142L1864 127L1862 125L1729 125L1724 123L1718 114L1718 100L1721 97L1862 96L1863 66L1861 63L1727 62L1719 57L1718 50L1720 42L1725 37L1730 35L1862 35L1864 34L1863 14L1855 4L1836 0L1713 0L1690 5Z',
];

const nativeGroupAdd = THREE.Group.prototype.add;

function makeExactWordmarkDebossMaterial(depth = 1) {
  const cv = document.createElement('canvas');
  cv.width = 1536;
  cv.height = 256;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const paths = EXACT_TWYNE_PATHS.map(d => new Path2D(d));
  const sourceW = 1867;
  const sourceH = 163;
  const targetW = 1340;
  const scale = targetW / sourceW;
  const markH = sourceH * scale;
  const ox = (cv.width - targetW) / 2;
  const oy = (cv.height - markH) / 2;
  const edge = 2.8 * depth;

  function draw(dx, dy, fill) {
    ctx.save();
    ctx.translate(ox + dx, oy + dy);
    ctx.scale(scale, scale);
    ctx.fillStyle = fill;
    paths.forEach(p => ctx.fill(p));
    ctx.restore();
  }

  // Tonal blind-deboss simulation only: subtle light lip, darker inner wall,
  // recessed centre. No printed ink, foil, or sticker appearance.
  draw(-edge, -edge, `rgba(230,230,224,${0.15 * depth})`);
  draw(edge, edge, `rgba(0,0,0,${0.64 * depth})`);
  draw(0, 0, `rgba(6,6,5,${0.54 * depth})`);

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

function addExactTopLogo(parent, oldMesh) {
  // Preserve the supplied artwork's very wide, low aspect ratio.
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(72, 6.3),
    makeExactWordmarkDebossMaterial(1.0)
  );
  mesh.position.copy(oldMesh.position);
  mesh.position.y += 0.012;
  mesh.rotation.copy(oldMesh.rotation);
  mesh.renderOrder = 38;
  mesh.userData.isLabel = true;
  mesh.userData.isExactTwyneLogo = true;
  nativeGroupAdd.call(parent, mesh);
}

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry || !obj.userData?.isLabel) continue;
    const p = obj.geometry.parameters;
    if (!p) continue;

    const w = p.width ?? 0;
    const h = p.height ?? 0;
    const isTopWordmark =
      w >= 68 && w <= 72 &&
      h >= 6 && h <= 8 &&
      Math.abs(obj.rotation.x + Math.PI / 2) < 0.08;

    if (!isTopWordmark) continue;

    addExactTopLogo(this, obj);
    obj.visible = false;
  }

  return result;
};

await import('./main-entry.js');
