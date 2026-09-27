/* Maqueta didáctica. Geometría original construida con Three.js. */
(() => {
'use strict';
const R = [
 {n:'Taller abierto a la vivienda',zone:'Garaje ↔ sala',level:'ALTA',pos:[-2.05,1.10,1.15],view:[8,10,14],risk:'El taller y la sala comparten el aire y el paso. Los gases de un motor encendido pueden entrar en la vivienda; el monóxido de carbono no se detecta por el olor.',fix:'Separar físicamente el taller de las zonas de vida con un cerramiento y puerta que cierre bien. Sacar la moto al exterior antes de encenderla y mantener el área de trabajo ventilada hacia afuera. Un detector de CO suma protección, pero no sustituye estas medidas.',src:'https://www.cdc.gov/carbon-monoxide/es/about/informacion-basica-sobre-la-intoxicacion-por-monoxido-de-carbono.html'},
 {n:'Herramientas en el suelo',zone:'Piso del taller',level:'ALTA',pos:[-4.55,.75,2.6],view:[-10,10,13],risk:'Llaves, piezas y herramientas ocupan la circulación. Pueden causar tropiezos, cortes y acceso accidental de los niños a objetos peligrosos.',fix:'Despejar el piso al terminar cada tarea; asignar un panel y un armario con cierre para herramientas y piezas. Delimitar un paso libre y mantener a los niños fuera del taller.',src:'https://www.who.int/publications/i/item/9789241550376'},
 {n:'Aceite derramado',zone:'Frente del taller',level:'ALTA',pos:[-3.20,.55,1.75],view:[-9,10,13],risk:'Hay manchas de aceite bajo la zona de trabajo. El piso resbaladizo facilita caídas y el aceite usado puede contaminar superficies que tocan los habitantes.',fix:'Contener el derrame, absorberlo con material adecuado, limpiar el piso y guardar aceite nuevo y usado en recipientes cerrados y rotulados. Entregar el aceite usado a un gestor autorizado; no verterlo al suelo o al desagüe.',src:'https://www.epa.gov/recycle/managing-reusing-and-recycling-used-oil'},
 {n:'Tanques sin tapa',zone:'Área de almacenamiento de agua',level:'ALTA',pos:[4.55,1.30,2.4],view:[12,11,11],risk:'El agua expuesta puede contaminarse y favorecer criaderos de mosquitos. Para un niño pequeño, un tanque abierto también es un riesgo de ahogamiento.',fix:'Colocar tapas firmes que impidan el acceso infantil; usar malla fina si hay aberturas de ventilación. Lavar los recipientes y proteger por separado el agua destinada a beber en envases limpios y cerrados.',src:'https://www.cdc.gov/mosquitoes/es/mosquito-control/el-control-de-mosquitos-en-la-casa.html'},
 {n:'Sin agua permanente',zone:'Cocina y lavado de manos',level:'ALTA',pos:[3.00,1.10,.7],view:[11,10,7],risk:'La vivienda no está conectada al acueducto. La disponibilidad irregular de agua dificulta el lavado de manos, la limpieza y la preparación segura de alimentos.',fix:'Gestionar una conexión segura al servicio de agua con la entidad competente. Mientras se resuelve, planificar abastecimiento suficiente y usar agua segura para beber y cocinar, almacenada en recipientes limpios y cubiertos.',src:'https://www.who.int/publications/i/item/9789240015241'},
 {n:'Indicios de roedores',zone:'Esquina de cocina y residuos',level:'ALTA',pos:[5.3,.65,-.6],view:[12,10,-5],risk:'Se observan roedores junto al área doméstica. Pueden contaminar comida y superficies con orina o excrementos; los residuos accesibles favorecen su presencia.',fix:'Cerrar alimentos y residuos en recipientes resistentes con tapa, retirar restos a diario, localizar y sellar entradas y solicitar control de plagas seguro para un hogar con niños. Evitar barrer en seco excrementos de roedor.',src:'https://www.cdc.gov/healthy-pets/rodent-control/index.html'},
 {n:'Niños cerca del taller',zone:'Paso entre sala y garaje',level:'ALTA',pos:[-.95,1.15,2.1],view:[7,10,14],risk:'Los niños de primera infancia pueden llegar al área con motos, aceites, piezas y herramientas a través del paso abierto.',fix:'Crear una barrera física con puerta que se mantenga cerrada, guardar sustancias y herramientas bajo llave y definir una zona de juego lejos de la actividad del taller.',src:'https://www.cdc.gov/act-early/milestones/15-months.html'},
 {n:'Poco espacio para seis',zone:'Dormitorios y zonas comunes',level:'MEDIA',pos:[2,.92,-2.15],view:[5,15,-14],risk:'Seis personas usan una vivienda pequeña, incluidas dos personas mayores y dos niños. El almacenamiento y los recorridos estrechos aumentan la dificultad para mantener orden y circulación.',fix:'Despejar rutas de paso, ordenar los objetos en altura con anclaje seguro y reservar áreas de descanso y juego libres de materiales del taller. Revisar ventilación e iluminación reales durante la visita.',src:'https://www.who.int/publications/i/item/9789241550376'}
];
const $=id=>document.getElementById(id);
const found=new Set(); let active=-1, solved=false, touring=false;
const root=$('scene'), labels=$('hotspots'), detail=$('detail');
let scene,camera,renderer,orbit, house, hazards, upgrades, persons, resizeObserver;
const markers=[]; const homePos=new THREE.Vector3(13,15,18);
const C={navy:0x253f4c,wood:0xb98e68,cream:0xf5f0df,walls:0xcbb99b,red:0xd96d4c,teal:0x4c9783,garage:0x61777c,living:0xb88360,bed:0x93b7a3,kitchen:0xabb586};
function mat(color,opts={}){return new THREE.MeshStandardMaterial({color,roughness:.84,...opts});}
function box(w,h,d,x,y,z,color,group=house,opts={}){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,opts));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function cyl(radius,height,x,y,z,color,group=house,r2=radius){const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,r2,height,18),mat(color));m.position.set(x,y,z);m.castShadow=true;group.add(m);return m;}
function sphere(radius,x,y,z,color,group=house){const m=new THREE.Mesh(new THREE.SphereGeometry(radius,12,8),mat(color));m.position.set(x,y,z);m.castShadow=true;group.add(m);return m;}
function line(points,color=0x596e69,group=house,r=.025){for(let i=1;i<points.length;i++){const a=new THREE.Vector3(...points[i-1]),b=new THREE.Vector3(...points[i]);const segment=new THREE.Mesh(new THREE.CylinderGeometry(r,r,a.distanceTo(b),8),mat(color));segment.position.copy(a).add(b).multiplyScalar(.5);segment.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());group.add(segment);}}
function surface(w,d,x,z,color){box(w,.07,d,x,.045,z,color);box(w,.04,d,x,-.05,z,0xc1c2b3);}
function wall(w,d,x,z,height=1.4){const m=box(w,height,d,x,.1+height/2,z,C.walls);box(w,.055,d,x,.13+height,z,0xdbd0b8);return m;}
function windowAt(x,z,alongX=true){const g=house,blue=0xabc9c7; if(alongX){box(1.05,.41,.035,x,1.11,z,blue,g,{transparent:true,opacity:.72});box(.04,.48,.065,x,1.11,z,0xf9f5e6);box(1.1,.04,.08,x,1.11,z,0xffffff);}else{box(.035,.41,1.05,x,1.11,z,blue,g,{transparent:true,opacity:.72});box(.07,.48,.04,x,1.11,z,0xf9f5e6);}}
function person(x,z,shirt,scale=.9){const g=persons,y=.26*scale;const body=cyl(.17*scale,.46*scale,x,y+.30*scale,z,shirt,g,.18*scale);sphere(.145*scale,x,y+.63*scale,z,0xd3a779,g);cyl(.12*scale,.045*scale,x,y+.77*scale,z,0x413d38,g);box(.075*scale,.3*scale,.08*scale,x-.09*scale,y-.01*scale,z,0x444a4b,g);box(.075*scale,.3*scale,.08*scale,x+.09*scale,y-.01*scale,z,0x444a4b,g);return body;}
function motorbike(x,z){const g=house;for(const wx of [x-.66,x+.68]){const t=new THREE.Mesh(new THREE.TorusGeometry(.34,.10,8,24),mat(0x202c31));t.rotation.x=Math.PI/2;t.position.set(wx,.39,z);t.castShadow=true;g.add(t);cyl(.18,.09,wx,.39,z,0xb0b5af,g);}
 line([[x-.66,.4,z],[x-.23,.95,z],[x+.42,.8,z],[x+.68,.4,z]],0x343d3b,g,.07);line([[x-.25,.95,z],[x+.20,.40,z],[x-.66,.4,z]],0xb24e3e,g,.055);
 box(.83,.17,.45,x,.94,z,0x687e78);box(.52,.14,.40,x-.18,1.11,z,0x28383d);box(.20,.40,.25,x+.39,.87,z,0x4e5655);line([[x+.51,.98,z],[x+.53,1.42,z],[x+.78,1.42,z]],0x3d4243,g,.035);box(.24,.32,.08,x+.67,1.2,z,0xcbd7d1);}
