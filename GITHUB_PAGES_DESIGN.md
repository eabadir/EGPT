# GitHub Pages Design Document

## 18.313 — Introduction To EGPT: The New Manhattan Project

**Status:** Design complete, ready for agent execution
**Owner:** @egpt-orchestrator → delegates to specialists
**Phase:** Phase 6 of IDEAS Audit Plan

---

## 1. Objective

Build a GitHub Pages site that presents the EGPT repository as a navigable course — "18.313 — Introduction To EGPT: The New Manhattan Project." The site must:

1. Have a root `index.html` landing page that routes visitors by persona and by idea (ID1–ID5)
2. Have per-directory `index.html` pages that serve as content guides for each major directory
3. Embed existing HTML demos (GravitySim, FRAQTL DevSDK, etc.) without modification
4. Render Mermaid diagrams (proof dependency DAG) client-side
5. Be fully maintainable by the existing agent team via `_meta.json` descriptor files
6. Require no framework dependencies — plain HTML + a single `generate_site.js` build script
7. Deploy automatically via GitHub Actions on push to `main`

---

## 2. Architecture Decision: Plain HTML + Generator (Option B)

**Why not VitePress:** Introduces a Vue dependency, requires understanding VitePress frontmatter conventions, and the agent team would need to learn a new tool. The existing manifest pattern (`scripts/llms-manifests/*.json`) already solves the same problem without a framework.

**Why not Jekyll:** GitHub's default, but Mermaid requires plugins, Liquid templating is awkward for programmatic generation, and it can't easily inline p5.js demos.

**Why Option B (plain HTML + generator):** The agent team already maintains JSON manifests (`llms-manifests/`) and per-directory `CLAUDE.md` files. Adding `_meta.json` files is the same pattern. A single `generate_site.js` script reads these descriptors and stamps out `index.html` files from one shared template. No new dependencies. No build framework. The www/ demos work as-is.

---

## 3. Directory Structure (New Files)

```
/                                     ← repo root
├── _meta.json                        ← ROOT: site-wide config, persona defs, idea colors
├── index.html                        ← GENERATED: course landing page
├── site-template.html                ← TEMPLATE: single HTML template for all pages
├── site-assets/                      ← NEW DIR: shared CSS/JS for the site
│   ├── style.css                     ← Course branding, idea color coding, responsive layout
│   ├── site.js                       ← Client-side: Mermaid init, persona tabs, nav
│   └── mermaid.min.js                ← Mermaid 10.x (CDN fallback, local copy for offline)
├── scripts/
│   ├── generate_site.js              ← NEW: reads _meta.json + sitemap.xml → index.html files
│   └── generate_sitemap.js           ← MODIFIED: dual-mode output (GitHub blob + Pages URLs)
├── .github/workflows/
│   └── deploy-pages.yml              ← NEW: GitHub Actions workflow for Pages deployment
├── Lean/
│   ├── _meta.json                    ← NEW: directory descriptor
│   └── index.html                    ← GENERATED
├── EGPTMath/
│   ├── _meta.json                    ← NEW
│   └── index.html                    ← GENERATED
├── www/
│   ├── _meta.json                    ← NEW
│   └── index.html                    ← GENERATED (demo gallery with iframe previews)
├── content/
│   ├── _meta.json                    ← NEW
│   └── index.html                    ← GENERATED (paper/book catalog by idea)
├── docs/
│   ├── _meta.json                    ← NEW
│   └── index.html                    ← GENERATED (proof graph, audit reports)
└── .claude/
    └── agents/
        └── (no _meta.json — agents are internal, not course content)
```

### Files NOT generated (existing, untouched)
- All existing `.md`, `.lean`, `.js`, `.html` files remain exactly as they are
- `www/GravitySim/index.html`, `www/fraqtl_devsdk/index.html` etc. continue to work standalone
- `llms.txt`, `llms-full.txt`, `llms-id*.txt` remain as-is for AI crawlers

---

## 4. `_meta.json` Schema

Every directory that should appear in the site navigation gets a `_meta.json` file. This is the **single source of truth** for the site generator about that directory's content.

### 4.1 Root `_meta.json` (site-wide config)

