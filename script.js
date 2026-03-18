// canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// баланс
const ENGINE_BONUS = 0.01;
const TURBO_BONUS = 0.0004;
const COOLING_BONUS = 0.0015;
const HEAT_REDUCTION = 0.0003;

// прогресс
let laps = 0;
let coins = 0;

// размеры
let width, height;
let centerX, centerY;
let outerX, outerY;
let innerX, innerY;

// движение
let angle = 0;
let baseSpeed = 0.001;
let maxSpeed = 0.02;
let speed = baseSpeed;
let acceleration = 0.0004;
let friction = 0.992;

// апгрейды
let engineLevel = 1;
let turboLevel = 1;
let coolingLevel = 1;

// перегрев
let heat = 0;
let maxHeat = 1;
let heatRate = 0.003;
let coolRate = 0.002;
let overheated = false;

// картинка
const carImg = new Image();
carImg.src = "assets/images/car.png";

// ===== SAVE / LOAD =====
function saveProgress() {
  localStorage.setItem("coins", coins);
  localStorage.setItem("engineLevel", engineLevel);
  localStorage.setItem("turboLevel", turboLevel);
  localStorage.setItem("coolingLevel", coolingLevel);
  localStorage.setItem("laps", laps);
}

function loadProgress() {
  coins = parseInt(localStorage.getItem("coins")) || 0;
  engineLevel = parseInt(localStorage.getItem("engineLevel")) || 1;
  turboLevel = parseInt(localStorage.getItem("turboLevel")) || 1;
  coolingLevel = parseInt(localStorage.getItem("coolingLevel")) || 1;
  laps = parseInt(localStorage.getItem("laps")) || 0;
}

// восстановление параметров
function applyUpgrades() {
  maxSpeed = 0.02 + (engineLevel - 1) * ENGINE_BONUS;
  acceleration = 0.0004 + (turboLevel - 1) * TURBO_BONUS;
  coolRate = 0.002 + (coolingLevel - 1) * COOLING_BONUS;
  heatRate = 0.003 - (coolingLevel - 1) * HEAT_REDUCTION;

  if (heatRate < 0.001) heatRate = 0.001;
}

// ===== UI =====
function updateCoinsUI() {
  const el = document.getElementById("coinsUI");
  if (el) el.innerText = "Coins: " + coins;
}

function updateUpgradeUI() {
  const engineBtn = document.getElementById("engineBtn");
  const turboBtn = document.getElementById("turboBtn");
  const coolingBtn = document.getElementById("coolingBtn");

  if (!engineBtn || !turboBtn || !coolingBtn) return;

  engineBtn.innerText = `Engine Lv.${engineLevel} (${getUpgradePrice(engineLevel)})`;
  turboBtn.innerText = `Turbo Lv.${turboLevel} (${getUpgradePrice(turboLevel)})`;
  coolingBtn.innerText = `Cooling Lv.${coolingLevel} (${getUpgradePrice(coolingLevel)})`;
}

// ===== управление =====
let accelerating = false;
const gasBtn = document.getElementById("gasBtn");

gasBtn.addEventListener("mousedown", () => accelerating = true);
gasBtn.addEventListener("mouseup", () => accelerating = false);
gasBtn.addEventListener("mouseleave", () => accelerating = false);

gasBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  accelerating = true;
});
gasBtn.addEventListener("touchend", () => accelerating = false);

// ===== апгрейды =====
function getUpgradePrice(level) {
  return 1 + (level - 1) * 3;
}

function upgradeEngine() {
  const price = getUpgradePrice(engineLevel);
  if (coins < price) return;

  coins -= price;
  engineLevel++;
  maxSpeed += ENGINE_BONUS;

  updateCoinsUI();
  updateUpgradeUI();
  saveProgress();
}

function upgradeTurbo() {
  const price = getUpgradePrice(turboLevel);
  if (coins < price) return;

  coins -= price;
  turboLevel++;
  acceleration += TURBO_BONUS;

  updateCoinsUI();
  updateUpgradeUI();
  saveProgress();
}

function upgradeCooling() {
  const price = getUpgradePrice(coolingLevel);
  if (coins < price) return;

  coins -= price;
  coolingLevel++;
  coolRate += COOLING_BONUS;
  heatRate -= HEAT_REDUCTION;

  if (heatRate < 0.001) heatRate = 0.001;

  updateCoinsUI();
  updateUpgradeUI();
  saveProgress();
}

// ===== геометрия =====
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  outerX = width * 0.18;
  outerY = height * 0.40;

  innerX = outerX * 0.6;
  innerY = outerY * 0.6;

  centerX = width * 0.25;
  centerY = height / 2;
}

// ===== рисование =====
function drawTrack() {

  ctx.fillStyle = "#444";

  ctx.beginPath();

  // внешний овал
  ctx.ellipse(centerX, centerY, outerX, outerY, 0, 0, Math.PI * 2);

  // внутренний (дырка)
  ctx.ellipse(centerX, centerY, innerX, innerY, 0, 0, Math.PI * 2);

  // правило "дырки"
  ctx.fill("evenodd");

  // границы
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, outerX, outerY, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, innerX, innerY, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCar() {
  const midX = (outerX + innerX) / 2;
  const midY = (outerY + innerY) / 2;

  const x = centerX + midX * Math.cos(angle);
  const y = centerY + midY * Math.sin(angle);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);

  if (carImg.complete) {
    ctx.drawImage(carImg, -15, -8, 30, 16);
  } else {
    ctx.fillStyle = "red";
    ctx.fillRect(-10, -5, 20, 10);
  }

  ctx.restore();
}

function drawLapCounter() {
  ctx.fillStyle = "white";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Laps: " + laps, centerX, centerY);
}

function drawHeatBar() {
  const w = 120;
  const x = centerX - w / 2;
  const y = centerY - outerY - 40;

  ctx.fillStyle = "#333";
  ctx.fillRect(x, y, w, 10);

  ctx.fillStyle = overheated ? "red" : "orange";
  ctx.fillRect(x, y, w * heat, 10);
}

// ===== логика =====
function update() {
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

  angle += speed;

  const twoPI = Math.PI * 2;

  if (angle >= twoPI) {
    angle -= twoPI;

    laps++;
    coins++;

    updateCoinsUI();
    saveProgress();
  }
}

// ===== цикл =====
function loop() {
  ctx.clearRect(0, 0, width, height);

  drawTrack();
  drawCar();
  drawLapCounter();
  drawHeatBar();

  update();

  requestAnimationFrame(loop);
}

// ===== старт =====
window.addEventListener("DOMContentLoaded", () => {

  loadProgress();
  applyUpgrades();

  updateCoinsUI();
  updateUpgradeUI();

  resize();
  window.addEventListener("resize", resize);

  loop();
});
