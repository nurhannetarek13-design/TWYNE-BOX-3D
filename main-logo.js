import * as THREE from 'three';

// Exact TWYNE wordmark supplied by the user, embedded as vector paths so the
// prototype does not depend on an external image texture loading correctly.
const EXACT_TWYNE_PATHS = [
  'M249 4L249 102L280 102L280 89L262 88L262 60L280 59L280 47L262 46L262 18L280 17L280 4Z',
  'M194 4L194 102L206 102L207 42L229 101L243 102L243 5L230 4L229 64L207 5Z',
  'M140 4L140 8L158 67L158 102L171 102L171 65L189 4L176 4L166 48L164 50L153 5Z',
  'M50 4L49 102L71 102L89 28L90 102L111 102L136 5L121 5L103 99L102 4L81 4L63 100L62 4Z',
  'M4 4L4 17L16 17L17 18L17 102L30 102L30 18L31 17L44 17L44 5L43 4Z',
];

const nativeGroupAdd = THREE.Group.prototype.add;

function makeExactWordmarkDebossMaterial(depth = 1) {
  const cv = document.createElement('canvas');
  cv.width = 1200;
  cv.height = 460;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const paths = EXACT_TWYNE_PATHS.map(d => new Path2D(d));
  const sourceW = 285;
  const sourceH = 107;
  const targetW = 1040;
  const scale = targetW / sourceW;
  const markH = sourceH * scale;
  const ox = (cv.width - targetW) / 2;
  const oy = (cv.height - markH) / 2;
  const edge = 3.0 * depth;

  function draw(dx, dy, fill) {
    ctx.save();
    ctx.translate(ox + dx, oy + dy);
    ctx.scale(scale, scale);
    ctx.fillStyle = fill;
    paths.forEach(p => ctx.fill(p));
    ctx.restore();
  }

  // Tonal blind-deboss simulation: tiny raised light lip, darker inner wall,
  // and a recessed centre. No ink / foil effect.
  draw(-edge, -edge, `rgba(230,230,224,${0.15 * depth})`);
  draw(edge, edge, `rgba(0,0,0,${0.64 * depth})`);
  draw(0, 0, `rgba(6,6,5,${0.54 * depth})`);

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

function addExactTopLogo(parent, oldMesh) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(62, 23.3),
    makeExactWordmarkDebossMaterial(1.0)
  );
  mesh.position.copy(oldMesh.position);
  mesh.position.y += 0.012;
  mesh.rotation.copy(oldMesh.rotation);
  mesh.renderOrder = 38;
  mesh.userData.isLabel = true;
  mesh.userData.isExactTwyneLogo = true;
  nativeGroupAdd.call(parent, mesh);
}

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry || !obj.userData?.isLabel) continue;
    const p = obj.geometry.parameters;
    if (!p) continue;

    const w = p.width ?? 0;
    const h = p.height ?? 0;
    const isTopWordmark =
      w >= 68 && w <= 72 &&
      h >= 6 && h <= 8 &&
      Math.abs(obj.rotation.x + Math.PI / 2) < 0.08;

    if (!isTopWordmark) continue;

    addExactTopLogo(this, obj);
    obj.visible = false;
  }

  return result;
};

await import('./main-entry.js');
