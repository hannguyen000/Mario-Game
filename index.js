
const canvas = document.getElementById('mario_game');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 1.2; //weight of gravity (make player fall faster and more natural)

const spriteRunLeft = new Image();
spriteRunLeft.src = './image/aliceRunLeft.png';
const spriteRunRight = new Image();
spriteRunRight.src = './image/aliceRunRight.png';
const spriteStandLeft = new Image();
spriteStandLeft.src = './image/aliceStandLeft.png';
const spriteStandRight = new Image();
spriteStandRight.src = './image/aliceStandRight.png';
class Player {
    constructor() {
        this.position = {
            x: 50,
            y: 30
        }
        this.width = 121; //of player
        this.height = 100;
        this.velocity = {
            x: 0, //speed of player in x direction
            y: 0 //weight of each jump (up and down)
        };
        this.speed = 8; //speed of player in x direction
        this.image = spriteStandRight;
        this.scale = 0.4;
        this.frame = 0; //to keep track of which frame of the sprite sheet to show (for animation)
        this.sprites = {
            stand: {
                right: spriteStandRight,
                left: spriteStandLeft,
                cropWidth: 341,
            },
            run: {
                right: spriteRunRight,
                left: spriteRunLeft,
                cropWidth: 341,
                width: 341 //cropWidth / number of frames in the sprite sheet (to make the player smaller when running)
            }
        };
        this.currentSprite = this.sprites.stand.right;
        this.currentCropWidth = this.sprites.stand.cropWidth;

        this.isOnGround = false;
    }

    //function to draw player on canvas
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
            this.height);
    //c.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    //sx, sy, sWidth, sHeight = vùng trong sprite sheet (trích từ image gốc). sx, sy = tọa độ (vị trí bắt đầu) vùng cần trích (tính từ góc trên bên trái của image gốc). sWidth, sHeight = kích thước của vùng cần trích.
    //dx, dy, dWidth, dHeight = vị trí + kích thước vẽ trên canvas.
    }

    //function to update player position and draw it on canvas
    update() {
 // update frame animation
        if (keys.right.pressed || keys.left.pressed)
            this.frame++;
        let maxFrame = 0;

        if (this.currentSprite === this.sprites.stand.right || this.currentSprite === this.sprites.stand.left) {
            maxFrame = 22; 
        } else if (this.currentSprite === this.sprites.run.right || this.currentSprite === this.sprites.run.left) {
            maxFrame = 22; 
        }

        if (this.frame > maxFrame) this.frame = 0;

        this.draw();

        // jump up and down
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = 0; // stop the player from moving up further when it reaches the top of the canvas
        }

        // if player hasn't hit the ground yet, continue jumping down; if player has hit the ground, stop (to create a more natural falling effect)
        if (this.position.y + this.height + this.velocity.y <= canvas.height ) {
            //this.direction *= -1;
            this.velocity.y += gravity; //increase the speed of player every time it falls down (like flappy bird)
        }
    }
}

class Platform {
    constructor({ x, y, width, height, image}) {
        this.position = { 
            x: x, 
            y: y };
    
        this.image = image;

        this.width = width;
        this.height = height;

    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}

class GenericObject {
    constructor({ x, y, image}) {
        this.position = { 
            x: x, 
            y: y };
        this.image = image;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y);
    }
}

let player;
let platformImage = new Image();
platformImage.src = './image/platform.png';

let backgroundImage = new Image();
backgroundImage.src = './image/background.png';
let hillsImage = new Image();
hillsImage.src = './image/hills.png';

const platformData = [
    { x: 0, y: 470, width: platformImage.width, height: platformImage.height, image: platformImage },
    { x: platformImage.width - 3, y: 470, width: platformImage.width, height: platformImage.height, image: platformImage },
    { x: platformImage.width * 2 + 160, y: 470, width: platformImage.width, height: platformImage.height, image: platformImage },
    { x: 300, y: 300, width: 300, height: 50, image: platformImage },
    { x: 500, y: 200, width: 300, height: 50, image: platformImage },
];

let platforms = [];

let genericObjects = [];
let scrollOffset = 0; //to keep track of how far the player has scrolled to the right (to determine when to end the game)

