import * as THREE from 'three';

// TWYNE GIFT SET v14 — lid design upgrade only.
// Converts the small centre plaque into an architectural edge-to-edge graphite band.
// Keeps the v13 typography refinements and the rest of the geometry untouched.

const nativeAdd = THREE.Group.prototype.add;

function geometrySize(obj) {
  if (!obj?.geometry) return null;
  obj.geometry.computeBoundingBox?.();
  const bb = obj.geometry.boundingBox;
  if (!bb) return null;
  const s = new THREE.Vector3();
  bb.getSize(s);
  return s;
}

THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh) continue;
    const s = geometrySize(obj);
    if (!s) continue;

    // Mineral Graphite plaque from v10: 104 × 1.8 × 58 mm.
    // Turn it into a shallow edge-to-edge band across the full lid width.
    if (Math.abs(s.x - 104) < 0.5 && Math.abs(s.y - 1.8) < 0.3 && Math.abs(s.z - 58) < 0.5) {
      obj.scale.x = 178 / 104;
      obj.scale.y = 0.35;
      obj.scale.z = 0.72;
      obj.position.y -= 0.585;
      obj.position.z = 0;
      obj.name = 'GRAPHITE_EDGE_TO_EDGE_BAND_V14';
    }

    // KENPOSIA: keep it dominant, with more air inside the band.
    if (obj.name === 'KENPOSIA_TRACKED_V13') {
      obj.position.z = -11.8;
      obj.scale.set(1.06, 1.06, 1);
      obj.renderOrder = 400;
      obj.name = 'KENPOSIA_HERO_V14';
    }

    // VOLUME I: quieter and clearly separated below KENPOSIA.
    if (obj.name === 'VOLUME_I_SPACED_V13') {
      obj.position.z = 1.6;
      obj.scale.set(0.88, 0.88, 1);
      obj.renderOrder = 401;
      obj.name = 'VOLUME_I_CODE_V14';
    }

    // Main TWYNE mark: smaller, softer house signature.
    if (obj.name === 'TWYNE_DEBOSSED_MAIN_V13') {
      obj.position.z = 13.0;
      obj.scale.set(0.80, 0.80, 1);
      if (obj.material) {
        obj.material.opacity = 0.32;
        obj.material.color = new THREE.Color(0xc4c1ba);
      }
      obj.renderOrder = 410;
      obj.name = 'TWYNE_DEBOSSED_SIGNATURE_V14';
    }

    // Match the two subtle deboss edge layers to the smaller TWYNE scale.
    if (obj.name === 'TWYNE_DEBOSS_SHADOW_V13') {
      obj.position.z = 13.22;
      obj.scale.set(0.80, 0.80, 1);
      if (obj.material) obj.material.opacity = 0.20;
      obj.name = 'TWYNE_DEBOSS_SHADOW_V14';
    }

    if (obj.name === 'TWYNE_DEBOSS_HIGHLIGHT_V13') {
      obj.position.z = 12.82;
      obj.scale.set(0.80, 0.80, 1);
      if (obj.material) obj.material.opacity = 0.11;
      obj.name = 'TWYNE_DEBOSS_HIGHLIGHT_V14';
    }
  }

  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v13.js');
