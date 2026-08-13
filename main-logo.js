import * as THREE from 'three';

// Latest TWYNE wordmark supplied by the user. The top keeps the approved spacing;
// the pedestal/base uses the same letterforms with zero extra gap between them.
const EXACT_TWYNE_PATHS = [
  'M3 1L1 3L1 38L3 40L70 40L72 43L72 158L118 159L120 157L120 42L122 40L191 39L192 3L189 1Z',
  'M368 3L422 159L486 159L516 67L522 54L526 59L537 90L558 158L623 159L676 5L676 2L674 1L630 1L628 3L594 110L590 115L587 112L550 2L497 2L494 6L457 113L454 115L451 111L416 2L370 1Z',
  'M848 3L934 103L936 159L982 158L983 103L1070 4L1068 1L1012 2L964 60L958 64L907 2L850 1Z',
  'M1256 2L1256 159L1302 158L1302 49L1304 46L1331 77L1395 159L1472 158L1471 1L1425 2L1423 114L1417 110L1333 2Z',
  'M1677 15L1672 25L1670 35L1670 127L1676 144L1683 152L1696 158L1709 160L1841 160L1854 158L1860 154L1864 142L1864 127L1862 125L1729 125L1724 123L1718 114L1718 100L1721 97L1862 96L1863 66L1861 63L1727 62L1719 57L1718 50L1720 42L1725 37L1730 35L1862 35L1864 34L1863 14L1855 4L1836 0L1713 0L1690 5Z',
];

const nativeGroupAdd = THREE.Group.prototype.add;
const nativeFillText = CanvasRenderingContext2D.prototype.fillText;

function makeExactWordmarkDebossMaterial(depth = 1) {
  const cv = document.createElement('canvas');
  cv.width = 2048;
  cv.height = 180;

  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const paths = EXACT_TWYNE_PATHS.map(d => new Path2D(d));
  const sourceW = 1867;
  const sourceH = 163;
  const targetW = 1840;
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

// Dedicated pedestal wordmark: the existing empty gaps are removed completely.
// Each next letter begins exactly where the previous letter's visible bounds end.
function makeTightBaseWordmarkDebossMaterial(depth = 1) {
  const cv = document.createElement('canvas');
  cv.width = 2048;
  cv.height = 320;

  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const paths = EXACT_TWYNE_PATHS.map(d => new Path2D(d));
  // Shifts derived from the actual visible bounds of T / W / Y / N / E.
  // Result: zero tracking/gap, no overlap, no change to any letter silhouette.
  const shifts = [0, 176, 348, 534, 732];
  const compactMinX = 1;
  const compactSourceW = 1131;
  const sourceH = 163;
  const targetW = 1840;
  const scale = targetW / compactSourceW;
  const markH = sourceH * scale;
  const ox = (cv.width - targetW) / 2;
  const oy = (cv.height - markH) / 2;
  const edge = 2.8 * depth;

  function draw(dx, dy, fill) {
    paths.forEach((p, i) => {
      ctx.save();
      ctx.translate(
        ox + dx - (shifts[i] + compactMinX) * scale,
        oy + dy
      );
      ctx.scale(scale, scale);
      ctx.fillStyle = fill;
      ctx.fill(p);
      ctx.restore();
    });
  }

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

function makeSizeCopyMaterial() {
  const cv = document.createElement('canvas');
  cv.width = 1600;
  cv.height = 210;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fontKerning = 'normal';
  ctx.font = '400 72px "Inter Tight", "Helvetica Neue", Helvetica, Arial, sans-serif';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '9px';

  // Match the restrained tonal hierarchy of the other box typography.
  ctx.fillStyle = 'rgba(226,223,215,0.34)';
  nativeFillText.call(ctx, '50 ML / 1.7 FL. OZ.', cv.width / 2, cv.height / 2);

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
  const logoW = 72;
  const logoH = logoW * (163 / 1867);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(logoW, logoH),
    makeExactWordmarkDebossMaterial(1.0)
  );
  mesh.position.copy(oldMesh.position);
  mesh.position.y += 0.012;
  mesh.position.z += 0.012;
  mesh.rotation.copy(oldMesh.rotation);
  mesh.renderOrder = 38;
  mesh.userData.isLabel = true;
  mesh.userData.isExactTwyneLogo = true;
  nativeGroupAdd.call(parent, mesh);
}

function addExactBaseLogo(parent, oldMesh) {
  const logoW = 59;
  const logoH = logoW * (163 / 1131);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(logoW, logoH),
    makeTightBaseWordmarkDebossMaterial(1.10)
  );
  mesh.position.copy(oldMesh.position);
  mesh.position.x = 0;
  mesh.position.y = 8.0;
  mesh.position.z += 0.018;
  mesh.rotation.copy(oldMesh.rotation);
  mesh.renderOrder = 39;
  mesh.userData.isLabel = true;
  mesh.userData.isExactTwyneLogo = true;
  mesh.userData.isExactTwyneBaseLogo = true;
  nativeGroupAdd.call(parent, mesh);
}

function addReadableSizeCopy(parent, oldMesh) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(47, 6.2),
    makeSizeCopyMaterial()
  );
  mesh.position.copy(oldMesh.position);
  mesh.position.x = 0;
  mesh.position.y = 7.9;
  mesh.position.z += 0.014;
  mesh.rotation.copy(oldMesh.rotation);
  mesh.renderOrder = 36;
  mesh.userData.isLabel = true;
  mesh.userData.isReadableSizeCopy = true;
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
    const isHorizontal = Math.abs(obj.rotation.x) < 0.08 && Math.abs(obj.rotation.y) < 0.08;

    const isTopWordmark =
      w >= 68 && w <= 72 &&
      h >= 6 && h <= 8 &&
      Math.abs(obj.rotation.x + Math.PI / 2) < 0.08;

    const isBaseWordmark =
      w >= 47 && w <= 49 &&
      h >= 4.2 && h <= 5.2 &&
      isHorizontal &&
      obj.position.y < 12;

    const isSizeCopy =
      w >= 41 && w <= 43 &&
      h >= 5.0 && h <= 5.8 &&
      isHorizontal &&
      obj.position.y < 12;

    if (isTopWordmark) {
      addExactTopLogo(this, obj);
      obj.visible = false;
      continue;
    }

    if (isBaseWordmark) {
      addExactBaseLogo(this, obj);
      obj.visible = false;
      continue;
    }

    if (isSizeCopy) {
      addReadableSizeCopy(this, obj);
      obj.visible = false;
    }
  }

  return result;
};

await import('./main-entry.js');