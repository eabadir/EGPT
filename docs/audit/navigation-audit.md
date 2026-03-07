# Navigation Layer Audit

> Task 5 of the IDEAS Audit Plan
> Date: 2026-03-06
> Scope: All navigation/index documents in the EGPT mono-repo

---

## 1. Five Ideas Reference

| ID | Author | Core Idea |
|----|--------|-----------|
| **ID1** | Ulam | CGS from a random walk |
| **ID2** | Von Neumann | Statistical AI computer |
| **ID3** | Einstein | Algebraic discrete physics |
| **ID4** | Rota | Entropy is the record of truth |
| **ID5** | Abadir | CH decidable / unique representations |

---

## 2. Coverage Matrix

Legend: `*` = primary coverage, `~` = secondary/passing mention, blank = absent

| File/Artifact | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|---------------|:---:|:---:|:---:|:---:|:---:|-------|
| **Root navigation** | | | | | | |
| `README.md` | * | * | * | * | * | Only document that introduces all five ideas explicitly with numbered list. Strongest entry point for idea-oriented visitors. |
| `AGENTS.md` | ~ | ~ | ~ | ~ | ~ | Mentions all five implicitly via proof chain and directory map, but does not name authors or ideas explicitly. Problem-oriented ("if you want to..."). |
| `llms.txt` | ~ | ~ | ~ | ~ | ~ | Lists all proof files but never names the five ideas or their authors. Pure link-dump orientation. |
| `EGPT_STORY.md` | * | * | * | * | ~ | Rich narrative of ID1-ID4 lineage. ID5 (CH/unique representations) is only hinted at via "Cantor's diagonalization" passage; no link to `ContinuumHypothesis.lean`. |
| `SKEPTICS_GUIDE.md` | ~ | ~ | | * | ~ | Heavily focused on P=NP proof mechanics (ID4-adjacent). ID1 mentioned only as "ParticlePath". ID3 absent. ID5 touched via LFTA/FTA argument. |
| `RET_README.md` | ~ | ~ | * | * | | Einstein-focused framing (ID3). RET is primary (ID4). Ulam mentioned as collaborator. ID2/ID5 absent. |
| `CH_README.md` | | | | | * | Dedicated to ID5. No cross-references to ID1-ID4. |
| `CH_SKEPTICS_GUIDE.md` | | | | | * | Dedicated to ID5 skeptic walkthrough. No cross-references to ID1-ID4. |
| `RET_README.md` (root) | ~ | ~ | * | * | | Strong on ID3+ID4. |
| **Lean navigation** | | | | | | |
| `Lean/CLAUDE.md` | | | | ~ | ~ | Technical module inventory. Mentions entropy and CH as features, not ideas. |
| `Lean/PROOF_DEPENDENCIES.md` | | | | ~ | ~ | Structural dependency graph. No narrative. |
| `Lean/EGPT_PROOFS_VALIDATION.md` | | | | ~ | * | Theorem inventory. CH section is substantial. No author attribution. |
| `Lean/EGPT/EGPT_README.md` | | | | ~ | | Module overview. Mentions entropy as "independent formalization." |
| `Lean/EGPT/PeqNP_Proof_README.md` | ~ | | | ~ | | Proof walkthrough. "Address is the map" framing touches ID1. |
| `Lean/EGPT/NumberTheory/CH_README.md` | | | | | * | Dedicated CH proof walkthrough. Ulam/vN quote on sets, but no cross-link to ID1-ID4. |
| **EGPTMath navigation** | | | | | | |
| `EGPTMath/CLAUDE.md` | | | | ~ | | Mentions PPF/RET briefly. No idea attribution. |
| `EGPTMath/README.md` | ~ | | | * | | PPF representation framed via RET. "Pythagorean Foundation" touches ID1 obliquely. |
| `EGPTMath/FAT/FAT_README.md` | | | | | | Pure technical doc. No idea framing at all. |
| `EGPTMath/benchmarks/README.md` | | ~ | | | | Benchmark results. Implicitly ID2 (efficiency). |
| **docs/ navigation** | | | | | | |
| `docs/PROOF_GRAPH.md` | | | | ~ | ~ | Mermaid diagrams. Structural only. |
| `docs/proof_graph.json` | | | | | | Machine-readable. No narrative. |
| **www/ navigation** | | | | | | |
| `www/CLAUDE.md` | | | | ~ | | Lists demos. RotaEntropy demo touches ID4. |
| `www/the-address-is-the-map-visualizer/README.md` | | | | | | Auto-generated AI Studio scaffold. No EGPT content. |
| **content/ navigation** | | | | | | |
| `content/CLAUDE.md` | ~ | ~ | | ~ | ~ | Directory listing. Papers cover multiple ideas but listing is not idea-indexed. |
| `content/pyFRAQTL/FRAQTL_WhitePaper.md` | | | | | | QFT/factoring white paper. No idea framing. |

