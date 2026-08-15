import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

// FINAL TWYNE FINISH SYSTEM
// TOP + BASE: TRUE 3D blind emboss using the approved TWYNE vector artwork.
// The raised mark is real geometry and therefore exports into the GLB.

const EXACT_TWYNE_PATHS = [
  'M1 3L2 18L30 15L82 15L84 17L84 191L82 200L111 201L112 199L110 189L110 17L115 15L162 15L195 18L196 4Z',
  'M359 3L367 17L437 185L445 201L463 200L539 31L543 35L573 106L613 194L614 199L616 201L634 200L689 76L707 40L715 20L724 4L701 3L700 13L693 32L632 169L630 170L624 160L599 99L556 3L522 3L528 16L473 144L460 171L454 161L430 100L403 38L394 13L393 4Z',
  'M881 3L972 117L972 190L970 200L999 201L1000 200L998 191L998 115L1094 3L1069 3L1067 9L1060 19L991 103L937 37L920 14L915 3Z',
  'M1260 3L1262 13L1262 183L1259 198L1260 201L1281 200L1278 186L1279 33L1450 200L1471 200L1470 17L1472 3L1452 3L1454 11L1455 28L1455 165L1453 167L1399 116L1285 3Z',
  'M1657 3L1659 13L1659 188L1656 200L1831 201L1833 195L1833 186L1831 185L1819 187L1687 187L1685 185L1685 109L1687 107L1800 108L1801 94L1800 92L1780 94L1687 94L1687 16L1808 15L1832 17L1833 3Z',
];

const sourceW = 1834;
const sourceH = 204;
const LOGO_W = 72;
const EMBOSS_HEIGHT = 0.40; // mm of true raised geometry
const nativeGroupAdd = THREE.Group.prototype.add;

const embossMaterial = new THREE.MeshStandardMaterial({
  color: 0x4d4d49,
  roughness: 0.90,
  metalness: 0,
  side: THREE.DoubleSide,
});

function buildEmbossGeometryGroup() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sourceW} ${sourceH}">${EXACT_TWYNE_PATHS.map(d => `<path d="${d}" fill="#000"/>`).join('')}</svg>`;
  const parsed = new SVGLoader().parse(svg);
  const group = new THREE.Group();
  const xyScale = LOGO_W / sourceW;

  for (const path of parsed.paths) {
    const shapes = SVGLoader.createShapes(path);
    for (const shape of shapes) {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: EMBOSS_HEIGHT,
        steps: 1,
        curveSegments: 2,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelThickness: 0.045,
        // bevelSize is in source SVG units before the XY scale below.
        bevelSize: 1.15,
      });

      // Centre the supplied artwork, preserve its exact proportions, and flip SVG Y.
      // Z remains in millimetres so the 0.40 mm emboss height is physically real.
      geometry.translate(-sourceW / 2, -sourceH / 2, 0);
      geometry.scale(xyScale, -xyScale, 1);
      geometry.computeVertexNormals();

      const part = new THREE.Mesh(geometry, embossMaterial.clone());
      part.castShadow = true;
      part.receiveShadow = true;
      part.userData.isTrueEmbossPart = true;
      nativeGroupAdd.call(group, part);
    }
  }

  group.userData.isTrueTwyneEmboss = true;
  group.userData.embossHeightMM = EMBOSS_HEIGHT;
  group.userData.logoWidthMM = LOGO_W;
  return group;
}

function applyTrueEmboss(mesh) {
  if (!mesh?.isMesh || !mesh.userData?.isExactTwyneLogo || mesh.userData.trueEmbossApplied) return;

  const isBase = !!mesh.userData.isExactTwyneBaseLogo;
  const isTop = !isBase && Math.abs(mesh.rotation.x + Math.PI / 2) < 0.08;
  if (!isTop && !isBase) return;

  const parent = mesh.parent;
  if (!parent) return;

  const emboss = buildEmbossGeometryGroup();
  emboss.position.copy(mesh.position);
  emboss.rotation.copy(mesh.rotation);
  emboss.scale.copy(mesh.scale);

  // Tiny surface clearance prevents z-fighting while the extrusion itself rises 0.40 mm.
  if (isTop) {
    emboss.position.y += 0.012;
    emboss.renderOrder = 60;
  } else {
    emboss.position.x = 0;
    emboss.position.y = 8.0;
    emboss.position.z += 0.012;
    emboss.renderOrder = 61;
  }

  emboss.userData.face = isTop ? 'top' : 'base-front';
  emboss.userData.finish = 'true-3d-blind-emboss';
  emboss.userData.wordmarkVersion = 'TWYNE-new-2026-08-15';

  nativeGroupAdd.call(parent, emboss);

  // Remove the old flat simulated emboss from view; geometry remains only as a source anchor.
  mesh.visible = false;
  mesh.userData.trueEmbossApplied = true;
  mesh.userData.finish = 'replaced-by-true-3d-blind-emboss';
}

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.userData?.isExactTwyneLogo) continue;

    // Let the legacy placement wrappers finish first, then replace the visual plane
    // with real raised geometry at the final approved position.
    queueMicrotask(() => applyTrueEmboss(obj));
  }

  return result;
};

await import('./main-base-polish.js');
