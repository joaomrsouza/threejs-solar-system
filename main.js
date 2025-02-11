import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// CONSTANTS
const TEXTURE_SIZE = ["2k", "8k"][1];
const SUN_SIZE_MULTIPLIER = 0.1;
const PLANET_ORBIT_MULTIPLIER = 0.001;

const SUN_SCALE = 399.88 * SUN_SIZE_MULTIPLIER;
const INITIAL_ZOOM = SUN_SCALE * 5;
const AMBIENT_LIGHT_INTENSITY = 0.1; // DEFAULT: 0.1
const SPACE_LIGHT_INTENSITY = 100; // DEFAULT: 100
const SUN_LIGHT_INTENSITY = (1 / PLANET_ORBIT_MULTIPLIER) * SUN_SCALE;
const SUN_TEXTURE_LIGHT_INTENSITY = 5; // DEFAULT: 5
const MAX_ANIMATION_SPEED = 200;
const MIN_ANIMATION_SPEED = -200;
const ANIMATION_SPEED_STEP = 5;

// Animation parameters
const ANIMATION = {
  SPEED: 5,
};

const DEBUG = {
  // Animation parameters
  DISABLE_TRANSLATION: false,
  DISABLE_ROTATION: false,
  FOCUS_ON_INDEX: 0,

  // CONSTANTS
  AXIS_SIZE: 0, // DEFAULT: 0
};

// Câmera e cena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  12941300
);
camera.position.set(0, 0, INITIAL_ZOOM);
camera.rotation.set(0, 0, 0);

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

scene.add(new THREE.AxesHelper(DEBUG.AXIS_SIZE)); // Eixos de referência

// Elementos da cena
addSpace();
const sun = addSun();

// As medidas de orbita e raio são todas baseadas no diâmetro da lua (3476km = 1)
const planets = [
  addPlanet({
    planetRadius: 1.4,
    orbitRadius: PLANET_ORBIT_MULTIPLIER * 16657.08,
    speed: 1,
    origin: { x: 0, y: 0 },
    texture: "mercury",
  }),
  addPlanet({
    planetRadius: 3.48,
    orbitRadius: PLANET_ORBIT_MULTIPLIER * 31130.46,
    speed: 1 / 2.89,
    origin: { x: 0, y: 0 },
    texture: "venus",
  }),
  addPlanet({
    planetRadius: 3.67,
    orbitRadius: PLANET_ORBIT_MULTIPLIER * 43037.97,
    speed: 1 / 4.14,
    origin: { x: 0, y: 0 },
    texture: "earth",
  }),
  addPlanet({
    planetRadius: 1.95,
    orbitRadius: PLANET_ORBIT_MULTIPLIER * 65575.37,
    speed: 1 / 7.8,
    origin: { x: 0, y: 0 },
    texture: "mars",
  }),
  addPlanet({
    planetRadius: 41.13,
    orbitRadius: PLANET_ORBIT_MULTIPLIER * 223918.53,
    speed: 1 / 49.23,
    origin: { x: 0, y: 0 },
    texture: "jupiter",
  }),
  addPlanet({
    planetRadius: 34.68,
    orbitRadius: PLANET_ORBIT_MULTIPLIER * 410433.38,
    speed: 1 / 122.26,
    origin: { x: 0, y: 0 },
    texture: "saturn",
  }),
  addPlanet({
    planetRadius: 14.71,
    orbitRadius: PLANET_ORBIT_MULTIPLIER * 825941.37,
    speed: 1 / 348.71,
    origin: { x: 0, y: 0 },
    texture: "uranus",
  }),
  addPlanet({
    planetRadius: 14.25,
    orbitRadius: PLANET_ORBIT_MULTIPLIER * 1294130.16,
    speed: 1 / 647.04,
    origin: { x: 0, y: 0 },
    texture: "neptune",
  }),
];

// Inicia a animação
animate();

// Adiciona a lua a cena
const moon = addMoon({
  moonRadius: 1,
  orbitRadius: 11.05,
  speed: 1 / 0.5,
  origin: planets[2].planet.position, // Origem inicial na Terra
  texture: "moon",
});

