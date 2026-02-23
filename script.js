const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();
tg.disableVerticalSwipes();

document.body.style.backgroundColor = tg.themeParams.bg_color || "#111";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const rotateScreen = document.getElementById("rotateScreen");

function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

function resizeCanvas() {
  if (!isLandscape()) {
    canvas.style.display = "none";
    startBtn.style.display = "none";
    rotateScreen.style.display = "flex";
    return;
  }

  rotateScreen.style.display = "none";
  canvas.style.display = "block";
  startBtn.style.display = "block";

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ===== ТРАССА =====
function center() {
  return {
    x: canvas.width * 0.35,
    y: canvas.height / 2
  };
}

const radiusX = 120;
const radiusY = 200;

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
  ctx.lineWidth = 6;
  ctx.stroke();
}

function drawCar(x, y, rotation) {
  if (!carLoaded) return;

  const scale = 0.06;
  const w = carImg.width * scale;
  const h = carImg.height * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(carImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// ===== ПАНЕЛЬ СПРАВА =====
function drawUI() {
  const panelWidth = 260;
  const panelHeight = 100;
  const x = canvas.width - panelWidth - 40;
  const y = canvas.height / 2 - panelHeight / 2;

  ctx.fillStyle = "#222";
  ctx.fillRect(x, y, panelWidth, panelHeight);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, panelWidth, panelHeight);

  ctx.fillStyle = "white";
  ctx.font = "22px Arial";

  ctx.fillText(`Круги: ${laps}`, x + 30, y + 40);
  ctx.fillText(`Монеты: ${coins.toFixed(1)}`, x + 30, y + 75);
}

function drawInitial() {
  if (!isLandscape()) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();

  const c = center();
  const x = c.x + radiusX * Math.cos(angle);
  const y = c.y + radiusY * Math.sin(angle);

  drawCar(x, y, angle);
  drawUI();
}

function update() {
  if (!running || !isLandscape()) return;

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
  if (!carLoaded || !isLandscape()) return;

  if (!running) {
    running = true;
    update();
  }
});
