const width = window.innerWidth;
const height = 600;

// Initialize scene
function init() {
  // Scene setup
  scene = new THREE.Scene();
  //   scene.background = new THREE.Color(0xffffff);

  // Camera - positioned to show green face (left face) in front
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(-8, 3, 4);
  camera.lookAt(0, 0, 0);

  // Renderer with alpha for transparency
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  document.getElementById("canvas-container").appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight1.position.set(5, 5, 5);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-5, -5, -5);
  scene.add(directionalLight2);

  // Create cube group
  cubeGroup = new THREE.Group();
  scene.add(cubeGroup);

  // Build the cube
  buildCube();

  // Auto-start execution
  setTimeout(() => {
    executeAlgorithm();
  }, 100);

  // Parse algorithm
  allMoves = parseAlgorithm(algorithm);
  console.log("Parsed moves:", allMoves);
  console.log("Total moves:", allMoves.length);

  // Event listeners
  window.addEventListener("resize", onWindowResize);

  document
    .getElementById("executeBtn")
    .addEventListener("click", executeAlgorithm);
  document.getElementById("resetBtn").addEventListener("click", resetCube);
  document.getElementById("nextBtn").addEventListener("click", executeNextMove);
  document.getElementById("prevBtn").addEventListener("click", executePrevMove);

  // Update status
  updateStatus();

  // Start animation loop
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
