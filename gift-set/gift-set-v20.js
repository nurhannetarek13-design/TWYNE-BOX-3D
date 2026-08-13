import * as THREE from 'three';

const nativeAdd = THREE.Group.prototype.add;

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

THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh) continue;

    if (obj.name === 'USER_FACE_PORTRAIT_PRINT_V19') {
      obj.geometry.dispose?.();
      obj.geometry = new THREE.PlaneGeometry(48, 104);
      obj.position.set(8, 14.12, -1.5);
      obj.scale.set(1, 1, 1);
      obj.name = 'VERTICAL_IMAGE_STRIP_V20';
    }

    if (obj.name === 'KENPOSIA_VERTICAL_POSTER_V19') {
      obj.position.set(-25.5, 14.138, -1.0);
      obj.scale.set(0.74, 0.98, 1);
      obj.name = 'KENPOSIA_VERTICAL_V20';
    }

    if (obj.name === 'EDITORIAL_MICROTYPE_PORTRAIT_V19') {
      obj.visible = false;
      obj.name = 'MICROTYPE_REMOVED_V20';
    }

    if (obj.name === 'VOLUME_I_BOLD_EDITORIAL_V19') {
      obj.geometry.dispose?.();
      obj.geometry = new THREE.PlaneGeometry(31, 7.5);
      obj.material = new THREE.MeshBasicMaterial({
        map: makeVolumeTexture(),
        transparent: true,
        opacity: 0.94,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
      obj.position.set(54, 14.14, -29);
      obj.name = 'VOLUME_I_ONLY_V20';
    }

    if (obj.name === 'TWYNE_BOTTOM_MASTHEAD_V19') {
      obj.position.set(18, 14.145, 44.5);
      obj.scale.set(0.80, 0.80, 1);
      obj.name = 'TWYNE_BOTTOM_MASTHEAD_V20';
    }
  }

  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v19.js');
