import * as THREE from 'three';

// TWYNE GIFT SET v29 — SYNCHRONOUS LOGO + LOWER TYPE BLOCK
// Keeps v28 structure/materials. Fixes the missing logo by drawing the approved
// TWYNE geometry directly into a CanvasTexture (no async image/SVG loading).
// Moves the visible text block lower on the sleeve.

const nativeAdd = THREE.Group.prototype.add;
const refs = { logo: null, sleeveGroup: null, volume: null, kenposia: null, eau: null };

function sizeOf(obj) {
  if (!obj?.geometry) return null;
  obj.geometry.computeBoundingBox?.();
  const bb = obj.geometry.boundingBox;
  if (!bb) return null;
  const s = new THREE.Vector3();
  bb.getSize(s);
  return s;
}

THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh) continue;
    const s = sizeOf(obj);
    if (!s) continue;

    if (obj.name === 'TWYNE_INLINE_EXACT_LOGO_V28' ||
        (Math.abs(s.x - 126) < 0.8 && Math.abs(s.y - 31.5) < 0.8 && Math.abs(s.z) < 0.1)) {
      refs.logo = obj;
      refs.sleeveGroup = this;
    }
    if (Math.abs(s.x - 46) < 0.8 && Math.abs(s.y - 5.3) < 0.8 && Math.abs(s.z) < 0.1) refs.volume = obj;
    if (Math.abs(s.x - 72) < 0.9 && Math.abs(s.y - 5.5) < 0.8 && Math.abs(s.z) < 0.1) refs.kenposia = obj;
    if (Math.abs(s.x - 52) < 0.9 && Math.abs(s.y - 4.2) < 0.8 && Math.abs(s.z) < 0.1) refs.eau = obj;
  }
  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v28.js');
THREE.Group.prototype.add = nativeAdd;

// Hide the v28 async texture logo completely.
if (refs.logo) refs.logo.visible = false;

function makeExactLogoTexture() {
  const cv = document.createElement('canvas');
  cv.width = 2048;
  cv.height = 512;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#000000';

  const paths = [
    'M 1760 193 L 1760 318 L 1763 323 L 1769 328 L 1777 331 L 1792 333 L 1923 333 L 1938 331 L 1947 327 L 1952 322 L 1956 316 L 1956 300 L 1808 300 L 1808 271 L 1953 271 L 1953 237 L 1808 237 L 1808 218 L 1811 212 L 1817 208 L 1826 206 L 1956 206 L 1956 192 L 1951 185 L 1943 180 L 1932 177 L 1917 176 L 1795 176 L 1780 178 L 1771 181 L 1764 186 Z',
    'M 1345 176 L 1345 333 L 1393 333 L 1393 219 L 1487 333 L 1563 333 L 1563 176 L 1514 176 L 1514 288 L 1422 176 Z',
    'M 938 176 L 1025 270 L 1025 333 L 1074 333 L 1074 270 L 1161 176 L 1103 176 L 1050 238 L 998 176 Z',
    'M 458 176 L 510 333 L 574 333 L 612 226 L 648 333 L 713 333 L 767 176 L 717 176 L 680 290 L 642 176 L 584 176 L 544 290 L 507 176 Z',
    'M 91 176 L 91 214 L 162 214 L 162 333 L 211 333 L 211 214 L 283 214 L 283 176 Z'
  ];

  paths.forEach(d => ctx.fill(new Path2D(d)));

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

if (refs.sleeveGroup) {
  const exactLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(122, 30.5),
    new THREE.MeshBasicMaterial({
      map: makeExactLogoTexture(),
      transparent: true,
      opacity: 1,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    })
  );
  exactLogo.rotation.x = -Math.PI / 2;
  exactLogo.position.set(0, 20.18, -16.5);
  exactLogo.renderOrder = 9000;
  exactLogo.name = 'TWYNE_CANVAS_EXACT_LOGO_V29';
  nativeAdd.call(refs.sleeveGroup, exactLogo);
}

function forceVisible(mesh, order) {
  if (!mesh) return;
  mesh.visible = true;
  mesh.renderOrder = order;
  if (mesh.material) {
    mesh.material.transparent = true;
    mesh.material.opacity = 1;
    mesh.material.depthWrite = false;
    mesh.material.depthTest = false;
    mesh.material.toneMapped = false;
    mesh.material.needsUpdate = true;
  }
}

// Move the visible copy lower as one compact block.
if (refs.volume) {
  refs.volume.position.set(0, 20.20, 10.0);
  forceVisible(refs.volume, 9001);
}
if (refs.kenposia) {
  refs.kenposia.position.set(0, 20.22, 19.0);
  forceVisible(refs.kenposia, 9002);
}
if (refs.eau) {
  refs.eau.position.set(0, 20.24, 27.2);
  forceVisible(refs.eau, 9003);
}
