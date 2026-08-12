import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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
camera.position.set(235, 150, 245);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 10, 0);
controls.minDistance = 120;
controls.maxDistance = 650;

scene.add(new THREE.HemisphereLight(0xf4efe6, 0x252521, 1.35));
const key = new THREE.DirectionalLight(0xfff2e1, 2.2);
key.position.set(180, 280, 190);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -300;
key.shadow.camera.right = 300;
key.shadow.camera.top = 300;
key.shadow.camera.bottom = -300;
scene.add(key);
const fill = new THREE.DirectionalLight(0xe8edff, 0.85);
fill.position.set(-230, 160, 100);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffd7bd, 1.15);
rim.position.set(50, 170, -230);
scene.add(rim);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200,1200), new THREE.ShadowMaterial({opacity:0.18}));
ground.rotation.x = -Math.PI/2;
ground.position.y = -0.2;
ground.receiveShadow = true;
scene.add(ground);

function noiseTexture(base, amp=7, fibres=false) {
  const size=768, cv=document.createElement('canvas'); cv.width=cv.height=size;
  const ctx=cv.getContext('2d'); const c=new THREE.Color(base);
  const r=Math.round(c.r*255), g=Math.round(c.g*255), b=Math.round(c.b*255);
  ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.fillRect(0,0,size,size);
  const img=ctx.getImageData(0,0,size,size);
  for(let i=0;i<img.data.length;i+=4){ const n=(Math.random()-.5)*amp; img.data[i]=r+n; img.data[i+1]=g+n; img.data[i+2]=b+n; }
  ctx.putImageData(img,0,0);
  if(fibres){
    ctx.globalAlpha=.10; ctx.strokeStyle='#8f8b83'; ctx.lineWidth=.8;
    for(let y=0;y<size;y+=7){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(size,y+(Math.random()-.5));ctx.stroke();}
    ctx.globalAlpha=.06;
    for(let x=0;x<size;x+=11){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+(Math.random()-.5),size);ctx.stroke();}
  }
  const tex=new THREE.CanvasTexture(cv); tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(2.4,1.8); tex.colorSpace=THREE.SRGBColorSpace; return tex;
}

const linenMat = new THREE.MeshStandardMaterial({map:noiseTexture(0xE7E4DD,6,true),roughness:.98,metalness:0});
const mineralMat = new THREE.MeshStandardMaterial({map:noiseTexture(0x4D4D49,5,false),roughness:.92,metalness:0});
const insertMat = new THREE.MeshStandardMaterial({color:0xe3e0d8,roughness:.98});
const recessMat = new THREE.MeshStandardMaterial({color:0x2a2a27,roughness:1});
const capMat = new THREE.MeshStandardMaterial({color:0x171715,roughness:.5,metalness:.08});
const glassMat = new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.05,transmission:.92,transparent:true,opacity:.5,thickness:1,ior:1.5});
const liquidColors=[0xd9d2c4,0xd5c4b2,0xd7c6b5,0xcdb279];

function roundedBox(w,h,d,r,mat){ const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,5,r),mat); m.castShadow=true; m.receiveShadow=true; return m; }
function textTexture(text,size=90,weight=600,alpha=1){
  const cv=document.createElement('canvas'); cv.width=1600; cv.height=300; const ctx=cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height); ctx.fillStyle=`rgba(231,228,221,${alpha})`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font=`${weight} ${size}px Manrope, Arial`; ctx.fillText(text,cv.width/2,cv.height/2);
  const tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace; return tex;
}

const root=new THREE.Group(); scene.add(root);

const BOX_W=178, BOX_D=112;
const CLOSED_H=30;
const BASE_VISIBLE=5.2;
const LID_SKIRT=24.8;
const LID_TOP=3.2;
const CORE_H=18.5;
const CLEARANCE=0.8;
const WALL=2.0;
const BEVEL=0.6;

const baseGroup=new THREE.Group(); root.add(baseGroup);
const baseFoot=roundedBox(BOX_W,BASE_VISIBLE,BOX_D,BEVEL,linenMat);
baseFoot.position.y=BASE_VISIBLE/2; baseGroup.add(baseFoot);
const core=roundedBox(BOX_W-(WALL*2+CLEARANCE*2),CORE_H,BOX_D-(WALL*2+CLEARANCE*2),1.1,linenMat);
core.position.y=BASE_VISIBLE+CORE_H/2-0.6; baseGroup.add(core);
const insert=roundedBox(BOX_W-12,7.2,BOX_D-12,1.3,insertMat);
insert.position.y=BASE_VISIBLE+CORE_H-4.3; baseGroup.add(insert);
const INSERT_TOP=insert.position.y+3.6;

const slotGroup=new THREE.Group(); baseGroup.add(slotGroup);
let vials=[];
const names=['SOTTO VOCE','LOW FEVER','LACUNA','PALE HUM'];

