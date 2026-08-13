import * as THREE from 'three';

// TWYNE GIFT SET v19 — PORTRAIT BERLIN POSTER.
// Keeps the all-paper gift-set structure, but turns the lid artwork into a true
// portrait composition like the supplied reference: vertical face crop,
// vertical KENPOSIA, detached microtype, bold V I, and TWYNE as the bottom masthead.

const nativeAdd = THREE.Group.prototype.add;
let viBuilt = false;

function cropFacePortrait(sourceTexture) {
  const src = sourceTexture?.image;
  if (!src) return sourceTexture;

  const cv = document.createElement('canvas');
  cv.width = 700;
  cv.height = 1000;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.imageSmoothingEnabled = false;

  // Use the same user-supplied eye+nose bitmap from v18, but crop it vertically.
  // This removes the landscape feel and makes the face run top-to-bottom like the poster.
  const sx = Math.round(src.width * 0.16);
  const sy = 0;
  const sw = Math.round(src.width * 0.68);
  const sh = src.height;
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, cv.width, cv.height);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

function makeVITexture() {
  const cv = document.createElement('canvas');
  cv.width = 900;
  cv.height = 420;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#1D1D1C';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 230px Manrope, Arial, sans-serif';
  ctx.fillText('V I', cv.width / 2, cv.height / 2);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

function addVI(lidGroup) {
  if (viBuilt || !lidGroup) return;
  viBuilt = true;

  const vi = new THREE.Mesh(
    new THREE.PlaneGeometry(31, 14.5),
    new THREE.MeshBasicMaterial({
      map: makeVITexture(),
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
  );
  vi.rotation.x = -Math.PI / 2;
  vi.position.set(27, 14.118, 17.5);
  vi.renderOrder = 930;
  vi.name = 'VOLUME_I_BOLD_EDITORIAL_V19';
  nativeAdd.call(lidGroup, vi);
}

THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh) continue;

    if (obj.name === 'USER_FACE_HALFTONE_PRINT_V18') {
      const portraitMap = cropFacePortrait(obj.material?.map);
      obj.geometry.dispose?.();
      obj.geometry = new THREE.PlaneGeometry(76, 104);
      obj.material = new THREE.MeshBasicMaterial({
        map: portraitMap,
        transparent: true,
        opacity: 0.97,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
      obj.rotation.x = -Math.PI / 2;
      obj.position.set(8.5, 14.108, -1.5);
      obj.renderOrder = 900;
      obj.name = 'USER_FACE_PORTRAIT_PRINT_V19';
      addVI(this);
    }

    // Long vertical title down the left edge of the portrait composition.
    if (obj.name === 'KENPOSIA_VERTICAL_EDITORIAL_V18') {
      obj.position.set(-38.5, 14.124, -1.0);
      obj.scale.set(0.82, 0.96, 1);
      obj.renderOrder = 940;
      obj.name = 'KENPOSIA_VERTICAL_POSTER_V19';
    }

    // Small information block near the upper-left, like the reference poster's tiny institutional type.
    if (obj.name === 'EDITORIAL_MICROTYPE_V18') {
      obj.position.set(-25.5, 14.122, -39.0);
      obj.scale.set(0.58, 0.58, 1);
      if (obj.material) obj.material.opacity = 0.90;
      obj.renderOrder = 942;
      obj.name = 'EDITORIAL_MICROTYPE_PORTRAIT_V19';
    }

    // TWYNE becomes the strong bottom masthead, mirroring the poster's bottom title logic.
    if (obj.name === 'TWYNE_EDITORIAL_MASTHEAD_V18') {
      obj.position.set(9.0, 14.132, 47.0);
      obj.scale.set(0.86, 0.86, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x1d1d1c);
        obj.material.opacity = 0.96;
      }
      obj.renderOrder = 960;
      obj.name = 'TWYNE_BOTTOM_MASTHEAD_V19';
    }
  }

  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v18.js');
