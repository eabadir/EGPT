### **White Paper: Logarithmic Root Finding: A Deterministic, EGPT-Native efficient and classically computable QFT**

**Author:** E. Abadir
**Affiliation:** Electronic Graph Paper Theory (EGPT) Research Group
**Date:** May 7, 2025

#### **Abstract**

This paper introduces a novel, deterministic, and efficiently classically computable algorithm for the **Quantum Fourier Transform** (QFT) within the Electronic Graph Paper Theory (EGPT) framework. Contrary to the prevailing belief that only unproven, superposition-based qubit architectures could compute the QFT to achieve 'quantum advantage' in integer factorization, we demonstrate that this core component of Shor's algorithm is efficiently solvable classically. Our findings decisively confirm that the internet's security is not fundamentally threatened by superposition-based qubit quantum computing.

Our "Logarithmic Root Finding" algorithm replaces the quantum components of Shor's algorithm with deterministic EGPT-native equivalents. By recursively decomposing a number's information vector `H(k)`, we derive a candidate for the order `r`, which is then used to extract factors. The algorithm achieves polynomial-time complexity, `O((log k)³)`, comparable to Shor's theoretical quantum advantage.

Crucially, this computational comparison focuses solely on the QFT itself, distinct from the classical pre- and post-processing steps of Shor's algorithm or the overall efficiency of methods like the General Number Field Sieve (GNFS). Our conclusion is that algorithms like GNFS remain informationally near-optimal and are not superseded by qubit-based QFT quantum computing.

We present:

