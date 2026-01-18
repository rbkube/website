// Color Palette from RUBIKU.BE Logo
const COLOR_RED = 0xdd0100;      // R - Bright Red
const COLOR_YELLOW = 0xfac901;   // U - Golden Yellow
const COLOR_BLUE = 0x225095;     // B - Blue
const COLOR_GREEN = 0x80b917;    // K - Lime Green
const COLOR_ORANGE = 0xff9800;   // B (bottom) - Orange
const COLOR_WHITE = 0xf0f0f0;    // White inside faces
const COLOR_BLACK = 0x222628;    // Dark background from logo
const COLOR_DARK = COLOR_WHITE;     // I - Dark Gray

// Edge and corner colors
const COLOR_EDGE = COLOR_BLACK;     // Dark edges matching logo background
const COLOR_INSIDE_FACE = COLOR_WHITE; // White inside faces

// Rubik's Cube face colors matching RUBIKU.BE brand
const colors = {
  U: COLOR_DARK,    // Up face - Dark Gray (I)
  D: COLOR_YELLOW,  // Down face - Yellow (U)
  F: COLOR_RED,     // Front face - Red (R)
  B: COLOR_ORANGE,  // Back face - Orange (B bottom)
  L: COLOR_GREEN,   // Left face - Green (K)
  R: COLOR_BLUE,    // Right face - Blue (B)
};

// Algorithm to execute
const algorithm = "L' R D U' R D' R' B' U' R L R' B D R' B B' R'";

// Define which cubes should be letters with rotations
const letterCubes = {
  3: {
    letter: "R",
    color: COLOR_RED,
    rotation: { x: 0, y: 0, z: Math.PI / 2 },
  },
  10: {
    letter: "U",
    color: COLOR_YELLOW,
    rotation: { x: -Math.PI / 2, y: 0, z: 0 },
  },
  27: {
    letter: "B",
    color: COLOR_BLUE,
    rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
  },
  18: {
    letter: "I",
    color: COLOR_BLACK,
    rotation: { x: -Math.PI / 2, y: 0, z: -Math.PI / 2 },
  },
  5: {
    letter: "K",
    color: COLOR_GREEN,
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
  },
  8: {
    letter: "U",
    color: COLOR_BLACK,
    rotation: { x: Math.PI / 2, y: 0, z: 0 },
  },
  4: {
    letter: "B",
    color: COLOR_ORANGE,
    rotation: { x: Math.PI, y: 0, z: -Math.PI / 2 },
  },
  21: {
    letter: "E",
    color: COLOR_RED,
    mirror: true,
    rotation: { x: 0, y: 0, z: 0 },
  },
  19: {
    letter: "",
    color: COLOR_BLUE,
    solidCube: true,
    rotation: { x: 0, y: 0, z: 0 },
  },
};

// Cube dimensions
const CUBE_SIZE = 1;
const CUBE_GAP = 0;           // No gap between cubes (like logo)
const EDGE_RADIUS = 0.03;    // Slightly smaller edge radius for crisper look

// Visual enhancements to match logo style
const MATERIAL_FLATNESS = 50;  // Higher shininess for bold, flat look like logo
const BEVEL_ENABLED = true;    // Keep bevels for depth
const BEVEL_SIZE = 0.01;       // Slightly larger bevel for more defined edges
