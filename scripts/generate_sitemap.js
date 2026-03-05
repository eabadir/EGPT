#!/usr/bin/env node
/**
 * Generate sitemap.xml for the EGPT repository.
 *
 * Enumerates git-tracked files, selects those useful for discovery
 * (docs, proofs, source, demos), and writes a standard sitemap.xml
 * to the repository root.
 *
 * Usage:  node scripts/generate_sitemap.js
 *
 * Run before publishing main to keep the sitemap current.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(REPO_ROOT, 'sitemap.xml');

// GitHub base — blob for files, tree for directories
const BASE = 'https://github.com/eabadir/EGPT/blob/main';

// Extensions / exact filenames to include
const INCLUDE_EXT = new Set(['.md', '.lean', '.js', '.html', '.txt', '.pdf', '.json']);
const INCLUDE_EXACT = new Set([
  'LICENSE',
  'AGENTS.md',
  'llms.txt',
  'sitemap.xml',
]);

// Files to always exclude (even if extension matches)
const EXCLUDE_EXACT = new Set([
  'package.json',
  'package-lock.json',
  'lake-manifest.json',
  'lean-toolchain',
]);

// Directories to skip entirely
const SKIP_DIRS = [
  'temp/',
  'node_modules/',
  '.lake/',
  '.github/',
  '.claude/settings/',
  'Lean/EGPT/Deprecated/',
  'Lean/PPNP/Dev/',
  'EGPTMath/benchmarks/',
  'EGPTMath/stat/',
  'EGPTMath/utils/',
];

// Priority tiers — first match wins
const PRIORITY_RULES = [
  { pattern: /^README\.md$/, priority: '1.0', freq: 'weekly' },
  { pattern: /^llms\.txt$/, priority: '1.0', freq: 'weekly' },
  { pattern: /^AGENTS\.md$/, priority: '0.9', freq: 'weekly' },
  { pattern: /^\.claude\/agents\/egpt-orchestrator\.md$/, priority: '0.8', freq: 'monthly' },
  { pattern: /^\.claude\/agents\/lean-prover\.md$/, priority: '0.8', freq: 'monthly' },
  { pattern: /^\.claude\/agents\/js-engineer\.md$/, priority: '0.7', freq: 'monthly' },
  { pattern: /^\.claude\/agents\/doc-writer\.md$/, priority: '0.7', freq: 'monthly' },
  { pattern: /^\.claude\/agents\/demo-builder\.md$/, priority: '0.7', freq: 'monthly' },
  { pattern: /^\.claude\/agents\/content-author\.md$/, priority: '0.7', freq: 'monthly' },
  { pattern: /^\.claude\/agents\/sync-validator\.md$/, priority: '0.6', freq: 'monthly' },
  { pattern: /^LICENSE$/, priority: '0.8', freq: 'monthly' },
  { pattern: /^SKEPTICS_GUIDE\.md$/, priority: '0.9', freq: 'weekly' },
  { pattern: /^EGPT_STORY\.md$/, priority: '0.8', freq: 'monthly' },
  { pattern: /^DeSciX_Community_License/, priority: '0.7', freq: 'yearly' },
  { pattern: /PPNP\.lean$/, priority: '0.9', freq: 'monthly' },
  { pattern: /RealityIsComputation\.lean$/, priority: '0.9', freq: 'monthly' },
  { pattern: /ContinuumHypothesis\.lean$/, priority: '0.9', freq: 'monthly' },
  { pattern: /RET\.lean$/, priority: '0.8', freq: 'monthly' },
  { pattern: /Core\.lean$/, priority: '0.7', freq: 'monthly' },
  { pattern: /PeqNP_Proof_README\.md$/, priority: '0.8', freq: 'monthly' },
  { pattern: /EGPT_PROOFS_VALIDATION\.md$/, priority: '0.8', freq: 'monthly' },
  { pattern: /PROOF_DEPENDENCIES\.md$/, priority: '0.7', freq: 'monthly' },
  { pattern: /^docs\/PROOF_GRAPH\.md$/, priority: '0.8', freq: 'monthly' },
  { pattern: /^docs\/proof_graph\.json$/, priority: '0.7', freq: 'monthly' },
  { pattern: /CLAUDE\.md$/, priority: '0.6', freq: 'monthly' },
  { pattern: /EGPTMath\/README\.md$/, priority: '0.9', freq: 'weekly' },
  { pattern: /EGPTMath\/FAT\/README\.md$/, priority: '0.9', freq: 'weekly' },
  { pattern: /EGPTMath_Developer_Guide\.md$/, priority: '0.8', freq: 'monthly' },
  { pattern: /\.lean$/, priority: '0.5', freq: 'monthly' },
  { pattern: /\.md$/, priority: '0.5', freq: 'monthly' },
  { pattern: /EGPTMath\.js$/, priority: '0.8', freq: 'monthly' },
  { pattern: /EGPTNumber\.js$/, priority: '0.8', freq: 'monthly' },
  { pattern: /EGPTFAT\.js$/, priority: '0.8', freq: 'monthly' },
  { pattern: /EGPTFAT_PurePPF\.js$/, priority: '0.6', freq: 'monthly' },
  { pattern: /EGPTFAT_TypeSafe\.js$/, priority: '0.6', freq: 'monthly' },
  { pattern: /\.js$/, priority: '0.4', freq: 'monthly' },
  { pattern: /\.html$/, priority: '0.5', freq: 'monthly' },
  { pattern: /\.pdf$/, priority: '0.6', freq: 'yearly' },
  { pattern: /\.txt$/, priority: '0.4', freq: 'monthly' },
];

function shouldInclude(file) {
  // Skip excluded directories
  for (const dir of SKIP_DIRS) {
    if (file.startsWith(dir)) return false;
  }
  // Skip excluded filenames
  if (EXCLUDE_EXACT.has(path.basename(file))) return false;
  // Include by exact name
  if (INCLUDE_EXACT.has(path.basename(file))) return true;
  // Include by extension
  const ext = path.extname(file).toLowerCase();
  return INCLUDE_EXT.has(ext);
}

function getPriorityAndFreq(file) {
  for (const rule of PRIORITY_RULES) {
    if (rule.pattern.test(file)) {
      return { priority: rule.priority, changefreq: rule.freq };
    }
  }
  return { priority: '0.3', changefreq: 'monthly' };
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// ---------- main ----------

// Get all tracked files
const tracked = execSync('git ls-files', { cwd: REPO_ROOT, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

// Also include untracked but staged new files that are about to be committed
const files = tracked.filter(shouldInclude).sort();

const today = new Date().toISOString().slice(0, 10);

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

for (const file of files) {
  const { priority, changefreq } = getPriorityAndFreq(file);
  const url = `${BASE}/${escapeXml(file)}`;
  xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
}

xml += `</urlset>
`;

fs.writeFileSync(OUTPUT, xml);
console.log(`sitemap.xml written with ${files.length} URLs → ${OUTPUT}`);
