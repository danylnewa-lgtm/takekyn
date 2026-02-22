const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 150;

let angle = 0;
let speed = 0.02;
let running = false;

// Загружаем PNG
const carImg = new Image();
carImg.src = "assets/images/car.png";

function drawTrack() {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawCar(x, y, rotation) {
  const size = 40;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation + Math.PI / 2); // чтобы машина смотрела по направлению движения
  ctx.drawImage(carImg, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function update() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();

  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);

  drawCar(x, y, angle);

  angle += speed;

  requestAnimationFrame(update);
}

startBtn.addEventListener("click", () => {
  if (!running) {
    running = true;
    update();
  }
});
