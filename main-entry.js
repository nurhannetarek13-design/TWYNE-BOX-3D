import * as THREE from 'three';

// Supporting copy: clean modern sans. TWYNE wordmark remains custom in main-v2.js.
const canvasFontDescriptor = Object.getOwnPropertyDescriptor(
  CanvasRenderingContext2D.prototype,
  'font'
);

if (canvasFontDescriptor?.set && canvasFontDescriptor?.get) {
  Object.defineProperty(CanvasRenderingContext2D.prototype, 'font', {
    configurable: true,
    enumerable: canvasFontDescriptor.enumerable,
    get() { return canvasFontDescriptor.get.call(this); },
    set(value) {
      const next = String(value)
        .replace(/\"Bodoni Moda\",\s*Didot,\s*\"Times New Roman\",\s*serif/g, '\"Manrope\", \"Helvetica Neue\", Arial, sans-serif')
        .replace(/^500\s+/, '600 ');
      canvasFontDescriptor.set.call(this, next);
    },
  });
}

const originalVectorSet = THREE.Vector3.prototype.set;
let prototypeCameraPosition = null;
THREE.Vector3.prototype.set = function(x, y, z) {
  if (x === 175 && y === 110 && z === 220 && !prototypeCameraPosition) {
    prototypeCameraPosition = this;
  }
  return originalVectorSet.call(this, x, y, z);
};

const originalFillText = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
  const replacements = {
    'TWO STATES': 'STATE I',
    'ABSOLU': '01 — 02',
  };
  return originalFillText.call(this, replacements[text] ?? text, ...args);
};

function makeMicroTextMaterial(lines) {
  const cv = document.createElement('canvas');
  cv.width = 1400;
  cv.height = 300;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fontKerning = 'normal';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '7px';

  const lineH = 82;
  const y0 = cv.height / 2 - ((lines.length - 1) * lineH) / 2;

  lines.forEach((line, i) => {
    const y = y0 + i * lineH;
    ctx.font = `${i === 0 ? 600 : 500} ${i === 0 ? 60 : 48}px \"Manrope\", \"Helvetica Neue\", Arial, sans-serif`;
    ctx.fillStyle = i === 0 ? 'rgba(7,7,6,0.68)' : 'rgba(7,7,6,0.48)';
    ctx.fillText(line, cv.width / 2, y);
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

function addFilmFrame(lidGroup, lidSize) {
  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    './assets/kenopsia-film-frame-v2.jpg?v=3',
    () => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    },
    undefined,
    (err) => console.error('KENOPSIA film frame failed to load', err)
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const imageMat = new THREE.MeshBasicMaterial({
    map: texture,
    color: new THREE.Color(0xb8b8b8),
    toneMapped: false,
    side: THREE.DoubleSide,
  });

  const image = new THREE.Mesh(new THREE.PlaneGeometry(74, 55.5), imageMat);
  image.position.set(0, 44.8, -lidSize.z / 2 - 0.26);
  image.rotation.y = Math.PI;
  image.renderOrder = 40;
  image.userData.isLabel = true;
  image.userData.isFilmFrame = true;
  lidGroup.add(image);

  const meta = new THREE.Mesh(
    new THREE.PlaneGeometry(56, 8.5),
    makeMicroTextMaterial([
      'VOLUME I — KENOPSIA',
      'FILM 01 / FRAME 0047',
      'TWYNEHAUS.COM',
    ])
  );
  meta.position.set(0, 9.5, -lidSize.z / 2 - 0.27);
  meta.rotation.y = Math.PI;
  meta.renderOrder = 42;
  meta.userData.isLabel = true;
  meta.userData.isFilmMeta = true;
  lidGroup.add(meta);
}

const originalGroupAdd = THREE.Group.prototype.add;
let injectingFilmBack = false;
THREE.Group.prototype.add = function(...objects) {
  const result = originalGroupAdd.apply(this, objects);
  if (injectingFilmBack || this.userData.filmBackInjected) return result;

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry) continue;
    obj.geometry.computeBoundingBox?.();
    const bb = obj.geometry.boundingBox;
    if (!bb) continue;

    const size = new THREE.Vector3();
    bb.getSize(size);

    if (size.x > 84 && size.z > 84 && size.y > 60 && size.y < 100) {
      this.userData.filmBackInjected = true;
      injectingFilmBack = true;
      addFilmFrame(this, size);
      injectingFilmBack = false;
      break;
    }
  }

  return result;
};

await document.fonts?.load?.('600 90px \"Manrope\"');
await document.fonts?.ready;
await import('./main-v2.js');

if (prototypeCameraPosition) {
  originalVectorSet.call(prototypeCameraPosition, 175, 105, -225);
}

document.getElementById('btn-cam-back')?.addEventListener('click', () => {
  if (!prototypeCameraPosition) return;
  originalVectorSet.call(prototypeCameraPosition, 0, 55, -290);
});
