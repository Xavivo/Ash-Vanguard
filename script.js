const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// global variables

const cellSize = 100;
const cellGap = 3;
const gameGrid = [];

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
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
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
//we cicle through the gameGrid array and draw each cell
function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}
// projectiles
//defenders
//enemies
//resources

//utilities

function animate() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    requestAnimationFrame(animate);
}

animate();