// Relaciona a lua com a terra
planets[2].moon = moon;

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
      planetInfo.planet.position.z =
        planetInfo.origin.y +
        planetInfo.orbitRadius * Math.sin(planetInfo.angle);

      planetInfo.angle -= planetInfo.speed * (ANIMATION.SPEED / 1000); // Incrementa o ângulo de translação do planeta

      // Verifica se é a lua para adicionar ela a terra
      if (planetInfo.texture === "earth" && planetInfo.moon) {
        planetInfo.moon.moon.position.x =
          planetInfo.planet.position.x +
          planetInfo.moon.orbitRadius * Math.cos(planetInfo.moon.angle);
        planetInfo.moon.moon.position.z =
          planetInfo.planet.position.z +
          planetInfo.moon.orbitRadius * Math.sin(planetInfo.moon.angle);

        planetInfo.moon.angle -=
          planetInfo.moon.speed * (ANIMATION.SPEED / 1000);
      }
    }

    // Rotaciona o planeta
    if (!DEBUG.DISABLE_ROTATION) {
      // Vênus gira ao contrário
      if (planetInfo.texture === "venus")
        planetInfo.planet.rotation.y -= ANIMATION.SPEED / 1000;
      else planetInfo.planet.rotation.y += ANIMATION.SPEED / 1000;

      // Rotaciona a lua
      if (planetInfo.texture === "earth" && planetInfo.moon)
        planetInfo.moon.moon.rotation.y += ANIMATION.SPEED / 1000;
    }

    if (index + 1 === DEBUG.FOCUS_ON_INDEX) {
      // Define o vetor para aproximar a câmera do planeta
      const focusOffset = new THREE.Vector3().subVectors(
        camera.position,
        planetInfo.planet.position
      );

      camera.lookAt(planetInfo.planet.position); // Foca a câmera no planeta
      camera.position.copy(planetInfo.planet.position.clone().add(focusOffset)); // Aproxima a câmera do planeta

      controls.target.copy(planetInfo.planet.position); // Define o alvo do controle orbital
    }
  });

  // Rotaciona o sol
  if (!DEBUG.DISABLE_ROTATION) {
    sun.rotation.y += (ANIMATION.SPEED / 1000) * 0.1;
  }

  controls.update(); // Atualiza o controle orbital
  renderer.render(scene, camera); // Renderiza a cena
}

// Adiciona o espaço à cena
function addSpace() {
  const texture = textureLoader.load(getTexturePath("space")); // Carrega a textura do espaço

  const geometry = new THREE.SphereGeometry(12941300);
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
  const pointLight = new THREE.PointLight(0xffffff, SUN_LIGHT_INTENSITY); // Ponto de Luz para o sol

  const sunGeometry = new THREE.SphereGeometry(1 * SUN_SCALE);
  const sunMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    lightMap: texture, // Textura de pontos de luz
    lightMapIntensity: SUN_TEXTURE_LIGHT_INTENSITY,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);

  // Adiciona o sol ao ponto de luz e à cena
  pointLight.add(sun);
  scene.add(pointLight);

  return pointLight; // Retorna o ponto de luz com sol para manipulações futuras
}

function addMoon({ moonRadius, orbitRadius, speed, origin, texture }) {
  const map = texture ? textureLoader.load(getTexturePath(texture)) : false; // Carrega a textura da Lua

  const geometry = new THREE.SphereGeometry(moonRadius);
  const material = new THREE.MeshPhongMaterial({
    ...(map ? { map, bumpMap: map, bumpScale: 2 } : { color: 0xaaaaaa }), // Adiciona a textura e o relevo
  });

  const moon = new THREE.Mesh(geometry, material);

  // Define a posição inicial da lua em sua órbita
  moon.position.x = origin.x + orbitRadius * Math.cos(0);
  moon.position.z = origin.y + orbitRadius * Math.sin(0);

  scene.add(moon);

  return {
    moon,
    orbitRadius,
    angle: 0,
    speed,
    origin,
  };
}

// Adiciona um planeta à cena
function addPlanet({ planetRadius, orbitRadius, speed, origin, texture }) {
  const map = texture ? textureLoader.load(getTexturePath(texture)) : false; // Carrega a textura do planeta

  const geometry = new THREE.SphereGeometry(planetRadius);
  const material = new THREE.MeshPhongMaterial({
    ...(map
      ? { map, bumpMap: map, bumpScale: 5 } // Adiciona a textura e o relevo
      : { color: 0x00ff00 }), // Adiciona a cor do planeta caso não haja textura
  });

  const planet = new THREE.Mesh(geometry, material);

  // Define a posição inicial do planeta em sua órbita
  planet.position.x = (SUN_SCALE + orbitRadius) * Math.cos(origin.x);
  planet.position.y = (SUN_SCALE + orbitRadius) * Math.sin(origin.y);

  // Caso o planeta seja saturno, os anéis são adicionados
  if (texture === "saturn") {
    addSaturnRings(planet);
  }

  scene.add(planet);

  // Retorna as informações do planeta para manipulações futuras
  return {
    orbitRadius: SUN_SCALE + orbitRadius,
    planet,
    angle: 0,
    speed,
    origin,
    texture,
    moon: null, // Para caso o planeta tenha uma lua
  };
}