```json
{
  "site": {
    "title": "18.313 — Introduction To EGPT: The New Manhattan Project",
    "subtitle": "Five Ideas. One Repository. A New Computing Architecture.",
    "repo_url": "https://github.com/eabadir/EGPT",
    "pages_url": "https://eabadir.github.io/EGPT",
    "raw_url": "https://raw.githubusercontent.com/eabadir/EGPT/main"
  },
  "ideas": {
    "ID1": { "label": "Ulam — CGS from a Random Walk", "color": "#2196F3", "short": "Random Walk" },
    "ID2": { "label": "Von Neumann — The Statistical AI Computer", "color": "#4CAF50", "short": "IOPs" },
    "ID3": { "label": "Einstein — Algebraic Discrete Physics", "color": "#FF9800", "short": "Discrete Physics" },
    "ID4": { "label": "Rota — Entropy is the Record of Truth", "color": "#9C27B0", "short": "Entropy" },
    "ID5": { "label": "Abadir — CH Decidable / Unique Representations", "color": "#F44336", "short": "Completeness" }
  },
  "personas": {
    "ai-ml-engineer":      { "label": "AI/ML Engineer",           "group": "code-first" },
    "cs-student":          { "label": "CS Student",               "group": "code-first" },
    "hardware-engineer":   { "label": "Hardware Engineer",         "group": "code-first" },
    "complexity-theorist": { "label": "Complexity Theorist",       "group": "theory-first" },
    "proof-engineer":      { "label": "Proof Engineer",            "group": "theory-first" },
    "mathematician":       { "label": "Mathematician",             "group": "theory-first" },
    "qc-enthusiast":       { "label": "Quantum Computing Enthusiast", "group": "theory-first" },
    "physicist":           { "label": "Physicist",                 "group": "science-first" },
    "philosopher":         { "label": "Philosopher of Mind",       "group": "science-first" },
    "founder-investor":    { "label": "Founder / Investor",        "group": "outcome-first" },
    "ai-practitioner":     { "label": "AI Practitioner",           "group": "outcome-first" },
    "cryptographer":       { "label": "Cryptographer",             "group": "theory-first" }
  },
  "modules": [
    { "dir": "Lean",    "label": "Module 1: The Proof Chain",          "order": 1 },
    { "dir": "EGPTMath","label": "Module 2: The Integer Math Library",  "order": 2 },
    { "dir": "www",     "label": "Module 3: Interactive Demos",         "order": 3 },
    { "dir": "content", "label": "Module 4: Papers & Stories",          "order": 4 },
    { "dir": "docs",    "label": "Module 5: Navigation & Reference",    "order": 5 }
  ],
  "external_resources": [
    {
      "label": "QFT Benchmark (Google Colab)",
      "url": "https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm",
      "ideas": ["ID2", "ID5"],
      "personas": ["qc-enthusiast", "ai-ml-engineer", "hardware-engineer"]
    }
  ]
}
```

### 4.2 Directory `_meta.json` (per-module)

