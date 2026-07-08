const homeScreen = document.getElementById("homeScreen");
const stage1Screen = document.getElementById("stage1Screen");

const startBtn = document.getElementById("startBtn");

const rose = document.getElementById("rose");
const moonKey = document.getElementById("moonKey");
const moonGate = document.getElementById("moonGate");
const gateText = document.getElementById("gateText");
const keyStatus = document.getElementById("keyStatus");
const progressBar = document.getElementById("progressBar");
const stageMessage = document.getElementById("stageMessage");
const stageComplete = document.getElementById("stageComplete");
const controls = document.getElementById("controls");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const jumpBtn = document.getElementById("jumpBtn");

let roseX = 48;            // از راست
let isMoving = false;
let hasKey = false;
let isJumping = false;
let stageFinished = false;

const RIGHT_LIMIT = 82;    // درصد تقریبی حرکت به سمت چپ صفحه
const LEFT_LIMIT = 2;

function setRosePosition() {
  rose.style.right = `${roseX}px`;
}

function updateProgress() {
  let progress = 10;

  if (roseX > 120) progress = 22;
  if (roseX > 220) progress = 38;
  if (roseX > 310) progress = 52;
  if (roseX > 420) progress = 66;
  if (hasKey) progress = 88;
  if (stageFinished) progress = 100;

  progressBar.style.width = `${progress}%`;
}

function startWalkAnim() {
  rose.classList.add("walk");
}
function stopWalkAnim() {
  rose.classList.remove("walk");
}

function moveRose(dir) {
  if (stageFinished) return;

  const step = 22;

  startWalkAnim();

  if (dir === "left") {
    roseX += step;
  } else if (dir === "right") {
    roseX -= step;
  }

  // محدودیت
  if (roseX < LEFT_LIMIT) roseX = LEFT_LIMIT;
  if (roseX > 520) roseX = 520;

  setRosePosition();
  updateProgress();
  checkKeyPickup();
  checkGateFinish();

  clearTimeout(window.__walkTimeout);
  window.__walkTimeout = setTimeout(() => {
    stopWalkAnim();
  }, 180);
}

function jumpRose() {
  if (stageFinished || isJumping) return;
  isJumping = true;
  rose.classList.add("jump");

  setTimeout(() => {
    rose.classList.remove("jump");
    isJumping = false;
    checkKeyPickup(true);
  }, 520);
}

function getRect(el) {
  return el.getBoundingClientRect();
}

function intersects(a, b) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

function checkKeyPickup(force = false) {
  if (hasKey) return;

  const roseRect = getRect(rose);
  const keyRect = getRect(moonKey);

  if (intersects(roseRect, keyRect) || force) {
    // برای اینکه خیلی سخت نشه، اگر رز به محدوده کلید نزدیک شد بگیر
    const roseCenter = roseRect.left + roseRect.width / 2;
    const keyCenter = keyRect.left + keyRect.width / 2;
    const diff = Math.abs(roseCenter - keyCenter);

    if (diff < 120 || force) {
      hasKey = true;
      moonKey.classList.add("collected");
      keyStatus.textContent = "🗝️ کلید ماه: پیدا شد";
      gateText.textContent = "دروازه ماه باز شد";
      moonGate.classList.add("open");
      stageMessage.textContent = "کلید ماه پیدا شد. حالا رز را تا دروازه ماه ببر 🌙";
      updateProgress();
    }
  }
}

function checkGateFinish() {
  if (!hasKey || stageFinished) return;

  const roseRect = getRect(rose);
  const gateRect = getRect(moonGate);

  if (intersects(roseRect, gateRect)) {
    finishStage();
  }
}

function finishStage() {
  if (stageFinished) return;
  stageFinished = true;

  updateProgress();
  stageMessage.textContent = "دروازه باز شد... رز وارد مرحله‌ی بعدی می‌شود";
  controls.classList.add("disabled");

  setTimeout(() => {
    stageComplete.classList.remove("hidden");
  }, 700);
}

/* =========================
   شروع بازی
========================= */
startBtn.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  stage1Screen.classList.remove("hidden");
  stage1Screen.classList.add("active");

  // اسکرول بره روی مرحله
  setTimeout(() => {
    stage1Screen.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 60);

  updateProgress();
});

/* =========================
   کنترل‌ها
========================= */
leftBtn.addEventListener("click", () => moveRose("left"));
rightBtn.addEventListener("click", () => moveRose("right"));
jumpBtn.addEventListener("click", jumpRose);

/* =========================
   نگه‌داشتن دکمه برای حرکت
========================= */
let holdInterval = null;

function startHold(dir) {
  if (stageFinished) return;
  moveRose(dir);
  holdInterval = setInterval(() => moveRose(dir), 120);
}

function stopHold() {
  clearInterval(holdInterval);
  holdInterval = null;
}

["touchstart", "mousedown"].forEach(evt => {
  leftBtn.addEventListener(evt, e => {
    e.preventDefault();
    startHold("left");
  }, { passive:false });

  rightBtn.addEventListener(evt, e => {
    e.preventDefault();
    startHold("right");
  }, { passive:false });

  jumpBtn.addEventListener(evt, e => {
    e.preventDefault();
    jumpRose();
  }, { passive:false });
});

["touchend", "touchcancel", "mouseup", "mouseleave"].forEach(evt => {
  leftBtn.addEventListener(evt, stopHold);
  rightBtn.addEventListener(evt, stopHold);
});

/* =========================
   شروع اولیه
========================= */
setRosePosition();
updateProgress();
