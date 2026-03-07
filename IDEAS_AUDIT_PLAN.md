# IDEAS Reorganization — Phased Plan

> **Purpose**: Reorganize the repository's AI navigation layer around five foundational ideas (ID1–ID5) so that both human visitors and AI agents can efficiently route from *what they're looking for* to *where it lives*.

## The Five Ideas

| ID | Author | Core Idea | One-liner |
|----|--------|-----------|-----------|
| **ID1** | Ulam | CGS from a random walk | Physical units emerge from pure mathematics via random walks |
| **ID2** | Von Neumann | Statistical AI computer | An ultra-efficient computer operates statistically, not arithmetically |
| **ID3** | Einstein | Algebraic discrete physics | All of modern physics derives from a purely algebraic, discrete theory |
| **ID4** | Rota | Entropy is the record of truth | The logarithm is the unique measure; physics, computation, and information share one foundation |
| **ID5** | Abadir | CH decidable / unique representations | In maximally compressed information space, Cantor's diagonal fails; all infinities collapse onto ℕ |

## User Roles (who navigates this repository)

Each role has a **"Do This First"** action — the single most compelling thing they can do or see within 60 seconds of arriving. The mind maps (Phase 2) will route from this first action into deeper exploration.

### Code-first (will clone, build, read source)

| Role | Motivation | Do This First |
|------|-----------|---------------|
| **AI/ML engineer** | Wants to build more efficient models using IOPs instead of FLOPs | `cd EGPTMath && npm install && node test/EGPTTestSuite.js` — see 157 tests pass with zero floating point |
| **CS student / learner coder** | "How do I get started coding stuff with this?" Wants runnable examples and something to tinker with | Open a `www/` demo in the browser (e.g., `EGPTNumberUniformity.html`) — see the math running visually, then look at the source |
| **Complexity theorist** | Came for P=NP, wants to audit the proof chain | `cd Lean && lake build` — watch 85 theorems typecheck with 0 sorries, then read [`SKEPTICS_GUIDE.md`](SKEPTICS_GUIDE.md) |
| **Proof engineer** | Interested in Lean 4 methodology, sorry-free techniques | Read [`Lean/EGPT_PROOFS_VALIDATION.md`](Lean/EGPT_PROOFS_VALIDATION.md) — the full axiom inventory showing only `propext`, `Quot.sound`, `Classical.choice` |
| **Cryptographer** | FRAQTL factorization, P=NP implications for crypto | Run the [QFT Benchmark on Google Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) — see classical integer-only QFT outperform GPU FFT, then read [`content/pyFRAQTL/FRAQTL_WhitePaper.md`](content/pyFRAQTL/FRAQTL_WhitePaper.md) |
| **Hardware/infrastructure engineer** | FLOPs→IOPs benchmarks, FAT performance, chip implications | Run the [QFT Benchmark on Google Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) — see the performance numbers, then read [`EGPTMath/FAT/README.md`](EGPTMath/FAT/README.md) for architecture |

### Theory-first (will read proofs, papers, narratives)

| Role | Motivation | Do This First |
|------|-----------|---------------|
| **Mathematician** | Number theory, set theory, formal methods | Read [`Lean/EGPT_PROOFS_VALIDATION.md`](Lean/EGPT_PROOFS_VALIDATION.md) — the complete theorem inventory with zero custom axioms. Then `cd Lean && lake build` to verify yourself |
| **Physicist** | Discrete physics, CGS reconstruction, statistical mechanics connections | Read [`EGPT_STORY.md`](EGPT_STORY.md) — the narrative from Ulam's random walk to reality as computation. Then explore `Lean/EGPT/Physics/` |
| **Quantum computing enthusiast** | Drawn by FAT's claim that QFT is classically computable with integers | Run the [QFT Benchmark on Google Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) — see classical QFT at O((log k)^3), then read [`EGPTMath/FAT/README.md`](EGPTMath/FAT/README.md) for how it works |
| **Philosopher of mind** | Consciousness as computation, RealityIsComputation | Read [`EGPT_STORY.md`](EGPT_STORY.md) — the philosophical arc from entropy to consciousness. Then see [`Lean/EGPT/Physics/RealityIsComputation.lean`](Lean/EGPT/Physics/RealityIsComputation.lean) |

