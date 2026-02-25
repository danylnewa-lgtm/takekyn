const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let width, height;
let dpr = window.devicePixelRatio || 1;

let centerX, centerY;
let outerX, outerY;
let innerX, innerY;

let angle = 0;
let speed = 0.02;

const carImg = new Image();
carImg.src = "car.png";

/* --- Resize с поддержкой Retina --- */
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  outerX = width * 0.18;
  outerY = height * 0.35;

  innerX = outerX * 0.65;
  innerY = outerY * 0.65;

  centerX = outerX + 30;
  centerY = height - outerY - 30;
}

window.addEventListener("resize", resize);
resize();

/* --- Touch управление --- */
canvas.addEventListener("touchstart", () => {
  speed = 0.05;
});

canvas.addEventListener("touchend", () => {
  speed = 0.02;
});

/* --- Отрисовка --- */
function drawTrack() {
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#777";

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, outerX, outerY, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, innerX, innerY, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCar() {
  if (!carImg.complete) return;

  const midX = (outerX + innerX) / 2;
  const midY = (outerY + innerY) / 2;

  const x = centerX + midX * Math.cos(angle);
  const y = centerY + midY * Math.sin(angle);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.drawImage(carImg, -20, -10, 40, 20);
  ctx.restore();
}

function update() {
  angle += speed;
}

function loop() {
  ctx.clearRect(0, 0, width, height);
  drawTrack();
  drawCar();
  update();
  requestAnimationFrame(loop);
}

loop();
