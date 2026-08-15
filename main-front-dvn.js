import * as THREE from 'three';

// TWYNE HOUSE TYPOGRAPHY CONTROLLER
// FRONT: VOLUME I / KENOPSIA only
// SIDES: product + house details
// BACK: film metadata follows the exact same house typography system
// All supporting copy uses the SAME Dries-reference equivalent used before:
// Inter Tight 400 / Helvetica Neue fallback, controlled tracking, DARK tonal ink.
// The custom TWYNE wordmark / emboss system is untouched.
const nativeGroupAdd = THREE.Group.prototype.add;
const nativeFillText = CanvasRenderingContext2D.prototype.fillText;

const HOUSE_FONT = '"Inter Tight", "Helvetica Neue", Helvetica, Arial, sans-serif';
const HOUSE_INK = 'rgba(7,7,6,0.74)';
const HOUSE_INK_SOFT = 'rgba(7,7,6,0.58)';

// Load the exact house face BEFORE any canvas text texture is generated.
// This prevents the browser from silently baking Helvetica/Arial fallback into the 3D textures.
if (!document.querySelector('link[data-twyne-house-font="inter-tight"]')) {
  const houseFontLink = document.createElement('link');
  houseFontLink.rel = 'stylesheet';
  houseFontLink.dataset.twyneHouseFont = 'inter-tight';
  houseFontLink.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400&display=swap';
  document.head.appendChild(houseFontLink);
}

function makeHouseTextMaterial(text, {
  fontSize = 78,
  tracking = 8,
  opacity = 'main',
} = {}) {
  const cv = document.createElement('canvas');
  cv.width = 1800;
  cv.height = 320;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fontKerning = 'normal';
  ctx.font = `400 ${fontSize}px ${HOUSE_FONT}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${tracking}px`;
  ctx.fillStyle = opacity === 'soft' ? HOUSE_INK_SOFT : HOUSE_INK;
  nativeFillText.call(ctx, text, cv.width / 2, cv.height / 2);

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

function makeBackMetaMaterial() {
  const cv = document.createElement('canvas');
  cv.width = 1600;
  cv.height = 360;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fontKerning = 'normal';

  const lines = [
    ['VOLUME I — KENOPSIA', 62, 9, HOUSE_INK],
    ['FILM 01 / FRAME 0047', 52, 8, HOUSE_INK_SOFT],
    ['TWYNEHAUS.COM', 52, 8, HOUSE_INK_SOFT],
  ];
  const ys = [90, 180, 270];

  lines.forEach(([text, size, tracking, fill], i) => {
    ctx.font = `400 ${size}px ${HOUSE_FONT}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${tracking}px`;
    ctx.fillStyle = fill;
    nativeFillText.call(ctx, text, cv.width / 2, ys[i]);
  });

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

function addHouseText(parent, text, anchor, {
  w,
  h,
  fontSize,
  tracking,
  opacity = 'main',
  x,
  y,
  z,
  rx,
  ry,
  rz,
  tag,
} = {}) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    makeHouseTextMaterial(text, { fontSize, tracking, opacity })
  );

  mesh.position.copy(anchor.position);
  mesh.rotation.copy(anchor.rotation);
  if (x !== undefined) mesh.position.x = x;
  if (y !== undefined) mesh.position.y = y;
  if (z !== undefined) mesh.position.z = z;
  if (rx !== undefined) mesh.rotation.x = rx;
  if (ry !== undefined) mesh.rotation.y = ry;
  if (rz !== undefined) mesh.rotation.z = rz;

  if (Math.abs(mesh.rotation.y) < 0.08) mesh.position.z += 0.018;
  else mesh.position.x += Math.sign(mesh.position.x || 1) * 0.018;

  mesh.renderOrder = 46;
  mesh.userData.isLabel = true;
  mesh.userData.isHouseTypography = true;
  mesh.userData.houseTypographyTag = tag || text;
  nativeGroupAdd.call(parent, mesh);
  return mesh;
}

