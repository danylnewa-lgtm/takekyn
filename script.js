const tg = window.Telegram.WebApp;

// Telegram init
tg.ready();
tg.expand();  // fullscreen

// Настройка фона под тему Telegram
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
const baseRadius = 150;   // базовый радиус для расчёта овала
const radiusX = baseRadius * 0.8;  // по горизонтали
const radiusY = baseRadius * 1.2;  // вытянутый по вертикали

let angle = 0;
let speed = 0.02;
let running = false;

// ===== Картинка машинки =====
const carImg = new Image();
carImg.src = "assets/images/car.png"; // Проверь путь или используй полный URL

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
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawCar(x, y, rotation) {
  if (!carLoaded) return;

  const scale = 0.25; // уменьшенная машинка
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

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  drawTrack(centerX, centerY);

  const x = centerX + radiusX * Math.cos(angle);
  const y = centerY + radiusY * Math.sin(angle);

  drawCar(x, y, angle);
}

function update() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

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
