#!/usr/bin/env node

/**
 * Performance Benchmark: Pure PPF vs Canonical FAT
 * 
 * Measures:
 * - Forward transform speed
 * - Inverse transform speed
 * - Round-trip speed
 * - Memory usage (if available)
 * - Scalability across different N sizes
 */

import { EGPTNumber } from '../../EGPTNumber.js';
import { ComplexEGPTNumber, TwiddleTable } from '../../EGPTComplex.js';
import { fat as fat_canonical, ifat as ifat_canonical } from '../EGPTFAT.js';
import { fat_pureppf, ifat_pureppf } from '../EGPTFAT_PurePPF.js';
import fs from 'fs';
import path from 'path';

/**
 * Create test signal
 */
function createTestSignal(N) {
    const signal = [];
    for (let i = 0; i < N; i++) {
        const real = EGPTNumber.fromBigInt(BigInt(Math.floor(Math.random() * 20 - 10)));
        const imag = EGPTNumber.fromBigInt(BigInt(Math.floor(Math.random() * 20 - 10)));
        signal.push(new ComplexEGPTNumber(real, imag));
    }
    return signal;
}

/**
 * Benchmark a single implementation
 */
function benchmarkImplementation(impl_name, fat_fn, ifat_fn, signal, iterations = 100) {
    const results = {
        forwardTime: [],
        inverseTime: [],
        roundtripTime: []
    };
    
    // Warmup
    for (let i = 0; i < 10; i++) {
        const spectrum = fat_fn(signal);
        ifat_fn(spectrum, true);
    }
    
    // Benchmark forward
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const spectrum = fat_fn(signal);
        const end = performance.now();
        results.forwardTime.push(end - start);
    }
    
    // Benchmark inverse (reuse spectrum from last forward)
    const spectrum = fat_fn(signal);
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        ifat_fn(spectrum, true);
        const end = performance.now();
        results.inverseTime.push(end - start);
    }
    
    // Benchmark round-trip
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const s = fat_fn(signal);
        ifat_fn(s, true);
        const end = performance.now();
        results.roundtripTime.push(end - start);
    }
    
    // Calculate statistics
    const stats = {
        forward: {
            mean: results.forwardTime.reduce((a, b) => a + b, 0) / iterations,
            min: Math.min(...results.forwardTime),
            max: Math.max(...results.forwardTime),
            median: results.forwardTime.sort((a, b) => a - b)[Math.floor(iterations / 2)]
        },
        inverse: {
            mean: results.inverseTime.reduce((a, b) => a + b, 0) / iterations,
            min: Math.min(...results.inverseTime),
            max: Math.max(...results.inverseTime),
            median: results.inverseTime.sort((a, b) => a - b)[Math.floor(iterations / 2)]
        },
        roundtrip: {
            mean: results.roundtripTime.reduce((a, b) => a + b, 0) / iterations,
            min: Math.min(...results.roundtripTime),
            max: Math.max(...results.roundtripTime),
            median: results.roundtripTime.sort((a, b) => a - b)[Math.floor(iterations / 2)]
        }
    };
    
    return stats;
}

/**
 * Main benchmark function
 */