```json
{
  "title": "Formal Proofs (Lean 4)",
  "module": "Module 1: The Proof Chain",
  "description": "87 machine-verified theorems. No sorry. No custom axioms. The constructive proof that P = NP, Rota's Entropy Theorem formalized, the Continuum Hypothesis decided, and algebraic discrete physics — all in Lean 4 with mathlib4.",
  "ideas": ["ID1", "ID2", "ID3", "ID4", "ID5"],
  "primary_ideas": ["ID4", "ID5"],
  "do_this_first": {
    "proof-engineer":      { "action": "cd Lean && lake build",       "file": null },
    "cs-student":          { "action": "Read the walkthrough",        "file": "EGPT/PeqNP_Proof_README.md" },
    "mathematician":       { "action": "Read the CH proof",           "file": "EGPT/NumberTheory/ContinuumHypothesis.lean" },
    "complexity-theorist": { "action": "Read PPNP.lean",              "file": "EGPT/Complexity/PPNP.lean" },
    "physicist":           { "action": "Read RealityIsComputation",   "file": "EGPT/Physics/RealityIsComputation.lean" }
  },
  "highlights": [
    { "file": "EGPT/Complexity/PPNP.lean",                    "label": "P = NP theorem",                   "idea": "ID5" },
    { "file": "EGPT/NumberTheory/ContinuumHypothesis.lean",   "label": "Continuum Hypothesis decided",     "idea": "ID5" },
    { "file": "EGPT/Entropy/RET.lean",                        "label": "Rota's Entropy Theorem",           "idea": "ID4" },
    { "file": "EGPT/Core.lean",                               "label": "ParticlePath foundation",          "idea": "ID1" },
    { "file": "EGPT/Physics/RealityIsComputation.lean",       "label": "Reality as computation",            "idea": "ID3" }
  ],
  "subsections": [
    {
      "title": "The P=NP Proof Chain (8 files, sorry-free)",
      "files": [
        "EGPT/Core.lean",
        "EGPT/NumberTheory/Core.lean",
        "EGPT/Constraints.lean",
        "EGPT/Complexity/Core.lean",
        "EGPT/Complexity/TableauFromCNF.lean",
        "EGPT/Complexity/PPNP.lean"
      ]
    },
    {
      "title": "Entropy (Rota's Theorem)",
      "files": ["EGPT/Entropy/Common.lean", "EGPT/Entropy/H.lean", "EGPT/Entropy/RET.lean"]
    },
    {
      "title": "Physics (Motivation Only)",
      "files": ["EGPT/Physics/RealityIsComputation.lean", "EGPT/Physics/Common.lean"]
    }
  ],
  "related_reading": [
    { "label": "Proof Walkthrough",           "file": "../SKEPTICS_GUIDE.md" },
    { "label": "Proof Dependency Graph",       "file": "../docs/PROOF_GRAPH.md" },
    { "label": "Proof Validation Report",      "file": "EGPT_PROOFS_VALIDATION.md" }
  ]
}
```

### 4.3 Full schema (all fields)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Display title for the directory |
| `module` | string | yes | Course module label (matches root `modules[]`) |
| `description` | string | yes | One-paragraph description (used in landing page card) |
| `ideas` | string[] | yes | All idea IDs this directory touches |
| `primary_ideas` | string[] | yes | The 1-2 ideas most strongly expressed here |
| `do_this_first` | object | no | Map of persona → { action, file } for "Do This First" routing |
| `highlights` | array | yes | 3-6 most important files with labels and idea tags |
| `subsections` | array | no | Logical groupings of files within the directory |
| `related_reading` | array | no | Links to related docs outside this directory |
| `embed_demos` | array | no | (www/ only) Demos to embed as iframe previews |

---

## 5. Agent Task Assignments

### 5.1 @js-engineer — `generate_site.js` (PRIMARY TASK)

Write `scripts/generate_site.js` that:

1. **Reads root `_meta.json`** for site config, idea colors, persona definitions, module order
2. **Reads `sitemap.xml`** to build a complete file inventory with priorities
3. **Walks directories** that contain `_meta.json` files
4. **Reads `site-template.html`** as the HTML template
5. **Generates `index.html`** for each directory by injecting:
   - Directory title, description, module label
   - Idea color badges for tagged ideas
   - "Do This First" persona routing (tabbed UI)
   - File listing organized by subsections
   - Highlight cards for the most important files
   - Related reading links
   - Navigation breadcrumbs and cross-links to other modules
6. **Generates root `index.html`** (the landing page) with:
   - Course title and subtitle
   - The "You Might Be Looking For..." table (pulled from `IDEAS.md` front matter or root `_meta.json`)
   - Module cards (one per directory) with descriptions, idea badges, and "Do This First" quicklinks
   - Five-idea overview section with color-coded cards
   - Persona selector (tabs: Code-first | Theory-first | Science-first | Outcome-first)
   - The New Manhattan Project section
   - Mermaid-rendered proof dependency graph (pulled from `docs/PROOF_GRAPH.md`)
   - External resources (Colab benchmark link)
   - Footer with links to `llms.txt`, `AGENTS.md`, `sitemap.xml`, LICENSE

**Technical requirements:**
- Pure Node.js, no external dependencies (use `fs`, `path`, `child_process` only)
- Follow the same patterns as `generate_llms.js` and `generate_sitemap.js`
- Support `--dry-run` flag to preview without writing
- Output summary: number of pages generated, total HTML size
- Exit with error code if any `_meta.json` is malformed or references non-existent files

