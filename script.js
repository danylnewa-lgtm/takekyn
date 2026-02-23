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

// ===== ОВАЛ (уменьшен по горизонтали) =====
const radiusX = 70;   // было 90
const radiusY = 150;  // немного меньше

function center() {
  return {
    x: radiusX + 40, // левее
    y: canvas.height - radiusY - 60
  };
}

// ===== ИГРА =====
let angle = 0;
let speed = 0.02;
let running = false;

let laps = 0;
let coins = 0;
let lastAngle = 0;

// ===== МАШИНА =====
const carImg = new Image();
carImg.src = "assets/images/car.png";

let carLoaded = false;

carImg.onload = () => {
  carLoaded = true;
  drawInitial();
};

// ===== РИСОВАНИЕ =====
function drawTrack() {
  const c = center();

  ctx.beginPath();
  ctx.ellipse(c.x, c.y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawCar(x, y, rotation) {
  if (!carLoaded) return;

  const scale = 0.08;
  const w = carImg.width * scale;
  const h = carImg.height * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(carImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// ===== ПАНЕЛЬ =====
function drawUI() {
  const c = center();

  const boxWidth = 260;
  const boxHeight = 40;
  const boxX = c.x - boxWidth / 2;
  const boxY = c.y - radiusY - 70;

  ctx.fillStyle = "#222";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";

  ctx.fillText(`Круги: ${laps}`, boxX + 15, boxY + 25);

  const coinsText = `Монеты: ${coins.toFixed(1)}`;
  const textWidth = ctx.measureText(coinsText).width;
  ctx.fillText(coinsText, boxX + boxWidth - textWidth - 15, boxY + 25);
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

function update() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();

  const c = center();
  const x = c.x + radiusX * Math.cos(angle);
  const y = c.y + radiusY * Math.sin(angle);

  drawCar(x, y, angle);

  if (lastAngle > 6 && angle < 0.1) {
    laps++;
  }

  lastAngle = angle;

  coins += 1 * speed;

  drawUI();

  angle += speed;
  if (angle > Math.PI * 2) angle -= Math.PI * 2;

  requestAnimationFrame(update);
}

startBtn.addEventListener("click", () => {
  if (!carLoaded) return;

  if (!running) {
    running = true;
    update();
  }
});
