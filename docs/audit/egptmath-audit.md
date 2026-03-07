# EGPTMath Source Audit: Mapping Files to the Five Ideas

**Date**: 2026-03-06
**Auditor**: @js-engineer
**Scope**: All source files in `EGPTMath/` including `FAT/`, excluding `node_modules/`

## Legend

| Symbol | Meaning |
|--------|---------|
| ● | Primary expression of this idea |
| ◐ | Secondary / supporting role |
| (blank) | Not directly relevant |

## Idea Reference

| ID | Author | Core Idea |
|----|--------|-----------|
| **ID1** | Ulam | CGS from a random walk -- ParticlePath encoding, random walk mechanics |
| **ID2** | Von Neumann | Statistical AI computer -- integer-only computation replacing FLOPs |
| **ID3** | Einstein | Algebraic discrete physics -- physics simulations using only integers |
| **ID4** | Rota | Entropy is the record of truth -- Shannon coding, PPF's additive H property |
| **ID5** | Abadir | CH decidable / unique representations -- unique factorization, PPF bijection |

---

## Core Library Files

| File | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|------|:---:|:---:|:---:|:---:|:---:|-------|
| `EGPTNumber.js` | ◐ | ● | | ● | ● | PPF number representation. Implements the "scaled information vector" -- the PPF encoding is the bijection (ID5), the log2-based representation embodies entropy-as-structure (ID4), all arithmetic is BigInt (ID2). The `{N, offset}` encoding mirrors ParticlePath (ID1). |
| `EGPTMath.js` | ◐ | ● | | ● | ◐ | Vector algebra engine (~6800 lines). Implements H(p*q)=H(p)+H(q) (the RET Iron Law, ID4). All operations are integer/BigInt (ID2). Multiplication = vector addition in log space. |
| `EGPTComplex.js` | | ● | ◐ | ◐ | | Complex number operations with `ComplexEGPTNumber` and `TwiddleTable`. N-gon vertices replace floating-point roots of unity (ID2). Phase-space arithmetic supports discrete physics (ID3). |
| `EGPTranscendental.js` | | ● | ● | ◐ | | Trig/exp functions via integer-only phase mapping. PI is defined as rational phase (1/2), not a transcendental (ID3). No floating point anywhere (ID2). |
| `EGPTPolynomial.js` | | ● | | ◐ | | Polynomial arithmetic in canonical space. All coefficients are EGPTNumber vectors. Stays in Shannon space throughout (ID4). Pure integer operations (ID2). |
| `DebugLogger.js` | | | | | | Infrastructure. Logging utility with circular buffer, performance metrics. No direct idea mapping. |
| `FastFactorialEGPT.mjs` | | ● | | ● | ◐ | Binary-split factorial in canonical space. O(log^2 k) exact computation. Demonstrates H(k!) decomposition (ID4). QFT connection noted (ID2). Uses PPF encoding (ID5). Note: import paths reference `../../js/model/` -- likely broken in current directory structure. |

## FAT/ (Faster Abadir Transform)

| File | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|------|:---:|:---:|:---:|:---:|:---:|-------|
| `EGPTFAT.js` | | ● | ◐ | ◐ | | **Canonical FAT implementation.** Recursive Cooley-Tukey with exact phase-space arithmetic. Zero floating point (ID2). Demonstrates classical QFT (ID3). Twiddle factors from N-gon vertices. |
| `EGPTFAT_PurePPF.js` | | ● | ◐ | ◐ | ● | Optimized FAT using native BigInt during computation, PPF encode/decode only at I/O boundaries (ID5). Matrix-based butterfly with bit-shifting (ID2). Phase arithmetic (ID3). |
| `EGPTFAT_PhaseAware.js` | | ● | ◐ | | | Dynamic twiddle generation based on signal phase structure. LCM of phase denominators determines table size. Integer-only (ID2). |
| `EGPTFAT_LevelTracking.js` | | ● | ◐ | | ● | Tracks n-gon level through recursion. Includes PPF encoding of naturals (ID5). Integer-only (ID2). |
| `EGPTFAT_FIXED.js` | | ● | ◐ | | | Simplified variant: fresh TwiddleTable per recursion level. Exports qft/iqft aliases. Integer-only (ID2). |
| `EGPTFAT_TypeSafe.js` | | ◐ | | | | Type-safe wrappers preventing time/frequency domain confusion. Engineering quality layer. |
| `FATInterfaces.js` | | ◐ | | | | Domain wrapper classes: `TimeDomainSignal`, `FrequencyDomainSpectrum`. Engineering infrastructure. |
| `EGPTFATFormatters.js` | | ◐ | | | | Format conversion between ComplexEGPTNumber and Float64Array. Bridge to external FFT libraries. The one place floats appear (for comparison only). |

