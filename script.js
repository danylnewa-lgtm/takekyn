const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}

// ===== Машина =====
const carImg = new Image();
carImg.src = "assets/car.png";

let carLoaded = false;
carImg.onload = () => {
  carLoaded = true;
  requestAnimationFrame(update);
};

// ===== Движение =====
let angle = 0;
let speed = 0.02;

// Управление
document.addEventListener("mousedown", () => speed = 0.04);
document.addEventListener("mouseup", () => speed = 0.02);
document.addEventListener("touchstart", () => speed = 0.04);
document.addEventListener("touchend", () => speed = 0.02);

// ===== Геометрия овала =====
const baseRadius = 150;
const radiusX = baseRadius * 0.8;   // 4/5
const radiusY = baseRadius * 0.6;   // делаем овал

function drawTrack(centerX, centerY) {
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawCar(x, y, rotation) {
  if (!carLoaded) return;

  const scale = 0.25; // уменьшена в 4 раза
  const w = carImg.width * scale;
  const h = carImg.height * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(carImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2 - radiusX * 0.5; // смещение влево
  const centerY = canvas.height / 2;

  drawTrack(centerX, centerY);

  angle += speed;

  const x = centerX + radiusX * Math.cos(angle);
  const y = centerY + radiusY * Math.sin(angle);

  const rotation = angle + Math.PI / 2;

  drawCar(x, y, rotation);

  requestAnimationFrame(update);
}
