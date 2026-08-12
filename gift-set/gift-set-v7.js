import * as THREE from 'three';

// TWYNE GIFT SET — v7 artwork correction layer
// Keeps v6 geometry and replaces only the Mineral Graphite plaque artwork.

const nativeAdd = THREE.Group.prototype.add;
let lidGroup = null;
let artworkInstalled = false;

function geometrySize(obj) {
  if (!obj?.geometry) return null;
  obj.geometry.computeBoundingBox?.();
  const bb = obj.geometry.boundingBox;
  if (!bb) return null;
  const s = new THREE.Vector3();
  bb.getSize(s);
  return s;
}

function makeTextTexture(text, size, weight=600, alpha=1) {
  const cv = document.createElement('canvas');
  cv.width = 1600;
  cv.height = 360;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = `rgba(231,228,221,${alpha})`;
  ctx.font = `${weight} ${size}px Manrope, Arial, sans-serif`;
  ctx.fillText(text, cv.width/2, cv.height/2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function addArtwork(parent, plaqueY) {
  if (artworkInstalled) return;
  artworkInstalled = true;

  const y = plaqueY + 0.98;

  const title = new THREE.Mesh(
    new THREE.PlaneGeometry(68, 9.2),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture('KENPOSIA', 138, 600, 1),
      transparent: true,
      toneMapped: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  title.rotation.x = -Math.PI/2;
  title.position.set(0, y, -14.5);
  title.renderOrder = 200;
  nativeAdd.call(parent, title);

  const volume = new THREE.Mesh(
    new THREE.PlaneGeometry(31, 4.0),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture('VOLUME I', 74, 500, 0.86),
      transparent: true,
      toneMapped: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  volume.rotation.x = -Math.PI/2;
  volume.position.set(0, y + 0.01, -3.5);
  volume.renderOrder = 201;
  nativeAdd.call(parent, volume);

  const logoData = 'data:image/png;base64,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';
  const logoTex = new THREE.TextureLoader().load(logoData);
  logoTex.colorSpace = THREE.SRGBColorSpace;
  logoTex.minFilter = THREE.LinearFilter;
  logoTex.magFilter = THREE.LinearFilter;

  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(76, 6.65),
    new THREE.MeshBasicMaterial({
      map: logoTex,
      transparent: true,
      toneMapped: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      alphaTest: 0.02,
    })
  );
  logo.rotation.x = -Math.PI/2;
  logo.position.set(0, y + 0.02, 15.5);
  logo.renderOrder = 202;
  nativeAdd.call(parent, logo);
}

THREE.Group.prototype.add = function(...objects) {
  if (lidGroup === this) {
    for (const obj of objects) {
      if (obj?.isMesh && obj.geometry?.type === 'PlaneGeometry') obj.visible = false;
    }
  }

  const result = nativeAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry) continue;
    const s = geometrySize(obj);
    if (!s) continue;

    const isPlaque =
      Math.abs(s.x - 104) < 1.0 &&
      Math.abs(s.y - 1.8) < 0.5 &&
      Math.abs(s.z - 58) < 1.0;

    if (isPlaque && !lidGroup) {
      lidGroup = this;
      const plaqueY = obj.position.y;
      queueMicrotask(() => addArtwork(lidGroup, plaqueY));
    }
  }

  return result;
};

await import('./gift-set-v6.js');
