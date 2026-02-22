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

// Загружаем PNG-машину
const carImg = new Image();
carImg.src = "assets/images/car.png";

// Флаг загрузки
let carLoaded = false;
carImg.onload = () => {
  console.log("Car image loaded");
  carLoaded = true;
  drawInitial();
};

carImg.onerror = () => {
  console.error("Не удалось загрузить car.png. Проверь путь.");
};

// Рисуем трассу
function drawTrack() {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.stroke();
}

// Рисуем машину
function drawCar(x, y, rotation) {
  if (!carLoaded) return;

  // Масштабируем PNG
  const scale = 0.5; // уменьшить размер при необходимости
  const imgWidth = carImg.width * scale;
  const imgHeight = carImg.height * scale;

  ctx.save();
  ctx.translate(x, y);

  // Поворот по касательной траектории
  ctx.rotate(rotation); // машина боком по направлению движения

  // Рисуем PNG с правильными пропорциями
  ctx.drawImage(carImg, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

  ctx.restore();
}

// Начальный кадр
function drawInitial() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();
  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);
  drawCar(x, y, angle);
}

// Игровой цикл
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

// Старт игры
startBtn.addEventListener("click", () => {
  if (!carLoaded) {
    alert("Подождите, машина ещё загружается!");
    return;
  }
  running = true;
  update();
});
