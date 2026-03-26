let gameState = "game"; // "game" или "garage"
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const garageBtn = document.getElementById("openUpgradesBtn");
const backBtn = document.getElementById("backBtn");

garageBtn.onclick = () => {
  gameState = "garage";
};

backBtn.onclick = () => {
  gameState = "game";
};
// ===== размеры =====
let width, height;
let centerX, centerY;
let outerX, outerY;
let innerX, innerY;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  const size = Math.min(width, height);

  outerX = outerY = size * 0.4;
  innerX = innerY = outerX * 0.6;

  centerX = width / 2;
  centerY = height / 2;
}
resize();
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

const upgradeScreen = document.getElementById("upgradeScreen");
const openBtn = document.getElementById("openUpgradesBtn");
const backBtn = document.getElementById("backBtn");

let inUpgradeScreen = false;

openBtn.onclick = () => {
  upgradeScreen.classList.remove("hidden");
  inUpgradeScreen = true;
};

backBtn.onclick = () => {
  upgradeScreen.classList.add("hidden");
  inUpgradeScreen = false;
};

// ===== апгрейды через картинки =====
const engineImg = document.getElementById("engineImg");
const turboImg = document.getElementById("turboImg");
const suspensionImg = document.getElementById("suspensionImg");

function updateUIState(){
  if(gameState === "garage"){
    document.body.classList.add("garage");
  } else {
    document.body.classList.remove("garage");
  }
}

function drawGarage(){
  // фон
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, width, height);

  // заголовок
  ctx.fillStyle = "white";
  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GARAGE", centerX, 80);

  // машина по центру
  if(carImg.complete){
    ctx.drawImage(carImg, centerX - 60, centerY - 30, 120, 60);
  }

  // инфа
  ctx.font = "20px Arial";
  ctx.fillText("Coins: " + coins, centerX, centerY + 100);

  // уровни
  ctx.fillText("Engine Lv." + engineLevel, centerX, centerY + 140);
  ctx.fillText("Turbo Lv." + turboLevel, centerX, centerY + 170);
  ctx.fillText("Cooling Lv." + coolingLevel, centerX, centerY + 200);
}

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function checkOrientation() {
  if (!isMobile()) {
    // ПК — всегда разрешаем
    document.body.classList.add("portrait");
    return;
  }

  // Только для телефонов проверяем ориентацию
  if (window.innerHeight > window.innerWidth) {
    document.body.classList.add("portrait");
  } else {
    document.body.classList.remove("portrait");
  }
}

window.addEventListener("resize", checkOrientation);
window.addEventListener("DOMContentLoaded", checkOrientation);
function getUpgradePrice(level) {
  return 1 + (level - 1) * 3;
}

engineImg.onclick = () => {
  const price = getUpgradePrice(engineLevel);
  if (coins >= price) {
    coins -= price;
    engineLevel++;
    maxSpeed += ENGINE_BONUS;
    saveProgress();
    updateCoinsUI();
  }
};
turboImg.onclick = () => {
  const price = getUpgradePrice(turboLevel);
  if (coins >= price) {
    coins -= price;
    turboLevel++;
    acceleration += TURBO_BONUS;
    saveProgress();
    updateCoinsUI();
  }
};
suspensionImg.onclick = () => {
  const price = getUpgradePrice(coolingLevel);
  if (coins >= price) {
    coins -= price;
    coolingLevel++;
    coolRate += COOLING_BONUS;
    heatRate -= HEAT_REDUCTION;
    if (heatRate < 0.001) heatRate = 0.001;
    saveProgress();
    updateCoinsUI();
  }
};

// ===== UI =====
function updateCoinsUI() {
  const el = document.getElementById("coinsUI");
  if (el) el.innerText = "Coins: " + coins;
}

// ===== save/load =====
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

// ===== кнопка газа =====
const gasBtn = document.getElementById("gasBtn");
gasBtn.addEventListener("mousedown", () => (accelerating = true));
gasBtn.addEventListener("mouseup", () => (accelerating = false));
gasBtn.addEventListener("mouseleave", () => (accelerating = false));
gasBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  accelerating = true;
});
gasBtn.addEventListener("touchend", () => (accelerating = false));

// ===== рисование =====
function drawTrack() {
  ctx.fillStyle = "#3a3a3a";
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerX, 0, Math.PI * 2);
  ctx.arc(centerX, centerY, innerX, 0, Math.PI * 2, true);
  ctx.fill("evenodd");

  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(centerX, centerY, outerX, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, innerX, 0, Math.PI * 2);
  ctx.stroke();

  const midRadius = (outerX + innerX) / 2;

  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.arc(centerX, centerY, midRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawFinishLine(){
  const midRadius = (outerX + innerX) / 2;
  const trackWidth = outerX - innerX;

  const angle = 0;

  const x = centerX + midRadius * Math.cos(angle);
  const y = centerY + midRadius * Math.sin(angle);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);

  const tileSize = 6;
  const rows = Math.floor(trackWidth / tileSize);
  const cols = 4;

  for(let row = 0; row < rows; row++){
    for(let col = 0; col < cols; col++){
      ctx.fillStyle = (row + col) % 2 === 0 ? "white" : "black";

      ctx.fillRect(
        -cols * tileSize / 2 + col * tileSize,
        -trackWidth / 2 + row * tileSize,
        tileSize,
        tileSize
      );
    }
  }

  ctx.restore();
}

function drawCar() {
  const midRadius = (outerX + innerX) / 2;
  const x = centerX + midRadius * Math.cos(angle);
  const y = centerY + midRadius * Math.sin(angle);
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

function updatePrices() {
  document.getElementById("enginePrice").innerText =
    getUpgradePrice(engineLevel);
  document.getElementById("turboPrice").innerText = getUpgradePrice(turboLevel);
  document.getElementById("suspensionPrice").innerText =
    getUpgradePrice(coolingLevel);
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
  if (angle >= Math.PI * 2) {
    angle -= Math.PI * 2;
    laps++;
    coins++;
    updateCoinsUI();
    saveProgress();
  }
}

// ===== цикл =====
function loop() {
if(isMobile() && window.innerWidth > window.innerHeight){
    requestAnimationFrame(loop);
    return;
  ctx.clearRect(0, 0, width, height);
  if(gameState === "game"){
    drawTrack();
    drawFinishLine();
    drawCar();
    drawLapCounter();
    drawHeatBar();
    update();
  }

  if(gameState === "garage"){
    drawGarage();
  }

  requestAnimationFrame(loop);
}

// ===== старт =====
window.addEventListener("resize", checkOrientation);
window.addEventListener("DOMContentLoaded", checkOrientation);
window.addEventListener("DOMContentLoaded", () => {
 

  loadProgress();
  updateCoinsUI();
  updatePrices();

  resize();
  loop();
});
