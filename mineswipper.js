document.addEventListener('DOMContentLoaded', () => {
    // Selects the game container and button//
    const grid = document.querySelector(`.grid`);
    const restartButton = document.getElementById('restart-button');
    const scoreboard = document.getElementById('score'); 
    const columns = 10;
    const rows = 10;
    const totalCells = columns * rows;
    const totalBombs = 20;
    let isGameOver = false;
    let boxes = [];
    let score = 0; 

     // A function to start and restart the game//
    function startGame() {
         // Clears the grid//
        grid.innerHTML = '';
        boxes = [];
        isGameOver = false;
        if (restartButton) {
            restartButton.style.display = 'none';
        }
        score = 0; // Resets the score//
        updateScore(); //Updates the scoreboard//

         // Loop to create cells and add them to the grid//
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement(`div`);
            cell.classList.add(`box`);
            cell.setAttribute('data-id', i);
            cell.addEventListener(`click`, checkCell);
            cell.addEventListener('contextmenu', addFlag);
            cell.addEventListener('mouseenter', handleHint);
            cell.addEventListener('mouseleave', handleHintEnd);
            grid.appendChild(cell);
            boxes.push(cell);
        }

         // Loop to place bombs//
        let bombLocations = [];
        while (bombLocations.length < totalBombs) {
            let randomIndex = Math.floor(Math.random() * totalCells);
            if (!bombLocations.includes(randomIndex)) {
                bombLocations.push(randomIndex);
                boxes[randomIndex].classList.add('mine');
            }
        }
    }

    // A function to update the score//
    function updateScore() {
        if (scoreboard) {
            scoreboard.textContent = score;
        }
    }

   // Adds a click listener to the restart button//
    if (restartButton) {
        restartButton.addEventListener('click', startGame);
    }

    // This function runs when a box is clicked//
    function checkCell(event) {
        const clickedCell = event.target;
        const cellIndex = parseInt(clickedCell.dataset.id);

        if (isGameOver || clickedCell.classList.contains('clicked') || clickedCell.classList.contains('flag')) {
            return;
        }

        if (clickedCell.classList.contains('mine')) {
            gameOver();
        } else {
            const adjacentMines = countAdjacentMines(cellIndex);
            clickedCell.classList.add('clicked');
            clickedCell.style.backgroundColor = `rgb(214,214,214)`;
            score++; 
            updateScore(); 

            if (adjacentMines > 0) {
                clickedCell.innerHTML = `<span>${adjacentMines}</span>`;
            } else {
                clearAdjacentBlanks(cellIndex);
            }
        }
        checkWinCondition();
    }
    
   // This function counts adjacent mines.//
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

        for (const index of adjacentIndices) {
            if (index >= 0 && index < totalCells && boxes[index] && boxes[index].classList.contains('mine')) {
                count++;
            }
        }
        return count;
    }

    // This function automatically clears empty cells.//
    function clearAdjacentBlanks(cellIndex) {
        const cell = boxes[cellIndex];
        if (!cell || cell.classList.contains('clicked')) return;
        
        
        score++;
        updateScore();

        cell.classList.add('clicked');
        cell.style.backgroundColor = `rgb(214,214,214)`;

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
        for (const index of adjacentIndices) {
            if (index >= 0 && index < totalCells && boxes[index]) {
                clearAdjacentBlanks(index);
            }
        }
    }

    // This function ends the game.//
    function gameOver() {
        isGameOver = true;
        alert('Game over! You stepped on a bomb.');
        boxes.forEach(cell => {
            if (cell.classList.contains('mine')) {
                cell.style.backgroundColor = 'red';
                cell.innerHTML = `<span>💣</span>`;
                cell.classList.add('bomb-revealed');
            }
            cell.removeEventListener(`click`, checkCell);
            cell.removeEventListener('contextmenu', addFlag);
        });
        if (restartButton) {
            restartButton.style.display = 'block';
        }
    }

     // Checks the win condition.//
    function checkWinCondition() {
        const clickedCells = boxes.filter(cell => cell.classList.contains('clicked')).length;
        const nonMineCells = totalCells - totalBombs;
        if (clickedCells === nonMineCells) {
            isGameOver = true;
            alert('Congratulations, you have won!');
             document.body.classList.add('win-background');
              party.confetti(document.body, {
            count: party.variation.range(100, 200) 
        });


            if (restartButton) {
                restartButton.style.display = 'block';
            }
        }
    }

    // For adding/removing flags//
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

    function handleHint(event) {
        if (isGameOver) return;
        const hoveredCell = event.target;
        if (hoveredCell.classList.contains('mine')) {
            hoveredCell.classList.add('hint');
        }
    }

    function handleHintEnd(event) {
        if (isGameOver) return;
        const hoveredCell = event.target;
        hoveredCell.classList.remove('hint');
    }

   // Starts the game for the first time//
    startGame();
    document.body.classList.remove('win-background');
});