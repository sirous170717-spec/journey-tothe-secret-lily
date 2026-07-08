// ======================================================
// Journey to the Secret Lily - Build 1 Main Stage
// Stage 1: Star Path / Broken Bridge / Moon Key / Lumi
// Pure Canvas + JS (no external library)
// ======================================================

(() => {
  // -----------------------------
  // DOM
  // -----------------------------
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const menuScreen = document.getElementById("menuScreen");
  const stageCompleteScreen = document.getElementById("stageCompleteScreen");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");

  const hud = document.getElementById("hud");
  const starCountEl = document.getElementById("starCount");
  const starTotalEl = document.getElementById("starTotal");
  const hasKeyEl = document.getElementById("hasKey");

  const dialogueBox = document.getElementById("dialogueBox");
  const dialogueText = document.getElementById("dialogueText");
  const centerMessage = document.getElementById("centerMessage");

  const mobileControls = document.getElementById("mobileControls");
  const btnLeft = document.getElementById("btnLeft");
  const btnRight = document.getElementById("btnRight");
  const btnJump = document.getElementById("btnJump");
  const btnAction = document.getElementById("btnAction");

  // -----------------------------
  // Canvas / DPR
  // -----------------------------
  let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  function resizeCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (game) {
      game.width = w;
      game.height = h;
      game.groundY = h - 130;
    }
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // -----------------------------
  // Utilities
  // -----------------------------
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => Math.random() * (b - a) + a;
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  function rectsIntersect(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function roundedRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function drawGlowCircle(x, y, r, color, alpha = 1) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace("ALPHA", alpha.toFixed(2)));
    g.addColorStop(1, color.replace("ALPHA", "0"));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function showMessage(text, duration = 2200) {
    centerMessage.textContent = text;
    centerMessage.classList.remove("hidden");
    clearTimeout(showMessage._t);
    showMessage._t = setTimeout(() => {
      centerMessage.classList.add("hidden");
    }, duration);
  }

  function showDialogue(text, duration = 2600) {
    dialogueText.textContent = text;
    dialogueBox.classList.remove("hidden");
    clearTimeout(showDialogue._t);
    showDialogue._t = setTimeout(() => {
      dialogueBox.classList.add("hidden");
    }, duration);
  }

  function hideDialogue() {
    dialogueBox.classList.add("hidden");
  }

  // -----------------------------
  // Input
  // -----------------------------
  const keys = {
    left: false,
    right: false,
    up: false,
    action: false
  };

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (["arrowleft", "a"].includes(k)) keys.left = true;
    if (["arrowright", "d"].includes(k)) keys.right = true;
    if (["arrowup", "w", " "].includes(k)) keys.up = true;
    if (["e", "enter"].includes(k)) keys.action = true;
  });

  window.addEventListener("keyup", (e) => {
    const k = e.key.toLowerCase();
    if (["arrowleft", "a"].includes(k)) keys.left = false;
    if (["arrowright", "d"].includes(k)) keys.right = false;
    if (["arrowup", "w", " "].includes(k)) keys.up = false;
    if (["e", "enter"].includes(k)) keys.action = false;
  });

  function bindHold(btn, onDown, onUp) {
    const start = (e) => {
      e.preventDefault();
      onDown();
    };
    const end = (e) => {
      e.preventDefault();
      onUp();
    };
    btn.addEventListener("touchstart", start, { passive: false });
    btn.addEventListener("touchend", end, { passive: false });
    btn.addEventListener("touchcancel", end, { passive: false });
    btn.addEventListener("mousedown", start);
    btn.addEventListener("mouseup", end);
    btn.addEventListener("mouseleave", end);
  }

  bindHold(btnLeft, () => (keys.left = true), () => (keys.left = false));
  bindHold(btnRight, () => (keys.right = true), () => (keys.right = false));
  bindHold(btnJump, () => (keys.up = true), () => (keys.up = false));
  bindHold(btnAction, () => (keys.action = true), () => (keys.action = false));

  // -----------------------------
  // Game State
  // -----------------------------
  let game = null;
  let lastTime = 0;
  let running = false;

  function createGame() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const groundY = height - 130;
    const worldWidth = 5200;

    // Ground platforms
    const platforms = [
      { x: 0, y: groundY, w: 1500, h: 200, type: "ground" },

      // Broken bridge section - before gap
      { x: 1500, y: groundY + 10, w: 280, h: 190, type: "bridge-left" },

      // gap from 1780 to 2040

      // after gap
      { x: 2040, y: groundY + 10, w: 520, h: 190, type: "bridge-right" },

      // more ground
      { x: 2560, y: groundY, w: 2640, h: 200, type: "ground" },

      // small floating decorative ledges
      { x: 1100, y: groundY - 120, w: 130, h: 18, type: "ledge" },
      { x: 2860, y: groundY - 110, w: 130, h: 18, type: "ledge" }
    ];

    const stars = [
      { x: 920, y: groundY - 120, r: 18, collected: false, id: "star-1" },
      { x: 2360, y: groundY - 150, r: 18, collected: false, id: "star-2" },
      { x: 3650, y: groundY - 140, r: 18, collected: false, id: "star-3" }
    ];

    const moonKey = {
      x: 4450,
      y: groundY - 70,
      w: 40,
      h: 40,
      collected: false
    };

    const exitGate = {
      x: 4900,
      y: groundY - 120,
      w: 120,
      h: 160,
      active: false
    };

    const bridgeGap = { x1: 1780, x2: 2040 };

    const owlPoints = [
      { x: 260, y: groundY - 210, text: "رز... نور ستاره‌ها رو دنبال کن ✨" },
      { x: 980, y: groundY - 210, text: "اولین ستاره نزدیکه. حسش کن..." },
      { x: 1660, y: groundY - 230, text: "آروم‌تر... جلوتر پل شکسته‌ست 🦉" },
      { x: 2360, y: groundY - 230, text: "خوبه... از خطر رد شدی." },
      { x: 3650, y: groundY - 220, text: "رز... ماه به کلیدش نزدیکه 🌙" },
      { x: 4470, y: groundY - 230, text: "کلید ماه اینجاست. برش دار." },
      { x: 4920, y: groundY - 230, text: "دروازه باز شده... برو جلو." }
    ];

    const decorativeTrees = [];
    for (let i = 0; i < 30; i++) {
      const x = i * 190 + rand(-40, 60);
      decorativeTrees.push({
        x,
        y: groundY,
        h: rand(120, 260),
        layer: Math.random() > 0.5 ? 1 : 2
      });
    }

    const floatingDust = [];
    for (let i = 0; i < 120; i++) {
      floatingDust.push({
        x: rand(0, worldWidth),
        y: rand(0, height * 0.9),
        r: rand(1, 3),
        s: rand(0.2, 0.8),
        a: rand(0.25, 0.9)
      });
    }

    const player = {
      x: 120,
      y: groundY - 82,
      w: 46,
      h: 82,
      vx: 0,
      vy: 0,
      speed: 360,
      jumpPower: 760,
      gravity: 1800,
      onGround: false,
      facing: 1,
      moveTime: 0,
      controlsEnabled: true,
      autoMove: false,
      targetX: 0,
      alpha: 1
    };

    const owl = {
      x: 230,
      y: groundY - 210,
      bob: 0,
      pointIndex: 0,
      shown: new Set()
    };

    return {
      width,
      height,
      worldWidth,
      groundY,
      platforms,
      stars,
      moonKey,
      exitGate,
      bridgeGap,
      player,
      owl,
      owlPoints,
      decorativeTrees,
      floatingDust,
      cameraX: 0,
      stage: "menu", // menu | playing | complete
      stageStarted: false,
      starCount: 0,
      starTotal: stars.length,
      hasMoonKey: false,
      actionLatch: false,
      stageCompleted: false,
      endingCutsceneReady: false
    };
  }

  // -----------------------------
  // Start / Reset
  // -----------------------------
  function startStage() {
    game = createGame();
    game.stage = "playing";
    game.stageStarted = true;
    game.stageCompleted = false;

    menuScreen.classList.add("hidden");
    stageCompleteScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    mobileControls.classList.remove("hidden");
    mobileControls.classList.remove("hidden-controls");

    updateHUD();

    showDialogue("رز... امشب مسیرت با ستاره‌ها روشن می‌شه. من کنارتم.", 3200);
    showMessage("با دکمه‌ها حرکت کن • ستاره‌ها را جمع کن • کلید ماه را پیدا کن", 2800);

    if (!running) {
      running = true;
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }

  function backToMenu() {
    if (!game) return;
    game.stage = "menu";
    menuScreen.classList.remove("hidden");
    stageCompleteScreen.classList.add("hidden");
    hud.classList.add("hidden");
    mobileControls.classList.add("hidden");
  }

  startBtn.addEventListener("click", startStage);
  restartBtn.addEventListener("click", startStage);

  // -----------------------------
  // HUD
  // -----------------------------
  function updateHUD() {
    if (!game) return;
    starCountEl.textContent = String(game.starCount);
    starTotalEl.textContent = String(game.starTotal);
    hasKeyEl.textContent = game.hasMoonKey ? "دارد" : "ندارد";
  }

  // -----------------------------
  // Physics
  // -----------------------------
  function updatePlayer(dt) {
    const p = game.player;
    if (!p.controlsEnabled && !p.autoMove) return;

    if (p.autoMove) {
      // future cutscene structure
      const dir = Math.sign(p.targetX - p.x);
      p.vx = dir * 120;
      if (Math.abs(p.targetX - p.x) < 6) {
        p.vx = 0;
        p.autoMove = false;
      }
    } else if (p.controlsEnabled) {
      let move = 0;
      if (keys.left) move -= 1;
      if (keys.right) move += 1;

      p.vx = move * p.speed;
      if (move !== 0) {
        p.facing = move > 0 ? 1 : -1;
        p.moveTime += dt;
      } else {
        p.moveTime = 0;
      }

      if (keys.up && p.onGround) {
        p.vy = -p.jumpPower;
        p.onGround = false;
      }
    }

    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    p.onGround = false;

    // world bounds
    p.x = clamp(p.x, 0, game.worldWidth - p.w);

    // platform collisions
    const prevBottom = p.y + p.h - p.vy * dt;
    for (const plat of game.platforms) {
      const pr = { x: p.x, y: p.y, w: p.w, h: p.h };
      const rr = { x: plat.x, y: plat.y, w: plat.w, h: plat.h };

      if (rectsIntersect(pr, rr)) {
        // land from above
        if (prevBottom <= plat.y + 10 && p.vy >= 0) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.onGround = true;
        }
      }
    }

    // fall reset if player falls in broken bridge gap
    if (p.y > game.height + 220) {
      respawnAfterFall();
    }
  }

  function respawnAfterFall() {
    const p = game.player;
    // respawn after bridge, if second star not collected keep before bridge checkpoint
    let checkpointX = 1300;
    if (game.starCount >= 2) checkpointX = 2220;

    p.x = checkpointX;
    p.y = game.groundY - p.h;
    p.vx = 0;
    p.vy = 0;
    p.onGround = true;

    showMessage("رز افتاد... ولی سفر هنوز تموم نشده 💫", 2200);
    showDialogue("آروم‌تر... بعضی مسیرها با عجله رد نمی‌شن.", 2600);
  }

  // -----------------------------
  // Stage logic
  // -----------------------------
  function updateStageLogic(dt) {
    const p = game.player;

    // camera
    const targetCam = clamp(p.x - game.width * 0.35, 0, game.worldWidth - game.width);
    game.cameraX = lerp(game.cameraX, targetCam, 0.08);

    // owl movement between points
    updateOwl(dt);

    // collect stars
    for (const star of game.stars) {
      if (star.collected) continue;
      if (dist(p.x + p.w / 2, p.y + p.h / 2, star.x, star.y) < 52) {
        star.collected = true;
        game.starCount++;
        updateHUD();
        showMessage("یک ستاره پیدا شد ✨", 1400);

        if (game.starCount === 1) {
          showDialogue("خوبه... نورها دارن راه رو بهت نشون می‌دن.", 2400);
        } else if (game.starCount === 2) {
          showDialogue("فقط یکی دیگه مونده، رز 🌙", 2400);
        } else if (game.starCount === 3) {
          showDialogue("همه‌ی ستاره‌ها جمع شدن. حالا دنبال کلید ماه برو.", 3000);
        }
      }
    }

    // collect moon key
    if (!game.moonKey.collected) {
      const keyRect = game.moonKey;
      const playerRect = { x: p.x, y: p.y, w: p.w, h: p.h };
      const keyHit = rectsIntersect(playerRect, keyRect);

      if (keyHit) {
        showMessage("برای برداشتن کلید: تعامل", 800);
      }

      if (keyHit && keys.action && !game.actionLatch) {
        game.actionLatch = true;
        game.moonKey.collected = true;
        game.hasMoonKey = true;
        game.exitGate.active = true;
        updateHUD();
        showDialogue("کلید ماه پیدا شد... دروازه بیدار شده.", 3000);
        showMessage("🗝️ کلید ماه به دست آمد", 1800);
      }
    }

    if (!keys.action) {
      game.actionLatch = false;
    }

    // exit gate
    if (game.exitGate.active) {
      const gate = game.exitGate;
      const nearGate =
        p.x + p.w > gate.x &&
        p.x < gate.x + gate.w &&
        p.y + p.h > gate.y + 40;

      if (nearGate) {
        showMessage("برای عبور از دروازه: تعامل", 800);

        if (keys.action && !game.actionLatch && !game.stageCompleted) {
          game.actionLatch = true;
          completeStage();
        }
      }
    }

    // if player reaches certain places, subtle excitement moments
    if (p.x > 1450 && p.x < 1750 && !game._bridgeWarned) {
      game._bridgeWarned = true;
      showDialogue("جلوتر پل شکسته‌ست... با دقت رد شو.", 2600);
    }

    if (p.x > 2100 && !game._bridgePassed) {
      game._bridgePassed = true;
      showMessage("از پل شکسته رد شدی 🌉", 1500);
    }
  }

  function completeStage() {
    game.stageCompleted = true;
    game.player.controlsEnabled = false;
    keys.left = keys.right = keys.up = keys.action = false;

    showDialogue("این فقط شروع راهه... لیلیوم هنوز منتظرته.", 3200);
    showMessage("مرحله ۱ کامل شد ✨", 1600);

    setTimeout(() => {
      hud.classList.add("hidden");
      mobileControls.classList.add("hidden-controls");
    }, 400);

    setTimeout(() => {
      stageCompleteScreen.classList.remove("hidden");
      mobileControls.classList.add("hidden");
      game.stage = "complete";
    }, 1800);
  }

  // -----------------------------
  // Owl (Lumi)
  // -----------------------------
  function updateOwl(dt) {
    const owl = game.owl;
    const points = game.owlPoints;
    const p = game.player;

    // choose point based on player x
    let idx = 0;
    for (let i = 0; i < points.length; i++) {
      if (p.x >= points[i].x - 80) idx = i;
    }
    owl.pointIndex = idx;

    const target = points[idx];
    owl.x = lerp(owl.x, target.x, 0.05);
    owl.bob += dt * 3.5;
    owl.y = target.y + Math.sin(owl.bob) * 10;

    // trigger dialogue once per point
    if (!owl.shown.has(idx) && Math.abs(p.x - target.x) < 120) {
      owl.shown.add(idx);
      showDialogue(target.text, 2600);
    }
  }

  // -----------------------------
  // Future final cutscene structure
  // -----------------------------
  // این تابع فعلاً در Build 1 اجرا نمی‌شود، ولی برای پایان اصلی بازی از همین ساختار استفاده می‌کنیم
  function startFinalCutscene() {
    if (!game) return;
    const p = game.player;
    p.controlsEnabled = false;

    // hide controls
    mobileControls.classList.add("hidden-controls");

    // auto move example
    p.autoMove = true;
    p.targetX = p.x + 240;

    // در نسخه‌ی نهایی:
    // 1) رز خودش تا نیمکت می‌رود
    // 2) پسر بلند می‌شود
    // 3) گل لیلیوم می‌دهد
    // 4) بغل
    // 5) نشستن کنار هم
    // 6) سر روی شانه
    // 7) دوربین عقب می‌رود
  }

  // -----------------------------
  // Drawing
  // -----------------------------
  function drawBackground() {
    const w = game.width;
    const h = game.height;

    // sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#17122d");
    sky.addColorStop(0.5, "#120f24");
    sky.addColorStop(1, "#0c0a18");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // moon glow
    drawGlowCircle(w * 0.78, h * 0.18, 180, "rgba(255,235,190,ALPHA)", 0.14);
    drawGlowCircle(w * 0.78, h * 0.18, 70, "rgba(255,245,220,ALPHA)", 0.22);

    // moon
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#f6e7c0";
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.18, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // parallax nebula
    drawNebula(120 - game.cameraX * 0.08, 120, 260, "rgba(96,72,170,0.14)");
    drawNebula(w - 220 - game.cameraX * 0.05, 160, 280, "rgba(120,70,110,0.12)");
    drawNebula(420 - game.cameraX * 0.03, h - 120, 240, "rgba(90,70,150,0.09)");

    // stars
    drawSkyStars();

    // far trees
    drawTrees(1, 0.18, "rgba(35,27,61,0.8)");
    drawTrees(2, 0.32, "rgba(22,18,40,0.95)");

    // floating dust
    drawFloatingDust();
  }

  function drawNebula(x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSkyStars() {
    const t = performance.now() * 0.001;
    for (let i = 0; i < 90; i++) {
      const x = ((i * 131) % (game.width + 400)) - (game.cameraX * 0.08 % (game.width + 400));
      const y = (i * 71) % (game.height * 0.7);
      const a = 0.35 + Math.sin(t * 2 + i) * 0.25;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + a * 0.5})`;
      ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }
  }

  function drawTrees(layer, parallax, color) {
    ctx.save();
    ctx.fillStyle = color;

    for (const tr of game.decorativeTrees) {
      if (tr.layer !== layer) continue;
      const x = tr.x - game.cameraX * parallax;
      const baseY = tr.y;

      // trunk
      ctx.fillRect(x, baseY - tr.h, 12, tr.h);

      // crown
      ctx.beginPath();
      ctx.moveTo(x - 38, baseY - tr.h + 28);
      ctx.lineTo(x + 6, baseY - tr.h - 28);
      ctx.lineTo(x + 50, baseY - tr.h + 28);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x - 30, baseY - tr.h + 58);
      ctx.lineTo(x + 6, baseY - tr.h + 8);
      ctx.lineTo(x + 42, baseY - tr.h + 58);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawFloatingDust() {
    const t = performance.now() * 0.001;
    for (const d of game.floatingDust) {
      const x = d.x - game.cameraX * 0.18;
      const y = d.y + Math.sin(t * d.s + d.x * 0.01) * 6;
      ctx.fillStyle = `rgba(255,255,255,${d.a})`;
      ctx.beginPath();
      ctx.arc(x, y, d.r, 0, Math.PI * 2);
      c
