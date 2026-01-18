// Rubik's Cube 3D Simulation with Three.js

let scene, camera, renderer, cubeGroup;
let cubies = []; // Individual cube pieces
let isAnimating = false;

// Step-by-step execution state
let allMoves = [];
let currentMoveIndex = 0;
let moveHistory = []; // Store cube states for undo

// Cube counter for numbering
let cubeCounter = 1;

// Initialize on load
init();
