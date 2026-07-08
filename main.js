// ======================
// ستاره‌های پس‌زمینه
// ======================
const globalStars = document.getElementById("globalStars");

for (let i = 0; i < 65; i++) {
  const s = document.createElement("span");
  s.className = "star";
  s.style.left = Math.random() * 100 + "%";
  s.style.top = Math.random() * 100 + "%";
  s.style.animationDelay = (Math.random() * 2.5) + "s";
  s.style.opacity = (0.35 + Math.random() * 0.7).toFixed(2);
  const size = 2 + Math.random() * 4;
  s.style.width = size + "px";
  s.style.height = size + "px";
  globalStars.appendChild(s);
}

// ======================
// المان‌ها
// ======================
const intro = document.getElementById("intro");
const stage1 = document.getElementById("stage1");
const startBtn = document.getElementById("startBtn");

const player = document.getElementById("player");
const moonKey = document.getElementById("moonKey");
const moonGate = document.getElementById("moonGate");
const moonKeyStatus = document.getElementById("moonKeyStatus");
const gateLockedText = document.getElementById("gateLockedText");
const progressFill = document.getElementById("progressFill");

const moveRightBtn = document.getElementById("moveRightBtn");
const moveLeftBtn = document.getElementById("moveLeftBtn");
const jumpBtn = document.getElementById("jumpBtn");

const gameArea = document.getElementById("gameArea");

// ======================
// وضعیت بازی
// ======================
let playerX = 70;
let playerY = 0; // پرش
let velocityY = 0;
let isJumping = false;
let hasMoonKey = false;

const groundY = 0;
const moveStep = 18;
const gravity = 1.1;
const jumpPower = 17;

// محدوده‌ها
const minX = 20;
const maxX = () => gameArea.clientWidth - 110;

// محل کلید و دروازه
function getKeyX() {
  // کلید در سمت راست
  return gameArea.clientWidth - 130;
}

function getGateCenterX() {
  return (gameArea.clientWidth / 2) - 45;
}

// ======================
// شروع بازی
// ======================
startBtn.addEventListener("click", () => {
  intro.classList.add("hidden");

  setTimeout(() => {
    stage1.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 80);
});

// ======================
// آپدیت بازیکن
// ======================
function updatePlayer() {
  player.style.left = playerX + "px";
  player.style.bottom = (116 + playerY) + "px";

  // پیشرفت مرحله
  const maxProgressRange = Math.max(1, maxX() - minX);
  const progress = ((playerX - minX) / maxProgressRange) * 100;
  progressFill.style.width = Math.max(0, Math.min(100, progress)) + "%";

  checkKeyCollection();
  checkGateOpen();
}

// ======================
// گرفتن کلید
// ======================
function checkKeyCollection() {
  if (hasMoonKey) return;

  const keyX = getKeyX();

  // اگر رز به محدوده کلید رسید
  if (playerX >= keyX - 70) {
    hasMoonKey = true;
    moonKey.classList.add("collected");
    moonKeyStatus.textContent = "🗝️ کلید ماه: پیدا شد";
    moonKeyStatus.style.color = "#a9ffcf";
  }
}

// ======================
// باز شدن دروازه
// ======================
function checkGateOpen() {
  if (!hasMoonKey) return;

  const gateX = getGateCenterX();

  if (Math.abs(playerX - gateX) < 85) {
    moonGate.classList.add("open");
    gateLockedText.textContent = "باز شد ✨";
    gateLockedText.style.color = "#a9ffcf";
  }
}

// ======================
// حرکت
// ======================
function moveRight() {
  playerX += moveStep;
  if (playerX > maxX()) playerX = maxX();
  updatePlayer();
}

function moveLeft() {
  playerX -= moveStep;
  if (playerX < minX) playerX = minX;
  updatePlayer();
}

function jump() {
  if (isJumping) return;
  isJumping = true;
  velocityY = jumpPower;
}

// ======================
// فیزیک پرش
// ======================
function gameLoop() {
  if (isJumping) {
    playerY += velocityY;
    velocityY -= gravity;

    if (playerY <= groundY) {
      playerY = groundY;
      velocityY = 0;
      isJumping = false;
    }

    updatePlayer();
  }

  requestAnimationFrame(gameLoop);
}

// ======================
// رویداد دکمه‌ها
// ======================
moveRightBtn.addEventListener("click", moveRight);
moveLeftBtn.addEventListener("click", moveLeft);
jumpBtn.addEventListener("click", jump);

// لمس طولانی روی موبایل
let rightHold = null;
let leftHold = null;

function startHoldRight() {
  if (rightHold) return;
  moveRight();
  rightHold = setInterval(moveRight, 90);
}
function stopHoldRight() {
  clearInterval(rightHold);
  rightHold = null;
}

function startHoldLeft() {
  if (leftHold) return;
  moveLeft();
  leftHold = setInterval(moveLeft, 90);
}
function stopHoldLeft() {
  clearInterval(leftHold);
  leftHold = null;
}

moveRightBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startHoldRight();
}, { passive: false });

moveRightBtn.addEventListener("touchend", stopHoldRight);
moveRightBtn.addEventListener("touchcancel", stopHoldRight);

moveLeftBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startHoldLeft();
}, { passive: false });

moveLeftBtn.addEventListener("touchend", stopHoldLeft);
moveLeftBtn.addEventListener("touchcancel", stopHoldLeft);

jumpBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  jump();
}, { passive: false });

// کیبورد
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") moveRight();
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowUp" || e.key === " ") jump();
});

// ======================
// شروع اولیه
// ======================
updatePlayer();
gameLoop();
