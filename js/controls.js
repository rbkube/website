// Update status display
function updateStatus() {
  const nextMove =
    currentMoveIndex < allMoves.length ? allMoves[currentMoveIndex] : "None";
  document.getElementById("status").textContent =
    `${currentMoveIndex}/${allMoves.length} moves - Next: ${nextMove}`;

  // Update button states
  document.getElementById("prevBtn").disabled =
    currentMoveIndex === 0 || isAnimating;
  document.getElementById("nextBtn").disabled =
    currentMoveIndex >= allMoves.length || isAnimating;
}

// Save current cube state
function saveCubeState() {
  const state = cubies.map((cubie) => ({
    position: cubie.position.clone(),
    quaternion: cubie.quaternion.clone(),
    gridPosition: { ...cubie.userData.gridPosition },
  }));
  return state;
}

// Restore cube state
function restoreCubeState(state) {
  cubies.forEach((cubie, index) => {
    cubie.position.copy(state[index].position);
    cubie.quaternion.copy(state[index].quaternion);
    cubie.userData.gridPosition = { ...state[index].gridPosition };
  });
}

// Execute next move
async function executeNextMove() {
  if (isAnimating || currentMoveIndex >= allMoves.length) return;

  moveHistory[currentMoveIndex] = saveCubeState();
  isAnimating = true;
  updateStatus();

  const move = allMoves[currentMoveIndex];
  console.log(`Executing move ${currentMoveIndex + 1}: ${move}`);

  await executeMove(move);
  currentMoveIndex++;

  isAnimating = false;
  updateStatus();
}

// Execute previous move (undo)
async function executePrevMove() {
  if (isAnimating || currentMoveIndex === 0) return;

  isAnimating = true;
  currentMoveIndex--;

  if (moveHistory[currentMoveIndex]) {
    restoreCubeState(moveHistory[currentMoveIndex]);
  }

  isAnimating = false;
  updateStatus();
}

// Reset cube to solved state
function resetCube() {
  if (isAnimating) return;

  resetCameraPosition(INITIAL_CAMERA_POSITION);
  rebuildEdgesWithRadius(INITIAL_EDGE_RADIUS);

  cubies.forEach((cubie) => cubeGroup.remove(cubie));
  cubies = [];

  buildCube();

  currentMoveIndex = 0;
  moveHistory = [];

  updateStatus();
}
