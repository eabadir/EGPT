# Content

Reference materials — papers, books, and documentation supporting EGPT. This is a reference library. Treat as read-only unless updating or adding papers.

## Structure

### `Papers/`
LaTeX source and PDFs of research papers:
- `PPNP_Paper/` — Formal P=NP proof paper (`PprobablyEqualsNP_formal.tex/.pdf`)
- `Address_Is_The_Map/` — Address mapping theory paper
- `AddressMap_And_Crypto/` — Cryptographic implications when P=NP
- `RET_Paper/` — Rota's Entropy Theorem original proof
- `Without_Attraction_There_Is_Nothing/` — Physics applications, Feynman diagrams
- `Entropy Game/` — Entropy-based game theory
- `ContinuumHypothesis/` — The Continuum Hypothesis Is Decidable (Hilbert's First Problem)
- `Derivation of Gravity from Random Walks - Nile Abadir.pdf` — Gravity from stochastic processes
- `GravityPaper/` — Analytical derivation of Newton's law of gravitation and Coulomb's law from EGPT first principles (`GravityPaper.tex`). Random walks on a discrete lattice produce inverse-square force laws. Primary ideas: ID1, ID3, ID4.
- `Quantum Computing vs Fractal Compression In a Chaotic Discontinuum.docx.md` — Foundational paper on Physics Computation Languages. Touches all five ideas (ID1-ID5). Establishes the theoretical framework connecting quantum computing to fractal compression in EGPT's discontinuous information space.
- `Quantum Computing Fractal Compression In A Swarm Enviornment - Patent Application Background.md` — Patent application background document describing practical applications of EGPT principles in swarm computing environments. Primary ideas: ID2, ID3. Secondary: ID1, ID4, ID5.

### `Books/`
Reference books (scanned/digital):
- `Rota/` — Gian-Carlo Rota's probability materials
- `Von Neumann/` — Selected letters, "The Computer and the Brain"
- `Ulam/` — Ulam's works

### `Rota_Book/`
Rota's 1992 probability textbook:
- `1992_Edition/` — Chapter PDFs (ch1 through ch9), lecture notes, index
- `1992_Edition/My Posthumous Addendum/` — Rota-inspired Riemann Hypothesis proof materials
- `ReimannHypothesis Rota Draft/` — Draft materials on Riemann Hypothesis via Rota's methods
- `Rota_Entropy_Theorem/` — RET excerpt

### `Faster Abadir Transform BP/`
FAT overview documentation and benchmarks.

### `pyFRAQTL/`
Python SDK for FRAQTL (Logarithmic Root Finding Algorithm) — a deterministic factorization algorithm:
- `pyFRAQTLsdk.py` — Full Python implementation (~48KB)
- `FRAQTL_WhitePaper.md` — Algorithm description and benchmarks (256-bit factorization in 39.3s on single CPU)
- `FRAQTL_WhitePaper.ipynb` — Jupyter notebook version

### `docs/`
Project documentation:
- `EGPT_FTA.md` — EGPT and FAT overview
- `EGPT_Stories/` — Narrative explanations of EGPT concepts (accessible, story-form)
- `archive/` — Historical development notes, Lean migration docs, early concepts
