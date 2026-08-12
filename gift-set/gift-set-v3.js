import * as THREE from 'three';

// Patch layer for the Gift Set cover.
// Keeps the existing v2 geometry untouched and replaces only the plaque artwork.

const nativeGroupAdd = THREE.Group.prototype.add;
let plaqueParent = null;
let artworkAdded = false;

function geometrySize(mesh) {
  if (!mesh?.geometry) return null;
  mesh.geometry.computeBoundingBox?.();
  const bb = mesh.geometry.boundingBox;
  if (!bb) return null;
  const size = new THREE.Vector3();
  bb.getSize(size);
  return size;
}

function makeCoverArtworkTexture() {
  const cv = document.createElement('canvas');
  cv.width = 1800;
  cv.height = 1000;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const cream = '#E7E4DD';

  // 1 — KENPOSIA: dominant collection title.
  ctx.fillStyle = cream;
  ctx.font = '700 132px Manrope, Arial, sans-serif';
  ctx.fillText('KENPOSIA', cv.width / 2, 230);

  // 2 — VOLUME I: deliberately smaller and quieter.
  ctx.fillStyle = 'rgba(231,228,221,0.78)';
  ctx.font = '600 58px Manrope, Arial, sans-serif';
  ctx.fillText('VOLUME I', cv.width / 2, 365);

  // 3 — Exact TWYNE wordmark geometry from the approved mark.
  // Drawn directly on canvas so there is no SVG/MIME/path loading failure.
  const paths = [
    'M 91 174 L 283 174 L 283 214 L 211 214 L 211 335 L 161 335 L 161 215 L 91 215 Z',
    'M 455 175 L 507 175 L 540 292 L 580 175 L 643 175 L 680 292 L 718 175 L 768 175 L 712 336 L 648 336 L 611 224 L 574 336 L 511 336 Z',
    'M 937 175 L 997 175 L 1051 238 L 1103 175 L 1163 175 L 1077 270 L 1077 336 L 1025 336 L 1025 270 Z',
    'M 1344 175 L 1395 175 L 1514 276 L 1514 175 L 1564 175 L 1564 336 L 1514 336 L 1394 235 L 1394 336 L 1344 336 Z',
    'M 1760 175 L 1957 175 L 1957 214 L 1812 214 L 1812 236 L 1937 236 L 1937 274 L 1812 274 L 1812 296 L 1957 296 L 1957 336 L 1760 336 Z'
  ];

  ctx.save();
  // Original mark runs roughly x 91..1957, y 174..336.
  // Fit it wide below the title while preserving its distinctive spacing.
  const targetW = 1180;
  const sourceW = 1866;
  const scale = targetW / sourceW;
  const sourceCentreX = (91 + 1957) / 2;
  const sourceCentreY = (174 + 336) / 2;
  const targetCentreX = cv.width / 2;
  const targetCentreY = 690;

  ctx.translate(targetCentreX, targetCentreY);
  ctx.scale(scale, scale);
  ctx.translate(-sourceCentreX, -sourceCentreY);
  ctx.fillStyle = cream;
  for (const d of paths) ctx.fill(new Path2D(d));
  ctx.restore();

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function addPlaqueArtwork(parent) {
  if (artworkAdded) return;
  artworkAdded = true;

  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(91, 47),
    new THREE.MeshBasicMaterial({
      map: makeCoverArtworkTexture(),
      transparent: true,
      toneMapped: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );

  art.rotation.x = -Math.PI / 2;
  art.position.set(0, 14.58, 0);
  art.renderOrder = 100;
  art.name = 'TWYNE_COVER_ARTWORK_FINAL';
  art.userData.finalCoverArtwork = true;
  nativeGroupAdd.call(parent, art);
}

THREE.Group.prototype.add = function (...objects) {
  // Before adding: suppress the two legacy artwork planes in v2 once we know
  // which group is the lid group.
  if (plaqueParent === this) {
    for (const obj of objects) {
      if (!obj?.isMesh || !obj.geometry) continue;
      const s = geometrySize(obj);
      if (!s) continue;

      // Existing logo plane = 86 × 8.6; existing volume plane = 78 × 8.
      const legacyArtwork =
        (Math.abs(s.x - 86) < 0.8 && Math.abs(s.y - 8.6) < 0.8) ||
        (Math.abs(s.x - 78) < 0.8 && Math.abs(s.y - 8.0) < 0.8);

      if (legacyArtwork) obj.visible = false;
    }
  }

  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry) continue;
    const s = geometrySize(obj);
    if (!s) continue;

    // Mineral plaque in v2: 104 × 2.4 × 58 mm.
    const isPlaque =
      Math.abs(s.x - 104) < 1.2 &&
      Math.abs(s.y - 2.4) < 0.8 &&
      Math.abs(s.z - 58) < 1.2;

    if (isPlaque && !plaqueParent) {
      plaqueParent = this;
      // Add after v2 has finished constructing its own plaque copy.
      queueMicrotask(() => addPlaqueArtwork(plaqueParent));
    }
  }

  return result;
};

await import('./gift-set-v2.js');
