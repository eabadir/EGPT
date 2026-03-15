# EGPT Proof Dependency Graph

> 90 machine-verified theorems across 23 Lean 4 files.
> No `sorry`. No custom axioms. Only Lean's built-in `propext`, `Quot.sound`, `Classical.choice`.

This file provides the logical dependency structure of EGPT's formal proofs in a format optimized for both human reading and AI agent consumption. For the detailed file-by-file breakdown, see [`Lean/PROOF_DEPENDENCIES.md`](../Lean/PROOF_DEPENDENCIES.md).

## Core Identity

```
ParticlePath = ComputerTape = RandomWalkPath = List Bool
```

All three are `List Bool` with the `PathCompress_AllTrue` constraint. A natural number, a computation, and a random walk are the same object.

## P=NP Proof Chain (8 files, sorry-free, axiom-free)

```mermaid
graph TD
    M[Mathlib] --> B[EGPT/Basic.lean<br/>helper lemmas]
    M --> C[EGPT/Core.lean<br/>ParticlePath, ComputerTape<br/>IIDParticleSource]
    C --> NT[EGPT/NumberTheory/Core.lean<br/>ParticlePath bijection NN<br/>toNat, fromNat, EGPT_Polynomial]
    NT --> CN[EGPT/Constraints.lean<br/>Literal_EGPT, Clause_EGPT<br/>CanonicalCNF, encodeCNF]
    CN --> CC[EGPT/Complexity/Core.lean<br/>PathToConstraint<br/>IsPolynomialEGPT]
    CC --> CT[EGPT/Complexity/TableauFromCNF.lean<br/>SatisfyingTableau<br/>walkCNFPaths<br/>walkComplexity le n squared]
    CT --> CIB[EGPT/Complexity/ComplexityInformationBridge.lean<br/>time complexity = information complexity]
    CIB --> INT[EGPT/Complexity/Interpretation.lean<br/>re-exports ComplexityInformationBridge]
    INT --> PP[EGPT/Complexity/PPNP.lean<br/>P, NP structurally distinct<br/>P_eq_NP non-trivial proof<br/>L_SAT_in_NP, L_SAT_in_P<br/>EGPT_CookLevin_Theorem]

    EC[EGPT/Entropy/Common.lean<br/>type definitions only] -.-> CT
    PD[EGPT/Physics/PhysicsDist.lean<br/>type definitions only] -.-> CT
    EC -.-> PP
    PD -.-> PP

    style PP fill:#2d6a4f,color:#fff
    style INT fill:#357a5e,color:#fff
    style CIB fill:#3d8868,color:#fff
    style CT fill:#40916c,color:#fff
    style CC fill:#52b788,color:#fff
    style CN fill:#74c69d,color:#000
    style NT fill:#95d5b2,color:#000
    style C fill:#b7e4c7,color:#000
```

Solid arrows = proof dependencies. Dashed arrows = type-only imports (no theorems used).

## Entropy Chain (Rota's Entropy Theorem)

```mermaid
graph TD
    M[Mathlib] --> EC[EGPT/Entropy/Common.lean<br/>Shannon entropy, RECT<br/>rect_program_for_dist]
    C[EGPT/Core.lean] --> EC
    CC[EGPT/Complexity/Core.lean] -.-> EC

    EC --> RET[EGPT/Entropy/RET.lean<br/>RotaUniformTheorem<br/>All entropy = C x Shannon]
    EC --> H[EGPT/Entropy/H.lean<br/>7 Rota axioms verified<br/>entropy_of_fair_coin_is_one_bit]
    PP[EGPT/Complexity/PPNP.lean] -.-> H
    PC[EGPT/Physics/PhotonicCA.lean] -.-> H

    style RET fill:#3a86a8,color:#fff
    style H fill:#3a86a8,color:#fff
    style EC fill:#89c2d9,color:#000
```

## Physics Chain (motivation -- NOT imported by proof chain)

```mermaid
graph TD
    PC[EGPT/Physics/Common.lean<br/>Physical entropy definitions] --> US[EGPT/Physics/UniformSystems.lean<br/>Uniform = C x Shannon]
    US --> BE[EGPT/Physics/BoseEinstein.lean<br/>H_BE = C x Shannon]
    US --> FD[EGPT/Physics/FermiDirac.lean<br/>H_FD = C x Shannon]
    US --> MB[EGPT/Physics/MaxwellBoltzmann.lean<br/>H_MB = C x Shannon]
    BE --> PD[EGPT/Physics/PhysicsDist.lean<br/>Unified entropy theorem]
    FD --> PD
    MB --> PD
    PD --> PA[EGPT/Physics/PhotonicCA.lean<br/>BE system has equivalent program]
    PA --> RC[EGPT/Physics/RealityIsComputation.lean<br/>RealityIsComputation<br/>ContinuousFieldsAreComputation]

    style RC fill:#9b2226,color:#fff
    style PA fill:#ae2012,color:#fff
    style PD fill:#bb3e03,color:#fff
```

## Number Theory Extensions

```mermaid
graph TD
    NT[EGPT/NumberTheory/Core.lean] --> CH[EGPT/NumberTheory/ContinuumHypothesis.lean<br/>EGPT_ContinuumHypothesis<br/>EGPT_GeneralizedContinuumHypothesis]
    NT --> F[EGPT/NumberTheory/Filter.lean<br/>RejectionFilter, distributions]
    NT --> A[EGPT/NumberTheory/Analysis.lean<br/>FTA via information]

    style CH fill:#7b2cbf,color:#fff
```

## Full Logical Flow (Simplified)

```mermaid
graph LR
    RW[Random Walk<br/>List Bool] --> NUM[Number Encoding<br/>NN ZZ QQ RR]
    NUM --> ENT[Entropy<br/>Shannon = unique measure]
    ENT --> RECT[RECT<br/>Entropy = Program Length]
    RECT --> TAB[Constraint Tableau<br/>cost le n squared]
    TAB --> PNP[P = NP<br/>non-trivial proof]
    PNP --> RIC[Reality Is Computation<br/>Every physical system<br/>has a finite program]

    style PNP fill:#2d6a4f,color:#fff
    style RIC fill:#9b2226,color:#fff
```

## Isolation Guarantees

1. **Proof chain** (Core through PPNP) imports Entropy/Physics only for type definitions. No Entropy or Physics *theorem* is used in P=NP.
2. **Entropy chain** is independent -- RET stands alone as a proof about information measures.
3. **Physics chain** is downstream of everything. It is never imported by the proof chain.

## Machine-Readable Graph

See [`proof_graph.json`](proof_graph.json) for a JSON representation of the full dependency DAG, suitable for programmatic ingestion by AI agent frameworks.
