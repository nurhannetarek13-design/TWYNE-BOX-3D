import * as THREE from 'three';

const A = THREE.Group.prototype.add;
const R = { sg:null, logo:null, vol:null, eau:null, labels:[], paper:[] };
const TESTER_NAMES = ['SOTTO VOCE','LOW FEVER','LACUNA','PALE HUM'];

function sizeOf(o){
  if(!o?.geometry) return null;
  o.geometry.computeBoundingBox?.();
  const b=o.geometry.boundingBox;
  if(!b) return null;
  const v=new THREE.Vector3();
  b.getSize(v);
  return v;
}

function graphiteMap(){
  const c=document.createElement('canvas');
  c.width=c.height=1024;
  const x=c.getContext('2d');
  x.fillStyle='#4D4D49';
  x.fillRect(0,0,1024,1024);
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(3,3);
  t.colorSpace=THREE.SRGBColorSpace;
  t.needsUpdate=true;
  return t;
}

function trackedTexture(text,{fontSize=100,tracking=0,weight=500,color='#E7E4DD'}={}){
  const c=document.createElement('canvas');
  c.width=2200; c.height=400;
  const x=c.getContext('2d');
  x.clearRect(0,0,c.width,c.height);
  x.fillStyle=color;
  x.textBaseline='middle';
  x.fontKerning='normal';
  x.font=`${weight} ${fontSize}px Manrope, Arial, sans-serif`;
  const chars=[...text];
  const widths=chars.map(ch=>x.measureText(ch).width);
  const total=widths.reduce((a,b)=>a+b,0)+tracking*Math.max(0,chars.length-1);
  let p=(c.width-total)/2;
  chars.forEach((ch,i)=>{
    x.fillText(ch,p,c.height/2);
    p+=widths[i]+tracking;
  });
  const t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;
  t.minFilter=THREE.LinearFilter;
  t.magFilter=THREE.LinearFilter;
  t.generateMipmaps=false;
  t.needsUpdate=true;
  return t;
}

function styleTesterLabel(l,i){
  if(!l?.material) return;
  if(!R.labels.includes(l)) R.labels.push(l);
  const name=TESTER_NAMES[i % TESTER_NAMES.length];
  l.material.map=trackedTexture(name,{fontSize:170,tracking:4,weight:600,color:'#E7E4DD'});
  l.material.color?.set?.(0xffffff);
  l.material.opacity=1;
  l.material.transparent=true;
  l.material.depthTest=true;
  l.material.depthWrite=false;
  l.material.toneMapped=false;
  l.material.needsUpdate=true;
  l.scale.set(1.16,1.16,1);
  l.position.z=35.8;
  if(!l.userData.labelLift){l.position.y+=0.12;l.userData.labelLift=true;}
  l.renderOrder=240+i;
}

THREE.Group.prototype.add=function(...os){
  for(const o of os){
    if(!o?.isMesh) continue;
    const z=sizeOf(o);
    if(!z) continue;
    if(o.material?.isMeshStandardMaterial && o.material?.map) R.paper.push(o);
    if(Math.abs(z.x-108)<.7 && Math.abs(z.y-9.45)<.7) R.logo=o;
    if(Math.abs(z.x-92)<.7 && Math.abs(z.y-6)<.7){R.vol=o;R.sg=this;}
    if(Math.abs(z.x-58)<.7 && Math.abs(z.y-5)<.7) R.eau=o;
    if(Math.abs(z.x-32)<.8 && Math.abs(z.y-4.4)<.8) R.labels.push(o);
  }
  return A.apply(this,os);
};

await import('./gift-set-v36.js?build=55');
THREE.Group.prototype.add=A;

const gm=graphiteMap();
const seen=new Set();
R.paper.forEach(o=>{
  const m=o.material;
  if(!m || seen.has(m.uuid)) return;
  seen.add(m.uuid);
  m.map=gm.clone();
  m.map.needsUpdate=true;
  m.color.set(0xffffff);
  m.roughness=.90;
  m.metalness=0;
  m.bumpMap=null;
  m.needsUpdate=true;
});

if(R.vol) R.vol.visible=false;
if(R.eau) R.eau.visible=false;

// NEW TWYNE WORDMARK — traced from the user's supplied logo, preserving its wide spacing and proportions.
if(R.logo){
  const newLogoTex=new THREE.TextureLoader().load('../assets/twyne-wordmark-new-cream.svg?v=55');
  newLogoTex.colorSpace=THREE.SRGBColorSpace;
  newLogoTex.minFilter=THREE.LinearFilter;
  newLogoTex.magFilter=THREE.LinearFilter;
  newLogoTex.generateMipmaps=false;
  R.logo.geometry.dispose?.();
  R.logo.geometry=new THREE.PlaneGeometry(74,13.92);
  R.logo.scale.set(1,1,1);
  R.logo.position.z=-15.5;
  if(R.logo.material){
    R.logo.material.map=newLogoTex;
    R.logo.material.color?.set?.(0xffffff);
    R.logo.material.opacity=1;
    R.logo.material.transparent=true;
    R.logo.material.depthTest=false;
    R.logo.material.depthWrite=false;
    R.logo.material.toneMapped=false;
    R.logo.material.needsUpdate=true;
  }
}

if(document.fonts?.load){
  await Promise.allSettled([
    document.fonts.load('500 106px Manrope'),
    document.fonts.load('600 170px Manrope'),
    document.fonts.ready
  ]);
}

function addFrontText(text,w,z,fs,tr,ord){
  const h=w/(2200/400);
  const mesh=new THREE.Mesh(
    new THREE.PlaneGeometry(w,h),
    new THREE.MeshBasicMaterial({
      map:trackedTexture(text,{fontSize:fs,tracking:tr,weight:500,color:'#E7E4DD'}),
      transparent:true,
      opacity:1,
      toneMapped:false,
      depthTest:false,
      depthWrite:false,
      side:THREE.DoubleSide
    })
  );
  mesh.rotation.x=-Math.PI/2;
  mesh.position.set(0,21.16,z);
  mesh.renderOrder=61000+ord;
  R.sg?.add(mesh);
}

addFrontText('VOLUME I — KENOPSIA',50,30.6,106,20,1);
addFrontText('EAU DE PARFUM',34,38.0,72,3,2);

R.labels.forEach((l,i)=>styleTesterLabel(l,i));

const B=THREE.Group.prototype.add;
THREE.Group.prototype.add=function(...os){
  for(const o of os){
    if(!o?.isMesh) continue;
    const z=sizeOf(o);
    if(z && Math.abs(z.x-32)<.8 && Math.abs(z.y-4.4)<.8){
      queueMicrotask(()=>{
        const i=R.labels.indexOf(o);
        styleTesterLabel(o,i<0?0:i);
      });
    }
  }
  return B.apply(this,os);
};

function syncLabels(){
  const v=Number(document.getElementById('ctrl-open')?.value ?? .82);
  R.labels.forEach(l=>l.visible=v>.34);
  requestAnimationFrame(syncLabels);
}
syncLabels();
