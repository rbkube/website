// Create a rounded box geometry (like CSS border-radius)
function createRoundedBoxGeometry(width, height, depth, radius, smoothness) {
  const shape = new THREE.Shape();
  const eps = 0.00001;
  const radius0 = radius - eps;
  shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
  shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
  shape.absarc(
    width - radius * 2,
    height - radius * 2,
    eps,
    Math.PI / 2,
    0,
    true,
  );
  shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth - radius * 2,
    bevelEnabled: true,
    bevelSegments: smoothness,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius,
    curveSegments: smoothness,
  });
  geometry.center();
  return geometry;
}

// Add backing faces with borders
function addBackingFaces(group, x, y, z, size, cubeNumber) {
  const faceSize = size * 0.95;
  const borderSize = size;

  // Define which face is pointing left in the FINAL state for each letter cube
  // This is the face where the letter/blue box is visible
  const leftFacingInFinalState = {
    3: "front", // R - front face points left in final state
    10: "bottom", // U - bottom face points left in final state
    27: "right", // B - right face points left in final state
    18: "top", // I - top face points left in final state
    5: "left", // K - left face points left in final state
    8: "top", // U - top face points left in final state
    4: "back", // B - back face points left in final state
    21: "front", // E - front face points left in final state
    19: "right", // Blue cube - right face points left in final state
  };

  const targetFace = leftFacingInFinalState[cubeNumber];

  const faceConfigs = [
    {
      name: "right",
      color: colors.R,
      isColored: x === 1,
      pos: [size / 2, 0, 0],
      rot: [0, Math.PI / 2, 0],
    },
    {
      name: "left",
      color: colors.L,
      isColored: x === -1,
      pos: [-size / 2, 0, 0],
      rot: [0, -Math.PI / 2, 0],
    },
    {
      name: "top",
      color: colors.U,
      isColored: y === 1,
      pos: [0, size / 2, 0],
      rot: [-Math.PI / 2, 0, 0],
    },
    {
      name: "bottom",
      color: colors.D,
      isColored: y === -1,
      pos: [0, -size / 2, 0],
      rot: [Math.PI / 2, 0, 0],
    },
    {
      name: "front",
      color: colors.F,
      isColored: z === 1,
      pos: [0, 0, size / 2],
      rot: [0, 0, 0],
    },
    {
      name: "back",
      color: colors.B,
      isColored: z === -1,
      pos: [0, 0, -size / 2],
      rot: [0, Math.PI, 0],
    },
  ];

  faceConfigs.forEach((config) => {
    if (config.isColored) {
      const isTargetFace = targetFace === config.name;

      // Dark border
      const borderGeo = new THREE.PlaneGeometry(borderSize, borderSize);
      const borderMat = new THREE.MeshBasicMaterial({
        color: COLOR_EDGE,
        side: THREE.FrontSide,
      });
      const borderMesh = new THREE.Mesh(borderGeo, borderMat);
      borderMesh.position.set(...config.pos);
      borderMesh.rotation.set(...config.rot);

      // Mark border if it's the target face
      if (isTargetFace) {
        borderMesh.userData.isTargetFaceBorder = true;
        borderMesh.userData.originalFaceName = config.name;
      }

      group.add(borderMesh);

      // Colored face
      const faceGeo = new THREE.PlaneGeometry(faceSize, faceSize);
      const faceMat = new THREE.MeshPhongMaterial({
        color: config.color,
        shininess: MATERIAL_FLATNESS,
        specular: 0x222222,
        side: THREE.FrontSide,
      });
      const faceMesh = new THREE.Mesh(faceGeo, faceMat);
      const offset = 0.001;
      faceMesh.position.set(
        config.pos[0] +
          (config.pos[0] > 0 ? offset : config.pos[0] < 0 ? -offset : 0),
        config.pos[1] +
          (config.pos[1] > 0 ? offset : config.pos[1] < 0 ? -offset : 0),
        config.pos[2] +
          (config.pos[2] > 0 ? offset : config.pos[2] < 0 ? -offset : 0),
      );
      faceMesh.rotation.set(...config.rot);

      // Mark this face if it's the target face for a letter cube
      if (isTargetFace) {
        faceMesh.userData.isTargetFace = true;
        faceMesh.userData.originalFaceName = config.name;
      }

      group.add(faceMesh);
    }
  });
}

