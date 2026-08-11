import * as THREE from 'three';

// Clean, legible modern sans for all supporting packaging copy.
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

// BACK — one quiet house address only.
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
  const edge = 2.0;

  // Same-substrate blind-deboss illusion: no ink, only light/shadow.
  ctx.fillStyle = 'rgba(246,246,239,0.10)';
  ctx.fillText(text, x - edge, y - edge);
  ctx.fillStyle = 'rgba(0,0,0,0.42)';
  ctx.fillText(text, x + edge, y + edge);
  ctx.fillStyle = 'rgba(5,5,4,0.32)';
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
  if (lidGroup.userData.backWebsiteInjected) return;
  lidGroup.userData.backWebsiteInjected = true;

  const material = makeMicroWebsiteMaterial('TWYNEHAUS.COM');
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(29, 4.4), material);

  // Low on the back, close to the seam but with breathing room.
  mesh.position.set(0, 8.0, -lidSize.z / 2 - 0.112);
  mesh.rotation.y = Math.PI;
  mesh.userData.isLabel = true;
  mesh.userData.isBackWebsite = true;
  mesh.renderOrder = 32;
  lidGroup.add(mesh);
}

// Detect the deep removable lid and add only the micro website.
// The previous overlapping 'Third Field' planes were intentionally removed:
// the top is clean again and the custom TWYNE wordmark remains the hero.
const originalGroupAdd = THREE.Group.prototype.add;
let injectingBackWebsite = false;
THREE.Group.prototype.add = function(...objects) {
  const result = originalGroupAdd.apply(this, objects);
  if (injectingBackWebsite || this.userData.backWebsiteInjected) return result;

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry) continue;
    obj.geometry.computeBoundingBox?.();
    const bb = obj.geometry.boundingBox;
    if (!bb) continue;

    const size = new THREE.Vector3();
    bb.getSize(size);

    // Deep removable lid: ~90 × 75 × 90. Excludes the thin base and bottle.
    if (size.x > 84 && size.z > 84 && size.y > 60 && size.y < 100) {
      injectingBackWebsite = true;
      addBackWebsite(this, size);
      injectingBackWebsite = false;
      break;
    }
  }

  return result;
};

await document.fonts?.load?.('600 90px "Manrope"');
await document.fonts?.ready;

await import('./main-v2.js');
