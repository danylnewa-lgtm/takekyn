const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const rotateMessage = document.getElementById("rotateMessage");
const lapsEl = document.getElementById("laps");
const coinsEl = document.getElementById("coins");
const actionBtn = document.getElementById("actionBtn");

let width, height;
let centerX, centerY;
let radiusX, radiusY;

let angle = 0;
let baseSpeed = 0.02;
let currentSpeed = 0;

let laps = 0;
let coins = 0;
let lastAngle = 0;
let started = false;

let carLoaded = false;

/* ВАЖНО: локальный файл */
const carImg = new Image();
carImg.src = "car.png";

carImg.onload = () => {
  carLoaded = true;
};

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  if (width < height) {
    rotateMessage.style.display = "flex";
  } else {
    rotateMessage.style.display = "none";
  }

  /* маленький вертикальный овал */
  radiusX = width * 0.07;
  radiusY = height * 0.22;

  centerX = radiusX + 30;
  centerY = height - radiusY - 30;
}

window.addEventListener("resize", resize);
resize();

actionBtn.addEventListener("click", () => {
  if (!started) {
    started = true;
    currentSpeed = baseSpeed;
    actionBtn.textContent = "BOOST";
  } else {
    currentSpeed += 0.001;
  }
});

function drawOval() {
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawCar() {
  if (!carLoaded) return;

  const x = centerX + radiusX * Math.cos(angle);
  const y = centerY + radiusY * Math.sin(angle);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);

  ctx.drawImage(carImg, -12, -6, 24, 12);

  ctx.restore();
}

function update() {
  if (!started) return;

  angle += currentSpeed;

  const normalized = angle % (Math.PI * 2);

  if (lastAngle > Math.PI * 1.5 && normalized < Math.PI * 0.5) {
    laps++;
    lapsEl.textContent = laps;
  }

  coins += currentSpeed;
  coinsEl.textContent = Math.floor(coins);

  lastAngle = normalized;
}

function loop() {
  ctx.clearRect(0, 0, width, height);

  if (width > height) {
    drawOval();
    drawCar();
    update();
  }

  requestAnimationFrame(loop);
}

loop();
