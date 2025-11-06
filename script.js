const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// global variables

const cellSize = 100;
const cellGap = 3;
let numberOfResources = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 500; //score needed to win the game
let chosenDefender = 1;

// game arrays

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPosition = [];
const projectiles = [];
const resources = [];

// mouse

const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false
}
// mouse event listeners
canvas.addEventListener('mousedown', function() {
    mouse.clicked = true;
});
canvas.addEventListener('mouseup', function() {
    mouse.clicked = false;
});
// get the position of the canvas relative to the window
let canvasPosition = canvas.getBoundingClientRect();

canvas.addEventListener('mousemove', function(e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});


// game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
// creates the cell object itself
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }

    draw() {
        if (mouse.x && mouse.y && collision(this, mouse)) {
             ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x, this.y, this.width, this.height); 
        }

    }
}
// we fill the gameGrid array with cell objects on the entire canvas
function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();

//we cicle through the gameGrid array and draw each cell
function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}

// projectiles
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 5;
    }
    update() {
        this.x += this.speed;
    }
    draw() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}
function handleProjectiles() {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++) {
            if (projectiles[i] && enemies[j] && collision(projectiles[i], enemies[j]))
            {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }
        //remove projectiles when they go off screen
        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
            projectiles.splice(i, 1);
            i--;
        }
    }
}

//defenders

//ARCHER
const defender1 = new Image();
defender1.src = 'public/Defenders/Tiny Swords (Free Pack)/Units/Black Units/Archer/Archer_Spritesheet.png';

const defender2 = new Image();
defender2.src = 'public/Defenders/Tiny Swords (Free Pack)/Units/Black Units/Lancer/Lancer_Spritesheet.png'; //Lancer right now is not rendering properly, need to check the spritesheet

const defender3 = new Image();
defender3.src = 'public/Defenders/Tiny Swords (Free Pack)/Units/Black Units/Monk/Monk_Spritesheet.png';

const defender4 = new Image();
defender4.src = 'public/Defenders/Tiny Swords (Free Pack)/Units/Black Units/Warrior/Warrior_Spritesheet.png';

