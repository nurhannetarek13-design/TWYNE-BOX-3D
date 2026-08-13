import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const add=THREE.Group.prototype.add, r={sp:[],sg:null,tg:null,tb:null,logo:null,v:null,k:null,e:null};
function sz(o){if(!o?.geometry)return; o.geometry.computeBoundingBox(); const s=new THREE.Vector3(); o.geometry.boundingBox.getSize(s); return s;}
THREE.Group.prototype.add=function(...os){for(const o of os){if(!o?.isMesh)continue; const s=sz(o); if(!s)continue;
if((Math.abs(s.x-198)<.6&&Math.abs(s.y-3.2)<.5&&Math.abs(s.z-110)<.6)||(Math.abs(s.x-198)<.6&&Math.abs(s.y-12.6)<.7&&Math.abs(s.z-3.2)<.5)){r.sp.push(o);r.sg=this;}
if(Math.abs(s.x-190)<.7&&Math.abs(s.y-10.5)<.7&&Math.abs(s.z-100)<.7){r.tb=o;r.tg=this;}
if(Math.abs(s.x-108)<.7&&Math.abs(s.y-9.45)<.7)r.logo=o;
if(Math.abs(s.x-54)<.7&&Math.abs(s.y-5.8)<.7)r.v=o;
if(Math.abs(s.x-64)<.7&&Math.abs(s.y-5.6)<.7)r.k=o;
if(Math.abs(s.x-58)<.7&&Math.abs(s.y-5.2)<.7)r.e=o;}
return add.apply(this,os);};
await import('./gift-set-v33.js?build=36'); THREE.Group.prototype.add=add;
if(r.sg&&r.sp.length){r.sp.forEach(x=>x.visible=false); const m=r.sp[0].material.clone(); m.roughness=1; const gs=[]; let g;
g=new THREE.BoxGeometry(198,3.2,103.6);g.translate(0,17.4,0);gs.push(g);
g=new THREE.BoxGeometry(198,3.2,103.6);g.translate(0,1.6,0);gs.push(g);
g=new THREE.BoxGeometry(198,19,3.2);g.translate(0,9.5,53.4);gs.push(g);
g=new THREE.BoxGeometry(198,19,3.2);g.translate(0,9.5,-53.4);gs.push(g);
const sh=new THREE.Mesh(mergeGeometries(gs,false),m);sh.castShadow=sh.receiveShadow=true;sh.name='CONTINUOUS_SLEEVE_V36';r.sg.add(sh);}
if(r.tg&&r.tb){const m=r.tb.material.clone(),gs=[];let g;
g=new THREE.BoxGeometry(190,5,2.4);g.translate(0,13,48.8);gs.push(g);g=new THREE.BoxGeometry(190,5,2.4);g.translate(0,13,-48.8);gs.push(g);g=new THREE.BoxGeometry(2.4,5,95.2);g.translate(-93.8,13,0);gs.push(g);g=new THREE.BoxGeometry(2.4,5,95.2);g.translate(93.8,13,0);gs.push(g);
const lip=new THREE.Mesh(mergeGeometries(gs,false),m);lip.castShadow=lip.receiveShadow=true;lip.name='TRAY_PERIMETER_LIP_V36';r.tg.add(lip);}
if(r.logo){r.logo.scale.set(.88,.88,1);}
if(r.logo?.material){r.logo.material.opacity=.7;r.logo.material.transparent=true;r.logo.material.needsUpdate=true;}
if(r.v)r.v.visible=false;if(r.k)r.k.visible=false;if(r.e)r.e.visible=false;
function tx(t,w,h,z,fs){const c=document.createElement('canvas');c.width=2200;c.height=360;const x=c.getContext('2d');x.fillStyle='#11110f';x.textBaseline='middle';x.font=`600 ${fs}px Manrope,Arial,sans-serif`;x.textAlign='center';x.fillText(t,1100,180);const q=new THREE.CanvasTexture(c);q.colorSpace=THREE.SRGBColorSpace;q.needsUpdate=true;const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:q,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));o.rotation.x=-Math.PI/2;o.position.set(0,20.97,z);r.sg?.add(o);}
tx('VOLUME I - KENOPSIA',92,6,35,92);tx('EAU DE PARFUM',58,5,41.5,78);
