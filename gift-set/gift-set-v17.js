import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// TWYNE GIFT SET v17 — BERLIN U-BAHN PAPER RELIEF.
// Removes the shifted-top silhouette and returns to one warm-paper lid.
// Adds a same-material relief rhythm: repeated ribs + one deliberate interruption.

const nativeAdd = THREE.Group.prototype.add;
let reliefBuilt = false;

function geometrySize(obj) {
  if (!obj?.geometry) return null;
  obj.geometry.computeBoundingBox?.();
  const bb = obj.geometry.boundingBox;
  if (!bb) return null;
  const s = new THREE.Vector3();
  bb.getSize(s);
  return s;
}

function makeRelief(w, h, d, r, mat) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.v17Skip = true;
  return mesh;
}

function buildRelief(lidGroup, paperMat) {
  if (reliefBuilt || !lidGroup || !paperMat) return;
  reliefBuilt = true;

  const mat = paperMat.clone ? paperMat.clone() : paperMat;

  // 8 ribs total. Four + a deliberate void + four.
  // Same warm paper as the lid; the code is made by height and shadow only.
  const xs = [-70, -59.5, -49, -38.5, -16, -5.5, 5, 15.5];
  const depths = [72, 72, 72, 72, 72, 72, 72, 72];

  xs.forEach((x, i) => {
    const rib = makeRelief(7.2, 0.95, depths[i], 0.45, mat);
    rib.position.set(x, 14.475, -1.5);
    rib.name = `UBAhn_PAPER_RIB_${i + 1}_V17`;
    nativeAdd.call(lidGroup, rib);
  });

  // A shallow terminal bar anchors the rhythm without turning it into a border.
  const terminal = makeRelief(74, 0.55, 5.4, 0.35, mat);
  terminal.position.set(-27.25, 14.275, 40.5);
  terminal.name = 'UBAhn_PAPER_TERMINAL_V17';
  nativeAdd.call(lidGroup, terminal);
}

THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh || obj.userData?.v17Skip) continue;
    const s = geometrySize(obj);
    if (!s) continue;

    // Restore the original lid body from the v16 shifted carrier.
    if (obj.name === 'SHIFTED_TOP_CARRIER_V16') {
      obj.scale.set(1, 1, 1);
      obj.position.set(0, 7, 0);
      obj.name = 'WARM_PAPER_LID_MONOLITH_V17';
      buildRelief(this, obj.material);
    }

    // Remove all shifted-top construction from v16.
    if (obj.name === 'MINERAL_REVEAL_V16' || obj.name === 'SHIFTED_LINEN_TOP_V16') {
      obj.visible = false;
      obj.name = `${obj.name}_REMOVED_V17`;
    }

    // Move KENPOSIA to the quiet right-hand field.
    if (obj.name === 'KENPOSIA_SHIFTED_TOP_V16') {
      obj.position.set(39, 14.055, -11.5);
      obj.scale.set(0.86, 0.86, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x343330);
        obj.material.opacity = 0.88;
      }
      obj.renderOrder = 700;
      obj.name = 'KENPOSIA_RIGHT_FIELD_V17';
    }

    // Small code beneath the title.
    if (obj.name === 'VOLUME_I_SHIFTED_TOP_V16') {
      obj.position.set(39, 14.06, 1.8);
      obj.scale.set(0.62, 0.62, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x55534e);
        obj.material.opacity = 0.55;
      }
      obj.renderOrder = 701;
      obj.name = 'VOLUME_I_RIGHT_FIELD_V17';
    }

    // TWYNE remains almost blind-debossed, lower-right.
    if (obj.name === 'TWYNE_BLIND_DEBOSS_SHIFTED_V16') {
      obj.position.set(39, 14.045, 24.0);
      obj.scale.set(0.54, 0.54, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0xb8b4ac);
        obj.material.opacity = 0.13;
      }
      obj.renderOrder = 710;
      obj.name = 'TWYNE_BLIND_DEBOSS_V17';
    }

    if (obj.name === 'TWYNE_BLIND_SHADOW_SHIFTED_V16') {
      obj.position.set(39, 14.025, 24.24);
      obj.scale.set(0.54, 0.54, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x7a766f);
        obj.material.opacity = 0.10;
      }
      obj.renderOrder = 708;
      obj.name = 'TWYNE_BLIND_SHADOW_V17';
    }

    if (obj.name === 'TWYNE_BLIND_HIGHLIGHT_SHIFTED_V16') {
      obj.position.set(39, 14.075, 23.82);
      obj.scale.set(0.54, 0.54, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0xf0ece4);
        obj.material.opacity = 0.08;
      }
      obj.renderOrder = 709;
      obj.name = 'TWYNE_BLIND_HIGHLIGHT_V17';
    }
  }

  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v16.js');