class Defender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2; //this makes the defender smaller than the cell, leaving a gap to prevent it from colliding with enemies at other lanes
        this.shooting = false;
        this.shootNow = false; //flag to control when to shoot
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 192;
        this.spriteHeight = 192;
        this.minFrame = 0;
        this.maxFrame = 13;
        this.chosenDefender = chosenDefender;
    }
    draw() {
        //this draws the defenders hitbox, useful for debugging
        //ctx.fillStyle = 'blue';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'gold';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        if (this.chosenDefender === 1) {
                    ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        } else if (this.chosenDefender === 2) {
                    ctx.drawImage(defender2, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        } else if (this.chosenDefender === 3) {
                    ctx.drawImage(defender3, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        } else if (this.chosenDefender === 4) {
                    ctx.drawImage(defender4, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }
    update() {
        //animation
        if (frame % 10 === 0) {
            if (this.frameX < this.maxFrame) {
                this.frameX++;
                //loop back to the beginning of the idle animation if not shooting to avoid staying on the shooting end frame
                if (this.frameX === 6) {
                    if (!this.shooting) this.frameX = 0;
                }
            } 
            else  this.frameX = this.minFrame; 
            if (this.frameX === 11) this.shootNow = true;
        
        } //controls the speed of the defender animation

        if (this.shooting && this.shootNow) {
            projectiles.push(new Projectile(this.x + 70, this.y + 50));
            this.shootNow = false;
            }
    }
} //Shooting logic for defenders finished. DO NOT TOUCH unless wanting to increase/decrease shooting speed at line 159
canvas.addEventListener('click', function() {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap; //this will snap the defender to the grid
    if (gridPositionY < cellSize) return;
    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
        return;
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    }
})
function handleDefenders() {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();
        if (enemyPosition.indexOf(defenders[i].y) !== -1) { //If indexOf returns -1, it means there is no enemy in that row
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false; // if there aren't enemies in that row, stop shooting
        }
        for (let j = 0; j < enemies.length; j++) {
            if (defenders[i] && collision(defenders[i], enemies[j])) {
                enemies[j].movement = 0;
                defenders[i].health -= 1;
            }
            if (defenders[i] && defenders[i].health <= 0) {
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}
//defender selection cards (4 types of defenders to choose from right now)
const card1 = {
    x: 10,
    y: 10,
    width: 100,
    height: 85,
}
const card2 = {
    x: 130,
    y: 10,
    width: 100,
    height: 85,
}
const card3 = {
    x: 250,
    y: 10,
    width: 100,
    height: 85,
}
const card4 = {
    x: 370,
    y: 10,
    width: 100,
    height: 85,
}

function chooseDefender() {
    let card1stroke = 'black';
    let card2stroke = 'black';
    let card3stroke = 'black';
    let card4stroke = 'black';
// highlight the chosen card
    if (mouse.x && mouse.y && collision(mouse, card1)) {
        card1stroke = 'gold';
        chosenDefender = 1;
    } else if (mouse.x && mouse.y && collision(mouse, card2)) {
        card2stroke = 'gold';
        chosenDefender = 2;
    } else if (mouse.x && mouse.y && collision(mouse, card3)) {
        card3stroke = 'gold';
        chosenDefender = 3;
    } else if (mouse.x && mouse.y && collision(mouse, card4)) {
        card4stroke = 'gold';
        chosenDefender = 4;
    }

    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';

    ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x, card1.y, card1.width, card1.height); //border
    ctx.drawImage(defender1, 0, 0, 192, 192, -10, -10, 140, 140);

    ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
    ctx.strokeStyle = card2stroke;
    ctx.strokeRect(card2.x, card2.y, card2.width, card2.height); //border
    ctx.drawImage(defender2, 0, 0, 192, 192, 110, -10, 140, 140);

    ctx.fillRect(card3.x, card3.y, card3.width, card3.height);
    ctx.strokeStyle = card3stroke;
    ctx.strokeRect(card3.x, card3.y, card3.width, card3.height); //border
    ctx.drawImage(defender3, 0, 0, 192, 192, 230, -10, 140, 140);

    ctx.fillRect(card4.x, card4.y, card4.width, card4.height);
    ctx.strokeStyle = card4stroke;
    ctx.strokeRect(card4.x, card4.y, card4.width, card4.height); //border
    ctx.drawImage(defender4, 0, 0, 192, 192, 350, -10, 140, 140);
}


//Floating messages

const floatingMessages = [];
class FloatingMessage {
    constructor(value, x, y, size, color) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.lifeSpan = 0;
        this.opacity = 1;
    }
    update() {
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.03) this.opacity -= 0.03;
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px Orbitron';
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

function handleFloatingMessages() {
    for (let i = 0; i < floatingMessages.length; i++) {
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 50) {
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}

//enemies

//GOBLIN
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = 'public/Enemies/Goblin/GoblinSpritesheet.png';
enemyTypes.push(enemy1);
//ORC
const enemy2 = new Image();
enemy2.src = 'public/Enemies/Orc/OrcSpritesheet.png';
enemyTypes.push(enemy2);
//OGRE
const enemy3 = new Image();
enemy3.src = 'public/Enemies/Ogre/OgreSpritesheet.png';
enemyTypes.push(enemy3);
//REAPER 1
const enemy4 = new Image();
enemy4.src = 'public/Enemies/Reaper_Man_1/ReaperMan_1_Spritesheet.png';
enemyTypes.push(enemy4);
//REAPER 2
const enemy5 = new Image();
enemy5.src = 'public/Enemies/Reaper_Man_2/ReaperMan_2_Spritesheet.png';
enemyTypes.push(enemy5);
//REAPER 3
const enemy6 = new Image();
enemy6.src = 'public/Enemies/Reaper_Man_3/ReaperMan_3_Spritesheet.png';
enemyTypes.push(enemy6);
//ZOMBIE 1
const enemy7 = new Image();
enemy7.src = 'public/Enemies/Zombie_Villager_1/ZombieVillager_1_Spritesheet.png';
enemyTypes.push(enemy7);
//ZOMBIE 2
const enemy8 = new Image();
enemy8.src = 'public/Enemies/Zombie_Villager_2/ZombieVillager_2_Spritesheet.png';
enemyTypes.push(enemy8);
//ZOMBIE 3
const enemy9 = new Image();
enemy9.src = 'public/Enemies/Zombie_Villager_3/ZombieVillager_3_Spritesheet.png';
enemyTypes.push(enemy9);
//FALLEN ANGEL 1
const enemy10 = new Image();
enemy10.src = 'public/Enemies/Fallen_Angels_1/FallenAngel_1_Spritesheet.png';
enemyTypes.push(enemy10);
//FALLEN ANGEL 2
const enemy11 = new Image();
enemy11.src = 'public/Enemies/Fallen_Angels_2/FallenAngel_2_Spritesheet.png';
enemyTypes.push(enemy11);
//FALLEN ANGEL 3
const enemy12 = new Image();
enemy12.src = 'public/Enemies/Fallen_Angels_3/FallenAngel_3_Spritesheet.png';
enemyTypes.push(enemy12);
//DARK ORACLE 1
const enemy13 = new Image();
enemy13.src = 'public/Enemies/Dark_Oracle_1/DarkOracle_1_Spritesheet.png';
enemyTypes.push(enemy13);
//DARK ORACLE 2
const enemy14 = new Image();
enemy14.src = 'public/Enemies/Dark_Oracle_1/DarkOracle_1_Spritesheet.png';
enemyTypes.push(enemy14);
//DARK ORACLE 3
const enemy15 = new Image();
enemy15.src = 'public/Enemies/Dark_Oracle_1/DarkOracle_1_Spritesheet.png';
enemyTypes.push(enemy15);

class Enemy {
    constructor(verticalPosition) {
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]; //random enemy type from the array, stronger enemies will be regulated to appear less often in the array
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 11;
        this.spriteWidth = 900;
        this.spriteHeight = 900;
    }
    update(){
        this.x -= this.movement;
        if (frame % 10 === 0) { //controls the speed of the enemy animation
            if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = this.minFrame;
        }
    }
    draw() {
        //this draws the enemies hitbox, useful for debugging
        //ctx.fillStyle = 'red';
        //ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = 'black';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

function handleEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        //If any enemy reaches x 0, game over
        if (enemies[i].x < 0) {
            gameOver = true;
        }
        //remove enemies if health is 0
        if (enemies[i].health <= 0) {
            let gainedResources = enemies[i].maxHealth / 10;
            floatingMessages.push(new FloatingMessage('+' + gainedResources, enemies[i].x, enemies[i].y, 30, 'black'));
            floatingMessages.push(new FloatingMessage('+' + gainedResources, 770, 50, 30, 'gold'));
            numberOfResources += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPosition.indexOf(enemies[i].y);
            enemyPosition.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
        }
    }
    //enemies spawn either in line 1, 2,3,4 or 5 at random every 100 frames
    if (frame % enemiesInterval === 0 && score < winningScore) {
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition));
        enemyPosition.push(verticalPosition);
        //IMPORTANT TO BALANCE THE GAME: This controlls the speed of enemy spawning
        if (enemiesInterval > 120) enemiesInterval -= 20; // gives time to the player to build up defenses
    }
}