## stat/ (Statistical Utilities)

| File | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|------|:---:|:---:|:---:|:---:|:---:|-------|
| `EGPTStat.js` | | ● | | ● | | Statistical analysis of EGPTNumber vectors. Mean, variance, std deviation, gap detection -- all in integer/canonical space (ID2). Operates on information vectors H(k) (ID4). |
| `EGPTStatData.js` | | ◐ | | ◐ | | Standardized metadata container for statistical results. Normalized deltas, Chart.js integration. |

## theorems/ (Proof Implementations)

| File | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|------|:---:|:---:|:---:|:---:|:---:|-------|
| `EGPT_APH.js` | | ◐ | | ● | ◐ | Abadir Prime Hypothesis: O(1) primality test via entropy cliff analysis. Tests H(k)-H(k-1) for factor contamination (ID4). Uses PPF-based entropy structure (ID5). Note: imports `EGPTEntropyNumber.js` which does not exist in current tree -- likely broken. |

## TheoremTests/ (Runnable Theorem Validations)

| File | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|------|:---:|:---:|:---:|:---:|:---:|-------|
| `Wilsons_Theorem_Proof_EGPT.js` | | ● | | ● | | Wilson's Theorem validated with exact BigInt factorial (ID2). Demonstrates canonical space correctness. QFT state preparation connection (ID4). Note: imports from `../lib/` -- likely broken path. |
| `EQFT_Binary_Split_Proof.js` | | ● | ● | ● | | Proves QFT = Factorial binary-split + twiddle butterflies. O(log^2 N) vs standard O(log^3 N). Central to FAT theory (ID2, ID3). Note: imports from `../lib/` -- likely broken. |
| `IEQFT_Fundamental_Ops_TestSuite.js` | | ● | ◐ | | | Validates all inverse EQFT operations: butterfly correctness, even/odd branch recombination. Note: imports from `../lib/` -- likely broken. |

## test/ (Test Suite)

| File | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|------|:---:|:---:|:---:|:---:|:---:|-------|
| `EGPTTestSuite.js` | ◐ | ● | | ● | ● | **Main test suite (157 tests).** Validates vector/scalar paradigm, PPF encoding, RET Iron Law, canonical arithmetic. Exercises ID2, ID4, ID5 comprehensively. |
| `verify_ppf_bijection.js` | ● | | | | ● | **Direct ID5 demonstration.** Shows every natural number maps to an N-gon vertex via PPF encoding. "There is NO arbitrary input not on unit circle." Key ID1/ID5 artifact. |
| `test_fft_operations_canonical.js` | | ● | | ◐ | | Tests FFT butterfly operations with circular twiddles using only canonical comparisons (.equals()). No decimal conversions. |
| `test_conditional_entropy.js` | | | | ● | | Tests `conditionalEntropyVector` for n-gon level mismatch detection. Explores entropy relationships across different N-gon levels. |
| `EGPTTopologyTestSuite.js` | | ● | ● | | | Validates topology-native trig functions: sin/cos/PI as emergent from N-gon geometry. Tests discrete phase-space physics (ID3). |
| `EGPTPolynomialTest.js` | | ● | | | | Tests polynomial arithmetic and transforms in canonical space. Validates add, subtract, multiply, divide, evaluation. |
| `EGPTMath_TestSuite_Results.md` | | | | | | Test result documentation. |

## FAT/test/ (FAT-Specific Tests)

