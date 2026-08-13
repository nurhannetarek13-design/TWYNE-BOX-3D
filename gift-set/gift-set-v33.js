import * as THREE from 'three';

// TWYNE GIFT SET v33 — clean branding rebuild over the approved sleeve/tray structure.
// Replaces the mirrored vector logo with the proven synchronous contour logo.
// Rebuilds the three-line cover block lower, tighter, and more readable.

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
    if (obj?.isGroup && obj.name === 'TWYNE_VECTOR_LOGO_V30') {
      refs.oldBranding.push(obj);
    }
    if (!obj?.isMesh) continue;
    const s = sizeOf(obj);
    if (!s) continue;

    if (Math.abs(s.x - 198) < 0.6 && Math.abs(s.y - 3.2) < 0.5 && Math.abs(s.z - 110) < 0.6) {
      refs.sleeveGroup = this;
    }

    const flat = Math.abs(s.z) < 0.15;
    if (flat && (
      (Math.abs(s.x - 58) < 0.7 && Math.abs(s.y - 7.2) < 0.7) ||
      (Math.abs(s.x - 80) < 0.7 && Math.abs(s.y - 7.0) < 0.7) ||
      (Math.abs(s.x - 62) < 0.7 && Math.abs(s.y - 5.5) < 0.7) ||
      obj.name?.includes('TWYNE') ||
      obj.name?.includes('VOLUME_I') ||
      obj.name?.includes('KENPOSIA') ||
      obj.name?.includes('KENOPSIA') ||
      obj.name?.includes('EAU_DE_PARFUM')
    )) refs.oldBranding.push(obj);
  }
  return nativeAdd.apply(this, objects);
};

await import('./gift-set-v30.js?build=33');
THREE.Group.prototype.add = nativeAdd;

refs.oldBranding.forEach(obj => { obj.visible = false; });

if (!refs.sleeveGroup) {
  console.error('TWYNE v33: sleeve group not found');
} else {
  // Exact approved TWYNE contours from the previously working house wordmark implementation.
  const LOGO_CONTOURS = [
    [[502,5],[501,7],[501,40],[504,45],[508,47],[512,47],[513,48],[551,48],[552,47],[556,47],[558,45],[558,43],[559,42],[559,38],[557,37],[517,37],[515,35],[515,30],[516,29],[555,29],[556,28],[557,29],[558,28],[558,19],[541,19],[540,18],[516,18],[515,17],[515,13],[518,10],[558,10],[559,9],[559,6],[558,5],[558,3],[556,1],[554,0],[510,0],[509,1],[505,2]],
    [[376,1],[376,47],[390,47],[390,15],[391,14],[393,15],[393,16],[397,20],[397,21],[401,25],[401,26],[405,30],[405,31],[408,34],[408,35],[412,39],[412,40],[418,47],[441,47],[441,0],[428,0],[427,1],[427,33],[426,34],[415,21],[415,20],[412,17],[412,16],[408,12],[408,11],[399,0],[377,0]],
    [[254,1],[260,7],[260,8],[266,14],[266,15],[272,21],[272,22],[280,31],[280,47],[294,47],[294,31],[305,19],[305,18],[312,11],[312,10],[319,3],[320,0],[303,0],[303,1],[298,6],[298,7],[294,11],[294,12],[289,17],[288,19],[287,19],[283,15],[283,14],[278,9],[278,8],[275,5],[275,4],[271,0],[255,0]],
    [[110,1],[111,2],[111,4],[112,5],[112,7],[113,8],[115,16],[117,19],[117,21],[118,22],[118,24],[119,25],[119,27],[120,28],[120,30],[121,31],[121,33],[122,34],[122,36],[123,37],[123,39],[124,40],[124,42],[125,43],[126,47],[145,47],[146,46],[146,44],[148,41],[148,39],[150,35],[150,32],[151,31],[151,29],[152,28],[152,26],[153,25],[153,23],[154,22],[154,20],[156,16],[158,18],[160,26],[162,29],[162,32],[163,33],[163,35],[164,36],[164,38],[165,39],[167,47],[187,47],[187,45],[188,44],[188,42],[189,41],[189,39],[190,38],[190,36],[191,35],[191,33],[192,32],[194,24],[196,21],[196,19],[197,18],[197,16],[198,15],[198,13],[199,12],[199,10],[200,9],[200,7],[202,3],[202,0],[189,0],[188,1],[187,5],[186,6],[186,8],[185,9],[185,12],[184,13],[184,15],[183,16],[183,18],[182,19],[182,21],[181,22],[181,24],[180,25],[180,27],[179,28],[179,30],[177,34],[175,32],[175,30],[174,29],[173,24],[171,21],[171,19],[170,18],[170,16],[169,15],[169,13],[168,12],[168,10],[167,9],[165,1],[164,0],[149,0],[146,6],[145,12],[143,15],[143,17],[142,18],[140,26],[136,34],[134,31],[134,29],[133,28],[133,26],[132,25],[132,23],[131,22],[131,20],[129,16],[129,13],[127,10],[127,7],[126,6],[125,1],[124,0],[111,0]],
    [[1,0],[0,1],[0,11],[20,11],[21,12],[21,47],[35,47],[35,13],[37,11],[57,11],[57,1],[56,0]]
  ];

  function makeLogoTexture() {
    const cv = document.createElement('canvas');
    cv.width = 1120;
    cv.height = 98;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.save();
    ctx.scale(2, 2);
    ctx.fillStyle = '#050505';
    for (const poly of LOGO_CONTOURS) {
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }

  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(108, 9.45),
    new THREE.MeshBasicMaterial({
      map: makeLogoTexture(),
      transparent: true,
      opacity: 1,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    })
  );
  logo.rotation.x = -Math.PI / 2;
  logo.position.set(0, 20.90, -5.0);
  logo.renderOrder = 40000;
  logo.name = 'TWYNE_CORRECT_LOGO_V33';
  refs.sleeveGroup.add(logo);

  function trackedTexture(text, { fontSize = 110, weight = 600, tracking = 10, family = 'Manrope, Arial, sans-serif' } = {}) {
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
      new THREE.MeshBasicMaterial({
        map: trackedTexture(text, options),
        transparent: true,
        opacity: 1,
        toneMapped: false,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, 20.92 + order * 0.004, z);
    mesh.renderOrder = 40010 + order;
    refs.sleeveGroup.add(mesh);
  }

  // Lower and tighter as one compact block.
  addText('VOLUME I', 60, 6.6, 20.5, { fontSize: 118, weight: 650, tracking: 9 }, 1);
  addText('KENOPSIA', 72, 6.2, 27.0, { fontSize: 108, weight: 500, tracking: 18, family: 'Arial Narrow, Helvetica Neue, Arial, sans-serif' }, 2);
  addText('EAU DE PARFUM', 68, 6.0, 33.5, { fontSize: 96, weight: 600, tracking: 9 }, 3);
}
