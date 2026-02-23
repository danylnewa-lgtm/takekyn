const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();
tg.disableVerticalSwipes();

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

// ====== ОВАЛ (меньше и слева снизу) ======
const radiusX = 60;
const radiusY = 110;

function center() {
  return {
    x: radiusX + 40,
    y: canvas.height - radiusY - 40
  };
}

// ====== ИГРОВЫЕ ПЕРЕМЕННЫЕ ======
let angle = 0;
let speed = 0.02;
let running = false;

let laps = 0;
let points = 0;
let lastAngle = 0;

// ====== МАШИНКА ======
const carImg = new Image();
carImg.src = "assets/images/car.png";

let carLoaded = false;

carImg.onload = () => {
  carLoaded = true;
  drawInitial();
};

// ====== РИСОВКА ======
function drawTrack() {
  const c = center();

  ctx.beginPath();
  ctx.ellipse(c.x, c.y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawCar(x, y, rotation) {
  if (!carLoaded) return;

  const scale = 0.25; // уменьшена вдвое
  const w = carImg.width * scale;
  const h = carImg.height * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(carImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawUI() {
  const c = center();

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";

  // Счётчик кругов (над овалом)
  ctx.fillText(`Круги: ${laps}`, c.x - 30, c.y - radiusY - 20);

  // Очки
  ctx.fillText(`Очки: ${points.toFixed(1)}`, 20, 30);
}

function drawInitial() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();

  const c = center();
  const x = c.x + radiusX * Math.cos(angle);
  const y = c.y + radiusY * Math.sin(angle);

  drawCar(x, y, angle);
  drawUI();
}

// ====== ОБНОВЛЕНИЕ ======
function update() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();

  const c = center();
  const x = c.x + radiusX * Math.cos(angle);
  const y = c.y + radiusY * Math.sin(angle);

  drawCar(x, y, angle);

  // Проверка круга
  if (lastAngle > 6 && angle < 0.1) {
    laps++;
  }

  lastAngle = angle;

  // Начисление очков
  points += 1 * speed;

  drawUI();

  angle += speed;
  if (angle > Math.PI * 2) angle -= Math.PI * 2;

  requestAnimationFrame(update);
}

// ====== СТАРТ ======
startBtn.addEventListener("click", () => {
  if (!carLoaded) return;

  if (!running) {
    running = true;
    update();
  }
});