---

## 3. Analysis

### 3.1 Does each navigation document reference all five ideas?

**Only `README.md` references all five ideas explicitly.** It is the single document that names all five authors, states their ideas, and links each to a proof file.

Every other document covers at most two or three ideas, and most do so implicitly (via proof/code references) rather than explicitly (naming the author and the idea).

The strongest per-idea coverage outside `README.md`:

| Idea | Best secondary doc | Gap |
|------|--------------------|-----|
| ID1 (Ulam) | `EGPT_STORY.md` | No dedicated "Ulam's random walk" entry point. The `IIDParticleSource` formalization is buried in `Core.lean` without a README. |
| ID2 (Von Neumann) | `EGPT_STORY.md`, `README.md` | The "statistical AI computer" idea is discussed narratively but has no dedicated technical walkthrough connecting it to EGPTMath/FAT benchmarks. |
| ID3 (Einstein) | `RET_README.md` | Well served by RET_README. No gap. |
| ID4 (Rota) | `SKEPTICS_GUIDE.md`, `RET_README.md`, `EGPTMath/README.md` | Best covered idea. Multiple entry points. |
| ID5 (Abadir) | `CH_README.md`, `CH_SKEPTICS_GUIDE.md` | Well covered for CH specifically, but these docs are orphaned -- not linked from most other navigation files. `EGPT_STORY.md` barely mentions CH. |

### 3.2 Problem-oriented vs. idea-oriented visitors

**Almost all navigation is problem-oriented.** The architecture assumes visitors arrive with a question like:

- "Is the P=NP proof valid?" --> `SKEPTICS_GUIDE.md`
- "How do I run the code?" --> `AGENTS.md`, `EGPTMath/CLAUDE.md`
- "What theorems exist?" --> `EGPT_PROOFS_VALIDATION.md`

**There is no idea-oriented routing layer** that says:

- "I'm interested in Ulam's random walk idea" --> go here
- "I want to understand how Einstein's discrete physics claim is formalized" --> go here
- "I came for Hilbert's First Problem" --> go here

The `README.md` "pick the idea that bothers you most" table is the closest thing to an idea router, but it jumps directly to Lean source files -- there is no intermediate explanatory document for most ideas.

### 3.3 Missing translations

The following "arrival intent --> destination" paths are currently broken or missing:

