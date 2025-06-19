class SudokuGame {
    constructor() {
        this.solver = new SudokuSolver();
        this.generator = new SudokuGenerator();
        this.currentPuzzle = null;
        this.currentSolution = null;
        this.playerGrid = null;
        this.originalGrid = null;
        this.selectedCell = null;
        this.selectedNumber = null;
        this.notesMode = false;
        this.highlightMode = true;
        this.autoValidate = true;
        this.gameStartTime = null;
        this.gameTimer = null;
        this.mistakes = 0;
        this.hintsUsed = 0;
        this.currentDifficulty = 'easy';
        this.isGameComplete = false;
        this.playerNotes = {};

        this.initializeGame();
        this.bindEvents();
    }

    initializeGame() {
        this.createGrid();
        this.generateNewPuzzle();
        this.startTimer();
    }

    createGrid() {
        const gridContainer = document.getElementById('sudoku-grid');
        gridContainer.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.selectCell(row, col));
                gridContainer.appendChild(cell);
            }
        }
    }

    bindEvents() {
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeDifficulty(e.target.dataset.difficulty);
            });
        });

        // Control buttons
        document.getElementById('new-game').addEventListener('click', () => this.generateNewPuzzle());
        document.getElementById('solve').addEventListener('click', () => this.solvePuzzle());
        document.getElementById('hint').addEventListener('click', () => this.giveHint());
        document.getElementById('validate').addEventListener('click', () => this.validatePuzzle());
        document.getElementById('reset').addEventListener('click', () => this.resetPuzzle());

        // Number pad
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = parseInt(e.target.dataset.number);
                this.selectNumber(number);
            });
        });

        // Game modes
        document.getElementById('notes-mode').addEventListener('change', (e) => {
            this.notesMode = e.target.checked;
            this.updateSelectedNumber();
        });

        document.getElementById('highlight-mode').addEventListener('change', (e) => {
            this.highlightMode = e.target.checked;
            this.updateHighlights();
        });

        document.getElementById('auto-validate').addEventListener('change', (e) => {
            this.autoValidate = e.target.checked;
        });

        // Modal events
        document.getElementById('play-again').addEventListener('click', () => {
            this.closeModal();
            this.generateNewPuzzle();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Click outside to deselect
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sudoku-grid') && !e.target.closest('.number-buttons')) {
                this.deselectCell();
            }
        });
    }

    generateNewPuzzle() {
        this.isGameComplete = false;
        this.mistakes = 0;
        this.hintsUsed = 0;
        this.playerNotes = {};
        
        const puzzleData = this.generator.generatePuzzle(this.currentDifficulty);
        this.currentPuzzle = puzzleData.puzzle;
        this.currentSolution = puzzleData.solution;
        this.playerGrid = this.solver.copyGrid(this.currentPuzzle);
        this.originalGrid = this.solver.copyGrid(this.currentPuzzle);
        
        this.updateGrid();
        this.updateStats();
        this.startTimer();
        
        // Clear any previous selections
        this.deselectCell();
        this.deselectNumber();
    }

    updateGrid() {
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.playerGrid[row][col];
            const originalValue = this.originalGrid[row][col];
            
            // Clear previous classes
            cell.className = 'cell';
            cell.innerHTML = '';
            
            // Add appropriate classes
            if (originalValue !== 0) {
                cell.classList.add('given');
            }
            
            if (value !== 0) {
                cell.textContent = value;
                
                if (this.autoValidate && originalValue === 0) {
                    if (value === this.currentSolution[row][col]) {
                        cell.classList.add('correct');
                    } else {
                        cell.classList.add('error');
                    }
                }
            } else {
                // Show notes if in notes mode
                const noteKey = `${row}-${col}`;
                if (this.playerNotes[noteKey]) {
                    this.displayNotes(cell, this.playerNotes[noteKey]);
                }
            }
        });
        
        this.updateHighlights();
    }

    displayNotes(cell, notes) {
        const notesContainer = document.createElement('div');
        notesContainer.className = 'notes';
        
        for (let i = 1; i <= 9; i++) {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'note';
            if (notes.includes(i)) {
                noteDiv.textContent = i;
            }
            notesContainer.appendChild(noteDiv);
        }
        
        cell.appendChild(notesContainer);
    }

    selectCell(row, col) {
        // Don't select given cells
        if (this.originalGrid[row][col] !== 0) {
            return;
        }
        
        this.selectedCell = { row, col };
        this.updateCellSelection();
        this.updateHighlights();
    }

    deselectCell() {
        this.selectedCell = null;
        this.updateCellSelection();
        this.updateHighlights();
    }

    updateCellSelection() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        if (this.selectedCell) {
            const { row, col } = this.selectedCell;
            const cellIndex = row * 9 + col;
            const cell = document.querySelectorAll('.cell')[cellIndex];
            cell.classList.add('selected');
        }
    }

    selectNumber(number) {
        if (this.selectedNumber === number) {
            this.deselectNumber();
        } else {
            this.selectedNumber = number;
            this.updateSelectedNumber();
            
            // If a cell is selected, place the number
            if (this.selectedCell) {
                this.placeNumber(this.selectedCell.row, this.selectedCell.col, number);
            }
        }
    }

    deselectNumber() {
        this.selectedNumber = null;
        this.updateSelectedNumber();
    }

    updateSelectedNumber() {
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (this.selectedNumber !== null) {
            const btn = document.querySelector(`[data-number="${this.selectedNumber}"]`);
            if (btn) {
                btn.classList.add('active');
            }
        }
    }

    placeNumber(row, col, number) {
        // Don't modify given cells
        if (this.originalGrid[row][col] !== 0) {
            return;
        }

        const noteKey = `${row}-${col}`;
        
        if (this.notesMode && number !== 0) {
            // Toggle note
            if (!this.playerNotes[noteKey]) {
                this.playerNotes[noteKey] = [];
            }
            
            const noteIndex = this.playerNotes[noteKey].indexOf(number);
            if (noteIndex > -1) {
                this.playerNotes[noteKey].splice(noteIndex, 1);
            } else {
                this.playerNotes[noteKey].push(number);
            }
            
            if (this.playerNotes[noteKey].length === 0) {
                delete this.playerNotes[noteKey];
            }
        } else {
            // Place number
            const oldValue = this.playerGrid[row][col];
            this.playerGrid[row][col] = number;
            
            // Clear notes for this cell
            delete this.playerNotes[noteKey];
            
            // Check for mistakes
            if (number !== 0 && this.autoValidate) {
                if (number !== this.currentSolution[row][col]) {
                    this.mistakes++;
                    this.animateError(row, col);
                } else {
                    this.animateCorrect(row, col);
                    
                    // Clear related notes
                    this.clearRelatedNotes(row, col, number);
                }
            }
        }
        
        this.updateGrid();
        this.updateStats();
        this.checkCompletion();
    }

    clearRelatedNotes(row, col, number) {
        // Clear notes in same row, column, and box
        for (let i = 0; i < 9; i++) {
            // Same row
            const rowKey = `${row}-${i}`;
            if (this.playerNotes[rowKey]) {
                const index = this.playerNotes[rowKey].indexOf(number);
                if (index > -1) {
                    this.playerNotes[rowKey].splice(index, 1);
                    if (this.playerNotes[rowKey].length === 0) {
                        delete this.playerNotes[rowKey];
                    }
                }
            }
            
            // Same column
            const colKey = `${i}-${col}`;
            if (this.playerNotes[colKey]) {
                const index = this.playerNotes[colKey].indexOf(number);
                if (index > -1) {
                    this.playerNotes[colKey].splice(index, 1);
                    if (this.playerNotes[colKey].length === 0) {
                        delete this.playerNotes[colKey];
                    }
                }
            }
        }
        
        // Same 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const boxKey = `${startRow + i}-${startCol + j}`;
                if (this.playerNotes[boxKey]) {
                    const index = this.playerNotes[boxKey].indexOf(number);
                    if (index > -1) {
                        this.playerNotes[boxKey].splice(index, 1);
                        if (this.playerNotes[boxKey].length === 0) {
                            delete this.playerNotes[boxKey];
                        }
                    }
                }
            }
        }
    }

    updateHighlights() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('highlighted', 'same-number');
        });
        
        if (!this.highlightMode || !this.selectedCell) {
            return;
        }
        
        const { row, col } = this.selectedCell;
        const selectedValue = this.playerGrid[row][col];
        
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const cellRow = Math.floor(index / 9);
            const cellCol = index % 9;
            
            // Highlight same row, column, or box
            if (cellRow === row || cellCol === col || 
                (Math.floor(cellRow / 3) === Math.floor(row / 3) && 
                 Math.floor(cellCol / 3) === Math.floor(col / 3))) {
                cell.classList.add('highlighted');
            }
            
            // Highlight same numbers
            if (selectedValue !== 0 && this.playerGrid[cellRow][cellCol] === selectedValue) {
                cell.classList.add('same-number');
            }
        });
    }

    animateError(row, col) {
        const cellIndex = row * 9 + col;
        const cell = document.querySelectorAll('.cell')[cellIndex];
        cell.classList.add('error');
        
        setTimeout(() => {
            cell.classList.remove('error');
        }, 1000);
    }

    animateCorrect(row, col) {
        const cellIndex = row * 9 + col;
        const cell = document.querySelectorAll('.cell')[cellIndex];
        cell.classList.add('correct');
        
        setTimeout(() => {
            cell.classList.remove('correct');
        }, 1000);
    }

    giveHint() {
        if (this.isGameComplete) {
            return;
        }
        
        const hint = this.solver.getHint(this.playerGrid);
        if (hint) {
            this.playerGrid[hint.row][hint.col] = hint.number;
            this.hintsUsed++;
            
            // Animate hint
            const cellIndex = hint.row * 9 + hint.col;
            const cell = document.querySelectorAll('.cell')[cellIndex];
            cell.classList.add('hint');
            
            setTimeout(() => {
                cell.classList.remove('hint');
            }, 2000);
            
            // Clear notes for this cell
            const noteKey = `${hint.row}-${hint.col}`;
            delete this.playerNotes[noteKey];
            
            // Clear related notes
            this.clearRelatedNotes(hint.row, hint.col, hint.number);
            
            this.updateGrid();
            this.updateStats();
            this.checkCompletion();
        }
    }

    solvePuzzle() {
        if (confirm('Are you sure you want to solve the puzzle? This will end the current game.')) {
            this.playerGrid = this.solver.copyGrid(this.currentSolution);
            this.playerNotes = {};
            this.isGameComplete = true;
            this.updateGrid();
            this.stopTimer();
        }
    }

    validatePuzzle() {
        const isValid = this.solver.isValidState(this.playerGrid);
        const message = isValid ? 
            'The current state is valid! Keep going!' : 
            'There are conflicts in the current state. Check for duplicate numbers.';
        
        alert(message);
    }

    resetPuzzle() {
        if (confirm('Are you sure you want to reset the puzzle? All progress will be lost.')) {
            this.playerGrid = this.solver.copyGrid(this.originalGrid);
            this.playerNotes = {};
            this.mistakes = 0;
            this.hintsUsed = 0;
            this.isGameComplete = false;
            this.updateGrid();
            this.updateStats();
            this.startTimer();
        }
    }

    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        
        // Update UI
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        document.getElementById('current-difficulty').textContent = 
            difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        
        this.generateNewPuzzle();
    }

    checkCompletion() {
        if (this.solver.isComplete(this.playerGrid)) {
            this.isGameComplete = true;
            this.stopTimer();
            this.showVictoryModal();
        }
    }

    showVictoryModal() {
        const modal = document.getElementById('victory-modal');
        const finalTime = document.getElementById('timer').textContent;
        
        document.getElementById('final-time').textContent = finalTime;
        document.getElementById('final-difficulty').textContent = 
            this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1);
        document.getElementById('final-mistakes').textContent = this.mistakes;
        document.getElementById('final-hints').textContent = this.hintsUsed;
        
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('victory-modal').style.display = 'none';
    }

    startTimer() {
        this.gameStartTime = Date.now();
        this.stopTimer(); // Clear any existing timer
        
        this.gameTimer = setInterval(() => {
            const elapsed = Date.now() - this.gameStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    updateStats() {
        document.getElementById('mistakes-count').textContent = this.mistakes;
        document.getElementById('hints-count').textContent = this.hintsUsed;
        
        const filledCells = this.solver.countFilledCells(this.playerGrid);
        const completion = Math.round((filledCells / 81) * 100);
        document.getElementById('completion-percent').textContent = `${completion}%`;
    }

    handleKeyPress(e) {
        if (this.isGameComplete) {
            return;
        }
        
        // Number keys
        if (e.key >= '1' && e.key <= '9') {
            const number = parseInt(e.key);
            this.selectNumber(number);
        }
        
        // Delete/Backspace to erase
        if (e.key === 'Delete' || e.key === 'Backspace') {
            this.selectNumber(0);
        }
        
        // Arrow keys for navigation
        if (this.selectedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const { row, col } = this.selectedCell;
            let newRow = row;
            let newCol = col;
            
            switch (e.key) {
                case 'ArrowUp':
                    newRow = Math.max(0, row - 1);
                    break;
                case 'ArrowDown':
                    newRow = Math.min(8, row + 1);
                    break;
                case 'ArrowLeft':
                    newCol = Math.max(0, col - 1);
                    break;
                case 'ArrowRight':
                    newCol = Math.min(8, col + 1);
                    break;
            }
            
            this.selectCell(newRow, newCol);
        }
        
        // Escape to deselect
        if (e.key === 'Escape') {
            this.deselectCell();
            this.deselectNumber();
        }
        
        // 'n' for notes mode toggle
        if (e.key.toLowerCase() === 'n') {
            const notesCheckbox = document.getElementById('notes-mode');
            notesCheckbox.checked = !notesCheckbox.checked;
            this.notesMode = notesCheckbox.checked;
            this.updateSelectedNumber();
        }
        
        // 'h' for hint
        if (e.key.toLowerCase() === 'h') {
            this.giveHint();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});