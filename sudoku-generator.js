class SudokuGenerator {
    constructor() {
        this.solver = new SudokuSolver();
    }

    // Generate a complete valid Sudoku grid
    generateComplete() {
        const grid = Array(9).fill().map(() => Array(9).fill(0));
        this.fillGrid(grid);
        return grid;
    }

    // Fill the grid using backtracking with randomization
    fillGrid(grid) {
        const emptyCells = this.getEmptyCells(grid);
        
        if (emptyCells.length === 0) {
            return true; // Grid is complete
        }

        // Get the first empty cell
        const { row, col } = emptyCells[0];
        
        // Get possible numbers and shuffle them for randomization
        const numbers = this.getShuffledNumbers();
        
        for (const num of numbers) {
            if (this.solver.isValid(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (this.fillGrid(grid)) {
                    return true;
                }
                
                grid[row][col] = 0;
            }
        }
        
        return false;
    }

    // Get empty cells
    getEmptyCells(grid) {
        const cells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    cells.push({ row, col });
                }
            }
        }
        return cells;
    }

    // Get shuffled numbers 1-9
    getShuffledNumbers() {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        return this.shuffleArray(numbers);
    }

    // Shuffle array using Fisher-Yates algorithm
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Generate a puzzle by removing numbers from a complete grid
    generatePuzzle(difficulty = 'medium') {
        const completeGrid = this.generateComplete();
        const puzzle = this.solver.copyGrid(completeGrid);
        
        const difficultySettings = {
            easy: { minClues: 36, maxClues: 46 },
            medium: { minClues: 28, maxClues: 35 },
            hard: { minClues: 22, maxClues: 27 },
            expert: { minClues: 17, maxClues: 21 }
        };

        const settings = difficultySettings[difficulty] || difficultySettings.medium;
        const targetClues = Math.floor(Math.random() * (settings.maxClues - settings.minClues + 1)) + settings.minClues;
        
        // Create list of all positions
        const positions = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                positions.push({ row, col });
            }
        }
        
        // Shuffle positions
        const shuffledPositions = this.shuffleArray(positions);
        
        // Remove numbers while maintaining unique solution
        let cluesRemaining = 81;
        
        for (const { row, col } of shuffledPositions) {
            if (cluesRemaining <= targetClues) {
                break;
            }
            
            const originalValue = puzzle[row][col];
            puzzle[row][col] = 0;
            
            // Check if puzzle still has unique solution
            if (this.hasUniqueSolution(puzzle)) {
                cluesRemaining--;
            } else {
                // Restore the number if removing it creates multiple solutions
                puzzle[row][col] = originalValue;
            }
        }

        return {
            puzzle: puzzle,
            solution: completeGrid,
            difficulty: difficulty,
            clues: cluesRemaining
        };
    }

    // Check if puzzle has a unique solution
    hasUniqueSolution(grid) {
        const solutions = [];
        this.countSolutions(this.solver.copyGrid(grid), solutions, 2);
        return solutions.length === 1;
    }

    // Count solutions (stop at maxSolutions for efficiency)
    countSolutions(grid, solutions, maxSolutions) {
        if (solutions.length >= maxSolutions) {
            return;
        }

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.solver.isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            this.countSolutions(grid, solutions, maxSolutions);
                            grid[row][col] = 0;
                            
                            if (solutions.length >= maxSolutions) {
                                return;
                            }
                        }
                    }
                    return;
                }
            }
        }
        
        // If we reach here, the grid is complete
        solutions.push(this.solver.copyGrid(grid));
    }

    // Generate multiple puzzles for different difficulties
    generatePuzzleSet() {
        return {
            easy: this.generatePuzzle('easy'),
            medium: this.generatePuzzle('medium'),
            hard: this.generatePuzzle('hard'),
            expert: this.generatePuzzle('expert')
        };
    }

    // Create a symmetric puzzle (optional aesthetic feature)
    generateSymmetricPuzzle(difficulty = 'medium') {
        const completeGrid = this.generateComplete();
        const puzzle = this.solver.copyGrid(completeGrid);
        
        const difficultySettings = {
            easy: { removeCount: 35 },
            medium: { removeCount: 45 },
            hard: { removeCount: 55 },
            expert: { removeCount: 60 }
        };

        const settings = difficultySettings[difficulty] || difficultySettings.medium;
        
        // Create symmetric pairs
        const pairs = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const symRow = 8 - row;
                const symCol = 8 - col;
                
                if (row < symRow || (row === symRow && col <= symCol)) {
                    pairs.push([{ row, col }, { row: symRow, col: symCol }]);
                }
            }
        }
        
        // Shuffle pairs and remove symmetrically
        const shuffledPairs = this.shuffleArray(pairs);
        let removed = 0;
        
        for (const pair of shuffledPairs) {
            if (removed >= settings.removeCount) {
                break;
            }
            
            // Try removing both positions in the pair
            const originalValues = pair.map(pos => puzzle[pos.row][pos.col]);
            pair.forEach(pos => puzzle[pos.row][pos.col] = 0);
            
            if (this.hasUniqueSolution(puzzle)) {
                removed += pair.length;
            } else {
                // Restore if it doesn't maintain unique solution
                pair.forEach((pos, index) => {
                    puzzle[pos.row][pos.col] = originalValues[index];
                });
            }
        }

        return {
            puzzle: puzzle,
            solution: completeGrid,
            difficulty: difficulty,
            clues: 81 - removed,
            symmetric: true
        };
    }
}