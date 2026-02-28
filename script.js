// Получаем canvas из HTML
const canvas = document.getElementById("gameCanvas");

// Получаем 2D-контекст для рисования
const ctx = canvas.getContext("2d");

// Счётчик кругов
let laps = 0;

// Предыдущий угол (для определения пересечения финиша)
let prevAngle = 0;

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
  width = window.innerWidth;   // ширина окна
  height = window.innerHeight; // высота окна

  canvas.width = width;   // устанавливаем ширину canvas
  canvas.height = height; // устанавливаем высоту canvas

  // Размер трассы относительно экрана
  outerX = width * 0.09;
  outerY = height * 0.30;

  // Внутренний овал меньше внешнего
  innerX = outerX * 0.6;
  innerY = outerY * 0.6;

  // Центр трассы (сдвиг от левого нижнего угла)
  centerX = outerX + 40;
  centerY = height - outerY - 40;
}

// Отслеживание изменения размера окна
window.addEventListener("resize", resize);

// Первичный вызов
resize();


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


// Обновление логики
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

  drawTrack();
  drawFinishLine();
  drawCar();
  drawLapCounter();
  drawSpeedometer();
  update();

  requestAnimationFrame(loop);
}

// Запуск анимации
loop();
