import * as THREE from 'three';

const nativeAdd = THREE.Group.prototype.add;
const refs = { main: null, eau: null };

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
    if (Math.abs(s.x - 92) < 0.5 && Math.abs(s.y - 6) < 0.5 && Math.abs(s.z) < 0.1) refs.main = obj;
    if (Math.abs(s.x - 58) < 0.5 && Math.abs(s.y - 5) < 0.5 && Math.abs(s.z) < 0.1) refs.eau = obj;
  }
  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v36.js?build=38');
THREE.Group.prototype.add = nativeAdd;

if (refs.main) refs.main.scale.set(1.15, 1.15, 1);
if (refs.eau) refs.eau.scale.set(1.12, 1.12, 1);
