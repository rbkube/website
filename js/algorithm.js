// Configuration constants

const MOVE_DURATION = 150;
const MOVE_DELAY = 100;
const CAMERA_DURATION = 1000;
const EDGE_TRANSITION_DURATION = 800;
const FLATTEN_DURATION = 1000;
const INITIAL_CAMERA_POSITION = { x: -8, y: 3, z: 4 };
const FINAL_CAMERA_POSITION = { x: -8, y: 0, z: 0 };
const INITIAL_EDGE_RADIUS = 0.03;
const FINAL_EDGE_RADIUS = 0.08;
const LOOP_PAUSE_DURATION = 2000;

// Parse algorithm string into moves array
function parseAlgorithm(algoString) {
  const moves = [];
  let i = 0;
  const str = algoString.trim();

  while (i < str.length) {
    if (str[i] === " ") {
      i++;
      continue;
    }

    const face = str[i];
    i++;

    let modifier = "";
    if (i < str.length && str[i] === "'") {
      modifier = "'";
      i++;
    } else if (i < str.length && str[i] === "2") {
      modifier = "2";
      i++;
    }

    moves.push(face + modifier);
  }

  return moves;
}

// Invert algorithm string (reverse order and swap prime notation)
function invertAlgorithmString(algoString) {
  const moves = parseAlgorithm(algoString);
  const inverted = moves.reverse().map((move) => {
    const face = move[0];
    if (move.includes("2")) {
      return face + "2";
    } else if (move.includes("'")) {
      return face;
    } else {
      return face + "'";
    }
  });
  return inverted.join(" ");
}

// Execute a single move based on logical grid positions
function executeMove(move) {
  return new Promise((resolve) => {
    const isPrime = move.includes("'");
    const is180 = move.includes("2");
    const face = move[0];

    let axis, layerFilter, angle;

    switch (face) {
      case "U":
        axis = "y";
        layerFilter = (c) => c.userData.gridPosition.y === 1;
        angle = isPrime ? Math.PI / 2 : -Math.PI / 2;
        break;
      case "D":
        axis = "y";
        layerFilter = (c) => c.userData.gridPosition.y === -1;
        angle = isPrime ? -Math.PI / 2 : Math.PI / 2;
        break;
      case "F":
        axis = "z";
        layerFilter = (c) => c.userData.gridPosition.z === 1;
        angle = isPrime ? Math.PI / 2 : -Math.PI / 2;
        break;
      case "B":
        axis = "z";
        layerFilter = (c) => c.userData.gridPosition.z === -1;
        angle = isPrime ? -Math.PI / 2 : Math.PI / 2;
        break;
      case "R":
        axis = "x";
        layerFilter = (c) => c.userData.gridPosition.x === 1;
        angle = isPrime ? Math.PI / 2 : -Math.PI / 2;
        break;
      case "L":
        axis = "x";
        layerFilter = (c) => c.userData.gridPosition.x === -1;
        angle = isPrime ? -Math.PI / 2 : Math.PI / 2;
        break;
      default:
        console.error("Unknown move:", move);
        resolve();
        return;
    }

    if (is180) angle *= 2;

    const layerCubies = cubies.filter(layerFilter);
    const rotationGroup = new THREE.Group();
    cubeGroup.add(rotationGroup);

    layerCubies.forEach((cubie) => {
      const localPos = cubie.position.clone();
      const localQuat = cubie.quaternion.clone();
      cubeGroup.remove(cubie);
      rotationGroup.add(cubie);
      cubie.position.copy(localPos);
      cubie.quaternion.copy(localQuat);
    });

    const startTime = Date.now();
    const startRotation = rotationGroup.rotation[axis];

    function animateRotation() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / MOVE_DURATION, 1);

      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      rotationGroup.rotation[axis] = startRotation + angle * eased;

      if (progress < 1) {
        requestAnimationFrame(animateRotation);
      } else {
        rotationGroup.rotation[axis] = startRotation + angle;
        rotationGroup.updateMatrixWorld();

        layerCubies.forEach((cubie) => {
          cubie.updateMatrixWorld();
          const worldPos = new THREE.Vector3();
          const worldQuat = new THREE.Quaternion();
          cubie.getWorldPosition(worldPos);
          cubie.getWorldQuaternion(worldQuat);

          rotationGroup.remove(cubie);
          cubeGroup.add(cubie);
          cubeGroup.worldToLocal(worldPos);
          cubie.position.copy(worldPos);

          const cubeGroupWorldQuat = new THREE.Quaternion();
          cubeGroup.getWorldQuaternion(cubeGroupWorldQuat);
          cubeGroupWorldQuat.invert();
          worldQuat.premultiply(cubeGroupWorldQuat);
          cubie.quaternion.copy(worldQuat);

          const x = Math.round(cubie.position.x);
          const y = Math.round(cubie.position.y);
          const z = Math.round(cubie.position.z);
          cubie.userData.gridPosition = { x, y, z };
        });

        cubeGroup.remove(rotationGroup);

        if (typeof updateFaceVisibility === "function") {
          updateFaceVisibility();
        }

        resolve();
      }
    }

    animateRotation();
  });
}

