// Получаем canvas из HTML
const canvas = document.getElementById("gameCanvas");

// Получаем 2D-контекст для рисования
const ctx = canvas.getContext("2d");

// Счётчик кругов
let laps = 0;
let coins = 0;
// Предыдущий угол (для определения пересечения финиша)
let prevAngle = 0;
let accelerating = false;
// Размеры экрана
let width, height;

// Центр овала трассы
let centerX, centerY;

// Радиусы внешнего овала
let outerX, outerY;

// Радиусы внутреннего овала
let innerX, innerY;

// Текущий угол положения машины на трассе
let angle = 0;
let engineLevel = 1;
let coolingLevel = 1;
let turboLevel = 1;
let baseSpeed = 0.001;
let maxSpeed = 0.02;

let speed = baseSpeed;
let acceleration = 0.0004;   // плавное ускорение
let friction = 0.992;        // плавное замедление

// Перегрев
let heat = 0;                // текущий нагрев 0–1
let maxHeat = 1;
let heatRate = 0.003;        // скорость нагрева
let coolRate = 0.002;        // скорость охлаждения
let overheated = false;      // флаг перегрева
// Загружаем изображение машины
const carImg = new Image();
carImg.src = "assets/images/car.png";


// Функция изменения размеров при ресайзе окна
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  // Размер трассы
  outerX = width * 0.4;
  outerY = height * 0.25;
  innerX = outerX * 0.6;
  innerY = outerY * 0.6;

  // Центр трассы
  centerX = width / 2;
  centerY = height / 2;
}



// Получаем кнопку газа
const gasBtn = document.getElementById("gasBtn");

// Нажатие мышью
gasBtn.addEventListener("mousedown", () => accelerating = true);
gasBtn.addEventListener("mouseup", () => accelerating = false);
gasBtn.addEventListener("mouseleave", () => accelerating = false);

// Нажатие на мобильном
gasBtn.addEventListener("touchstart", (e) => {
  e.preventDefault(); // убираем прокрутку
  accelerating = true;
});

gasBtn.addEventListener("touchend", () => accelerating = false);



// Рисование трассы
function drawTrack() {

  // Внешний овал (асфальт)
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, outerX, outerY, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#444";
  ctx.fill();

  // Вырезаем внутренний овал
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

  // Пунктирная центральная линия
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


// Рисование машины
function drawCar() {

  if (!carImg.complete) return; // ждём загрузки

  const midX = (outerX + innerX) / 2;
  const midY = (outerY + innerY) / 2;

  // Позиция по эллипсу
  const x = centerX + midX * Math.cos(angle);
  const y = centerY + midY * Math.sin(angle);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);

  ctx.drawImage(carImg, -15, -8, 30, 16);

  ctx.restore();
}

function drawHeatBar() {

  const barWidth = 120;
  const barHeight = 10;

  const x = centerX - barWidth / 2;
  const y = centerY - outerY - 40;

  // фон
  ctx.fillStyle = "#333";
  ctx.fillRect(x, y, barWidth, barHeight);

  // заполнение
  ctx.fillStyle = overheated ? "red" : "orange";
  ctx.fillRect(x, y, barWidth * heat, barHeight);
}
// Обновление логики
function upgradeEngine() {
  const price = engineLevel * 20;
  if (coins >= price) {
    coins -= price;
    engineLevel++;
    maxSpeed = 0.02 + engineLevel * 0.005;

    localStorage.setItem("coins", coins);
    localStorage.setItem("engineLevel", engineLevel);
  }
}

function upgradeTurbo() {
  const price = turboLevel * 25;
  if (coins >= price) {
    coins -= price;
    turboLevel++;
    acceleration = 0.0004 + turboLevel * 0.00015;

    localStorage.setItem("coins", coins);
    localStorage.setItem("turboLevel", turboLevel);
  }
}

function upgradeCooling() {
  const price = coolingLevel * 30;
  if (coins >= price) {
    coins -= price;
    coolingLevel++;
    coolRate = 0.002 + coolingLevel * 0.001;
    heatRate -= 0.0004;
    if (heatRate < 0.001) heatRate = 0.001;

    localStorage.setItem("coins", coins);
    localStorage.setItem("coolingLevel", coolingLevel);
  }
}
function update() {

  prevAngle = angle;

  // --- УСКОРЕНИЕ ---
  if (accelerating && !overheated) {

    // плавный рост скорости
    speed += acceleration * (1 - speed / maxSpeed);

    // нагрев при "газ в пол"
    heat += heatRate;

    if (heat >= maxHeat) {
      heat = maxHeat;
      overheated = true;
    }
if (prevAngle > angle) {
  laps++;
}
  } else {

    // плавное замедление
    speed *= friction;

    if (speed < baseSpeed) speed = baseSpeed;

    // охлаждение
    heat -= coolRate;
    if (heat <= 0) {
      heat = 0;
      overheated = false;
    }
  }

  angle += speed;

  const twoPI = Math.PI * 2;

  if (angle >= twoPI) {
    angle -= twoPI;
  }

  if (prevAngle > angle) {
    laps++;
  }
   if (prevAngle > angle) {
    coins++;
  }
}

function drawCoins() {

  ctx.fillStyle = "gold";
  ctx.font = "18px Arial";

  ctx.fillText("Coins: " + coins, 20, 30);
}
// Финишная линия
function drawFinishLine() {

  const midX = (outerX + innerX) / 2;

  const y = centerY;
  const xLeft = centerX + midX - 20;
  const xRight = centerX + midX + 20;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(xLeft, y);
  ctx.lineTo(xRight, y);
  ctx.stroke();
}


// Счётчик кругов
function drawLapCounter() {

  ctx.fillStyle = "white";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("Laps: " + laps, centerX, centerY);
}


// Спидометр (максимум = 1.0)
function drawSpeedometer() {

  // Нормализация скорости к диапазону 0–1
  const speedPercent = Math.min(speed / maxSpeed, 1);

  const radius = 50;
  const x = centerX;
  const y = centerY - outerY - 70;

  // Фон дуги
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

  // Текст скорости (0.0 – 1.0)
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Speed: " + speedPercent.toFixed(2),
    x,
    y + 25
  );
}


// Главный цикл
function loop() {

  ctx.clearRect(0, 0, width, height);
  
  drawHeatBar();
  drawTrack();
  drawFinishLine();
  drawCar();
  drawLapCounter();
  drawSpeedometer();
  update();
  drawCoins();
  requestAnimationFrame(loop);
}
window.addEventListener("resize", resize);
resize();

carImg.onload = () => {
  loop();
};
