import * as THREE from 'three';

// Soften only the front size copy so it sits at the same quiet tonal level
// as the rest of the supporting box typography. No size or position changes.
const nativeGroupAdd = THREE.Group.prototype.add;

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.userData?.isReadableSizeCopy || !obj.material) continue;
    obj.material.opacity = 0.72;
    obj.material.transparent = true;
    obj.material.needsUpdate = true;
    obj.userData.isSizeCopySoftened = true;
  }

  return result;
};

await import('./main-base-polish-core.js');
