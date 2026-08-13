import * as THREE from 'three';

// TWYNE GIFT SET v18 — BERLIN EDITORIAL HALFTONE.
// Uses the exact eye+nose crop from the user's supplied Bauhaus reference image,
// reduced to a monochrome bitmap so it prints as black ink on warm paper.
// No generated replacement image. No relief. No band. No graphite construction.

const nativeAdd = THREE.Group.prototype.add;
let posterBuilt = false;

// 100 × 90 monochrome bitmap sampled from the user's supplied image.
const FACE_W = 100;
const FACE_H = 90;
const FACE_BITS = 'AAAAAAAAAAAAf/+4AAAAAAAAAAAAB//9wAAAAAAAAAAAAH//7gAAAAAAAAAAAAP//+AAAAAAAAAAAAA///8AAAAAAAAACAAB//94AAAAAAAAAWAAH///gAAAAAAAAABIAP///AAAAAAAAAQNAA///+AAAAAAAABAIAD///4AAAAAAAA/+AAH///gAAAAAAAf/+cAf///AAAAAAAH///gA///8AAAAAID+f/4AD///wAAAAAC+A///AP///AAAAAAPgCT/gAf//8AAAAAB4AAH+AB///wAAAAQOgAAP4AD///AAAAAB6AAl/4AP//8AAABANgAB//AAf//4AAABTwAAD/8AB///wAAAE/IAAP/wAD///gAAAP+AAA/ngAP//+AAAAZ8BAB+/AAf//8AAADH/yAAHYAB///8AAAfAAAAAAAAD///wAABCDAAAAAAAP///gAAAAEAAAAAAAf///AAAABAAAAAAAB///+AAAADAAAAAAAD///4AAAKPAAAAAAAP///gAAAEfgAAAAAAf///AAAABgAAAAAAB///+AAAAAAAAAAAAD///wAAAAAAAAAAAAP///gAAAAAAAAAAAAf//8AAAAAAAAAAAAB///4AAAAAAAAAAAAD///gAAAAAAAAAAAAP//+AAAAAAAAAAAAAf//gAAAAAAAAAAAAB///AAAAAAAAAAAAAD//8AAAAAAAAAAAAAP//gAAAAAAAAAAAAA///gAAAAAAAAAAAAB//+AAAAAAAAAAAAAD//5AAAAAAAAAAAAAP//kAAAAAAAAAAAAAf//gAAAAAAAAAAAAB///QAAAAAAAAAAAAD//8AAAAAAAAAAAAAP//8AAAAAAAAAAAAA///wAAAAAAAAAAAAB///wAAAAAAAAAAAAH///gAAAAAAAAAAAAP///AAAAAAAAAAAAA///+AAAAAAAAAAAAD///8AAAAAAAAAAAAP///wAAAAAAAAAAAAf///AAAAAAAAAAAAB///+AAAAAAAAAAAAH///8AAAAAAAAAAAAf///4AgAAAAAAAAAB////wPAAAAAAAAAAD////B+AAAAAAAAAAP///+P8AAAAAAAAAA////4/4AAAAAAAAAD////j/gAAAAAAAAAP///+f/AAAAAAAAAA////5/+AAAAAAAAAD////n/4AAAAAAAAAP///+P/wAAAAAAAAA////4f/AAAAAAAAAD////A/8AAAAAAAAAP///+B/gAAAAAAAAA////4BwAAAAAAAAAD////gAAAAAAAAAAAP///+AAAAAAAAAAAA////wAAAAAAAAAAAD///+AAAAAAAAAAAAP///wAAAAAAAAAAAA////AAAAAAAAAAAAH///9AAAAAAAAAAAAf///gAAAAAAAAAAAD///wAAAAAAAAAAAAP//9AAAAAAAAAAAAB///4QAAAAAAAAAAAH///gAAAAAAAAAAAA///8AAAAAAAAAAAAD///QAAAAAAAAAAAAP';

