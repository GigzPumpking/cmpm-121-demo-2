import "./style.css";

const app = document.querySelector("#app")!;

const lineBreak = document.createElement("br");

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
let newX = 0;
let newY = 0;

// Create a class to represent line segments
class LineSegment {
  constructor(
    private x1: number,
    private y1: number,
    private x2: number,
    private y2: number
  ) {}

  display(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.moveTo(this.x1, this.y1);
    context.lineTo(this.x2, this.y2);
    context.stroke();
    context.closePath();
  }
}

let singleSegments: LineSegment[] = [];
const displaySegments: LineSegment[][] = [];
let redoSegments: LineSegment[][] = [];

const drawingChange = new Event("drawing-changed");

canvas.addEventListener("mousedown", (event) => {
  x = event.offsetX;
  y = event.offsetY;
  isDrawing = true;
  singleSegments = [];
  redoSegments = [];
  displaySegments.push(singleSegments);
  singleSegments.push(new LineSegment(x, y, x, y));
  canvas.dispatchEvent(drawingChange);
});

canvas.addEventListener("mousemove", (event) => {
  if (isDrawing) {
    newX = event.offsetX;
    newY = event.offsetY;

    const currentSegment = new LineSegment(x, y, newX, newY);

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    singleSegments.push(currentSegment);

    x = newX;
    y = newY;

    canvas.dispatchEvent(drawingChange);
  }
});

canvas.addEventListener("mouseup", (event) => {
  if (isDrawing) {
    isDrawing = false;
    newX = event.offsetX;
    newY = event.offsetY;

    singleSegments.push(new LineSegment(x, y, newX, newY));
    canvas.dispatchEvent(drawingChange);
  }
});

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
  if (redoSegments.length) {
    const lastLine = redoSegments.pop();
    displaySegments.push(lastLine!);
    if (lastLine) {
      canvas.dispatchEvent(drawingChange);
    }
  }
});
app.append(redoButton);

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", () => {
  if (displaySegments.length) {
    const lastLine = displaySegments.pop();
    redoSegments.push(lastLine!);
    if (lastLine) {
      canvas.dispatchEvent(drawingChange);
    }
  }
});
app.append(undoButton);

canvas.addEventListener("drawing-changed", () => {
  clearCanvas();

  for (const segment of displaySegments) {
    for (const line of segment) {
      line.display(ctx);
    }
  }
});
