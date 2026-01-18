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

            // Add backing faces (excluding right face for cube 19)
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

// Add backing faces with borders (excluding specific faces for letter cubes)
function addBackingFaces(group, x, y, z, size, cubeNumber) {
  const faceSize = size * 0.95;
  const borderSize = size;

  // Define which face to exclude for each letter cube
  const excludeFaces = {
    3: "front", // R
    10: "bottom", // U top
    27: "right", // B right
    18: "top", // I
    5: "left", // K
    8: "top", // U bottom
    4: "back", // B back
    21: "front", // E
    19: "right", // Blue cube
  };

  const excludeFace = excludeFaces[cubeNumber];
  const isLetterCube = !!excludeFace;

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
    // Check if this face should be transparent (excluded)
    const isExcludedFace = config.name === excludeFace;

    // Only skip if it's the excluded face AND that face direction is on the left side
    const shouldBeTransparent =
      isExcludedFace && config.name === "left" && x === -1; // Left face on left side

    if (shouldBeTransparent) {
      return; // Skip this face (transparent for letter)
    }

    if (config.isColored) {
      // Dark border
      const borderGeo = new THREE.PlaneGeometry(borderSize, borderSize);
      const borderMat = new THREE.MeshBasicMaterial({
        color: COLOR_EDGE,
        side: THREE.FrontSide,
      });
      const borderMesh = new THREE.Mesh(borderGeo, borderMat);
      borderMesh.position.set(...config.pos);
      borderMesh.rotation.set(...config.rot);
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
      group.add(faceMesh);
    } else if (isExcludedFace) {
      // This is an excluded face but NOT on the left side - add colored face
      // Determine color based on face direction
      const borderGeo = new THREE.PlaneGeometry(borderSize, borderSize);
      const borderMat = new THREE.MeshBasicMaterial({
        color: COLOR_EDGE,
        side: THREE.FrontSide,
      });
      const borderMesh = new THREE.Mesh(borderGeo, borderMat);
      borderMesh.position.set(...config.pos);
      borderMesh.rotation.set(...config.rot);
      group.add(borderMesh);

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
      group.add(faceMesh);
    }
  });
}

// Update face visibility based on current position
function updateFaceVisibility() {
  const excludeFaces = {
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
    const excludedFaceName = excludeFaces[cubeNumber];

    if (!excludedFaceName) return; // Not a letter cube

    const gridPos = cubie.userData.gridPosition;
    const isOnLeftSide = gridPos.x === -1;

    // Find the excluded face mesh and toggle visibility
    cubie.children.forEach((child) => {
      // Check if this is a colored face plane (not border, not letter)
      if (
        child.geometry &&
        child.geometry.type === "PlaneGeometry" &&
        child.material &&
        child.material.color
      ) {
        const pos = child.position;

        // Determine which face this is based on position
        let faceName = null;
        if (Math.abs(pos.x - -CUBE_SIZE / 2) < 0.01) faceName = "left";
        else if (Math.abs(pos.x - CUBE_SIZE / 2) < 0.01) faceName = "right";
        else if (Math.abs(pos.y - CUBE_SIZE / 2) < 0.01) faceName = "top";
        else if (Math.abs(pos.y - -CUBE_SIZE / 2) < 0.01) faceName = "bottom";
        else if (Math.abs(pos.z - CUBE_SIZE / 2) < 0.01) faceName = "front";
        else if (Math.abs(pos.z - -CUBE_SIZE / 2) < 0.01) faceName = "back";

        // If this is the excluded face
        if (faceName === excludedFaceName) {
          // Make visible only if NOT on left side
          child.visible = !isOnLeftSide;
        }
      }
    });
  });
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
