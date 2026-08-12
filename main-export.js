import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Entry wrapper for the working TWYNE prototype.
// It adds the real-size 49 x 49 mm bottle proxy and captures the live scene so
// the user can export a movable GLB or a high-resolution PNG without changing
// the existing box / logo / film / typography modules.

let capturedRootGroup = null;
let capturedRenderer = null;
let capturedScene = null;
let capturedCamera = null;

const nativeSceneAdd = THREE.Scene.prototype.add;
THREE.Scene.prototype.add = function (...objects) {
  const result = nativeSceneAdd.apply(this, objects);
  for (const obj of objects) {
    if (obj?.isGroup) {
      capturedRootGroup = obj;
      if (!obj.name) obj.name = 'TWYNE_BOX_ROOT';
    }
  }
  return result;
};

const nativeRender = THREE.WebGLRenderer.prototype.render;
THREE.WebGLRenderer.prototype.render = function (scene, camera) {
  capturedRenderer = this;
  capturedScene = scene;
  capturedCamera = camera;
  return nativeRender.call(this, scene, camera);
};

const baseGroupAdd = THREE.Group.prototype.add;
const proxyParents = new WeakSet();

function geometrySize(mesh) {
  if (!mesh?.geometry) return null;
  mesh.geometry.computeBoundingBox?.();
  const bb = mesh.geometry.boundingBox;
  if (!bb) return null;
  const size = new THREE.Vector3();
  bb.getSize(size);
  return size;
}

function makeStoneTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 768;
  const ctx = cv.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, cv.width, cv.height);
  bg.addColorStop(0, '#102039');
  bg.addColorStop(0.42, '#1e3554');
  bg.addColorStop(0.72, '#0d1828');
  bg.addColorStop(1, '#263548');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cv.width, cv.height);

  // Broad mineral veins: blue-black stone with ochre / amber movement,
  // inspired by the supplied front reference rather than a literal photo map.
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 12; i++) {
    const y = 80 + i * 54 + Math.sin(i * 1.7) * 24;
    ctx.beginPath();
    ctx.moveTo(-80, y + 30);
    ctx.bezierCurveTo(
      160 + i * 9, y - 80,
      420 - i * 6, y + 95,
      850, y - 18
    );
    ctx.lineWidth = 10 + (i % 4) * 5;
    ctx.strokeStyle = i % 3 === 0
      ? 'rgba(214,146,55,0.68)'
      : i % 3 === 1
        ? 'rgba(105,139,184,0.34)'
        : 'rgba(235,190,105,0.28)';
    ctx.stroke();
  }

  ctx.globalCompositeOperation = 'multiply';
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    const x = (i * 103) % 820 - 20;
    ctx.moveTo(x, -20);
    ctx.bezierCurveTo(x + 90, 180, x - 110, 500, x + 55, 820);
    ctx.lineWidth = 14 + (i % 5) * 4;
    ctx.strokeStyle = 'rgba(2,8,15,0.24)';
    ctx.stroke();
  }

  ctx.globalCompositeOperation = 'source-over';
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function makeStoneCapGeometry() {
  const geometry = new THREE.SphereGeometry(1, 64, 36);
  const p = geometry.attributes.position;

  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);

    const warp =
      1 +
      0.075 * Math.sin((x + z) * 5.1) +
      0.045 * Math.cos((x - z) * 7.3) +
      0.035 * Math.sin(y * 9.0);

    const nx = x * 23.4 * warp + 1.35 * y * z;
    const ny = y * 9.2 * (1 + 0.14 * Math.sin(x * 3.5 - z * 2.1)) + 0.75 * x;
    const nz = z * 20.8 * (1 + 0.07 * Math.cos(x * 5.5)) - 0.85 * x * y;
    p.setXYZ(i, nx, ny, nz);
  }

  p.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}

function makeBottleCopyMaterial(text, {
  width = 900,
  height = 220,
  fontSize = 74,
  tracking = 18,
  opacity = 0.82,
} = {}) {
  const cv = document.createElement('canvas');
  cv.width = width;
  cv.height = height;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fontKerning = 'normal';
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${tracking}px`;
  ctx.font = `400 ${fontSize}px "Inter Tight", "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = `rgba(238,232,218,${opacity})`;
  ctx.fillText(text, width / 2, height / 2);

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

function addBottleCopy(group, text, y, w, h, fontSize, tracking) {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    makeBottleCopyMaterial(text, { fontSize, tracking })
  );
  plane.position.set(0, y, 24.57);
  plane.renderOrder = 80;
  plane.name = `BOTTLE_COPY_${text.replace(/\s+/g, '_')}`;
  baseGroupAdd.call(group, plane);
}