function makeVial(x,label,i){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(5.5,5.5,44,32),glassMat); body.rotation.x=Math.PI/2; body.castShadow=true; g.add(body);
  const liquidMat=new THREE.MeshPhysicalMaterial({color:liquidColors[i],roughness:.08,transmission:.45,transparent:true,opacity:.8,ior:1.34});
  const liquid=new THREE.Mesh(new THREE.CylinderGeometry(4.55,4.55,35,24),liquidMat); liquid.rotation.x=Math.PI/2; liquid.position.z=-2; g.add(liquid);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(5.55,5.55,14,28),capMat); cap.rotation.x=Math.PI/2; cap.position.z=29; cap.castShadow=true; g.add(cap);
  const lt=textTexture(label,42,700,0.9);
  const lm=new THREE.Mesh(new THREE.PlaneGeometry(25,5.5),new THREE.MeshBasicMaterial({map:lt,transparent:true,toneMapped:false,depthWrite:false,side:THREE.DoubleSide}));
  lm.rotation.x=-Math.PI/2; lm.position.set(0,5.58,-3); g.add(lm);
  g.position.set(x,INSERT_TOP+2.35,-1.5); baseGroup.add(g); return g;
}

function setSpacing(spacing){
  while(slotGroup.children.length) slotGroup.remove(slotGroup.children[0]);
  vials.forEach(v=>baseGroup.remove(v)); vials=[];
  const xs=[-1.5,-.5,.5,1.5].map(n=>n*spacing);
  xs.forEach(x=>{ const s=roundedBox(13.8,.65,65,5.2,recessMat); s.position.set(x,INSERT_TOP+.04,-1.5); slotGroup.add(s); });
  xs.forEach((x,i)=>vials.push(makeVial(x,names[i],i)));
}
setSpacing(37);

const lidGroup=new THREE.Group(); root.add(lidGroup);
const top=roundedBox(BOX_W,LID_TOP,BOX_D,BEVEL,linenMat); top.position.y=LID_SKIRT-LID_TOP/2; lidGroup.add(top);
const skirtH=LID_SKIRT-LID_TOP;
const front=roundedBox(BOX_W,skirtH,WALL,BEVEL,linenMat); front.position.set(0,skirtH/2,BOX_D/2-WALL/2); lidGroup.add(front);
const back=front.clone(); back.position.z=-BOX_D/2+WALL/2; lidGroup.add(back);
const sideD=BOX_D-WALL*2;
const left=roundedBox(WALL,skirtH,sideD,BEVEL,linenMat); left.position.set(-BOX_W/2+WALL/2,skirtH/2,0); lidGroup.add(left);
const right=left.clone(); right.position.x=BOX_W/2-WALL/2; lidGroup.add(right);

const plaque=roundedBox(104,1.8,58,1.0,mineralMat); plaque.position.set(0,LID_SKIRT+.9,0); lidGroup.add(plaque);
const ken=new THREE.Mesh(new THREE.PlaneGeometry(60,8),new THREE.MeshBasicMaterial({map:textTexture('KENPOSIA',110,600,1),transparent:true,toneMapped:false,depthWrite:false,side:THREE.DoubleSide}));
ken.rotation.x=-Math.PI/2; ken.position.set(0,LID_SKIRT+1.84,-13); lidGroup.add(ken);
const vol=new THREE.Mesh(new THREE.PlaneGeometry(28,4.2),new THREE.MeshBasicMaterial({map:textTexture('VOLUME I',62,500,.82),transparent:true,toneMapped:false,depthWrite:false,side:THREE.DoubleSide}));
vol.rotation.x=-Math.PI/2; vol.position.set(0,LID_SKIRT+1.86,-2.5); lidGroup.add(vol);

const logoData='data:image/webp;base64,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';
const logoTex=new THREE.TextureLoader().load(logoData); logoTex.colorSpace=THREE.SRGBColorSpace;
const logo=new THREE.Mesh(new THREE.PlaneGeometry(72,6.2),new THREE.MeshBasicMaterial({map:logoTex,transparent:true,toneMapped:false,depthWrite:false,side:THREE.DoubleSide}));
logo.rotation.x=-Math.PI/2; logo.position.set(0,LID_SKIRT+1.88,14); logo.renderOrder=30; lidGroup.add(logo);

let openAmount=.86;
function applyOpen(v){
  openAmount=v;
  lidGroup.position.set(0,BASE_VISIBLE + 58*v,-60*v);
  lidGroup.rotation.set(0,0,0);
}
applyOpen(openAmount);

const ctrlOpen=document.getElementById('ctrl-open'); ctrlOpen.addEventListener('input',e=>applyOpen(parseFloat(e.target.value)));
const ctrlSpacing=document.getElementById('ctrl-spacing'); const readout=document.getElementById('spacing-readout');
ctrlSpacing.addEventListener('input',e=>{const v=parseFloat(e.target.value);setSpacing(v);readout.textContent=`${v} mm centre spacing`;});
function cam(pos,target=new THREE.Vector3(0,10,0)){camera.position.set(...pos);controls.target.copy(target);controls.update();}
document.getElementById('cam-3q').onclick=()=>cam([235,150,245]);
document.getElementById('cam-top').onclick=()=>cam([0,360,6]);
document.getElementById('cam-front').onclick=()=>cam([0,105,280]);
document.getElementById('cam-closed').onclick=()=>{applyOpen(0);ctrlOpen.value=0;cam([215,100,235],new THREE.Vector3(0,12,0));};
document.getElementById('btn-render').onclick=()=>{renderer.render(scene,camera);const a=document.createElement('a');a.download='TWYNE-GIFT-SET.png';a.href=renderer.domElement.toDataURL('image/png');a.click();};
window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});
function tick(){requestAnimationFrame(tick);controls.update();renderer.render(scene,camera);} tick();
