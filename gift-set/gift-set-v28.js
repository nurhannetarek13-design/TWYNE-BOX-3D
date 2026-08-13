import * as THREE from 'three';

// TWYNE GIFT SET v28 — LOGO HARD-FIX + CLEAN SLEEVE
// Patch over v27.
// - Exact TWYNE wordmark is embedded inline as SVG so it cannot fail from asset loading.
// - All fragrance-name labels are hidden from the outer presentation.
// - Cover hierarchy is larger, tighter, darker.
// - Linen texture treatment is reinforced across all paper parts.

const nativeAdd = THREE.Group.prototype.add;
const refs = {
  logo: null,
  volume: null,
  kenposia: null,
  eau: null,
  testerLabels: [],
  paperMeshes: [],
};
let sleeveGroupRef = null;

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

    if (obj.material?.map && obj.material?.isMeshStandardMaterial) {
      refs.paperMeshes.push(obj);
    }

    if (Math.abs(s.x - 112) < 1.0 && Math.abs(s.y - 28) < 1.0 && Math.abs(s.z) < 0.1) {
      refs.logo = obj;
      sleeveGroupRef = this;
    }
    if (Math.abs(s.x - 46) < 0.8 && Math.abs(s.y - 5.3) < 0.8 && Math.abs(s.z) < 0.1) refs.volume = obj;
    if (Math.abs(s.x - 72) < 0.9 && Math.abs(s.y - 5.5) < 0.8 && Math.abs(s.z) < 0.1) refs.kenposia = obj;
    if (Math.abs(s.x - 52) < 0.9 && Math.abs(s.y - 4.2) < 0.8 && Math.abs(s.z) < 0.1) refs.eau = obj;

    // Tester name planes from v26/v27.
    if (Math.abs(s.x - 32) < 0.8 && Math.abs(s.y - 4.4) < 0.8 && Math.abs(s.z) < 0.1) {
      refs.testerLabels.push(obj);
    }
  }
  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v27.js');
THREE.Group.prototype.add = nativeAdd;

// Remove the old logo mesh completely — external SVG loading was unreliable.
if (refs.logo) refs.logo.visible = false;

// Exact approved TWYNE geometry embedded inline, solid black.
const inlineLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 512" preserveAspectRatio="xMidYMid meet"><g fill="#000000"><path d="M 1760 193 L 1760 318 L 1763 323 L 1769 328 L 1777 331 L 1792 333 L 1923 333 L 1938 331 L 1947 327 L 1952 322 L 1956 316 L 1956 300 L 1808 300 L 1808 271 L 1953 271 L 1953 237 L 1808 237 L 1808 218 L 1811 212 L 1817 208 L 1826 206 L 1956 206 L 1956 192 L 1951 185 L 1943 180 L 1932 177 L 1917 176 L 1795 176 L 1780 178 L 1771 181 L 1764 186 Z"/><path d="M 1345 176 L 1345 333 L 1393 333 L 1393 219 L 1487 333 L 1563 333 L 1563 176 L 1514 176 L 1514 288 L 1422 176 Z"/><path d="M 938 176 L 1025 270 L 1025 333 L 1074 333 L 1074 270 L 1161 176 L 1103 176 L 1050 238 L 998 176 Z"/><path d="M 458 176 L 510 333 L 574 333 L 612 226 L 648 333 L 713 333 L 767 176 L 717 176 L 680 290 L 642 176 L 584 176 L 544 290 L 507 176 Z"/><path d="M 91 176 L 91 214 L 162 214 L 162 333 L 211 333 L 211 214 L 283 214 L 283 176 Z"/></g></svg>`;

if (sleeveGroupRef) {
  const logoUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(inlineLogoSvg)}`;
  const logoTex = new THREE.TextureLoader().load(logoUrl);
  logoTex.colorSpace = THREE.SRGBColorSpace;
  logoTex.minFilter = THREE.LinearFilter;
  logoTex.magFilter = THREE.LinearFilter;
  logoTex.generateMipmaps = false;

  const exactLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(126, 31.5),
    new THREE.MeshBasicMaterial({
      map: logoTex,
      transparent: true,
      opacity: 1,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    })
  );
  exactLogo.rotation.x = -Math.PI / 2;
  exactLogo.position.set(0, 19.88, -20.5);
  exactLogo.renderOrder = 5000;
  exactLogo.name = 'TWYNE_INLINE_EXACT_LOGO_V28';
  nativeAdd.call(sleeveGroupRef, exactLogo);
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

// Larger + tighter stacked cover block.
if (refs.volume) {
  refs.volume.scale.set(1.72, 1.72, 1);
  refs.volume.position.set(0, 19.90, 2.0);
  forceVisible(refs.volume, 5001);
}
if (refs.kenposia) {
  refs.kenposia.scale.set(1.55, 1.55, 1);
  refs.kenposia.position.set(0, 19.92, 11.0);
  forceVisible(refs.kenposia, 5002);
}
if (refs.eau) {
  refs.eau.scale.set(1.58, 1.58, 1);
  refs.eau.position.set(0, 19.94, 19.2);
  forceVisible(refs.eau, 5003);
}

// Remove perfume names from the outside presentation entirely for now.
refs.testerLabels.forEach((label) => {
  label.visible = false;
});

// Reinforce linen-paper character across sleeve + tray + insert.
refs.paperMeshes.forEach((mesh) => {
  const mat = mesh.material;
  if (!mat?.map) return;
  mat.roughness = 1.0;
  mat.bumpMap = mat.map;
  mat.bumpScale = 0.32;
  mat.map.repeat?.set(4.4, 3.4);
  mat.map.needsUpdate = true;
  mat.needsUpdate = true;
});