async function runBenchmark() {
    console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║  PURE PPF vs CANONICAL FAT: PERFORMANCE BENCHMARK                             ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    
    const sizes = [2, 4, 8, 16, 32, 64, 128, 256]; // Reduced for faster testing
    const iterations = 10; // Reduced iterations
    
    const results = [];
    
    for (const N of sizes) {
        console.log(`\n📊 Benchmarking N=${N}...`);
        
        const signal = createTestSignal(N);
        
        // Benchmark canonical
        console.log(`  Running canonical implementation...`);
        const canonical_stats = benchmarkImplementation(
            'canonical',
            fat_canonical,
            ifat_canonical,
            signal,
            iterations
        );
        
        // Benchmark pure PPF
        console.log(`  Running pure PPF implementation...`);
        const pure_stats = benchmarkImplementation(
            'purePPF',
            fat_pureppf,
            ifat_pureppf,
            signal,
            iterations
        );
        
        // Calculate speedup
        const forward_speedup = canonical_stats.forward.mean / pure_stats.forward.mean;
        const inverse_speedup = canonical_stats.inverse.mean / pure_stats.inverse.mean;
        const roundtrip_speedup = canonical_stats.roundtrip.mean / pure_stats.roundtrip.mean;
        
        results.push({
            N,
            canonical_forward: canonical_stats.forward.mean,
            canonical_inverse: canonical_stats.inverse.mean,
            canonical_roundtrip: canonical_stats.roundtrip.mean,
            pure_forward: pure_stats.forward.mean,
            pure_inverse: pure_stats.inverse.mean,
            pure_roundtrip: pure_stats.roundtrip.mean,
            forward_speedup,
            inverse_speedup,
            roundtrip_speedup
        });
        
        console.log(`  ✅ Forward: ${forward_speedup.toFixed(2)}x ${forward_speedup > 1 ? 'faster' : 'slower'}`);
        console.log(`  ✅ Inverse: ${inverse_speedup.toFixed(2)}x ${inverse_speedup > 1 ? 'faster' : 'slower'}`);
        console.log(`  ✅ Round-trip: ${roundtrip_speedup.toFixed(2)}x ${roundtrip_speedup > 1 ? 'faster' : 'slower'}`);
    }
    
    // Export to CSV
    const outputDir = path.join(process.cwd(), 'EGPT/js/model/benchmarks/results');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const csvFile = path.join(outputDir, `pureppf_vs_canonical_${timestamp}.csv`);
    
    const header = [
        'N',
        'canonical_forward_mean_ms',
        'canonical_inverse_mean_ms',
        'canonical_roundtrip_mean_ms',
        'pure_forward_mean_ms',
        'pure_inverse_mean_ms',
        'pure_roundtrip_mean_ms',
        'forward_speedup',
        'inverse_speedup',
        'roundtrip_speedup'
    ].join(',');
    
    const rows = [header];
    for (const r of results) {
        rows.push([
            r.N,
            r.canonical_forward.toFixed(4),
            r.canonical_inverse.toFixed(4),
            r.canonical_roundtrip.toFixed(4),
            r.pure_forward.toFixed(4),
            r.pure_inverse.toFixed(4),
            r.pure_roundtrip.toFixed(4),
            r.forward_speedup.toFixed(4),
            r.inverse_speedup.toFixed(4),
            r.roundtrip_speedup.toFixed(4)
        ].join(','));
    }
    
    fs.writeFileSync(csvFile, rows.join('\n'));
    console.log(`\n✅ Results exported to: ${csvFile}`);
    
    // Summary statistics
    console.log('\n' + '═'.repeat(80));
    console.log('PERFORMANCE SUMMARY');
    console.log('═'.repeat(80));
    
    const avg_forward_speedup = results.reduce((sum, r) => sum + r.forward_speedup, 0) / results.length;
    const avg_inverse_speedup = results.reduce((sum, r) => sum + r.inverse_speedup, 0) / results.length;
    const avg_roundtrip_speedup = results.reduce((sum, r) => sum + r.roundtrip_speedup, 0) / results.length;
    
    console.log(`Average Forward Speedup: ${avg_forward_speedup.toFixed(2)}x`);
    console.log(`Average Inverse Speedup: ${avg_inverse_speedup.toFixed(2)}x`);
    console.log(`Average Round-trip Speedup: ${avg_roundtrip_speedup.toFixed(2)}x`);
    
    // Best and worst
    const best_forward = results.reduce((best, r) => r.forward_speedup > best.forward_speedup ? r : best, results[0]);
    const worst_forward = results.reduce((worst, r) => r.forward_speedup < worst.forward_speedup ? r : worst, results[0]);
    
    console.log(`\nBest Forward Speedup: ${best_forward.forward_speedup.toFixed(2)}x at N=${best_forward.N}`);
    console.log(`Worst Forward Speedup: ${worst_forward.forward_speedup.toFixed(2)}x at N=${worst_forward.N}`);
    
    console.log('═'.repeat(80));
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('benchmark_PurePPF_vs_Canonical.js')) {
    runBenchmark().catch(error => {
        console.error('❌ Benchmark failed:', error);
        console.error(error.stack);
        process.exit(1);
    });
}

export { runBenchmark };

