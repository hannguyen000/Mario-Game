const canvas = document.getElementById('mario_game');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 1.2;

// --- LOAD IMAGES ---
function createImage(src) {
    const image = new Image();
    image.src = src;
    return image;
}

const spriteRunLeft = createImage('./image/aliceRunLeft.png');
const spriteRunRight = createImage('./image/aliceRunRight.png');
const spriteStandLeft = createImage('./image/aliceStandLeft.png');
const spriteStandRight = createImage('./image/aliceStandRight.png');
const bunnyImage = createImage('./image/bunny.png');
const platformImage = createImage('./image/platform.png');
const backgroundImage = createImage('./image/background.png');
const hillsImage = createImage('./image/hills.png');
const flagImage = createImage('./image/flag.png');
const carrotImage = createImage('./image/carrot.png');
const enemyImage = createImage('./image/enemy.png');
const bombImage = createImage('./image/bomb.png');

// --- GAME VARIABLES ---
let score = 0;
let carrots = [];
const scoreElement = document.getElementById('scoreElement');
const restartBtn = document.getElementById('restartBtn');
let player;
let platforms = [];
let genericObjects = [];
let flag;
let scrollOffset = 0;
let hasWon = false;
let lives = 3;
let enemies = [];
let bombs = [];
let gameOver = false;

// --- CLASSES ---
class Player {
    constructor() {
        this.position = { x: 50, y: 30 };
        this.velocity = { x: 0, y: 0 };
        this.width = 121;
        this.height = 130;
        this.speed = 8;
        this.scale = 0.4;
        this.frame = 0;
        this.sprites = {
            stand: { right: spriteStandRight, left: spriteStandLeft, cropWidth: 341 },
            run: { right: spriteRunRight, left: spriteRunLeft, cropWidth: 341 }
        };
        this.currentSprite = this.sprites.stand.right;
        this.currentCropWidth = this.sprites.stand.cropWidth;
        this.isOnGround = false;
    }

    draw() {
        c.drawImage(
            this.currentSprite,
            this.currentCropWidth * this.frame,
            0,
            this.currentCropWidth,
            400,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    update() {
        if (keys.right.pressed || keys.left.pressed) this.frame++;
        if (this.frame > 22) this.frame = 0;

        this.draw();
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        }
    }
}

class Platform {
    constructor({ x, y, width, height, image }) {
        this.position = { x, y };
        this.image = image;
        this.width = width;
        this.height = height;
    }
    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}

class Flag {
    constructor({ x, y }) {
        this.position = { x, y };
        this.width = 50;
        this.height = 120;
    }
    draw() {
        c.drawImage(flagImage, this.position.x, this.position.y, this.width, this.height);
    }
}

class GenericObject {
    constructor({ x, y, image }) {
        this.position = { x, y };
        this.image = image;
    }
    draw() {
        c.drawImage(this.image, this.position.x, this.position.y);
    }
}

class Carrot {
    constructor({ x, y }) {
        this.position = { x, y };
        this.width = 120;
        this.height = 200;
        this.collected = false;
    }

    draw() {
        if (!this.collected) {
            c.drawImage(carrotImage, this.position.x, this.position.y, this.width, this.height);
        }
    }
}

class Bomb {
    constructor({ x, y, velocity }) {
        this.position = { x, y };
        this.velocity = velocity;
        this.width = 60;
        this.height = 60;
    }

    draw() {
        c.drawImage(bombImage, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y += 0.5; // Gia tốc trọng lực cho bom
    }
}

class Enemy {
    constructor({ x, y }) {
        this.position = { x, y };
        this.width = 220;
        this.height = 180;
        this.shootTimer = 0;
    }

