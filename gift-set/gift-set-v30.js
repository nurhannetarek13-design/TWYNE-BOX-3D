import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

// TWYNE GIFT SET v30 — HARD RESET FOR COVER BRANDING
// Keeps the approved v28 sleeve/tray structure, but rebuilds all cover branding from scratch.
// TWYNE is true vector geometry parsed synchronously from the approved SVG paths — no image/texture loading.

const nativeAdd = THREE.Group.prototype.add;
const refs = { sleeveGroup: null, oldBranding: [] };

function sizeOf(obj) {
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
    const s = sizeOf(obj);
    if (!s) continue;

    // Capture the actual sleeve group from one of its full top/bottom panels.
    if (Math.abs(s.x - 198) < 0.6 && Math.abs(s.y - 3.2) < 0.5 && Math.abs(s.z - 110) < 0.6) {
      refs.sleeveGroup = this;
    }

    // Collect every old exterior branding plane from v26-v29 so none can conflict.
    const flat = Math.abs(s.z) < 0.15;
    if (flat && (
      (s.x > 40 && s.x < 140 && s.y > 3 && s.y < 34) ||
      obj.name?.includes('TWYNE') ||
      obj.name?.includes('VOLUME_I') ||
      obj.name?.includes('KENPOSIA') ||
      obj.name?.includes('EAU_DE_PARFUM')
    )) {
      refs.oldBranding.push(obj);
    }
  }
  return nativeAdd.apply(this, objects);
};

// Cache-bust the whole imported chain too.
await import('./gift-set-v28.js?build=30');
THREE.Group.prototype.add = nativeAdd;

refs.oldBranding.forEach(obj => { obj.visible = false; });

if (!refs.sleeveGroup) {
  console.error('TWYNE v30: sleeve group not found');
} else {
  // ---------- EXACT TWYNE VECTOR LOGO ----------
  const approvedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 512">
  <path d="M 1760 193 L 1760 318 L 1763 323 L 1769 328 L 1777 331 L 1792 333 L 1923 333 L 1938 331 L 1947 327 L 1952 322 L 1956 316 L 1956 300 L 1808 300 L 1808 271 L 1953 271 L 1953 237 L 1808 237 L 1808 218 L 1811 212 L 1817 208 L 1826 206 L 1956 206 L 1956 192 L 1951 185 L 1943 180 L 1932 177 L 1917 176 L 1795 176 L 1780 178 L 1771 181 L 1764 186 Z"/>
  <path d="M 1345 176 L 1345 333 L 1393 333 L 1393 219 L 1487 333 L 1563 333 L 1563 176 L 1514 176 L 1514 288 L 1422 176 Z"/>
  <path d="M 938 176 L 1025 270 L 1025 333 L 1074 333 L 1074 270 L 1161 176 L 1103 176 L 1050 238 L 998 176 Z"/>
  <path d="M 458 176 L 510 333 L 574 333 L 612 226 L 648 333 L 713 333 L 767 176 L 717 176 L 680 290 L 642 176 L 584 176 L 544 290 L 507 176 Z"/>
  <path d="M 91 176 L 91 214 L 162 214 L 162 333 L 211 333 L 211 214 L 283 214 L 283 176 Z"/>
  </svg>`;

  const svgData = new SVGLoader().parse(approvedSvg);
  const rawLogo = new THREE.Group();
  const black = new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide, toneMapped: false, depthTest: false, depthWrite: false });

  svgData.paths.forEach(path => {
    const shapes = SVGLoader.createShapes(path);
    shapes.forEach(shape => {
      const geom = new THREE.ShapeGeometry(shape, 1);
      const mesh = new THREE.Mesh(geom, black);
      mesh.renderOrder = 20000;
      rawLogo.add(mesh);
    });
  });

  const bbox = new THREE.Box3().setFromObject(rawLogo);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bbox.getSize(size);
  bbox.getCenter(center);
  const targetWidth = 104;
  const scale = targetWidth / size.x;
  rawLogo.children.forEach(m => {
    m.position.x -= center.x;
    m.position.y -= center.y;
  });
  rawLogo.scale.setScalar(scale);

  const logoHolder = new THREE.Group();
  logoHolder.add(rawLogo);
  logoHolder.rotation.x = -Math.PI / 2;
  // Clear, obvious position above the text block.
  logoHolder.position.set(0, 20.65, -10.5);
  logoHolder.name = 'TWYNE_VECTOR_LOGO_V30';
  refs.sleeveGroup.add(logoHolder);

  // ---------- NEW COPY BLOCK ----------
  function makeTrackedTexture(text, { fontSize = 110, weight = 600, tracking = 12, family = 'Manrope, Arial, sans-serif' } = {}) {
    const cv = document.createElement('canvas');
    cv.width = 1800;
    cv.height = 360;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#050505';
    ctx.textBaseline = 'middle';
    ctx.font = `${weight} ${fontSize}px ${family}`;
    const chars = [...text];
    const widths = chars.map(ch => ctx.measureText(ch).width);
    const total = widths.reduce((a,b)=>a+b,0) + tracking * Math.max(0, chars.length - 1);
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

  function addText(text, w, h, z, options, order) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: makeTrackedTexture(text, options), transparent: true, toneMapped: false, depthWrite: false, depthTest: false, side: THREE.DoubleSide })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, 20.70 + order * 0.002, z);
    mesh.renderOrder = 20010 + order;
    refs.sleeveGroup.add(mesh);
    return mesh;
  }

  // Entire block moved visibly LOWER than the previous version, with tight spacing.
  addText('VOLUME I', 58, 7.2, 17.0, { fontSize: 116, weight: 650, tracking: 12 }, 1);
  addText('KENPOSIA', 80, 7.0, 28.0, { fontSize: 104, weight: 500, tracking: 40, family: 'Arial Narrow, Helvetica Neue, Arial, sans-serif' }, 2);
  addText('EAU DE PARFUM', 62, 5.5, 38.0, { fontSize: 78, weight: 550, tracking: 14 }, 3);
}
