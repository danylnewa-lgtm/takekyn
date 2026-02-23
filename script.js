const tg = window.Telegram.WebApp;

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
window.addEventListener("resize", resizeCanvas);

// ===== ОРИЕНТАЦИЯ =====
function checkOrientation() {
  if (window.innerHeight > window.innerWidth) {
    rotateOverlay.style.display = "flex";
    running = false;
  } else {
    rotateOverlay.style.display = "none";
  }
}
window.addEventListener("resize", checkOrientation);
checkOrientation();

// ===== НАСТРОЙКИ ОВАЛА =====
const baseRadius = 150;
const radiusX = baseRadius * 0.4;
const radiusY = baseRadius * 0.8;

let angle = 0;
let speed = 0.02;
let running = false;

// ===== МАШИНКА =====
const carImg = new Image();

// ⚠ ВАЖНО — если не работает, поставь полный URL:
carImg.src = "assets/images/car.png";
// carImg.src = "https://danylnewa-lgtm.github.io/takekyn/assets/car.png";

let carLoaded = false;

carImg.onload = () => {
  carLoaded = true;
  console.log("Машинка загружена");
  drawScene(); // рисуем сразу
};

carImg.onerror = () => {
  console.error("PNG не найден. Проверь путь.");
};

// ===== УСКОРЕНИЕ =====
document.addEventListener("mousedown", () => speed = 0.04);
document.addEventListener("mouseup", () => speed = 0.02);
document.addEventListener("touchstart", () => speed = 0.04);
document.addEventListener("touchend", () => speed = 0.02);

// ===== ЦЕНТР ОВАЛА =====
function getTrackCenter() {
  return {
    x: radiusX + 20,
    y: canvas.height - radiusY - 20
  };
}

// ===== РИСОВАНИЕ =====
function drawTrack(cx, cy) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCar(x, y, rotation) {
  if (!carLoaded) return;

  const scale = 0.125;
  const w = carImg.width * scale;
  const h = carImg.height * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(carImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const c = getTrackCenter();
  drawTrack(c.x, c.y);

  const x = c.x + radiusX * Math.cos(angle);
  const y = c.y + radiusY * Math.sin(angle);

  drawCar(x, y, angle);
}

// ===== ОБНОВЛЕНИЕ =====
function update() {
  if (!running) return;

  angle += speed;
  drawScene();

  requestAnimationFrame(update);
}

// ===== КНОПКА СТАРТ =====
startBtn.addEventListener("click", () => {
  if (!carLoaded) {
    console.log("Картинка ещё не загружена");
    return;
  }

  if (window.innerHeight > window.innerWidth) {
    return; // запрещаем старт в портрете
  }

  running = true;
  update();
});
