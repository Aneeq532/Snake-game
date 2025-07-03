const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElem = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

const box = 20;
const canvasSize = 400;
const rows = canvasSize / box;
const cols = canvasSize / box;

let snake, food, direction, score, gameInterval, changingDirection, speed;

function initGame() {
    snake = [ { x: 8, y: 10 }, { x: 7, y: 10 } ];
    direction = 'RIGHT';
    score = 0;
    speed = 120;
    changingDirection = false;
    spawnFood();
    updateScore();
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
    };
    // Avoid placing food on the snake
    while (snake.some(part => part.x === food.x && part.y === food.y)) {
        food.x = Math.floor(Math.random() * cols);
        food.y = Math.floor(Math.random() * rows);
    }
}

function updateScore() {
    scoreElem.textContent = score;
}

function gameLoop() {
    changingDirection = false;
    const head = { ...snake[0] };

    switch (direction) {
        case 'LEFT':
            head.x--;
            break;
        case 'RIGHT':
            head.x++;
            break;
        case 'UP':
            head.y--;
            break;
        case 'DOWN':
            head.y++;
            break;
    }

    // Wall collision
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        return gameOver();
    }
    // Self-collision
    if (snake.some(part => part.x === head.x && part.y === head.y)) {
        return gameOver();
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        spawnFood();
        // Speed up game every 5 points (min speed capped at 60ms)
        if (score % 5 === 0) {
            speed = Math.max(60, speed - 10);
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, speed);
        }
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw snake
    snake.forEach((part, i) => {
        ctx.beginPath();
        ctx.fillStyle = i === 0 ? '#2ecc40' : '#26c281'; // head and body as shades of green
        ctx.shadowColor = i === 0 ? '#2ecc4080' : 'transparent';
        ctx.shadowBlur = i === 0 ? 12 : 0;
        ctx.arc(part.x * box + box/2, part.y * box + box/2, box/2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
    // Draw food
    ctx.beginPath();
    ctx.fillStyle = '#ff8b4d';
    ctx.shadowColor = '#ffbe9b77';
    ctx.shadowBlur = 14;
    ctx.arc(food.x * box + box/2, food.y * box + box/2, box/2.25, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function changeDirection(e) {
    if (changingDirection) return;
    let newDir;
    switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': newDir = 'LEFT'; break;
        case 'ArrowUp': case 'w': case 'W': newDir = 'UP'; break;
        case 'ArrowRight': case 'd': case 'D': newDir = 'RIGHT'; break;
        case 'ArrowDown': case 's': case 'S': newDir = 'DOWN'; break;
    }
    if (!newDir) return;
    if (
        (newDir === 'LEFT' && direction !== 'RIGHT') ||
        (newDir === 'RIGHT' && direction !== 'LEFT') ||
        (newDir === 'UP' && direction !== 'DOWN') ||
        (newDir === 'DOWN' && direction !== 'UP')
    ) {
        direction = newDir;
        changingDirection = true;
    }
}

function gameOver() {
    clearInterval(gameInterval);
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = '#202746';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = '2.2em Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 10);
    ctx.font = '1.3em Segoe UI, Arial';
    ctx.fillStyle = '#ff8b4d';
    ctx.fillText('Your Score: ' + score, canvas.width/2, canvas.height/2 + 28);
    ctx.restore();
}

restartBtn.addEventListener('click', initGame);
document.addEventListener('keydown', changeDirection);

// Responsive canvas display
function resizeGame() {
    const min = Math.min(window.innerWidth, window.innerHeight, 420) - 20;
    canvas.style.width = `${min}px`;
    canvas.style.height = `${min}px`;
}
window.addEventListener('resize', resizeGame);
resizeGame();

// Start
initGame();

