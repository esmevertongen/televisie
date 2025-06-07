import * as THREE from "https://cdn.skypack.dev/three@0.132.2";
import { TrackballControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/TrackballControls.js";
import { OBJLoader } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/OBJLoader.js";
import { MeshSurfaceSampler } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/math/MeshSurfaceSampler.js";

console.clear();
window.THREE = THREE;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
// Gebruik:
document.getElementById('three-container').appendChild(renderer.domElement);

camera.position.z = 250;
camera.position.y = 100;

const controls = new TrackballControls(camera, renderer.domElement);
controls.noPan = true;
controls.maxDistance = 600;
controls.minDistance = 150;
controls.rotateSpeed = 2;

const group = new THREE.Group();
scene.add(group);
group.rotation.y = 2;

let subgroups = [];

let airplane = new THREE.Group();
new OBJLoader().load("https://assets.codepen.io/127738/Airplane_model2.obj", (obj) => {
  airplane = obj;
  const mat = new THREE.MeshPhongMaterial({
    emissive: 0xffffff,
    emissiveIntensity: 0.3
  });
  airplane.children.forEach(child => {
    child.geometry.scale(0.013, 0.013, 0.013);
    child.geometry.translate(0, 122, 0);
    child.material = mat;
  });
  let angles = [0.3, 1.3, 2.14, 2.6];
  let speeds = [0.008, 0.01, 0.014, 0.02];
  let rotations = [0, 2.6, 1.5, 4];
  for (let i = 0; i <4; i++) {
    const g = new THREE.Group();
    g.speed = speeds[i];
    subgroups.push(g);
    group.add(g);
    const g2 = new THREE.Group();
    let _airplane = airplane.clone();
    g.add(g2);
    g2.add(_airplane);
    g2.rotation.x = rotations[i];
    g.rotation.y = angles[i];
    // Reverse airplane rotation
    g.reverse = i < 2;
    if (i < 2) {
      _airplane.children[0].geometry = airplane.children[0].geometry.clone().rotateY(Math.PI);
    }
  }
});

let sampler = [];
let earth = null;
let paths = [];
new OBJLoader().load(
  "https://assets.codepen.io/127738/NOVELO_EARTH.obj",
  (obj) => {    
    earth = obj.children[0];
    earth.geometry.scale(0.35, 0.35, 0.35);
    earth.geometry.translate(0, -133, 0);
    
    /* Split earth into two geometries */
    let positions = Array.from(earth.geometry.attributes.position.array).splice(0, 3960 * 3);
    const landGeom = new THREE.BufferGeometry();
    landGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const land = new THREE.Mesh(landGeom);
    
    positions = Array.from(earth.geometry.attributes.position.array).splice(3960 * 3, 540 * 3);
    const waterGeom = new THREE.BufferGeometry();
    waterGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    waterGeom.computeVertexNormals();
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x0da9c3 , transparent: true, opacity: 1});
    const water = new THREE.Mesh(waterGeom, waterMat);
    group.add(water);
    
    const light = new THREE.HemisphereLight( 0xccffff, 0x000033, 1 );
    scene.add(light);
    console.log(scene);
    
    sampler = new MeshSurfaceSampler(land).build();
    
    for (let i = 0;i < 24; i++) {
      const path = new Path();
      paths.push(path);
      group.add(path.line);
    }
    
    renderer.setAnimationLoop(render);
  },
  (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
  (err) => console.error(err)
);

const tempPosition = new THREE.Vector3();
const lineMaterial = new THREE.LineBasicMaterial({color: 0xbbde2d, transparent: true, opacity: 0.6});
class Path {
  constructor () {
    this.geometry = new THREE.BufferGeometry();
    this.line = new THREE.Line(this.geometry, lineMaterial);
    this.vertices = [];
    
    sampler.sample(tempPosition);
    this.previousPoint = tempPosition.clone();
  }
  update () {
    let pointFound = false;
    while (!pointFound) {
      sampler.sample(tempPosition);
      if (tempPosition.distanceTo(this.previousPoint) < 12) {
        this.vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
        this.previousPoint = tempPosition.clone();
        pointFound = true;
      }
    }
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.vertices, 3));
  }
}