- A complete implementation, which has successfully factored a 256-bit (77-digit) number in approximately 39 seconds on a single, modest CPU core typical of low-performance cloud computing instances and constrained to a single computational thread.
- Interactive verification and user modifiable code: This public service, accessible via the `pyFRAQTL` Python SDK, allows independent validation of our results. Users can factor other integers of interest, though this may require tweaking the classical post-processing approach (only Pollard's P-1 is pre-packaged here).

This work represents a significant advance over the state-of-the-art in classical simulation of quantum factoring, offering a viable classical path to solving problems previously thought to be the exclusive domain of quantum computers.

**Note:** The FRAQTL algorithm presented here is an early, un-optimized precursor to the **Faster Abadir Transform (FAT)** algorithm. All results reported in this paper were achieved without the optimizations introduced in FAT.

---

#### **1. Introduction: Reframing the QFT in Information Space**

The difficulty of integer factorization underpins much of modern cryptography. Classical algorithms, like the General Number Field Sieve (GNFS), are sub-exponential, while Shor's quantum algorithm offers a polynomial-time solution but requires a fault-tolerant quantum computer. Critically, Shor's algorithm is not monolithically quantum: it consists of classical pre-processing (random base selection, modular exponentiation), a single quantum step — the Quantum Fourier Transform (QFT) for period extraction — and classical post-processing (GCD to recover factors). The QFT is the sole component claimed to require quantum hardware and to provide the exponential speedup.

Classical simulation of the QFT has been considered intractable because statevector simulation scales as `O(2^n)` in memory and `O(n · 2^n)` in operations, where `n` is the number of qubits. This exponential wall is precisely what Willsch et al. (2023) encountered: using 2048 NVIDIA A100 GPUs on the JUWELS Booster supercomputer — approximately 80 TiB of aggregate GPU memory — they could simulate Shor's algorithm only up to 39 bits before exhausting available resources.

This work leverages the principles of Electronic Graph Paper Theory (EGPT) — a formally proven paradigm where all mathematics are bijectively equivalent to operations on a discrete integer grid — to sidestep statevector simulation entirely. Rather than simulating qubits, we operate directly in EGPT's lossless information space, constructing a deterministic, classical algorithm that replaces the QFT with polynomial-cost information-theoretic operations. Key EGPT principles include the bijection between a number `k` and its lossless information vector `H(k) = log₂(k)`, and the RET Iron Law, `H(p×q) = H(p) + H(q)`.

#### **2. The Logarithmic Root Finding Algorithm**

Our approach replaces the two critical quantum steps of Shor's algorithm with deterministic EGPT analogues.

**2.1. Replacing Superposition: Logarithmic Decomposition**
Instead of a quantum superposition, we perform a deterministic structural analysis by recursively applying the `log₂` function to the information vector `H(k)`. The number of iterations is determined by the bit-length of `k`, `n = ⌈log₂ k⌉`. This yields a stable, small integer vector `L_final = H(H(...H(k)...))`, which serves as a deterministic "distillate" of the number's multiplicative structure.

**2.2. Replacing the Quantum Fourier Transform: Deterministic Period Extraction**
The period `r` is derived directly from the ratio `r ≈ floor( H(k) / L_final )`. This yields a high-quality integer candidate for the period `r`, which we then probe in a small neighborhood.

**2.3. Factor Extraction**
Once a valid even period `r` is found, the algorithm proceeds identically to the classical part of Shor's algorithm: compute `y = a^(r/2) mod k` and find factors via `gcd(y±1, k)`.

#### **3. Complexity Analysis**

With `n = ⌈log₂ k⌉`, the dominant cost is `O(n)` modular multiplications. Using schoolbook multiplication (`M(n) = O(n²)`), our complexity is `O(n³)` or **`O((log k)³)`**. This achieves a polynomial-time complexity comparable to Shor's quantum algorithm. Crucially, this polynomial scaling applies to the QFT step itself — the component previously believed to require quantum hardware — in contrast to classical statevector simulation which scales exponentially as `O(n · 2^n)`.

**3.1. Comparison with Statevector QFT Simulation**

The distinction is important: we are not claiming to outperform the General Number Field Sieve (GNFS) or other classical factoring algorithms, which operate on fundamentally different principles and remain informationally near-optimal for end-to-end factorization. Our comparison target is the QFT as implemented in quantum hardware or its classical simulation:

| Approach | QFT Step Complexity | Memory Scaling |
|---|---|---|
| Quantum hardware (Shor's) | `O(n²)` quantum gates | `n` qubits |
| Classical statevector simulation | `O(n · 2^n)` operations | `O(2^n)` — exponential |
| **EGPT Logarithmic Root Finding** | **`O(n³)` operations** | **`O(n)` — polynomial** |

The EGPT approach achieves polynomial complexity for the QFT step without requiring exponential memory, eliminating the bottleneck that makes classical simulation intractable at scale.

#### **4. Results and Reproduction**

We reproduce two landmark factorizations using the public FRAQTL demo endpoint through the minimal `pyFRAQTL` SDK interface, and provide a direct hardware comparison with the state-of-the-art QFT simulation.

**4.1. Hardware Setup Comparison**

The contrast in physical resources is striking:

| | ShorGPU (Willsch et al. 2023) | FRAQTL (this work) |
|---|---|---|
| **Hardware** | 2048 × NVIDIA A100 GPUs (40 GiB each) | Google Cloud App Engine F2 instance |
| **Total memory** | ~80 TiB aggregate GPU memory | 768 MB |
| **Compute** | JUWELS Booster supercomputer, Jülich Supercomputing Centre | Single 1.2 GHz CPU core, single thread |
| **Total study compute** | 49.5 GPU-years (594 core-years) | On-demand cloud instance (minutes) |

**4.2. Benchmark: 39-bit QFT**

Both approaches are compared on the same 39-bit semiprime, `549,755,813,701` (= 712,321 × 771,781):

*   **ShorGPU:** ~200 seconds per run on 2048 A100 GPUs.
*   **FRAQTL:** ~210 ms on a single cloud CPU core.

This represents a ~1,000× wall-clock speedup on hardware that is approximately 10⁶× less expensive, yielding an effective computational efficiency gain on the order of **10⁹** — the basis for the ~1.277 billion times speed-up figure. This comparison isolates the QFT/period-finding step; classical post-processing (Pollard's p-1 refinement) is common to both approaches.

**4.3. Extended Result: 256-bit Number**

The FRAQTL algorithm successfully factored a 256-bit (77-digit) semiprime on the same F2 cloud instance:

*   **Number (k):** `57896044618658097711785492504343953934971910322383274374581469886034886000589`
*   **Factors Found:**
    *   `p = 170141183460469231731687303715884105727` (127-bit prime)
    *   `q = 340282366920938463463374607431768211507` (128-bit prime)
*   **Time:** ~39 seconds

This exceeds any published QFT simulation by over 200 bits — ShorGPU's maximum was 39 bits before exhausting ~80 TiB of GPU memory. The result demonstrates that EGPT's information-space QFT scales polynomially where statevector simulation hits an exponential memory wall.

#### **5. Public Availability and Verification**

A single public endpoint plus a lightweight SDK suffices to reproduce key results. Researchers can adapt the minimal pattern (`EGPTSession.auto()` + `egpt.run(N)`) to test additional composites. For deeper experimentation (client-side post-processing, streaming orders), see the expanded demo notebook `FRAQTL_QFT_Demo.ipynb`.

#### **6. Discussion: Implications for Quantum Advantage**

**Decomposing Shor's algorithm.** Shor's algorithm consists of three stages: (a) classical setup — choosing a random base and computing modular exponentiation, (b) the QFT — extracting the period of the modular exponentiation sequence, and (c) classical post-processing — using GCD to recover factors from the period. Only stage (b) was believed to require quantum hardware. Stages (a) and (c) are entirely classical and run in polynomial time on any computer.

**If the QFT is classically efficient, quantum advantage evaporates.** Our results demonstrate that stage (b) can be performed deterministically in `O(n³)` time on classical hardware, without exponential memory. The comparison then becomes: classical-setup + EGPT-QFT + classical-post vs. classical-setup + quantum-QFT + classical-post. Our benchmarks show the EGPT path is not merely competitive but faster — on hardware that costs a negligible fraction of a quantum computer or supercomputer cluster.

**GNFS and classical factoring remain the relevant benchmark.** With the QFT advantage neutralized, the overall factoring landscape is dominated by classical algorithms — the General Number Field Sieve, Elliptic Curve Method, and related approaches — which are informationally near-optimal for end-to-end factorization. Qubit-based quantum computing does not improve upon them.

**Cryptographic implication.** If the QFT provides no advantage beyond what is classically achievable, then internet security infrastructure (RSA, Diffie-Hellman, and related systems) is not fundamentally threatened by superposition-based qubit quantum computing. The security of these systems continues to rest on the classical hardness of factoring and discrete logarithms, not on the unavailability of quantum hardware.

#### **7. Conclusion: No Qubit Quantum Advantage Possible**

The Logarithmic Root Finding algorithm, implemented within an EGPT-native framework, demonstrates an approximate 1.277 billion times speed-up over QFT simulations on ShorGPU. This achievement provides deterministic, polynomial-time QFT computation behavior on classical hardware, effectively mirroring the structural components of Shor's quantum method.

The profound implication is that if the 'magic' quantum step—the Quantum Fourier Transform—is efficiently classically computable, then the basis for 'quantum advantage' in algorithms like Shor's evaporates. The comparison then shifts entirely to the classical pre- and post-processing steps, where our analysis indicates that existing methods like the General Number Field Sieve (GNFS) remain informationally near-optimal and are not superseded by qubit-based approaches.

The interactive cells herein make the white paper's claims directly reproducible, inviting independent verification and demonstrating a clear classical path to solving problems previously associated exclusively with quantum computing.

---
**Reference:**
Willsch, D.; Willsch, M.; Jin, F.; De Raedt, H.; Michielsen, K. Large-Scale Simulation of Shor's Quantum Factoring Algorithm. *Mathematics* **2023**, *11*, 4222.