document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("startScreen");
  const stage1 = document.getElementById("stage1");
  const startBtn = document.getElementById("startBtn");

  const player = document.getElementById("player");
  const owl = document.getElementById("owl");
  const moonKey = document.getElementById("moonKey");
  const moonGate = document.getElementById("moonGate");
  const gateState = document.getElementById("gateState");

  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  const jumpBtn = document.getElementById("jumpBtn");

  const progressBar = document.getElementById("progressBar");
  const keyStatus = document.getElementById("keyStatus");
  const messageBox = document.getElementById("messageBox");
  const gameArea = document.getElementById("gameArea");

  if (
    !startScreen || !stage1 || !startBtn || !player || !owl ||
    !moonKey || !moonGate || !leftBtn || !rightBtn || !jumpBtn ||
    !progressBar || !keyStatus || !messageBox || !gameArea
  ) {
    console.error("Some required elements are missing.");
    return;
  }

  const state = {
    started: false,
    canMove: false,
    movingLeft: false,
    movingRight: false,
    jumping: false,
    velocityY: 0,
    gravity: 0.6,
    jumpPower: 12,
    playerX: 52,
    playerY: 0,
    moveSpeed: 4.5,
    hasKey: false,
    finished: false,
    owlBaseX: 46
  };

  const WORLD_WIDTH = 900;
  const PLAYER_WIDTH = 76;
  const GROUND_Y = 140; // از CSS

  function showMessage(text, duration = 2400) {
    messageBox.textContent = text;
    messageBox.classList.remove("hidden");
    clearTimeout(showMessage._t);
    showMessage._t = setTimeout(() => {
      messageBox.classList.add("hidden");
    }, duration);
  }

  function updateProgress(percent) {
    progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }

  function setKeyFound(found) {
    if (found) {
      keyStatus.textContent = "🗝️ کلید ماه: پیدا شد";
    } else {
      keyStatus.textContent = "🗝️ کلید ماه: پیدا نشده";
    }
  }

  function setPlayerPosition() {
    player.style.left = `${state.playerX}px`;
    player.style.bottom = `${GROUND_Y + state.playerY}px`;
  }

  function startGame() {
    if (state.started) return;
    state.started = true;

    startScreen.classList.remove("active");
    stage1.classList.add("active");

    setTimeout(() => {
      stage1.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    setTimeout(() => {
      state.canMove = true;
      updateProgress(8);
      showMessage("مرحله ۱ شروع شد ✨ رز باید ستاره‌ها را دنبال کند و کلید ماه را پیدا کند.");
    }, 500);
  }

  startBtn.addEventListener("click", startGame);
  startBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startGame();
  }, { passive: false });

  function pressLeft() {
    if (!state.canMove || state.finished) return;
    state.movingLeft = true;
  }

  function releaseLeft() {
    state.movingLeft = false;
  }

  function pressRight() {
    if (!state.canMove || state.finished) return;
    state.movingRight = true;
  }

  function releaseRight() {
    state.movingRight = false;
  }

  function jump() {
    if (!state.canMove || state.finished) return;
    if (state.jumping) return;
    state.jumping = true;
    state.velocityY = state.jumpPower;
  }

  function bindHold(btn, onStart, onEnd) {
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      onStart();
    }, { passive: false });

    btn.addEventListener("touchend", (e) => {
      e.preventDefault();
      onEnd();
    }, { passive: false });

    btn.addEventListener("touchcancel", (e) => {
      e.preventDefault();
      onEnd();
    }, { passive: false });

    btn.addEventListener("mousedown", onStart);
    btn.addEventListener("mouseup", onEnd);
    btn.addEventListener("mouseleave", onEnd);
  }

  bindHold(leftBtn, pressLeft, releaseLeft);
  bindHold(rightBtn, pressRight, releaseRight);

  jumpBtn.addEventListener("click", jump);
  jumpBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    jump();
  }, { passive: false });

  window.addEventListener("keydown", (e) => {
    if (!state.canMove || state.finished) return;
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") pressLeft();
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") pressRight();
    if (e.key === "ArrowUp" || e.key === " " || e.key.toLowerCase() === "w") jump();
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") releaseLeft();
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") releaseRight();
  });

  function getElRect(el) {
    return {
      left: parseFloat(el.style.left || el.offsetLeft),
      bottom: parseFloat(el.style.bottom || el.offsetTop),
      width: el.offsetWidth,
      height: el.offsetHeight
    };
  }

  function checkKeyPickup() {
    if (state.hasKey) return;

    const playerRect = player.getBoundingClientRect();
    const keyRect = moonKey.getBoundingClientRect();

    const overlapX = playerRect.right > keyRect.left && playerRect.left < keyRect.right;
    const overlapY = playerRect.bottom > keyRect.top && playerRect.top < keyRect.bottom;

    if (overlapX && overlapY) {
      state.hasKey = true;
      moonKey.style.display = "none";
      setKeyFound(true);
      updateProgress(72);
      showMessage("کلید ماه پیدا شد 🔑 حالا برو سمت دروازه ماه.");
    }
  }

  function checkGate() {
    if (!state.hasKey || state.finished) return;

    const playerRect = player.getBoundingClientRect();
    const gateRect = moonGate.getBoundingClientRect();

    const overlapX = playerRect.right > gateRect.left && playerRect.left < gateRect.right;
    const overlapY = playerRect.bottom > gateRect.top && playerRect.top < gateRect.bottom;

    if (overlapX && overlapY) {
      finishStage();
    }
  }

  function finishStage() {
    state.finished = true;
    state.canMove = false;
    state.movingLeft = false;
    state.movingRight = false;

    moonGate.classList.add("open");
    gateState.textContent = "باز شد";
    updateProgress(100);

    leftBtn.style.opacity = "0";
    rightBtn.style.opacity = "0";
    jumpBtn.style.opacity = "0";
    leftBtn.disabled = true;
    rightBtn.disabled = true;
    jumpBtn.disabled = true;

    showMessage("مرحله ۱ کامل شد 🌙 رز وارد دروازه ماه شد.", 3200);
  }

  function updateOwl(time) {
    const floatY = Math.sin(time / 450) * 10;
    const floatX = Math.sin(time / 1000) * 18;
    owl.style.left = `${Math.max(60, Math.min(WORLD_WIDTH - 140, state.playerX + 120 + floatX))}px`;
    owl.style.top = `${165 + floatY}px`;
  }

  function updateMovement() {
    if (state.canMove && !state.finished) {
      if (state.movingLeft) {
        state.playerX -= state.moveSpeed;
      }
      if (state.movingRight) {
        state.playerX += state.moveSpeed;
      }

      state.playerX = Math.max(0, Math.min(WORLD_WIDTH - PLAYER_WIDTH, state.playerX));
    }

    if (state.jumping) {
      state.playerY += state.velocityY;
      state.velocityY -= state.gravity;

      if (state.playerY <= 0) {
        state.playerY = 0;
        state.velocityY = 0;
        state.jumping = false;
      }
    }

    setPlayerPosition();

    const progress = Math.min(60, Math.floor((state.playerX / (WORLD_WIDTH - PLAYER_WIDTH)) * 60));
    if (!state.hasKey) updateProgress(Math.max(progress, 8));

    if (state.playerX > 180 && state.playerX < 260) {
      // فقط یک hint ساده
    }
  }

  function gameLoop(time = 0) {
    updateMovement();
    updateOwl(time);
    checkKeyPickup();
    checkGate();
    requestAnimationFrame(gameLoop);
  }

  setPlayerPosition();
  setKeyFound(false);
  updateProgress(0);
  requestAnimationFrame(gameLoop);
});
