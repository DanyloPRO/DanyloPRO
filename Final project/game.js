const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const levelText = document.getElementById("level");
const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");
const leftBtn = document.getElementById("leftButton");
const rightBtn = document.getElementById("rightButton");
const pauseBtn = document.getElementById("pauseButton");
const qEl = document.getElementById("question");
const aEl = document.getElementById("answer");
const msgEl = document.getElementById("message");

// Elemente für die Zweite Chance
const scOverlay = document.getElementById("secondChanceOverlay");
const scTimerEl = document.getElementById("scTimer");
const scSolvedEl = document.getElementById("scSolved");
const scQuestionEl = document.getElementById("scQuestion");
const scAnswerEl = document.getElementById("scAnswer");
const scCheckBtn = document.getElementById("scCheck");
const scSkipBtn = document.getElementById("scSkip");
const scMessageEl = document.getElementById("scMessage");

let player;
let meteors = [];
let bullets = [];
let score = 0;
let lives = 3;
let level = 1;
let correctAns;

let gameRunning = false;
let paused = false;
let left = false;
let right = false;
let lastTime = 0;
let spawnTimer = 0;
let shootTimer = 0;

// Variablen für Second Chance
let scActive = false;
let scTimer = 10;
let scSolved = 0;
let scSkips = 1;
let scInterval;
let scCorrectAns;
let secondChanceUsed = false; // NEU: Speichert, ob die 2. Chance schon genutzt wurde

// Alle 10 Waffen Konfigurationen
let currentWeapon = 1;
const weapons = {
    1:  { color: "#ffdd57", damage: 1,  reqLevel: 1,  fireRate: 0.25 }, // Base Laser
    2:  { color: "#54e8ff", damage: 2,  reqLevel: 2,  fireRate: 0.25 }, // Double
    3:  { color: "#ff4ff8", damage: 2,  reqLevel: 4,  fireRate: 0.20 }, // Spread
    4:  { color: "#63f59b", damage: 1,  reqLevel: 6,  fireRate: 0.08 }, // Machine Gun
    5:  { color: "#ff4f75", damage: 5,  reqLevel: 8,  fireRate: 0.40 }, // Cannon
    6:  { color: "#00fffb", damage: 3,  reqLevel: 10, fireRate: 0.25 }, // Plasma Wave (Wide)
    7:  { color: "#ff914d", damage: 3,  reqLevel: 12, fireRate: 0.20 }, // Side V-Shape
    8:  { color: "#a255ff", damage: 6,  reqLevel: 15, fireRate: 0.35 }, // Burst Heavy
    9:  { color: "#ffffff", damage: 4,  reqLevel: 20, fireRate: 0.15 }, // 5-Way Star
    10: { color: "#ffd700", damage: 10, reqLevel: 25, fireRate: 0.20 }  // Omega Beam
};

function createPlayer() {
    player = { x: canvas.width / 2, y: canvas.height - 60, width: 35, height: 30, speed: 450 };
}

function updateStats() {
    scoreText.textContent = score;
    livesText.textContent = lives;
    levelText.textContent = level;
    updateWeaponUI();
}

function updateWeaponUI() {
    for (let i = 1; i <= 10; i++) {
        let btn = document.getElementById("weapon" + i);
        if (!btn) continue;
        
        if (level >= weapons[i].reqLevel) {
            btn.classList.remove("locked");
        } else {
            btn.classList.add("locked");
            if (currentWeapon === i) currentWeapon = 1;
        }
        
        if (currentWeapon === i) {
            btn.classList.add("active");
            btn.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
            btn.classList.remove("active");
        }
    }
}

window.selectWeapon = function(wId) {
    if (level >= weapons[wId].reqLevel) {
        currentWeapon = wId;
        updateWeaponUI();
    }
};

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    currentWeapon = 1;
    meteors = [];
    bullets = [];
    secondChanceUsed = false; // NEU: Zweite Chance für neues Spiel wieder freischalten
    createPlayer();
    updateStats();
}

function drawBackground() {
    ctx.fillStyle = "#02050d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 100; i++) {
        let x = (i * 97) % canvas.width;
        let y = (i * 53 + Math.floor(score / 5)) % canvas.height;
        ctx.fillStyle = "white";
        ctx.globalAlpha = 0.4;
        ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#54e8ff";
    ctx.fillStyle = "#54e8ff";
    ctx.beginPath();
    ctx.moveTo(0, -20); ctx.lineTo(20, 18); ctx.lineTo(0, 10); ctx.lineTo(-20, 18);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillRect(-4, 0, 8, 8);
    ctx.restore();
}

