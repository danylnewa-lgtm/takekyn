const tg = window.Telegram.WebApp;

// Telegram init
tg.ready();
tg.expand();

document.body.style.backgroundColor = tg.themeParams.bg_color || "#111";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const rotateOverlay = document.getElementById("rotateOverlay");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  checkOrientation();
});

// ===== Проверка ориентации =====
function checkOrientation() {
  if (window.innerHeight > window.innerWidth) {
    rotateOverlay.style.display = "flex";
    running = false;
  } else {
    rotateOverlay.style.display = "none";
  }
}

window.addEventListener("orientationchange", checkOrientation);
checkOrientation();

// ===== Настройки овала (уменьшен вдвое) =====
const baseRadius = 150;
const radiusX = baseRadius * 0.4; // уменьшен
const radiusY = baseRadius * 0.6; // вытянут по вертикали и уменьшен

let angle = 0;
let speed = 0.02;
let running = false;

// ===== Машинка =====
const carImg = new Image();
carImg.src = "assets/images/car.png";

let carLoaded = false;

carImg.onload = () => {
  carLoaded = true;
  drawInitial();
};

carImg.onerror = () => console.error("Ошибка загрузки car.png");

// ===== Управление ускорением =====
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

  const scale = 0.125; // уменьшена вдвое
  const w = carImg.width * scale;
  const h = carImg.height * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(carImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function getTrackCenter() {
  return {
    x: radiusX + 20,
    y: canvas.height - radiusY - 20
  };
}

function drawInitial() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const c = getTrackCenter();
  drawTrack(c.x, c.y);

  const x = c.x + radiusX * Math.cos(angle);
  const y = c.y + radiusY * Math.sin(angle);

  drawCar(x, y, angle);
}

function update() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const c = getTrackCenter();
  drawTrack(c.x, c.y);

  angle += speed;

  const x = c.x + radiusX * Math.cos(angle);
  const y = c.y + radiusY * Math.sin(angle);

  drawCar(x, y, angle);

  requestAnimationFrame(update);
}

// ===== Старт =====
startBtn.addEventListener("click", () => {
  if (!carLoaded) return;
  if (window.innerHeight > window.innerWidth) return; // нельзя стартовать в портрете
  running = true;
  update();
});
