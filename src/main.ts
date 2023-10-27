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
  constructor(public x: number, public y: number, public emoji: string) {}

  display(context: CanvasRenderingContext2D) {
    context.font = "48px serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(this.emoji, this.x, this.y);
  }
}

const toolMovedEvent = new Event("tool-moved");
let tool = "marker";
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const circle: Circle | null = new Circle(x, y, 5, lineWidth);
const emoji: Emoji | null = new Emoji(x, y, "\u2B50");

canvas.addEventListener("tool-moved", () => {
  switch (tool) {
    case "marker":
      circle.x = x;
      circle.y = y;
      circle.lineWidth = lineWidth;
      emoji.emoji = "";
      break;
    case "star":
      emoji.x = x;
      emoji.y = y;
      emoji.emoji = "\u2B50";
      break;
    case "heart":
      emoji.x = x;
      emoji.y = y;
      emoji.emoji = "\uD83D\uDC96";
      break;
    case "asteroid":
      emoji.x = x;
      emoji.y = y;
      emoji.emoji = "\uD83D\uDE80";
      break;
  }
  canvas.dispatchEvent(drawingChange);
});

let singleSegments: LineSegment[] = [];
const displaySegments: LineSegment[][] = [];
let redoSegments: LineSegment[][] = [];

const displayEmoji: Emoji[] = [];
let redoEmoji: Emoji[] = [];

const drawingChange = new Event("drawing-changed");

canvas.addEventListener("mousedown", (event) => {
  x = event.offsetX;
  y = event.offsetY;
  switch (tool) {
    case "marker":
      redoSegments = [];
      isDrawing = true;
      singleSegments = [];
      displaySegments.push(singleSegments);
      singleSegments.push(new LineSegment(x, y, x, y, lineWidth));
      break;
    case "star":
      redoEmoji = [];
      displayEmoji.push(new Emoji(x, y, "\u2B50"));
      break;
    case "heart":
      redoEmoji = [];
      displayEmoji.push(new Emoji(x, y, "\uD83D\uDC96"));
      break;
    case "asteroid":
      redoEmoji = [];
      displayEmoji.push(new Emoji(x, y, "\uD83D\uDE80"));
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

const redoEmojiButton = document.createElement("button");
redoEmojiButton.innerHTML = "Redo E";
redoEmojiButton.addEventListener("click", () => {
  if (redoEmoji.length) {
    const lastEmoji = redoEmoji.pop();
    displayEmoji.push(lastEmoji!);
    if (lastEmoji) {
      canvas.dispatchEvent(drawingChange);
    }
  }
});
app.append(redoEmojiButton);

const undoEmojiButton = document.createElement("button");
undoEmojiButton.innerHTML = "Undo E";
undoEmojiButton.addEventListener("click", () => {
  if (displayEmoji.length) {
    const lastEmoji = displayEmoji.pop();
    redoEmoji.push(lastEmoji!);
    if (lastEmoji) {
      canvas.dispatchEvent(drawingChange);
    }
  }
});
app.append(undoEmojiButton);

canvas.addEventListener("drawing-changed", () => {
  clearCanvas();

  if (!isDrawing && onCanvas) {
    if (tool === "marker") {
      circle.display(ctx);
    } else if (tool === "star" || tool === "heart" || tool === "asteroid") {
      emoji.display(ctx);
    }
  }

  for (const segment of displaySegments) {
    for (const line of segment) {
      line.display(ctx);
    }
  }

  for (const emoji of displayEmoji) {
    emoji.display(ctx);
  }
});

// create an array of buttons for different tools
const toolButtons: HTMLButtonElement[] = [];

const thinMarkerButton = document.createElement("button");
thinMarkerButton.innerHTML = "Thin Marker";
thinMarkerButton.addEventListener("click", () => {
  tool = "marker";
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  lineWidth = 1;
  selectedTool(thinMarkerButton);
});
toolButtons.push(thinMarkerButton);
app.append(thinMarkerButton);

const thickMarkerButton = document.createElement("button");
thickMarkerButton.innerHTML = "Thick Marker";
thickMarkerButton.addEventListener("click", () => {
  tool = "marker";
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  lineWidth = 5;
  selectedTool(thickMarkerButton);
});
thinMarkerButton.classList.add("selectedTool");
toolButtons.push(thickMarkerButton);
app.append(thickMarkerButton);

const starEmojiButton = document.createElement("button");
starEmojiButton.innerHTML = "Star Emoji \u2B50";
starEmojiButton.addEventListener("click", () => {
  selectedTool(starEmojiButton);
  tool = "star";
});
toolButtons.push(starEmojiButton);
app.append(starEmojiButton);

const heartEmojiButton = document.createElement("button");
heartEmojiButton.innerHTML = "Heart Emoji \uD83D\uDC96";
heartEmojiButton.addEventListener("click", () => {
  selectedTool(heartEmojiButton);
  tool = "heart";
});
toolButtons.push(heartEmojiButton);
app.append(heartEmojiButton);

const asteroidEmojiButton = document.createElement("button");
asteroidEmojiButton.innerHTML = "Asteroid Emoji \uD83D\uDE80";
asteroidEmojiButton.addEventListener("click", () => {
  selectedTool(asteroidEmojiButton);
  tool = "asteroid";
});
toolButtons.push(asteroidEmojiButton);
app.append(asteroidEmojiButton);

function selectedTool(selected: HTMLButtonElement) {
  for (const button of toolButtons) {
    button.classList.remove("selectedTool");
  }
  selected.classList.add("selectedTool");
}
