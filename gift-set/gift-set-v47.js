import * as THREE from 'three';
const A=THREE.Group.prototype.add,R={sg:null,logo:null,vol:null,eau:null,labels:[]};
function s(o){if(!o?.geometry)return null;o.geometry.computeBoundingBox?.();const b=o.geometry.boundingBox;if(!b)return null;const v=new THREE.Vector3();b.getSize(v);return v;}
THREE.Group.prototype.add=function(...os){for(const o of os){if(!o?.isMesh)continue;const z=s(o);if(!z)continue;if(Math.abs(z.x-108)<.7&&Math.abs(z.y-9.45)<.7)R.logo=o;if(Math.abs(z.x-92)<.7&&Math.abs(z.y-6)<.7){R.vol=o;R.sg=this;}if(Math.abs(z.x-58)<.7&&Math.abs(z.y-5)<.7)R.eau=o;if(Math.abs(z.x-32)<.8&&Math.abs(z.y-4.4)<.8)R.labels.push(o);}return A.apply(this,os)};
await import('./gift-set-v36.js?build=50');THREE.Group.prototype.add=A;
if(R.vol)R.vol.visible=false;if(R.eau)R.eau.visible=false;
if(R.logo){R.logo.scale.set(.50,.50,1);R.logo.position.z=-15.5;if(R.logo.material){R.logo.material.opacity=.68;R.logo.material.transparent=true;R.logo.material.depthTest=false;R.logo.material.depthWrite=false;R.logo.material.needsUpdate=true;}}
function tex(t,fs,tr){const c=document.createElement('canvas');c.width=1800;c.height=360;const x=c.getContext('2d');x.clearRect(0,0,1800,360);x.fillStyle='#111110';x.textBaseline='middle';x.font=`600 ${fs}px Manrope,Arial,sans-serif`;const a=[...t],w=a.map(q=>x.measureText(q).width),T=w.reduce((p,q)=>p+q,0)+tr*(a.length-1);let p=(1800-T)/2;a.forEach((q,i)=>{x.fillText(q,p,180);p+=w[i]+tr});const m=new THREE.CanvasTexture(c);m.colorSpace=THREE.SRGBColorSpace;m.minFilter=THREE.LinearFilter;m.magFilter=THREE.LinearFilter;m.generateMipmaps=false;m.needsUpdate=true;return m;}
function add(t,w,h,z,fs,tr,ord){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex(t,fs,tr),transparent:true,toneMapped:false,depthTest:false,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(0,21.01,z);m.renderOrder=53000+ord;R.sg?.add(m);}
add('VOLUME I — KENOPSIA',88,6.5,30.6,92,10,1);
add('EAU DE PARFUM',70,6.2,39.0,94,8,2);
R.labels.forEach((l,i)=>{l.visible=true;l.scale.set(.58,.58,1);l.position.z=35.2;l.position.y+=.05;l.renderOrder=140+i;if(l.material){l.material.opacity=.72;l.material.transparent=true;l.material.depthTest=true;l.material.depthWrite=false;l.material.toneMapped=false;l.material.needsUpdate=true;}});
