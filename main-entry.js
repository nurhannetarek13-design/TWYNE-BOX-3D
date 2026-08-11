import * as THREE from 'three';

// Force a clean, legible modern sans for all supporting packaging copy.
// TWYNE itself remains the custom geometric wordmark drawn in main-v2.js.
const canvasFontDescriptor = Object.getOwnPropertyDescriptor(
  CanvasRenderingContext2D.prototype,
  'font'
);

if (canvasFontDescriptor?.set && canvasFontDescriptor?.get) {
  Object.defineProperty(CanvasRenderingContext2D.prototype, 'font', {
    configurable: true,
    enumerable: canvasFontDescriptor.enumerable,
    get() {
      return canvasFontDescriptor.get.call(this);
    },
    set(value) {
      const next = String(value)
        .replace(/\"Bodoni Moda\",\s*Didot,\s*\"Times New Roman\",\s*serif/g, '\"Manrope\", \"Helvetica Neue\", Arial, sans-serif')
        .replace(/^500\s+/, '600 ');
      canvasFontDescriptor.set.call(this, next);
    },
  });
}

// Right-side inscription: only the active state appears on the EDP box.
const originalFillText = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
  const replacements = {
    'TWO STATES': 'STATE I',
    'ABSOLU': '01 — 02',
  };
  return originalFillText.call(this, replacements[text] ?? text, ...args);
};

// ─── THE THIRD FIELD ────────────────────────────────────────────────────────
// Two large shallow pressed planes occupy the lid. Their overlap becomes a
// third, deeper field. One plane continues over the front edge so the gesture
// reads as part of the object, not as a printed graphic.
function makePressedFieldMaterial(strength = 1) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 512;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);

  // Recessed floor: same graphite substrate, only compressed tone.
  ctx.fillStyle = `rgba(7,7,6,${0.105 * strength})`;
  ctx.fillRect(0, 0, 512, 512);

  // Fine upper/left light lip and lower/right inner shadow create depth.
  const lip = Math.max(2, Math.round(4 * strength));
  ctx.fillStyle = `rgba(242,242,234,${0.065 * strength})`;
  ctx.fillRect(0, 0, 512, lip);
  ctx.fillRect(0, 0, lip, 512);

  ctx.fillStyle = `rgba(0,0,0,${0.20 * strength})`;
  ctx.fillRect(0, 512 - lip, 512, lip);
  ctx.fillRect(512 - lip, 0, lip, 512);

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

const fieldMatA = makePressedFieldMaterial(0.82);
const fieldMatB = makePressedFieldMaterial(0.96);
const fieldMatOverlap = makePressedFieldMaterial(1.55);

function addFieldPlane(parent, {
  w, h, x = 0, y = 0, z = 0,
  rx = 0, ry = 0, rz = 0,
  material = fieldMatA,
  order = 12,
}) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.userData.isLabel = true; // preserves this tonal finish when material buttons change.
  mesh.userData.isThirdField = true;
  mesh.renderOrder = order;
  parent.add(mesh);
  return mesh;
}

// Micro maker's mark for the back panel. Still tonal/blind-deboss, never white ink.
function makeMicroWebsiteMaterial(text) {
  const cv = document.createElement('canvas');
  cv.width = 1200;
  cv.height = 220;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.font = '600 64px "Manrope", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fontKerning = 'normal';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '9px';

  const x = cv.width / 2;
  const y = cv.height / 2;
  const edge = 2.4;

  // Same-substrate deboss illusion: a fine light lip, dark inner wall, compressed floor.
  ctx.fillStyle = 'rgba(246,246,239,0.12)';
  ctx.fillText(text, x - edge, y - edge);
  ctx.fillStyle = 'rgba(0,0,0,0.48)';
  ctx.fillText(text, x + edge, y + edge);
  ctx.fillStyle = 'rgba(5,5,4,0.38)';
  ctx.fillText(text, x, y);

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

function addBackWebsite(lidGroup, lidSize) {
  const material = makeMicroWebsiteMaterial('TWYNEHAUS.COM');
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(31, 4.8), material);

  // Low on the back: enough breathing room from the seam, but clearly not centered copy.
  mesh.position.set(0, 8.5, -lidSize.z / 2 - 0.112);
  mesh.rotation.y = Math.PI;
  mesh.userData.isLabel = true;
  mesh.userData.isBackWebsite = true;
  mesh.renderOrder = 32;
  lidGroup.add(mesh);
}

function injectThirdField(lidGroup, lidSize) {
  if (lidGroup.userData.thirdFieldInjected) return;
  lidGroup.userData.thirdFieldInjected = true;

  const topY = lidSize.y + 0.105;
  const frontZ = lidSize.z / 2 + 0.105;

  // STATE A — broad horizontal pressure.
  addFieldPlane(lidGroup, {
    w: 68,
    h: 30,
    x: -6,
    y: topY,
    z: -7,
    rx: -Math.PI / 2,
    material: fieldMatA,
    order: 11,
  });

  // STATE B — narrower vertical pressure, reaching the front edge.
  addFieldPlane(lidGroup, {
    w: 34,
    h: 78,
    x: 14,
    y: topY + 0.002,
    z: 3,
    rx: -Math.PI / 2,
    material: fieldMatB,
    order: 12,
  });

  // THIRD FORM — the intersection is visibly deeper, but still blind/tonal.
  addFieldPlane(lidGroup, {
    w: 31,
    h: 30,
    x: 12.5,
    y: topY + 0.004,
    z: -7,
    rx: -Math.PI / 2,
    material: fieldMatOverlap,
    order: 13,
  });

  // Continue STATE B over the front face. It stops well above the seam.
  addFieldPlane(lidGroup, {
    w: 34,
    h: 38,
    x: 14,
    y: lidSize.y - 19,
    z: frontZ,
    material: fieldMatB,
    order: 12,
  });

  // BACK — 95% silence, with one micro house address at the bottom.
  addBackWebsite(lidGroup, lidSize);
}

// main-v2 keeps the scene private, so hook the moment its deep lid mesh is
// added to its lid group. This keeps the prototype modular and reversible.
const originalGroupAdd = THREE.Group.prototype.add;
let injectingThirdField = false;
THREE.Group.prototype.add = function(...objects) {
  const result = originalGroupAdd.apply(this, objects);
  if (injectingThirdField || this.userData.thirdFieldInjected) return result;

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry) continue;
    obj.geometry.computeBoundingBox?.();
    const bb = obj.geometry.boundingBox;
    if (!bb) continue;

    const size = new THREE.Vector3();
    bb.getSize(size);

    // Deep removable lid: ~90 × 75 × 90. This excludes the thin base/bottle.
    if (size.x > 84 && size.z > 84 && size.y > 60 && size.y < 100) {
      injectingThirdField = true;
      injectThirdField(this, size);
      injectingThirdField = false;
      break;
    }
  }

  return result;
};

await document.fonts?.load?.('600 90px "Manrope"');
await document.fonts?.ready;

await import('./main-v2.js');