function bed(x,z,spread){box(1.75,.28,1.25,x,.33,z,0x806d5b);box(1.55,.12,1.12,x,.51,z,spread);box(.4,.11,.45,x-.50,.63,z-.26,0xf5f1e6);box(.4,.11,.45,x+.47,.63,z-.26,0xf5f1e6);box(1.8,.58,.12,x,.52,z-.72,0x806d5b);}
function buildModel(){house=new THREE.Group();hazards=new THREE.Group();upgrades=new THREE.Group();persons=new THREE.Group();scene.add(house,hazards,upgrades,persons);
 box(13,.25,9,0,-.22,0,0xaab7ad);surface(3.93,7.95,-4,-.01,C.garage);surface(3.95,3.9,0,2,C.living);surface(3.95,3.9,4,2,C.kitchen);surface(3.95,3.9,0,-2,0xbaa17e);surface(3.95,3.9,4,-2,C.bed);
 // Exterior in cutaway format: low front parapets, taller rear outline.
 wall(12,.15,0,-4,1.45);wall(.15,8,-6,0,1.35);wall(.15,8,6,0,1.35);wall(1.9,.15,-5.05,4,.38);wall(1.8,.15,-2.95,4,.38);wall(8,.15,2,4,.45);
 // The wide gap between garage and lounge is intentional: no separating door or wall.
 wall(.13,2.75,-2,-2.6,1.05);wall(2.78,.12,-.57,0,1.12);wall(.88,.12,1.56,0,1.12);wall(1.7,.12,2.85,0,1.12);wall(1.7,.12,5.15,0,1.12);wall(.12,3.85,2,-2,1.08);
 windowAt(.1,-4);windowAt(4.2,-4);windowAt(6,1.3,false);
 // Garage workstation and motorcycle.
 motorbike(-4.35,-.4);box(1.55,.13,.64,-4.6,.72,-3.25,0x7b694f);for(const xx of [-5.3,-3.9])box(.09,.63,.09,xx,.37,-3.25,0x68615a);box(1.5,.64,.10,-4.6,1.20,-3.82,0x726b5a);for(let i=0;i<5;i++){box(.13,.29,.04,-5.22+i*.3,1.27,-3.75,0xaab4b3).rotation.z=.25*i;}
 // Scattered tools, spillage and oil cans: removed in the proposal view.
 for(const [x,z,angle] of [[-5.3,2.48,.35],[-4.95,2.85,-.5],[-4.1,2.65,.95],[-3.7,3.1,-.35]]){const t=box(.47,.07,.07,x,.17,z,0x3b4445,hazards);t.rotation.y=angle;sphere(.10,x+.22,.17,z,0xbac0b7,hazards);}
 for(const [x,z,w,d] of [[-3.15,1.58,.9,.62],[-3.6,1.47,.47,.31],[-2.7,2.2,.41,.25]]){const puddle=new THREE.Mesh(new THREE.CircleGeometry(1,24),mat(0x41352c,{transparent:true,opacity:.78}));puddle.rotation.x=-Math.PI/2;puddle.scale.set(w,d,1);puddle.position.set(x,.102,z);hazards.add(puddle);}
 for(const [x,z] of [[-5.45,1.1],[-3.1,-2.4]]){cyl(.18,.5,x,.37,z,0x49555b,hazards);cyl(.20,.055,x,.64,z,0xc77b4a,hazards);}
 // Living room and both small sleeping zones.
 box(1.7,.38,.75,-.15,.31,1.73,0x668d85);box(1.7,.52,.16,-.15,.69,1.38,0x5a7f78);box(.18,.5,.7,-1,.64,1.74,0x5a7f78);box(.18,.5,.7,.7,.64,1.74,0x5a7f78);box(.75,.16,.55,1.03,.38,2.8,0xa77e60);box(1.1,.02,1.2,0,.105,2.42,0xe8e1ca);
 bed(-.10,-2.1,0x95b2a7);bed(4.16,-2.1,0xe5aa89);box(1.05,.96,.55,1.2,.55,-3.52,0xb38a66);box(1.05,.96,.55,5.22,.55,-3.5,0xb38a66);
 // Kitchen counter, table and uncovered water tanks.
 box(3.15,.81,.62,4.25,.48,.41,0xa8a785);box(3.18,.09,.68,4.25,.92,.41,0xf0ede3);box(.7,.03,.47,3.05,.98,.39,0xa1bfbd);box(1.2,.08,.77,3.02,.64,2.0,0xad8662);for(const [x,z] of [[2.55,1.62],[3.5,1.62],[2.55,2.39],[3.5,2.39]])box(.08,.58,.08,x,.33,z,0x987557);
 for(const x of [4.53,5.34]){const tank=cyl(.44,.89,x,.54,2.78,0x5c999e,house);cyl(.435,.025,x,1.0,2.78,0x77b9c0,hazards);cyl(.44,.045,x,1.06,2.78,0x344e55,upgrades);tank.userData.hotspotId=3;}
 // Rodent silhouettes and open waste.
 for(const [x,z] of [[5.45,-.70],[5.72,-.25]]){sphere(.13,x,.24,z,0x50514c,hazards);sphere(.07,x-.12,.26,z,0x50514c,hazards);line([[x+.1,.22,z],[x+.23,.19,z+.07],[x+.33,.2,z+.18]],0x50514c,hazards,.016);}
 cyl(.28,.48,5.23,.34,-.9,0x627476,hazards);cyl(.30,.035,5.23,.62,-.9,0x48595a,upgrades);
 // Small figurines show all six occupants; two adults, two elders, two children.
 person(-.9,3.06,0xb77561,1);person(1.23,1.35,0x426d84,.98);person(.68,-2.85,0x837868,.92);person(4.57,-2.94,0x829c8f,.91);person(-1.28,1.00,0xf1bd59,.64);person(4.18,1.57,0x9a7ac2,.64);
 // Changes shown only in "Ver propuesta". Green partitions and organized workshop.
 box(.13,1.65,3.65,-2,1.04,1.98,0x8db2a1,upgrades,{transparent:true,opacity:.70});box(.13,1.68,.82,-2,1.04,-.38,0x8db2a1,upgrades,{transparent:true,opacity:.70});box(.16,1.65,.16,-2,1.04,3.85,0x638878,upgrades);box(.17,1.65,.08,-2,1.04,1.19,0x638878,upgrades);box(.17,1.65,.08,-2,1.04,2.80,0x638878,upgrades);
 box(1.38,1.13,.43,-4.85,.75,-2.88,0x4b8a79,upgrades);box(.07,1.01,.04,-4.85,.78,-2.63,0xbad5c3,upgrades);box(1.6,.06,.38,-4.75,1.60,-2.87,0x6f927f,upgrades);
 box(.5,.4,.50,-5.03,.31,2.25,0x608f82,upgrades);box(.65,.05,.6,-5.03,.54,2.25,0x4a756c,upgrades);
 cyl(.38,.73,4.25,.52,2.76,0x7da3a5,upgrades);cyl(.39,.03,4.25,.91,2.76,0x345962,upgrades);
 box(.10,.82,.10,3.05,1.30,.45,0x7c9e9d,upgrades);box(.4,.06,.14,3.17,1.72,.45,0x7c9e9d,upgrades);box(.08,.12,.08,3.33,1.68,.45,0x7c9e9d,upgrades);
 upgrades.visible=false;
 // Minimal raised base border and ground shadow.
 const border=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(13,.26,9)),new THREE.LineBasicMaterial({color:0x859b91}));border.position.y=-.22;scene.add(border);
}
function init(){try{scene=new THREE.Scene();scene.background=new THREE.Color(0xd9e3df);scene.fog=new THREE.Fog(0xd9e3df,28,65);camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.copy(homePos);camera.lookAt(0,0,0);renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;root.appendChild(renderer.domElement);orbit=new THREE.OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.dampingFactor=.08;orbit.minDistance=10;orbit.maxDistance=41;orbit.maxPolarAngle=Math.PI*.49;orbit.target.set(0,.2,0);orbit.update();
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.72;
 scene.add(new THREE.HemisphereLight(0xf6f8e9,0x819396,.72));const sun=new THREE.DirectionalLight(0xffffff,.95);sun.position.set(-5,15,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=15;sun.shadow.camera.bottom=-15;sun.shadow.bias=-.001;scene.add(sun);const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),mat(0xd9e3df));ground.rotation.x=-Math.PI/2;ground.position.y=-.38;ground.receiveShadow=true;scene.add(ground);
 buildModel();resizeObserver=new ResizeObserver(resize);resizeObserver.observe(root);resize();animate();}catch(e){console.error(e);$('loadError').hidden=false;}}
