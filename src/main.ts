import "./style.css";

const app = document.querySelector("#app")!;

const lineBreak = document.createElement("br");

const gameName = "Sticker Power";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const RECT_WIDTH = 384;
const RECT_HEIGHT = 384;
const EXPORT_WIDTH = 1024;
const EXPORT_HEIGHT = 1024;

canvas.width = RECT_WIDTH;
canvas.height = RECT_HEIGHT;
const ctx = canvas.getContext("2d")!;
const RECT_X = 0;
const RECT_Y = 0;
ctx.fillStyle = "beige";
ctx.fillRect(RECT_X, RECT_Y, RECT_WIDTH, RECT_HEIGHT);
app.append(ctx.canvas);

// implement drawing with mouse

let isDrawing = false;
let x = 0;
let y = 0;
let newX = 0;
let newY = 0;
let lineWidth = 1;
let onCanvas = false;

// Create a class to represent line segments
class LineSegment {
  constructor(
    private x1: number,
    private y1: number,
    private x2: number,
    private y2: number,
    private lineWidth: number
  ) {}

  display(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = this.lineWidth;
    context.moveTo(this.x1, this.y1);
    context.lineTo(this.x2, this.y2);
    context.stroke();
    context.closePath();
  }
}

class Circle {
  constructor(
    public x: number,
    public y: number,
    private radius: number,
    public lineWidth: number
  ) {}

  display(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = this.lineWidth;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.stroke();
    context.closePath();
  }
}

class Emoji {
  constructor(public x: number, public y: number, public code: string) {}

  display(context: CanvasRenderingContext2D) {
    context.font = "24px serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const originalFillStyle = context.fillStyle;
    context.fillStyle = "black";
    context.fillText(this.code, this.x, this.y);
    context.fillStyle = originalFillStyle;
  }
}

const toolMovedEvent = new Event("tool-moved");
let tool = "marker";
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const circle: Circle = new Circle(x, y, 5, lineWidth);
const emoji: Emoji = new Emoji(x, y, "");

canvas.addEventListener("tool-moved", () => {
  if (tool === "marker") {
    circle.x = x;
    circle.y = y;
    circle.lineWidth = lineWidth;
  } else if (tool === "emoji") {
    emoji.x = x;
    emoji.y = y;
  }
  canvas.dispatchEvent(drawingChange);
});

let singleSegments: LineSegment[] = [];
const displaySegments: (LineSegment[] | Emoji)[] = [];
let redoSegments: (LineSegment[] | Emoji)[] = [];

const drawingChange = new Event("drawing-changed");

canvas.addEventListener("mousedown", (event) => {
  x = event.offsetX;
  y = event.offsetY;

  if (tool === "marker") {
    redoSegments = [];
    isDrawing = true;
    singleSegments = [];
    displaySegments.push(singleSegments);
    singleSegments.push(new LineSegment(x, y, x, y, lineWidth));
  } else if (tool === "emoji") {
    redoSegments = [];
    displaySegments.push(new Emoji(x, y, emoji.code));
  }

  canvas.dispatchEvent(drawingChange);
});

canvas.addEventListener("mousemove", (event) => {
  if (isDrawing) {
    newX = event.offsetX;
    newY = event.offsetY;

    const currentSegment = new LineSegment(x, y, newX, newY, lineWidth);

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    singleSegments.push(currentSegment);

    x = newX;
    y = newY;

    canvas.dispatchEvent(drawingChange);
  } else {
    x = event.offsetX;
    y = event.offsetY;
    canvas.dispatchEvent(toolMovedEvent);
  }
});

canvas.addEventListener("mouseup", (event) => {
  if (isDrawing) {
    newX = event.offsetX;
    newY = event.offsetY;

    singleSegments.push(new LineSegment(x, y, newX, newY, lineWidth));
    canvas.dispatchEvent(drawingChange);

    isDrawing = false;
  }
});

canvas.addEventListener("mouseenter", () => {
  onCanvas = true;
});

canvas.addEventListener("mouseleave", () => {
  onCanvas = false;
  clearCanvas();
  canvas.dispatchEvent(drawingChange);
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

  if (!isDrawing && onCanvas) {
    if (tool === "marker") {
      circle.display(ctx);
    } else if (tool === "emoji") {
      emoji.display(ctx);
    }
  }

  displayDrawing(ctx);
});

function displayDrawing(ctx: CanvasRenderingContext2D) {
  for (const item of displaySegments) {
    if (Array.isArray(item)) {
      for (const line of item) {
        line.display(ctx);
      }
    } else {
      item.display(ctx);
    }
  }
}

const toolButtons: HTMLButtonElement[] = [];

const markerButton = document.createElement("button");
markerButton.innerHTML = "Marker";
markerButton.addEventListener("click", () => {
  tool = "marker";
  selectedTool(markerButton);
});
toolButtons.push(markerButton);
app.append(markerButton);

const markerThicknessButton = document.createElement("button");
markerThicknessButton.innerHTML = `Marker Thickness: ${lineWidth}`;
markerThicknessButton.addEventListener("click", () => {
  const newThickness = prompt("Enter a new thickness: ");
  if (newThickness) {
    const thickness = parseInt(newThickness);
    if (isNaN(thickness)) {
      alert("Please enter a number");
    } else {
      lineWidth = thickness;
      markerThicknessButton.innerHTML = `Marker Thickness: ${lineWidth}`;
    }
  }
});
app.append(markerThicknessButton);

// create a table to hold the emoji buttons
const emojiTable = document.createElement("table");
app.append(emojiTable);

function createEmojiButton(code: string) {
  const button = document.createElement("button");
  button.innerHTML = code;
  button.addEventListener("click", () => {
    tool = "emoji";
    emoji.code = button.innerHTML;
    selectedTool(button);
  });
  toolButtons.push(button);
  app.append(button);
  emojiTable.append(button);
}

interface EmojiList {
  name: string;
  code: string;
}

const emojis: EmojiList[] = [
  { name: "star", code: "\u2B50" },
  { name: "heart", code: "\uD83D\uDC96" },
  { name: "asteroid", code: "\uD83D\uDE80" },
];

for (const emoji of emojis) {
  createEmojiButton(emoji.code);
}

const customEmojiButton = document.createElement("button");
customEmojiButton.innerHTML = "Custom Emoji";
customEmojiButton.addEventListener("click", () => {
  const emote = prompt("Enter an emoji: ");
  if (emote) {
    createEmojiButton(emote);
  }
});
app.append(customEmojiButton);

const exportButton = document.createElement("button");
exportButton.innerHTML = "Export";
exportButton.addEventListener("click", () => {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = EXPORT_WIDTH;
  tempCanvas.height = EXPORT_HEIGHT;

  const tempCtx = tempCanvas.getContext("2d")!;
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  tempCtx.scale(EXPORT_WIDTH / RECT_WIDTH, EXPORT_HEIGHT / RECT_HEIGHT);
  tempCtx.fillStyle = "beige";
  tempCtx.fillRect(RECT_X, RECT_Y, EXPORT_WIDTH, EXPORT_HEIGHT);
  displayDrawing(tempCtx);

  const anchor = document.createElement("a");
  anchor.href = tempCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});
app.append(exportButton);

function selectedTool(selected: HTMLButtonElement) {
  for (const button of toolButtons) {
    button.classList.remove("selectedTool");
  }
  selected.classList.add("selectedTool");
}