### Outcome-first (will read claims, benchmarks, stories)

| Role | Motivation | Do This First |
|------|-----------|---------------|
| **Founder/investor** | Commercial implications, energy savings, competitive advantage | Run the [QFT Benchmark on Google Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) — see the "1.277 billion x faster" claim verified live, then read [`PeqNP_QED.md`](PeqNP_QED.md) |
| **AI industry practitioner** | "What does this mean for my work" summary | Read [`PeqNP_QED.md`](PeqNP_QED.md) — the P=NP paper (one result among many). Then `cd EGPTMath && node test/EGPTTestSuite.js` to see the library in action |

### External Resources

| Resource | URL | Used by |
|----------|-----|---------|
| QFT Benchmark (Colab) | [colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) | Cryptographer, Hardware eng, Quantum enthusiast, Founder/investor |
| GitHub Pages site | *TBD — will host llms.txt, IDEAS.md, and interactive demos* | All roles (AI crawlers, first-time visitors) |

## Phase 1: Audit (agents inventory what exists)

### Goal
Each specialist agent audits its domain and produces a structured inventory mapping every significant artifact to one or more of ID1–ID5. This gives us facts to design the mind maps from.

### Instructions for `@egpt-orchestrator`

Delegate the following audit tasks to specialists. Each agent should produce a markdown table with columns: `| File/Artifact | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |` where each ID column gets a relevance marker: `●` (primary — this artifact is *about* this idea), `◐` (secondary — this artifact *uses* or *references* this idea), or blank.

**Important**: Each audit should also flag artifacts that could serve as **"Do This First" actions** — things a visitor can run, open, or read in under 60 seconds to get an immediate, tangible result. See the "Do This First" column in the User Roles tables above. We want every user role to have at least one compelling entry point per idea where applicable. External resources like the [QFT Benchmark on Google Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) count as "Do This First" actions for roles that care about performance benchmarks.

#### Task 1 → `@lean-prover`: Lean Proof Audit

Audit every `.lean` file in `Lean/EGPT/` and map each to ID1–ID5.

Guiding questions:
- **ID1 (Ulam/random walk)**: Does this file define or use `ParticlePath`? Does it model random walks or physical units?
- **ID2 (Von Neumann/statistical AI)**: Does this file contribute to the computability argument? Does it show polynomial-time decidability?
- **ID3 (Einstein/discrete physics)**: Does this file formalize physical laws algebraically? Is it in `Physics/`?
- **ID4 (Rota/entropy)**: Does this file define or use Shannon entropy, RECT, or the Rota axioms? Is it in `Entropy/`?
- **ID5 (Abadir/CH+unique rep)**: Does this file use the Beth staircase, prove CH/GCH, or rely on unique PPF representations? Does it contribute to P=NP?

Also note: which theorems in each file would a **complexity theorist** vs a **physicist** vs a **mathematician** vs a **quantum computing enthusiast** want to see first?

Output to: `docs/audit/lean-proof-audit.md`

#### Task 2 → `@js-engineer`: EGPTMath Audit

Audit every source file in `EGPTMath/` (including `FAT/`) and map to ID1–ID5.

Guiding questions:
- **ID1**: Does this implement ParticlePath encoding or random walk mechanics?
- **ID2**: Does this demonstrate integer-only computation replacing floating-point? Does it show the "statistical not arithmetical" principle?
- **ID3**: Does this implement physics simulations using only integers?
- **ID4**: Does this implement entropy calculations, Shannon coding, or PPF's additive H property?
- **ID5**: Does this implement unique factorization, PPF encoding/decoding, or the bijection ℕ ↔ ParticlePath?

