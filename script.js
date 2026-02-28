const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let laps = 0;
let prevAngle = 0;
let width, height;
let centerX, centerY;
let outerX, outerY;
let innerX, innerY;

let angle = 0;
let baseSpeed = 0.02;
let maxSpeed = 0.08;
let speed = baseSpeed;
let accelerating = false;
const carImg = new Image();
carImg.src = "assets/images/car.png";

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  // Размер вертикальной трассы
  outerX = width * 0.09;
  outerY = height * 0.30;

  innerX = outerX * 0.6;
  innerY = outerY * 0.6;

  // Левый нижний угол
  centerX = outerX + 40;
  centerY = height - outerY - 40;
}

window.addEventListener("resize", resize);
resize();
const gasBtn = document.getElementById("gasBtn");

gasBtn.addEventListener("mousedown", () => accelerating = true);
gasBtn.addEventListener("mouseup", () => accelerating = false);
gasBtn.addEventListener("mouseleave", () => accelerating = false);

gasBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  accelerating = true;
});

gasBtn.addEventListener("touchend", () => accelerating = false);
function drawTrack() {
  // Асфальт (между овалами)
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, outerX, outerY, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#444";
  ctx.fill();

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, innerX, innerY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  // Белые границы
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, outerX, outerY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, innerX, innerY, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Центральная пунктирная линия
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY,
    (outerX + innerX) / 2,
    (outerY + innerY) / 2,
    0,
    0,
    Math.PI * 2
  );
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCar() {
  if (!carImg.complete) return;

  const midX = (outerX + innerX) / 2;
  const midY = (outerY + innerY) / 2;

  const x = centerX + midX * Math.cos(angle);
  const y = centerY + midY * Math.sin(angle);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);

  ctx.drawImage(carImg, -15, -8, 30, 16);

  ctx.restore();
}

function update() {
  prevAngle = angle;

  // Ускорение
  if (accelerating) {
    speed += 0.001;
    if (speed > maxSpeed) speed = maxSpeed;
  } else {
    speed -= 0.001;
    if (speed < baseSpeed) speed = baseSpeed;
  }

  angle += speed;

  const twoPI = Math.PI * 2;

  if (angle >= twoPI) {
    angle -= twoPI;
  }

  // Пересечение финиша
  if (prevAngle > angle) {
    laps++;
  }
}
function drawFinishLine() {
  const midX = (outerX + innerX) / 2;

  const y = centerY; // правая точка овала
  const xLeft = centerX + midX - 20;
  const xRight = centerX + midX + 20;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(xLeft, y);
  ctx.lineTo(xRight, y);
  ctx.stroke();
}
function drawLapCounter() {
  ctx.fillStyle = "white";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("Laps: " + laps, centerX, centerY);
}
function drawSpeedometer() {
  const speedPercent = Math.min(speed / 0.1, 1); // нормализация

  const radius = 50;
  const x = centerX;
  const y = centerY - outerY - 70;

  // Фон
  ctx.beginPath();
  ctx.arc(x, y, radius, Math.PI, 0);
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 8;
  ctx.stroke();

  // Индикатор скорости
  ctx.beginPath();
  ctx.arc(
    x,
    y,
    radius,
    Math.PI,
    Math.PI + Math.PI * speedPercent
  );
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 8;
  ctx.stroke();

  // Текст
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Speed: " + (speed * 100).toFixed(1),
    x,
    y + 25
  );
}
function loop() {
  ctx.clearRect(0, 0, width, height);

  drawTrack();
  drawFinishLine();      // ← добавить
  drawCar();
  drawLapCounter();      // ← добавить
  drawSpeedometer();
  update();

  requestAnimationFrame(loop);
}
loop();