function shoot() {
    let w = weapons[currentWeapon];
    let spd = 600;
    let py = player.y - 20;
    let px = player.x;

    let addB = (bx, by, vx, vy, r) => {
        bullets.push({ x: bx, y: by, vx: vx, vy: vy, radius: r, color: w.color, damage: w.damage });
    };

    switch(currentWeapon) {
        case 1: addB(px, py, 0, -spd, 4); break;
        case 2: addB(px-10, py, 0, -spd, 4); addB(px+10, py, 0, -spd, 4); break;
        case 3: addB(px, py, 0, -spd, 5); addB(px-15, py, -120, -spd, 4); addB(px+15, py, 120, -spd, 4); break;
        case 4: addB(px + (Math.random()*10-5), py, 0, -spd*1.2, 3); break;
        case 5: addB(px, py, 0, -spd*0.8, 8); break;
        case 6: addB(px-20, py, 0, -spd, 6); addB(px, py-5, 0, -spd, 6); addB(px+20, py, 0, -spd, 6); break;
        case 7: addB(px-20, py, -200, -spd, 5); addB(px+20, py, 200, -spd, 5); break;
        case 8: addB(px-12, py, 0, -spd, 7); addB(px+12, py, 0, -spd, 7); break;
        case 9: addB(px, py, 0, -spd, 4); addB(px-15, py, -100, -spd, 4); addB(px+15, py, 100, -spd, 4); addB(px-30, py, -200, -spd, 4); addB(px+30, py, 200, -spd, 4); break;
        case 10: addB(px, py, 0, -spd*1.5, 12); addB(px-20, py, 0, -spd*1.2, 8); addB(px+20, py, 0, -spd*1.2, 8); break;
    }
}

function drawBullets() {
    for (let b of bullets) {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}

function createMeteor() {
    let energy = Math.random() < 0.15; 
    let mRadius = energy ? 9 : 15 + Math.random() * 12;
    let mHP = energy ? 1 : 1 + Math.floor(level * 0.8); 

    meteors.push({
        x: Math.random() * canvas.width, 
        y: -30,
        radius: mRadius,
        speed: 120 + Math.random() * 100 + level * 15, 
        energy: energy,
        hp: mHP,
        maxHp: mHP
    });
}

function drawMeteor(m) {
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    if (m.energy === true) {
        ctx.fillStyle = "#63f59b";
        ctx.shadowColor = "#63f59b";
    } else {
        let hpPercent = m.hp / m.maxHp;
        if (hpPercent > 0.6) ctx.fillStyle = "#ff4f75";
        else if (hpPercent > 0.3) ctx.fillStyle = "#ff914d";
        else ctx.fillStyle = "#ffdd57";
        ctx.shadowColor = ctx.fillStyle;
    }
    ctx.shadowBlur = 15; 
    ctx.fill(); 
    ctx.shadowBlur = 0;
}

function collision(a, b, extraRadius = 0) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (a.radius || 0) + (b.radius || 0) + extraRadius;
}

function draw() {
    drawBackground();
    drawBullets();
    for (let m of meteors) drawMeteor(m);
    drawPlayer();
}

// ----------------------------------------------------
// SECOND CHANCE LOGIK ANFANG
// ----------------------------------------------------
function gameOver() {
    gameRunning = false;
    
    // Prüfen, ob die zweite Chance schon verbraucht wurde
    if (!secondChanceUsed) {
        secondChanceUsed = true;
        startSecondChance();
    } else {
        showFinalGameOver();
    }
}

function showFinalGameOver() {
    overlay.style.display = "flex";
    overlay.querySelector("h2").textContent = "GAME OVER";
    overlay.querySelector("p").textContent = "Score: " + score;
    startButton.textContent = "🔄 Грати знову";
}

function startSecondChance() {
    scActive = true;
    scTimer = 15;
    scSolved = 0;
    scSkips = 1;
    
    scOverlay.style.display = "flex";
    scTimerEl.textContent = scTimer;
    scSolvedEl.textContent = scSolved;
    scSkipBtn.textContent = `Нове завдання (Залишилось: ${scSkips})`;
    scSkipBtn.disabled = false;
    scMessageEl.textContent = "";
    scAnswerEl.value = "";
    
    generateScQuestion();

    clearInterval(scInterval);
    scInterval = setInterval(() => {
        scTimer--;
        scTimerEl.textContent = scTimer;
        if (scTimer <= 0) {
            failSecondChance();
        }
    }, 1000);
}

function failSecondChance() {
    clearInterval(scInterval);
    scActive = false;
    scOverlay.style.display = "none";
    showFinalGameOver(); // Springt zum finalen Game Over Screen
}

