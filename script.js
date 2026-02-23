const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Адаптация под экран
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ===== НАСТРОЙКИ =====
const radius = 180;       // радиус круга
let angle = 0;            // угол движения
let speed = 0.02;         // скорость

// ===== ЗАГРУЗКА КАРТИНКИ =====
const carImg = new Image();
carImg.src = "./assets/car.png";

let carLoaded = false;

carImg.onload = () => {
  carLoaded = true;
};

carImg.onerror = () => {
  console.error("Ошибка загрузки assets/car.png");
};

// ===== УПРАВЛЕНИЕ =====
document.addEventListener("mousedown", () => speed = 0.04);
document.addEventListener("mouseup", () => speed = 0.02);

document.addEventListener("touchstart", () => speed = 0.04);
document.addEventListener("touchend", () => speed = 0.02);

// ===== ИГРОВОЙ ЦИКЛ =====
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Рисуем круговую трассу
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 4;
  ctx.stroke();

  angle += speed;

  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);

  if (carLoaded) {
    const scale = 0.25; // уменьшение в 4 раза
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