Also note: which modules would an **AI engineer** want to see first vs a **hardware engineer** vs a **cryptographer** vs a **CS student** (looking for "where do I start coding?") vs a **quantum computing enthusiast** (looking for FAT/QFT specifically)?

Output to: `docs/audit/egptmath-audit.md`

#### Task 3 → `@content-author`: Content & Books Audit

Audit every document in `content/` (Papers/, Books/, Rota_Book/, pyFRAQTL/, docs/EGPT_Stories/) and map to ID1–ID5.

Guiding questions:
- Which idea's **original author** is being referenced? (e.g., `content/Books/Ulam/` → ID1 primary)
- Which ideas does each paper **prove, explore, or explain**?
- Which user roles would find each document most relevant?
- For the Books/ directory specifically: identify the key passages/chapters where each idea is stated in the original author's words.

Also note: what is the "reading order" for each user role? If a mathematician arrives, what should they read first, second, third? Pay special attention to the **CS student** (needs a gentle onboarding path) and the **quantum computing enthusiast** (needs the FAT → QFT → Shor's → P=NP thread clearly laid out).

Output to: `docs/audit/content-audit.md`

#### Task 4 → `@demo-builder`: Web Demos Audit

Audit every demo in `www/` and map to ID1–ID5.

Guiding questions:
- What idea does each demo **visualize**?
- Which user roles would find each demo most illuminating?
- Are there ideas with **no demo coverage** that should have one?

Output to: `docs/audit/demos-audit.md`

#### Task 5 → `@doc-writer`: Navigation & Root Docs Audit

Audit the existing navigation layer: README.md, AGENTS.md, llms.txt, EGPT_STORY.md, SKEPTICS_GUIDE.md, all *_README.md files.

Guiding questions:
- Does each navigation document reference all five ideas, or only some?
- Where does the current navigation assume a **problem-oriented** visitor (looking for "P=NP proof") vs an **idea-oriented** visitor?
- What "translation" is currently missing? (e.g., "I came for Hilbert's First Problem" → where do I go?)
- Which user roles are well-served by current docs, and which are underserved? Pay particular attention to the **CS student** (is there a "getting started" path?) and the **quantum computing enthusiast** (is the FAT → classical QFT story navigable?).

Output to: `docs/audit/navigation-audit.md`

#### Task 6 → `@sync-validator`: Cross-Reference Validation

After all audits complete, validate:
1. Every `.lean` file appears in at least one audit
2. Every `EGPTMath/*.js` source file appears in at least one audit
3. Every `content/` document appears in at least one audit
4. Every `www/` demo appears in at least one audit
5. No ID has zero primary (`●`) artifacts in any layer (flag gaps)
6. The five audits use consistent file paths

Output to: `docs/audit/cross-reference-validation.md`

### Success Criteria for Phase 1

- [ ] `docs/audit/` directory exists with 6 files
- [ ] Every significant artifact in the repo appears in at least one audit table
- [ ] Each audit identifies gaps (ideas with thin coverage in that layer)
- [ ] Each audit includes user-role relevance notes
- [ ] `@sync-validator` confirms cross-reference consistency

---

## Phase 1 Status: COMPLETE

Phase 1 audits are in `docs/audit/`. Key findings:
- Full coverage: every idea has at least one primary artifact in every layer
- ID1 (Ulam) and ID2 (Von Neumann) are weakest in demos and explicit Lean representation
- CS student and quantum computing enthusiast are underserved by current navigation
- `EGPT_Paper.md` was renamed to `PeqNP_QED.md` (P=NP is one result among many, not the organizing principle)
- Broken EGPTMath imports flagged as HIGH priority (not a mind map issue, but a "Do This First" blocker)

---

## Phase 2: Mind Maps (design routing documents)

### Goal
Create `IDEAS.md` — the root-level routing document that translates between what visitors expect to find and how the repository is actually organized. This is the single most important deliverable of the reorganization.

### Design Principles

1. **Every visitor arrives with a question, not an idea.** The document must translate questions ("where's the P=NP proof?", "how do I build faster AI?", "is Hilbert's First Problem solved?") into idea-oriented navigation.

2. **"Do This First" is the hook.** Each path starts with a tangible 60-second action (run a benchmark, open a demo, build the proofs), then deepens from there.

3. **Ideas interconnect — don't silo them.** P=NP (which lives primarily in ID5) depends on ID1 (ParticlePath from random walks), ID4 (entropy as the foundation), and ID2 (why it matters for AI). The mind maps must show these connections, not just list artifacts per idea.

4. **The repository has two equally important layers.** The Lean proofs answer "is it possible?" and EGPTMath/FAT answers "how do you build it?" Neither is subordinate to the other. Navigation should present both layers for every idea.

### Instructions for `@egpt-orchestrator`

Delegate the following tasks. Every agent should read the Phase 1 audit files in `docs/audit/` as input (especially their own domain's audit). The content-author audit contains per-role reading orders that should inform the reading paths.

#### Task 1 → `@doc-writer`: Draft `IDEAS.md`

Create the root-level `IDEAS.md` file with this structure:

**Section 1: "You might be looking for..."**

A translation table that maps common visitor expectations to ideas and entry points. Format:

```
| You're looking for... | It lives in... | Start here |
|-----------------------|---------------|------------|
| The P=NP proof | ID5 (Abadir) + ID1, ID4 | [SKEPTICS_GUIDE.md] or `cd Lean && lake build` |
| Hilbert's First Problem (CH) | ID5 (Abadir) | [CH_README.md] |
| Integer-only AI / no floating point | ID2 (Von Neumann) | `cd EGPTMath && node test/EGPTTestSuite.js` |
| Rota's Entropy Theorem | ID4 (Rota) | [RET_README.md] |
| Quantum advantage / QFT benchmarks | ID2 + ID5 | [QFT Benchmark on Colab] |
| How physics emerges from math | ID1 (Ulam) + ID3 (Einstein) | [EGPT_STORY.md] |
| FRAQTL factorization / crypto implications | ID5 + ID2 | [FRAQTL_WhitePaper.md] |
| Consciousness / reality as computation | ID3 (Einstein) + ID4 (Rota) | [RealityIsComputation.lean] |
| "I just want to run something" | ID2 (Von Neumann) | [www/ demos] or [Colab benchmark] |
```

Expand this table to cover all 12 user roles' likely arrival questions. Use the navigation audit's gap analysis to ensure no common question goes unanswered.

**Section 2: The Five Ideas**

For each idea (ID1–ID5), create a section containing:

a) **One paragraph** explaining the idea in the original author's words (use quotes identified in the content audit) plus a one-sentence modern summary.

b) **A 4-column routing table** (one row per significant artifact):

