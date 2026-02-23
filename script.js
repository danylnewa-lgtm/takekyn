const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const rotateMessage = document.getElementById("rotateMessage");
const lapsEl = document.getElementById("laps");
const coinsEl = document.getElementById("coins");

let width, height;
let centerX, centerY;
let radiusX, radiusY;

let angle = 0;
let speed = 0.02;

let laps = 0;
let coins = 0;
let lastAngle = 0;

const carImg = new Image();
carImg.src = "https://danylnewa-lgtm.github.io/takekyn/assets/car.png";

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

  radiusX = width * 0.6;
  radiusY = height * 0.5;

  centerX = radiusX + 20;
  centerY = height - radiusY - 20;
}

window.addEventListener("resize", resize);
resize();

function drawOval() {
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawCar() {
  const x = centerX + radiusX * Math.cos(angle);
  const y = centerY + radiusY * Math.sin(angle);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);

  const carWidth = 40;
  const carHeight = 20;

  ctx.drawImage(carImg, -carWidth / 2, -carHeight / 2, carWidth, carHeight);

  ctx.restore();
}

function update() {
  angle += speed;

  if (lastAngle > Math.PI * 1.5 && angle % (Math.PI * 2) < Math.PI * 0.5) {
    laps++;
    lapsEl.textContent = laps;
  }

  coins += speed;
  coinsEl.textContent = Math.floor(coins);

  lastAngle = angle % (Math.PI * 2);
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
