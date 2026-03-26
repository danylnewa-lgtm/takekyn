let gameState = "game";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const garageBtn = document.getElementById("openUpgradesBtn");
const backBtn = document.getElementById("backBtn");
const warning = document.getElementById("rotateWarning");

// ===== безопасные клики =====
function safeClick(el, fn) {
  if (el) el.onclick = fn;
}

// ===== размеры =====
let width, height;
let centerX, centerY;
let outerX, innerX;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  const size = Math.min(width, height);

  outerX = size * 0.4;
  innerX = outerX * 0.6;

  centerX = width / 2;
  centerY = height / 2;
}
window.addEventListener("resize", resize);

// ===== движение =====
let angle = 0;
let baseSpeed = 0.001;
let maxSpeed = 0.02;
let speed = baseSpeed;
let acceleration = 0.0004;
let friction = 0.992;
let accelerating = false;

// ===== апгрейды =====
const ENGINE_BONUS = 0.01;
const TURBO_BONUS = 0.0004;
const COOLING_BONUS = 0.0015;
const HEAT_REDUCTION = 0.0003;

let engineLevel = 1;
let turboLevel = 1;
let coolingLevel = 1;

// ===== прогресс =====
let laps = 0;
let coins = 0;

// ===== перегрев =====
let heat = 0;
let maxHeat = 1;
let heatRate = 0.003;
let coolRate = 0.002;
let overheated = false;

// ===== машина =====
const carImg = new Image();
carImg.src = "assets/images/car.png";

// ===== апгрейды =====
const engineImgPanel = document.getElementById("engineImgPanel");
const turboImgPanel = document.getElementById("turboImgPanel");
const suspensionImgPanel = document.getElementById("suspensionImgPanel");

const engineImgScreen = document.getElementById("engineImgScreen");
const turboImgScreen = document.getElementById("turboImgScreen");
const suspensionImgScreen = document.getElementById("suspensionImgScreen");

safeClick(engineImgPanel, upgradeEngine);
safeClick(turboImgPanel, upgradeTurbo);
safeClick(suspensionImgPanel, upgradeCooling);

safeClick(engineImgScreen, upgradeEngine);
safeClick(turboImgScreen, upgradeTurbo);
safeClick(suspensionImgScreen, upgradeCooling);

// ===== UI =====
function updateUIState(){
  if(gameState === "garage"){
    document.body.classList.add("garage");
  } else {
    document.body.classList.remove("garage");
  }
}

// кнопки
safeClick(garageBtn, () => {
  gameState = "garage";
  updateUIState();
});

safeClick(backBtn, () => {
  gameState = "game";
  updateUIState();
});

// ===== апгрейды =====
function getUpgradePrice(level) {
  return 1 + (level - 1) * 3;
}

function upgradeEngine() {
  const price = getUpgradePrice(engineLevel);
  if (coins >= price) {
    coins -= price;
    engineLevel++;
    maxSpeed += ENGINE_BONUS;
    updateAll();
  }
}

function upgradeTurbo() {
  const price = getUpgradePrice(turboLevel);
  if (coins >= price) {
    coins -= price;
    turboLevel++;
    acceleration += TURBO_BONUS;
    updateAll();
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
    updateAll();
  }
}

// ===== UI =====
function updateCoinsUI() {
  const el = document.getElementById("coinsUI");
  if (el) el.innerText = "Coins: " + coins;
}

function updatePrices() {
  document.getElementById("enginePrice").innerText = getUpgradePrice(engineLevel);
  document.getElementById("turboPrice").innerText = getUpgradePrice(turboLevel);
  document.getElementById("suspensionPrice").innerText = getUpgradePrice(coolingLevel);
}

function updateAll(){
  updateCoinsUI();
  updatePrices();
  saveProgress();
}

// ===== сохранение =====
function saveProgress() {
  localStorage.setItem("coins", coins);
}

function loadProgress() {
  coins = parseInt(localStorage.getItem("coins")) || 0;
}

// ===== газ =====
const gasBtn = document.getElementById("gasBtn");

gasBtn.addEventListener("mousedown", () => accelerating = true);
gasBtn.addEventListener("mouseup", () => accelerating = false);
gasBtn.addEventListener("mouseleave", () => accelerating = false);

gasBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  accelerating = true;
});
gasBtn.addEventListener("touchend", () => accelerating = false);

// ===== рисование =====
function drawTrack() {
  ctx.fillStyle = "#3a3a3a";
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerX, 0, Math.PI * 2);
  ctx.arc(centerX, centerY, innerX, 0, Math.PI * 2, true);
  ctx.fill("evenodd");
}

function drawCar() {
  const r = (outerX + innerX) / 2;
  const x = centerX + r * Math.cos(angle);
  const y = centerY + r * Math.sin(angle);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);

  if (carImg.complete) {
    ctx.drawImage(carImg, -15, -8, 30, 16);
  }

  ctx.restore();
}

function update() {
  if (accelerating && !overheated) {
    speed += acceleration * (1 - speed / maxSpeed);
    heat += heatRate;
  } else {
    speed *= friction;
    heat -= coolRate;
  }

  if (heat < 0) heat = 0;
  if (heat > maxHeat) heat = maxHeat;

  angle += speed;

  if (angle >= Math.PI * 2) {
    angle = 0;
    laps++;
    coins++;
    updateCoinsUI();
  }
}

// ===== цикл =====
function loop() {
  ctx.clearRect(0, 0, width, height);

  if (gameState === "game") {
    drawTrack();
    drawCar();
    update();
  }

  requestAnimationFrame(loop);
}

// ===== старт =====
window.addEventListener("DOMContentLoaded", () => {
  resize();
  loadProgress();
  updateAll();
  updateUIState();
  loop();
});