```
| Artifact | Layer | Do This First? | Relevant Roles |
|----------|-------|---------------|----------------|
| Lean/EGPT/Core.lean (ParticlePath) | Proof | — | Mathematician, Proof engineer |
| EGPTMath/EGPTNumber.js (PPF encoding) | Code | ✓ CS student | AI engineer, CS student |
| content/Books/Ulam/... | Reading | — | Physicist, Philosopher |
| www/EGPTNumberUniformity.html | Demo | ✓ CS student | CS student, Physicist |
```

Use the Phase 1 audits (lean-proof-audit, egptmath-audit, content-audit, demos-audit) to populate these tables. Include only artifacts marked `●` (primary) for that idea, plus `◐` (secondary) artifacts that serve as important cross-references.

c) **Connections to other ideas.** A short paragraph or list explaining how this idea feeds into or depends on the others. For example, ID1 → ID4 → ID5 is the main proof chain; ID2 is the practical application layer.

**Section 3: Reading Paths by Role**

For each of the 12 user roles, a numbered reading path (first → second → third → ...) drawing from the content audit's recommended reading orders. Each step should include:
- What to do (read, run, build)
- Which idea it relates to
- What you'll learn from it
- Where to go next

Keep each path to 4–6 steps. The CS student path should be the gentlest (start with a demo, then code, then theory). The complexity theorist path should be the most rigorous (start with `lake build`, then SKEPTICS_GUIDE, then the proof files).