// Apply moves without animation (for initial setup)
function applyMovesInstantly(moves) {
  moves.forEach((move) => {
    const isPrime = move.includes("'");
    const is180 = move.includes("2");
    const face = move[0];

    let axis, layerFilter, angle;

    switch (face) {
      case "U":
        axis = "y";
        layerFilter = (c) => c.userData.gridPosition.y === 1;
        angle = isPrime ? Math.PI / 2 : -Math.PI / 2;
        break;
      case "D":
        axis = "y";
        layerFilter = (c) => c.userData.gridPosition.y === -1;
        angle = isPrime ? -Math.PI / 2 : Math.PI / 2;
        break;
      case "F":
        axis = "z";
        layerFilter = (c) => c.userData.gridPosition.z === 1;
        angle = isPrime ? Math.PI / 2 : -Math.PI / 2;
        break;
      case "B":
        axis = "z";
        layerFilter = (c) => c.userData.gridPosition.z === -1;
        angle = isPrime ? -Math.PI / 2 : Math.PI / 2;
        break;
      case "R":
        axis = "x";
        layerFilter = (c) => c.userData.gridPosition.x === 1;
        angle = isPrime ? Math.PI / 2 : -Math.PI / 2;
        break;
      case "L":
        axis = "x";
        layerFilter = (c) => c.userData.gridPosition.x === -1;
        angle = isPrime ? -Math.PI / 2 : Math.PI / 2;
        break;
      default:
        return;
    }

    if (is180) angle *= 2;

    const layerCubies = cubies.filter(layerFilter);
    const rotationGroup = new THREE.Group();
    cubeGroup.add(rotationGroup);

    layerCubies.forEach((cubie) => {
      const localPos = cubie.position.clone();
      const localQuat = cubie.quaternion.clone();
      cubeGroup.remove(cubie);
      rotationGroup.add(cubie);
      cubie.position.copy(localPos);
      cubie.quaternion.copy(localQuat);
    });

    rotationGroup.rotation[axis] = angle;
    rotationGroup.updateMatrixWorld();

    layerCubies.forEach((cubie) => {
      cubie.updateMatrixWorld();
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      cubie.getWorldPosition(worldPos);
      cubie.getWorldQuaternion(worldQuat);

      rotationGroup.remove(cubie);
      cubeGroup.add(cubie);
      cubeGroup.worldToLocal(worldPos);
      cubie.position.copy(worldPos);

      const cubeGroupWorldQuat = new THREE.Quaternion();
      cubeGroup.getWorldQuaternion(cubeGroupWorldQuat);
      cubeGroupWorldQuat.invert();
      worldQuat.premultiply(cubeGroupWorldQuat);
      cubie.quaternion.copy(worldQuat);

      const x = Math.round(cubie.position.x);
      const y = Math.round(cubie.position.y);
      const z = Math.round(cubie.position.z);
      cubie.userData.gridPosition = { x, y, z };
    });

    cubeGroup.remove(rotationGroup);
  });

  if (typeof updateFaceVisibility === "function") {
    updateFaceVisibility();
  }
}

// Reset camera to a specific position
function resetCameraPosition(targetPosition) {
  return new Promise((resolve) => {
    const startPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };

    const startTime = Date.now();

    function animateCamera() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / CAMERA_DURATION, 1);

      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      camera.position.x =
        startPosition.x + (targetPosition.x - startPosition.x) * eased;
      camera.position.y =
        startPosition.y + (targetPosition.y - startPosition.y) * eased;
      camera.position.z =
        startPosition.z + (targetPosition.z - startPosition.z) * eased;

      camera.lookAt(0, 0, 0);

      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      } else {
        resolve();
      }
    }

    animateCamera();
  });
}