function addProxyBottle(parent, legacyBody, legacySize) {
  if (proxyParents.has(parent)) return;
  proxyParents.add(parent);

  // Existing prototype body was sunk 7 mm. The current approved presentation
  // lowers it another 4.5 mm, so the proxy uses an 11.5 mm sink directly.
  const seamY = legacyBody.position.y - legacySize.y / 2 + 7;
  const sinkDepth = 11.5;
  const baseY = seamY - sinkDepth;

  const bottle = new THREE.Group();
  bottle.name = 'TWYNE_LACUNA_BOTTLE_49x49MM';
  bottle.userData.isTwyneProxyBottle = true;
  baseGroupAdd.call(parent, bottle);

  const bodyW = 49;
  const bodyD = 49;
  const bodyH = 50.5;
  const bodyTopY = baseY + bodyH;

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xf3eadb,
    roughness: 0.055,
    metalness: 0,
    transmission: 0.93,
    thickness: 3.0,
    ior: 1.52,
    transparent: true,
    opacity: 1,
    clearcoat: 0.22,
    clearcoatRoughness: 0.08,
  });

  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: 0xa35d18,
    roughness: 0.16,
    metalness: 0,
    transmission: 0.12,
    thickness: 2.4,
    transparent: true,
    opacity: 0.91,
    ior: 1.39,
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x11100f,
    roughness: 0.36,
    metalness: 0.12,
  });

  const stoneMat = new THREE.MeshPhysicalMaterial({
    map: makeStoneTexture(),
    color: 0xffffff,
    roughness: 0.27,
    metalness: 0.02,
    clearcoat: 0.62,
    clearcoatRoughness: 0.18,
  });

  // True footprint: 49 x 49 mm.
  const glass = new THREE.Mesh(
    new RoundedBoxGeometry(bodyW, bodyH, bodyD, 5, 1.15),
    glassMat
  );
  glass.position.set(0, baseY + bodyH / 2, 0);
  glass.castShadow = true;
  glass.receiveShadow = true;
  glass.name = 'BOTTLE_GLASS_49x49';
  baseGroupAdd.call(bottle, glass);

  // Amber fill held away from the glass walls and base so the heavy glass
  // perimeter reads like the supplied reference image.
  const liquidH = 40.2;
  const liquid = new THREE.Mesh(
    new RoundedBoxGeometry(41.6, liquidH, 41.6, 4, 3.1),
    liquidMat
  );
  liquid.position.set(0, baseY + 6.3 + liquidH / 2, -0.7);
  liquid.name = 'AMBER_LIQUID';
  baseGroupAdd.call(bottle, liquid);

  // Slight inner front lens gives the proxy the thick curved internal-wall read
  // seen in the reference without pretending this is final production CAD.
  const innerLens = new THREE.Mesh(
    new RoundedBoxGeometry(38.4, 34.5, 2.6, 4, 1.3),
    new THREE.MeshPhysicalMaterial({
      color: 0xf5e2c7,
      roughness: 0.05,
      transmission: 0.72,
      thickness: 1.8,
      transparent: true,
      opacity: 0.25,
      ior: 1.48,
    })
  );
  innerLens.position.set(0, baseY + 25.3, 20.8);
  innerLens.name = 'INNER_GLASS_LENS';
  baseGroupAdd.call(bottle, innerLens);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(7.4, 8.4, 4.5, 40),
    glassMat
  );
  neck.position.set(0, bodyTopY + 2.05, 0);
  neck.name = 'BOTTLE_NECK';
  baseGroupAdd.call(bottle, neck);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(7.8, 7.8, 2.2, 48),
    blackMat
  );
  collar.position.set(0, bodyTopY + 4.8, 0);
  collar.name = 'BLACK_COLLAR';
  baseGroupAdd.call(bottle, collar);

  const pumpCore = new THREE.Mesh(
    new THREE.CylinderGeometry(3.0, 3.2, 3.8, 32),
    blackMat
  );
  pumpCore.position.set(0, bodyTopY + 7.3, 0);
  pumpCore.name = 'PUMP_CORE';
  baseGroupAdd.call(bottle, pumpCore);

  const cap = new THREE.Mesh(makeStoneCapGeometry(), stoneMat);
  cap.position.set(0.8, bodyTopY + 16.7, -0.5);
  cap.rotation.set(-0.055, 0.10, -0.045);
  cap.castShadow = true;
  cap.receiveShadow = true;
  cap.name = 'ORGANIC_STONE_CAP';
  baseGroupAdd.call(bottle, cap);

  // Front copy from the supplied LACUNA reference.
  addBottleCopy(bottle, 'LACUNA', baseY + 28.4, 26, 4.3, 72, 17);
  addBottleCopy(bottle, 'TWYNE', baseY + 7.2, 22, 3.5, 64, 18);
}

