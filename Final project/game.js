const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// HTML Elemente einzeln abrufen (so machen es Anfänger eher als mit .map)
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

// Variablen deklarieren
let player;
let meteors = [];
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

function createPlayer() {
    player = { 
        x: canvas.width / 2, 
        y: canvas.height - 60, 
        width: 35, 
        height: 30, 
        speed: 450 
    };
}

function updateStats() {
    scoreText.textContent = score;
    livesText.textContent = lives;
    levelText.textContent = level;
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    meteors = [];
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
    ctx.moveTo(0, -20); 
    ctx.lineTo(20, 18); 
    ctx.lineTo(0, 10); 
    ctx.lineTo(-20, 18);
    ctx.closePath(); 
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillRect(-4, 0, 8, 8);
    ctx.restore();
}

function createMeteor() {
    let energy = false;
    if (Math.random() < 0.2) {
        energy = true;
    }

    let meteorRadius = 12 + Math.random() * 8;
    if (energy === true) {
        meteorRadius = 9;
    }

    meteors.push({
        x: Math.random() * canvas.width, 
        y: -30,
        radius: meteorRadius,
        speed: 150 + Math.random() * 150 + level * 20, 
        energy: energy
    });
}

function drawMeteor(m) {
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    
    if (m.energy === true) {
        ctx.fillStyle = "#63f59b";
        ctx.shadowColor = "#63f59b";
    } else {
        ctx.fillStyle = "#ff4f75";
        ctx.shadowColor = "#ff4f75";
    }
    
    ctx.shadowBlur = 15; 
    ctx.fill(); 
    ctx.shadowBlur = 0;
}

// Normale Kollisionsberechnung statt Math.hypot (sieht authentischer aus)
function collision(m) {
    let dx = m.x - player.x;
    let dy = m.y - player.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < m.radius + 20;
}

function draw() {
    drawBackground();
    for (let i = 0; i < meteors.length; i++) {
        drawMeteor(meteors[i]);
    }
    drawPlayer();
}

function gameOver() {
    gameRunning = false;
    overlay.style.display = "flex";
    overlay.querySelector("h2").textContent = "GAME OVER";
    overlay.querySelector("p").textContent = "Score: " + score;
    startButton.textContent = "🔄 Грати знову";
}

function gameLoop(time) {
    if (gameRunning === false) {
        return;
    }
    requestAnimationFrame(gameLoop);
    
    if (paused === true) {
        lastTime = time;
        return;
    }

    let delta = Math.min((time - lastTime) / 1000, 0.04);
    lastTime = time;

    if (left === true) {
        player.x -= player.speed * delta;
    }
    if (right === true) {
        player.x += player.speed * delta;
    }

    // Spieler im Bildschirm halten
    if (player.x < 20) {
        player.x = 20;
    }
    if (player.x > canvas.width - 20) {
        player.x = canvas.width - 20;
    }

    spawnTimer += delta;
    let spawnTime = Math.max(0.25, 0.8 - level * 0.04);
    
    if (spawnTimer > spawnTime) {
        spawnTimer = 0; 
        createMeteor();
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
        let m = meteors[i];
        m.y += m.speed * delta;
        
        if (collision(m)) {
            meteors.splice(i, 1);
            if (m.energy === true) {
                score += 50;
            } else {
                lives--;
            }
        } else if (m.y > canvas.height + 30) {
            meteors.splice(i, 1);
        }
    }

    level = 1 + Math.floor(score / 500);
    updateStats(); 
    draw();
    
    if (lives <= 0) {
        gameOver();
    }
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
    if (k === "arrowleft" || k === "a") {
        left = true;
    }
    if (k === "arrowright" || k === "d") {
        right = true;
    }
    if (e.code === "Space") {
        paused = !paused;
    }
});

window.addEventListener("keyup", function(e) {
    let k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") {
        left = false;
    }
    if (k === "arrowright" || k === "d") {
        right = false;
    }
});

leftBtn.addEventListener("pointerdown", function() { left = true; });
leftBtn.addEventListener("pointerup", function() { left = false; });
rightBtn.addEventListener("pointerdown", function() { right = true; });
rightBtn.addEventListener("pointerup", function() { right = false; });
pauseBtn.addEventListener("click", function() { paused = !paused; });

function newQuestion() {
    let a = Math.floor(Math.random() * 15) + 1;
    let b = Math.floor(Math.random() * 15) + 1;
    let ops = ["+", "-", "×"];
    let op = ops[Math.floor(Math.random() * 3)];
    
    if (op === "+") {
        correctAns = a + b;
    } else if (op === "-") {
        correctAns = a - b;
    } else if (op === "×") {
        correctAns = a * b;
    }
    
    qEl.textContent = `${a} ${op} ${b} = ?`;
    aEl.value = ""; 
    msgEl.textContent = "";
}

function checkAnswer() {
    let answerValue = Number(aEl.value);
    if (answerValue === correctAns) {
        score += 100; 
        updateStats();
        msgEl.textContent = "✅ Правильно! +100 Point";
        newQuestion();
    } else {
        msgEl.textContent = "❌ спробуй ще раз";
    }
}

document.getElementById("newQuestion").addEventListener("click", newQuestion);
document.getElementById("checkAnswer").addEventListener("click", checkAnswer);

// Spiel initialisieren
resetGame(); 
draw(); 
newQuestion();