function isFront(obj) {
  return Math.abs(obj.rotation.x) < 0.08 &&
    Math.abs(obj.rotation.y) < 0.08 &&
    obj.position.z > 40;
}

function isLeftSide(obj) {
  return Math.abs(obj.rotation.y + Math.PI / 2) < 0.08 && obj.position.x < -40;
}

function isRightSide(obj) {
  return Math.abs(obj.rotation.y - Math.PI / 2) < 0.08 && obj.position.x > 40;
}

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry || !obj.userData?.isLabel || obj.userData?.isHouseTypography) continue;
    const p = obj.geometry.parameters;
    if (!p) continue;

    // ---------- BACK ----------
    if (obj.userData?.isFilmMeta) {
      obj.material?.dispose?.();
      obj.material = makeBackMetaMaterial();
      obj.material.needsUpdate = true;
      obj.userData.isHouseTypography = true;
      obj.userData.houseTypographyTag = 'back-film-meta';
      continue;
    }

    const w = p.width ?? 0;
    const h = p.height ?? 0;

    // ---------- FRONT ----------
    if (isFront(obj) && w >= 38 && w <= 40 && h >= 7 && h <= 8) {
      obj.visible = false;
      addHouseText(this, 'VOLUME I', obj, {
        w: 43,
        h: 6.2,
        fontSize: 76,
        tracking: 9,
        opacity: 'main',
        tag: 'front-volume',
      });
      continue;
    }

    if (isFront(obj) && w >= 51 && w <= 53 && h >= 9 && h <= 11) {
      obj.visible = false;
      addHouseText(this, 'KENOPSIA', obj, {
        w: 56,
        h: 7.6,
        fontSize: 96,
        tracking: 10,
        opacity: 'main',
        tag: 'front-volume-name',
      });
      continue;
    }

    if (isFront(obj) && w >= 41 && w <= 43 && h >= 5 && h <= 6) {
      obj.visible = false;
      continue;
    }

    // ---------- LEFT SIDE ----------
    if (isLeftSide(obj) && w >= 61 && w <= 63 && h >= 8 && h <= 10) {
      obj.visible = false;

      addHouseText(this, 'A HAUS OF VOLUMES', obj, {
        w: 63,
        h: 6.6,
        fontSize: 72,
        tracking: 8,
        opacity: 'main',
        y: obj.position.y + 5.5,
        tag: 'left-house',
      });

      addHouseText(this, '50 ML / 1.7 FL. OZ.', obj, {
        w: 59,
        h: 5.8,
        fontSize: 64,
        tracking: 7,
        opacity: 'soft',
        y: obj.position.y - 6.2,
        tag: 'left-size',
      });
      continue;
    }

    // ---------- RIGHT SIDE ----------
    if (isRightSide(obj) && w >= 41 && w <= 43 && h >= 6 && h <= 7) {
      obj.visible = false;
      addHouseText(this, 'STATE I', obj, {
        w: 42,
        h: 5.8,
        fontSize: 68,
        tracking: 8,
        opacity: 'soft',
        tag: 'right-state',
      });
      continue;
    }

    if (isRightSide(obj) && w >= 57 && w <= 59 && h >= 8 && h <= 10) {
      obj.visible = false;
      addHouseText(this, 'EAU DE PARFUM', obj, {
        w: 60,
        h: 6.6,
        fontSize: 76,
        tracking: 8,
        opacity: 'main',
        tag: 'right-edp',
      });
      continue;
    }

    if (isRightSide(obj) && w >= 33 && w <= 35 && h >= 6 && h <= 7) {
      obj.visible = false;
      addHouseText(this, '01 — 02', obj, {
        w: 40,
        h: 5.8,
        fontSize: 68,
        tracking: 8,
        opacity: 'soft',
        tag: 'right-code',
      });
    }
  }

  return result;
};

// Critical: wait for Inter Tight 400 BEFORE importing the renderer/build chain.
await document.fonts?.load?.('400 96px "Inter Tight"');
await document.fonts?.ready;
await import('./main-finish-system.js');