| File | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|------|:---:|:---:|:---:|:---:|:---:|-------|
| `test_EGPTFAT_Canonical.js` | | ● | ◐ | | | Canonical FAT tests: round-trips, linearity, impulse/DC signals. |
| `test_EGPTFAT_PurePPF.js` | | ● | | | ● | PurePPF variant tests: native BigInt computation, PPF encoding boundaries. |
| `test_EGPTFAT_Traditional.js` | | ● | | | | Traditional FFT patterns tested with integer-only implementation. |
| `test_EGPTFAT_Validation.js` | | ● | | | | Comprehensive validation: twiddle ring laws, sequential round-trips. |
| `test_FAT_TypeSafe.js` | | ◐ | | | | Type safety validation: domain confusion prevention. |
| `test_PurePPF_Comprehensive.js` | | ● | | | ● | Comprehensive PurePPF tests: linearity, round-trips, large sizes. |

## benchmarks/ (Performance Analysis)

| File | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|------|:---:|:---:|:---:|:---:|:---:|-------|
| `FAT_Benchmark.js` | | ● | | | | Benchmark framework: FAT vs fft.js performance comparison with CSV export. |
| `FAT_Profiler.js` | | ● | | | | QFT-specific profiling: twiddle generation, phase operations, recursion breakdown. |
| `run_benchmarks.js` | | ● | | | | Entry point for full benchmark suite. |
| `test_cases.js` | | ◐ | | | | Test signal generators: impulse, step, sinusoidal, random. |
| `results/*.csv` | | ● | | | | Benchmark result data (scalability, speed comparison, QFT profiling). |
| `README.md` | | ◐ | | | | Benchmark documentation. |
| `QFT_PROFILING_EXPLANATION.md` | | ◐ | ◐ | | | QFT profiling methodology documentation. |

## utils/ (Pipeline Utilities)

| File | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|------|:---:|:---:|:---:|:---:|:---:|-------|
| `EGPTConstants.js` | | ● | | ◐ | | Ultra-high precision constants (ln2, log2(e), pi) scaled to 4096 bits as BigInt. All in log2 space (ID4). No floats (ID2). |
| `PipelineData.js` | | ◐ | | ● | | Standardized pipeline data structures. PartitionData carries entropy vectors (H_entropy, H_deviation). Segment analysis for factorization pipeline (ID4). |
| `SegmentManager.js` | | ◐ | | ● | | Segment analysis utilities. Uses EGPTStat for entropy-based factor detection. Discontinuity analysis on entropy patterns (ID4). |
| `discontinuityUtils.js` | | ◐ | | ● | | Step discontinuity detection in entropy deviation patterns. Factor location via entropy cliffs (ID4). |
| `DataEnhancer.js` | | | | ◐ | | Chart.js data preparation. UI bridge layer. |
| `ChartJSHelper.js` | | | | | | Chart.js availability checker. Pure infrastructure. |

## Documentation Files

| File | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|------|:---:|:---:|:---:|:---:|:---:|-------|
| `CLAUDE.md` | | ◐ | | ◐ | ◐ | AI navigation guide for the EGPTMath directory. |
| `README.md` | | ● | | ● | ● | Comprehensive package docs: PPF representation, RET validation, test results. |
| `EGPTMath_Developer_Guide.md` | | ● | | ● | ● | Developer guide: unlimited precision in information space, Shannon coding. |
| `FAT/FAT_README.md` | | ● | ◐ | | | FAT documentation: how integer FFT works, variant descriptions, test status. |
| `FAT/EGPTFAT_PRECISION_ANALYSIS.md` | | ● | | | | Precision analysis confirming unlimited-precision interfaces. |
| `FAT/FAT_TYPE_SAFETY.md` | | ◐ | | | | Type safety design documentation. |
| `EGPT_TEST_RESULTS*.md` | | ◐ | | | | Test result documentation (multiple files by category). |
| `package.json` | | | | | | Package metadata. Only dependency: `fft.js` (for canonical comparison). |

---

## Idea Coverage Summary

