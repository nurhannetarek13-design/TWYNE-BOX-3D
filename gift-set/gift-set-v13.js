import * as THREE from 'three';

// TWYNE GIFT SET v13 — typography refinement only.
// Keeps v12 geometry/logo contours; adjusts KENOPSIA tracking,
// vertical spacing, and gives TWYNE a softer debossed treatment.

const nativeGroupAdd = THREE.Group.prototype.add;

function geometrySize(obj) {
  if (!obj?.geometry) return null;
  obj.geometry.computeBoundingBox?.();
  const bb = obj.geometry.boundingBox;
  if (!bb) return null;
  const s = new THREE.Vector3();
  bb.getSize(s);
  return s;
}

function makeTrackedTexture(text, fontSize = 122, tracking = 22) {
  const cv = document.createElement('canvas');
  cv.width = 1800;
  cv.height = 360;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#E7E4DD';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${fontSize}px Manrope, Arial, sans-serif`;

  const chars = [...text];
  const widths = chars.map(ch => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let x = (cv.width - total) / 2;
  const y = cv.height / 2;

  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, y);
    x += widths[i] + tracking;
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

const trackedKenopsia = makeTrackedTexture('KENPOSIA', 122, 24);

THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh || obj.userData?.v13Skip) continue;
    const s = geometrySize(obj);
    if (!s) continue;

    // KENPOSIA plane from v10: 66 × 8.6 mm.
    if (Math.abs(s.x - 66) < 0.3 && Math.abs(s.y - 8.6) < 0.3 && Math.abs(s.z) < 0.1) {
      obj.material = new THREE.MeshBasicMaterial({
        map: trackedKenopsia,
        transparent: true,
        opacity: 1,
        toneMapped: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      obj.position.z = -16.2;
      obj.renderOrder = 300;
      obj.name = 'KENPOSIA_TRACKED_V13';
    }

    // VOLUME I plane from v10: 30 × 4 mm.
    if (Math.abs(s.x - 30) < 0.3 && Math.abs(s.y - 4.0) < 0.3 && Math.abs(s.z) < 0.1) {
      obj.position.z = -1.6;
      obj.renderOrder = 301;
      obj.name = 'VOLUME_I_SPACED_V13';
    }

    // Exact TWYNE plane from v10/v12: 78 × 6.83 mm.
    if (Math.abs(s.x - 78) < 0.35 && Math.abs(s.y - 6.83) < 0.35 && Math.abs(s.z) < 0.1) {
      const logoMap = obj.material?.map || null;

      // Main recessed mark: much quieter than the cream copy above it.
      obj.material = new THREE.MeshBasicMaterial({
        map: logoMap,
        color: 0xb7b4ad,
        transparent: true,
        opacity: 0.42,
        toneMapped: false,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
      });
      obj.position.z = 15.2;
      obj.renderOrder = 310;
      obj.name = 'TWYNE_DEBOSSED_MAIN_V13';

      // Tiny dark lower edge + pale upper edge creates a shallow deboss impression.
      if (logoMap) {
        const shadow = new THREE.Mesh(
          obj.geometry.clone(),
          new THREE.MeshBasicMaterial({
            map: logoMap,
            color: 0x2f2f2c,
            transparent: true,
            opacity: 0.32,
            toneMapped: false,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        );
        shadow.rotation.copy(obj.rotation);
        shadow.position.copy(obj.position);
        shadow.position.z += 0.28;
        shadow.position.y -= 0.018;
        shadow.renderOrder = 308;
        shadow.userData.v13Skip = true;
        shadow.name = 'TWYNE_DEBOSS_SHADOW_V13';
        nativeGroupAdd.call(this, shadow);

        const highlight = new THREE.Mesh(
          obj.geometry.clone(),
          new THREE.MeshBasicMaterial({
            map: logoMap,
            color: 0xd8d5cd,
            transparent: true,
            opacity: 0.18,
            toneMapped: false,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        );
        highlight.rotation.copy(obj.rotation);
        highlight.position.copy(obj.position);
        highlight.position.z -= 0.18;
        highlight.position.y += 0.012;
        highlight.renderOrder = 309;
        highlight.userData.v13Skip = true;
        highlight.name = 'TWYNE_DEBOSS_HIGHLIGHT_V13';
        nativeGroupAdd.call(this, highlight);
      }
    }
  }

  return nativeGroupAdd.apply(this, objects);
};

await import('./gift-set-v12.js');
