// Получаем canvas из HTML
const canvas = document.getElementById("gameCanvas");

// Получаем 2D-контекст для рисования
const ctx = canvas.getContext("2d");

const ENGINE_BONUS = 0.01;
const TURBO_BONUS = 0.0004;
const COOLING_BONUS = 0.0015;
const HEAT_REDUCTION = 0.0003;
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

function saveProgress() {
  localStorage.setItem("coins", coins);
  localStorage.setItem("engineLevel", engineLevel);
  localStorage.setItem("turboLevel", turboLevel);
  localStorage.setItem("coolingLevel", coolingLevel);

  localStorage.setItem("maxSpeed", maxSpeed);
  localStorage.setItem("acceleration", acceleration);
  localStorage.setItem("coolRate", coolRate);
  localStorage.setItem("heatRate", heatRate);
}

function loadProgress() {

  coins = parseInt(localStorage.getItem("coins")) || 0;

  engineLevel = parseInt(localStorage.getItem("engineLevel")) || 1;
  turboLevel = parseInt(localStorage.getItem("turboLevel")) || 1;
  coolingLevel = parseInt(localStorage.getItem("coolingLevel")) || 1;

  maxSpeed = parseFloat(localStorage.getItem("maxSpeed")) || 0.02;
  acceleration = parseFloat(localStorage.getItem("acceleration")) || 0.0004;
  coolRate = parseFloat(localStorage.getItem("coolRate")) || 0.002;
  heatRate = parseFloat(localStorage.getItem("heatRate")) || 0.003;
}

// Функция изменения размеров при ресайзе окна
function resize() {

  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  outerX = width * 0.18;
  outerY = height * 0.40;

  innerX = outerX * 0.6;
  innerY = outerY * 0.6;

  // сильнее влево
  centerX = width * 0.25;
  centerY = height / 2;
}


function updateCoinsUI(){
  const el = document.getElementById("coinsUI");
  if (el) {
    el.innerText = "Coins: " + coins;
  }
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


function getUpgradePrice(level) {
  return 1 + (level - 1) * 3;
}
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
function updateUpgradeUI() {

  const engineBtn = document.getElementById("engineBtn");
  const turboBtn = document.getElementById("turboBtn");
  const coolingBtn = document.getElementById("coolingBtn");

  if (!engineBtn || !turboBtn || !coolingBtn) return;

  const enginePrice = getUpgradePrice(engineLevel);
  const turboPrice = getUpgradePrice(turboLevel);
  const coolingPrice = getUpgradePrice(coolingLevel);

  engineBtn.innerText = "Engine Lv." + engineLevel + " (" + enginePrice + ")";
  turboBtn.innerText = "Turbo Lv." + turboLevel + " (" + turboPrice + ")";
  coolingBtn.innerText = "Cooling Lv." + coolingLevel + " (" + coolingPrice + ")";
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

  const price = getUpgradePrice(engineLevel);

  if (coins >= price) {
    coins -= price;
    engineLevel++;

   maxSpeed += ENGINE_BONUS;
updateCoinsUI();
updateUpgradeUI();
    saveProgress();
  }
}

function upgradeTurbo() {

  const price = getUpgradePrice(turboLevel);

  if (coins >= price) {
    coins -= price;
    turboLevel++;

    acceleration += TURBO_BONUS;
updateCoinsUI();
updateUpgradeUI();
    saveProgress();
  }
}
function upgradeCooling() {

  const price = getUpgradePrice(coolingLevel);

  if (coins >= price) {
    coins -= price;
    coolingLevel++;

coolRate += COOLING_BONUS;
heatRate -= HEAT_REDUCTION;

if (heatRate < 0.001) heatRate = 0.001;
updateCoinsUI();
updateUpgradeUI();
saveProgress();
  }
}

function update() {

  prevAngle = angle;

  // ускорение
  if (accelerating && !overheated) {

    speed += acceleration * (1 - speed / maxSpeed);

    heat += heatRate;

    if (heat >= maxHeat) {
      heat = maxHeat;
      overheated = true;
    }

  } else {

    speed *= friction;

    if (speed < baseSpeed) speed = baseSpeed;

    heat -= coolRate;

    if (heat <= 0) {
      heat = 0;
      overheated = false;
    }
  }

  // движение по трассе
angle += speed;

const twoPI = Math.PI * 2;

if (angle >= twoPI) {
  angle -= twoPI;

  laps++;
  coins++;

  updateCoinsUI();
  saveProgress();
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
  requestAnimationFrame(loop);
}
window.addEventListener("DOMContentLoaded", () => {

  updateCoinsUI();
  updateUpgradeUI();
  loadProgress();
  
  resize();
  window.addEventListener("resize", resize);

  loop(); // запускаем игру сразу

});