function resize(){if(!renderer)return;const w=root.clientWidth,h=root.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
function animate(){requestAnimationFrame(animate);orbit.update();if(renderer){renderer.render(scene,camera);positionMarkers();}}
function positionMarkers(){const w=root.clientWidth,h=root.clientHeight;for(let i=0;i<R.length;i++){const p=new THREE.Vector3(...R[i].pos).project(camera);const el=markers[i];const visible=p.z<1&&p.z>-1&&p.x>-1.03&&p.x<1.03&&p.y>-1.03&&p.y<1.03;el.style.display=visible?'grid':'none';if(visible){el.style.left=((p.x+1)*w/2)+'px';el.style.top=((-p.y+1)*h/2)+'px';}}}
function renderList(){const list=$('list');list.innerHTML='';R.forEach((r,i)=>{const b=document.createElement('button');b.className='risk-item'+(found.has(i)?' found':'')+(i===active?' active':'');b.innerHTML=`<span class="risk-index">${found.has(i)?'✓':String(i+1).padStart(2,'0')}</span><span><span class="risk-name">${r.n}</span><span class="risk-sub">${r.zone} · Prioridad ${r.level.toLowerCase()}</span></span>`;b.addEventListener('click',()=>select(i));list.appendChild(b)});$('progressText').textContent=`${found.size} / ${R.length}`;$('progressFill').style.width=(found.size/R.length*100)+'%';markers.forEach((m,i)=>{m.classList.toggle('found',found.has(i));m.classList.toggle('selected',i===active);m.classList.toggle('solved',solved)});}
function moveTo(i){const v=new THREE.Vector3(...R[i].view);const target=new THREE.Vector3(R[i].pos[0]*.50,.3,R[i].pos[2]*.50);camera.position.lerp(v,.65);orbit.target.lerp(target,.7);orbit.update();}
function select(i){active=i;const r=R[i];$('detailLabel').textContent=`PISTA ${String(i+1).padStart(2,'0')} / ${String(R.length).padStart(2,'0')} · PRIORIDAD ${r.level}`;$('detailTitle').textContent=r.n;$('detailWhere').textContent='UBICACIÓN: '+r.zone;$('detailRisk').textContent=r.risk;$('detailFix').textContent=r.fix;$('sourceLink').href=r.src;$('markBtn').textContent=found.has(i)?'✓ Identificada':'Marcar como identificada';detail.hidden=false;renderList();moveTo(i);}
function setMode(yes){solved=yes;hazards.visible=!yes;upgrades.visible=yes;$('riskMode').classList.toggle('active',!yes);$('solutionMode').classList.toggle('active',yes);$('riskMode').setAttribute('aria-pressed',String(!yes));$('solutionMode').setAttribute('aria-pressed',String(yes));renderList();}
function boot(){if(!window.THREE||!THREE.OrbitControls){$('loadError').hidden=false;return;}R.forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.className='hotspot';b.textContent=String(i+1);b.title=R[i].n;b.setAttribute('aria-label',`Pista ${i+1}: ${R[i].n}`);b.addEventListener('click',()=>select(i));labels.appendChild(b);markers.push(b)});renderList();init();$('beginBtn').addEventListener('click',()=>{$('welcome').hidden=true;});$('helpBtn').addEventListener('click',()=>{$('welcome').hidden=false});$('analysisBtn').addEventListener('click',()=>{$('analysis').hidden=false});$('analysisClose').addEventListener('click',()=>{$('analysis').hidden=true});$('analysis').addEventListener('click',e=>{if(e.target===$('analysis'))$('analysis').hidden=true});$('detailClose').addEventListener('click',()=>{detail.hidden=true;active=-1;renderList()});$('markBtn').addEventListener('click',()=>{if(active<0)return;found.add(active);renderList();$('markBtn').textContent='✓ Identificada'});$('nextBtn').addEventListener('click',()=>select((active+1)%R.length));$('tourBtn').addEventListener('click',()=>{touring=true;setMode(false);select(0);$('welcome').hidden=true});$('resetProgress').addEventListener('click',()=>{found.clear();active=-1;detail.hidden=true;renderList()});$('riskMode').addEventListener('click',()=>setMode(false));$('solutionMode').addEventListener('click',()=>setMode(true));$('resetView').addEventListener('click',()=>{camera.position.copy(homePos);orbit.target.set(0,.2,0);orbit.update()});$('zoomIn').addEventListener('click',()=>{camera.position.sub(orbit.target).multiplyScalar(.82).add(orbit.target);orbit.update()});$('zoomOut').addEventListener('click',()=>{camera.position.sub(orbit.target).multiplyScalar(1.22).add(orbit.target);orbit.update()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){detail.hidden=true;$('analysis').hidden=true;if(!$('welcome').hidden)$('welcome').hidden=true;}if(e.key==='ArrowRight'&&!detail.hidden)select((active+1)%R.length)});}
const loginForm=$('loginForm');
loginForm.addEventListener('submit',event=>{
 event.preventDefault();
 if($('accessWord').value==='sara'){
  $('login').hidden=true;
  $('appShell').hidden=false;
  $('accessWord').value='';
  $('loginError').hidden=true;
  $('accessWord').removeAttribute('aria-invalid');
  boot();
  $('helpBtn').focus();
 }else{
  $('loginError').hidden=false;
  $('accessWord').setAttribute('aria-invalid','true');
  $('accessWord').focus();
  $('accessWord').select();
 }
});
$('accessWord').addEventListener('input',()=>{
 $('loginError').hidden=true;
 $('accessWord').removeAttribute('aria-invalid');
});
})();
