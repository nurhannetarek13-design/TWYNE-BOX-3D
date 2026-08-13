import * as THREE from 'three';

// TWYNE GIFT SET v24 — DETACHED LID + FINAL COVER HIERARCHY
// Keeps the v23 horizontal paper case and tester tray, but removes the hinge entirely.
// The lid is a separate loose piece: closed = sitting above the tray, open = placed flat to the left.
// Cover hierarchy: exact TWYNE wordmark / VOLUME I / tracked KENPOSIA / EAU DE PARFUM.

const nativeAdd = THREE.Group.prototype.add;
let detachedLidGroup = null;

function geometrySize(obj) {
  if (!obj?.geometry) return null;
  obj.geometry.computeBoundingBox?.();
  const bb = obj.geometry.boundingBox;
  if (!bb) return null;
  const s = new THREE.Vector3();
  bb.getSize(s);
  return s;
}

// Capture the v23 lid group while it is being constructed.
THREE.Group.prototype.add = function (...objects) {
  for (const obj of objects) {
    if (!obj?.isMesh) continue;
    const s = geometrySize(obj);
    if (!s) continue;
    if (
      Math.abs(s.x - 190) < 0.4 &&
      Math.abs(s.y - 4.2) < 0.3 &&
      Math.abs(s.z - 104) < 0.4
    ) {
      detachedLidGroup = this;
    }
  }
  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v23.js');
THREE.Group.prototype.add = nativeAdd;

if (!detachedLidGroup) {
  console.warn('TWYNE v24: detached lid group was not captured.');
} else {
  // Remove the physical hinge and the old v23 cover text.
  detachedLidGroup.children.forEach((obj) => {
    if (!obj?.isMesh) return;
    const s = geometrySize(obj);
    if (!s) return;

    const isHinge = Math.abs(s.x - 2.2) < 0.4 && Math.abs(s.y - 2.4) < 0.4;
    const isOldLogo = Math.abs(s.x - 76) < 0.5 && Math.abs(s.y - 9.5) < 0.5;
    const isOldCode = Math.abs(s.x - 70) < 0.5 && Math.abs(s.y - 5.0) < 0.5;

    if (isHinge || isOldLogo || isOldCode) obj.visible = false;
  });

  function trackedTexture(text, opts = {}) {
    const {
      fontSize = 96,
      weight = 500,
      tracking = 14,
      color = '#242421',
      opacity = 1,
    } = opts;

    const cv = document.createElement('canvas');
    cv.width = 1800;
    cv.height = 360;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.textBaseline = 'middle';
    ctx.font = `${weight} ${fontSize}px Manrope, Arial, sans-serif`;

    const chars = [...text];
    const widths = chars.map(ch => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
    let x = (cv.width - total) / 2;

    chars.forEach((ch, i) => {
      ctx.fillText(ch, x, cv.height / 2);
      x += widths[i] + tracking;
    });

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }

  function textPlane(text, w, h, opts = {}) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        map: trackedTexture(text, opts),
        transparent: true,
        toneMapped: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  // Exact approved TWYNE house wordmark from repo asset.
  const logoTexture = new THREE.TextureLoader().load('../assets/twyne-wordmark-2026.svg');
  logoTexture.colorSpace = THREE.SRGBColorSpace;
  logoTexture.minFilter = THREE.LinearFilter;
  logoTexture.magFilter = THREE.LinearFilter;
  logoTexture.generateMipmaps = false;

  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(86, 21.5),
    new THREE.MeshBasicMaterial({
      map: logoTexture,
      color: 0x1c1c1b,
      transparent: true,
      toneMapped: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  logo.rotation.x = -Math.PI / 2;
  logo.position.set(95, 4.31, -19);
  logo.renderOrder = 300;
  logo.name = 'TWYNE_EXACT_LOGO_V24';
  nativeAdd.call(detachedLidGroup, logo);

  const volume = textPlane('VOLUME I', 43, 4.5, {
    fontSize: 76,
    weight: 500,
    tracking: 12,
    color: '#2b2a28',
  });
  volume.position.set(95, 4.32, 5.5);
  volume.renderOrder = 301;
  volume.name = 'VOLUME_I_V24';
  nativeAdd.call(detachedLidGroup, volume);

  const kenposia = textPlane('KENPOSIA', 63, 5.2, {
    fontSize: 86,
    weight: 500,
    tracking: 32,
    color: '#292826',
  });
  kenposia.position.set(95, 4.325, 19.2);
  kenposia.renderOrder = 302;
  kenposia.name = 'KENPOSIA_TRACKED_V24';
  nativeAdd.call(detachedLidGroup, kenposia);

  const eau = textPlane('EAU DE PARFUM', 48, 3.8, {
    fontSize: 58,
    weight: 500,
    tracking: 12,
    color: '#4a4844',
    opacity: 0.92,
  });
  eau.position.set(95, 4.33, 32.5);
  eau.renderOrder = 303;
  eau.name = 'EAU_DE_PARFUM_V24';
  nativeAdd.call(detachedLidGroup, eau);

  const openCtrl = document.getElementById('ctrl-open');

  function updateDetachedLid() {
    const v = Number(openCtrl?.value ?? 1);

    // Never rotate: this is a loose lid, not a hinged lid.
    detachedLidGroup.rotation.set(0, 0, 0);

    // v=0: lid sits directly above the tray.
    // v=1: lid lies completely separate to the left, edge-to-edge with a small gap.
    detachedLidGroup.position.x = -95 - 198 * v;
    detachedLidGroup.position.y = 12.35 * (1 - v);
    detachedLidGroup.position.z = 0;
  }

  openCtrl?.addEventListener('input', updateDetachedLid);
  updateDetachedLid();

  // v23's closed camera handler rotates its old pivot logic; override it after that handler runs.
  document.getElementById('cam-closed')?.addEventListener('click', () => {
    if (openCtrl) openCtrl.value = '0';
    updateDetachedLid();
  });
}
