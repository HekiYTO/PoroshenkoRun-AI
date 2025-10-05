let canvas = document.querySelector('canvas');
let cg = canvas.getContext('2d');

// Картинки
let poroshenko = document.createElement('img');
let forest = document.createElement('img');
let candyImg = document.createElement('img');
let carImg = document.createElement('img');
let planeImg = document.createElement('img');

poroshenko.src = 'images/Petya2.png';
forest.src = 'images/лес-1.jpg';
candyImg.src = 'images/конфетка1.png';
carImg.src = 'images/Бусик.png';      // замените на вашу картинку машины
planeImg.src = 'images/Airbrush-Image-Enhancer-1758919420065-Photoroom.png';  // замените на вашу картинку самолёта

// Звуки
let music = document.createElement('audio');
music.src = 'sounds/bgm2.mp3';
music.loop = true;

let jumpSound = document.createElement('audio');
jumpSound.src = 'sounds/hop.mp3';

let candySound = document.createElement('audio');
candySound.src = 'sounds/po nashemu.mp3';

let loseSound = document.createElement('audio');
loseSound.src = 'sounds/loose.mp3';

// Музыка запускается только после взаимодействия пользователя
let musicStarted = false;
function startMusic() {
    if (!musicStarted) {
        music.play();
        musicStarted = true;
    }
}
window.addEventListener('keydown', startMusic);
window.addEventListener('mousedown', startMusic);

// Остановка всех игровых звуков кроме loseSound и музыки
function stopAllSounds() {
    jumpSound.pause();
    jumpSound.currentTime = 0;
    candySound.pause();
    candySound.currentTime = 0;
}

// Параметры игры
let groundY = canvas.height - 100;
let porX = 100;
let porY = groundY;

let jump = false;
let jumpVel = 0;

// Фон
let bgOffset = 0;
let bgSpeed = 2;

// Конфеты
let candies = [];
let candyTimer = 0;
let score = 0;
let bestScore = localStorage.getItem('bestScore') ? Number(localStorage.getItem('bestScore')) : 0;
let candyWidth = 50;
let candyHeight = 30;

// Машина
let carX = canvas.width;
let carY = groundY + 40;
let carWidth = 200;
let carHeight = 80;

// Самолёты
let planes = [];
let planeTimer = 0;
let planeWidth = 100;
let planeHeight = 80;

// Состояние игры
let gameOver = false;

// Кнопка рестарта
let restartBtn = document.createElement('button');
restartBtn.textContent = "Рестарт";
restartBtn.style.position = "fixed";
restartBtn.style.left = "50%";
restartBtn.style.top = "55%";
restartBtn.style.transform = "translate(-50%, -50%)";
restartBtn.style.fontSize = "2em";
restartBtn.style.padding = "0.5em 2em";
restartBtn.style.display = "none";
restartBtn.style.zIndex = "10";
document.body.appendChild(restartBtn);

restartBtn.onclick = function() {
    resetGame();
    restartBtn.style.display = "none";
    // Остановить звук поражения при рестарте
    loseSound.pause();
    loseSound.currentTime = 0;
    music.play();
    requestAnimationFrame(draw);
};

document.addEventListener('keydown', function (p) {
    if (p.code === 'Space' && !jump && !gameOver) {
        jump = true;
        jumpVel = -15;
        jumpSound.currentTime = 0;
        jumpSound.play();
    }
    if (p.code === 'KeyR' && gameOver) {
        resetGame();
        restartBtn.style.display = "none";
        // Остановить звук поражения при рестарте
        loseSound.pause();
        loseSound.currentTime = 0;
        music.play();
        requestAnimationFrame(draw);
    }
});

function spawnCandy() {
    let candyY = groundY - Math.floor(Math.random() * 250);
    candies.push({
        x: canvas.width,
        y: candyY,
        width: candyWidth,
        height: candyHeight
    });
}

function spawnPlane() {
    let planeY = Math.floor(Math.random() * (groundY - 250)) + 40;
    planes.push({
        x: canvas.width,
        y: planeY,
        width: planeWidth,
        height: planeHeight
    });
}

function resetGame() {
    porY = groundY;
    jump = false;
    jumpVel = 0;
    candies = [];
    candyTimer = 0;
    score = 0;
    carX = canvas.width;
    planes = [];
    planeTimer = 0;
    gameOver = false;
}

