#!/usr/bin/env node
/**
 * generate_llms.js — Generates tiered llms.txt files from manifest definitions.
 *
 * Tiers:
 *   Tier 1: llms.txt          — Lightweight index with links (hand-maintained, not generated)
 *   Tier 2: llms-full.txt     — Navigation + explanation layer inlined (generated)
 *   Tier 3: llms-id[1-5].txt  — Per-idea deep dives (generated)
 *
 * Usage:
 *   node scripts/generate_llms.js              # Generate all tiers
 *   node scripts/generate_llms.js --tier 2     # Generate only Tier 2
 *   node scripts/generate_llms.js --tier 3     # Generate only Tier 3 (all 5 idea files)
 *   node scripts/generate_llms.js --dry-run    # Show what would be generated without writing
 *
 * Manifest format (same as filePackager.js):
 *   { "files": [{ "path": "./relative/path", "includeFile": true }] }
 *
 * Each manifest also supports:
 *   "header": "# Title\n\nPreamble text..."  — prepended to the output
 *   "outputFile": "llms-full.txt"             — output filename (written to repo root)
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const MANIFESTS_DIR = path.join(REPO_ROOT, 'scripts', 'llms-manifests');

// Files to ignore
const IGNORED_FILENAMES = new Set(['.ds_store', 'thumbs.db', '.gitkeep']);

// Binary extensions to skip
const BINARY_EXTENSIONS = new Set([
  '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot',
  '.zip', '.tar', '.gz', '.bz2',
  '.mp3', '.mp4', '.wav', '.webm',
  '.docx', '.xlsx', '.pptx',
  '.pyc', '.o', '.so', '.dylib'
]);

function isBinary(filePath) {
  return BINARY_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function readManifest(manifestPath) {
  try {
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return data;
  } catch (error) {
    console.error(`Error reading manifest ${manifestPath}: ${error.message}`);
    return null;
  }
}

function expandDirectory(dirPath, basePath) {
  const results = [];
  try {
    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
      if (IGNORED_FILENAMES.has(entry.toLowerCase())) continue;
      const fullPath = path.join(dirPath, entry);
      const relativePath = path.join(basePath, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...expandDirectory(fullPath, relativePath));
      } else if (!isBinary(fullPath)) {
        results.push(`./${relativePath}`);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${basePath}: ${error.message}`);
  }
  return results;
}

function resolveFiles(manifest) {
  const files = [];
  const excluded = new Set();

  // Collect excluded paths first
  for (const entry of manifest.files || []) {
    if (!entry.includeFile) {
      excluded.add(path.resolve(REPO_ROOT, entry.path));
    }
  }

  // Resolve included paths (expand directories)
  for (const entry of manifest.files || []) {
    if (!entry.includeFile) continue;
    const absolutePath = path.resolve(REPO_ROOT, entry.path);

    if (excluded.has(absolutePath)) continue;

    try {
      const stat = fs.statSync(absolutePath);
      if (stat.isDirectory()) {
        const expanded = expandDirectory(absolutePath, entry.path.replace(/^\.\//, ''));
        for (const f of expanded) {
          if (!excluded.has(path.resolve(REPO_ROOT, f))) {
            files.push(f);
          }
        }
      } else if (!isBinary(absolutePath)) {
        files.push(entry.path);
      }
    } catch (error) {
      console.error(`Warning: ${entry.path} not found, skipping`);
    }
  }

  return files;
}

function generateOutput(manifest, files) {
  const parts = [];

  // Add header if present
  if (manifest.header) {
    parts.push(manifest.header.trim());
    parts.push('');
    parts.push('---');
    parts.push('');
  }

  // Add each file with markdown-style headers
  for (const filePath of files) {
    const absolutePath = path.resolve(REPO_ROOT, filePath);
    try {
      const content = fs.readFileSync(absolutePath, 'utf8');
      const cleanPath = filePath.replace(/^\.\//, '');
      parts.push(`# --- ${cleanPath} ---`);
      parts.push('');
      parts.push(content.trim());
      parts.push('');
      parts.push('');
    } catch (error) {
      console.error(`Warning: Could not read ${filePath}: ${error.message}`);
    }
  }

  return parts.join('\n');
}

function getManifestFiles() {
  try {
    return fs.readdirSync(MANIFESTS_DIR)
      .filter(f => f.endsWith('.json'))
      .sort();
  } catch (error) {
    console.error(`Manifests directory not found: ${MANIFESTS_DIR}`);
    return [];
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const tierIndex = args.indexOf('--tier');
  const tierFilter = tierIndex >= 0 ? parseInt(args[tierIndex + 1]) : null;

  const manifestFiles = getManifestFiles();

  if (manifestFiles.length === 0) {
    console.error('No manifest files found in scripts/llms-manifests/');
    console.error('Create manifest JSON files there to define what goes into each llms tier.');
    process.exit(1);
  }

  console.log(`Found ${manifestFiles.length} manifest(s) in scripts/llms-manifests/\n`);

  let generated = 0;

  for (const manifestFile of manifestFiles) {
    const manifestPath = path.join(MANIFESTS_DIR, manifestFile);
    const manifest = readManifest(manifestPath);
    if (!manifest) continue;

    // Filter by tier if requested
    if (tierFilter !== null && manifest.tier !== tierFilter) continue;

    const outputFile = manifest.outputFile || manifestFile.replace('.json', '.txt');
    const outputPath = path.join(REPO_ROOT, outputFile);

    console.log(`Processing: ${manifestFile}`);
    console.log(`  Tier: ${manifest.tier || 'unspecified'}`);
    console.log(`  Output: ${outputFile}`);

    const files = resolveFiles(manifest);
    console.log(`  Files: ${files.length}`);

    if (dryRun) {
      for (const f of files) {
        console.log(`    ${f}`);
      }
      console.log('');
      continue;
    }

    const output = generateOutput(manifest, files);
    const lines = output.split('\n').length;
    const sizeKB = Math.round(Buffer.byteLength(output, 'utf8') / 1024);

    fs.writeFileSync(outputPath, output);
    console.log(`  Written: ${lines} lines, ${sizeKB} KB`);
    console.log('');
    generated++;
  }

  if (dryRun) {
    console.log('(dry run — no files written)');
  } else {
    console.log(`Done. Generated ${generated} file(s).`);
  }
}

main();
