import * as THREE from 'three';

// v25 — visibility pass only. Keep v24 detached-lid structure.
const originalAdd = THREE.Group.prototype.add;
const found = {};

THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh) continue;
    if (obj.name === 'TWYNE_EXACT_LOGO_V24') found.logo = obj;
    if (obj.name === 'VOLUME_I_V24') found.volume = obj;
    if (obj.name === 'KENPOSIA_TRACKED_V24') found.kenposia = obj;
    if (obj.name === 'EAU_DE_PARFUM_V24') found.eau = obj;
  }
  return originalAdd.apply(this, objects);
};

await import('./gift-set-v24.js');
THREE.Group.prototype.add = originalAdd;

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

if (found.logo) {
  found.logo.geometry.dispose?.();
  found.logo.geometry = new THREE.PlaneGeometry(98, 24.5);
  found.logo.position.set(95, 4.52, -22.5);
  if (found.logo.material) found.logo.material.color.set(0x050505);
  forceVisible(found.logo, 1200);
}

if (found.volume) {
  found.volume.scale.set(1.24, 1.24, 1);
  found.volume.position.set(95, 4.53, 4.0);
  forceVisible(found.volume, 1201);
}

if (found.kenposia) {
  found.kenposia.scale.set(1.18, 1.18, 1);
  found.kenposia.position.set(95, 4.54, 19.5);
  forceVisible(found.kenposia, 1202);
}

if (found.eau) {
  found.eau.scale.set(1.22, 1.22, 1);
  found.eau.position.set(95, 4.55, 34.5);
  forceVisible(found.eau, 1203);
}
