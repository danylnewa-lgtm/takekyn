const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let width, height;
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener("resize", resize);
resize();

// Центр трассы
const centerX = width * 0.5;
const centerY = height * 0.6;

// Радиусы трассы
const outerX = width * 0.3;
const outerY = height * 0.25;
const innerX = outerX * 0.6;
const innerY = outerY * 0.6;

let angle = 0;
let laps = 0;
let coins = 0;
let accelerating = false;
let speed = 0.001;
let maxSpeed = 0.02;
let friction = 0.992;

// Детали с износом
const parts = {
    engine: { x: -10, y: -5, level: 1, wear: 0 }, 
    turbo: { x: 10, y: -5, level: 1, wear: 0 }, 
    cooling: { x: 0, y: 10, level: 1, wear: 0 } 
};

// Кнопки улучшений
function upgradePart(name) {
    const part = parts[name];
    if (coins < 1) return;
    coins--;
    part.level++;
    part.wear = Math.max(0, part.wear - 0.2); // ремонт при апгрейде
}

// GAS
document.getElementById("gasBtn").addEventListener("mousedown", ()=> accelerating = true);
document.getElementById("gasBtn").addEventListener("mouseup", ()=> accelerating = false);
document.getElementById("gasBtn").addEventListener("mouseleave", ()=> accelerating = false);

// Сохраняем прогресс
function saveProgress() {
    localStorage.setItem("coins", coins);
    localStorage.setItem("laps", laps);
    for (const name in parts) {
        localStorage.setItem(name+"_level", parts[name].level);
        localStorage.setItem(name+"_wear", parts[name].wear);
    }
}
function loadProgress() {
    coins = parseInt(localStorage.getItem("coins"))||0;
    laps = parseInt(localStorage.getItem("laps"))||0;
    for (const name in parts) {
        parts[name].level = parseInt(localStorage.getItem(name+"_level"))||1;
        parts[name].wear = parseFloat(localStorage.getItem(name+"_wear"))||0;
    }
}
loadProgress();

// Рисуем трассу
function drawTrack() {
    // Асфальт
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, outerX, outerY, 0, 0, Math.PI*2);
    ctx.fillStyle="#444";
    ctx.fill();
    // Вырез внутреннего овала
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, innerX, innerY, 0,0, Math.PI*2);
    ctx.fill();
    ctx.globalCompositeOperation="source-over";

    // Линии границ
    ctx.strokeStyle="white";
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, outerX, outerY,0,0, Math.PI*2); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, innerX, innerY,0,0, Math.PI*2); ctx.stroke();

    // Центральная пунктирная линия
    ctx.setLineDash([10,10]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, (outerX+innerX)/2, (outerY+innerY)/2,0,0, Math.PI*2);
    ctx.strokeStyle="yellow"; ctx.lineWidth=2; ctx.stroke(); ctx.setLineDash([]);

    // Старт/Финиш линия
    const midX = (outerX+innerX)/2;
    ctx.strokeStyle="red"; ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(centerX+midX-20, centerY);
    ctx.lineTo(centerX+midX+20, centerY); ctx.stroke();
}

// Рисуем машину с деталями
function drawCar() {
    // кузов
    ctx.fillStyle="#222"; ctx.fillRect(centerX-20, centerY-10, 40,20);
    // детали
    for(const name in parts){
        const part = parts[name];
        let color = part.wear<0.33?"green":part.wear<0.66?"yellow":"red";
        ctx.fillStyle=color;
        ctx.fillRect(centerX+part.x, centerY+part.y, 10,10);
        // текст уровня
        ctx.fillStyle="white"; ctx.font="10px Arial";
        ctx.fillText(part.level, centerX+part.x+2, centerY+part.y+8);
    }
}

// UI
function drawUI(){
    ctx.fillStyle="gold"; ctx.font="22px Arial";
    ctx.fillText("Coins: "+coins, 80,30);
    ctx.fillText("Laps: "+laps, 80,60);
}

// Логика движения
function update(){
    if(accelerating) speed += 0.0004*(1-speed/maxSpeed);
    else speed*=friction;
    if(speed<0.001) speed=0.001;
    angle+=speed;
    if(angle>=Math.PI*2){
        angle-=Math.PI*2;
        laps++; coins++;
        for(const name in parts){ // износ деталей каждый круг
            parts[name].wear += 0.05; if(parts[name].wear>1) parts[name].wear=1;
        }
        saveProgress();
    }
}

// Главный цикл
function loop(){
    ctx.clearRect(0,0,width,height);
    drawTrack(); drawCar(); drawUI(); update();
    requestAnimationFrame(loop);
}
loop();

// Привязка кнопок улучшений
document.getElementById("engineBtn").onclick = ()=> upgradePart("engine");
document.getElementById("turboBtn").onclick = ()=> upgradePart("turbo");
document.getElementById("coolingBtn").onclick = ()=> upgradePart("cooling");
