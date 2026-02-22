const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");

// Telegram init (безопасно)
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  tg.disableVerticalSwipes();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const radius = 150;
let angle = 0;
let speed = 0.02;
let running = false;

const carImg = new Image();
carImg.src = "assets/images/car.png";

let carLoaded = false;
carImg.onload = function () {
  carLoaded = true;
  drawInitial();
};

carImg.onerror = function () {
  console.error("Ошибка загрузки car.png");
};

function getCenter() {
  return {
    x: canvas.width / 2,
    y: canvas.height / 2
  };
}

function drawTrack() {
  const c = getCenter();
  ctx.beginPath();
  ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawCar(x, y, rotation) {
  if (!carLoaded) return;

  const scale = 0.25;
  const w = carImg.width * scale;
  const h = carImg.height * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(carImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawInitial() {
  if (!carLoaded) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();

  const c = getCenter();
  const x = c.x + radius * Math.cos(angle);
  const y = c.y + radius * Math.sin(angle);

  drawCar(x, y, angle);
}

function update() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();

  const c = getCenter();
  const x = c.x + radius * Math.cos(angle);
  const y = c.y + radius * Math.sin(angle);

  drawCar(x, y, angle);

  angle += speed;

  requestAnimationFrame(update);
}

startBtn.addEventListener("click", function () {
  if (!carLoaded) return;
  running = true;
  update();
});
