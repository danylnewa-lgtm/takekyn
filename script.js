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

// ====== ОВАЛ (увеличен ×1.5) ======
const radiusX = 90;   // было 60
const radiusY = 165;  // было 110

function center() {
  return {
    x: radiusX + 60,
    y: canvas.height - radiusY - 60
  };
}

// ====== ИГРА ======
let angle = 0;
let speed = 0.02;
let running = false;

let laps = 0;
let coins = 0;
let lastAngle = 0;

// ====== МАШИНА ======
const carImg = new Image();
carImg.src = "assets/images/car.png";

let carLoaded = false;

carImg.onload = () => {
  carLoaded = true;
  drawInitial();
};

// ====== РИСОВАНИЕ ======
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

  const scale = 0.125; // было 0.25 → уменьшили ещё в 2 раза
  const w = carImg.width * scale;
  const h = carImg.height * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(carImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// ====== РАМКА UI ======
function drawBox(x, y, width, height, text) {
  ctx.fillStyle = "#222";
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(text, x + 10, y + 22);
}

function drawUI() {
  const c = center();

  const boxWidth = 120;
  const boxHeight = 35;

  const uiY = c.y - radiusY - 60;

  // Круги
  drawBox(
    c.x - boxWidth - 10,
    uiY,
    boxWidth,
    boxHeight,
    `Круги: ${laps}`
  );

  // Монеты
  drawBox(
    c.x + 10,
    uiY,
    boxWidth,
    boxHeight,
    `Монеты: ${coins.toFixed(1)}`
  );
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

  // Начисление монет
  coins += 1 * speed;

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
