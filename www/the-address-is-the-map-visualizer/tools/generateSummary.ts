import type { HardnessResult } from './verifyHardness';

/**
 * Generate comprehensive markdown summary document
 * 
 * @param results Array of hardness verification results
 * @returns Markdown formatted summary string
 */
export function generateSummaryDocument(results: HardnessResult[]): string {
  const date = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let md = `# Hard SAT Problem Verification Results

**Generated:** ${date}  
**Problems Tested:** ${results.length}

---

## Methodology

### Hardness Threshold

**ALL solvers must exceed N³ iterations** (where N = number of variables)

### Solvers Tested

1. **Brute Force**: Exhaustive search through all 2^N assignments
   - Tries assignments 0 to 2^N-1 sequentially
   - Guaranteed to find solution if one exists
   - Iteration count = position of solution in search space

2. **Random Search**: Random assignment sampling
   - Generates random truth assignments
   - Tests: 50 runs per problem (averaged)
   - Max iterations per run: 1,000,000
   - Provides statistical measure of difficulty

3. **DPLL**: Davis-Putnam-Logemann-Loveland algorithm
   - Complete SAT solver with optimizations
   - Unit propagation + pure literal elimination
   - Backtracking search with heuristics
   - Iteration = each recursive call

### Qualification Criteria

✓ **Problem QUALIFIES if:**
- Brute Force iterations > N³
- Random Search average iterations > N³ (over 50 runs)
- DPLL iterations > N³
- Problem is SAT (has solution)

✗ **Problem FAILS if:**
- Any solver completes in ≤ N³ iterations
- Problem is UNSAT (no solution exists)

---

## Problem Summary

`;

  // Sort results by variable count
  results.sort((a, b) => a.problem.numVariables - b.problem.numVariables);

  results.forEach((r, index) => {
    const n = r.problem.numVariables;
    const n3 = r.n3Bound;
    const clauseRatio = (r.problem.clauses.length / n).toFixed(2);
    
    // Status badge
    const status = r.passesHardness.all ? '✓ QUALIFIED' : '✗ FAILED';
    const statusColor = r.passesHardness.all ? '🟢' : '🔴';
    
    md += `
### Problem ${index + 1}: ${r.problem.description || `${n}-Variable SAT`}

${statusColor} **Status:** ${status}

**Problem Characteristics:**
- Variables: ${n}
- Clauses: ${r.problem.clauses.length}
- Clause-to-Variable Ratio: ${clauseRatio}
- N³ Bound: **${n3.toLocaleString()}** iterations
- Real-World Context: ${r.problem.realWorldContext || 'N/A'}
- Problem Type: ${r.problem.tag || 'SAT'}
- Suggested Overlay: ${r.problem.suggestedOverlay || 'none'}

#### Solver Performance

| Solver | Found? | Iterations | Time (ms) | Exceeds N³? | Ratio to N³ |
|--------|--------|------------|-----------|-------------|-------------|
| **Brute Force** | ${r.bruteForce.found ? '✓ YES' : '✗ NO'} | ${r.bruteForce.iterations.toLocaleString()} | ${r.bruteForce.timeMs.toFixed(2)} | ${r.passesHardness.bruteForce ? '✓ YES' : '✗ NO'} | **${r.ratios.bruteForceToN3.toFixed(2)}x** |
| **Random (avg)** | ${r.randomSearch.runs.some(run => run.found) ? '✓ YES' : '✗ NO'} | ${Math.round(r.randomSearch.avgIterations).toLocaleString()} | ${(r.randomSearch.runs.reduce((sum, run) => sum + run.timeMs, 0) / r.randomSearch.runs.length).toFixed(2)} | ${r.passesHardness.random ? '✓ YES' : '✗ NO'} | **${r.ratios.randomToN3.toFixed(2)}x** |
| **DPLL** | ${r.dpll.found ? '✓ YES' : '✗ NO'} | ${r.dpll.iterations.toLocaleString()} | ${r.dpll.timeMs.toFixed(2)} | ${r.passesHardness.dpll ? '✓ YES' : '✗ NO'} | **${r.ratios.dpllToN3.toFixed(2)}x** |

#### Random Search Statistics

- **Runs**: ${r.randomSearch.runs.length}
- **Average Iterations**: ${Math.round(r.randomSearch.avgIterations).toLocaleString()}
- **Min Iterations**: ${r.randomSearch.minIterations.toLocaleString()}
- **Max Iterations**: ${r.randomSearch.maxIterations.toLocaleString()}
- **Std Deviation**: ${r.randomSearch.stdDev.toFixed(2)}
- **Success Rate**: ${(r.randomSearch.runs.filter(run => run.found).length / r.randomSearch.runs.length * 100).toFixed(1)}%

#### Certificate Information

${r.bruteForce.certificate || r.dpll.certificate ? `
**Certificate Found:** ✓ YES

\`\`\`
Assignment: [${(r.bruteForce.certificate || r.dpll.certificate)?.assignment.slice(0, 10).map(b => b ? 'T' : 'F').join(', ')}${n > 10 ? ', ...' : ''}]
Complexity: ${(r.bruteForce.certificate || r.dpll.certificate)?.complexity}
\`\`\`
` : '**Certificate Found:** ✗ NO (UNSAT or timeout)'}

#### Hardness Analysis

${r.passesHardness.all ? `
✓ **This problem QUALIFIES for the library**

All three solvers exceeded the N³ bound, demonstrating genuine exponential hardness:
- Brute Force took ${r.ratios.bruteForceToN3.toFixed(2)}x longer than N³
- Random Search averaged ${r.ratios.randomToN3.toFixed(2)}x longer than N³  
- DPLL required ${r.ratios.dpllToN3.toFixed(2)}x more iterations than N³

This problem is suitable for educational demonstration of NP-Complete hardness.
` : `
✗ **This problem does NOT qualify**

Failure reasons:
${!r.passesHardness.bruteForce ? `- Brute Force: Only ${r.ratios.bruteForceToN3.toFixed(2)}x N³ (needs > 1.0x)\n` : ''}${!r.passesHardness.random ? `- Random Search: Only ${r.ratios.randomToN3.toFixed(2)}x N³ (needs > 1.0x)\n` : ''}${!r.passesHardness.dpll ? `- DPLL: Only ${r.ratios.dpllToN3.toFixed(2)}x N³ (needs > 1.0x)\n` : ''}${!r.bruteForce.found && !r.dpll.found ? '- Problem appears to be UNSAT (no solution exists)\n' : ''}
`}

---
`;
  });

  // Overall statistics
  const qualified = results.filter(r => r.passesHardness.all);
  const sat = results.filter(r => r.bruteForce.found || r.dpll.found);
  const avgBruteForceRatio = results.reduce((sum, r) => sum + r.ratios.bruteForceToN3, 0) / results.length;
  const avgRandomRatio = results.reduce((sum, r) => sum + r.ratios.randomToN3, 0) / results.length;
  const avgDPLLRatio = results.reduce((sum, r) => sum + r.ratios.dpllToN3, 0) / results.length;

  md += `
## Overall Statistics

### Summary

- **Total Problems Tested**: ${results.length}
- **Problems Qualified (all exceed N³)**: ${qualified.length} (${(qualified.length / results.length * 100).toFixed(1)}%)
- **SAT Problems**: ${sat.length} (${(sat.length / results.length * 100).toFixed(1)}%)
- **UNSAT Problems**: ${results.length - sat.length}

### Average Hardness Ratios

- **Brute Force**: ${avgBruteForceRatio.toFixed(2)}x N³
- **Random Search**: ${avgRandomRatio.toFixed(2)}x N³
- **DPLL**: ${avgDPLLRatio.toFixed(2)}x N³

### Problem Size Distribution

${Array.from(new Set(results.map(r => r.problem.numVariables))).sort((a, b) => a - b).map(n => {
  const count = results.filter(r => r.problem.numVariables === n).length;
  const qualifiedCount = qualified.filter(r => r.problem.numVariables === n).length;
  return `- **${n} variables**: ${count} tested, ${qualifiedCount} qualified (${n}³ = ${Math.pow(n, 3).toLocaleString()})`;
}).join('\n')}

---

## Next Steps

${qualified.length > 0 ? `
### ✓ Ready for Integration

${qualified.length} problem(s) qualified and are ready for review:

${qualified.map((r, i) => `${i + 1}. **${r.problem.description}** (${r.problem.numVariables} vars, ${r.problem.clauses.length} clauses)`).join('\n')}

### Integration Checklist

- [ ] Review each problem for educational value
- [ ] Verify real-world context descriptions
- [ ] Confirm problem tags (TR/SAT/AI) are appropriate
- [ ] Test overlay visualizations
- [ ] Add to \`examples/problems.ts\` with proper metadata
- [ ] Update Problem Design Guide with methodology
` : `
### ⚠ No Problems Qualified

No problems met the hardness criteria (all solvers > N³). Consider:

1. **Adjusting problem generation parameters**:
   - Increase clause-to-variable ratios
   - Try different problem patterns
   - Generate more candidates per size

2. **Relaxing hardness threshold**:
   - Consider N² bound instead of N³
   - Or require only 2 out of 3 solvers to exceed threshold

3. **Targeting larger problem sizes**:
   - Problems with more variables may be inherently harder
   - Try sizes: 22, 24, 26, 28, 30
`}

---

## Technical Notes

### Generated Files

- \`generated-problems.json\`: Full problem definitions and verification results
- \`GENERATED_PROBLEMS_SUMMARY.md\`: This human-readable summary (you are here)

### Methodology Validation

All problems in this report were:
1. Generated using established hard SAT patterns (3-SAT phase transition, graph coloring, etc.)
2. Verified with 50 independent random search runs for statistical reliability
3. Tested with complete algorithms (brute force, DPLL) for accurate iteration counts
4. Filtered for SAT (problems with solutions) to ensure practical utility

### Performance Considerations

- **Small problems (N < 16)**: May not exhibit strong exponential behavior
- **Large problems (N > 21)**: May timeout even with optimized solvers
- **Phase transition problems**: Most reliable for consistent hardness
- **Random search variance**: High variance indicates unpredictable difficulty

---

*Generated by Hard SAT Problem Generation Suite*  
*For questions or issues, refer to the Problem Design Guide*
`;

  return md;
}

/**
 * Generate quick summary table for console output
 * 
 * @param results Array of hardness results
 * @returns Console-formatted summary string
 */
export function generateQuickSummary(results: HardnessResult[]): string {
  let summary = '\n' + '='.repeat(120) + '\n';
  summary += 'QUICK SUMMARY\n';
  summary += '='.repeat(120) + '\n\n';
  
  summary += `${'Vars'.padEnd(6)} ${'Clauses'.padEnd(8)} ${'Description'.padEnd(35)} ${'BF/N³'.padEnd(8)} ${'Rand/N³'.padEnd(10)} ${'DPLL/N³'.padEnd(10)} ${'Status'.padEnd(10)}\n`;
  summary += '-'.repeat(120) + '\n';
  
  results.forEach(r => {
    const status = r.passesHardness.all ? '✓ PASS' : '✗ FAIL';
    summary += `${String(r.problem.numVariables).padEnd(6)} `;
    summary += `${String(r.problem.clauses.length).padEnd(8)} `;
    summary += `${(r.problem.description || '').slice(0, 33).padEnd(35)} `;
    summary += `${r.ratios.bruteForceToN3.toFixed(2).padEnd(8)} `;
    summary += `${r.ratios.randomToN3.toFixed(2).padEnd(10)} `;
    summary += `${r.ratios.dpllToN3.toFixed(2).padEnd(10)} `;
    summary += `${status.padEnd(10)}\n`;
  });
  
  summary += '-'.repeat(120) + '\n';
  summary += `Total: ${results.length} | Qualified: ${results.filter(r => r.passesHardness.all).length}\n`;
  summary += '='.repeat(120) + '\n';
  
  return summary;
}
