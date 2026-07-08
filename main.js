/* =========================================================
   Journey to the Secret Lily - Stage 1
   FILE 3 / main.js
   نسخه نهایی مرحله اول
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // Elements
  // -----------------------------
  const introSection = document.getElementById("introSection");
  const stage1Section = document.getElementById("stage1Section");
  const startBtn = document.getElementById("startJourneyBtn");

  const player = document.getElementById("player");
  const playerWrap = document.getElementById("playerWrap");
  const owl = document.getElementById("owlLumi");
  const key = document.getElementById("moonKey");
  const door = document.getElementById("moonGate");
  const moonGateText = document.getElementById("moonGateText");

  const leftBtn = document.getElementById("moveLeftBtn");
  const jumpBtn = document.getElementById("jumpBtn");
  const rightBtn = document.getElementById("moveRightBtn");

  const progressFill = document.getElementById("stageProgressFill");
  const progressText = document.getElementById("stageProgressText");
  const keyStatus = document.getElementById("keyStatusText");

  const overlay = document.getElementById("messageOverlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const overlayBtn = document.getElementById("overlayBtn");

  // اگر هر کدوم از المنت‌های مهم نبود، کد اجرا نشه
  if (
    !introSection ||
    !stage1Section ||
    !startBtn ||
    !playerWrap ||
    !player ||
    !owl ||
    !key ||
    !door ||
    !leftBtn ||
    !jumpBtn ||
    !rightBtn
  ) {
    console.error("Some required elements are missing in HTML.");
    return;
  }

  // -----------------------------
  // Game State
  // -----------------------------
  const game = {
    started: false,
    introHidden: false,
    completed: false,
    hasKey: false,
    canMove: false,
    movingLeft: false,
    movingRight: false,
    isJumping: false,

    worldWidth: 2200, // باید با CSS هماهنگ باشد
    playerX: 80,
    groundY: 0,
    velocityY: 0,
    gravity: 0.55,
    jumpPower: -12.5,
    moveSpeed: 4.2,

    keyX: 1500,
    doorX: 1870,
    owlBaseX: 620,

    lastDirection: "right"
  };

  // -----------------------------
  // Helpers
  // -----------------------------
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function isMobileView() {
    return window.innerWidth <= 900;
  }

  function updatePlayerDirection() {
    if (game.lastDirection === "left") {
      playerWrap.classList.add("facing-left");
    } else {
      playerWrap.classList.remove("facing-left");
    }
  }

  function setPlayerX(x) {
    game.playerX = clamp(x, 0, game.worldWidth - 90);
    playerWrap.style.left = `${game.playerX}px`;
  }

  function updateProgress(value, label) {
    const safeValue = clamp(value, 0, 100);
    if (progressFill) progressFill.style.width = `${safeValue}%`;
    if (progressText && label) progressText.textContent = label;
  }

  function setKeyStatus(found) {
    if (!keyStatus) return;
    if (found) {
      keyStatus.textContent = "🔑 کلید ماه: پیدا شد";
      keyStatus.classList.add("found");
    } else {
      keyStatus.textContent = "🔑 کلید ماه: پیدا نشده";
      keyStatus.classList.remove("found");
    }
  }

  function showOverlay(title, text, buttonText = "ادامه") {
    if (!overlay) return;
    overlayTitle.textContent = title || "";
    overlayText.textContent = text || "";
    overlayBtn.textContent = buttonText;
    overlay.classList.add("show");
  }

  function hideOverlay() {
    if (!overlay) return;
    overlay.classList.remove("show");
  }

  function smoothScrollToStage() {
    stage1Section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // -----------------------------
  // Intro -> Stage transition
  // -----------------------------
  function startJourney() {
    if (game.started) return;
    game.started = true;

    introSection.classList.add("hide-intro");
    game.introHidden = true;

    setTimeout(() => {
      smoothScrollToStage();
    }, 250);

    setTimeout(() => {
      stage1Section.classList.add("stage-active");
      game.canMove = true;

      updateProgress(8, "پیشروی رز");
      showOverlay(
        "مرحله ۱ شروع شد ✨",
        "رز وارد مسیر ستاره‌ها شده. لومی نزدیکت پرواز می‌کنه. باید از پل شکسته رد شی و کلید ماه رو پیدا کنی.",
        "بزن بریم"
      );
    }, 500);
  }

  startBtn.addEventListener("click", startJourney);
  startBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startJourney();
  }, { passive: false });

  overlayBtn?.addEventListener("click", hideOverlay);

  // -----------------------------
  // Controls
  // -----------------------------
  function pressLeft() {
    if (!game.canMove || game.completed) return;
    game.movingLeft = true;
    game.lastDirection = "left";
    updatePlayerDirection();
  }

  function releaseLeft() {
    game.movingLeft = false;
  }

  function pressRight() {
    if (!game.canMove || game.completed) return;
    game.movingRight = true;
    game.lastDirection = "right";
    updatePlayerDirection();
  }

  function releaseRight() {
    game.movingRight = false;
  }

  function jump() {
    if (!game.canMove || game.completed) return;
    if (game.isJumping) return;
    game.isJumping = true;
    game.velocityY = game.jumpPower;
    playerWrap.classList.add("jumping");
  }

  // دکمه‌های لمسی/کلیکی
  function bindHoldButton(el, onStart, onEnd) {
    if (!el) return;

    const start = (e) => {
      e.preventDefault();
      onStart();
    };

    const end = (e) => {
      e.preventDefault();
      onEnd();
    };

    el.addEventListener("touchstart", start, { passive: false });
    el.addEventListener("touchend", end, { passive: false });
    el.addEventListener("touchcancel", end, { passive: false });

    el.addEventListener("mousedown", start);
    el.addEventListener("mouseup", end);
    el.addEventListener("mouseleave", end);

    // برای کلیک ساده هم
    el.addEventListener("click", (e) => e.preventDefault());
  }

  bindHoldButton(leftBtn, pressLeft, releaseLeft);
  bindHoldButton(rightBtn, pressRight, releaseRight);

  if (jumpBtn) {
    const jumpHandler = (e) => {
      e.preventDefault();
      jump();
    };
    jumpBtn.addEventListener("touchstart", jumpHandler, { passive: false });
    jumpBtn.addEventListener("click", jumpHandler);
  }

  // کیبورد برای تست دسکتاپ
  window.addEventListener("keydown", (e) => {
    if (!game.canMove || game.completed) return;

    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      pressLeft();
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      pressRight();
    } else if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") {
      jump();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      releaseLeft();
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      releaseRight();
    }
  });

  // -----------------------------
  // Camera follow
  // -----------------------------
  function updateCamera() {
    if (!stage1Section) return;

    const world = document.getElementById("stageWorld");
    if (!world) return;

    const viewWidth = stage1Section.clientWidth;
    const maxScroll = Math.max(0, game.worldWidth - viewWidth);

    const target = game.playerX - viewWidth * 0.35;
    const scrollX = clamp(target, 0, maxScroll);

    stage1Section.scrollLeft = scrollX;
  }

  // -----------------------------
  // Physics & world logic
  // -----------------------------
  function updateMovement() {
    if (!game.canMove || game.completed) return;

    let dx = 0;
    if (game.movingLeft) dx -= game.moveSpeed;
    if (game.movingRight) dx += game.moveSpeed;

    if (dx !== 0) {
      setPlayerX(game.playerX + dx);
    }

    // Jump physics
    if (game.isJumping) {
      game.velocityY += game.gravity;

      const currentBottom = parseFloat(playerWrap.dataset.jumpY || "0");
      let nextBottom = currentBottom - game.velocityY;

      if (nextBottom < 0) nextBottom = 0;

      if (game.velocityY >= 0 && nextBottom <= 0) {
        nextBottom = 0;
        game.isJumping = false;
        game.velocityY = 0;
        playerWrap.classList.remove("jumping");
      }

      playerWrap.dataset.jumpY = String(nextBottom);
      playerWrap.style.transform = `translateY(${-nextBottom}px)`;
    } else {
      playerWrap.dataset.jumpY = "0";
      playerWrap.style.transform = "translateY(0px)";
    }
  }

  // -----------------------------
  // Owl / Lumi movement
  // -----------------------------
  function updateOwl(time) {
    if (!owl) return;

    const bob = Math.sin(time / 500) * 10;
    const drift = Math.sin(time / 1400) * 24;

    // لومی کمی جلوتر از رز حرکت کند
    const followX = clamp(game.playerX + 120, 120, game.worldWidth - 200);
    const finalX = (followX * 0.55) + (game.owlBaseX * 0.45) + drift;

    owl.style.left = `${finalX}px`;
    owl.style.top = `${150 + bob}px`;
  }

  // -----------------------------
  // Interactions
  // -----------------------------
  function getRect(el) {
    return {
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
      right: el.offsetLeft + el.offsetWidth,
      bottom: el.offsetTop + el.offsetHeight
    };
  }

  function checkKeyPickup() {
    if (game.hasKey || !key) return;

    const playerRect = getRect(playerWrap);
    const keyRect = getRect(key);

    const nearX = Math.abs((playerRect.left + 30) - keyRect.left) < 80;

    if (nearX) {
      game.hasKey = true;
      key.classList.add("collected");
      setKeyStatus(true);
      updateProgress(68, "کلید ماه پیدا شد");
      showOverlay(
        "کلید ماه پیدا شد 🔑",
        "عالیه. حالا باید رز رو تا دروازه‌ی ماه ببری تا مسیر مرحله‌ی بعد باز بشه.",
        "ادامه"
      );
    }
  }

  function checkDoor() {
    if (!game.hasKey || game.completed || !door) return;

    const playerRect = getRect(playerWrap);
    const doorRect = getRect(door);

    const nearDoor = Math.abs((playerRect.left + 20) - doorRect.left) < 95;

    if (nearDoor) {
      finishStage();
    }
  }

  function finishStage() {
    game.completed = true;
    game.canMove = false;
    game.movingLeft = false;
    game.movingRight = false;

    updateProgress(100, "مرحله ۱ کامل شد");
    door.classList.add("opened");
    moonGateText && (moonGateText.textContent = "دروازه ماه باز شد");

    // دکمه‌ها از کار بیفتن و محو شن
    const controls = document.getElementById("mobileControls");
    if (controls) {
      controls.classList.add("disabled-fade");
    }

    // حرکت خودکار رز به سمت دروازه
    const autoWalk = () => {
      const targetX = game.doorX + 25;
      if (game.playerX < targetX) {
        game.lastDirection = "right";
        updatePlayerDirection();
        setPlayerX(game.playerX + 1.8);
        updateCamera();
        requestAnimationFrame(autoWalk);
      } else {
        playerWrap.classList.add("fade-out");
        setTimeout(() => {
          showOverlay(
            "مرحله ۱ تموم شد 🌙",
            "رز از دروازه‌ی ماه عبور کرد و وارد بخش بعدی سفر می‌شه. مرحله‌ی بعدی: سؤال‌های رازآلود 💜",
            "بریم مرحله بعد"
          );
        }, 700);
      }
    };

    setTimeout(autoWalk, 300);
  }

  // -----------------------------
  // Stage events by progress
  // -----------------------------
  let hint1Shown = false;
  let hint2Shown = false;

  function updateStoryHints() {
    if (!game.started || game.completed) return;

    if (game.playerX > 350 && !hint1Shown) {
      hint1Shown = true;
      updateProgress(22, "رز وارد مسیر ستاره‌ها شد");
      showOverlay(
        "لومی ظاهر شد 🦉",
        "لومی از بالای مسیر مراقب رزّه. از نورها و ستاره‌ها رد شو و به سمت کلید ماه برو.",
        "باشه"
      );
    }

    if (game.playerX > 980 && !hint2Shown) {
      hint2Shown = true;
      updateProgress(45, "نزدیک کلید ماه");
      showOverlay(
        "نزدیکیِ کلید ✨",
        "کلید ماه خیلی دور نیست. ادامه بده و تا انتهای این بخش برو.",
        "ادامه"
      );
    }
  }

  // -----------------------------
  // Main loop
  // -----------------------------
  function gameLoop(time = 0) {
    updateMovement();
    updateOwl(time);
    updateCamera();
    updateStoryHints();
    checkKeyPickup();
    checkDoor();

    requestAnimationFrame(gameLoop);
  }

  // -----------------------------
  // Init
  // -----------------------------
  function init() {
    setPlayerX(game.playerX);
    setKeyStatus(false);
    updateProgress(0, "پیشروی رز");
    updatePlayerDirection();

    // جای کلید و دروازه و لومی
    key.style.left = `${game.keyX}px`;
    door.style.left = `${game.doorX}px`;
    owl.style.left = `${game.owlBaseX}px`;

    // کنترل اسکرول افقی stage
    stage1Section.scrollLeft = 0;

    requestAnimationFrame(gameLoop);
  }

  init();

  // -----------------------------
  // Resize fix
  // -----------------------------
  window.addEventListener("resize", () => {
    updateCamera();
  });
});
