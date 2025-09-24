import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// --- SETUP ---
const scene = new THREE.Scene();
const canvas = document.getElementById("gameCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 15, 0); // Top-down view
const controls = new OrbitControls(camera, renderer.domElement);
const textureLoader = new THREE.TextureLoader();

// --- LIGHTING ---
scene.add(new THREE.AmbientLight(0xffffff, 1));
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// --- UI ELEMENTS ---
const fuelBar = document.getElementById("fuelBar");
const fuelText = document.getElementById("fuelText");
const engineButton = document.getElementById("engineButton");
const hyperboostButton = document.getElementById("hyperboostButton");
const perigeeLabel = document.getElementById("perigeeLabel");
const apogeeLabel = document.getElementById("apogeeLabel");
const missionFailedModal = document.getElementById("missionFailedModal");
const retryButton = document.getElementById("retryButton");

// --- GAME STATE ---
let gameState = {
  fuel: 100,
  isEngineOn: false,
  currentOrbitIndex: 0,
  progressInOrbit: 0,
  isTransitioning: false,
};

// --- OBJECTS ---
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(2, 64, 64),
  new THREE.MeshStandardMaterial({
    map: textureLoader.load("earth-texture.jpg"),
  })
);
scene.add(earth);

const satelliteTexture = textureLoader.load("satellite-sprite.png");
const satellite = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: satelliteTexture })
);
satellite.scale.set(0.5, 0.5, 1);
scene.add(satellite);
const flameTexture = textureLoader.load("flame-sprite.png");
const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTexture }));
flame.scale.set(0.3, 0.5, 1);
flame.visible = false;
satellite.add(flame);

const orbitParameters = [
  { a: 3.0, e: 0.1 },
  { a: 4.5, e: 0.2 },
  { a: 6.0, e: 0.3 },
  { a: 7.5, e: 0.4 },
  { a: 9.0, e: 0.5 },
];
const orbitCurves = orbitParameters.map(
  (p) =>
    new THREE.EllipseCurve(
      p.a * p.e,
      0,
      p.a,
      p.a * Math.sqrt(1 - p.e * p.e),
      0,
      2 * Math.PI,
      false,
      0
    )
);
const orbitMeshes = orbitCurves.map((curve) => {
  const points = curve.getPoints(128);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x555555 });
  return new THREE.Line(geometry, material);
});
orbitMeshes.forEach((mesh) => {
  mesh.rotation.x = Math.PI / 2;
  scene.add(mesh);
});

// --- PERIGEE/APOGEE ARCS ---
const arcMaterialPerigee = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // green
const arcMaterialApogee = new THREE.LineBasicMaterial({ color: 0xff0000 }); // red
let perigeeArc, apogeeArc;

function createArcSegment(curve, tStart, tEnd, material) {
  const points = [];
  for (let t = tStart; t <= tEnd; t += 0.01) {
    points.push(curve.getPoint(t));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  line.rotation.x = Math.PI / 2;
  return line;
}

function updateArcs() {
  if (perigeeArc) scene.remove(perigeeArc);
  if (apogeeArc) scene.remove(apogeeArc);
  const curve = orbitCurves[Math.floor(gameState.currentOrbitIndex)];
  perigeeArc = createArcSegment(curve, 0.45, 0.55, arcMaterialPerigee);
  apogeeArc = createArcSegment(curve, 0.95, 1.0, arcMaterialApogee);
  scene.add(perigeeArc);
  scene.add(apogeeArc);
}

// --- TRAIL EFFECT ---
const trailMaxPoints = 500;
const trailPositions = new Float32Array(trailMaxPoints * 3);
const trailColors = new Float32Array(trailMaxPoints * 4);
const trailGeometry = new THREE.BufferGeometry();
trailGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(trailPositions, 3)
);
trailGeometry.setAttribute("color", new THREE.BufferAttribute(trailColors, 4));

const trailMaterial = new THREE.PointsMaterial({
  size: 0.1,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  transparent: true,
  depthWrite: false,
});
const trail = new THREE.Points(trailGeometry, trailMaterial);
scene.add(trail);

let trailPointIndex = 0;
let trailPointCount = 0;

// --- GAME LOGIC ---
function updateSatellitePosition() {
  let curve = orbitCurves[Math.floor(gameState.currentOrbitIndex)];
  if (gameState.isTransitioning) {
    const startCurve = orbitCurves[Math.floor(gameState.currentOrbitIndex)];
    const endCurve = orbitCurves[Math.ceil(gameState.currentOrbitIndex)];
    const progress = gameState.currentOrbitIndex % 1;
    const startPoint = startCurve.getPoint(gameState.progressInOrbit);
    const endPoint = endCurve.getPoint(gameState.progressInOrbit);
    const currentPoint = new THREE.Vector2().lerpVectors(
      startPoint,
      endPoint,
      progress
    );
    satellite.position.set(currentPoint.x, 0, -currentPoint.y);
  } else {
    const point = curve.getPoint(gameState.progressInOrbit);
    satellite.position.set(point.x, 0, -point.y);
  }
  const tangent = curve.getTangent(gameState.progressInOrbit);
  flame.position.set(-tangent.x * 0.3, -tangent.y * 0.3, 0.1);
  flame.material.rotation = Math.atan2(tangent.y, tangent.x) - Math.PI / 2;

  // trail
  trailPositions[trailPointIndex * 3] = satellite.position.x;
  trailPositions[trailPointIndex * 3 + 1] = satellite.position.y;
  trailPositions[trailPointIndex * 3 + 2] = satellite.position.z;

  trailColors[trailPointIndex * 4] = 0.5;
  trailColors[trailPointIndex * 4 + 1] = 0.8;
  trailColors[trailPointIndex * 4 + 2] = 1.0;
  trailColors[trailPointIndex * 4 + 3] = 1.0;

  trailPointIndex = (trailPointIndex + 1) % trailMaxPoints;
  if (trailPointCount < trailMaxPoints) {
    trailPointCount++;
  }
  trailGeometry.setDrawRange(0, trailPointCount);
  trailGeometry.attributes.position.needsUpdate = true;
  trailGeometry.attributes.color.needsUpdate = true;
}

