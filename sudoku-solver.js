class SudokuSolver {
    constructor() {
        this.grid = [];
    }

    // Check if a number is valid in a given position
    isValid(grid, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) {
                return false;
            }
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) {
                return false;
            }
        }

        // Check 3x3 box
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    // Solve the Sudoku using backtracking
    solve(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            
                            if (this.solve(grid)) {
                                return true;
                            }
                            
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Get all possible numbers for a cell
    getPossibleNumbers(grid, row, col) {
        if (grid[row][col] !== 0) {
            return [];
        }

        const possible = [];
        for (let num = 1; num <= 9; num++) {
            if (this.isValid(grid, row, col, num)) {
                possible.push(num);
            }
        }
        return possible;
    }

    // Find the next hint (cell with fewest possibilities)
    getHint(grid) {
        let minPossibilities = 10;
        let hintCell = null;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const possibilities = this.getPossibleNumbers(grid, row, col);
                    if (possibilities.length > 0 && possibilities.length < minPossibilities) {
                        minPossibilities = possibilities.length;
                        hintCell = {
                            row: row,
                            col: col,
                            number: possibilities[0],
                            possibilities: possibilities
                        };
                    }
                }
            }
        }

        return hintCell;
    }

    // Check if the current state is valid (no conflicts)
    isValidState(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] !== 0) {
                    const num = grid[row][col];
                    grid[row][col] = 0; // Temporarily remove to check
                    
                    if (!this.isValid(grid, row, col, num)) {
                        grid[row][col] = num; // Restore
                        return false;
                    }
                    
                    grid[row][col] = num; // Restore
                }
            }
        }
        return true;
    }

    // Check if the puzzle is complete
    isComplete(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    return false;
                }
            }
        }
        return this.isValidState(grid);
    }

    // Count filled cells
    countFilledCells(grid) {
        let count = 0;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] !== 0) {
                    count++;
                }
            }
        }
        return count;
    }

    // Deep copy a grid
    copyGrid(grid) {
        return grid.map(row => [...row]);
    }

    // Check if a move is valid
    isValidMove(grid, row, col, num) {
        if (num === 0) return true; // Erasing is always valid
        return this.isValid(grid, row, col, num);
    }

    // Get all empty cells
    getEmptyCells(grid) {
        const emptyCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        return emptyCells;
    }

    // Advanced solving techniques
    solveSingleCandidates(grid) {
        let changed = false;
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const possibilities = this.getPossibleNumbers(grid, row, col);
                    if (possibilities.length === 1) {
                        grid[row][col] = possibilities[0];
                        changed = true;
                    }
                }
            }
        }
        
        return changed;
    }

    // Solve using logical techniques before backtracking
    solveLogically(grid) {
        let changed = true;
        while (changed) {
            changed = this.solveSingleCandidates(grid);
        }
    }
}