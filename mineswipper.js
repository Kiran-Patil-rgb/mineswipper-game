document.addEventListener('DOMContentLoaded', () => {

    const grid = document.querySelector('.grid');
    const restartButton = document.getElementById('restart-button');
    const scoreboard = document.getElementById('score');

    const columns = 10;
    const rows = 10;
    const totalCells = columns * rows;
    const totalBombs = 20;

    let isGameOver = false;
    let boxes = [];
    let score = 0;

    // START GAME
    function startGame() {
        grid.innerHTML = '';
        boxes = [];
        isGameOver = false;

        if (restartButton) restartButton.style.display = 'none';

        score = 0;
        updateScore();

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('box');
            cell.setAttribute('data-id', i);

            cell.addEventListener('click', checkCell);
            cell.addEventListener('contextmenu', addFlag);

            grid.appendChild(cell);
            boxes.push(cell);
        }

        // PLACE BOMBS
        let bombLocations = [];
        while (bombLocations.length < totalBombs) {
            let randomIndex = Math.floor(Math.random() * totalCells);
            if (!bombLocations.includes(randomIndex)) {
                bombLocations.push(randomIndex);
                boxes[randomIndex].classList.add('mine');
            }
        }
    }

    // UPDATE SCORE
    function updateScore() {
        if (scoreboard) scoreboard.textContent = score;
    }

    if (restartButton) {
        restartButton.addEventListener('click', startGame);
    }

    // CLICK CELL
    function checkCell(event) {
        const clickedCell = event.target;
        const cellIndex = parseInt(clickedCell.dataset.id);

        if (isGameOver || clickedCell.classList.contains('clicked') || clickedCell.classList.contains('flag')) {
            return;
        }

        if (clickedCell.classList.contains('mine')) {
            gameOver();
            return;
        }

        const adjacentMines = countAdjacentMines(cellIndex);

        clickedCell.classList.add('clicked');
        clickedCell.style.backgroundColor = 'rgb(214,214,214)';

        score++;
        updateScore();

        if (adjacentMines > 0) {
            clickedCell.innerHTML = `<span>${adjacentMines}</span>`;

            // ✅ MOBILE HINT
            highlightNearbyCells(cellIndex);

        } else {
            clearAdjacentBlanks(cellIndex);
        }

        checkWinCondition();
    }

    // COUNT MINES
    function countAdjacentMines(cellIndex) {
        let count = 0;

        const isLeftEdge = (cellIndex % columns === 0);
        const isRightEdge = (cellIndex % columns === columns - 1);

        const adjacentIndices = [
            cellIndex - columns, cellIndex + columns,
            !isLeftEdge && cellIndex - 1, !isRightEdge && cellIndex + 1,
            !isLeftEdge && cellIndex - columns - 1, !isRightEdge && cellIndex - columns + 1,
            !isLeftEdge && cellIndex + columns - 1, !isRightEdge && cellIndex + columns + 1
        ].filter(index => index !== false);

        adjacentIndices.forEach(index => {
            if (index >= 0 && index < totalCells && boxes[index].classList.contains('mine')) {
                count++;
            }
        });

        return count;
    }

    // CLEAR EMPTY CELLS
    function clearAdjacentBlanks(cellIndex) {
        const cell = boxes[cellIndex];
        if (!cell || cell.classList.contains('clicked')) return;

        score++;
        updateScore();

        cell.classList.add('clicked');
        cell.style.backgroundColor = 'rgb(214,214,214)';

        const adjacentMines = countAdjacentMines(cellIndex);

        if (adjacentMines > 0) {
            cell.innerHTML = `<span>${adjacentMines}</span>`;
            return;
        }

        const isLeftEdge = (cellIndex % columns === 0);
        const isRightEdge = (cellIndex % columns === columns - 1);

        const adjacentIndices = [
            cellIndex - columns, cellIndex + columns,
            !isLeftEdge && cellIndex - 1, !isRightEdge && cellIndex + 1,
            !isLeftEdge && cellIndex - columns - 1, !isRightEdge && cellIndex - columns + 1,
            !isLeftEdge && cellIndex + columns - 1, !isRightEdge && cellIndex + columns + 1
        ].filter(index => index !== false);

        adjacentIndices.forEach(index => {
            if (index >= 0 && index < totalCells) {
                clearAdjacentBlanks(index);
            }
        });
    }

    // GAME OVER
    function gameOver() {
        isGameOver = true;
        alert('Game over! You stepped on a bomb.');

        boxes.forEach(cell => {
            if (cell.classList.contains('mine')) {
                cell.style.backgroundColor = 'red';
                cell.innerHTML = `<span>💣</span>`;
            }
        });

        if (restartButton) restartButton.style.display = 'block';
    }

    // WIN CHECK
    function checkWinCondition() {
        const clickedCells = boxes.filter(cell => cell.classList.contains('clicked')).length;
        const nonMineCells = totalCells - totalBombs;

        if (clickedCells === nonMineCells) {
            isGameOver = true;
            alert('Congratulations! You won 🎉');

            document.body.classList.add('win-background');

            if (restartButton) restartButton.style.display = 'block';
        }
    }

    // FLAG
    function addFlag(event) {
        event.preventDefault();

        const cell = event.target;

        if (isGameOver || cell.classList.contains('clicked')) return;

        if (cell.classList.contains('flag')) {
            cell.classList.remove('flag');
            cell.innerHTML = '';
        } else {
            cell.classList.add('flag');
            cell.innerHTML = `<span>🚩</span>`;
        }
    }

    // ✅ NEW FUNCTION (IMPORTANT)
    function highlightNearbyCells(cellIndex) {
        const isLeftEdge = (cellIndex % columns === 0);
        const isRightEdge = (cellIndex % columns === columns - 1);

        const adjacentIndices = [
            cellIndex - columns, cellIndex + columns,
            !isLeftEdge && cellIndex - 1, !isRightEdge && cellIndex + 1,
            !isLeftEdge && cellIndex - columns - 1, !isRightEdge && cellIndex - columns + 1,
            !isLeftEdge && cellIndex + columns - 1, !isRightEdge && cellIndex + columns + 1
        ].filter(index => index !== false);

        adjacentIndices.forEach(index => {
            if (index >= 0 && index < totalCells) {
                boxes[index].classList.add('hint');

                setTimeout(() => {
                    boxes[index].classList.remove('hint');
                }, 600);
            }
        });
    }

    // START
    startGame();
    document.body.classList.remove('win-background');
});