// Create 3D letter mesh (simplified - no outline)
function createLetterMesh(
  letter,
  color,
  group,
  mirror = false,
  rotation = { x: 0, y: 0, z: 0 },
) {
  const loader = new THREE.FontLoader();
  loader.load(
    "fonts/rubik.json",
    function (font) {
      const textGeo = new THREE.TextGeometry(letter, {
        font: font,
        size: 0.75,
        height: 0.25,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.008,
        bevelSegments: 3,
      });
      textGeo.center();

      const textMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: MATERIAL_FLATNESS,
        specular: 0x222222,
        side: THREE.DoubleSide,
      });

      const textMesh = new THREE.Mesh(textGeo, textMaterial);
      if (mirror) {
        textMesh.scale.x = -1;
      }

      textMesh.rotation.set(rotation.x, rotation.y, rotation.z);

      // Mark as letter so we can control visibility
      textMesh.userData.isLetter = true;

      group.add(textMesh);
    },
    undefined,
    function (error) {
      console.error(
        "Error loading Rubik font. Make sure fonts/rubik.json exists:",
        error,
      );
    },
  );
}

// Add continuous edges that span the entire 3x3x3 cube
function addContinuousEdges() {
  const size = CUBE_SIZE;
  const gap = CUBE_GAP;
  const radius = EDGE_RADIUS;
  const halfSize = size / 2;
  const totalLength = (size + gap) * 3;
  const outerPos = size + gap + halfSize;

  const edgeMat = new THREE.MeshPhongMaterial({
    color: COLOR_EDGE,
    shininess: MATERIAL_FLATNESS,
    specular: 0x111111,
  });

  const edgeGeo = new THREE.CylinderGeometry(radius, radius, totalLength, 16);

  const continuousEdges = [
    { pos: [0, outerPos, outerPos], rot: [0, 0, Math.PI / 2] },
    { pos: [0, outerPos, -outerPos], rot: [0, 0, Math.PI / 2] },
    { pos: [outerPos, outerPos, 0], rot: [Math.PI / 2, 0, 0] },
    { pos: [-outerPos, outerPos, 0], rot: [Math.PI / 2, 0, 0] },
    { pos: [0, -outerPos, outerPos], rot: [0, 0, Math.PI / 2] },
    { pos: [0, -outerPos, -outerPos], rot: [0, 0, Math.PI / 2] },
    { pos: [outerPos, -outerPos, 0], rot: [Math.PI / 2, 0, 0] },
    { pos: [-outerPos, -outerPos, 0], rot: [Math.PI / 2, 0, 0] },
    { pos: [outerPos, 0, outerPos], rot: [0, 0, 0] },
    { pos: [outerPos, 0, -outerPos], rot: [0, 0, 0] },
    { pos: [-outerPos, 0, outerPos], rot: [0, 0, 0] },
    { pos: [-outerPos, 0, -outerPos], rot: [0, 0, 0] },
  ];

  continuousEdges.forEach((edge) => {
    const cylinder = new THREE.Mesh(edgeGeo, edgeMat);
    cylinder.position.set(...edge.pos);
    cylinder.rotation.set(...edge.rot);
    cubeGroup.add(cylinder);
  });

  const cornerGeo = new THREE.SphereGeometry(radius, 16, 16);
  const cornerPositions = [
    [outerPos, outerPos, outerPos],
    [outerPos, outerPos, -outerPos],
    [outerPos, -outerPos, outerPos],
    [outerPos, -outerPos, -outerPos],
    [-outerPos, outerPos, outerPos],
    [-outerPos, outerPos, -outerPos],
    [-outerPos, -outerPos, outerPos],
    [-outerPos, -outerPos, -outerPos],
  ];

  cornerPositions.forEach((pos) => {
    const sphere = new THREE.Mesh(cornerGeo, edgeMat);
    sphere.position.set(...pos);
    cubeGroup.add(sphere);
  });
}