**Section 4: External Resources**

The Colab benchmark link, future GitHub Pages URL, and any other external entry points.

Output to: `IDEAS.md` (root level)

#### Task 2 → `@content-author`: Idea Connection Narratives

For each idea, write a 2–3 sentence "connection narrative" explaining how it relates to the other four ideas. These will be used by `@doc-writer` in Section 2c of IDEAS.md.

Think of these as the edges in the mind map. For example:
- ID1 → ID5: "Ulam's random walk gives us ParticlePath, which is the data structure that makes P=NP provable — the walk *is* the computation."
- ID4 → ID2: "Rota's entropy theorem proves information has a unique measure, which is why integer-only arithmetic can be exact — you're not approximating, you're computing the actual information content."

Write these as a working document the doc-writer can pull from.

Output to: `docs/audit/idea-connections.md`

#### Task 3 → `@demo-builder`: Gap Assessment for Demos

Review the demos audit (`docs/audit/demos-audit.md`). For each idea that has weak or no demo coverage (the audit flagged ID1 and ID2), write a brief proposal (3–5 sentences each) for what a demo could look like. Don't build them yet — just describe what would be most useful for the underserved user roles (CS student, quantum computing enthusiast, founder/investor).

Output to: `docs/audit/demo-gap-proposals.md`

#### Task 4 → `@js-engineer`: "Do This First" Verification

