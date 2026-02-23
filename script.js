const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ===== НАСТРОЙКИ =====
const baseRadius = 180;
const radiusX = baseRadius * 0.8;   // 4/5
const radiusY = baseRadius * 0.6;   // овал

let angle = 0;
let speed = 0.02;

// ===== КАРТИНКА =====
const carImg = new Image();
carImg.src = "assets/car.png";

let carLoaded = false;

carImg.onload = () => {
  carLoaded = true;
};

carImg.onerror = () => {
  console.error("Не удалось загрузить assets/car.png");
};

// ===== УПРАВЛЕНИЕ =====
document.addEventListener("mousedown", () => speed = 0.04);
document.addEventListener("mouseup", () => speed = 0.02);
document.addEventListener("touchstart", () => speed = 0.04);
document.addEventListener("touchend", () => speed = 0.02);

// ===== ИГРОВОЙ ЦИКЛ =====
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2 - radiusX * 0.5; // смещаем влево
  const centerY = canvas.height / 2;

  // рисуем овал
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 4;
  ctx.stroke();

  angle += speed;

  const x = centerX + radiusX * Math.cos(angle);
  const y = centerY + radiusY * Math.sin(angle);

  if (carLoaded) {
    const scale = 0.25; // уменьшена в 4 раза
    const w = carImg.width * scale;
    const h = carImg.height * scale;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.drawImage(carImg, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  requestAnimationFrame(update);
}

update();