**File references in generated HTML:**
- Link `.lean` files to GitHub blob URLs: `https://github.com/eabadir/EGPT/blob/main/{path}`
- Link `.md` files to their GitHub-rendered versions OR to the Pages-hosted HTML version if one exists
- Link `.html` demo files as relative paths (they'll be served directly by Pages)
- Link `.js` source files to GitHub blob URLs
- Link `.pdf` files to GitHub blob URLs (browsers render them inline)

**Mermaid rendering:**
- Include `<script src="site-assets/mermaid.min.js">` or CDN fallback
- Wrap Mermaid content in `<pre class="mermaid">` blocks
- Extract Mermaid diagram source from `docs/PROOF_GRAPH.md` fenced code blocks

**Template structure (`site-template.html`):**
The generator should also create `site-template.html` — a single HTML file with placeholder tokens that `generate_site.js` replaces:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PAGE_TITLE}} — 18.313 EGPT</title>
  <link rel="stylesheet" href="{{ROOT_PATH}}site-assets/style.css">
</head>
<body>
  <nav class="top-nav">
    <a href="{{ROOT_PATH}}index.html">18.313 EGPT</a>
    {{MODULE_NAV}}
  </nav>
  <header>
    <h1>{{PAGE_TITLE}}</h1>
    <div class="idea-badges">{{IDEA_BADGES}}</div>
    <p class="description">{{DESCRIPTION}}</p>
  </header>
  <main>
    {{DO_THIS_FIRST}}
    {{HIGHLIGHTS}}
    {{SUBSECTIONS}}
    {{RELATED_READING}}
    {{CUSTOM_CONTENT}}
  </main>
  <footer>
    <div class="meta-links">
      <a href="{{ROOT_PATH}}llms.txt">llms.txt</a> |
      <a href="{{ROOT_PATH}}AGENTS.md">AGENTS.md</a> |
      <a href="{{ROOT_PATH}}sitemap.xml">sitemap.xml</a> |
      <a href="{{ROOT_PATH}}IDEAS.md">IDEAS.md</a>
    </div>
    <p>18.313 — Introduction To EGPT: The New Manhattan Project</p>
  </footer>
  <script src="{{ROOT_PATH}}site-assets/site.js"></script>
  <script src="{{ROOT_PATH}}site-assets/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'neutral' });</script>
