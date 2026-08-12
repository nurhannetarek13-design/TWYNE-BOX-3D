import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// TWYNE GIFT SET — v8 seam cleanup layer
// Removes the construction lips on the lid and base while keeping v7 artwork + v6 internals.

const originalAdd = THREE.Group.prototype.add;
let baseGroup = null;
let lidGroup = null;
let baseMat = null;
let lidMat = null;
let replacementBaseAdded = false;
let replacementTopAdded = false;

function sizeOf(obj) {
  if (!obj?.geometry) return null;
  obj.geometry.computeBoundingBox?.();
  const bb = obj.geometry.boundingBox;
  if (!bb) return null;
  const s = new THREE.Vector3();
  bb.getSize(s);
  return s;
}

function near(a,b,t=.7){ return Math.abs(a-b) < t; }

function addCleanBase() {
  if (replacementBaseAdded || !baseGroup || !baseMat) return;
  replacementBaseAdded = true;

  // One continuous linen-wrapped body. Slight 0.8 mm visual inset per side,
  // so it still reads like a lift-off/telescope construction without a ledge.
  const cleanBase = new THREE.Mesh(
    new RoundedBoxGeometry(176.4, 23.1, 110.4, 5, 0.6),
    baseMat
  );
  cleanBase.position.set(0, 11.55, 0);
  cleanBase.castShadow = true;
  cleanBase.receiveShadow = true;
  cleanBase.name = 'TWYNE_CLEAN_BASE_BODY';
  originalAdd.call(baseGroup, cleanBase);
}

function addCleanLidTop() {
  if (replacementTopAdded || !lidGroup || !lidMat) return;
  replacementTopAdded = true;

  // Zero-thickness top surface: no side face = no horizontal construction seam.
  const topPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(178, 112),
    lidMat
  );
  topPlane.rotation.x = -Math.PI / 2;
  topPlane.position.set(0, 24.805, 0);
  topPlane.receiveShadow = true;
  topPlane.name = 'TWYNE_SEAMLESS_LID_TOP';
  originalAdd.call(lidGroup, topPlane);
}

THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry) continue;
    const s = sizeOf(obj);
    if (!s) continue;

    // BASE FOOT: 178 × 5.2 × 112 — this created the lower ledge/seam.
    if (near(s.x,178) && near(s.y,5.2) && near(s.z,112)) {
      baseGroup = this;
      baseMat = obj.material;
      obj.visible = false;
      queueMicrotask(addCleanBase);
      continue;
    }

    // INNER/CORE BODY: ~172.4 × 18.5 × 106.4 — hide its exterior and replace
    // foot + core with one continuous clean body.
    if (near(s.x,172.4,1.0) && near(s.y,18.5) && near(s.z,106.4,1.0)) {
      baseGroup = this;
      baseMat = baseMat || obj.material;
      obj.visible = false;
      queueMicrotask(addCleanBase);
      continue;
    }

    // LID TOP SLAB: 178 × 3.2 × 112 — its vertical side face produced the top seam.
    if (near(s.x,178) && near(s.y,3.2) && near(s.z,112)) {
      lidGroup = this;
      lidMat = obj.material;
      obj.visible = false;
      queueMicrotask(addCleanLidTop);
      continue;
    }

    // FRONT / BACK LID WALLS: 178 × 21.6 × 2.
    // Extend them all the way to the top so the exterior reads as one uninterrupted wall.
    if (near(s.x,178) && near(s.y,21.6) && near(s.z,2,.5)) {
      lidGroup = this;
      lidMat = lidMat || obj.material;
      obj.geometry.dispose?.();
      obj.geometry = new RoundedBoxGeometry(178, 24.8, 2, 5, 0.6);
      obj.position.y = 12.4;
      continue;
    }

    // LEFT / RIGHT LID WALLS: 2 × 21.6 × ~108.
    if (near(s.x,2,.5) && near(s.y,21.6) && near(s.z,108,1.2)) {
      lidGroup = this;
      lidMat = lidMat || obj.material;
      obj.geometry.dispose?.();
      obj.geometry = new RoundedBoxGeometry(2, 24.8, 108, 5, 0.6);
      obj.position.y = 12.4;
      continue;
    }
  }

  return originalAdd.apply(this, objects);
};

await import('./gift-set-v7.js');

// Restore Three.js globally after construction.
THREE.Group.prototype.add = originalAdd;

// Safety in case microtasks have not fired yet.
addCleanBase();
addCleanLidTop();
