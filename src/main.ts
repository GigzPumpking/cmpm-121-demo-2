import "./style.css";

const app = document.querySelector("#app")!;

const lineBreak = document.createElement("br");
const initial = 0;
const next = 1;
const prev = -1;

const gameName = "Sticker Power";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = 256;
canvas.height = 256;
const ctx = canvas.getContext("2d")!;
const RECT_X = 0;
const RECT_Y = 0;
const RECT_WIDTH = 256;
const RECT_HEIGHT = 256;
ctx.fillStyle = "beige";
ctx.fillRect(RECT_X, RECT_Y, RECT_WIDTH, RECT_HEIGHT);
app.append(ctx.canvas);

// implement drawing with mouse

let isDrawing = false;
let x = 0;
let y = 0;

// Declare an array of array of xy coordinates to store the beginning x and y coordinates and end of each line

let points: [number, number][] = [];
const displayPoints: [number, number][][] = [];
let redoPoints: [number, number][][] = [];

const drawingChange = new Event("drawing-changed");

canvas.addEventListener("mousedown", (event) => {
  x = event.offsetX;
  y = event.offsetY;
  isDrawing = true;
  points = [];
  redoPoints = [];
  displayPoints.push(points);
  points.push([x, y]);
  canvas.dispatchEvent(drawingChange);
});

canvas.addEventListener("mousemove", (event) => {
  if (isDrawing) {
    x = event.offsetX;
    y = event.offsetY;
    points.push([x, y]);
    canvas.dispatchEvent(drawingChange);
  }
});

canvas.addEventListener("mouseup", (event) => {
  if (isDrawing) {
    isDrawing = false;
    points.push([event.offsetX, event.offsetY]);
    canvas.dispatchEvent(drawingChange);
    points = [];
  }
});

function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

function clearCanvas() {
  ctx.clearRect(RECT_X, RECT_Y, RECT_WIDTH, RECT_HEIGHT);
  ctx.fillRect(RECT_X, RECT_Y, RECT_WIDTH, RECT_HEIGHT);
}

app.append(lineBreak);

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.addEventListener("click", clearCanvas);
app.append(clearButton);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.addEventListener("click", () => {
  if (redoPoints.length) {
    const lastLine = redoPoints.pop();
    displayPoints.push(lastLine!);
    if (lastLine) {
      canvas.dispatchEvent(drawingChange);
    }
  }
});
app.append(redoButton);

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", () => {
  if (displayPoints.length) {
    const lastLine = displayPoints.pop();
    redoPoints.push(lastLine!);
    if (lastLine) {
      canvas.dispatchEvent(drawingChange);
    }
  }
});
app.append(undoButton);

canvas.addEventListener("drawing-changed", () => {
  clearCanvas();

  for (const line of displayPoints) {
    for (let i = 0; i < line.length + prev; i++) {
      drawLine(
        ctx,
        line[i][initial],
        line[i][next],
        line[i + next][initial],
        line[i + next][next]
      );
    }
  }
});
