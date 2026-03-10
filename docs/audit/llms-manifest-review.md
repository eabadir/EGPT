# llms Manifest Review — Phase 5 Task 5

Cross-check of Tier 3 manifests against Phase 1 audits.

## Summary

The Tier 3 manifests correctly include all primary Lean proofs, EGPTMath code, and content/papers for each idea. The audits flag interactive demos (www/) as primary artifacts for most ideas, but **these should NOT be added to Tier 3 manifests** because:

1. Three of five Tier 3 files already exceed the 200KB target (id1: 249KB, id4: 225KB, id5: 242KB)
2. Demo source files are large (fraqtl_devsdk engine: 5000+ lines, the-address-is-the-map-visualizer: 27 React components)
3. Demos are interactive — their value is in running them, not reading the source in a text dump
4. All demos are prominently linked in llms.txt, IDEAS.md, and README.md (which are inlined in Tier 2)

## Per-Idea Review

### ID1 (Ulam) — 6 files, 249KB
**Included:** Core.lean, NumberTheory/Core.lean, EGPTNumber.js, Ulam's book, Indiscrete Thoughts, GravityPaper.tex
**Audit flags as missing:** GravitySim (demo), EGPTFractalWave.html (demo)
**Decision:** Keep as-is. Already over 200KB. GravitySim is linked in header and Tier 2.

### ID2 (Von Neumann) — 13 files, 189KB
**Included:** Full EGPTMath + FAT suite, PPNP.lean, Tableau.lean, Notes, FRAQTL whitepaper
**Audit flags as missing:** fraqtl_devsdk (demo), GPUHeatDeath.html (demo)
**Decision:** Keep as-is. Best-covered idea. Adding fraqtl_devsdk engine would push well past limits.

### ID3 (Einstein) — 11 files, 172KB
**Included:** Full Physics/ Lean module (8 files), EGPTranscendental.js, GravityPaper, Nile story
**Audit flags as missing:** 5 demos (GravitySim, fraqtl_devsdk, EGPTfractal, EGPTFractalWave, GPUHeatDeath)
**Decision:** Keep as-is. Most complete proof coverage. Demos linked in Tier 2.

### ID4 (Rota) — 6 files, 225KB
**Included:** Full Entropy/ Lean module (3 files), Analysis.lean, RET_README, Impossible Audit story
**Audit flags as missing:** 5 demos (RotaEntropyProperties, NumberUniformity, EntropyUniformity, TheGreatestDebate, EGPTPrimeShannonCodes)
**Decision:** Keep as-is. Over 200KB. The PDF (ch8 Entropy) is correctly skipped by the generator. RET_README provides the pedagogical walkthrough.

### ID5 (Abadir) — 13 files, 242KB
**Included:** Full Complexity/ chain (4 files), CH + NumberTheory/Core, all skeptic guides, P=NP paper, Integer Infinity, FRAQTL + No Q-Day
**Audit flags as missing:** the-address-is-the-map-visualizer (React app), EGPTNumberUniformity (demo)
**Decision:** Keep as-is. Already over 200KB. Adding the React app (27 components) would be excessive.

## Size Violations

| File | Size | Limit | Status |
|------|------|-------|--------|
| llms-full.txt | 339 KB | 500 KB | PASS |
| llms-id1.txt | 249 KB | 200 KB | OVER by 49KB |
| llms-id2.txt | 189 KB | 200 KB | PASS |
| llms-id3.txt | 172 KB | 200 KB | PASS |
| llms-id4.txt | 225 KB | 200 KB | OVER by 25KB |
| llms-id5.txt | 242 KB | 200 KB | OVER by 42KB |

The overages come from large source files (EGPTNumber.js in ID1, Analysis.lean in ID4, PeqNP_QED.md + SKEPTICS_GUIDE in ID5). These are essential primary artifacts that cannot be removed without losing critical content. Recommend accepting the overages rather than removing primary artifacts.

## Recommendations

1. **Accept current manifests as-is.** All primary proof + code + paper artifacts are correctly included.
2. **Do not add demo source to Tier 3.** Demos are better served by links (Tier 1/2) than by inlining source.
3. **Consider raising Tier 3 limit to 250KB** to accommodate the three overages, which are due to essential content.
4. **Future optimization:** If size becomes a concern, consider splitting large files (e.g., excerpt key sections of SKEPTICS_GUIDE.md rather than inlining the full 242-line document).