function draw() {
    // Двигаем фон
    bgOffset -= bgSpeed;
    if (bgOffset <= -canvas.width) {
        bgOffset = 0;
    }
    cg.drawImage(forest, bgOffset, 0, canvas.width, canvas.height);
    cg.drawImage(forest, bgOffset + canvas.width, 0, canvas.width, canvas.height);

    // Прыжок
    if (jump) {
        porY += jumpVel;
        jumpVel += 0.4;
        if (porY >= groundY) {
            porY = groundY;
            jump = false;
            jumpVel = 0;
        }
    }

    // Конфеты: появление (реже)
    candyTimer++;
    if (candyTimer > 350) { // было 220, стало реже
        spawnCandy();
        candyTimer = 0;
    }

    // Конфеты: движение и отрисовка
    for (let i = candies.length - 1; i >= 0; i--) {
        candies[i].x -= bgSpeed;
        cg.drawImage(candyImg, candies[i].x, candies[i].y, candies[i].width, candies[i].height);

        let collisionPadding = 0.4;
        let cX = candies[i].x + candies[i].width * collisionPadding / 2;
        let cY = candies[i].y + candies[i].height * collisionPadding / 2;
        let cW = candies[i].width * (1 - collisionPadding);
        let cH = candies[i].height * (1 - collisionPadding);

        if (
            porX < cX + cW &&
            porX + 200 > cX &&
            porY < cY + cH &&
            porY + 100 > cY
        ) {
            candies.splice(i, 1);
            score++;
            candySound.currentTime = 0;
            candySound.play();
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('bestScore', bestScore);
            }
        } else if (candies[i].x + candies[i].width < 0) {
            candies.splice(i, 1);
        }
    }

    // Машина: движение и отрисовка
    carX -= bgSpeed + 4;
    if (carX + carWidth < 0) {
        carX = canvas.width + Math.random() * 1500;
    }
    cg.drawImage(carImg, carX, carY, carWidth, carHeight);
    
let carCollisionPadding = 0.6; // было 0.4, теперь зона коллизии уменьшена сильнее
let carColX = carX + carWidth * carCollisionPadding / 2;
let carColY = carY + carHeight * carCollisionPadding / 2;
let carColW = carWidth * (1 - carCollisionPadding);
let carColH = carHeight * (1 - carCollisionPadding);

if (
    porX < carColX + carColW &&
    porX + 200 > carColX &&
    porY + 100 > carColY &&
    porY < carColY + carColH
) {
    gameOver = true;
    stopAllSounds();
    music.pause();
    loseSound.currentTime = 0;
    loseSound.play();
}

    // Самолёты: появление (реже)
    planeTimer++;
    if (planeTimer > 600) { // было 350, стало реже
        spawnPlane();
        planeTimer = 0;
    }

    // Самолёты: движение и отрисовка
    for (let i = planes.length - 1; i >= 0; i--) {
        planes[i].x -= bgSpeed + 3;
        cg.drawImage(planeImg, planes[i].x, planes[i].y, planes[i].width, planes[i].height);

        let planeCollisionPadding = 0.4;
        let pX = planes[i].x + planes[i].width * planeCollisionPadding / 2;
        let pY = planes[i].y + planes[i].height * planeCollisionPadding / 2;
        let pW = planes[i].width * (1 - planeCollisionPadding);
        let pH = planes[i].height * (1 - planeCollisionPadding);

        if (
            porX < pX + pW &&
            porX + 200 > pX &&
            porY < pY + pH &&
            porY + 100 > pY
        ) {
            gameOver = true;
            stopAllSounds();
            music.pause();
            loseSound.currentTime = 0;
            loseSound.play();
        }

        if (planes[i].x + planes[i].width < 0) {
            planes.splice(i, 1);
        }
    }

    // Персонаж
    cg.drawImage(poroshenko, porX, porY, 200, 100);

    // Очки и лучший результат
    cg.font = "32px Arial";
    cg.fillStyle = "yellow";
    cg.fillText("Очки: " + score, 30, 50);
    cg.fillStyle = "white";
    cg.fillText("Рекорд: " + bestScore, 30, 90);

    if (gameOver) {
        cg.font = "64px Arial";
        cg.fillStyle = "red";
        cg.fillText("СБУ вас поймали!", canvas.width / 2 - 220, canvas.height / 2 - 40);
        restartBtn.style.display = "block";
        return;
    }

    requestAnimationFrame(draw);
}

// Запуск игры после загрузки всех ресурсов
forest.onload = function() {
    candyImg.onload = function() {
        carImg.onload = function() {
            planeImg.onload = function() {
                music.volume = 0.5;
                draw();
            };
        };
    };
};