const look = new THREE.Vector3(0,0,0);
function render(a) {
  
  // Rotate the whole scene
  group.rotation.y += 0.001;
  
  // Rotate each plane
  subgroups.forEach(g => {
    g.children[0].rotation.x += (g.speed * (g.reverse ? -1 : 1));
  });
  
  // Update each path
  paths.forEach(path => {
    if (path.vertices.length < 35000) {
      path.update();
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}











  // Laad header.html in de header-container
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-container').innerHTML = data;
    });

// Scroll-hoogte per 'frame'
const FRAME_HEIGHT = 820;

// Knoppen
const scrollDownBtn = document.getElementById('scroll-down');
const scrollUpBtn = document.getElementById('scroll-up');

// Scroll naar beneden
scrollDownBtn.addEventListener('click', () => {
window.scrollBy({ top: FRAME_HEIGHT, behavior: 'smooth' });
});

// Scroll naar boven
scrollUpBtn.addEventListener('click', () => {
window.scrollBy({ top: -FRAME_HEIGHT, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;

  const flexbox9 = document.querySelector('.flexbox9');
  const rect = flexbox9.getBoundingClientRect();
  const flexbox9TopInView = rect.top < windowHeight && rect.bottom >= 0;

  if (scrollTop < FRAME_HEIGHT) {
    // Bovenaan: alleen pijltje omlaag tonen
    scrollDownBtn.style.display = 'block';
    scrollUpBtn.style.display = 'none';
  } else if (flexbox9TopInView) {
    // Onderaan (bij flexbox9): alleen pijltje omhoog tonen
    scrollDownBtn.style.display = 'none';
    scrollUpBtn.style.display = 'block';
  } else {
    // Midden: beide tonen
    scrollDownBtn.style.display = 'block';
    scrollUpBtn.style.display = 'block';
  }
});








function getFlightData() {
  const page = window.location.pathname.split('/').pop();

  if (page === 'index.html') {
    // Vlucht naar Java (Indonesië)
    return {
      tijdTotBestemming: 13 * 60 * 60,
      tijdzoneVerschil: 6,
      hoogte: 11582,
      snelheidGemiddeld: 880,
      individueleUitstoot: 851,
      totaleUitstoot: 851 * 150 // 127650
    };
  } else if (page === 'vlucht2.html') {
    // Vlucht naar Luzhou (China)
    return {
      tijdTotBestemming: 10 * 60 * 60,
      tijdzoneVerschil: 6,
      hoogte: 11000,
      snelheidGemiddeld: 870,
      individueleUitstoot: 782,
      totaleUitstoot: 782 * 150 // 117300
    };
  } else if (page === 'vlucht3.html') {
    // Vlucht naar Blatten (Zwitserland)
    return {
      tijdTotBestemming: 1.5 * 60 * 60,
      tijdzoneVerschil: 0,
      hoogte: 9000,
      snelheidGemiddeld: 750,
      individueleUitstoot: 118,
      totaleUitstoot: 118 * 150 // 17700
    };
  } else {
    console.warn('Geen vluchtgegevens voor deze pagina.');
    return null;
  }
}

const vlucht = getFlightData();

if (vlucht) {
  const data = {
    tijdTotBestemming: vlucht.tijdTotBestemming,
    aankomsttijd: new Date(Date.now() + vlucht.tijdTotBestemming * 1000),
    tijdOorsprong: new Date(),
    tijdBestemming: new Date(Date.now() + vlucht.tijdzoneVerschil * 60 * 60 * 1000),
    hoogte: vlucht.hoogte,
    snelheidGemiddeld: vlucht.snelheidGemiddeld,
    totaleUitstoot: vlucht.totaleUitstoot,
    individueleUitstoot: vlucht.individueleUitstoot
  };

  function formatTijd(seconden) {
    const h = String(Math.floor(seconden / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconden % 3600) / 60)).padStart(2, '0');
    const s = String(seconden % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function updateData() {
    const vakken = document.querySelectorAll('.rechthoek');

    data.tijdTotBestemming = Math.max(0, data.tijdTotBestemming - 1);
    data.aankomsttijd = new Date(Date.now() + data.tijdTotBestemming * 1000);
    data.tijdOorsprong = new Date();
    data.tijdBestemming = new Date(data.tijdOorsprong.getTime() + vlucht.tijdzoneVerschil * 60 * 60 * 1000);

    const snelheid = data.snelheidGemiddeld + Math.round(Math.random() * 10 - 5);
    const hoogte = data.hoogte + Math.round(Math.random() * 20 - 10);

    const waarden = [
      formatTijd(data.tijdTotBestemming),
      data.aankomsttijd.toTimeString().slice(0, 5),
      data.tijdOorsprong.toTimeString().slice(0, 5),
      data.tijdBestemming.toTimeString().slice(0, 5),
      `${hoogte.toLocaleString()} m`,
      `${snelheid} km/u`,
      `${data.totaleUitstoot.toLocaleString()} kg CO₂`,
      `${data.individueleUitstoot.toFixed(0)} kg CO₂`
    ];

    vakken.forEach((vak, i) => {
      const span = vak.querySelector('.waarde');
      if (span) {
        span.textContent = waarden[i];
      }
    });
  }

  document.querySelectorAll('.rechthoek').forEach((vak) => {
    if (!vak.querySelector('.waarde')) {
      const span = document.createElement('span');
      span.classList.add('waarde');
      vak.appendChild(span);
    }
  });

  updateData();
  setInterval(updateData, 1000);
}










  // caroussel shit deel 2


  const images = document.querySelectorAll('.carousel-image');
  let current = 0;

  setInterval(() => {
    images[current].classList.remove('active');
    current = (current + 1) % images.length;
    images[current].classList.add('active');
  }, 4000);

