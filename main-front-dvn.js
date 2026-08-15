import * as THREE from 'three';

// Front typography inspired by the quiet Dries Van Noten discovery-set hierarchy:
// neo-grotesk caps, generous tracking, flat tonal print — but large enough to read clearly.
// Replaces the previous separate VOLUME I / KENOPSIA treatment on the front only.
const nativeGroupAdd = THREE.Group.prototype.add;
const nativeFillText = CanvasRenderingContext2D.prototype.fillText;

function makeCollectionPairMaterial() {
  const cv = document.createElement('canvas');
  cv.width = 1800;
  cv.height = 420;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fontKerning = 'normal';

  // Same house neo-grotesk used across the box. Increased size + contrast for legibility.
  ctx.font = '400 86px "Inter Tight", "Helvetica Neue", Helvetica, Arial, sans-serif';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '11px';
  ctx.fillStyle = 'rgba(220,217,208,0.72)';
  nativeFillText.call(ctx, 'VOLUME I — KENOPSIA', cv.width / 2, 142);

  ctx.font = '400 62px "Inter Tight", "Helvetica Neue", Helvetica, Arial, sans-serif';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '9px';
  ctx.fillStyle = 'rgba(220,217,208,0.66)';
  nativeFillText.call(ctx, 'EAU DE PARFUM', cv.width / 2, 294);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  return new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function addCollectionPair(parent, anchorMesh) {
  if (parent.userData.hasDvnCollectionPair) return;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(68, 14.2),
    makeCollectionPairMaterial()
  );
  mesh.position.copy(anchorMesh.position);
  mesh.position.x = 0;
  mesh.position.y -= 0.2;
  mesh.position.z += 0.014;
  mesh.rotation.copy(anchorMesh.rotation);
  mesh.renderOrder = 37;
  mesh.userData.isLabel = true;
  mesh.userData.isDvnCollectionPair = true;

  nativeGroupAdd.call(parent, mesh);
  parent.userData.hasDvnCollectionPair = true;
}

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry || !obj.userData?.isLabel) continue;
    const p = obj.geometry.parameters;
    if (!p) continue;

    const w = p.width ?? 0;
    const h = p.height ?? 0;
    const isFront =
      Math.abs(obj.rotation.x) < 0.08 &&
      Math.abs(obj.rotation.y) < 0.08 &&
      obj.position.z > 40;

    const isOldVolume = isFront && w >= 38 && w <= 40 && h >= 7 && h <= 8;
    const isOldKenopsia = isFront && w >= 51 && w <= 53 && h >= 9 && h <= 11;

    if (isOldVolume) {
      obj.visible = false;
      continue;
    }

    if (isOldKenopsia) {
      obj.visible = false;
      addCollectionPair(this, obj);
    }
  }

  return result;
};

await import('./main-finish-system.js');