// Update face visibility based on current position
function updateFaceVisibility() {
  // Letter cube numbers with their target face
  const leftFacingInFinalState = {
    3: "front",
    10: "bottom",
    27: "right",
    18: "top",
    5: "left",
    8: "top",
    4: "back",
    21: "front",
    19: "right",
  };

  cubies.forEach((cubie, index) => {
    const cubeNumber = index + 1;
    const targetFaceName = leftFacingInFinalState[cubeNumber];

    if (!targetFaceName) return; // Not a letter cube

    // Get the original target face normal
    const originalNormal = new THREE.Vector3();
    switch (targetFaceName) {
      case "left":
        originalNormal.set(-1, 0, 0);
        break;
      case "right":
        originalNormal.set(1, 0, 0);
        break;
      case "top":
        originalNormal.set(0, 1, 0);
        break;
      case "bottom":
        originalNormal.set(0, -1, 0);
        break;
      case "front":
        originalNormal.set(0, 0, 1);
        break;
      case "back":
        originalNormal.set(0, 0, -1);
        break;
    }

    // Apply the cubie's rotation to the normal
    const rotatedNormal = originalNormal.clone();
    rotatedNormal.applyQuaternion(cubie.quaternion);

    // Check if this face is now pointing left (negative X in world space)
    const isPointingLeft = rotatedNormal.x < -0.9; // Threshold for left direction

    cubie.children.forEach((child) => {
      // Handle target faces and borders
      if (
        child.userData &&
        (child.userData.isTargetFace || child.userData.isTargetFaceBorder)
      ) {
        // Hide face/border if pointing left, show otherwise
        child.visible = !isPointingLeft;
      }

      // Handle letters and blue cube (solid mesh)
      if (child.userData && child.userData.isLetter) {
        // Show letter only if pointing left
        child.visible = isPointingLeft;
      }

      // Handle blue cube solid mesh
      if (child.geometry && child.geometry.type === "ExtrudeGeometry") {
        // This is the blue solid cube - show only if pointing left
        child.visible = isPointingLeft;
      }
    });
  });
}

// Build the 3x3x3 cube
function buildCube() {
  const size = CUBE_SIZE;
  const gap = CUBE_GAP;
  const radius = EDGE_RADIUS;
  const positions = [-1, 0, 1];
  const padding = 0.15;

  cubies = [];
  cubeCounter = 1;

  for (let x of positions) {
    for (let y of positions) {
      for (let z of positions) {
        const cubeNumber = cubeCounter;
        const isLetterCube = letterCubes[cubeNumber];

        if (isLetterCube) {
          const cubieGroup = new THREE.Group();

          if (isLetterCube.solidCube) {
            // Solid cube (cube 19 - blue) with rounded corners
            const solidSize = size - 2 * padding;
            const roundedCubeGeo = createRoundedBoxGeometry(
              solidSize,
              solidSize,
              solidSize,
              0.1,
              8,
            );
            const solidMat = new THREE.MeshPhongMaterial({
              color: isLetterCube.color,
              shininess: MATERIAL_FLATNESS,
              specular: 0x222222,
              side: THREE.DoubleSide,
            });
            const solidMesh = new THREE.Mesh(roundedCubeGeo, solidMat);
            cubieGroup.add(solidMesh);

            // Add backing faces
            addBackingFaces(cubieGroup, x, y, z, size, cubeNumber);
          } else {
            // Letter cube - add backing faces and letter
            addBackingFaces(cubieGroup, x, y, z, size, cubeNumber);
            createLetterMesh(
              isLetterCube.letter,
              isLetterCube.color,
              cubieGroup,
              isLetterCube.mirror,
              isLetterCube.rotation,
            );
          }

          cubieGroup.position.set(
            x * (size + gap),
            y * (size + gap),
            z * (size + gap),
          );
          cubieGroup.userData.gridPosition = { x, y, z };
          cubeGroup.add(cubieGroup);
          cubies.push(cubieGroup);
        } else {
          // Normal cube
          const cubieGroup = new THREE.Group();
          addBackingFaces(cubieGroup, x, y, z, size, cubeNumber);

          cubieGroup.position.set(
            x * (size + gap),
            y * (size + gap),
            z * (size + gap),
          );
          cubieGroup.userData.gridPosition = { x, y, z };
          cubeGroup.add(cubieGroup);
          cubies.push(cubieGroup);
        }

        cubeCounter++;
      }
    }
  }

  addContinuousEdges();
}
