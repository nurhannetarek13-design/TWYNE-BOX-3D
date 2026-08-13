import * as THREE from 'three';

// TWYNE GIFT SET v27 — DOUBLE-OPEN LINEN SLEEVE + VISIBILITY FIX
// Patch over v26.
// - Outer sleeve is open on BOTH left and right sides.
// - Stronger linen-paper surface.
// - Larger / tighter cover hierarchy.
// - Exact TWYNE logo forced visible in solid black.
// - Tester perfume names no longer render through the sleeve while tray is inserted.

const nativeAdd = THREE.Group.prototype.add;
const refs = {
  sleevePanels: [],
  leftEnd: null,
  logo: null,
  volume: null,
  kenposia: null,
  eau: null,
  testerLabels: [],
};

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

    // Sleeve top / bottom panels: 198 × 3.2 × 110.
    if (Math.abs(s.x - 198) < 0.5 && Math.abs(s.y - 3.2) < 0.4 && Math.abs(s.z - 110) < 0.5) {
      refs.sleevePanels.push(obj);
    }

    // Sleeve front / back walls: 198 × 12.6 × 3.2.
    if (Math.abs(s.x - 198) < 0.5 && Math.abs(s.y - 12.6) < 0.6 && Math.abs(s.z - 3.2) < 0.4) {
      refs.sleevePanels.push(obj);
    }

    // Left closure wall from v26: remove it so sleeve is open at BOTH ends.
    if (Math.abs(s.x - 3.2) < 0.4 && Math.abs(s.y - 12.6) < 0.6 && Math.abs(s.z - 103.6) < 0.8) {
      refs.leftEnd = obj;
    }

    if (Math.abs(s.x - 86) < 0.6 && Math.abs(s.y - 21.5) < 0.6 && Math.abs(s.z) < 0.1) refs.logo = obj;
    if (Math.abs(s.x - 46) < 0.6 && Math.abs(s.y - 5.3) < 0.5 && Math.abs(s.z) < 0.1) refs.volume = obj;
    if (Math.abs(s.x - 72) < 0.7 && Math.abs(s.y - 5.5) < 0.5 && Math.abs(s.z) < 0.1) refs.kenposia = obj;
    if (Math.abs(s.x - 52) < 0.7 && Math.abs(s.y - 4.2) < 0.5 && Math.abs(s.z) < 0.1) refs.eau = obj;

    // Four fragrance-name planes under the testers.
    if (Math.abs(s.x - 32) < 0.6 && Math.abs(s.y - 4.4) < 0.5 && Math.abs(s.z) < 0.1) {
      refs.testerLabels.push(obj);
    }
  }
  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v26.js');
THREE.Group.prototype.add = nativeAdd;

// 1) Sleeve open on both sides.
if (refs.leftEnd) refs.leftEnd.visible = false;

// 2) Stronger linen paper: use the existing fibre texture as a subtle bump map too.
refs.sleevePanels.forEach((mesh) => {
  const mat = mesh.material;
  if (!mat) return;
  mat.roughness = 1.0;
  if (mat.map) {
    mat.bumpMap = mat.map;
    mat.bumpScale = 0.22;
    mat.map.repeat?.set(3.6, 2.8);
    mat.map.needsUpdate = true;
  }
  mat.needsUpdate = true;
});

function forceTop(mesh, order) {
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

// 3) Exact TWYNE logo — much larger and forced solid black.
if (refs.logo) {
  refs.logo.geometry.dispose?.();
  refs.logo.geometry = new THREE.PlaneGeometry(112, 28);
  refs.logo.position.set(0, 19.58, -17.5);
  if (refs.logo.material) refs.logo.material.color.set(0x000000);
  forceTop(refs.logo, 1800);
}

// 4) Compact stacked hierarchy with bigger, readable type.
if (refs.volume) {
  refs.volume.scale.set(1.48, 1.48, 1);
  refs.volume.position.set(0, 19.60, 3.5);
  if (refs.volume.material) refs.volume.material.color?.set?.(0x050505);
  forceTop(refs.volume, 1801);
}

if (refs.kenposia) {
  refs.kenposia.scale.set(1.32, 1.32, 1);
  refs.kenposia.position.set(0, 19.62, 12.4);
  if (refs.kenposia.material) refs.kenposia.material.color?.set?.(0x050505);
  forceTop(refs.kenposia, 1802);
}

if (refs.eau) {
  refs.eau.scale.set(1.42, 1.42, 1);
  refs.eau.position.set(0, 19.64, 20.5);
  if (refs.eau.material) refs.eau.material.color?.set?.(0x111111);
  forceTop(refs.eau, 1803);
}

// 5) Critical fix: tester names should be visible only when physically exposed.
// They were MeshBasicMaterial with depthTest:false in v26, which made them print through the sleeve.
refs.testerLabels.forEach((label) => {
  if (!label.material) return;
  label.material.depthTest = true;
  label.material.depthWrite = false;
  label.renderOrder = 40;
  label.material.needsUpdate = true;
});
