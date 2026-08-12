import * as THREE from 'three';

// v12: logo-only correction.
// Uses a synchronous CanvasTexture traced from the approved 560x49 TWYNE mark.
// No image loading, no SVG loading, no async path failure.

const originalAdd = THREE.Group.prototype.add;

const LOGO_CONTOURS = [[[502,5],[501,7],[501,40],[504,45],[508,47],[512,47],[513,48],[551,48],[552,47],[556,47],[558,45],[558,43],[559,42],[559,38],[557,37],[517,37],[515,35],[515,30],[516,29],[555,29],[556,28],[557,29],[558,28],[558,19],[541,19],[540,18],[516,18],[515,17],[515,13],[518,10],[558,10],[559,9],[559,6],[558,5],[558,3],[556,1],[554,0],[510,0],[509,1],[505,2]],[[376,1],[376,47],[390,47],[390,15],[391,14],[393,15],[393,16],[397,20],[397,21],[401,25],[401,26],[405,30],[405,31],[408,34],[408,35],[412,39],[412,40],[418,47],[441,47],[441,0],[428,0],[427,1],[427,33],[426,34],[415,21],[415,20],[412,17],[412,16],[408,12],[408,11],[399,0],[377,0]],[[254,1],[260,7],[260,8],[266,14],[266,15],[272,21],[272,22],[280,31],[280,47],[294,47],[294,31],[305,19],[305,18],[312,11],[312,10],[319,3],[320,0],[303,0],[303,1],[298,6],[298,7],[294,11],[294,12],[289,17],[288,19],[287,19],[283,15],[283,14],[278,9],[278,8],[275,5],[275,4],[271,0],[255,0]],[[110,1],[111,2],[111,4],[112,5],[112,7],[113,8],[115,16],[117,19],[117,21],[118,22],[118,24],[119,25],[119,27],[120,28],[120,30],[121,31],[121,33],[122,34],[122,36],[123,37],[123,39],[124,40],[124,42],[125,43],[126,47],[145,47],[146,46],[146,44],[148,41],[148,39],[150,35],[150,32],[151,31],[151,29],[152,28],[152,26],[153,25],[153,23],[154,22],[154,20],[156,16],[158,18],[160,26],[162,29],[162,32],[163,33],[163,35],[164,36],[164,38],[165,39],[167,47],[187,47],[187,45],[188,44],[188,42],[189,41],[189,39],[190,38],[190,36],[191,35],[191,33],[192,32],[194,24],[196,21],[196,19],[197,18],[197,16],[198,15],[198,13],[199,12],[199,10],[200,9],[200,7],[202,3],[202,0],[189,0],[188,1],[187,5],[186,6],[186,8],[185,9],[185,12],[184,13],[184,15],[183,16],[183,18],[182,19],[182,21],[181,22],[181,24],[180,25],[180,27],[179,28],[179,30],[177,34],[175,32],[175,30],[174,29],[173,24],[171,21],[171,19],[170,18],[170,16],[169,15],[169,13],[168,12],[168,10],[167,9],[165,1],[164,0],[149,0],[146,6],[145,12],[143,15],[143,17],[142,18],[140,26],[136,34],[134,31],[134,29],[133,28],[133,26],[132,25],[132,23],[131,22],[131,20],[129,16],[129,13],[127,10],[127,7],[126,6],[125,1],[124,0],[111,0]],[[1,0],[0,1],[0,11],[20,11],[21,12],[21,47],[35,47],[35,13],[37,11],[57,11],[57,1],[56,0]]];

function makeExactLogoTexture() {
  const cv = document.createElement('canvas');
  cv.width = 1120;
  cv.height = 98;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.save();
  ctx.scale(2, 2);
  ctx.fillStyle = '#E7E4DD';

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

const exactLogoTexture = makeExactLogoTexture();

function geometrySize(obj) {
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
    const s = geometrySize(obj);
    if (!s) continue;

    // Exact v10 logo plane: 78 x 6.83 mm.
    if (Math.abs(s.x - 78) < 0.25 && Math.abs(s.y - 6.83) < 0.25 && Math.abs(s.z) < 0.1) {
      obj.material = new THREE.MeshBasicMaterial({
        map: exactLogoTexture,
        transparent: true,
        opacity: 1,
        toneMapped: false,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
      });
      obj.visible = true;
      obj.renderOrder = 999;
      obj.scale.set(1, 1, 1);
      obj.name = 'TWYNE_LOGO_EXACT_V12';
    }
  }
  return originalAdd.apply(this, objects);
};

await import('./gift-set-v10.js');