</body>
</html>
```

### 5.2 @demo-builder — `site-assets/` (CSS + JS)

Create the `site-assets/` directory with:

**`style.css`** — Course branding:
- Clean, minimal academic style (think MIT OpenCourseWare meets modern docs)
- Responsive layout (mobile-friendly)
- Idea color coding: each idea gets its assigned color from `_meta.json`
- `.idea-badge` — small colored pills with idea labels (e.g., `[ID1: Random Walk]`)
- `.module-card` — card layout for landing page modules
- `.highlight-card` — prominent cards for key files with idea color border
- `.do-this-first` — tabbed interface for persona-specific entry points
- `.persona-tab` — tab buttons grouped by code-first / theory-first / etc.
- `.file-listing` — clean table for directory file listings
- `.mermaid` — container styling for Mermaid diagrams
- `.breadcrumb` — navigation breadcrumbs
- Dark/light mode support via `prefers-color-scheme`
- Print stylesheet for clean PDF export

**`site.js`** — Client-side interactivity:
- Persona tab switching (show/hide "Do This First" content per persona)
- Mermaid initialization with neutral theme
- Smooth scroll for anchor links
- Mobile nav toggle
- No framework dependencies — vanilla JS only

**`mermaid.min.js`** — Download Mermaid 10.x from CDN and save locally for offline/CI use. The template should also include a CDN `<script>` fallback.

**Style reference:** Look at `www/GPUHeatDeath.html` and `www/RotaEntropy/RotaEntropyProperties.html` for the existing demo aesthetic. The site chrome should complement, not clash with, the demos.

### 5.3 @doc-writer — `_meta.json` Files (ALL 6)

Create `_meta.json` files for each directory. These are the content descriptors that `generate_site.js` reads.

**Files to create:**
1. **Root `_meta.json`** — Site-wide config (see schema §4.1 above). Include all 5 ideas with colors, all 12 personas with groups, all 5 modules with order, external resources.

2. **`Lean/_meta.json`** — Module 1: The Proof Chain
   - Title: "Formal Proofs (Lean 4)"
   - Primary ideas: ID4, ID5
   - Highlights: PPNP.lean, ContinuumHypothesis.lean, RET.lean, Core.lean, RealityIsComputation.lean
   - Subsections: P=NP chain (8 files), Entropy (3 files), Physics (motivation)
   - Do This First: proof-engineer → `lake build`, cs-student → PeqNP_Proof_README, mathematician → CH, complexity-theorist → PPNP, physicist → RealityIsComputation
   - Related: SKEPTICS_GUIDE, PROOF_GRAPH, PROOFS_VALIDATION

3. **`EGPTMath/_meta.json`** — Module 2: The Integer Math Library
   - Title: "EGPTMath — Integer-Only Mathematics"
   - Primary ideas: ID2
   - Highlights: EGPTMath.js, EGPTNumber.js, EGPTFAT.js, test suite
   - Subsections: Core (5 files), FAT variants (3 files), Tests
   - Do This First: ai-ml-engineer → `npm test`, cs-student → `node test/verify_ppf_bijection.js`, hardware-engineer → FAT_README, qc-enthusiast → Colab benchmark
   - Related: Developer Guide, FAT_README, IDEAS.md ID2 section

4. **`www/_meta.json`** — Module 3: Interactive Demos
   - Title: "Interactive Demos & Visualizers"
   - Primary ideas: ID1, ID3, ID4
   - Highlights: GravitySim, fraqtl_devsdk, RotaEntropyProperties, GPUHeatDeath
   - embed_demos: list of demos with iframe-safe paths and thumbnail descriptions
   - Do This First: cs-student → GravitySim, physicist → fraqtl_devsdk, qc-enthusiast → Colab, ai-ml-engineer → GPUHeatDeath
   - Subsections: Gravity & Physics (GravitySim, fraqtl_devsdk), Entropy (RotaEntropy/), Fractals & Waves (EGPTFactalWave, EGPTfractal), Number Theory (EGPTNumberUniformity)

5. **`content/_meta.json`** — Module 4: Papers & Stories
   - Title: "Papers, Books & Stories"
   - Primary ideas: all five
   - Highlights: PeqNP_QED.md, FRAQTL_WhitePaper, GravityPaper, RET_Paper, EGPT_Stories
   - Subsections: Papers (by idea), Books (Ulam, Von Neumann, Rota), Stories (EGPT_Stories/), SDK (pyFRAQTL)
   - Do This First: mathematician → PeqNP_QED, physicist → GravityPaper, cryptographer → No Q-Day Threat, founder-investor → Executive_Summary

6. **`docs/_meta.json`** — Module 5: Navigation & Reference
   - Title: "Navigation & Reference"
   - Primary ideas: all five
   - Highlights: PROOF_GRAPH.md (Mermaid), proof_graph.json, audit files
   - Special: this page renders the Mermaid proof dependency DAG inline
   - Related: IDEAS.md, AGENTS.md, llms.txt

**Critical requirements for @doc-writer:**
- Every file path in `highlights` and `subsections` MUST exist. Verify before writing.
- `do_this_first` actions must match the "Do This First" tables in `IDEAS.md` — keep them synchronized.
- Use the exact idea colors from root `_meta.json`.
- The `description` field should be written for a general audience, not just experts.

### 5.4 @doc-writer — `generate_sitemap.js` Modification

Modify `scripts/generate_sitemap.js` to support dual-mode URL generation:

**Current behavior:** Outputs GitHub blob URLs (`https://github.com/eabadir/EGPT/blob/main/...`)

**New behavior:** Accept a `--pages` flag that outputs Pages-relative URLs instead:
- `--pages` flag: URLs become relative paths (`./Lean/EGPT/Core.lean`)
- Default (no flag): Current behavior (GitHub blob URLs) preserved
- The script should also add `index.html` files to the sitemap when `--pages` mode is active
- Add priority rules for the new `index.html` files (priority 0.9, freq weekly)
- Add `_meta.json` files to SKIP list (they are internal, not for sitemap)
- Add `site-template.html` to SKIP list
- Add `site-assets/` directory to SKIP_DIRS

