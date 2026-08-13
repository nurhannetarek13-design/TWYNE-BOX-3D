import * as THREE from 'three';

const ADD = THREE.Group.prototype.add;
const refs = { main: null, group: null, logo: null };

function sizeOf(o) {
  if (!o?.geometry) return null;
  o.geometry.computeBoundingBox?.();
  const bb = o.geometry.boundingBox;
  if (!bb) return null;
  const s = new THREE.Vector3();
  bb.getSize(s);
  return s;
}

THREE.Group.prototype.add = function (...objects) {
  for (const o of objects) {
    if (!o?.isMesh) continue;
    const s = sizeOf(o);
    if (!s) continue;
    if (Math.abs(s.x - 106) < 0.7 && Math.abs(s.y - 6.9) < 0.7 && Math.abs(s.z) < 0.1) {
      refs.main = o;
      refs.group = this;
    }
    if (Math.abs(s.x - 108) < 0.7 && Math.abs(s.y - 9.45) < 0.7 && Math.abs(s.z) < 0.1) {
      refs.logo = o;
    }
  }
  return ADD.apply(this, objects);
};

await import('./gift-set-v41.js?build=43');
THREE.Group.prototype.add = ADD;

if (refs.logo) {
  refs.logo.scale.set(0.84, 0.84, 1);
  if (refs.logo.material) {
    refs.logo.material.alphaTest = 0.03;
    refs.logo.material.depthTest = false;
    refs.logo.material.depthWrite = false;
    refs.logo.material.needsUpdate = true;
  }
}

if (refs.main && refs.group) {
  refs.main.visible = false;

  const c = document.createElement('canvas');
  c.width = 3000;
  c.height = 420;
  const x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  x.fillStyle = '#11110f';
  x.textBaseline = 'middle';
  x.font = '600 104px Manrope, Arial, sans-serif';

  const text = 'VOLUME I - KENOPSIA';
  const chars = [...text];
  const widths = chars.map(ch => x.measureText(ch).width);
  const tracking = 65;
  const total = widths.reduce((a,b)=>a+b,0) + tracking * (chars.length - 1);
  let px = (c.width - total) / 2;

  chars.forEach((ch, i) => {
    x.fillText(ch, px, 210);
    px += widths[i] + tracking;
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;

  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(106, 6.9),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.copy(refs.main.position);
  m.position.y += 0.035;
  m.renderOrder = 50200;
  m.name = 'VOLUME_KENOPSIA_TRACKING_65_V42';
  refs.group.add(m);
}