//resources
//randomly spawns resources on the map
const amounts = [20, 30, 40];
class Resource {
    constructor() { //random position and amount of resources
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw() { //draw the resource
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(this.amount, this.x + 15, this.y + 25);
    }
}

function handleResources() {
    if (frame % 500 === 0 && score < winningScore) {
        resources.push(new Resource());
    }
    for (let i = 0; i < resources.length; i++) {
        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
            numberOfResources += resources[i].amount;
            floatingMessages.push(new FloatingMessage('+' + resources[i].amount, resources[i].x, resources[i].y, 30, 'black'));
            floatingMessages.push(new FloatingMessage('+' + resources[i].amount, 770, 50, 30, 'gold'));
            resources.splice(i, 1);
            i--;
        }
    }
}


//utilities
function handleGameStatus() {
    ctx.fillStyle = 'gold';
    ctx.font = '30px Orbitron';
    ctx.fillText('Score: ' + score, 520, 35);
    ctx.fillText('Resources: ' + numberOfResources, 520, 80);
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '90px Orbitron';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (score >= winningScore && enemies.length === 0) {
        ctx.fillStyle = 'black';
        ctx.font = '60px Orbitron';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Orbitron';
        ctx.fillText('You win with ' + score + 'points!', 140, 340);
        gameOver = true;
    }
}

canvas.addEventListener('click', function() {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap; //this will snap the defender to the grid
    if (gridPositionY < cellSize) return;
    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
        return;
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    } else {
        floatingMessages.push(new FloatingMessage('Need More Resources', mouse.x, mouse.y, 20, 'red'));
    }
})

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    chooseDefender();
    handleGameStatus();
    handleFloatingMessages();
    frame++;
    if (!gameOver) requestAnimationFrame(animate);
}

animate();

function collision(first, second) {
    if (!(first.x > second.x + second.width ||
          first.x + first.width < second.x ||
          first.y > second.y + second.height ||
          first.y + first.height < second.y)
        ) {
        return true;
        };
};

//resizing the window
window.addEventListener('resize', function() {
    canvasPosition = canvas.getBoundingClientRect();
});