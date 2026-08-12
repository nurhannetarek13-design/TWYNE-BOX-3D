import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// TWYNE GIFT SET — standalone prototype
// 1 Three.js unit = 1 mm

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0a);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2500);
camera.position.set(245, 180, 255);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 18, 0);
controls.minDistance = 120;
controls.maxDistance = 700;

scene.add(new THREE.HemisphereLight(0xf3efe6, 0x252521, 1.25));

const key = new THREE.DirectionalLight(0xfff1df, 2.15);
key.position.set(190, 310, 200);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -300;
key.shadow.camera.right = 300;
key.shadow.camera.top = 300;
key.shadow.camera.bottom = -300;
scene.add(key);

const fill = new THREE.DirectionalLight(0xe7ecff, 0.9);
fill.position.set(-250, 180, 120);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffd6b6, 1.2);
rim.position.set(40, 180, -260);
scene.add(rim);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1200, 1200),
  new THREE.ShadowMaterial({ opacity: 0.19 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -13;
ground.receiveShadow = true;
scene.add(ground);

function noiseTexture(base, amp = 8, fibres = false) {
  const size = 1024;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const c = new THREE.Color(base);
  const r = Math.round(c.r * 255), g = Math.round(c.g * 255), b = Math.round(c.b * 255);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * amp;
    img.data[i] = Math.max(0, Math.min(255, r + n));
    img.data[i+1] = Math.max(0, Math.min(255, g + n));
    img.data[i+2] = Math.max(0, Math.min(255, b + n));
  }
  ctx.putImageData(img, 0, 0);
  if (fibres) {
    ctx.globalAlpha = 0.13;
    ctx.strokeStyle = '#8f8b83';
    ctx.lineWidth = 1;
    for (let y = 0; y < size; y += 7) {
      ctx.beginPath();
      ctx.moveTo(0, y + (Math.random() - .5) * 2);
      ctx.lineTo(size, y + (Math.random() - .5) * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.08;
    for (let x = 0; x < size; x += 11) {
      ctx.beginPath();
      ctx.moveTo(x + (Math.random() - .5) * 2, 0);
      ctx.lineTo(x + (Math.random() - .5) * 2, size);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.6, 2.0);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const linenMat = new THREE.MeshStandardMaterial({
  map: noiseTexture(0xE7E4DD, 6, true),
  roughness: 0.98,
  metalness: 0,
});

const mineralMat = new THREE.MeshStandardMaterial({
  map: noiseTexture(0x4D4D49, 5, false),
  roughness: 0.90,
  metalness: 0,
});

const insertMat = new THREE.MeshStandardMaterial({
  color: 0xe3e0d8,
  roughness: 0.96,
  metalness: 0,
});

const darkInsertMat = new THREE.MeshStandardMaterial({
  color: 0x2a2a27,
  roughness: 0.98,
  metalness: 0,
});

const capMat = new THREE.MeshStandardMaterial({ color: 0x171715, roughness: 0.52, metalness: 0.08 });
const liquidMat = new THREE.MeshPhysicalMaterial({ color: 0xe4d5b3, roughness: 0.08, transmission: 0.54, transparent: true, opacity: 0.88, ior: 1.35 });
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.06, transmission: 0.94, transparent: true, opacity: 0.44, thickness: 1.1, ior: 1.5 });

function roundedBox(w,h,d,r,mat) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w,h,d,5,r), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function textTexture(lines, width=1400, height=650) {
  const cv = document.createElement('canvas');
  cv.width = width; cv.height = height;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle = '#e9e6df';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 155px Manrope, Arial';
  ctx.fillText(lines[0], width/2, height*0.43);
  ctx.fillStyle = 'rgba(233,230,223,.72)';
  ctx.font = '600 54px Manrope, Arial';
  ctx.letterSpacing = '6px';
  ctx.fillText(lines[1], width/2, height*0.66);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const root = new THREE.Group();
scene.add(root);

const W = 178;
const D = 112;
const BASE_H = 18;
const COVER_T = 7;

// Base — linen wrapped, shallow presentation case.
const base = roundedBox(W, BASE_H, D, 2.2, linenMat);
base.position.y = 0;
root.add(base);

// Insert floating just above base.
const insert = roundedBox(W-10, 7.5, D-10, 1.8, insertMat);
insert.position.y = BASE_H/2 + 3.3;
root.add(insert);

// Four recessed slots, deliberately widely spaced.
const slotGroup = new THREE.Group();
root.add(slotGroup);

function addSlot(x) {
  const slot = roundedBox(14, 4.8, 78, 5.8, darkInsertMat);
  slot.position.set(x, BASE_H/2 + 7.1, 0);
  slotGroup.add(slot);
}

function makeVial(x, label) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 55, 32), glassMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  g.add(body);

  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(4.15, 4.15, 43, 24), liquidMat);
  liquid.rotation.x = Math.PI / 2;
  liquid.position.z = 2;
  g.add(liquid);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(5.55, 5.55, 15, 28), capMat);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 34.5;
  cap.castShadow = true;
  g.add(cap);

  const cv = document.createElement('canvas');
  cv.width = 720; cv.height = 180;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0,0,720,180);
  ctx.fillStyle = '#242421';
  ctx.font = '700 48px Manrope, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 360, 90);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(23, 6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, toneMapped:false }));
  labelMesh.rotation.x = -Math.PI/2;
  labelMesh.position.set(0, 5.25, 0);
  g.add(labelMesh);

  g.position.set(x, BASE_H/2 + 11.3, -1.5);
  root.add(g);
  return g;
}

