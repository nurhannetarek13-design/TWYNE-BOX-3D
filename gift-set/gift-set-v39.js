import * as THREE from 'three';
const A=THREE.Group.prototype.add,R={m:null,l:null,g:null};
function S(o){if(!o?.geometry)return; o.geometry.computeBoundingBox();const s=new THREE.Vector3();o.geometry.boundingBox.getSize(s);return s;}
THREE.Group.prototype.add=function(...os){for(const o of os){if(!o?.isMesh)continue;const s=S(o);if(!s)continue;if(Math.abs(s.x-92)<.5&&Math.abs(s.y-6)<.5){R.m=o;R.g=this;}if(Math.abs(s.x-108)<.6&&Math.abs(s.y-9.45)<.5)R.l=o;}return A.apply(this,os)};
await import('./gift-set-v38.js?build=39');THREE.Group.prototype.add=A;
if(R.l)R.l.scale.set(.80,.88,1);
if(R.m&&R.g){R.m.visible=false;const c=document.createElement('canvas');c.width=2600;c.height=420;const x=c.getContext('2d');x.fillStyle='#11110f';x.textBaseline='middle';x.font='600 104px Manrope,Arial,sans-serif';const t='VOLUME I - KENOPSIA',a=[...t],w=a.map(q=>x.measureText(q).width),k=13,T=w.reduce((p,q)=>p+q,0)+k*(a.length-1);let p=(c.width-T)/2;a.forEach((q,i)=>{x.fillText(q,p,210);p+=w[i]+k});const q=new THREE.CanvasTexture(c);q.colorSpace=THREE.SRGBColorSpace;q.needsUpdate=true;const m=new THREE.Mesh(new THREE.PlaneGeometry(106,6.9),new THREE.MeshBasicMaterial({map:q,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));m.rotation.x=-Math.PI/2;m.position.copy(R.m.position);m.position.y+=.02;m.renderOrder=50020;R.g.add(m)}
