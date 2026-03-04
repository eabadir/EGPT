import * as fs from 'fs';
import * as path from 'path';
import { generateCandidateProblems, exportProblemsToJSON } from './generateHardProblems';
import { generateSummaryDocument, generateQuickSummary } from './generateSummary';

/**
 * Main entry point for hard SAT problem generation
 * 
 * This script:
 * 1. Generates candidate problems using established hard patterns
 * 2. Verifies hardness with all three solvers (brute force, random, DPLL)
 * 3. Selects best problems that exceed N³ for all solvers
 * 4. Exports to JSON and generates comprehensive markdown summary
 * 
 * Usage:
 *   npx tsx tools/runGeneration.ts
 * 
 * Outputs:
 *   - generated-problems.json: Full problem definitions and verification data
 *   - GENERATED_PROBLEMS_SUMMARY.md: Human-readable analysis and recommendations
 */

async function main() {
  const startTime = Date.now();
  
  console.log(`
╔════════════════════════════════════════════════════════════════════════════════╗
║                   HARD SAT PROBLEM GENERATION SUITE                            ║
║                                                                                ║
║  Generating and verifying NP-Complete SAT problems where ALL solvers          ║
║  (Brute Force, Random Search, DPLL) exceed N³ iterations                      ║
╚════════════════════════════════════════════════════════════════════════════════╝
  `);

  try {
    // Configuration
    const targetSizes = [14, 16, 18, 19, 21];
    const candidatesPerSize = 20; // Generate 20 candidates per size
    const randomRuns = 50; // 50 random search runs per problem
    
    console.log(`Configuration:`);
    console.log(`  Target problem sizes: ${targetSizes.join(', ')} variables`);
    console.log(`  Candidates per size: ${candidatesPerSize}`);
    console.log(`  Random search runs: ${randomRuns}`);
    console.log(`  Total candidates to generate: ${targetSizes.length * candidatesPerSize * 4} (4 pattern types)`);
    console.log(`\n⚠ WARNING: This may take 10-30 minutes depending on problem sizes\n`);

    // Generate and verify problems
    console.log(`Starting problem generation...\n`);
    const results = await generateCandidateProblems(targetSizes, candidatesPerSize, randomRuns);
    
    if (results.length === 0) {
      console.error('\n❌ ERROR: No problems qualified! No output files generated.');
      console.log('\nConsider:');
      console.log('  - Adjusting problem generation parameters');
      console.log('  - Trying different problem sizes');
      console.log('  - Relaxing hardness threshold');
      process.exit(1);
    }
    
    // Display quick summary
    console.log(generateQuickSummary(results));
    
    // Export to JSON
    const jsonData = exportProblemsToJSON(results);
    const jsonPath = path.join(process.cwd(), 'generated-problems.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log(`✓ Exported ${results.length} problem(s) to: ${jsonPath}`);
    
    // Generate markdown summary
    const summary = generateSummaryDocument(results);
    const mdPath = path.join(process.cwd(), 'GENERATED_PROBLEMS_SUMMARY.md');
    fs.writeFileSync(mdPath, summary);
    console.log(`✓ Generated summary document: ${mdPath}`);
    
    // Final statistics
    const qualified = results.filter(r => r.passesHardness.all);
    const elapsedTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    console.log(`
╔════════════════════════════════════════════════════════════════════════════════╗
║                          GENERATION COMPLETE                                   ║
╚════════════════════════════════════════════════════════════════════════════════╝

Summary:
  ✓ Problems Generated: ${results.length}
  ✓ Problems Qualified: ${qualified.length} (${(qualified.length / results.length * 100).toFixed(1)}%)
  ✓ Time Elapsed: ${elapsedTime} minutes

Output Files:
  📄 generated-problems.json - Full problem definitions
  📄 GENERATED_PROBLEMS_SUMMARY.md - Detailed analysis and recommendations

Next Steps:
  1. Review GENERATED_PROBLEMS_SUMMARY.md
  2. Examine each qualified problem for educational value
  3. Verify certificates and real-world context descriptions
  4. If satisfied, integrate problems into examples/problems.ts

${qualified.length > 0 ? `
✓ ${qualified.length} problem(s) ready for review!
` : `
⚠ No problems met the hardness criteria (all solvers > N³)

Consider adjusting parameters or trying larger problem sizes.
See GENERATED_PROBLEMS_SUMMARY.md for detailed analysis.
`}
    `);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR during generation:', error);
    if (error instanceof Error) {
      console.error(`  Message: ${error.message}`);
      console.error(`  Stack: ${error.stack}`);
    }
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