Verify that every "Do This First" action in the User Roles tables actually works:
1. `cd EGPTMath && npm install && node test/EGPTTestSuite.js` — does it pass cleanly? Any import errors?
2. `www/EGPTNumberUniformity.html` — does it open and render without errors?
3. `cd Lean && lake build` — does it complete without errors? (If Lean toolchain isn't available, note this)
4. Check that `PeqNP_QED.md` exists (renamed from `EGPT_Paper.md`)
5. Check that `SKEPTICS_GUIDE.md`, `RET_README.md`, `CH_README.md` all exist and are non-empty
6. Verify the Colab link is referenced consistently (URL: `https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm`)

Flag anything broken. These are the front doors — if they don't work, the mind maps route people into walls.

Output to: `docs/audit/do-this-first-verification.md`

#### Task 5 → `@sync-validator`: Post-Phase-2 Validation

After Tasks 1–4 complete, validate:
1. `IDEAS.md` exists and contains all five ideas
2. Every "You might be looking for..." entry points to a file that exists
3. Every artifact referenced in IDEAS.md 4-column tables exists on disk
4. Every reading path step points to a real file
5. The idea-connections narratives cover all 10 pairwise connections (5 choose 2)
6. No references to `EGPT_Paper.md` remain anywhere in the repo (should all be `PeqNP_QED.md`)

Output to: `docs/audit/phase2-validation.md`

### Success Criteria for Phase 2

- [ ] `IDEAS.md` exists at root level with all 4 sections
- [ ] Translation table covers at least 10 common visitor questions
- [ ] Each idea has a 4-column routing table populated from Phase 1 audits
- [ ] 12 reading paths exist (one per user role), each 4–6 steps
- [ ] All "Do This First" actions verified as working
- [ ] No dead links in IDEAS.md
- [ ] Idea connection narratives written for all 5 ideas
- [ ] Demo gap proposals written for underserved ideas
- [ ] No remaining references to `EGPT_Paper.md` anywhere in repo
- [ ] `@sync-validator` confirms Phase 2 validation passes

---

## Phase 3: Agent Updates — *after Phase 2 review*

### Goal
Update each `.claude/agents/*.md` file so that every agent understands the ID1–ID5 framework and knows which ideas fall within its domain. This ensures ongoing maintenance stays idea-aware.

### Instructions for `@egpt-orchestrator`

Each agent file gets a new section: **"Ideas Coverage"**. Delegate to `@doc-writer` to update all agent files.

For each agent, add after the existing role description:

```markdown
## Ideas Coverage

This agent is responsible for the following ideas within its domain:

| Idea | Primary Artifacts | Cross-References |
|------|------------------|-----------------|
| ID1 (Ulam) | [files from Phase 1 audit marked ● for this idea in this agent's layer] | [files in other layers] |
| ... | ... | ... |
```

Additionally, add to each agent's instructions:
- When creating new artifacts, tag them with the relevant idea(s)
- When updating artifacts, check if the change affects the IDEAS.md routing tables
- Reference IDEAS.md as the canonical routing document

Also update `@egpt-orchestrator` sync matrix to include:
- **IDEAS.md changed**: Verify all links still work, all ideas still represented
- **New artifact created**: `@doc-writer` assess which idea(s) it belongs to and update IDEAS.md if significant

Also update `@sync-validator` checklist to include:
- IDEAS.md link integrity check
- IDEAS.md idea coverage check (no idea missing from any section)
- Reading path validity check

---

## Phase 4: Root Document Reorganization — *after Phase 3 review*

### Goal
Update `llms.txt`, `AGENTS.md`, and `README.md` to use the ideas-oriented structure established by IDEAS.md. Make IDEAS.md the primary routing hub and have the other documents defer to it.

### Instructions for `@egpt-orchestrator`

#### Task 1 → `@doc-writer`: Update `README.md`

- Add IDEAS.md as a primary navigation link in the header (alongside llms.txt, sitemap.xml, .claude/agents/)
- In the "Five Foundational Ideas" section that already exists, add links to the corresponding IDEAS.md sections
- Add the "You might be looking for..." table (or a condensed version linking to IDEAS.md for the full version)
- Ensure the `PeqNP_QED.md` rename is reflected everywhere

#### Task 2 → `@doc-writer`: Update `llms.txt`

- Add an "Ideas Framework" section after the header that lists ID1–ID5 with one-liners and links to IDEAS.md sections
- Add the "You might be looking for..." mappings as a lightweight version (AI crawlers benefit from this disambiguation)
- Add the Colab benchmark link as an external resource
- Ensure the `PeqNP_QED.md` rename is reflected

#### Task 3 → `@doc-writer`: Update `AGENTS.md`

- Add a reference to IDEAS.md in the Key Entry Points table
- Ensure the EGPTMath-to-Lean mapping table is consistent with IDEAS.md routing tables
- Ensure the `PeqNP_QED.md` rename is reflected

#### Task 4 → `@doc-writer`: Rename Cleanup

Search the entire repository for any remaining references to `EGPT_Paper.md` and update them to `PeqNP_QED.md`. Check at minimum:
- All CLAUDE.md files (root, Lean/, EGPTMath/, content/, www/)
- llms.txt, AGENTS.md, README.md
- sitemap.xml
- docs/audit/ files
- .claude/agents/*.md

#### Task 5 → `@doc-writer`: Regenerate Sitemap

Run `node scripts/generate_sitemap.js` to pick up IDEAS.md and any new files.

#### Task 6 → `@sync-validator`: Final Validation

Full cross-layer consistency check including:
1. All standard sync-validator checks (13 items)
2. IDEAS.md link integrity
3. No references to `EGPT_Paper.md` anywhere
4. README.md, llms.txt, AGENTS.md all reference IDEAS.md
5. Sitemap includes IDEAS.md
6. All "Do This First" actions still work

Output to: `docs/audit/phase4-final-validation.md`

### Success Criteria for Phase 4

- [ ] README.md links to IDEAS.md prominently
- [ ] llms.txt contains ideas framework section
- [ ] AGENTS.md references IDEAS.md
- [ ] Zero references to `EGPT_Paper.md` remain in repo
- [ ] Sitemap regenerated and includes IDEAS.md
- [ ] `@sync-validator` final validation passes
- [ ] All "Do This First" actions verified working

---

*This plan is designed to be executed phase-by-phase with human review between each phase. Do not proceed to the next phase without explicit approval.*
