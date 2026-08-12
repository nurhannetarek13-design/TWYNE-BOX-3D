import * as THREE from 'three';

// TWYNE GIFT SET v15 — SPLIT LID concept.
// 70% Linen Cream + 30% Mineral Graphite across the entire lid depth.
// Typography lives on the cream field; TWYNE becomes a blind/debossed signature in graphite.

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

    // v14 graphite band -> right-hand 30% material plane.
    if (obj.name === 'GRAPHITE_EDGE_TO_EDGE_BAND_V14') {
      const graphiteWidth = 178 * 0.30;
      const graphiteCentreX = 89 - graphiteWidth / 2;

      obj.scale.x = graphiteWidth / 104;
      obj.scale.y = 0.13;
      obj.scale.z = 112 / 58;
      obj.position.x = graphiteCentreX;
      obj.position.z = 0;
      obj.position.y = 14.117;
      obj.name = 'GRAPHITE_SPLIT_FIELD_V15';
    }

    // KENPOSIA moves to the centre of the 70% cream field.
    if (obj.name === 'KENPOSIA_HERO_V14') {
      obj.position.x = -26.7;
      obj.position.z = -8.5;
      obj.scale.set(0.92, 0.92, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x32312e);
        obj.material.opacity = 0.92;
      }
      obj.renderOrder = 500;
      obj.name = 'KENPOSIA_CREAM_FIELD_V15';
    }

    // VOLUME I sits quietly below KENPOSIA on cream.
    if (obj.name === 'VOLUME_I_CODE_V14') {
      obj.position.x = -26.7;
      obj.position.z = 5.0;
      obj.scale.set(0.78, 0.78, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x4a4945);
        obj.material.opacity = 0.65;
      }
      obj.renderOrder = 501;
      obj.name = 'VOLUME_I_CREAM_FIELD_V15';
    }

    // TWYNE becomes a restrained blind-debossed signature inside graphite.
    if (obj.name === 'TWYNE_DEBOSSED_SIGNATURE_V14') {
      obj.position.x = 62.3;
      obj.position.z = 0;
      obj.scale.set(0.56, 0.56, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x8c8982);
        obj.material.opacity = 0.20;
      }
      obj.renderOrder = 510;
      obj.name = 'TWYNE_GRAPHITE_DEBOSS_V15';
    }

    if (obj.name === 'TWYNE_DEBOSS_SHADOW_V14') {
      obj.position.x = 62.3;
      obj.position.z = 0.22;
      obj.scale.set(0.56, 0.56, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x242421);
        obj.material.opacity = 0.24;
      }
      obj.renderOrder = 508;
      obj.name = 'TWYNE_GRAPHITE_SHADOW_V15';
    }

    if (obj.name === 'TWYNE_DEBOSS_HIGHLIGHT_V14') {
      obj.position.x = 62.3;
      obj.position.z = -0.18;
      obj.scale.set(0.56, 0.56, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0xaaa69e);
        obj.material.opacity = 0.09;
      }
      obj.renderOrder = 509;
      obj.name = 'TWYNE_GRAPHITE_HIGHLIGHT_V15';
    }
  }

  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v14.js');