THREE.Group.prototype.add = function (...objects) {
  const result = baseGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (obj?.isGroup && !obj.name && capturedRootGroup && this === capturedRootGroup) {
      obj.name = 'LID_ASSEMBLY';
    }

    if (!obj?.isMesh || !obj.geometry) continue;
    const size = geometrySize(obj);
    if (!size) continue;

    const isLegacyBody =
      size.x > 48.5 && size.x < 49.5 &&
      size.y > 49 && size.y < 50.5 &&
      size.z > 49 && size.z < 50.2;

    const isLegacyCap =
      size.x > 44 && size.x < 46.5 &&
      size.y > 26 && size.y < 29 &&
      size.z > 44 && size.z < 47;

    const isBase =
      size.x > 84 && size.z > 84 &&
      size.y > 8 && size.y < 30;

    const isLidShell =
      size.x > 84 && size.z > 84 &&
      size.y > 60 && size.y < 100;

    if (isBase && !obj.name) obj.name = 'BASE';
    if (isLidShell) {
      if (!obj.name) obj.name = 'LID_SHELL_VISUAL';
      if (this?.isGroup && !this.name) this.name = 'LID_ASSEMBLY';
    }
    if (obj.userData?.isRaisedBaseTray && !obj.name) obj.name = 'PROTECTIVE_RIM';

    if (isLegacyBody) {
      obj.visible = false;
      obj.name = 'LEGACY_BOTTLE_BODY_HIDDEN';
      addProxyBottle(this, obj, size);
    }

    if (isLegacyCap) {
      obj.visible = false;
      obj.name = 'LEGACY_BOTTLE_CAP_HIDDEN';
    }
  }

  return result;
};

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function exportGLB() {
  const btn = document.getElementById('btn-export-glb');
  if (!capturedRootGroup) {
    alert('TWYNE 3D scene is still loading. Try again in a moment.');
    return;
  }

  const originalText = btn?.textContent;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'EXPORTING GLB…';
  }

  try {
    const exportScene = new THREE.Scene();
    exportScene.name = 'TWYNE_EXPORT_SCENE';

    const exportRoot = capturedRootGroup.clone(true);
    exportRoot.name = 'TWYNE_BOX_COMPLETE';

    // The working prototype uses 1 Three.js unit = 1 mm. glTF consumers use
    // metres, so 0.001 preserves the actual physical package size on import.
    exportRoot.scale.multiplyScalar(0.001);
    exportScene.add(exportRoot);

    const exporter = new GLTFExporter();
    const glb = await new Promise((resolve, reject) => {
      exporter.parse(
        exportScene,
        resolve,
        reject,
        {
          binary: true,
          onlyVisible: true,
          trs: true,
          maxTextureSize: 2048,
          includeCustomExtensions: true,
        }
      );
    });

    downloadBlob(
      new Blob([glb], { type: 'model/gltf-binary' }),
      'TWYNE_BOX_LACUNA_49x49.glb'
    );
  } catch (err) {
    console.error('TWYNE GLB export failed', err);
    alert('GLB export failed. Open the browser console for the error.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText || 'EXPORT GLB — 3D MODEL';
    }
  }
}

async function renderPNG() {
  const btn = document.getElementById('btn-render-png');
  if (!capturedRenderer || !capturedScene || !capturedCamera) {
    alert('TWYNE renderer is still loading. Try again in a moment.');
    return;
  }

  const originalText = btn?.textContent;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'RENDERING 2400 × 2400…';
  }

  const renderer = capturedRenderer;
  const camera = capturedCamera;
  const oldSize = new THREE.Vector2();
  renderer.getSize(oldSize);
  const oldPixelRatio = renderer.getPixelRatio();
  const oldAspect = camera.aspect;

  try {
    renderer.setPixelRatio(1);
    renderer.setSize(2400, 2400, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    nativeRender.call(renderer, capturedScene, camera);

    const blob = await new Promise((resolve, reject) => {
      renderer.domElement.toBlob(
        result => result ? resolve(result) : reject(new Error('PNG canvas capture returned empty data')),
        'image/png',
        1
      );
    });

    downloadBlob(blob, 'TWYNE_BOX_RENDER_2400.png');
  } catch (err) {
    console.error('TWYNE PNG render failed', err);
    alert('PNG render failed. Open the browser console for the error.');
  } finally {
    renderer.setPixelRatio(oldPixelRatio);
    renderer.setSize(oldSize.x, oldSize.y, false);
    camera.aspect = oldAspect;
    camera.updateProjectionMatrix();
    nativeRender.call(renderer, capturedScene, camera);

    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText || 'RENDER PNG — CURRENT VIEW';
    }
  }
}

// Load the existing chain unchanged: exact logo -> entry overrides -> main-v2.
await import('./main-logo.js');

// Wire the export buttons already present in index.html.
document.getElementById('btn-export-glb')?.addEventListener('click', exportGLB);
document.getElementById('btn-render-png')?.addEventListener('click', renderPNG);