function init() {
    player = new Player();

    platforms = platformData.map(data => 
        new Platform({ ...data, image: platformImage })
    );

    genericObjects = [
        new GenericObject({ x: -1, y: -1, image: backgroundImage }),
        new GenericObject({ x: -1, y: -1, image: hillsImage }),
    ];
    
    scrollOffset = 0;
}

init();

const keys = {  
    right: {
        pressed: false
    },      
    left: {
        pressed: false
    }
};

//loop to animate the player (to make it move and jump)
function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height); //clear canvas every frame to prevent player from leaving a trail of rectangles behind it
    
    genericObjects.forEach(genericObject => genericObject.draw());
    platforms.forEach(platform => platform.draw());
    player.update();
    player.isOnGround = false;

    if (keys.left.pressed && player.position.x > 100) 
        player.velocity.x = -player.speed; //move left 
    else if (keys.right.pressed && player.position.x < 400) 
        player.velocity.x = player.speed; //move right
    else {
        player.velocity.x = 0;

        if (keys.right.pressed){
            scrollOffset += 5;
            platforms.forEach(platform => {
                platform.position.x -= player.speed;
            });
            genericObjects.forEach(genericObject => {
                genericObject.position.x -= player.speed * 0.66; //move background slower than platforms to create a parallax effect
            });
        }
        else if (keys.left.pressed && scrollOffset > 0) { 
            scrollOffset -= 5;
            platforms.forEach(platform => {
                platform.position.x += player.speed;
            });
            genericObjects.forEach(genericObject => {
                genericObject.position.x += player.speed * 0.66;
            });

        }
    }

    platforms.forEach(platform => {
        const playerBottom = player.position.y + player.height;
        const nextPlayerBottom = playerBottom + player.velocity.y;

        if (
            playerBottom <= platform.position.y &&
            nextPlayerBottom >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width
        ) {
            player.velocity.y = 0; 
            player.position.y = platform.position.y - player.height; // player đứng đúng trên platform
            player.isOnGround = true;
        }
    });

    // win condition: scroll to the right far enough
    if (scrollOffset > 2000) {
        console.log('You win!');
    }

    //lose condition: fall down below the canvas
    if (player.position.y > canvas.height) {
        console.log('You lose!');
        init(); //reset the game
    }
}

animate();

addEventListener('keydown', ({ keyCode }) => {
    console.log(keyCode);
    switch (keyCode) {
        case 37: // Left arrow
        case 65: // 'A'
            player.currentSprite = player.sprites.run.left;
            player.currentCropWidth = player.sprites.run.cropWidth;
            player.width = player.currentCropWidth * player.scale;
            keys.left.pressed = true;
            break;
        case 38: // Up arrow
        case 87: // 'W'
            if (player.isOnGround) { // just allow the player to jump if it's on the ground (to prevent double jumping)
                player.velocity.y = -20; 
                player.isOnGround = false; // set isOnGround to false when the player jumps, so it can't jump again until it lands back on the ground
            }
            break;
        case 39: // Right arrow
        case 68: // 'D'
            player.currentSprite = player.sprites.run.right;
            player.currentCropWidth = player.sprites.run.cropWidth;
            player.width = player.currentCropWidth * player.scale;
            keys.right.pressed = true;
            break;
        case 40: // Down arrow
        case 83: // 'S'
            player.velocity.y = 10;
            break;
    }
});

// when releasing the key, stop moving => if not present, the player will continue moving indefinitely even without pressing the key (similar to flappy bird)
addEventListener('keyup', ({ keyCode }) => {
    console.log(keyCode);
switch (keyCode) {
    case 37: // Left arrow
    case 65: // 'A'
        player.currentSprite = player.sprites.stand.left;
        player.currentCropWidth = player.sprites.stand.cropWidth;
        player.width = player.currentCropWidth * player.scale;
        keys.left.pressed = false;
        break;
    case 38: // Up arrow
    case 87: // 'W'
        break;
    case 39: // Right arrow
    case 68: // 'D'
        player.currentSprite = player.sprites.stand.right;
        player.currentCropWidth = player.sprites.stand.cropWidth;
        player.width = player.currentCropWidth * player.scale;
        keys.right.pressed = false;
        break;
    case 40: // Down arrow
    case 83: // 'S'
        break;
}
});
