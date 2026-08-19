const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(__dirname, 'www');

const filesToCopy = [
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  'service-worker.js',
  'soccer-africa.apk'
];

// List of directories to copy recursively
const dirsToCopy = [
  'assets',
  'css',
  'js'
];

function cleanAndCreateDir(dir) {
  if (fs.existsSync(dir)) {
    console.log(`Cleaning existing directory: ${dir}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied file: ${path.basename(src)}`);
  } else {
    console.warn(`File not found: ${src}`);
  }
}

function copyDirectory(src, dest) {
  if (fs.existsSync(src)) {
    console.log(`Copying directory: ${path.basename(src)}`);
    fs.cpSync(src, dest, { recursive: true });
  } else {
    console.warn(`Directory not found: ${src}`);
  }
}

function main() {
  console.log('Starting build process...');
  cleanAndCreateDir(destDir);

  // 1. Copy all HTML files in root
  const files = fs.readdirSync(srcDir);
  files.forEach(file => {
    if (file.endsWith('.html')) {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(destDir, file);
      copyFile(srcPath, destPath);
    }
  });

  // 2. Copy specific files
  filesToCopy.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    copyFile(srcPath, destPath);
  });

  // 3. Copy directories
  dirsToCopy.forEach(dir => {
    const srcPath = path.join(srcDir, dir);
    const destPath = path.join(destDir, dir);
    copyDirectory(srcPath, destPath);
  });

  console.log('Build completed successfully! Web assets are in the /www folder.');
}

main();