| Idea | Primary (●) Count | Secondary (◐) Count | Coverage Assessment |
|------|:-:|:-:|-----|
| **ID1** (Ulam: CGS/random walk) | 1 | 3 | **Weak.** PPF encoding mirrors ParticlePath but no explicit random walk or CGS reconstruction module exists. The `{N, offset}` structure in EGPTNumber _is_ the path encoding, but this connection is implicit. |
| **ID2** (Von Neumann: integer-only) | 27 | 11 | **Dominant.** Every core file demonstrates FLOPs-to-IOPs. This is the library's raison d'etre. |
| **ID3** (Einstein: discrete physics) | 1 | 10 | **Moderate.** EGPTranscendental replaces transcendentals with discrete phase geometry. FAT demonstrates classical QFT. But there is no explicit physics simulation (CGS units, wave equations, etc.). |
| **ID4** (Rota: entropy as truth) | 5 | 16 | **Strong.** RET Iron Law (H(p*q)=H(p)+H(q)) is implemented throughout. Entropy-based factorization pipeline in utils/. Shannon coding mindset pervades. |
| **ID5** (Abadir: unique representations) | 3 | 8 | **Moderate.** PPF encoding in EGPTNumber is the bijection. `verify_ppf_bijection.js` is a direct demonstration. But there is no explicit CH/GCH demonstration or diagonal-failure module -- that lives in Lean only. |

---

## User Role Navigation Guide

### AI/ML Engineer ("Where are the IOPs?")
**Start here:**
1. `EGPTMath.js` -- the integer algebra engine, understand multiply/divide/pow as vector operations
2. `EGPTNumber.js` -- PPF representation, how numbers are encoded without floats
3. `FAT/EGPTFAT.js` -- integer-only FFT, the practical replacement for floating-point FFT
4. `benchmarks/` -- performance data comparing FAT vs fft.js

### Hardware/Infrastructure Engineer ("FLOPs to IOPs benchmarks")
**Start here:**
1. `benchmarks/run_benchmarks.js` -- run the full suite
2. `benchmarks/results/` -- CSV data for scalability analysis
3. `benchmarks/FAT_Benchmark.js` -- benchmark methodology
4. `FAT/EGPTFAT_PRECISION_ANALYSIS.md` -- precision guarantees

### CS Student / Learner ("Where do I start coding?")
**Start here:**
1. `README.md` -- overview and PPF representation explained
2. `EGPTMath_Developer_Guide.md` -- Shannon coding mindset tutorial
3. `test/EGPTTestSuite.js` -- run it (`node test/EGPTTestSuite.js`), read the tests as examples
4. `test/verify_ppf_bijection.js` -- standalone script showing the PPF bijection (simplest runnable demo)
5. `FAT/FAT_README.md` -- how to use the integer FFT with quick-start code

### Complexity Theorist ("P=NP audit trail")
**Start here:**
1. `EGPTNumber.js` -- the PPF encoding that underpins the Lean bijection proof
2. `test/verify_ppf_bijection.js` -- empirical verification that every natural maps to an N-gon vertex
3. `TheoremTests/EQFT_Binary_Split_Proof.js` -- QFT complexity argument (O(log^2 N))
4. Then move to `Lean/` for the formal proof chain

### Cryptographer ("FRAQTL / P=NP implications")
**Start here:**
1. `theorems/EGPT_APH.js` -- entropy-cliff primality and factorization (note: currently broken import)
2. `utils/SegmentManager.js` + `utils/discontinuityUtils.js` -- entropy-based factor detection pipeline
3. `EGPTMath.js` -- understand how multiplication decomposes in log space
4. Then see `content/pyFRAQTL/FRAQTL_WhitePaper.md` for the full factorization algorithm

### Quantum Computing Enthusiast ("Is QFT really classically computable?")
**Start here:**
1. `FAT/FAT_README.md` -- overview of integer-only FFT/QFT
2. `FAT/EGPTFAT.js` -- canonical implementation with `qft`/`iqft` exports
3. `TheoremTests/EQFT_Binary_Split_Proof.js` -- proof that QFT = factorial binary-split + twiddle butterflies
4. `FAT/EGPTFAT_PurePPF.js` -- optimized variant with native bit encoding
5. `benchmarks/QFT_PROFILING_EXPLANATION.md` -- profiling methodology

### Mathematician ("Number theory, formal methods")
**Start here:**
1. `EGPTNumber.js` -- PPF representation, canonical reduction, GCD/nthRoot in BigInt
2. `EGPTMath_Developer_Guide.md` -- unlimited precision in information space
3. `TheoremTests/Wilsons_Theorem_Proof_EGPT.js` -- Wilson's Theorem in canonical space
4. `test/verify_ppf_bijection.js` -- the N-to-N-gon bijection
5. Then `Lean/` for the formal proofs

