import * as THREE from 'three';

// TWYNE front intervention: one quiet recessed field made from the surface itself.
// No ribbon, no decorative border, no extra logo effect. This is a visual depth
// simulation for the prototype; the physical pack would use a shallow pressed panel.

const nativeGroupAdd = THREE.Group.prototype.add;
const injectedParents = new WeakSet();

function getSize(mesh) {
  if (!mesh?.geometry) return null;
  mesh.geometry.computeBoundingBox?.();
  const bb = mesh.geometry.boundingBox;
  if (!bb) return null;
  const size = new THREE.Vector3();
  bb.getSize(size);
  return size;
}

function makeRecessedFieldMaterial() {
  const cv = document.createElement('canvas');
  cv.width = 1400;
  cv.height = 820;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const inset = 34;
  const x = inset;
  const y = inset;
  const w = cv.width - inset * 2;
  const h = cv.height - inset * 2;

  // A tonal shift, not a printed frame.
  ctx.fillStyle = 'rgba(0,0,0,0.045)';
  ctx.fillRect(x, y, w, h);

  // Soft pressed-paper cues: a faint light lip on top/left and a faint inner
  // shadow on bottom/right. No stroke rectangle is used.
  const top = ctx.createLinearGradient(0, y, 0, y + 54);
  top.addColorStop(0, 'rgba(238,238,232,0.070)');
  top.addColorStop(1, 'rgba(238,238,232,0)');
  ctx.fillStyle = top;
  ctx.fillRect(x, y, w, 54);

  const left = ctx.createLinearGradient(x, 0, x + 54, 0);
  left.addColorStop(0, 'rgba(238,238,232,0.050)');
  left.addColorStop(1, 'rgba(238,238,232,0)');
  ctx.fillStyle = left;
  ctx.fillRect(x, y, 54, h);

  const bottom = ctx.createLinearGradient(0, y + h - 64, 0, y + h);
  bottom.addColorStop(0, 'rgba(0,0,0,0)');
  bottom.addColorStop(1, 'rgba(0,0,0,0.115)');
  ctx.fillStyle = bottom;
  ctx.fillRect(x, y + h - 64, w, 64);

  const right = ctx.createLinearGradient(x + w - 64, 0, x + w, 0);
  right.addColorStop(0, 'rgba(0,0,0,0)');
  right.addColorStop(1, 'rgba(0,0,0,0.090)');
  ctx.fillStyle = right;
  ctx.fillRect(x + w - 64, y, 64, h);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  return new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
}

function addFrontRecessedField(parent, lidMesh, size) {
  const field = new THREE.Mesh(
    new THREE.PlaneGeometry(72, 42),
    makeRecessedFieldMaterial()
  );

  // Keep the field centred on VOLUME I / KENOPSIA and slightly behind the copy.
  field.position.set(
    0,
    lidMesh.position.y,
    size.z / 2 + 0.176
  );
  field.renderOrder = 22;
  field.name = 'FRONT_RECESSED_FIELD';
  field.userData.isLabel = true;
  field.userData.isRecessedField = true;

  // Bypass the wrapper chain so the injected field does not trigger itself.
  nativeGroupAdd.call(parent, field);
}

THREE.Group.prototype.add = function (...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry) continue;
    const size = getSize(obj);
    if (!size) continue;

    const isLidShell =
      size.x > 84 && size.z > 84 &&
      size.y > 60 && size.y < 100;

    if (isLidShell && !injectedParents.has(this)) {
      injectedParents.add(this);
      addFrontRecessedField(this, obj, size);
    }
  }

  return result;
};

await import('./main-export.js');
