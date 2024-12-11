const EASY_SIZE = 8;
const MEDIUM_SIZE = 16;
const HARD_SIZE = 22;

const EASY_MINES = 10;
const MEDIUM_MINES = 40;
const HARD_MINES = 100;

let remainingFlags = 0;
let boardSize = 0;
let totalMines = 0;
let firstClick = true;

window.onload = () => {
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('congratulationsScreen').style.display = 'none';
};

function startGame(size, mines){
    remainingFlags = mines;
    boardSize = size;
    totalMines = mines;
    document.documentElement.style.setProperty('--grid-size', size);
    const board = document.querySelector('.board');
    board.innerHTML = '';
    firstClick = true;

    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('congratulationsScreen').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';

    for (let i = 0; i < size * size; i++){
        const section = document.createElement('div');
        section.classList.add('section');
        section.setAttribute('data-mine', 'false');
        section.setAttribute('data-adjacent-mines', '0');

        section.addEventListener('click', () => handleClick(section));
        section.addEventListener('contextmenu', (e) => {e.preventDefault(); toggleFlag(section);});

        board.appendChild(section);
    }

    updateFlags();
}

function handleClick(click){
    if (click.style.backgroundColor === 'orange'){
        toggleFlag(click);
        return;
    }

    if(firstClick){
        firstClick = false;
        const revealedSquares = ensureSafeFirstClick(click);
        placeMines(revealedSquares);
        calculate();
        revealEmptySquares(click);
    }else{
        if(click.getAttribute('data-mine') === 'true'){
            click.style.backgroundColor = 'red';
            showGameOver();
        }else{
            revealEmptySquares(click);
        }
    }

    checkWin();
}

function ensureSafeFirstClick(startSquare){
    const squareArray = Array.from(document.querySelectorAll('.section'));
    const index = squareArray.indexOf(startSquare);
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;
    const safeSquares = new Set();

    for(let r = -1; r <= 1; r++){
        for(let c = -1; c <= 1; c++){
            const newRow = row + r;
            const newCol = col + c;

            if(newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize){
                const neighborIndex = newRow * boardSize + newCol;
                const neighbor = squareArray[neighborIndex];
                neighbor.setAttribute('data-mine', 'false');
                safeSquares.add(neighbor);
            }
        }
    }

    return safeSquares;
}

function placeMines(safeSquares){
    const squareArray = Array.from(document.querySelectorAll('.section'));
    
    let placed = 0;

    while(placed < totalMines){
        const randomIndex = Math.floor(Math.random() * squareArray.length);
        const square = squareArray[randomIndex];

        if(!safeSquares.has(square) && square.getAttribute('data-mine') === 'false'){
            square.setAttribute('data-mine', 'true');
            placed++;
        }
    }
}

function calculate(){
    const squareArray = Array.from(document.querySelectorAll('.section'));

    squareArray.forEach((square, index) => {
        const row = Math.floor(index / boardSize);
        const col = index % boardSize;
        let adjacent = 0;

        for(let r = -1; r <= 1; r++){
            for(let c = -1; c <= 1; c++){
                const newRow = row + r;
                const newCol = col + c;

                if(newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize){
                    const neighborIndex = newRow * boardSize + newCol;
                    const neighbor = squareArray[neighborIndex];
                    if(neighbor.getAttribute('data-mine') === 'true'){
                        adjacent++;
                    }
                }
            }
        }

        square.setAttribute('data-adjacent-mines', adjacent);
    });
}

function revealEmptySquares(square){
    const squareArray = Array.from(document.querySelectorAll('.section'));
    const stack = [square];
    const visited = new Set();

    while(stack.length){
        const current = stack.pop();
        if (visited.has(current)) continue;

        visited.add(current);

        const adjacent = parseInt(current.getAttribute('data-adjacent-mines'), 10);

        if(adjacent>0){
            current.textContent = adjacent;
        }else{
            current.textContent = '';
        }

        current.style.backgroundColor = 'lightgray';

        if(adjacent == 0){
            const index = squareArray.indexOf(current);
            const row = Math.floor(index / boardSize);
            const col = index % boardSize;

            for (let r = -1; r <= 1; r++){
                for (let c = -1; c <= 1; c++){
                    const newRow = row + r;
                    const newCol = col + c;
                    if(newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize){
                        const neighborIndex = newRow * boardSize + newCol;
                        const neighbor = squareArray[neighborIndex];
                        if (!visited.has(neighbor) && neighbor.style.backgroundColor !== 'lightgray') {
                            stack.push(neighbor);
                        }
                    }
                }
            }
        }
    }

    checkWin();
}

function toggleFlag(section){
    if(section.style.backgroundColor === 'lightgray'){
        return;
    }

    if (section.style.backgroundColor === 'orange'){
        section.style.backgroundColor = '';
        remainingFlags++;
    }else if(remainingFlags > 0){
        section.style.backgroundColor = 'orange';
        remainingFlags--;
    }
    updateFlags();
}

function updateFlags(){
    document.querySelector('#flags-count').textContent = remainingFlags;
}

function checkWin(){
    const squareArray = Array.from(document.querySelectorAll('.section'));
    let revealedSquares = 0;

    squareArray.forEach((square) => {
        if(square.style.backgroundColor === 'lightgray' && square.getAttribute('data-mine') === 'false'){
            revealedSquares++;
        }
    });

    const no = boardSize * boardSize - totalMines;

    if(revealedSquares == no){
        showCongratulations();
    }
}

function showGameOver(){
    document.getElementById('gameOverScreen').style.display = 'flex';
}

function showCongratulations(){
    document.getElementById('congratulationsScreen').style.display = 'flex';
}

function resetGame(){
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('congratulationsScreen').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('gameContainer').style.display = 'none';
}
