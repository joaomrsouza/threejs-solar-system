import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// CONSTANTS
const TEXTURE_SIZE = ["2k", "8k"][0];
const INITIAL_ZOOM = 200;
const SUN_SCALE = 50;
const ANIMATION_SPEED = 0.001;

const AMBIENT_LIGHT_INTENSITY = 0.1; // DEFAULT: 0.1
const SPACE_LIGHT_INTENSITY = 100; // DEFAULT: 100
const SUN_LIGHT_INTENSITY = 5; // DEFAULT: 5

const DEBUG = {
  DISABLE_TRANSLATION: false, // DEFAULT: false
  FOCUS_ON_INDEX: false, // DEFAULT: false
  AXIS_SIZE: 10000, // DEFAULT: 0
};

// Câmera e cena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  50000
);
camera.position.z = INITIAL_ZOOM;

// Renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controle orbital
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Habilita a suavização do movimento
controls.dampingFactor = 0.5;

// Utilitários
const textureLoader = new THREE.TextureLoader(); // Carrega texturas

scene.add(new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY)); // Luz ambiente

scene.add(new THREE.AxesHelper(DEBUG.AXIS_SIZE)); // Eixos de referência // TODO: Remover (Temporário)

// Elementos da cena
addSpace();
const sun = addSun();

const planets = [
  addPlanet({
    planetRadius: 1,
    orbitRadius: 15,
    speed: 1,
    origin: { x: 0, y: 0 },
    texture: "mercury",
  }),
  addPlanet({
    planetRadius: 2,
    orbitRadius: 30,
    speed: 1 / 2.89,
    origin: { x: 0, y: 0 },
    texture: "venus",
  }),
  addPlanet({
    planetRadius: 3,
    orbitRadius: 45,
    speed: 1 / 4.14,
    origin: { x: 0, y: 0 },
    texture: "earth",
  }),
  addPlanet({
    planetRadius: 2,
    orbitRadius: 60,
    speed: 1 / 7.8,
    origin: { x: 0, y: 0 },
    texture: "mars",
  }),
  addPlanet({
    planetRadius: 9,
    orbitRadius: 90,
    speed: 1 / 49.23,
    origin: { x: 0, y: 0 },
    texture: "jupiter",
  }),
  addPlanet({
    planetRadius: 7,
    orbitRadius: 120,
    speed: 1 / 122.26,
    origin: { x: 0, y: 0 },
    texture: "saturn",
  }),
  addPlanet({
    planetRadius: 5,
    orbitRadius: 150,
    speed: 1 / 348.71,
    origin: { x: 0, y: 0 },
    texture: "uranus",
  }),
  addPlanet({
    planetRadius: 5,
    orbitRadius: 180,
    speed: 1 / 647.04,
    origin: { x: 0, y: 0 },
    texture: "neptune",
  }),
];

// Inicia a animação
animate();

// Função de animação
function animate() {
  requestAnimationFrame(animate); // Requisita o próximo frame

  // Atualiza a posição dos planetas
  planets.forEach((planetInfo, index) => {
    // Função de translação atrelada ao ângulo atual do planeta
    if (!DEBUG.DISABLE_TRANSLATION) {
      planetInfo.planet.position.x =
        planetInfo.origin.x +
        planetInfo.orbitRadius * Math.cos(planetInfo.angle);
      planetInfo.planet.position.y =
        planetInfo.origin.y +
        planetInfo.orbitRadius * Math.sin(planetInfo.angle);
    }

    if (index === DEBUG.FOCUS_ON_INDEX) {
      // Define o vetor para aproximar a câmera do planeta
      const focusOffset = new THREE.Vector3().subVectors(
        camera.position,
        planetInfo.planet.position
      );

      camera.lookAt(planetInfo.planet.position); // Foca a câmera no planeta
      camera.position.copy(planetInfo.planet.position.clone().add(focusOffset)); // Aproxima a câmera do planeta

      controls.target.copy(planetInfo.planet.position); // Define o alvo do controle orbital
    }

    planetInfo.angle += planetInfo.speed * ANIMATION_SPEED; // Incrementa o ângulo de translação do planeta
  });

  controls.update(); // Atualiza o controle orbital
  renderer.render(scene, camera); // Renderiza a cena
}

// Adiciona o espaço à cena
function addSpace() {
  const texture = textureLoader.load(getTexturePath("space")); // Carrega a textura do espaço

  const geometry = new THREE.SphereGeometry(10000);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide, // Renderiza a textura em ambos os lados
    lightMap: texture, // Textura de pontos de luz
    lightMapIntensity: SPACE_LIGHT_INTENSITY,
  });

  // Adiciona o espaço à cena
  const space = new THREE.Mesh(geometry, material);
  scene.add(space);
}

// Adiciona o sol à cena
function addSun() {
  const texture = textureLoader.load(getTexturePath("sun")); // Carrega a textura do sol
  const pointLight = new THREE.PointLight(0xffffff, 1000 * SUN_SCALE); // Ponto de Luz para o sol

  const sunGeometry = new THREE.SphereGeometry(1 * SUN_SCALE);
  const sunMaterial = new THREE.MeshBasicMaterial({
    // color: 0xffff00,
    map: texture,
    lightMap: texture, // Textura de pontos de luz
    lightMapIntensity: SUN_LIGHT_INTENSITY,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);

  // Adiciona o sol ao ponto de luz e à cena
  pointLight.add(sun);
  scene.add(pointLight);

  return pointLight; // Retorna o ponto de luz do sol para manipulações futuras
}

// Adiciona um planeta à cena
function addPlanet({
  planetRadius,
  orbitRadius,
  speed,
  origin,
  color,
  texture,
}) {
  const map = texture ? textureLoader.load(getTexturePath(texture)) : false; // Carrega a textura do planeta

  const geometry = new THREE.SphereGeometry(planetRadius);
  const material = new THREE.MeshPhongMaterial({
    ...(map
      ? { map, bumpMap: map, bumpScale: 5 } // Adiciona a textura e o relevo
      : { color: color ?? 0x00ff00 }), // Adiciona a cor do planeta caso não haja textura
  });

  const planet = new THREE.Mesh(geometry, material);

  // Define a posição inicial do planeta em sua órbita
  planet.position.x = (SUN_SCALE + orbitRadius) * Math.cos(origin.x);
  planet.position.y = (SUN_SCALE + orbitRadius) * Math.sin(origin.y);

  scene.add(planet);

  // Retorna as informações do planeta para manipulações futuras
  return {
    orbitRadius: SUN_SCALE + orbitRadius,
    planet,
    angle: 0,
    speed,
    origin,
  };
}

// Retorna o caminho da textura de acordo com o tamanho selecionado
function getTexturePath(textureName) {
  // Urano e Netuno possuem apenas texturas de 2k
  const size = ["uranus", "neptune"].includes(textureName)
    ? "2k"
    : TEXTURE_SIZE;

  return `assets/${size}/${textureName}.jpg`;
}

// Atualiza a câmera e o renderizador ao redimensionar a janela
window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);