**Why:** The sitemap needs to serve double duty — GitHub blob URLs for AI crawlers discovering the repo, and relative URLs for the Pages site's internal navigation.

### 5.5 @js-engineer — GitHub Actions Workflow

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Generate site
        run: |
          node scripts/generate_site.js
          node scripts/generate_sitemap.js --pages

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 5.6 @sync-validator — New Checks (18–22)

Add the following checks to the sync-validator's validation checklist:

**Check 18: _meta.json File Existence**
Verify `_meta.json` exists in: root, `Lean/`, `EGPTMath/`, `www/`, `content/`, `docs/`.

**Check 19: _meta.json File Path Validity**
For each `_meta.json`, verify every file path in `highlights`, `subsections`, and `do_this_first` resolves to an actual file on disk.

**Check 20: _meta.json ↔ IDEAS.md Consistency**
Verify that "Do This First" actions in `_meta.json` files match the corresponding "Do This First" columns in `IDEAS.md` artifact tables.

**Check 21: Generated index.html Freshness**
Run `node scripts/generate_site.js --dry-run` and compare the expected output list against existing `index.html` files. Flag if any are missing or stale.

**Check 22: Site Assets Exist**
Verify `site-assets/style.css`, `site-assets/site.js`, and `site-assets/mermaid.min.js` exist and are non-empty.

### 5.7 @doc-writer — Agent File Updates

Update the following agent files with GitHub Pages awareness:

1. **`doc-writer.md`** — Add to "Files You Maintain":
   - `_meta.json` files (one per directory with site content)
   - Add to cross-reference checks: "_meta.json file paths resolve to real files"
   - Add to pre-push checklist: "Regenerate site: `node scripts/generate_site.js`"

2. **`sync-validator.md`** — Add checks 18–22 as described above.

3. **`demo-builder.md`** — Add to "When Creating a New Demo":
   - Step 6: "Update `www/_meta.json` to include the new demo in highlights or embed_demos"

4. **`egpt-orchestrator.md`** — Add to Sync Matrix:
   - **`_meta.json` changed:** → MUST: regenerate site via `node scripts/generate_site.js`
   - **New directory with content added:** → MUST: `@doc-writer` create `_meta.json` for new directory
   - **Pre-push:** → MUST: regenerate site alongside sitemap and llms tiers
   - Add `site-assets/` to the "Web demos" layer in Step 1 table

5. **`js-engineer.md`** — Add to "After Any Change":
   - Step 5: "If test count changed, update `EGPTMath/_meta.json` description"

6. **`content-author.md`** — Add to "When Invoked":
   - "When adding new papers or stories, update `content/_meta.json` highlights and subsections"

---

## 6. Execution Order

The tasks above have dependencies. Execute in this order:

| Step | Agent | Task | Depends On |
|------|-------|------|------------|
| 1 | @doc-writer | Create all 6 `_meta.json` files | Nothing (can start immediately) |
| 2 | @demo-builder | Create `site-assets/` (CSS + JS + Mermaid) | Nothing (can start in parallel with Step 1) |
| 3 | @js-engineer | Create `site-template.html` | Step 2 (needs CSS class names) |
| 4 | @js-engineer | Create `scripts/generate_site.js` | Steps 1, 2, 3 (needs meta files + template) |
| 5 | @js-engineer | Modify `scripts/generate_sitemap.js` | Nothing (can start in parallel) |
| 6 | @js-engineer | Create `.github/workflows/deploy-pages.yml` | Nothing (can start in parallel) |
| 7 | @js-engineer | Run `node scripts/generate_site.js` and verify output | Steps 1–4 |
| 8 | @doc-writer | Update all 6 agent `.md` files | Steps 1–4 (needs to reference new files) |
| 9 | @sync-validator | Run full validation including new checks 18–22 | Steps 1–8 |

**Parallel tracks:**
- Track A (Steps 1, 8): @doc-writer — meta files, then agent updates
- Track B (Steps 2): @demo-builder — site assets
- Track C (Steps 3, 4, 5, 6, 7): @js-engineer — template, generator, sitemap mod, workflow

Steps 1 and 2 can run in parallel. Step 3 waits for Step 2. Step 4 waits for Steps 1–3. Steps 5 and 6 can run anytime. Step 7 is the integration test. Step 8 can start after Step 4. Step 9 is the final gate.

