import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// TWYNE GIFT SET v16 — SHIFTED TOP.
// The lid silhouette becomes the code: a linen top plane physically displaced 9 mm
// from the lid body, with a thin Mineral Graphite reveal underneath.
// No band, plaque, split field, frame, or printed seam.

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

function rounded(w, h, d, r, mat) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 5, r), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.v16Skip = true;
  return mesh;
}

const graphiteRevealMat = new THREE.MeshStandardMaterial({
  color: 0x4D4D49,
  roughness: 0.92,
  metalness: 0,
});

THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh || obj.userData?.v16Skip) continue;
    const s = geometrySize(obj);
    if (!s) continue;

    // Original v10 lid body = 178 × 14 × 112.
    // Lower it into a 10 mm carrier, then add a shifted top plane above it.
    if (
      Math.abs(s.x - 178) < 0.4 &&
      Math.abs(s.y - 14) < 0.4 &&
      Math.abs(s.z - 112) < 0.4
    ) {
      const lidGroup = this;

      // Quiet carrier body.
      obj.scale.y = 10 / 14;
      obj.position.y = 5.0;
      obj.name = 'SHIFTED_TOP_CARRIER_V16';

      // Dark structural reveal: visible mainly from 3/4 and side angles.
      const reveal = rounded(176, 1.25, 108, 0.7, graphiteRevealMat);
      reveal.position.set(5.0, 10.62, 0);
      reveal.name = 'MINERAL_REVEAL_V16';
      nativeAdd.call(lidGroup, reveal);

      // Hero top plane: same linen material, physically displaced to the right.
      const slabMat = obj.material?.clone ? obj.material.clone() : obj.material;
      const slab = rounded(176, 3.8, 108, 0.7, slabMat);
      slab.position.set(9.0, 12.95, 0);
      slab.name = 'SHIFTED_LINEN_TOP_V16';
      nativeAdd.call(lidGroup, slab);
    }

    // Remove the previous split-lid graphite field completely.
    if (obj.name === 'GRAPHITE_SPLIT_FIELD_V15') {
      obj.visible = false;
      obj.name = 'GRAPHITE_SPLIT_REMOVED_V16';
    }

    // KENPOSIA sits on the shifted plane, not on the carrier underneath.
    if (obj.name === 'KENPOSIA_CREAM_FIELD_V15') {
      obj.position.x = -21.0;
      obj.position.z = -10.5;
      obj.position.y = 15.10;
      obj.scale.set(0.94, 0.94, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x2f2e2b);
        obj.material.opacity = 0.92;
      }
      obj.renderOrder = 600;
      obj.name = 'KENPOSIA_SHIFTED_TOP_V16';
    }

    // VOLUME I becomes a small code with a deliberate vertical interval.
    if (obj.name === 'VOLUME_I_CREAM_FIELD_V15') {
      obj.position.x = -21.0;
      obj.position.z = 4.7;
      obj.position.y = 15.11;
      obj.scale.set(0.70, 0.70, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x4a4945);
        obj.material.opacity = 0.60;
      }
      obj.renderOrder = 601;
      obj.name = 'VOLUME_I_SHIFTED_TOP_V16';
    }

    // TWYNE returns to the linen plane as an almost blind debossed house signature.
    if (obj.name === 'TWYNE_GRAPHITE_DEBOSS_V15') {
      obj.position.x = 40.0;
      obj.position.z = 18.0;
      obj.position.y = 15.09;
      obj.scale.set(0.62, 0.62, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0xc2bfb7);
        obj.material.opacity = 0.16;
      }
      obj.renderOrder = 610;
      obj.name = 'TWYNE_BLIND_DEBOSS_SHIFTED_V16';
    }

    if (obj.name === 'TWYNE_GRAPHITE_SHADOW_V15') {
      obj.position.x = 40.0;
      obj.position.z = 18.28;
      obj.position.y = 15.075;
      obj.scale.set(0.62, 0.62, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x77746e);
        obj.material.opacity = 0.12;
      }
      obj.renderOrder = 608;
      obj.name = 'TWYNE_BLIND_SHADOW_SHIFTED_V16';
    }

    if (obj.name === 'TWYNE_GRAPHITE_HIGHLIGHT_V15') {
      obj.position.x = 40.0;
      obj.position.z = 17.80;
      obj.position.y = 15.125;
      obj.scale.set(0.62, 0.62, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0xf1eee6);
        obj.material.opacity = 0.12;
      }
      obj.renderOrder = 609;
      obj.name = 'TWYNE_BLIND_HIGHLIGHT_SHIFTED_V16';
    }
  }

  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v15.js');