// Adicionando os anéis de Saturno
function addSaturnRings(saturn) {
  // Geometria e textura dos anéis
  const ringTexture = textureLoader.load(getTexturePath("saturn_ring"));

  const ringGeometry = new THREE.RingGeometry(36.68, 59.68, 64); // Tamanho calculado com base no tamanho atual do planeta
  const ringMaterial = new THREE.MeshBasicMaterial({
    map: ringTexture,
    side: THREE.DoubleSide,
    transparent: true,
  });

  const rings = new THREE.Mesh(ringGeometry, ringMaterial);

  rings.rotation.x = Math.PI / 2;

  saturn.add(rings);
}

// Retorna o caminho da textura de acordo com o tamanho selecionado
function getTexturePath(textureName) {
  // As texturas dos anéis de saturno estão no formato png
  const extension = textureName === "saturn_ring" ? "png" : "jpg";

  // Urano, Netuno e os aneis de Saturno possuem apenas texturas de 2k
  const size = ["uranus", "neptune", "saturn_ring"].includes(textureName)
    ? "2k"
    : TEXTURE_SIZE;

  return `assets/${size}/${textureName}.${extension}`;
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

// === GUI ===

const gui = new GUI();

// Adiciona o controle de velocidade
const animationSpeedControl = gui.add(
  ANIMATION,
  "SPEED",
  MIN_ANIMATION_SPEED,
  MAX_ANIMATION_SPEED,
  ANIMATION_SPEED_STEP
);

// Adiciona o submenu de debug
const folder = gui.addFolder("Debug");
const disableTranslationControl = folder.add(DEBUG, "DISABLE_TRANSLATION"); // Controle de translação
const disableRotationControl = folder.add(DEBUG, "DISABLE_ROTATION"); // Controle de rotação
// Controle de foco
const focusOnIndexControl = folder
  .add(DEBUG, "FOCUS_ON_INDEX", 0, 8, 1)
  .onChange((value) => {
    if (value === 0) {
      camera.position.set(0, 0, INITIAL_ZOOM);
      camera.rotation.set(0, 0, 6.5);
    }
  });

// === Events ===

document.addEventListener("keydown", (evt) => {
  const handlers = {
    // Aumenta velocidade de animação
    ArrowUp: () => {
      if (ANIMATION.SPEED < MAX_ANIMATION_SPEED) {
        ANIMATION.SPEED = ANIMATION.SPEED += ANIMATION_SPEED_STEP;
        animationSpeedControl.updateDisplay();
      }
    },
    // Dominui velocidade de animação
    ArrowDown: () => {
      if (ANIMATION.SPEED > MIN_ANIMATION_SPEED) {
        ANIMATION.SPEED = ANIMATION.SPEED -= ANIMATION_SPEED_STEP;
        animationSpeedControl.updateDisplay();
      }
    },
    // Foca no próximo planeta
    ArrowLeft: () => {
      if (DEBUG.FOCUS_ON_INDEX > 0) {
        DEBUG.FOCUS_ON_INDEX--;
        focusOnIndexControl.updateDisplay();
      }
    },
    // Foca no planeta anterior
    ArrowRight: () => {
      if (DEBUG.FOCUS_ON_INDEX < 8) {
        DEBUG.FOCUS_ON_INDEX++;
        focusOnIndexControl.updateDisplay();
      }
    },
    // Altera a translação
    t: () => {
      DEBUG.DISABLE_TRANSLATION = !DEBUG.DISABLE_TRANSLATION;
      disableTranslationControl.updateDisplay();
    },
    // Altera a rotação
    r: () => {
      DEBUG.DISABLE_ROTATION = !DEBUG.DISABLE_ROTATION;
      disableRotationControl.updateDisplay();
    },
  };

  handlers[evt.key]?.();
});
