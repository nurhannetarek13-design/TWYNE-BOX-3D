import * as THREE from 'three';

// TWYNE GIFT SET v31 — LOGO ORIENTATION + TIGHT COVER BLOCK
// Keeps v30 structure. Only fixes the upside-down logo and the small/loose copy block.

const nativeAdd = THREE.Group.prototype.add;
const refs = { logoHolder: null, volume: null, kenposia: null, eau: null };

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
    if (obj?.isGroup && obj.name === 'TWYNE_VECTOR_LOGO_V30') {
      refs.logoHolder = obj;
    }
    if (!obj?.isMesh) continue;
    const s = sizeOf(obj);
    if (!s) continue;

    if (Math.abs(s.x - 58) < 0.5 && Math.abs(s.y - 7.2) < 0.5 && Math.abs(s.z) < 0.1) refs.volume = obj;
    if (Math.abs(s.x - 80) < 0.5 && Math.abs(s.y - 7.0) < 0.5 && Math.abs(s.z) < 0.1) refs.kenposia = obj;
    if (Math.abs(s.x - 62) < 0.5 && Math.abs(s.y - 5.5) < 0.5 && Math.abs(s.z) < 0.1) refs.eau = obj;
  }
  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v30.js?build=31');
THREE.Group.prototype.add = nativeAdd;

// Logo was 180° upside down on the sleeve. Rotate it in-plane only.
if (refs.logoHolder) {
  refs.logoHolder.rotation.z = Math.PI;
  refs.logoHolder.position.set(0, 20.82, -13.0);
  refs.logoHolder.scale.set(1.10, 1.10, 1.10);
}

function boost(mesh, scale, z, order) {
  if (!mesh) return;
  mesh.scale.set(scale, scale, 1);
  mesh.position.z = z;
  mesh.position.y = 20.86 + order * 0.004;
  mesh.renderOrder = 30000 + order;
  mesh.visible = true;
  if (mesh.material) {
    mesh.material.opacity = 1;
    mesh.material.transparent = true;
    mesh.material.depthTest = false;
    mesh.material.depthWrite = false;
    mesh.material.toneMapped = false;
    mesh.material.needsUpdate = true;
  }
}

// Tight stacked hierarchy directly under the logo.
boost(refs.volume, 1.38, 7.5, 1);
boost(refs.kenposia, 1.28, 15.0, 2);
boost(refs.eau, 1.34, 22.0, 3);