function revivePlayer() {
    clearInterval(scInterval);
    scActive = false;
    scOverlay.style.display = "none";
    
    lives = 1; 
    updateStats();
    meteors = []; 
    
    gameRunning = true;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function generateScQuestion() {
    let a = Math.floor(Math.random() * 15) + 1;
    let b = Math.floor(Math.random() * 15) + 1;
    let ops = ["+", "-", "×"];
    let op = ops[Math.floor(Math.random() * 3)];
    
    if (op === "+") scCorrectAns = a + b;
    else if (op === "-") scCorrectAns = a - b;
    else if (op === "×") scCorrectAns = a * b;
    
    scQuestionEl.textContent = `${a} ${op} ${b} = ?`;
    scAnswerEl.value = "";
    scAnswerEl.focus(); 
}

scCheckBtn.addEventListener("click", () => {
    if (Number(scAnswerEl.value) === scCorrectAns) {
        scSolved++;
        scSolvedEl.textContent = scSolved;
        scMessageEl.textContent = "✅ Правильно!";
        
        if (scSolved >= 3) {
            revivePlayer();
        } else {
            generateScQuestion();
        }
    } else {
        scMessageEl.textContent = "❌ Неправильно!";
        scAnswerEl.value = "";
    }
});

scSkipBtn.addEventListener("click", () => {
    if (scSkips > 0) {
        scSkips--;
        scSkipBtn.textContent = `Нове завдання (Залишилось: ${scSkips})`;
        if (scSkips === 0) scSkipBtn.disabled = true;
        generateScQuestion();
        scMessageEl.textContent = "🔄 Завдання змінено";
    }
});

scAnswerEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        scCheckBtn.click();
    }
});
// ----------------------------------------------------
// SECOND CHANCE LOGIK ENDE
// ----------------------------------------------------

function gameLoop(time) {
    if (!gameRunning) return;
    requestAnimationFrame(gameLoop);
    
    if (paused) { lastTime = time; return; }
    let delta = Math.min((time - lastTime) / 1000, 0.04);
    lastTime = time;

    // Movement
    if (left) player.x -= player.speed * delta;
    if (right) player.x += player.speed * delta;
    if (player.x < 20) player.x = 20;
    if (player.x > canvas.width - 20) player.x = canvas.width - 20;

    // Auto-Shooting
    shootTimer += delta;
    if (shootTimer > weapons[currentWeapon].fireRate) {
        shootTimer = 0; shoot();
    }

    // Spawn Meteors
    spawnTimer += delta;
    let spawnTime = Math.max(0.2, 1.2 - level * 0.08); 
    if (spawnTimer > spawnTime) {
        spawnTimer = 0; createMeteor();
    }

    // Update Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += b.vx * delta; b.y += b.vy * delta;
        if (b.y < -10 || b.x < -10 || b.x > canvas.width + 10) bullets.splice(i, 1);
    }

    // Update Meteors & Collisions
    for (let i = meteors.length - 1; i >= 0; i--) {
        let m = meteors[i];
        m.y += m.speed * delta;
        
        let hit = false;
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (collision(m, bullets[j])) {
                m.hp -= bullets[j].damage; 
                bullets.splice(j, 1); 
                
                if (m.hp <= 0) {
                    if (m.energy) score += 50; else score += 30; 
                    meteors.splice(i, 1);
                    hit = true;
                }
                break;
            }
        }
        if (hit) continue;

        if (collision(m, player, 15)) {
            meteors.splice(i, 1);
            if (m.energy) {
                score += 50;
            } else {
                lives--;
            }
        } else if (m.y > canvas.height + 30) {
            meteors.splice(i, 1);
        }
    }

    let oldLevel = level;
    level = 1 + Math.floor(score / 350);
    if (level !== oldLevel) updateStats(); 
    else { scoreText.textContent = score; livesText.textContent = lives; }
    
    draw();
    if (lives <= 0) gameOver();
}

function startGame() {
    resetGame(); 
    gameRunning = true; 
    paused = false; 
    overlay.style.display = "none";
    lastTime = performance.now(); 
    requestAnimationFrame(gameLoop);
}

startButton.addEventListener("click", startGame);

window.addEventListener("keydown", function(e) {
    let k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") left = true;
    if (k === "arrowright" || k === "d") right = true;
    if (e.code === "Space") paused = !paused;
    
    let num = parseInt(k);
    if (num >= 1 && num <= 9) selectWeapon(num);
    if (num === 0) selectWeapon(10);
});

window.addEventListener("keyup", function(e) {
    let k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") left = false;
    if (k === "arrowright" || k === "d") right = false;
});

leftBtn.addEventListener("pointerdown", () => left = true);
leftBtn.addEventListener("pointerup", () => left = false);
rightBtn.addEventListener("pointerdown", () => right = true);
rightBtn.addEventListener("pointerup", () => right = false);
pauseBtn.addEventListener("click", () => paused = !paused);

function newQuestion() {
    let a = Math.floor(Math.random() * 15) + 1;
    let b = Math.floor(Math.random() * 15) + 1;
    let ops = ["+", "-", "×"];
    let op = ops[Math.floor(Math.random() * 3)];
    
    if (op === "+") correctAns = a + b;
    else if (op === "-") correctAns = a - b;
    else if (op === "×") correctAns = a * b;
    
    qEl.textContent = `${a} ${op} ${b} = ?`;
    aEl.value = ""; 
    msgEl.textContent = "";
}

function checkAnswer() {
    let answerValue = Number(aEl.value);
    if (answerValue === correctAns) {
        score += 150; 
        updateStats();
        msgEl.textContent = "✅ Правильно! +150 Point!";
        newQuestion();
    } else {
        msgEl.textContent = "❌ спробуй ще раз";
    }
}

document.getElementById("newQuestion").addEventListener("click", newQuestion);
document.getElementById("checkAnswer").addEventListener("click", checkAnswer);

resetGame(); draw(); newQuestion();