### Physicist ("Discrete physics, CGS reconstruction")
**Start here:**
1. `EGPTranscendental.js` -- trig as N-gon geometry, PI as rational phase
2. `test/EGPTTopologyTestSuite.js` -- topology-native function validation
3. `EGPTComplex.js` -- TwiddleTable as discrete roots of unity
4. `FAT/EGPTFAT.js` -- classical QFT via exact discrete arithmetic

### Founder/Investor ("What is the commercial angle?")
**Start here:**
1. `README.md` -- what the library does and why it matters
2. `CLAUDE.md` -- architecture summary
3. `benchmarks/results/` -- CSV performance data
4. `FAT/FAT_README.md` -- what passes, what fails, maturity assessment

### AI Industry Practitioner ("What does this mean for my work?")
**Start here:**
1. `README.md` + `CLAUDE.md` -- overview
2. `EGPTMath.js` (first 60 lines) -- API design and vector operations mapping
3. `FAT/EGPTFAT.js` -- drop-in FFT replacement concept
4. `benchmarks/` -- real performance numbers

---

## Do This First: Priority Actions

### 1. Fix Broken Import Paths (HIGH)
Several files have import paths that reference a different directory structure (`../lib/`, `../../js/model/`):
- `FastFactorialEGPT.mjs` -- imports from `../../js/model/`
- `TheoremTests/Wilsons_Theorem_Proof_EGPT.js` -- imports from `../lib/`
- `TheoremTests/EQFT_Binary_Split_Proof.js` -- imports from `../lib/`
- `TheoremTests/IEQFT_Fundamental_Ops_TestSuite.js` -- imports from `../lib/`
- `theorems/EGPT_APH.js` -- imports `../EGPTEntropyNumber.js` which does not exist

These files cannot run in their current location. They appear to have been copied from a different directory structure without updating imports.

### 2. Add "Start Here" Entry Point for CS Students (MEDIUM)
There is no single "hello world" script. `verify_ppf_bijection.js` is close but does not import the full library. A `quickstart.js` or `examples/` directory with 3-4 minimal scripts would serve the CS student and AI engineer personas.

### 3. Add Explicit ID1 (Random Walk / CGS) Module (MEDIUM)
The random walk / ParticlePath connection is implicit in the PPF `{N, offset}` encoding but never demonstrated as a runnable artifact. A small module or test that shows: "start at origin, take steps, arrive at PPF encoding" would close the biggest idea gap.

### 4. Add Explicit ID3 (Discrete Physics) Demonstration (LOW-MEDIUM)
EGPTranscendental implements discrete trig but there is no end-to-end physics simulation (e.g., wave equation, simple harmonic oscillator, CGS unit derivation) using only integers. A small demo would strengthen the Einstein connection.

### 5. Resolve FAT Round-Trip Failures at N>=8 (MEDIUM)
Per `FAT/FAT_README.md`, the canonical FAT round-trip breaks for general signals at N>=8. The root cause (twiddle table sizing from phase denominators) is documented but not resolved. This is the most visible functional gap for anyone evaluating the library.

---

## Identified Gaps

| Gap | Affected Ideas | Affected Personas | Severity |
|-----|---------------|-------------------|----------|
| No runnable random walk / ParticlePath demo | ID1 | Physicist, Mathematician | Medium |
| No CGS unit reconstruction from discrete theory | ID1, ID3 | Physicist | Medium |
| No explicit CH/GCH demonstration in JS | ID5 | Mathematician, Complexity theorist | Low (exists in Lean) |
| Broken import paths in TheoremTests/ and theorems/ | All | All code-first users | High |
| Missing `EGPTEntropyNumber.js` dependency | ID4 | Cryptographer | High |
| FAT round-trip failures for general signals N>=8 | ID2, ID3 | QC enthusiast, Hardware engineer | Medium |
| No quickstart/examples directory | All | CS student, AI engineer | Medium |
| `FastFactorialEGPT.mjs` cannot run from EGPTMath/ | ID2, ID4 | Mathematician | High |
| No wave equation or physics simulation demo | ID3 | Physicist | Low-Medium |
| Benchmark CSV paths may be stale (reference old structure) | ID2 | Hardware engineer | Low |
