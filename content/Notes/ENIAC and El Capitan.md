Monte Carlo & ENIAC vs. PDE's & El Capitan: Monte Carlo A Million Trillion Times Faster
The same Monte Carlo algorithm running on the very first programmable digital computer ENIAC was a million-trillion times faster than the quantum fourier tranform (QFT) being simulated on the worlds most powerful super-computer of today, El Capitan
What cannot be legitimately disputed (and this is crucial)
✅ The historical fact
Monte Carlo did compute neutron diffusion accurately enough for weapon design
PDE-based quantum formulations still cannot do this at scale
This remains true despite exaFLOP-class hardware
This is not controversial.
Here’s what we can say quantitatively about the current fastest iPhone’s integer-style performance—keeping in mind that Apple doesn’t publish a raw IOPs/IOPS figure for the CPU, but does publish “operations per second” (TOPS) for the Neural Engine, which is effectively a measure of how many basic operations it can complete per second:
📱 Latest iPhone (as of late 2025):
The Apple A18/A18 Pro (iPhone 16 series)’s Neural Engine is capable of about 35 trillion operations per second (TOPS)—that’s 35×10¹² ops/sec in specialized integer or mixed precision formats used for ML tasks on-device.
How to interpret this for “IOPs”:
TOPS (trillions of operations per second) on Neural Engines is roughly analogous to integer (I)OPs when running optimized ML/AI workloads (INT8/INT16), because these units are designed for high-throughput low-precision integer computation.
CPUs by themselves don’t reach anywhere near Neural Engine TOPS; CPUs might do billions of instructions per second (GIPS) on general integer work, but not the tens of trillions that the Neural Engine reaches for parallel ML tasks.
Roughly:
Neural Engine: ~35 trillion operations/sec (i.e., ~35 × 10¹² IOP-equivalents on ML workloads).
CPU cores: Likely in the tens of billions of integer operations per second class on general code (exact figure Apple doesn’t publish; benchmarks use FLOPS or overall scores).
If you want a more detailed breakdown comparing CPU integer throughput vs GPU vs Neural Engine in iPhones (e.g., A19 Pro / iPhone 17) or to translate TOPS into a rough estimate of integer instructions per second on typical applications, I can upgrade this into a small table or estimates based on existing benchmark data.
Frontier was the first exascale supercomputer and held the top spot with ~1.1–1.35 exaFLOPS on the High Performance Linpack (HPL) benchmark for a time, making it the world’s fastest publicly ranked machine and the first to break the exascale barrier.
However, as of the latest TOP500 rankings in 2025, the U.S. Department of Energy’s El Capitan at Lawrence Livermore National Laboratory has surpassed Frontier with an HPL performance of about 1.74 exaFLOPS, making El Capitan the fastest supercomputer in the world today.
Frontier remains one of the top exascale systems globally, but it now typically ranks second to El Capitan in peak double-precision FLOPS performance on the standard TOP500 benchmark.