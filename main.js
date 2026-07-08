document.addEventListener("DOMContentLoaded", () => {
  // screens
  const startScreen = document.getElementById("startScreen");
  const gameScreen = document.getElementById("gameScreen");

  // buttons
  const startBtn = document.getElementById("startBtn");
  const continueBtn = document.getElementById("continueBtn");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  const jumpBtn = document.getElementById("jumpBtn");

  // world objects
  const rose = document.getElementById("rose");
  const lumi = document.getElementById("lumi");
  const moonKey = document.getElementById("moonKey");
  const moonGate = document.getElementById("moonGate");
  const bridgeSection = document.getElementById("bridgeSection");

  // ui
  const messageBox = document.getElementById("messageBox");
  const cinematicOverlay = document.getElementById("cinematicOverlay");
  const moonKeyBox = document.getElementById("moonKeyBox");
  const progressFill = document.getElementById("progressFill");
  const gameWorld = document.getElementById("gameWorld");
  const worldInner = document.getElementById("worldInner");

  const menuStars = document.getElementById("menuStars");
  const gameStars = document.getElementById("gameStars");

  // fail-safe
  if (!startBtn || !startScreen || !gameScreen || !rose) {
    console.error("Game init failed: required elements not found.");
    return;
  }

  // ======= STAR GENERATOR =======
  function createStars(container, count) {
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      star.className = "star" + (Math.random() > 0.82 ? " big" : "");
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.animationDelay = (Math.random() * 2.5).toFixed(2) + "s";
      star.style.opacity = (0.25 + Math.random() * 0.75).toFixed(2);
      container.appendChild(star);
    }
  }

  createStars(menuStars, 55);
  createStars(gameStars, 80);

  // ======= GAME STATE =======
  const state = {
    gameStarted: false,
    roseX: 40,
    roseY: 142,
    moveDir: 0, // -1 left, 1 right
    speed: 4.5,
    isJumping: false,
    hasMoonKey: false,
    bridgePassed: false,
    keyCollected: false,
    gateReached: false,
    introShown: false,
    overlayOpen: false,
    finishedStage: false,
  };

  // ======= WORLD LIMITS =======
  function getWorldWidth() {
    return window.innerWidth;
  }

  function getGroundY() {
    return 142;
  }

  function updateRosePosition() {
    rose.style.left = `${state.roseX}px`;
    rose.style.bottom = `${state.roseY}px`;
  }

  function clampRose() {
    const maxX = getWorldWidth() - 90;
    if (state.roseX < 10) state.roseX = 10;
    if (state.roseX > maxX) state.roseX = maxX;
  }

  function setMessage(text, timeout = 2600) {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.classList.remove("hidden");

    clearTimeout(setMessage._timer);
    setMessage._timer = setTimeout(() => {
      messageBox.classList.add("hidden");
    }, timeout);
  }

  function setProgress(value) {
    const safe = Math.max(0, Math.min(100, value));
    progressFill.style.width = safe + "%";
  }

  function updateProgress() {
    const maxX = getWorldWidth() - 90;
    const percent = (state.roseX / maxX) * 100;
    setProgress(percent);
  }

  function updateMoonKeyStatus() {
    moonKeyBox.textContent = state.hasMoonKey
      ? "🗝️ کلید ماه: پیدا شد"
      : "🗝️ کلید ماه: پیدا نشده";
  }

  function faceRose(dir) {
    if (dir === -1) {
      rose.style.transform = "scaleX(-1)";
    } else if (dir === 1) {
      rose.style.transform = "scaleX(1)";
    }
  }

  // ======= GAME FLOW =======
  function startGame() {
    if (state.gameStarted) return;
    state.gameStarted = true;

    startScreen.classList.remove("active");
    gameScreen.classList.add("active");

    state.roseX = 40;
    state.roseY = getGroundY();
    updateRosePosition();
    updateProgress();
    updateMoonKeyStatus();

    setTimeout(() => {
      if (!state.introShown) {
        state.introShown = true;
        setMessage("لومی امشب راهنمای رز است... از ستاره‌ها رد شو و به کلید ماه برس ✨", 3600);
      }
    }, 450);

    gameLoop();
  }

  startBtn.addEventListener("click", startGame);

  // ======= CONTROLS =======
  function startMove(dir) {
    if (!state.gameStarted || state.overlayOpen || state.finishedStage) return;
    state.moveDir = dir;
    rose.classList.add("moving");
    faceRose(dir);
  }

  function stopMove(dir) {
    if (dir === undefined || state.moveDir === dir) {
      state.moveDir = 0;
      rose.classList.remove("moving");
    }
  }

  function jumpRose() {
    if (!state.gameStarted || state.isJumping || state.overlayOpen || state.finishedStage) return;
    state.isJumping = true;
    rose.classList.add("jump");

    // jump soundless visual
    state.roseY = getGroundY() + 70;
    updateRosePosition();

    setTimeout(() => {
      state.roseY = getGroundY();
      rose.classList.remove("jump");
      updateRosePosition();
      state.isJumping = false;
    }, 520);
  }

  // touch / mouse buttons
  if (leftBtn) {
    leftBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startMove(-1); }, { passive: false });
    leftBtn.addEventListener("touchend", (e) => { e.preventDefault(); stopMove(-1); }, { passive: false });
    leftBtn.addEventListener("mousedown", () => startMove(-1));
    leftBtn.addEventListener("mouseup", () => stopMove(-1));
    leftBtn.addEventListener("mouseleave", () => stopMove(-1));
  }

  if (rightBtn) {
    rightBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startMove(1); }, { passive: false });
    rightBtn.addEventListener("touchend", (e) => { e.preventDefault(); stopMove(1); }, { passive: false });
    rightBtn.addEventListener("mousedown", () => startMove(1));
    rightBtn.addEventListener("mouseup", () => stopMove(1));
    rightBtn.addEventListener("mouseleave", () => stopMove(1));
  }

  if (jumpBtn) {
    jumpBtn.addEventListener("touchstart", (e) => { e.preventDefault(); jumpRose(); }, { passive: false });
    jumpBtn.addEventListener("click", jumpRose);
  }

  // keyboard support too
  document.addEventListener("keydown", (e) => {
    if (!state.gameStarted || state.overlayOpen || state.finishedStage) return;
    if (e.key === "ArrowRight") startMove(1);
    if (e.key === "ArrowLeft") startMove(-1);
    if (e.key === "ArrowUp" || e.key === " ") jumpRose();
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight") stopMove(1);
    if (e.key === "ArrowLeft") stopMove(-1);
  });

  // ======= COLLISION HELPERS =======
  function getRoseCenterX() {
    return state.roseX + 44;
  }

  function isNearElement(el, threshold = 50) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const x = getRoseCenterX();
    return x >= rect.left - threshold && x <= rect.right + threshold;
  }

  function getBridgeBounds() {
    if (!bridgeSection) return null;
    const rect = bridgeSection.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width
    };
  }

  function checkBridgeEvent() {
    if (state.bridgePassed) return;

    const b = getBridgeBounds();
    if (!b) return;

    const roseX = getRoseCenterX();

    // bridge zone reached
    if (roseX > b.left && roseX < b.right) {
      // broken middle zone
      const gapStart = b.left + b.width * 0.38;
      const gapEnd = b.left + b.width * 0.53;

      if (roseX >= gapStart && roseX <= gapEnd) {
        if (!state.isJumping) {
          // fail effect but not hard fail
          worldInner.classList.add("shake");
          setTimeout(() => worldInner.classList.remove("shake"), 350);

          setMessage("پل شکسته است! باید با پرش از قسمت خراب رد شوی ⚠️", 2000);

          // push back a bit
          state.roseX -= 24;
          clampRose();
          updateRosePosition();
        } else {
          state.bridgePassed = true;
          setMessage("آفرین... رز از پل شکسته عبور کرد 🌙", 2200);
        }
      }
    }
  }

  function checkLumiHints() {
    const x = getRoseCenterX();

    if (x > 130 && x < 180) {
      lumi.style.transform = "translateY(-10px) scale(1.05)";
    } else {
      lumi.style.transform = "";
    }

    if (x > window.innerWidth * 0.28 && x < window.innerWidth * 0.34) {
      setMessageOnce("hint-stars", "لومی: رد ستاره‌ها را دنبال کن... کلید ماه نزدیک‌تر از چیزی‌ست که فکر می‌کنی ✨", 3000);
    }

    if (x > window.innerWidth * 0.52 && x < window.innerWidth * 0.60 && !state.bridgePassed) {
      setMessageOnce("hint-bridge", "لومی: از قسمت شکسته‌ی پل باید بپری، وگرنه رز رد نمی‌شود 🦉", 3000);
    }
  }

  const shownMessages = {};
  function setMessageOnce(key, text, timeout = 2400) {
    if (shownMessages[key]) return;
    shownMessages[key] = true;
    setMessage(text, timeout);
  }

  function checkMoonKeyPickup() {
    if (state.keyCollected || !moonKey) return;

    const rect = moonKey.getBoundingClientRect();
    const x = getRoseCenterX();
    const roseBottom = window.innerHeight - state.roseY;

    // نزدیک بودن افقی + رز در حال پرش باشد
    const nearX = x > rect.left - 35 && x < rect.right + 35;
    const highEnough = state.isJumping || state.roseY > getGroundY() + 20;

    if (nearX && highEnough) {
      state.keyCollected = true;
      state.hasMoonKey = true;
      moonKey.classList.add("fade-out");
      updateMoonKeyStatus();

      gameWorld.classList.add("flash");
      setTimeout(() => gameWorld.classList.remove("flash"), 400);

      setMessage("کلید ماه پیدا شد! حالا به دروازه‌ی ماه برگرد ✨🗝️", 3000);
    }
  }

  function checkGateReach() {
    if (!state.hasMoonKey || state.finishedStage || !moonGate) return;

    if (isNearElement(moonGate, 55)) {
      state.finishedStage = true;
      state.overlayOpen = true;
      cinematicOverlay.classList.remove("hidden");
      setProgress(100);
      setMessage("دروازه بیدار شد...", 1200);
      rose.classList.remove("moving");
      state.moveDir = 0;
    }
  }

  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      cinematicOverlay.classList.add("hidden");
      state.overlayOpen = false;

      setMessage("مرحله ۱ تمام شد 🌙✨\nمرحله‌ی بعدی: صندوق اسرار و سؤال‌ها", 3200);

      // خاموش شدن دکمه‌ها و قفل پایان این مرحله
      const controls = document.getElementById("controls");
      if (controls) controls.classList.add("fade-out");
    });
  }

  // ======= GAME LOOP =======
  let loopStarted = false;
  function gameLoop() {
    if (loopStarted) return;
    loopStarted = true;

    function frame() {
      if (state.gameStarted) {
        if (!state.overlayOpen && !state.finishedStage) {
          if (state.moveDir !== 0) {
            state.roseX += state.moveDir * state.speed;
            clampRose();
            updateRosePosition();
            updateProgress();
          }

          checkBridgeEvent();
          checkLumiHints();
          checkMoonKeyPickup();
          checkGateReach();
        }
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  // ======= RESIZE =======
  window.addEventListener("resize", () => {
    clampRose();
    updateRosePosition();
    updateProgress();
  });
});
