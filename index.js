import { TinyLCD, Pixel } from "two_factor_auth_aocd8";
import { memory } from "two_factor_auth_aocd8/two_factor_aocd8_bg";

const PIXEL_SIZE = 15;

// Creates a new TinyLCD instance
let tinylcd = TinyLCD.new();
let width = tinylcd.width();
let height = tinylcd.height();

// Get canvas element and set dimensions
const canvas = document.getElementById("draw-canvas");
canvas.width = (PIXEL_SIZE + 1) * width + 1;
canvas.height = (PIXEL_SIZE + 1) * height + 1;

const ctx = canvas.getContext("2d");

// Get index from linear array
const getIndex = (row, column) => {
  return row * width + column;
};

// Render loop
const renderLoop = () => {
  tinylcd.on_instruction_recieved(next);
  drawGrid();
  fillPixels();

  if (next < tinylcd.instructions_count()) {
    setTimeout(() => {
      requestAnimationFrame(renderLoop);
      next++;
    }, 100);
  } else {
    return;
  }
};

// Render LCD pixel outlines
const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = "DARKGREEN";

  //Draw vertical lines
  for (let c = 0; c <= width; c++) {
    ctx.moveTo(c * (PIXEL_SIZE + 1) + 1, 0);
    ctx.lineTo(c * (PIXEL_SIZE + 1) + 1, height * (PIXEL_SIZE + 1) + 1);
  }

  // Draw horizontal lines
  for (let r = 0; r <= height; r++) {
    ctx.moveTo(0, r * (PIXEL_SIZE + 1) + 1);
    ctx.lineTo(width * (PIXEL_SIZE + 1) + 1, r * (PIXEL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

// Fill Turned On pixels
const fillPixels = () => {
  const pixelPtr = tinylcd.pixels();
  const pixels = new Uint8Array(memory.buffer, pixelPtr, width * height);

  var on_style = ctx.createLinearGradient(
    0,
    0,
    (PIXEL_SIZE + 1) * width + 1,
    (PIXEL_SIZE + 1) * height + 1
  );
  on_style.addColorStop(0.0, "TOMATO");
  on_style.addColorStop(0.5, "MEDIUMPURPLE");
  on_style.addColorStop(0.75, "MEDIUMAQUAMARINE");
  on_style.addColorStop(1, "DODGERBLUE");

  ctx.beginPath();

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const idx = getIndex(r, c);
      ctx.fillStyle = pixels[idx] === Pixel.On ? on_style : "rgb(10,40,50)";

      ctx.fillRect(
        c * (PIXEL_SIZE + 1) + 1,
        r * (PIXEL_SIZE + 1) + 1,
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    }
  }
  ctx.stroke();
};

// Run
let next = 0;
renderLoop(next);