// Rebuild edges with new radius
function rebuildEdgesWithRadius(radius) {
  const size = CUBE_SIZE;
  const gap = CUBE_GAP;
  const halfSize = size / 2;
  const totalLength = (size + gap) * 3;
  const outerPos = size + gap + halfSize;

  const childrenToRemove = [];
  cubeGroup.children.forEach((child) => {
    if (
      child.geometry &&
      (child.geometry.type === "CylinderGeometry" ||
        child.geometry.type === "SphereGeometry")
    ) {
      childrenToRemove.push(child);
    }
  });

  childrenToRemove.forEach((child) => {
    cubeGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  });

  const edgeMat = new THREE.MeshPhongMaterial({
    color: COLOR_EDGE,
    shininess: MATERIAL_FLATNESS,
    specular: 0x111111,
    transparent: true,
    opacity: 1.0,
  });

  const edgeGeo = new THREE.CylinderGeometry(radius, radius, totalLength, 16);

  const continuousEdges = [
    { pos: [0, outerPos, outerPos], rot: [0, 0, Math.PI / 2], isLeft: false },
    { pos: [0, outerPos, -outerPos], rot: [0, 0, Math.PI / 2], isLeft: false },
    { pos: [outerPos, outerPos, 0], rot: [Math.PI / 2, 0, 0], isLeft: false },
    { pos: [-outerPos, outerPos, 0], rot: [Math.PI / 2, 0, 0], isLeft: true },
    { pos: [0, -outerPos, outerPos], rot: [0, 0, Math.PI / 2], isLeft: false },
    { pos: [0, -outerPos, -outerPos], rot: [0, 0, Math.PI / 2], isLeft: false },
    { pos: [outerPos, -outerPos, 0], rot: [Math.PI / 2, 0, 0], isLeft: false },
    { pos: [-outerPos, -outerPos, 0], rot: [Math.PI / 2, 0, 0], isLeft: true },
    { pos: [outerPos, 0, outerPos], rot: [0, 0, 0], isLeft: false },
    { pos: [outerPos, 0, -outerPos], rot: [0, 0, 0], isLeft: false },
    { pos: [-outerPos, 0, outerPos], rot: [0, 0, 0], isLeft: true },
    { pos: [-outerPos, 0, -outerPos], rot: [0, 0, 0], isLeft: true },
  ];

  continuousEdges.forEach((edge) => {
    const cylinder = new THREE.Mesh(edgeGeo, edgeMat.clone());
    cylinder.position.set(...edge.pos);
    cylinder.rotation.set(...edge.rot);
    cylinder.userData.isLeftEdge = edge.isLeft;
    cubeGroup.add(cylinder);
  });

  const cornerGeo = new THREE.SphereGeometry(radius, 16, 16);
  const cornerPositions = [
    { pos: [outerPos, outerPos, outerPos], isLeft: false },
    { pos: [outerPos, outerPos, -outerPos], isLeft: false },
    { pos: [outerPos, -outerPos, outerPos], isLeft: false },
    { pos: [outerPos, -outerPos, -outerPos], isLeft: false },
    { pos: [-outerPos, outerPos, outerPos], isLeft: true },
    { pos: [-outerPos, outerPos, -outerPos], isLeft: true },
    { pos: [-outerPos, -outerPos, outerPos], isLeft: true },
    { pos: [-outerPos, -outerPos, -outerPos], isLeft: true },
  ];

  cornerPositions.forEach((corner) => {
    const sphere = new THREE.Mesh(cornerGeo, edgeMat.clone());
    sphere.position.set(...corner.pos);
    sphere.userData.isLeftEdge = corner.isLeft;
    cubeGroup.add(sphere);
  });
}

