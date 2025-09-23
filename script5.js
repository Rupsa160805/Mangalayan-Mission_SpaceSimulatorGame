import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ## 1. SCENE SETUP ##
const scene = new THREE.Scene();
const canvas = document.getElementById("marsCanvas");
const backButton = document.getElementById("backButton");
const aboutButton = document.getElementById("aboutButton");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Add a starry background
const loader = new THREE.TextureLoader();
const bgTexture = loader.load(
  "https://www.solarsystemscope.com/textures/download/2k_stars.jpg"
);
scene.background = bgTexture;

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 10;

// ## 2. LIGHTING ##
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// ## 3. CREATE MARS ##
const marsGeometry = new THREE.SphereGeometry(1.5, 64, 64);

// Load the textures
const marsTexture = loader.load("mars-texture.jpg");
// Using a reliable online source for the normal map again
const marsNormalMap = loader.load(
  "https://threejs.org/examples/textures/planets/mars_normal_1k.jpg"
);
marsTexture.colorSpace = THREE.SRGBColorSpace;

const marsMaterial = new THREE.MeshStandardMaterial({
  map: marsTexture,
  normalMap: marsNormalMap,
});

const mars = new THREE.Mesh(marsGeometry, marsMaterial);
scene.add(mars);

// ## 4. ADD THE SATELLITE AND ORBIT ##
// Load the satellite image as a texture for a sprite
const satelliteTexture = loader.load("satellite-sprite.png");
satelliteTexture.colorSpace = THREE.SRGBColorSpace; // Ensure correct colors

// Create a SpriteMaterial with the satellite texture
const satelliteMaterial = new THREE.SpriteMaterial({ map: satelliteTexture });

// Create the Sprite
const satellite = new THREE.Sprite(satelliteMaterial);

// Set the size of the satellite sprite. Adjust these values to make it look right.
// The first value (width) and second value (height) are crucial. The third is usually 1 for sprites.
satellite.scale.set(0.6, 0.6, 1); // Example: 0.6 units wide, 0.6 units tall

// Create an empty Object3D to act as the pivot point for the orbit
const satellitePivot = new THREE.Object3D();
scene.add(satellitePivot); // Add the pivot to the scene

// Position the satellite relative to the pivot (which is at the center of Mars initially)
const orbitRadius = 2.5; // Distance from the center of Mars
satellite.position.set(orbitRadius, 0, 0); // Start it on the X-axis

satellitePivot.add(satellite); // Attach the satellite to the pivot

// Optionally, add a visible orbit path (a thin circle)
const orbitPathGeometry = new THREE.TorusGeometry(orbitRadius, 0.01, 16, 100);
const orbitPathMaterial = new THREE.MeshBasicMaterial({
  color: 0x00aaff ,
  transparent: true,
  opacity: 0.3,
});
const orbitPath = new THREE.Mesh(orbitPathGeometry, orbitPathMaterial);
orbitPath.rotation.x = Math.PI / 2; // Orient it horizontally
scene.add(orbitPath);

// ## 5. ANIMATION LOOP ##
function animate() {
  requestAnimationFrame(animate);

  // Slowly rotate Mars on its Y-axis
  mars.rotation.y += 0.0005;

  // Rotate the satellite pivot to make the satellite orbit around Mars
  satellitePivot.rotation.y += 0.008; // Adjust speed as desired

  // Update the orbit controls
  controls.update();

  // Render the scene from the camera's perspective
  renderer.render(scene, camera);
}

// Start the animation
animate();

// ## 6. HANDLE WINDOW RESIZING ##
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
backButton.addEventListener("click", () => {
  // This simple command tells the browser to go to the previous page
  window.location.href = "https://rupsa160805.github.io/SPACE-SIMULATOR-GAME/";
});
aboutButton.addEventListener("click", () => {
  // This simple command tells the browser to go to the previous page
  window.location.href ="https://www.isro.gov.in/MarsOrbiterMissionSpacecraft.html";
});
