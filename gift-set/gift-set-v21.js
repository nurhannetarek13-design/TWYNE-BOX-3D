import * as THREE from 'three';

// TWYNE GIFT SET v21 — FULL HORIZONTAL IMAGE.
// Restore the complete user-supplied face artwork from v18 with NO portrait crop.
// Keep the box horizontal. Keep the image fully visible and horizontal.
// VOLUME I stands alone: no subtitle, no descriptive copy beneath it.

const nativeAdd = THREE.Group.prototype.add;
let volumeBuilt = false;

function makeVolumeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1D1D1C';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 145px Manrope, Arial, sans-serif';
  ctx.fillText('VOLUME I', canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function addVolumeI(lidGroup) {
  if (volumeBuilt || !lidGroup) return;
  volumeBuilt = true;

  const volume = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 7.5),
    new THREE.MeshBasicMaterial({
      map: makeVolumeTexture(),
      transparent: true,
      opacity: 0.94,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
  );

  volume.rotation.x = -Math.PI / 2;
  volume.position.set(-49, 14.14, -39);
  volume.renderOrder = 950;
  volume.name = 'VOLUME_I_ONLY_V21';
  nativeAdd.call(lidGroup, volume);
}

THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh) continue;

    // IMPORTANT: use the untouched FULL bitmap from v18.
    // No portrait canvas. No vertical strip. No crop.
    if (obj.name === 'USER_FACE_HALFTONE_PRINT_V18') {
      obj.geometry.dispose?.();
      obj.geometry = new THREE.PlaneGeometry(124, 92);
      obj.rotation.x = -Math.PI / 2;
      obj.position.set(18, 14.12, -1.0);
      obj.scale.set(1, 1, 1);
      obj.renderOrder = 900;
      obj.name = 'FULL_HORIZONTAL_FACE_IMAGE_V21';
      addVolumeI(this);
    }

    // Keep KENPOSIA as the vertical editorial title on the far left.
    if (obj.name === 'KENPOSIA_VERTICAL_EDITORIAL_V18') {
      obj.position.set(-72.5, 14.14, -0.5);
      obj.scale.set(0.82, 0.96, 1);
      obj.renderOrder = 940;
      obj.name = 'KENPOSIA_VERTICAL_V21';
    }

    // Remove ALL small copy under/around VOLUME I.
    if (obj.name === 'EDITORIAL_MICROTYPE_V18') {
      obj.visible = false;
      obj.name = 'MICROTYPE_REMOVED_V21';
    }

    // Keep TWYNE as the lower masthead.
    if (obj.name === 'TWYNE_EDITORIAL_MASTHEAD_V18') {
      obj.position.set(18, 14.145, 43.5);
      obj.scale.set(0.82, 0.82, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x1d1d1c);
        obj.material.opacity = 0.96;
      }
      obj.renderOrder = 960;
      obj.name = 'TWYNE_BOTTOM_MASTHEAD_V21';
    }
  }

  return nativeAdd.apply(this, objects);
};

// Import v18 directly so v19/v20 portrait cropping never runs.
await import('./gift-set-v18.js');
