#!/usr/bin/env node
/**
 * generate_site.js — Generates a single-page app for the EGPT GitHub Pages site.
 *
 * Reads root and per-module _meta.json files, extracts Mermaid diagrams from
 * docs/PROOF_GRAPH.md, builds a SITE_DATA JSON object, generates landing page
 * HTML, fills site-template.html with tokens, and writes a single index.html
 * at the repo root.
 *
 * Usage:
 *   node scripts/generate_site.js              # Generate the SPA
 *   node scripts/generate_site.js --dry-run    # Preview without writing
 *
 * Pure Node.js — no external dependencies.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const TEMPLATE_PATH = path.join(REPO_ROOT, 'site-template.html');
const PROOF_GRAPH_PATH = path.join(REPO_ROOT, 'docs', 'PROOF_GRAPH.md');
const GITHUB_BASE = 'https://github.com/eabadir/EGPT/blob/main';

const DRY_RUN = process.argv.includes('--dry-run');

// Old per-module index.html files to clean up
const OLD_INDEX_FILES = ['Lean', 'EGPTMath', 'www', 'content', 'docs'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return null;
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function extractMermaidBlocks(mdPath) {
  try {
    const content = fs.readFileSync(mdPath, 'utf8');
    const blocks = [];
    const regex = /```mermaid\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      blocks.push(match[1].trim());
    }
    return blocks;
  } catch (err) {
    return [];
  }
}

function fileLink(filePath, moduleDir) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') {
    // Relative path — served by Pages
    return moduleDir ? `${moduleDir}/${filePath}` : filePath;
  }
  // GitHub link
  const fullPath = moduleDir ? `${moduleDir}/${filePath}` : filePath;
  const normalized = path.normalize(fullPath).split(path.sep).join('/');
  return `${GITHUB_BASE}/${encodeURI(normalized)}`;
}

function resolveRelatedLink(filePath, moduleDir) {
  if (filePath.startsWith('../')) {
    const resolved = path.normalize(path.join(moduleDir, filePath)).split(path.sep).join('/');
    const ext = path.extname(resolved).toLowerCase();
    if (ext === '.html') return resolved;
    return `${GITHUB_BASE}/${encodeURI(resolved)}`;
  }
  return fileLink(filePath, moduleDir);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateFiles(meta, dir, label) {
  const warnings = [];
  let highlightCount = 0;
  let subsectionCount = 0;
  let demoCount = 0;

  if (meta.highlights) {
    highlightCount = meta.highlights.length;
    for (const h of meta.highlights) {
      const resolved = path.join(REPO_ROOT, dir, h.file);
      if (!fs.existsSync(resolved)) {
        warnings.push(`  WARNING: ${h.file} not found`);
      }
    }
  }

  if (meta.subsections) {
    subsectionCount = meta.subsections.length;
    for (const s of meta.subsections) {
      for (const f of s.files || []) {
        const resolved = path.join(REPO_ROOT, dir, f);
        if (!fs.existsSync(resolved)) {
          warnings.push(`  WARNING: ${f} not found`);
        }
      }
    }
  }

  if (meta.do_this_first) {
    for (const [persona, info] of Object.entries(meta.do_this_first)) {
      if (info.file) {
        const resolved = path.join(REPO_ROOT, dir, info.file);
        if (!fs.existsSync(resolved)) {
          warnings.push(`  WARNING: do_this_first[${persona}].file ${info.file} not found`);
        }
      }
    }
  }

  if (meta.related_reading) {
    for (const r of meta.related_reading) {
      const resolved = path.join(REPO_ROOT, dir, r.file);
      if (!fs.existsSync(resolved)) {
        warnings.push(`  WARNING: related_reading ${r.file} not found`);
      }
    }
  }

  if (meta.embed_demos) {
    demoCount = meta.embed_demos.length;
    for (const d of meta.embed_demos) {
      const resolved = path.join(REPO_ROOT, dir, d.src);
      if (!fs.existsSync(resolved)) {
        warnings.push(`  WARNING: embed_demo ${d.src} not found`);
      }
    }
  }

  const parts = [];
  if (highlightCount) parts.push(`${highlightCount} highlights`);
  if (subsectionCount) parts.push(`${subsectionCount} subsections`);
  if (demoCount) parts.push(`${demoCount} demos`);
  const suffix = parts.length ? ` (${parts.join(', ')})` : '';
  console.log(`  \u2713 ${label}${suffix}`);

  for (const w of warnings) {
    console.log(w);
  }
}

// ---------------------------------------------------------------------------
// SITE_DATA builder
// ---------------------------------------------------------------------------

function buildSiteData(rootMeta, moduleMetas, mermaidBlocks) {
  const modules = [];

  for (const m of rootMeta.modules) {
    const dirMeta = moduleMetas[m.dir];
    if (!dirMeta) continue;

    modules.push({
      dir: m.dir,
      label: m.label,
      order: m.order,
      title: dirMeta.title || '',
      description: dirMeta.description || '',
      ideas: dirMeta.ideas || [],
      primary_ideas: dirMeta.primary_ideas || [],
      do_this_first: dirMeta.do_this_first || {},
      highlights: dirMeta.highlights || [],
      subsections: dirMeta.subsections || [],
      related_reading: dirMeta.related_reading || [],
      embed_demos: dirMeta.embed_demos || []
    });
  }

  return {
    site: rootMeta.site,
    ideas: rootMeta.ideas,
    personas: rootMeta.personas,
    featured_results: rootMeta.featured_results || [],
    modules,
    mermaid_diagrams: mermaidBlocks,
    external_resources: rootMeta.external_resources || []
  };
}

// ---------------------------------------------------------------------------
// Landing page HTML generation
// ---------------------------------------------------------------------------

function generateLandingContent(rootMeta, moduleMetas, mermaidBlocks) {
  const ideas = rootMeta.ideas;
  const personas = rootMeta.personas;
  const sections = [];

  // --- Section 1: Hero ---
  sections.push(`<div class="landing-hero">
  <h1>18.313 &mdash; Introduction To EGPT</h1>
  <h2>The New Manhattan Project</h2>
  <p class="landing-subtitle">Five Ideas. One Repository. A New Computing Architecture.</p>
</div>`);

  // --- Section 1b: Featured Results ---
  if (rootMeta.featured_results && rootMeta.featured_results.length > 0) {
    const featuredCards = rootMeta.featured_results.map(fr => {
      const ideaId = (fr.idea || 'id1').toLowerCase();
      const ideaColor = ideas[fr.idea] ? ideas[fr.idea].color : '#888';
      const badgeHtml = fr.badge
        ? `<span class="featured-badge">${escapeHtml(fr.badge)}</span>`
        : '';

      let linksHtml = '';
      if (fr.link) {
        const isExternal = fr.link.startsWith('http');
        const target = isExternal ? ' target="_blank"' : '';
        linksHtml += `<a class="featured-cta" href="${fr.link}"${target}>${escapeHtml(fr.link_label || 'View')}</a>`;
      }
      if (fr.paper_link) {
        linksHtml += ` <a class="featured-link" href="${fr.paper_link}">Paper</a>`;
      }
      if (fr.data_link) {
        linksHtml += ` <a class="featured-link" href="${fr.data_link}">Data</a>`;
      }

      return `      <div class="featured-card" data-idea="${ideaId}" style="border-top: 4px solid ${ideaColor}">
        ${badgeHtml}
        <h3 class="featured-card__title">${escapeHtml(fr.title)}</h3>
        <p class="featured-card__subtitle">${escapeHtml(fr.subtitle)}</p>
        <p class="featured-card__detail">${escapeHtml(fr.detail)}</p>
        <div class="featured-card__links">
          ${linksHtml}
          <span class="idea-badge idea-badge--${ideaId}">${escapeHtml(fr.idea)}</span>
        </div>
      </div>`;
    }).join('\n');

    sections.push(`<section class="landing-section featured-results">
  <h2>Featured Results</h2>
  <div class="featured-grid">
${featuredCards}
  </div>
</section>`);
  }

  // --- Section 2: Five Ideas ---
  const ideaCards = Object.entries(ideas).map(([id, idea]) => {
    const idLower = id.toLowerCase();
    return `      <div class="module-card" data-idea="${idLower}" style="border-top: 3px solid ${idea.color}">
        <h3 class="module-card__title">${id}: ${escapeHtml(idea.short)}</h3>
        <p class="module-card__desc">${escapeHtml(idea.label)}</p>
      </div>`;
  }).join('\n');

  sections.push(`<section class="landing-section">
  <h2>Five Ideas</h2>
  <div class="module-grid">
${ideaCards}
  </div>
</section>`);

  // --- Section 3: Module cards ---
  const moduleCards = rootMeta.modules.map(m => {
    const meta = moduleMetas[m.dir];
    if (!meta) return '';
    const primaryIdeas = meta.primary_ideas || meta.ideas || [];
    const primaryIdea = primaryIdeas[0] || '';
    const idLower = primaryIdea.toLowerCase();

    const badges = primaryIdeas.map(id => {
      const idL = id.toLowerCase();
      return `<span class="idea-badge idea-badge--${idL}">${id}</span>`;
    }).join('\n          ');

    return `      <div class="module-card" data-idea="${idLower}">
        <h3 class="module-card__title">${escapeHtml(m.label)}</h3>
        <p class="module-card__desc">${escapeHtml(meta.title || '')} &mdash; ${escapeHtml(meta.description || '')}</p>
        <div class="module-card__badges">
          ${badges}
        </div>
      </div>`;
  }).filter(Boolean).join('\n');

  sections.push(`<section class="landing-section">
  <h2>Modules</h2>
  <div class="module-grid">
${moduleCards}
  </div>
</section>`);

  // --- Section 4: Do This First (persona tabs) ---
  sections.push(generateDoThisFirst(rootMeta, moduleMetas, personas));

  // --- Section 5: Mermaid proof graph ---
  if (mermaidBlocks.length > 0) {
    sections.push(`<section class="landing-section">
  <h2>Proof Dependency Graph</h2>
  <pre class="mermaid">
${mermaidBlocks[0]}
  </pre>
</section>`);
  }

  // --- Section 6: External resources ---
  if (rootMeta.external_resources && rootMeta.external_resources.length > 0) {
    const items = rootMeta.external_resources.map(r => {
      const badges = (r.ideas || []).map(id => {
        const idL = id.toLowerCase();
        return `<span class="idea-badge idea-badge--${idL}">${id}</span>`;
      }).join(' ');
      return `    <li><a href="${r.url}" target="_blank">${escapeHtml(r.label)}</a> ${badges}</li>`;
    }).join('\n');

    sections.push(`<section class="landing-section">
  <h2>External Resources</h2>
  <ul>
${items}
  </ul>
</section>`);
  }

  // --- Section 7: Footer ---
  sections.push(`<div class="landing-footer">
  <p>Electronic Graph Paper Theory (EGPT) &mdash; <a href="LICENSE">DeSciX Community License</a></p>
</div>`);

  return sections.join('\n\n');
}

// ---------------------------------------------------------------------------
// Do This First — aggregated persona tabs
// ---------------------------------------------------------------------------

function generateDoThisFirst(rootMeta, moduleMetas, personas) {
  // Collect all persona entries across modules
  // personaId -> [ { moduleDir, moduleLabel, action, file } ]
  const personaEntries = {};

  for (const m of rootMeta.modules) {
    const meta = moduleMetas[m.dir];
    if (!meta || !meta.do_this_first) continue;
    for (const [personaId, info] of Object.entries(meta.do_this_first)) {
      if (!personaEntries[personaId]) personaEntries[personaId] = [];
      personaEntries[personaId].push({
        moduleDir: m.dir,
        moduleLabel: m.label.replace(/^Module \d+: /, ''),
        action: info.action,
        file: info.file
      });
    }
  }

  if (Object.keys(personaEntries).length === 0) return '';

  // Determine which groups are active
  const groupOrder = ['code-first', 'theory-first', 'science-first', 'outcome-first'];
  const activeGroups = new Set();
  const personasByGroup = {};

  for (const personaId of Object.keys(personaEntries)) {
    const def = personas[personaId];
    if (!def) continue;
    activeGroups.add(def.group);
    if (!personasByGroup[def.group]) personasByGroup[def.group] = [];
    personasByGroup[def.group].push(personaId);
  }

  // Group tabs
  const groupButtons = groupOrder
    .filter(g => activeGroups.has(g))
    .map(g => {
      const label = g.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
      return `      <button class="persona-tab" data-group="${g}">${label}</button>`;
    }).join('\n');

  // Individual persona tabs
  const personaButtons = [];
  for (const g of groupOrder) {
    if (!personasByGroup[g]) continue;
    for (const pid of personasByGroup[g]) {
      const def = personas[pid];
      if (!def) continue;
      personaButtons.push(`      <button class="persona-tab" data-persona="${pid}" data-in-group="${def.group}">${escapeHtml(def.label)}</button>`);
    }
  }

  // Persona content panes
  const personaPanels = [];
  for (const g of groupOrder) {
    if (!personasByGroup[g]) continue;
    for (const pid of personasByGroup[g]) {
      const entries = personaEntries[pid];
      const items = entries.map(e => {
        let linkHtml = '';
        if (e.file) {
          const link = fileLink(e.file, e.moduleDir);
          linkHtml = ` &mdash; <a href="${link}" data-nav-dir="${e.moduleDir}" data-nav-file="${escapeHtml(e.file)}">${escapeHtml(e.file)}</a>`;
        }
        return `      <li><strong>${escapeHtml(e.moduleLabel)}:</strong> ${escapeHtml(e.action)}${linkHtml}</li>`;
      }).join('\n');

      personaPanels.push(`    <div class="persona-content" data-persona="${pid}">
      <ul>
${items}
      </ul>
    </div>`);
    }
  }

  return `<section class="landing-section do-this-first">
  <h2 class="do-this-first__header">Do This First</h2>
  <div class="persona-group">
${groupButtons}
  </div>
  <div class="persona-group">
${personaButtons.join('\n')}
  </div>
${personaPanels.join('\n')}
</section>`;
}

// ---------------------------------------------------------------------------
// Template filling
// ---------------------------------------------------------------------------

function fillTemplate(template, tokens) {
  let html = template;
  for (const [key, value] of Object.entries(tokens)) {
    html = html.split(`{{${key}}}`).join(value);
  }
  return html;
}

// ---------------------------------------------------------------------------
// Old file cleanup
// ---------------------------------------------------------------------------

function cleanupOldIndexFiles() {
  console.log('Cleaning up old index.html files...');
  for (const dir of OLD_INDEX_FILES) {
    const indexPath = path.join(REPO_ROOT, dir, 'index.html');
    if (fs.existsSync(indexPath)) {
      if (DRY_RUN) {
        console.log(`  [DRY RUN] Would remove ${dir}/index.html`);
      } else {
        fs.unlinkSync(indexPath);
        console.log(`  Removed ${dir}/index.html`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  // 1. Read root _meta.json
  const rootMetaPath = path.join(REPO_ROOT, '_meta.json');
  const rootMeta = readJSON(rootMetaPath);
  if (!rootMeta || !rootMeta.site || !rootMeta.modules) {
    console.error('ERROR: Root _meta.json is missing or malformed');
    process.exit(1);
  }

  // 2. Read template
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error('ERROR: site-template.html not found');
    process.exit(1);
  }
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // 3. Validate _meta.json files
  console.log('Validating _meta.json files...');
  console.log('  \u2713 _meta.json (root)');

  const moduleMetas = {};
  for (const m of rootMeta.modules) {
    const metaPath = path.join(REPO_ROOT, m.dir, '_meta.json');
    const meta = readJSON(metaPath);
    if (!meta) {
      console.log(`  WARNING: ${m.dir}/_meta.json not found or malformed, skipping`);
      continue;
    }
    moduleMetas[m.dir] = meta;
    validateFiles(meta, m.dir, `${m.dir}/_meta.json`);
  }

  // 4. Extract Mermaid diagrams
  console.log('Extracting Mermaid diagrams from docs/PROOF_GRAPH.md...');
  const mermaidBlocks = extractMermaidBlocks(PROOF_GRAPH_PATH);
  console.log(`  Found ${mermaidBlocks.length} diagrams`);

  // 5. Generate landing content
  console.log('Generating landing content...');
  const landingContent = generateLandingContent(rootMeta, moduleMetas, mermaidBlocks);

  // 6. Build SITE_DATA
  console.log('Building SITE_DATA...');
  const siteData = buildSiteData(rootMeta, moduleMetas, mermaidBlocks);
  const siteDataJson = JSON.stringify(siteData, null, 2);

  // 7. Fill template
  const tokens = {
    PAGE_TITLE: rootMeta.site.title,
    SITE_DATA_JSON: siteDataJson,
    LANDING_CONTENT: landingContent
  };
  const html = fillTemplate(template, tokens);

  // 8. Clean up old index.html files
  cleanupOldIndexFiles();

  // 9. Write single index.html
  const outputPath = path.join(REPO_ROOT, 'index.html');
  const totalKB = Math.round(Buffer.byteLength(html, 'utf8') / 1024);

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would write index.html (${totalKB} KB)`);
  } else {
    console.log('Writing index.html...');
    fs.writeFileSync(outputPath, html);
    console.log(`Done: 1 page generated (${totalKB} KB)`);
  }
}

main();