| Visitor arrives looking for... | Current path | What is missing |
|-------------------------------|-------------|-----------------|
| "Hilbert's First Problem" | No search-discoverable entry point | Neither `README.md` nor any navigation doc uses the phrase "Hilbert's First Problem" as a heading or anchor. It appears only inline in `README.md` text. |
| "Monte Carlo proof of P=NP" | None | Ulam's Monte Carlo connection to P=NP is narrated in `EGPT_STORY.md` but never linked from any navigation index. |
| "Von Neumann's brain-computer" | `README.md` narrative only | No dedicated walkthrough connecting `The Computer and the Brain` to EGPTMath's IOPs architecture. |
| "Cantor's diagonal argument flaw" | `CH_README.md`, but hard to find | `CH_README.md` is linked from `EGPT_PROOFS_VALIDATION.md` but not from `README.md`'s skeptic table or `SKEPTICS_GUIDE.md`. |
| "Integer-only FFT / QFT" | `EGPTMath/FAT/FAT_README.md` | Discoverable from `AGENTS.md` and `EGPTMath/CLAUDE.md`, but not linked from the root `README.md` "skeptic table." |
| "FRAQTL factorization" | `content/pyFRAQTL/FRAQTL_WhitePaper.md` | Linked from `AGENTS.md` but not from `README.md` or any user-facing narrative. |
| "EGPT_Paper.md" (academic paper) | **Does not exist.** | Referenced by `AGENTS.md` and `llms.txt` as a key entry point but the file has never been created. Dead link. |
| "Rota's 400-page manuscript" | `content/Books/Rota/` | Mentioned repeatedly in narrative docs but never linked with an exact path. |

### 3.4 User role coverage

| Role | Well-served? | Primary entry points found | Gaps |
|------|:---:|-----------|------|
| **AI/ML engineer** | Partial | `EGPTMath/README.md`, `EGPTMath/CLAUDE.md`, test suite | No "IOPs vs FLOPs" benchmark comparison page. FAT benchmark is on Colab (external), not in-repo. The "Do This First" (`npm install && node test/EGPTTestSuite.js`) is easy to find in `README.md` but not called out as a role-specific path. |
| **CS student** | Weak | `www/` demos exist but are not indexed by concept | No "getting started" page. No guided tour. The `www/CLAUDE.md` lists files but does not explain what each demo teaches. The visualizer README is an AI Studio scaffold with no EGPT content. |
| **Complexity theorist** | Strong | `SKEPTICS_GUIDE.md`, `Lean/EGPT/PeqNP_Proof_README.md`, `EGPT_PROOFS_VALIDATION.md` | Well-served. Clear "Do This First": `cd Lean && lake build`. Multiple audit-oriented docs. |
| **Proof engineer** | Strong | `Lean/CLAUDE.md`, `EGPT_PROOFS_VALIDATION.md`, `PROOF_DEPENDENCIES.md`, `PROOF_GRAPH.md` | Excellent. The Lean layer has the most thorough navigation. |
| **Cryptographer** | Weak | `content/pyFRAQTL/FRAQTL_WhitePaper.md` | FRAQTL is buried in `content/`. No root-level mention in `README.md`. The Colab link exists but is not framed as a cryptography entry point. |
| **Hardware engineer** | Weak | Colab benchmark link in `README.md` | No in-repo benchmark page. No hardware-oriented documentation (power consumption, IOP throughput, etc.). |
| **Mathematician** | Good | `EGPT_PROOFS_VALIDATION.md`, `RET_README.md`, `SKEPTICS_GUIDE.md` | Reasonably well-served. Could benefit from a "theorem catalog" that is organized by mathematical domain rather than by file. |
| **Physicist** | Good | `EGPT_STORY.md`, `RET_README.md` | Good narrative path. Physics chain in `Lean/EGPT/Physics/` lacks its own README. |
| **Quantum computing enthusiast** | Partial | FAT_README, FRAQTL white paper, Colab link | The FAT-to-classical-QFT story requires navigating from `README.md` --> `EGPTMath/FAT/FAT_README.md` --> Colab. No single "quantum computing" entry point. |
| **Philosopher of mind** | Partial | `EGPT_STORY.md` | Good narrative. No dedicated "consciousness" or "philosophy of mind" entry point despite extensive philosophical content in `EGPT_STORY.md`. |
| **Founder/investor** | Weak | Colab benchmark link, `content/Faster Abadir Transform BP/` | Business plan docs exist in `content/` but are not linked from any navigation file. No executive summary at root level. |
| **AI industry practitioner** | Broken | `EGPT_Paper.md` is the recommended "Do This First" but **the file does not exist**. | Critical gap. The primary entry point for this role is a dead link. |

