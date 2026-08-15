import * as THREE from 'three';

// Keep the 50 ML supporting copy fully visible in the same dark tonal system.
const nativeGroupAdd = THREE.Group.prototype.add;

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.userData?.isReadableSizeCopy || !obj.material) continue;
    obj.material.opacity = 1.0;
    obj.material.transparent = true;
    obj.material.needsUpdate = true;
    obj.userData.isSizeCopySoftened = false;
    obj.userData.isSizeCopyDark = true;
  }

  return result;
};

await import('./main-base-polish-core.js');