const vialNames = ['SOTTO VOCE','LOW FEVER','LACUNA','PALE HUM'];
let vials = [];

function setSpacing(spacing) {
  while (slotGroup.children.length) slotGroup.remove(slotGroup.children[0]);
  vials.forEach(v => root.remove(v));
  vials = [];
  const xs = [-1.5,-0.5,0.5,1.5].map(n => n*spacing);
  xs.forEach(addSlot);
  xs.forEach((x,i) => vials.push(makeVial(x, vialNames[i])));
}
setSpacing(37);

// Hinged cover, entirely linen paper.
const hinge = new THREE.Group();
hinge.position.set(0, BASE_H/2, -D/2 + 4);
root.add(hinge);

const cover = roundedBox(W, COVER_T, D, 2.2, linenMat);
cover.position.set(0, COVER_T/2 + 1.2, D/2 - 4);
hinge.add(cover);

// Mineral Graphite centre field / plaque — same exact family as 50 ml box.
const plaque = roundedBox(104, 2.4, 58, 1.2, mineralMat);
plaque.position.set(0, COVER_T/2 + 4.15, D/2 - 4);
hinge.add(plaque);

const plaqueCopy = new THREE.Mesh(
  new THREE.PlaneGeometry(88, 38),
  new THREE.MeshBasicMaterial({ map: textTexture(['TWYNE','VOLUME I — KENOPSIA']), transparent:true, toneMapped:false })
);
plaqueCopy.rotation.x = -Math.PI/2;
plaqueCopy.position.set(0, COVER_T/2 + 5.42, D/2 - 4);
hinge.add(plaqueCopy);

let openAmount = 0.86;
function applyOpen(v) {
  openAmount = v;
  hinge.rotation.x = -THREE.MathUtils.degToRad(112) * v;
}
applyOpen(openAmount);

const ctrlOpen = document.getElementById('ctrl-open');
ctrlOpen.addEventListener('input', e => applyOpen(parseFloat(e.target.value)));

const ctrlSpacing = document.getElementById('ctrl-spacing');
const readout = document.getElementById('spacing-readout');
ctrlSpacing.addEventListener('input', e => {
  const v = parseFloat(e.target.value);
  setSpacing(v);
  readout.textContent = `${v} mm centre spacing`;
});

function animateCamera(pos, target = new THREE.Vector3(0,18,0)) {
  camera.position.set(...pos);
  controls.target.copy(target);
  controls.update();
}

document.getElementById('cam-3q').onclick = () => animateCamera([245,180,255]);
document.getElementById('cam-top').onclick = () => animateCamera([0,390,6]);
document.getElementById('cam-front').onclick = () => animateCamera([0,120,310]);
document.getElementById('cam-closed').onclick = () => { applyOpen(0); ctrlOpen.value = 0; animateCamera([220,125,240], new THREE.Vector3(0,2,0)); };

document.getElementById('btn-render').onclick = () => {
  renderer.render(scene,camera);
  const a = document.createElement('a');
  a.download = 'TWYNE-GIFT-SET.png';
  a.href = renderer.domElement.toDataURL('image/png');
  a.click();
};

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function tick(){
  requestAnimationFrame(tick);
  controls.update();
  renderer.render(scene,camera);
}
tick();