### 3.5 CS student getting-started path

**There is no getting-started path for the CS student.**

The closest thing is:
1. `README.md` mentions `open www/EGPTNumberUniformity.html`
2. `www/CLAUDE.md` lists demo files

But there is no guided sequence like: "Open this demo first, then this one, then try running the test suite." The `www/the-address-is-the-map-visualizer/` has the most potential as an interactive learning tool, but its README is an auto-generated AI Studio scaffold with no EGPT-specific content or pedagogical guidance.

### 3.6 FAT --> classical QFT navigability

**The story is navigable but requires three hops and prior knowledge of what to look for.**

Path: `README.md` (mentions FAT benchmark, links Colab) --> `EGPTMath/FAT/FAT_README.md` (technical implementation details) --> Colab notebook (full white paper + benchmark).

Missing:
- No "What is FAT?" summary at root level beyond a single paragraph in `README.md`.
- `FAT_README.md` is a pure technical doc with no narrative framing (no mention of quantum computing, Shor's algorithm, or why this matters).
- The Colab notebook is external and may go offline. No in-repo fallback.
- The `content/pyFRAQTL/FRAQTL_WhitePaper.md` is the actual white paper but is not linked from `FAT_README.md`.
- A quantum computing enthusiast searching for "QFT" or "Shor" would not find those terms in any navigation file except `README.md` and `FRAQTL_WhitePaper.md`.

---

## 4. "Do This First" Entry Points: Findability

| Role | "Do This First" action | Easy to find? | Where discoverable |
|------|----------------------|:---:|------|
| AI/ML engineer | `cd EGPTMath && npm install && node test/EGPTTestSuite.js` | Yes | `README.md`, `AGENTS.md`, `EGPTMath/CLAUDE.md` -- all three list it |
| CS student | Open a `www/` demo | Partial | `README.md` mentions it once. No guided path. |
| Complexity theorist | `cd Lean && lake build` | Yes | `README.md`, `AGENTS.md`, `Lean/CLAUDE.md`, `SKEPTICS_GUIDE.md` |
| Proof engineer | Read `Lean/EGPT_PROOFS_VALIDATION.md` | Yes | Linked from `README.md`, `AGENTS.md`, `llms.txt` |
| Cryptographer | Run QFT Benchmark on Colab | Partial | Colab link in `README.md` and `FRAQTL_WhitePaper.md`. Not labeled as a cryptography entry point. |
| Hardware engineer | Run QFT Benchmark on Colab | Partial | Same as cryptographer. No hardware-specific framing. |
| Mathematician | Read `Lean/EGPT_PROOFS_VALIDATION.md` | Yes | Well-linked |
| Physicist | Read `EGPT_STORY.md` | Yes | Linked from `README.md`, `AGENTS.md` |
| Quantum computing enthusiast | Run QFT Benchmark on Colab | Partial | The Colab link exists but is not framed as "start here for quantum computing." |
| Philosopher of mind | Read `EGPT_STORY.md` | Yes | Linked from `README.md` |
| Founder/investor | Run QFT Benchmark on Colab | Weak | Colab link exists. Business plan in `content/` is invisible from nav layer. |
| AI industry practitioner | Read `EGPT_Paper.md` | **Broken** | File does not exist. Dead link in `AGENTS.md` and `llms.txt`. |

---

## 5. Identified Gaps (Priority Order)

### Critical

1. **`EGPT_Paper.md` does not exist.** It is referenced as a primary entry point in `AGENTS.md` and `llms.txt` but the file has never been created. This is the recommended "Do This First" for AI industry practitioners. **Dead link.**

2. **No idea-oriented routing layer.** The repo assumes visitors arrive looking for "P=NP" or "integer math." Visitors arriving from "Hilbert's First Problem," "Von Neumann's brain-computer," "Cantor's diagonal flaw," or "Ulam's random walk" have no discoverable entry point beyond reading the entire `README.md`.

### High

3. **CH docs are orphaned.** `CH_README.md` and `CH_SKEPTICS_GUIDE.md` exist at root level but are not linked from `README.md`'s skeptic table, `SKEPTICS_GUIDE.md`, `AGENTS.md`, or `llms.txt`. A visitor interested in the Continuum Hypothesis must already know these files exist.

4. **`EGPT_STORY.md` does not link to CH proof.** The narrative mentions Cantor's diagonalization but does not link to `ContinuumHypothesis.lean`, `CH_README.md`, or `CH_SKEPTICS_GUIDE.md`.

5. **No CS student getting-started path.** The `www/` demos exist but have no pedagogical index, no suggested sequence, and no explanatory context.

6. **FAT narrative gap.** `FAT_README.md` is purely technical. It does not explain why FAT matters, does not mention quantum computing or Shor's algorithm, and does not link to `FRAQTL_WhitePaper.md`.

### Medium

7. **No physicist README for `Lean/EGPT/Physics/`.** The physics chain (BE/FD/MB distributions, `RealityIsComputation`) has no dedicated walkthrough document. A physicist must navigate from `EGPT_STORY.md` or `RET_README.md` and then read raw Lean files.

8. **Business plan docs invisible.** `content/Faster Abadir Transform BP/` contains executive summary and market research, but these are not linked from any navigation file. Founder/investor role is underserved.

9. **FRAQTL buried.** The FRAQTL white paper and pyFRAQTL SDK are linked only from `AGENTS.md` and `content/CLAUDE.md`. No root-level visibility.

10. **`www/the-address-is-the-map-visualizer/README.md` is placeholder.** The most ambitious interactive demo has an auto-generated AI Studio README with no EGPT content.

### Low

11. **Theorem count inconsistency.** `README.md`, `AGENTS.md`, and `llms.txt` say "85 theorems." `EGPT_PROOFS_VALIDATION.md` says "86 theorems." One of these is stale.

12. **`RET_README.md` says "81 theorems"** in one passage -- another stale count.

13. **`EGPTMath/README.md` references `lib/test/EGPTTestSuite.js`** but the actual test path (per `EGPTMath/CLAUDE.md`) is `test/EGPTTestSuite.js`. May be a stale path from a directory restructure.

14. **`llms.txt` and `AGENTS.md` both reference `EGPT_Paper.md` with GitHub URLs** that will 404. These need to be removed or the file needs to be created.

---

## 6. Summary of Recommendations

| # | Action | Addresses |
|---|--------|-----------|
| 1 | Create `EGPT_Paper.md` or remove all references to it | Gap 1, Gap 14 |
| 2 | Add an "Ideas Index" section to `README.md` or create a standalone `IDEAS.md` that routes visitors by idea (Ulam, Von Neumann, Einstein, Rota, Abadir) with per-idea "start here" links | Gap 2 |
| 3 | Add `CH_README.md` and `CH_SKEPTICS_GUIDE.md` to the skeptic table in `README.md` and to `AGENTS.md`/`llms.txt` | Gap 3 |
| 4 | Add CH cross-links to `EGPT_STORY.md` and `SKEPTICS_GUIDE.md` | Gap 4 |
| 5 | Create a `www/GETTING_STARTED.md` or add a guided demo sequence to `www/CLAUDE.md` | Gap 5 |
| 6 | Add a narrative "Why FAT matters" section to `FAT_README.md` linking to FRAQTL white paper | Gap 6 |
| 7 | Create `Lean/EGPT/Physics/PHYSICS_README.md` | Gap 7 |
| 8 | Link business plan docs from `README.md` or a new investor-oriented section | Gap 8 |
| 9 | Reconcile theorem counts across all navigation docs | Gap 11, 12 |
| 10 | Verify and fix `EGPTMath/README.md` test path | Gap 13 |
