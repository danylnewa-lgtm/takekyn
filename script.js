let gameState = "game"; // "game" или "garage"
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const garageBtn = document.getElementById("openUpgradesBtn");
const backBtn = document.getElementById("backBtn");
const warning = document.getElementById("rotateWarning");

if (window.innerHeight > window.innerWidth) {
  warning.style.display = "none";
  canvas.style.display = "block";
} else {
  warning.style.display = "flex";
  canvas.style.display = "none";
}

// ===== размеры =====
let width, height;
let centerX, centerY;
let outerX, outerY;
let innerX, innerY;

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


// ===== апгрейды через картинки (панель) =====
const engineImgPanel = document.getElementById("engineImgPanel");
const turboImgPanel = document.getElementById("turboImgPanel");
const suspensionImgPanel = document.getElementById("suspensionImgPanel");

// ===== апгрейды через картинки (экран) =====
const engineImgScreen = document.getElementById("engineImgScreen");
const turboImgScreen = document.getElementById("turboImgScreen");
const suspensionImgScreen = document.getElementById("suspensionImgScreen");

if (engineImgPanel) engineImgPanel.onclick = upgradeEngine;
if (turboImgPanel) turboImgPanel.onclick = upgradeTurbo;
if (suspensionImgPanel) suspensionImgPanel.onclick = upgradeCooling;

if (engineImgScreen) engineImgScreen.onclick = upgradeEngine;
if (turboImgScreen) turboImgScreen.onclick = upgradeTurbo;
if (suspensionImgScreen) suspensionImgScreen.onclick = upgradeCooling;

canvas.addEventListener("click", (e) => {
  if(gameState !== "garage") return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  checkUpgradeClick(mouseX, mouseY);
});

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

// ===== функции апгрейдов =====
function upgradeEngine() {
  const price = getUpgradePrice(engineLevel);
  if (coins >= price) {
    coins -= price;
    engineLevel++;
    maxSpeed += ENGINE_BONUS;
    saveProgress();
    updateCoinsUI();
    updatePrices();
  }
}

function upgradeTurbo() {
  const price = getUpgradePrice(turboLevel);
  if (coins >= price) {
    coins -= price;
    turboLevel++;
    acceleration += TURBO_BONUS;
    saveProgress();
    updateCoinsUI();
    updatePrices();
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
    saveProgress();
    updateCoinsUI();
    updatePrices();
  }
}
function updateUIState(){
  if(gameState === "garage"){
    document.body.classList.add("garage");
  } else {
    document.body.classList.remove("garage");
  }
}

// обработчики ВНЕ функции
if (garageBtn) {
  garageBtn.onclick = () => {
    gameState = "garage";
    updateUIState();
  };
}

if (backBtn) {
  backBtn.onclick = () => {
    gameState = "game";
    updateUIState();
  };
}
function drawGarage(){
  // фон
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, width, height);

  // заголовок
  ctx.fillStyle = "white";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GARAGE", centerX, 60);

  // машина
  if(carImg.complete){
    ctx.drawImage(carImg, centerX - 100, centerY - 80, 200, 100);
  }

  // монеты
  ctx.fillStyle = "gold";
  ctx.font = "24px Arial";
  ctx.fillText("Coins: " + coins, centerX, centerY + 120);

  // блоки апгрейдов
  drawUpgradeCard(centerX - 200, centerY + 160, "ENGINE", engineLevel);
  drawUpgradeCard(centerX, centerY + 160, "TURBO", turboLevel);
  drawUpgradeCard(centerX + 200, centerY + 160, "COOLING", coolingLevel);
}

function checkUpgradeClick(mx, my){
  if(isInside(mx, my, centerX - 200, centerY + 160)){
    upgradeEngine();
  }
  else if(isInside(mx, my, centerX, centerY + 160)){
    upgradeTurbo();
  }
  else if(isInside(mx, my, centerX + 200, centerY + 160)){
    upgradeCooling();
  }
}

function isInside(mx, my, x, y){
  return (
    mx > x - 80 &&
    mx < x + 80 &&
    my > y - 40 &&
    my < y + 40
  );
}

function drawUpgradeCard(x, y, title, level){
  const price = getUpgradePrice(level);

  // фон карточки
  ctx.fillStyle = coins >= price ? "#2a2a2a" : "#1a1a1a";
  ctx.fillRect(x - 80, y - 40, 160, 80);

  // рамка
  ctx.strokeStyle = coins >= price ? "gold" : "#555";
  ctx.strokeRect(x - 80, y - 40, 160, 80);

  // текст
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(title, x, y - 10);

  ctx.fillText("Lv." + level, x, y + 10);

  ctx.fillStyle = "gold";
  ctx.fillText(price + "$", x, y + 30);
}
function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// ===== проверка ориентации и отображения canvas =====
function checkOrientation() {
  const warning = document.getElementById("rotateWarning");
  if (!warning) return;

  if (!isMobile()) {
    // ПК: всегда показываем canvas, warning скрыт
    warning.style.display = "none";
    canvas.style.display = "block";
    return;
  }

  // Мобильные устройства
  if (window.innerHeight < window.innerWidth) {
    // альбомная ориентация
    warning.style.display = "flex";
    canvas.style.display = "none";
  } else {
    // портретная ориентация
    warning.style.display = "none";
    canvas.style.display = "block";
  }
}

// ===== загрузка картинки машины =====
carImg.onload = () => {
  // если хотим, можно сразу перерисовать гараж
  if (gameState === "garage") drawGarage();
};

// ===== старт игры =====
window.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  updateCoinsUI();
  updatePrices();
  updateUIState();
  resize();
  checkOrientation(); // теперь проверка ориентации идёт сразу
  loop();
});

// ===== обработка ресайза =====
window.addEventListener("resize", () => {
  resize();
  checkOrientation();
});
// ===== функции апгрейдов =====
function getUpgradePrice(level) {
  return 1 + (level - 1) * 3;
}

function loadProgress() {
  coins = parseInt(localStorage.getItem("coins")) || 0;
  engineLevel = parseInt(localStorage.getItem("engineLevel")) || 1;
  turboLevel = parseInt(localStorage.getItem("turboLevel")) || 1;
  coolingLevel = parseInt(localStorage.getItem("coolingLevel")) || 1;
  laps = parseInt(localStorage.getItem("laps")) || 0;
}

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

  // движение и прогресс
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

  // блок поворота
  if (isMobile() && window.innerWidth > window.innerHeight) {
    requestAnimationFrame(loop);
    return;
  }

  ctx.clearRect(0, 0, width, height);

  if (gameState === "game") {
    drawTrack();
    drawFinishLine();
    drawCar();
    drawLapCounter();
    drawHeatBar();
    update();
    
  }

  if (gameState === "garage") {
    drawGarage();
  }

  requestAnimationFrame(loop);
}
// ===== старт =====

window.addEventListener("resize", () => {
  checkOrientation();
  resize();
});
window.addEventListener("DOMContentLoaded", checkOrientation);
// конец файла
window.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  updateCoinsUI();
  updatePrices();
  updateUIState();
  resize();
  loop();
});

