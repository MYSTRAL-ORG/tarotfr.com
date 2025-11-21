#!/usr/bin/env node

/**
 * Script to remove console.log/warn/info/debug statements from source code
 * while keeping console.error for production error tracking
 */

const fs = require('fs');
const path = require('path');

const DIRS_TO_CLEAN = ['app', 'components', 'lib', 'contexts', 'hooks'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const CONSOLE_PATTERNS = [
  /console\.log\([^)]*\);?\s*/g,
  /console\.warn\([^)]*\);?\s*/g,
  /console\.info\([^)]*\);?\s*/g,
  /console\.debug\([^)]*\);?\s*/g,
];

let filesProcessed = 0;
let linesRemoved = 0;

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return EXTENSIONS.includes(ext);
}

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileLineCount = 0;

  CONSOLE_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      fileLineCount += matches.length;
      content = content.replace(pattern, '');
    }
  });

  if (content !== originalContent) {
    // Remove empty lines that might be left behind
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    fs.writeFileSync(filePath, content, 'utf8');
    filesProcessed++;
    linesRemoved += fileLineCount;

    if (fileLineCount > 0) {
      console.log(`✓ Cleaned ${filePath}: removed ${fileLineCount} console statements`);
    }
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (shouldProcessFile(filePath)) {
      cleanFile(filePath);
    }
  });
}

console.log('🧹 Cleaning console.log/warn/info/debug statements...\n');

DIRS_TO_CLEAN.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`📁 Processing ${dir}/...`);
    walkDirectory(dirPath);
  }
});

console.log('\n✨ Done!');
console.log(`📊 Files processed: ${filesProcessed}`);
console.log(`🗑️  Console statements removed: ${linesRemoved}`);
console.log('\n⚠️  Note: console.error statements were preserved for error tracking');
