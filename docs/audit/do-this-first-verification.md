# "Do This First" Verification Report

**Date:** 2026-03-07
**Auditor:** @js-engineer (Phase 2, Task 4)

---

## Summary

| # | Check | Result |
|---|-------|--------|
| 1 | EGPTMath test suite | **PASS** |
| 2 | www/EGPTNumberUniformity.html | **PASS** |
| 3 | Lean build (`cd Lean && lake build`) | **PASS** (warnings only) |
| 4 | PeqNP_QED.md exists | **PASS** |
| 5 | Entry-point markdown files exist | **PASS** |
| 6 | Colab link consistency | **PARTIAL** |
| 7 | EGPTMath/FAT entry point | **PARTIAL** |
| 8 | FRAQTL_WhitePaper.md | **PASS** |
| 9 | EGPT_PROOFS_VALIDATION.md | **PASS** |

**Overall: 7 PASS, 2 PARTIAL, 0 FAIL**

---

## Detailed Results

### 1. EGPTMath Test Suite — PASS

Command: `cd EGPTMath && npm install && node test/EGPTTestSuite.js`

- `npm install` completed cleanly (0 vulnerabilities).
- **157/157 tests passed (100.0% success rate).**
- Two non-fatal `toNumber()` precision warnings emitted during the Riemann Zeta test — expected behavior, not errors.
- No import errors, no failures.

### 2. www/EGPTNumberUniformity.html — PASS

- File exists at `www/EGPTNumberUniformity.html` (288 lines).
- External dependencies:
  - `https://cdn.jsdelivr.net/npm/chart.js` — CDN, will load in browser.
  - `css/style.css` — verified present at `www/css/style.css`.
- No broken script tags or missing local dependencies detected.
- File is well-formed HTML5 with inline styles and proper structure.

### 3. Lean Build — PASS (warnings only)

Command: `cd Lean && lake build`

- Both `lean` and `lake` are installed (`/opt/homebrew/bin/lean`, `/opt/homebrew/bin/lake`).
- `lakefile.lean` and `lean-toolchain` both present.
- **Build completed successfully.**
- Warnings only (linter suggestions: `simpa` -> `simp`, deprecated `∑ x in s` notation, unused tactics). No errors. No `sorry` detected in build output.

### 4. PeqNP_QED.md — PASS

- File exists at: `content/Papers/EGPT_PeqNP/PeqNP_QED.md` (550 lines, non-empty).
- Old name `EGPT_Paper.md` no longer exists anywhere in the repo. Rename is clean.

### 5. Entry-Point Markdown Files — PASS

All files exist and are non-empty:

| File | Location | Lines |
|------|----------|-------|
| `SKEPTICS_GUIDE.md` | Root | 545 |
| `RET_README.md` | Root (also copy at `temp/include_old/PPNP/`) | 240 |
| `CH_README.md` | Root (also copy at `Lean/EGPT/NumberTheory/`) | 242 |
| `CH_SKEPTICS_GUIDE.md` | Root | 116 |

Note: `RET_README.md` and `CH_README.md` have duplicate copies in subdirectories. This is not a problem but worth noting for deduplication.

### 6. Colab Link Consistency — PARTIAL

**URL:** `https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm`

The URL appears in 7 files and is consistent everywhere **except one**:

- `EGPT_STORY.md` uses the URL with a `?usp=sharing` query parameter suffix:
  `https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm?usp=sharing`

This is functionally equivalent (the `?usp=sharing` is a Google sharing tracker, the link still works), but for strict consistency it differs from all other occurrences.

**Action needed:** Normalize `EGPT_STORY.md` line 20 to remove the `?usp=sharing` suffix, or accept the minor inconsistency.

### 7. EGPTMath/FAT Entry Point — PARTIAL

- `EGPTMath/FAT/FAT_README.md` exists (139 lines, non-empty). This is the actual FAT entry-point doc.
- **However:** `EGPTMath/FAT/README.md` does NOT exist — it was deleted (visible in git status as `D EGPTMath/FAT/README.md`).
- The `IDEAS_AUDIT_PLAN.md` (lines 28, 36) and `CLAUDE.md` both reference `EGPTMath/FAT/README.md` as the entry point for hardware engineers and quantum computing enthusiasts.
- These references now point to a non-existent file.

**Action needed:** Either:
1. Rename `FAT_README.md` back to `README.md`, or
2. Update all references in `IDEAS_AUDIT_PLAN.md` and `CLAUDE.md` to point to `EGPTMath/FAT/FAT_README.md`.

### 8. FRAQTL_WhitePaper.md — PASS

- File exists at: `content/pyFRAQTL/FRAQTL_WhitePaper.md` (122 lines, non-empty).
- Entry point for cryptographers is valid.

### 9. EGPT_PROOFS_VALIDATION.md — PASS

- File exists at: `Lean/EGPT_PROOFS_VALIDATION.md` (270 lines, non-empty).
- Entry point for proof engineers and mathematicians is valid.

---

## Issues Requiring Action

### Must Fix (blocks "Do This First" flow)

1. **Broken FAT README reference.** `EGPTMath/FAT/README.md` is deleted but still referenced as the entry point for hardware engineers and quantum enthusiasts in `IDEAS_AUDIT_PLAN.md` and `CLAUDE.md`. The actual file is `EGPTMath/FAT/FAT_README.md`. Either restore the old name or update all references.

### Nice to Fix (cosmetic)

2. **Colab URL inconsistency.** `EGPT_STORY.md` appends `?usp=sharing` to the Colab URL; all other files omit it. Functionally identical but inconsistent.

3. **Duplicate entry-point docs.** `RET_README.md` exists at root and `temp/include_old/PPNP/`. `CH_README.md` exists at root and `Lean/EGPT/NumberTheory/`. Consider whether the duplicates are intentional.
