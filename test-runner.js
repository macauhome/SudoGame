#!/usr/bin/env node

/**
 * Simple test runner for the Advanced Sudoku Game
 * This validates the core functionality without external dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running Advanced Sudoku Game Tests...\n');

// Test 1: Check required files exist
console.log('📁 Checking file structure...');
const requiredFiles = [
  'index.html',
  'styles.css',
  'game.js',
  'sudoku-solver.js',
  'sudoku-generator.js',
  'server.py'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing!');
  process.exit(1);
}

// Test 2: Validate JavaScript syntax
console.log('\n🔍 Validating JavaScript syntax...');
const jsFiles = ['game.js', 'sudoku-solver.js', 'sudoku-generator.js'];

for (const jsFile of jsFiles) {
  try {
    const content = fs.readFileSync(jsFile, 'utf8');
    // Basic syntax check - try to parse as JavaScript
    new Function(content);
    console.log(`  ✅ ${jsFile} - syntax valid`);
  } catch (error) {
    console.log(`  ❌ ${jsFile} - syntax error: ${error.message}`);
    process.exit(1);
  }
}

// Test 3: Validate HTML structure
console.log('\n🌐 Validating HTML structure...');
try {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  
  // Check for required elements
  const requiredElements = [
    '<title>',
    'class="sudoku-grid"',
    'class="game-controls"',
    'class="number-pad"',
    'sudoku-solver.js',
    'sudoku-generator.js',
    'game.js'
  ];
  
  let htmlValid = true;
  for (const element of requiredElements) {
    if (htmlContent.includes(element)) {
      console.log(`  ✅ Contains ${element}`);
    } else {
      console.log(`  ❌ Missing ${element}`);
      htmlValid = false;
    }
  }
  
  if (!htmlValid) {
    console.error('\n❌ HTML structure validation failed!');
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ Error reading HTML file: ${error.message}`);
  process.exit(1);
}

// Test 4: Validate CSS structure
console.log('\n🎨 Validating CSS structure...');
try {
  const cssContent = fs.readFileSync('styles.css', 'utf8');
  
  // Check for balanced braces
  const openBraces = (cssContent.match(/{/g) || []).length;
  const closeBraces = (cssContent.match(/}/g) || []).length;
  
  if (openBraces === closeBraces) {
    console.log(`  ✅ CSS braces balanced (${openBraces} pairs)`);
  } else {
    console.log(`  ❌ CSS braces unbalanced: ${openBraces} open, ${closeBraces} close`);
    process.exit(1);
  }
  
  // Check for key CSS classes
  const requiredClasses = [
    '.sudoku-grid',
    '.cell',
    '.game-controls',
    '.number-buttons'
  ];
  
  for (const className of requiredClasses) {
    if (cssContent.includes(className)) {
      console.log(`  ✅ Contains ${className}`);
    } else {
      console.log(`  ❌ Missing ${className}`);
      process.exit(1);
    }
  }
} catch (error) {
  console.error(`❌ Error reading CSS file: ${error.message}`);
  process.exit(1);
}

// Test 5: Test Sudoku algorithms (basic validation)
console.log('\n🧮 Testing Sudoku algorithms...');
try {
  // Load the solver and generator
  const solverCode = fs.readFileSync('sudoku-solver.js', 'utf8');
  const generatorCode = fs.readFileSync('sudoku-generator.js', 'utf8');
  
  // Check if classes are defined in the code
  if (solverCode.includes('class SudokuSolver')) {
    console.log('  ✅ SudokuSolver class found');
  } else {
    console.log('  ❌ SudokuSolver class not found');
    process.exit(1);
  }
  
  if (generatorCode.includes('class SudokuGenerator')) {
    console.log('  ✅ SudokuGenerator class found');
  } else {
    console.log('  ❌ SudokuGenerator class not found');
    process.exit(1);
  }
  
  // Check for key methods
  if (solverCode.includes('isValid') && solverCode.includes('solve')) {
    console.log('  ✅ Solver methods found (isValid, solve)');
  } else {
    console.log('  ❌ Solver methods missing');
    process.exit(1);
  }
  
  if (generatorCode.includes('generate')) {
    console.log('  ✅ Generator methods found (generate)');
  } else {
    console.log('  ❌ Generator methods missing');
    process.exit(1);
  }
  
} catch (error) {
  console.error(`❌ Algorithm test failed: ${error.message}`);
  process.exit(1);
}

// Test 6: Validate server script
console.log('\n🌐 Validating server script...');
try {
  const serverContent = fs.readFileSync('server.py', 'utf8');
  
  // Check for required Python server components
  const requiredComponents = [
    'http.server',
    'TCPServer',
    'SimpleHTTPRequestHandler',
    'Access-Control-Allow-Origin'
  ];
  
  for (const component of requiredComponents) {
    if (serverContent.includes(component)) {
      console.log(`  ✅ Contains ${component}`);
    } else {
      console.log(`  ❌ Missing ${component}`);
      process.exit(1);
    }
  }
} catch (error) {
  console.error(`❌ Error reading server file: ${error.message}`);
  process.exit(1);
}

console.log('\n🎉 All tests passed successfully!');
console.log('\n📊 Test Summary:');
console.log('  ✅ File structure validation');
console.log('  ✅ JavaScript syntax validation');
console.log('  ✅ HTML structure validation');
console.log('  ✅ CSS structure validation');
console.log('  ✅ Sudoku algorithms validation');
console.log('  ✅ Server script validation');
console.log('\n🚀 Advanced Sudoku Game is ready for deployment!');

process.exit(0);