---

## 7. Success Criteria

The phase is complete when:

1. `node scripts/generate_site.js` runs without errors and produces `index.html` files in root, Lean/, EGPTMath/, www/, content/, docs/
2. Opening root `index.html` in a browser shows:
   - Course title "18.313 — Introduction To EGPT: The New Manhattan Project"
   - Five idea cards with correct colors
   - Module cards linking to each directory
   - Persona tabs with "Do This First" actions
   - Mermaid proof dependency graph rendered inline
3. Each directory `index.html` shows:
   - Directory title, description, idea badges
   - Persona-specific entry points
   - Highlighted files with clickable links
   - Subsection file listings
   - Related reading links
4. `www/index.html` includes iframe previews of at least GravitySim and fraqtl_devsdk
5. All links resolve (no 404s) — verified by `@sync-validator` check 19
6. `_meta.json` "Do This First" entries match `IDEAS.md` — verified by check 20
7. `node scripts/generate_sitemap.js --pages` produces a valid sitemap with Pages-relative URLs
8. `.github/workflows/deploy-pages.yml` is syntactically valid YAML
9. `@sync-validator` reports all checks 1–22 passing
10. No floating point introduced anywhere (invariant preserved)

---

## 8. Future Enhancements (Not In This Phase)

These are out of scope for Phase 6 but should be considered for later:

- **Search:** Add a client-side search using lunr.js or pagefind, indexing all `.md` content
- **Lean syntax highlighting:** Use a Lean 4 grammar for `<code>` blocks in proof pages
- **Auto-updating diagram:** Have `generate_site.js` read `docs/proof_graph.json` and render an interactive D3 force-directed graph instead of static Mermaid
- **Per-idea landing pages:** `ideas/id1.html`, `ideas/id2.html` etc. that aggregate all content tagged with that idea across all directories
- **RSS feed:** Generate an RSS feed from git log for "what's new in EGPT"
- **Dark mode toggle:** Manual toggle in addition to `prefers-color-scheme`
- **PDF course export:** Generate a single PDF "textbook" from all module content

---

## 9. Relationship to Existing Infrastructure

This phase extends (does not replace) the existing navigation stack:

| Layer | Purpose | Audience | Status |
|-------|---------|----------|--------|
| `llms.txt` | AI crawler discovery | AI agents, LLMs | Exists (hand-maintained) |
| `llms-full.txt` + `llms-id*.txt` | Deep AI ingestion | AI agents doing analysis | Exists (generated) |
| `sitemap.xml` | File inventory with priorities | AI crawlers, search engines | Exists (generated) |
| `AGENTS.md` | Tool-agnostic AI navigation | Cursor, Copilot, generic AI | Exists |
| `.claude/agents/*.md` | Claude-specific agent instructions | Claude Code agents | Exists |
| `IDEAS.md` | Human routing by idea and persona | Human visitors, AI context | Exists |
| **`_meta.json` + generated HTML** | **Browser-navigable course site** | **Human visitors via browser** | **NEW (this phase)** |

The new layer reads from `IDEAS.md`, `sitemap.xml`, and `docs/PROOF_GRAPH.md` but does not modify them. It adds `_meta.json` as a new authoritative source for directory-level metadata, maintained by `@doc-writer` alongside `CLAUDE.md`.

---

## 10. `_meta.json` ↔ `CLAUDE.md` Relationship

Both files describe a directory. They serve different audiences:

| | `CLAUDE.md` | `_meta.json` |
|---|---|---|
| **Audience** | AI agents working inside the repo | Human visitors browsing the site |
| **Tone** | Technical, imperative ("You maintain these files") | Descriptive, navigational ("This directory contains...") |
| **Content** | Conventions, invariants, cross-references | Titles, descriptions, highlights, persona routing |
| **Maintained by** | @doc-writer | @doc-writer |
| **Read by** | AI agents, Claude Code | `generate_site.js` |

They should not duplicate information. `CLAUDE.md` tells agents *how to work*. `_meta.json` tells the site generator *what to display*. When a new file is added, both need updating — `CLAUDE.md` with conventions and `_meta.json` with a highlight entry if the file is significant.
