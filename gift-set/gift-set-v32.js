import * as THREE from 'three';

// v32 — correct the actual logo mirror + tighten/lower cover copy.
const nativeAdd = THREE.Group.prototype.add;
const refs = { logo: null, volume: null, ken: null, eau: null };

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
    if (obj?.isGroup && obj.name === 'TWYNE_VECTOR_LOGO_V30') refs.logo = obj;
    if (!obj?.isMesh) continue;
    const s = sizeOf(obj);
    if (!s) continue;
    if (Math.abs(s.x - 58) < 0.6 && Math.abs(s.y - 7.2) < 0.6 && Math.abs(s.z) < 0.1) refs.volume = obj;
    if (Math.abs(s.x - 80) < 0.6 && Math.abs(s.y - 7.0) < 0.6 && Math.abs(s.z) < 0.1) refs.ken = obj;
    if (Math.abs(s.x - 62) < 0.6 && Math.abs(s.y - 5.5) < 0.6 && Math.abs(s.z) < 0.1) refs.eau = obj;
  }
  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v30.js?build=32');
THREE.Group.prototype.add = nativeAdd;

// The SVG geometry was vertically mirrored, not simply rotated.
if (refs.logo) {
  refs.logo.rotation.z = 0;
  refs.logo.scale.set(1.10, -1.10, 1.10);
  refs.logo.position.set(0, 20.84, -11.0);
}

function setCopy(mesh, sx, sy, z, order) {
  if (!mesh) return;
  mesh.scale.set(sx, sy, 1);
  mesh.position.set(0, 20.90 + order * 0.004, z);
  mesh.renderOrder = 32000 + order;
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

// Lower + tighter. Compress KENPOSIA horizontally to reduce the excessive tracking.
setCopy(refs.volume, 1.42, 1.42, 16.0, 1);
setCopy(refs.ken, 0.98, 1.34, 22.0, 2);
setCopy(refs.eau, 1.72, 1.72, 28.0, 3);
