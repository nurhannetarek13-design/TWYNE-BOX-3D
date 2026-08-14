import * as THREE from 'three';

// Pedestal-only polish layer.
// The lower-base TWYNE is now derived directly from the ACTUAL top-view logo mesh:
// same artwork, spacing, compression, texture and blind-deboss response.
// Only its physical width is reduced to suit the 16 mm pedestal.
const nativeGroupAdd = THREE.Group.prototype.add;

let topLogoTemplate = null;

function rememberTopLogo(mesh) {
  if (!mesh?.isMesh || !mesh.userData?.isExactTwyneLogo) return;
  if (mesh.userData?.isExactTwyneBaseLogo) return;

  const p = mesh.geometry?.parameters;
  if (!p) return;

  const isTopOrientation = Math.abs(mesh.rotation.x + Math.PI / 2) < 0.08;
  if (!isTopOrientation) return;

  topLogoTemplate = mesh;
}

function matchBaseToTop(mesh) {
  if (!mesh?.isMesh) return;

  const logoW = 63;

  // Use the exact visible aspect ratio of the real top mesh when available.
  const topParams = topLogoTemplate?.geometry?.parameters;
  const topW = topParams?.width || 72;
  const topH = topParams?.height || (72 * 163 / 1867);
  const logoH = logoW * (topH / topW);

  mesh.geometry?.dispose?.();
  mesh.geometry = new THREE.PlaneGeometry(logoW, logoH);

  // Clone the ACTUAL top material so the deboss tone/texture is identical 1:1.
  if (topLogoTemplate?.material) {
    mesh.material = topLogoTemplate.material.clone();
    if (topLogoTemplate.material.map) {
      mesh.material.map = topLogoTemplate.material.map;
    }
    mesh.material.needsUpdate = true;
  }

  // True centre of the 90 mm front face / 16 mm visible pedestal.
  mesh.position.x = 0;
  mesh.position.y = 8.0;
  mesh.renderOrder = 40;
  mesh.userData.isBasePolished = true;
  mesh.userData.matchesTopLogoExactly = true;
}

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh) continue;

    // The top exact logo is created before the base logo in the box build order,
    // so it becomes the single source of truth for the pedestal mark.
    rememberTopLogo(obj);

    if (obj.userData?.isExactTwyneBaseLogo && !obj.userData?.isBasePolished) {
      matchBaseToTop(obj);
    }
  }

  return result;
};

await import('./main-export.js');