function makeFaceTexture() {
  const raw = atob(FACE_BITS);
  const cv = document.createElement('canvas');
  cv.width = FACE_W;
  cv.height = FACE_H;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, FACE_W, FACE_H);
  ctx.fillStyle = '#1D1D1C';

  let bitIndex = 0;
  for (let y = 0; y < FACE_H; y++) {
    for (let x = 0; x < FACE_W; x++) {
      const byte = raw.charCodeAt(bitIndex >> 3);
      const bit = 7 - (bitIndex & 7);
      if ((byte >> bit) & 1) ctx.fillRect(x, y, 1, 1);
      bitIndex++;
    }
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

function makeVerticalWordTexture(text) {
  const cv = document.createElement('canvas');
  cv.width = 320;
  cv.height = 1600;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#1D1D1C';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 150px Manrope, Arial, sans-serif';

  const chars = [...text];
  const top = 120;
  const bottom = cv.height - 120;
  const step = (bottom - top) / (chars.length - 1);
  chars.forEach((ch, i) => ctx.fillText(ch, cv.width / 2, top + i * step));

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

function makeMicroTexture() {
  const cv = document.createElement('canvas');
  cv.width = 1200;
  cv.height = 520;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#252523';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.font = '700 94px Manrope, Arial, sans-serif';
  ctx.fillText('VOLUME I', 28, 24);
  ctx.font = '600 42px Manrope, Arial, sans-serif';
  ctx.fillText('THE WARMTH A PLACE KEEPS', 28, 172);
  ctx.fillText('AFTER EVERYONE LEAVES', 28, 238);
  ctx.font = '600 34px Manrope, Arial, sans-serif';
  ctx.fillText('A HAUS OF VOLUMES', 28, 360);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

function buildPoster(lidGroup) {
  if (posterBuilt || !lidGroup) return;
  posterBuilt = true;

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(118, 106),
    new THREE.MeshBasicMaterial({
      map: makeFaceTexture(),
      transparent: true,
      opacity: 0.97,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
  );
  face.rotation.x = -Math.PI / 2;
  face.position.set(24, 14.095, -1.0);
  face.renderOrder = 820;
  face.name = 'USER_FACE_HALFTONE_PRINT_V18';
  nativeAdd.call(lidGroup, face);

  // KENPOSIA is stacked vertically like editorial display type.
  const vertical = new THREE.Mesh(
    new THREE.PlaneGeometry(13.5, 88),
    new THREE.MeshBasicMaterial({
      map: makeVerticalWordTexture('KENPOSIA'),
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
  );
  vertical.rotation.x = -Math.PI / 2;
  vertical.position.set(-72.5, 14.105, -0.5);
  vertical.renderOrder = 840;
  vertical.name = 'KENPOSIA_VERTICAL_EDITORIAL_V18';
  nativeAdd.call(lidGroup, vertical);

  // Detached small information block.
  const micro = new THREE.Mesh(
    new THREE.PlaneGeometry(41, 17.8),
    new THREE.MeshBasicMaterial({
      map: makeMicroTexture(),
      transparent: true,
      opacity: 0.86,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
  );
  micro.rotation.x = -Math.PI / 2;
  micro.position.set(-47.5, 14.102, -37.5);
  micro.renderOrder = 842;
  micro.name = 'EDITORIAL_MICROTYPE_V18';
  nativeAdd.call(lidGroup, micro);
}

THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh) continue;

    // Remove the entire v17 U-Bahn relief language.
    if (obj.name?.startsWith('UBAhn_PAPER_RIB_') || obj.name === 'UBAhn_PAPER_TERMINAL_V17') {
      obj.visible = false;
      continue;
    }

    if (obj.name === 'WARM_PAPER_LID_MONOLITH_V17') {
      buildPoster(this);
      obj.name = 'WARM_PAPER_EDITORIAL_LID_V18';
    }

    if (obj.name === 'KENPOSIA_RIGHT_FIELD_V17') {
      obj.visible = false;
      obj.name = 'KENPOSIA_OLD_HIDDEN_V18';
    }

    if (obj.name === 'VOLUME_I_RIGHT_FIELD_V17') {
      obj.visible = false;
      obj.name = 'VOLUME_I_OLD_HIDDEN_V18';
    }

    // Approved TWYNE wordmark becomes a bold printed masthead at the bottom.
    if (obj.name === 'TWYNE_BLIND_DEBOSS_V17') {
      obj.position.set(19, 14.115, 41.0);
      obj.scale.set(0.94, 0.94, 1);
      if (obj.material) {
        obj.material.color = new THREE.Color(0x1d1d1c);
        obj.material.opacity = 0.92;
      }
      obj.renderOrder = 860;
      obj.name = 'TWYNE_EDITORIAL_MASTHEAD_V18';
    }

    if (obj.name === 'TWYNE_BLIND_SHADOW_V17' || obj.name === 'TWYNE_BLIND_HIGHLIGHT_V17') {
      obj.visible = false;
      obj.name = `${obj.name}_HIDDEN_V18`;
    }
  }

  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v17.js');
