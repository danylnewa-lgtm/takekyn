const tg = window.Telegram.WebApp;

// Telegram init
tg.ready();
tg.expand();  // fullscreen

document.body.style.backgroundColor = tg.themeParams.bg_color || "#111";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ===== Настройки =====
const baseRadius = 150;
let radiusX = baseRadius * 0.4; // уменьшено в 2 раза
let radiusY = baseRadius * 0.6; // уменьшено в 2 раза, вытянуто по вертикали

let angle = 0;
let speed = 0.02;
let running = false;

// ===== Картинка машинки =====
const carImg = new Image();
carImg.src = "assets/images/car.png"; // проверь путь

let carLoaded = false;
carImg.onload = () => {
  carLoaded = true;
  drawInitial();
};

carImg.onerror = () => console.error("Ошибка загрузки car.png");

// ===== Управление =====
document.addEventListener("mousedown", () => speed = 0.04);
document.addEventListener("mouseup", () => speed = 0.02);
document.addEventListener("touchstart", () => speed = 0.04);
document.addEventListener("touchend", () => speed = 0.02);

// ===== Отрисовка =====
function drawTrack(centerX, centerY) {
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCar(x, y, rotation) {
  if (!carLoaded) return;

  const scale = 0.125; // уменьшено вдвое (от предыдущей версии 0.25)
  const w = carImg.width * scale;
  const h = carImg.height * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(carImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawInitial() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = radiusX + 20; // смещение влево (20px от края)
  const centerY = canvas.height - radiusY - 20; // смещение вниз (20px от низа)

  drawTrack(centerX, centerY);

  const x = centerX + radiusX * Math.cos(angle);
  const y = centerY + radiusY * Math.sin(angle);

  drawCar(x, y, angle);
}

function update() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = radiusX + 20;
  const centerY = canvas.height - radiusY - 20;

  drawTrack(centerX, centerY);

  angle += speed;

  const x = centerX + radiusX * Math.cos(angle);
  const y = centerY + radiusY * Math.sin(angle);

  drawCar(x, y, angle);

  requestAnimationFrame(update);
}

// ===== Старт =====
startBtn.addEventListener("click", () => {
  if (!carLoaded) return;
  running = true;
  update();
});
