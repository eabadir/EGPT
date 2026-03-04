#!/usr/bin/env node
'use strict';

const { spawn } = require('child_process');
const { mkdir, stat } = require('fs/promises');
const path = require('path');

async function main() {
  const [inputArg, outputArg] = process.argv.slice(2);
  if (!inputArg) {
    console.error('Usage: node scripts/tex-to-md.js <input.tex> [output.md]');
    process.exit(1);
  }

  const inputPath = path.resolve(inputArg);
  const defaultOut = inputPath.toLowerCase().endsWith('.tex')
    ? inputPath.slice(0, -4) + '.md'
    : inputPath + '.md';
  const outputPath = path.resolve(outputArg || defaultOut);

  await assertFileExists(inputPath);
  await mkdir(path.dirname(outputPath), { recursive: true });

  const pandocBin = resolvePandoc();
  await runPandoc(pandocBin, inputPath, outputPath);

  console.log(`Converted ${inputPath} -> ${outputPath}`);
}

function resolvePandoc() {
  try {
    const pandoc = require('pandoc-bin').path;
    if (pandoc) {
      return pandoc; // Prefer bundled pandoc if available
    }
  } catch (_) {
    // fall through to system pandoc
  }
  return 'pandoc';
}

async function assertFileExists(filePath) {
  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) {
      throw new Error('is not a file');
    }
  } catch (err) {
    console.error(`Cannot read input file ${filePath}: ${err.message}`);
    process.exit(1);
  }
}

async function runPandoc(pandocBin, inputPath, outputPath) {
  const args = [
    '-f',
    'latex',
    '-t',
    'gfm',
    inputPath,
    '-o',
    outputPath,
    '--wrap=auto',
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(pandocBin, args, { stdio: 'inherit' });
    child.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(
          new Error(
            'pandoc not found. Install pandoc or add the npm package pandoc-bin.'
          )
        );
      } else {
        reject(err);
      }
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pandoc exited with code ${code}`));
      }
    });
  });
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