// Animate edge transition with separate radius and fade control
function animateEdgeTransition(
  startRadius,
  endRadius,
  fadeOut = false,
  fadeIn = false,
  keepHidden = false,
) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / EDGE_TRANSITION_DURATION, 1);

      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentRadius = startRadius + (endRadius - startRadius) * eased;
      rebuildEdgesWithRadius(currentRadius);

      if (fadeOut) {
        const opacity = 1 - eased;
        cubeGroup.children.forEach((child) => {
          if (
            child.geometry &&
            (child.geometry.type === "CylinderGeometry" ||
              child.geometry.type === "SphereGeometry")
          ) {
            if (!child.userData.isLeftEdge && child.material.transparent) {
              child.material.opacity = opacity;
              child.visible = opacity > 0.01;
            } else if (child.userData.isLeftEdge) {
              child.material.opacity = 1.0;
              child.visible = true;
            }
          }
        });
      } else if (fadeIn) {
        const opacity = eased;
        cubeGroup.children.forEach((child) => {
          if (
            child.geometry &&
            (child.geometry.type === "CylinderGeometry" ||
              child.geometry.type === "SphereGeometry")
          ) {
            if (!child.userData.isLeftEdge && child.material.transparent) {
              child.material.opacity = opacity;
              child.visible = opacity > 0.01;
            } else if (child.userData.isLeftEdge) {
              child.material.opacity = 1.0;
              child.visible = true;
            }
          }
        });
      } else if (keepHidden) {
        cubeGroup.children.forEach((child) => {
          if (
            child.geometry &&
            (child.geometry.type === "CylinderGeometry" ||
              child.geometry.type === "SphereGeometry")
          ) {
            if (!child.userData.isLeftEdge && child.material.transparent) {
              child.material.opacity = 0;
              child.visible = false;
            } else if (child.userData.isLeftEdge) {
              child.material.opacity = 1.0;
              child.visible = true;
            }
          }
        });
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    animate();
  });
}

// Apply edge fade manually (hide non-left edges)
function applyEdgeFade(fadeOut = true) {
  cubeGroup.children.forEach((child) => {
    if (
      child.geometry &&
      (child.geometry.type === "CylinderGeometry" ||
        child.geometry.type === "SphereGeometry")
    ) {
      if (!child.userData.isLeftEdge && child.material.transparent) {
        child.material.opacity = fadeOut ? 0 : 1;
        child.visible = !fadeOut;
      } else if (child.userData.isLeftEdge) {
        child.material.opacity = 1.0;
        child.visible = true;
      }
    }
  });
}

// Execute moves with animation
async function executeMoves(moves, label = "") {
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    console.log(`${label} ${i + 1}/${moves.length}: ${move}`);
    document.getElementById("status").textContent =
      `${label} ${i + 1}/${moves.length}: ${move}`;
    await executeMove(move);
    await new Promise((resolve) => setTimeout(resolve, MOVE_DELAY));
  }
}

// Execute full algorithm with looping
async function executeAlgorithm() {
  if (isAnimating) return;

  isAnimating = true;
  document.getElementById("executeBtn").disabled = true;
  document.getElementById("resetBtn").disabled = true;
  document.getElementById("prevBtn").disabled = true;
  document.getElementById("nextBtn").disabled = true;

  resetCube();
  applyMovesInstantly(allMoves);

  const invertedAlgo = invertAlgorithmString(algorithm);
  const invertedMoves = parseAlgorithm(invertedAlgo);

  rebuildEdgesWithRadius(FINAL_EDGE_RADIUS);
  applyEdgeFade(true);
  camera.position.set(-8, 0, 0);
  camera.lookAt(0, 0, 0);

  while (isAnimating) {
    await new Promise((resolve) => setTimeout(resolve, LOOP_PAUSE_DURATION));

    await animateEdgeTransition(
      FINAL_EDGE_RADIUS,
      INITIAL_EDGE_RADIUS,
      false,
      false,
      true,
    );
    await animateEdgeTransition(
      INITIAL_EDGE_RADIUS,
      INITIAL_EDGE_RADIUS,
      false,
      true,
      false,
    );
    await resetCameraPosition(INITIAL_CAMERA_POSITION);
    await executeMoves(invertedMoves, "Reverse");
    await new Promise((resolve) => setTimeout(resolve, LOOP_PAUSE_DURATION));

    await executeMoves(allMoves, "Forward");
    await new Promise((resolve) => setTimeout(resolve, 300));
    await resetCameraPosition(FINAL_CAMERA_POSITION);
    await animateEdgeTransition(
      INITIAL_EDGE_RADIUS,
      INITIAL_EDGE_RADIUS,
      true,
      false,
      false,
    );
    await animateEdgeTransition(
      INITIAL_EDGE_RADIUS,
      FINAL_EDGE_RADIUS,
      false,
      false,
      true,
    );
    await new Promise((resolve) => setTimeout(resolve, LOOP_PAUSE_DURATION));
  }
}

function stopAnimation() {
  isAnimating = false;
  document.getElementById("executeBtn").disabled = false;
  document.getElementById("resetBtn").disabled = false;
  updateStatus();
}
