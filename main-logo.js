import * as THREE from 'three';

// Replace the previous traced top wordmark with the exact silhouette supplied by the user.
// Keep it tonal so it still reads as blind deboss on the graphite wrap.
const nativeGroupAdd = THREE.Group.prototype.add;
const logoTexture = new THREE.TextureLoader().load('./assets/twyne-wordmark-user.svg?v=1');
logoTexture.colorSpace = THREE.SRGBColorSpace;
logoTexture.anisotropy = 8;

function addSuppliedLogo(parent, oldMesh) {
  const makeMat = (color, opacity) => new THREE.MeshBasicMaterial({
    map: logoTexture,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });

  const geometry = new THREE.PlaneGeometry(62, 23.3);

  const layers = [
    { dx: -0.10, dz: 0.10, dy: 0.015, color: 0x777772, opacity: 0.32, order: 35 },
    { dx: 0.12, dz: -0.12, dy: 0.020, color: 0x080807, opacity: 0.58, order: 36 },
    { dx: 0, dz: 0, dy: 0.025, color: 0x171715, opacity: 0.72, order: 37 },
  ];

  for (const layer of layers) {
    const mesh = new THREE.Mesh(geometry, makeMat(layer.color, layer.opacity));
    mesh.position.copy(oldMesh.position);
    mesh.position.x += layer.dx;
    mesh.position.z += layer.dz;
    mesh.position.y += layer.dy;
    mesh.rotation.copy(oldMesh.rotation);
    mesh.renderOrder = layer.order;
    mesh.userData.isLabel = true;
    mesh.userData.isNewTwyneLogo = true;
    nativeGroupAdd.call(parent, mesh);
  }
}

THREE.Group.prototype.add = function(...objects) {
  const result = nativeGroupAdd.apply(this, objects);

  for (const obj of objects) {
    if (!obj?.isMesh || !obj.geometry || !obj.userData?.isLabel) continue;
    const p = obj.geometry.parameters;
    if (!p) continue;

    // Existing top TWYNE plane in main-v2.js: 69 × 6.75 mm, horizontal on the lid.
    const isOldTopWordmark =
      Math.abs((p.width ?? 0) - 69) < 0.6 &&
      Math.abs((p.height ?? 0) - 6.75) < 0.6 &&
      Math.abs(obj.rotation.x + Math.PI / 2) < 0.08;

    if (!isOldTopWordmark) continue;

    obj.visible = false;
    addSuppliedLogo(this, obj);
  }

  return result;
};

await import('./main-entry.js');