    draw() {
        c.drawImage(enemyImage, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.shootTimer++;

        // Cứ mỗi 100 frames (~1.5 giây) ném 1 quả bom
        if (this.shootTimer % 100 === 0) {
            this.shoot();
        }
    }

    shoot() {
        bombs.push(new Bomb({
            x: this.position.x,
            y: this.position.y,
            velocity: { x: -5, y: 0 }
        }));
    }
}

// Thay thế pWidth/pHeight bằng số cụ thể nếu ảnh chưa load kịp
const P_WIDTH = 580; 
const P_HEIGHT = 125;
const gap = 160;

function init() {
    displayedText = '';
    textIndex = 0;
    lives = 3;
    gameOver = false;
    player = new Player();
    hasWon = false;
    scrollOffset = 0;

    platforms = [
        new Platform({ x: 0, y: 470, width: P_WIDTH, height: P_HEIGHT, image: platformImage }),
        new Platform({ x: P_WIDTH, y: 470, width: P_WIDTH, height: P_HEIGHT, image: platformImage }),
        new Platform({ x: P_WIDTH * 2 + gap, y: 470, width: P_WIDTH, height: P_HEIGHT, image: platformImage }),
        new Platform({ x: P_WIDTH * 3 + gap, y: 320, width: P_WIDTH / 2, height: P_HEIGHT, image: platformImage }),
        new Platform({ x: P_WIDTH * 4, y: 220, width: P_WIDTH / 2, height: P_HEIGHT, image: platformImage }),
        new Platform({ x: P_WIDTH * 6, y: 470, width: P_WIDTH * 1.5, height: P_HEIGHT, image: platformImage }),
        new Platform({ x: (P_WIDTH * 5) - 50, y: 350, width: P_WIDTH / 2, height: P_HEIGHT, image: platformImage }),
        new Platform({ x: (P_WIDTH * 7) + gap * 3, y: 300, width: P_WIDTH/4, height: P_HEIGHT, image: platformImage }),
        new Platform({ x: (P_WIDTH * 8) + gap, y: 220, width: P_WIDTH/4, height: P_HEIGHT, image: platformImage }),
        new Platform({ x: P_WIDTH * 9, y: 450, width: P_WIDTH, height: P_HEIGHT, image: platformImage }),
        new Platform({ x: (P_WIDTH * 10) - 50   , y: 450, width: P_WIDTH, height: P_HEIGHT, image: platformImage })
    ];

    enemies = [
    new Enemy({ x: 1700, y: 100 }),
    new Enemy({ x: 3000, y: 50 }),
    new Enemy({ x: 5000, y: 100 })
    ];

    score = 0;
    scoreElement.innerHTML = `Score: ${score}`;
    
    carrots = [
        new Carrot({ x: 600, y: 50 }),
        new Carrot({ x: 750, y: 50 }),
        new Carrot({ x: 900, y: 50 }),


        new Carrot({ x: 1200, y: 30 }),
        new Carrot({ x: 2000, y: 5 }),
        new Carrot({ x: 2900, y: 30 }),
        new Carrot({ x: 3000, y: 30 }),
        new Carrot({ x: 3100, y: 30 }),
        new Carrot({ x: 3200, y: 300 })
    ];

    genericObjects = [
        new GenericObject({ x: -1, y: -1, image: backgroundImage }),
        new GenericObject({ x: -1, y: -1, image: hillsImage })
    ];

    const lastPlat = platforms[platforms.length - 1];
    flag = new Flag({
        x: lastPlat.position.x + lastPlat.width - 100,
        y: lastPlat.position.y - 120
    });
}

const keys = { right: { pressed: false }, left: { pressed: false } };

let displayedText = '';
let textIndex = 0;
let lastUpdate = 0;

const fullText = 'Chúc Nam thi tốt và vào được trường mình muốn nhé. Trường đại học hay trường nghề thì chị đều ủng hộ hết mình!';

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

// từng chữ xuất hiện
function updateTypewriter() {
    if (textIndex < fullText.length) {
        displayedText += fullText[textIndex];
        textIndex++;
    }
}

function drawWinScreen() {
    const now = Date.now();

    // update chữ mỗi 60ms
    if (now - lastUpdate > 60) {
        updateTypewriter();
        lastUpdate = now;
    }

    const bunnyY = canvas.height / 2 + Math.sin(Date.now() / 200) * 20;
    c.drawImage(bunnyImage, canvas.width/2 - 130, bunnyY - 150 , 250, 270);

    c.font = '50px Arial';
    c.textAlign = 'center';
    c.fillStyle = 'black';

    wrapText(
        c,
        displayedText,
        canvas.width / 2,
        150,
        700,
        60
    );

    c.font = '35px Arial';
    c.fillText(`Final Score: ${score}`, canvas.width / 2, 450);

    restartBtn.style.display = 'block';
}

function drawLostScreen() {
    c.font = '50px Arial';
    c.textAlign = 'center';
    c.fillStyle = 'red';
    c.fillText('GAME OVER', canvas.width / 2, 150);

    c.font = '35px Arial';
    c.fillStyle = 'black';
    c.fillText(`Final Score: ${score}`, canvas.width / 2, 450);

    restartBtn.style.display = 'block';
}

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    if (hasWon) {
        drawWinScreen();
        return;
    }

    if (gameOver) {
        drawLostScreen();
        return;
    }
    genericObjects.forEach(obj => obj.draw());
    platforms.forEach(plat => plat.draw());
    
    // Cập nhật vị trí cờ theo platform cuối
    const lastPlat = platforms[platforms.length - 1];
    flag.position.x = lastPlat.position.x + lastPlat.width - 100;
    flag.draw();

    // Xử lý Cà rốt
    carrots.forEach(carrot => {
        carrot.draw();

        // Thu nhỏ vùng va chạm (Hitbox)
        const paddingX = 50; // Alice phải chạm sâu vào 30px theo chiều ngang
        const paddingY = 50; // Alice phải chạm sâu vào 20px theo chiều dọc

        // Kiểm tra va chạm với nhân vật
        if (!carrot.collected &&
        player.position.x + player.width - paddingX >= carrot.position.x &&
        player.position.x + paddingX <= carrot.position.x + carrot.width &&
        player.position.y + player.height >= carrot.position.y &&
        player.position.y + paddingY <= carrot.position.y + carrot.height
        ) {
            carrot.collected = true;
            score += 100;
            scoreElement.innerHTML = `Score: ${score}`;
        }
    });

    // Cập nhật Enemy
    enemies.forEach(enemy => enemy.update());

