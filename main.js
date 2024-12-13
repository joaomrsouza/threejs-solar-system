import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Cena
const scene = new THREE.Scene();

// Câmera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 200;

// Renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controle orbital
const controls = new OrbitControls(camera, renderer.domElement);

// helper
scene.add(new THREE.AxesHelper(1000));

// Add Elements
const sunScale = 50;
const animationSpeed = 0.1;

addSun();

const planets = [
  addPlanet({
    planetRadius: 1,
    orbitRadius: 15,
    speed: 1,
    origin: { x: 0, y: 0 },
    color: 0x7d511e,
  }),
  addPlanet({
    planetRadius: 2,
    orbitRadius: 30,
    speed: 1 / 2.89,
    origin: { x: 0, y: 0 },
    color: 0x923200,
  }),
  addPlanet({
    planetRadius: 3,
    orbitRadius: 45,
    speed: 1 / 4.14,
    origin: { x: 0, y: 0 },
    color: 0x55a04c,
  }),
  addPlanet({
    planetRadius: 2,
    orbitRadius: 60,
    speed: 1 / 7.8,
    origin: { x: 0, y: 0 },
    color: 0xaf210d,
  }),
  addPlanet({
    planetRadius: 9,
    orbitRadius: 90,
    speed: 1 / 49.23,
    origin: { x: 0, y: 0 },
    color: 0xe89e58,
  }),
  addPlanet({
    planetRadius: 7,
    orbitRadius: 120,
    speed: 1 / 122.26,
    origin: { x: 0, y: 0 },
    color: 0xe3bb71,
  }),
  addPlanet({
    planetRadius: 5,
    orbitRadius: 150,
    speed: 1 / 348.71,
    origin: { x: 0, y: 0 },
    color: 0x27a6ad,
  }),
  addPlanet({
    planetRadius: 5,
    orbitRadius: 180,
    speed: 1 / 647.04,
    origin: { x: 0, y: 0 },
    color: 0x167ed2,
  }),
];

// Função de animação
animate();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

function animate() {
  requestAnimationFrame(animate);

  planets.forEach((planet) => {
    planet.planet.position.x =
      planet.origin.x + planet.orbitRadius * Math.cos(planet.angle);
    planet.planet.position.y =
      planet.origin.y + planet.orbitRadius * Math.sin(planet.angle);
    planet.angle += planet.speed * animationSpeed;
  });

  controls.update();
  renderer.render(scene, camera);
}

function addSun() {
  const pointLight = new THREE.PointLight(0xffffff, 1000 * sunScale);

  const sunGeometry = new THREE.SphereGeometry(1 * sunScale);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.8,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);

  const coreGeometry = new THREE.SphereGeometry(0.8 * sunScale);
  const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const sunCore = new THREE.Mesh(coreGeometry, coreMaterial);

  pointLight.add(sun);
  pointLight.add(sunCore);
  scene.add(pointLight);

  return pointLight;
}

function addPlanet({ planetRadius, orbitRadius, speed, origin, color }) {
  const geometry = new THREE.SphereGeometry(planetRadius);
  const material = new THREE.MeshPhongMaterial({ color });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.x = (sunScale + orbitRadius) * Math.cos(origin.x);
  planet.position.y = (sunScale + orbitRadius) * Math.sin(origin.y);

  scene.add(planet);

  return {
    orbitRadius: sunScale + orbitRadius,
    planet,
    angle: 0,
    speed,
    origin,
  };
}
