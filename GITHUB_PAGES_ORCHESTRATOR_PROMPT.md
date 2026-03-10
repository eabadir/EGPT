# Orchestrator Prompt — Phase 6: GitHub Pages Site Generation

Copy everything below the line into Claude Code as the prompt for `@egpt-orchestrator`:

---

@egpt-orchestrator Read `GITHUB_PAGES_DESIGN.md` and execute Phase 6 — building the GitHub Pages site for "18.313 — Introduction To EGPT: The New Manhattan Project."

## Context

This is Phase 6 of the IDEAS Audit Plan. We are adding a browser-navigable course site layer on top of the existing navigation stack (llms.txt, AGENTS.md, sitemap.xml, IDEAS.md). The design doc at `GITHUB_PAGES_DESIGN.md` specifies everything — the `_meta.json` schema, agent task assignments, execution order, success criteria, and template structure.

## What You Need To Do

Read `GITHUB_PAGES_DESIGN.md` in full, then delegate to specialists in this order:

### Parallel Track (Steps 1 + 2 + 5 + 6 — can all start simultaneously)

1. **@doc-writer**: Create all 6 `_meta.json` files as specified in §4 and §5.3 of the design doc:
   - Root `_meta.json` (site-wide config with ideas, personas, modules, external resources)
   - `Lean/_meta.json` (Module 1: Proof Chain)
   - `EGPTMath/_meta.json` (Module 2: Integer Math Library)
   - `www/_meta.json` (Module 3: Interactive Demos)
   - `content/_meta.json` (Module 4: Papers & Stories)
   - `docs/_meta.json` (Module 5: Navigation & Reference)

   **CRITICAL**: Every file path in `highlights`, `subsections`, and `do_this_first` MUST be verified against actual files on disk before writing. Use `ls` or `find` to confirm paths. Cross-reference `IDEAS.md` "Do This First" columns to keep them synchronized.

2. **@demo-builder**: Create `site-assets/` directory as specified in §5.2:
   - `site-assets/style.css` — Full course branding with idea colors, persona tabs, module cards, responsive layout, dark/light mode
   - `site-assets/site.js` — Vanilla JS for persona tab switching, Mermaid init, mobile nav
   - Download Mermaid 10.x as `site-assets/mermaid.min.js`

   **Style reference**: Use `www/GPUHeatDeath.html` and `www/RotaEntropy/RotaEntropyProperties.html` as aesthetic guides.

3. **@js-engineer** (parallel tasks):
   - Modify `scripts/generate_sitemap.js` to support `--pages` flag as specified in §5.4
   - Create `.github/workflows/deploy-pages.yml` as specified in §5.5

### Sequential Track (Steps 3 → 4 → 7 — after parallel track completes)

4. **@js-engineer**: Create `site-template.html` as specified in §5.1 — single HTML template with placeholder tokens (`{{PAGE_TITLE}}`, `{{IDEA_BADGES}}`, etc.). Reference the CSS class names from the `style.css` that @demo-builder created.

5. **@js-engineer**: Create `scripts/generate_site.js` as specified in §5.1 — the main generator script that:
   - Reads all `_meta.json` files
   - Reads `site-template.html`
   - Reads `sitemap.xml` for file inventory
   - Extracts Mermaid diagrams from `docs/PROOF_GRAPH.md`
   - Generates `index.html` for root + each directory with `_meta.json`
   - Supports `--dry-run` flag
   - Pure Node.js, no dependencies
   - Links `.lean` and `.js` files to GitHub blob URLs
   - Links `.html` demo files as relative paths
   - Links `.md` files to GitHub-rendered versions

6. **@js-engineer**: Run `node scripts/generate_site.js` and verify the output. Fix any errors.

### Finalization (Steps 8 → 9)

7. **@doc-writer**: Update all 6 agent `.md` files as specified in §5.7:
   - `doc-writer.md` — add `_meta.json` to maintained files, add site regeneration to pre-push
   - `sync-validator.md` — add checks 18–22
   - `demo-builder.md` — add step 6 (update `www/_meta.json` when creating demos)
   - `egpt-orchestrator.md` — add `_meta.json` and `site-assets/` to sync matrix, add site regeneration to pre-push
   - `js-engineer.md` — add `_meta.json` update note
   - `content-author.md` — add `_meta.json` update note

8. **@sync-validator**: Run full validation including new checks 18–22. Report all results.

## Success Criteria (from §7)

The phase is complete when ALL of these pass:
- `node scripts/generate_site.js` produces index.html files in root, Lean/, EGPTMath/, www/, content/, docs/ without errors
- All file paths in `_meta.json` files resolve to real files
- `_meta.json` "Do This First" entries match `IDEAS.md`
- `node scripts/generate_sitemap.js --pages` produces valid output
- `.github/workflows/deploy-pages.yml` is valid YAML
- All sync-validator checks 1–22 pass
- No floating point introduced anywhere

## Important Notes

- Do NOT modify any existing `.md`, `.lean`, `.js`, or `.html` files (except `generate_sitemap.js` which gets the `--pages` flag added)
- The new `index.html` files are GENERATED — they should never be hand-edited. Always regenerate via `generate_site.js`.
- The `site-template.html` is the only hand-maintained HTML file. All `index.html` files derive from it.
- The `_meta.json` files are the authoritative source for site content. The generator reads them; agents maintain them.
- Reference the idea colors from root `_meta.json` — do NOT hardcode colors in CSS. The CSS should use CSS custom properties that `generate_site.js` injects from the root config.