    // Cập nhật Bom và Va chạm
    bombs.forEach((bomb, index) => {
        bomb.update();

        // 1. Bom chạm Alice
        if (
            player.position.x < bomb.position.x + bomb.width &&
            player.position.x + player.width > bomb.position.x &&
            player.position.y < bomb.position.y + bomb.height &&
            player.position.y + player.height > bomb.position.y
        ) {
            bombs.splice(index, 1); // Xóa bom ngay khi chạm
            lives--; // Trừ mạng
            if (lives <= 0) {
                gameOver = true;
            }
        }

        // 2. Xóa bom nếu bay ra khỏi màn hình
        if (bomb.position.y > canvas.height) {
            bombs.splice(index, 1);
        }
    });

    // Vẽ số mạng lên màn hình
    c.font = '24px Arial';
    c.fillStyle = 'red';
    c.fillText('❤️'.repeat(lives), 100, 50);

    // Player Movement
    if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = player.speed;
    } else if ((keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)) {
        player.velocity.x = -player.speed;
    } else {
        player.velocity.x = 0;
        if (keys.right.pressed) {
            scrollOffset += player.speed;
            platforms.forEach(plat => plat.position.x -= player.speed);
            carrots.forEach(carrot => carrot.position.x -= player.speed); // CUỘN SANG PHẢI
            bombs.forEach(bomb => bomb.position.x -= player.speed); // CUỘN SANG PHẢI
            enemies.forEach(enemy => enemy.position.x -= player.speed);
            genericObjects.forEach(obj => obj.position.x -= player.speed * 0.66);
        } else if (keys.left.pressed && scrollOffset > 0) {
            scrollOffset -= player.speed;
            platforms.forEach(plat => plat.position.x += player.speed);
            carrots.forEach(carrot => carrot.position.x += player.speed); // Di chuyển cà rốt
            bombs.forEach(bomb => bomb.position.x += player.speed); // CUỘN SANG PHẢI
            enemies.forEach(enemy => enemy.position.x += player.speed);
            genericObjects.forEach(obj => obj.position.x += player.speed * 0.66);
        }
    }

    // Platform Collision
    player.isOnGround = false;
    platforms.forEach(plat => {
        if (player.position.y + player.height <= plat.position.y &&
            player.position.y + player.height + player.velocity.y >= plat.position.y &&
            player.position.x + player.width >= plat.position.x &&
            player.position.x <= plat.position.x + plat.width) {
            player.velocity.y = 0;
            player.isOnGround = true;
        }
    });

    // Win check (Flag collision)
    if (player.position.x + player.width >= flag.position.x &&
        player.position.x <= flag.position.x + flag.width &&
        player.position.y + player.height >= flag.position.y) {
        hasWon = true;
    }

    player.update();

    if (player.position.y > canvas.height) init();
}

// --- INPUTS ---
addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
        case 65: case 37: 
            keys.left.pressed = true; 
            player.currentSprite = player.sprites.run.left;
            break;
        case 68: case 39: 
            keys.right.pressed = true; 
            player.currentSprite = player.sprites.run.right;
            break;
        case 87: case 38: 
            if (player.isOnGround) player.velocity.y = -20; 
            break;
    }
});

addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65: case 37: 
            keys.left.pressed = false; 
            player.currentSprite = player.sprites.stand.left;
            break;
        case 68: case 39: 
            keys.right.pressed = false; 
            player.currentSprite = player.sprites.stand.right;
            break;
    }
});

restartBtn.addEventListener('click', () => {
    // 1. Reset các biến game
    init();
    hasWon = false;
    
    // 2. Ẩn nút đi để chơi tiếp
    restartBtn.style.display = 'none';
});

// --- MOBILE CONTROLS ---
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

// Hàm xử lý chung để tránh lặp code
function handleMove(direction, isPressed) {
    if (direction === 'left') {
        keys.left.pressed = isPressed;
        if (isPressed) player.currentSprite = player.sprites.run.left;
        else player.currentSprite = player.sprites.stand.left;
    }
    if (direction === 'right') {
        keys.right.pressed = isPressed;
        if (isPressed) player.currentSprite = player.sprites.run.right;
        else player.currentSprite = player.sprites.stand.right;
    }
}

// SỰ KIỆN CHO NÚT TRÁI
leftBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); handleMove('left', true); });
leftBtn.addEventListener('pointerup', (e) => { e.preventDefault(); handleMove('left', false); });
leftBtn.addEventListener('pointerout', (e) => { e.preventDefault(); handleMove('left', false); }); // Phòng trường hợp vuốt tay ra ngoài nút

// SỰ KIỆN CHO NÚT PHẢI
rightBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); handleMove('right', true); });
rightBtn.addEventListener('pointerup', (e) => { e.preventDefault(); handleMove('right', false); });
rightBtn.addEventListener('pointerout', (e) => { e.preventDefault(); handleMove('right', false); });

// SỰ KIỆN CHO NÚT NHẢY
jumpBtn.addEventListener('pointerdown', (e) => { 
    e.preventDefault(); 
    if (player.isOnGround) player.velocity.y = -20; 
});

// Chạy game
init();
animate();