function updateTrailOpacity() {
  for (let i = 0; i < trailPointCount; i++) {
    const age = (trailPointIndex - i + trailMaxPoints) % trailMaxPoints;
    const normalizedAge = age / trailMaxPoints;
    trailColors[i * 4 + 3] = Math.max(0, 1.0 - normalizedAge * 2);
  }
  trailGeometry.attributes.color.needsUpdate = true;
}

function updateLabels() {
  const curve = orbitCurves[Math.floor(gameState.currentOrbitIndex)];
  const perigeePoint = curve.getPoint(0.5);
  const apogeePoint = curve.getPoint(0);
  const perigeeScreen = new THREE.Vector3(
    perigeePoint.x,
    0,
    -perigeePoint.y
  ).project(camera);
  const apogeeScreen = new THREE.Vector3(
    apogeePoint.x,
    0,
    -apogeePoint.y
  ).project(camera);

  perigeeLabel.style.left = `${
    ((perigeeScreen.x + 1) / 2) * window.innerWidth
  }px`;
  perigeeLabel.style.top = `${
    ((-perigeeScreen.y + 1) / 2) * window.innerHeight
  }px`;
  apogeeLabel.style.left = `${
    ((apogeeScreen.x + 1) / 2) * window.innerWidth
  }px`;
  apogeeLabel.style.top = `${
    ((-apogeeScreen.y + 1) / 2) * window.innerHeight
  }px`;
}

function resetGame() {
  gameState.fuel = 100;
  gameState.isEngineOn = false;
  gameState.currentOrbitIndex = 0;
  gameState.progressInOrbit = 0;
  gameState.isTransitioning = false;
  engineButton.classList.remove("active");
  engineButton.textContent = "ENGINE OFF";
  engineButton.disabled = false;
  hyperboostButton.classList.add("hidden");
  engineButton.classList.remove("hidden");
  missionFailedModal.classList.add("hidden");
  trailPointIndex = 0;
  trailPointCount = 0;
  trailGeometry.setDrawRange(0, 0);
  trailGeometry.attributes.position.needsUpdate = true;
  trailGeometry.attributes.color.needsUpdate = true;
}

// --- EVENT LISTENERS ---
engineButton.addEventListener("click", () => {
  gameState.isEngineOn = !gameState.isEngineOn;
  engineButton.textContent = gameState.isEngineOn ? "ENGINE ON" : "ENGINE OFF";
  engineButton.classList.toggle("active");
});

hyperboostButton.addEventListener("click", () => {
  satellite.scale.multiplyScalar(1.05);
  window.location.href = "index7.html";
  satellite.position.z -= 10;
});

retryButton.addEventListener("click", resetGame);

// --- ANIMATION LOOP ---
function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.001;
  gameState.progressInOrbit = (gameState.progressInOrbit + 0.002) % 1;

  flame.visible = gameState.isEngineOn;

  let efficientBurn = false;
  if (gameState.isEngineOn && !gameState.isTransitioning) {
    // decide burn efficiency based on location in orbit
    let fuelReduction;
    if (Math.abs(gameState.progressInOrbit - 0.5) < 0.05) {
      fuelReduction = 20;
      efficientBurn = true; // perigee burn
    } else {
      fuelReduction = 50;
      efficientBurn = false; // inefficient
    }
    gameState.fuel -= fuelReduction * 0.01 * 100; // scale to % of bar
    if (gameState.currentOrbitIndex < orbitParameters.length - 1) {
      gameState.isTransitioning = true;
    }
    if (gameState.fuel < 0) gameState.fuel = 0;
  }

  if (gameState.isTransitioning) {
    gameState.currentOrbitIndex += 0.01;
    if (
      gameState.currentOrbitIndex >=
      Math.ceil(gameState.currentOrbitIndex) - 0.01
    ) {
      gameState.currentOrbitIndex = Math.ceil(gameState.currentOrbitIndex);
      gameState.isTransitioning = false;
    }
  }

  if (
    gameState.fuel <= 0 &&
    gameState.currentOrbitIndex < orbitParameters.length - 1
  ) {
    missionFailedModal.classList.remove("hidden");
    engineButton.disabled = true;
  }
  if (
    Math.floor(gameState.currentOrbitIndex) >= orbitParameters.length - 1 &&
    !gameState.isTransitioning
  ) {
    hyperboostButton.classList.remove("hidden");
    engineButton.classList.add("hidden");
  }

  // fuel bar width + color flash
  fuelBar.style.width = `${gameState.fuel}%`;
  fuelText.textContent = `${Math.round(gameState.fuel)}%`;

  if (gameState.isEngineOn && !efficientBurn) {
    const flashColor = Date.now() % 400 < 200 ? "#ff6600" : "#ff0000"; // orange/red
    fuelBar.style.backgroundColor = flashColor;
  } else {
    fuelBar.style.backgroundColor = "#00cc00"; // normal green
  }

  updateSatellitePosition();
  updateTrailOpacity();
  updateLabels();
  updateArcs();
  controls.update();
  renderer.render(scene, camera);
}
animate();
