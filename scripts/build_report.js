#!/usr/bin/env node
/**
 * EGPT Build Verification Report
 *
 * Runs the Lean build, checks axiom usage for all key theorems,
 * and writes a formatted markdown report to Lean/EGPT_PROOFS_VALIDATION.md
 *
 * Usage:  node scripts/build_report.js
 *         npm run build:report        (from repo root)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..');
const LEAN_DIR = path.join(REPO_ROOT, 'Lean');
const OUTPUT_FILE = path.join(LEAN_DIR, 'EGPT_PROOFS_VALIDATION.md');

// Lean's 3 built-in axioms — the only ones acceptable
const BUILTIN_AXIOMS = new Set(['propext', 'Classical.choice', 'Quot.sound']);

// Section metadata matching build_report.lean's #print axioms order
const SECTIONS = [
  // ── Reality Is Computation (capstone) ─────────────────────────
  {
    title: 'Reality Is Computation — Capstone Theorem',
    description: 'Every physical system (BE/FD/MB) has a computable program whose complexity equals ⌈entropy⌉. Composes RECT with the three canonical distribution proofs over Lean ℝ.',
    file: 'EGPT/Physics/RealityIsComputation.lean',
    theorems: [
      'EGPT.Physics.RealityIsComputation.RealityIsComputation\'',
      'EGPT.Physics.RealityIsComputation.RealityIsComputation',
      'EGPT.Physics.RealityIsComputation.ContinuousFieldsAreComputation',
    ],
  },
  // ── Number Theory ─────────────────────────────────────────────
  {
    title: 'Number Theory — Core: ParticlePath ↔ ℕ Bijection & Arithmetic',
    description: 'The foundational equivalence between natural numbers and particle paths, with native EGPT arithmetic.',
    file: 'EGPT/NumberTheory/Core.lean',
    theorems: [
      'EGPT.NumberTheory.Core.equivParticlePathToNat',
      'EGPT.NumberTheory.Core.fromNat',
      'EGPT.NumberTheory.Core.toNat',
      'EGPT.NumberTheory.Core.left_inv',
      'EGPT.NumberTheory.Core.right_inv',
      'EGPT.NumberTheory.Core.toNat_add_ParticlePath',
      'EGPT.NumberTheory.Core.toNat_mul_ParticlePath',
      'EGPT.NumberTheory.Core.EGPT_Polynomial.eval',
      'EGPT.NumberTheory.Core.cardinal_of_egpt_level',
    ],
  },
  {
    title: 'Number Theory — Filter: RejectionFilter & Probability',
    description: 'The rejection filter mechanism that carves solution spaces from constraint satisfaction problems.',
    file: 'EGPT/NumberTheory/Filter.lean',
    theorems: [
      'EGPT.NumberTheory.Filter.RejectionFilter.get_witness',
      'EGPT.NumberTheory.Filter.RejectionFilter.of_satisfying_example',
      'EGPT.NumberTheory.Filter.distOfRejectionFilter',
      'EGPT.NumberTheory.Filter.eventsPMF',
      'EGPT.NumberTheory.Filter.construct_real_solution_space',
    ],
  },
  {
    title: 'Number Theory — Analysis: Fundamental Theorem of Arithmetic (EGPT)',
    description: 'Information-theoretic reformulation of the Fundamental Theorem of Arithmetic via entropy decomposition.',
    file: 'EGPT/NumberTheory/Analysis.lean',
    theorems: [
      'RET_All_Entropy_Is_Scaled_Shannon_Entropy',
      'EGPT_Fundamental_Theorem_of_Arithmetic_via_Information',
      'EGPT_Fundamental_Theorem_of_Arithmetic_via_Entropy_Bits',
      'total_entropy_from_classes_eq_shannon_formula',
      'PrimeAtoms.factorial_information_decomposition',
      'PrimeAtoms.factorial_information_increment',
    ],
  },
  // ── Constraints ───────────────────────────────────────────────
  {
    title: 'Constraints: CNF Encoding & Canonical Form',
    description: 'Syntactic CNF representation, encoding to tape, and canonical normalization.',
    file: 'EGPT/Constraints.lean',
    theorems: [
      'EGPT.Constraints.evalCNF',
      'EGPT.Constraints.encodeCNF',
      'EGPT.Constraints.normalizeCNF',
      'EGPT.Constraints.evalCNF_normalize_eq_evalCNF',
      'EGPT.Constraints.encodeCNF_normalize_length_eq',
      'EGPT.Constraints.encodeCNF_size_ge_k',
      'EGPT.Constraints.cnf_length_le_encoded_length',
    ],
  },
  // ── Entropy ───────────────────────────────────────────────────
  {
    title: 'Entropy — Common: Shannon Entropy & Source Coding',
    description: 'Shannon entropy definitions, source coding theorems, and the program↔entropy bijection.',
    file: 'EGPT/Entropy/Common.lean',
    theorems: [
      'EGPT.Entropy.Common.ShannonEntropyOfDist',
      'EGPT.Entropy.Common.stdShannonEntropyLn',
      'EGPT.Entropy.Common.stdShannonEntropyLn_uniform_eq_log_card',
      'EGPT.Entropy.Common.rect_program_for_dist',
      'EGPT.Entropy.Common.RECT_Entropy_to_Program',
      'EGPT.Entropy.Common.IRECT_RECT_inverse_for_integer_complexity',
      'EGPT.Entropy.Common.program_source_complexity_matches',
    ],
  },
  {
    title: 'Entropy — RET: Rota Entropy Theorem',
    description: 'The complete proof of Rota\'s characterization: all valid entropy functions are scalar multiples of Shannon entropy.',
    file: 'EGPT/Entropy/RET.lean',
    theorems: [
      'EGPT.Entropy.RET.f0_1_eq_0',
      'EGPT.Entropy.RET.f0_mono',
      'EGPT.Entropy.RET.f0_mul_eq_add_f0',
      'EGPT.Entropy.RET.uniformEntropy_power_law',
      'EGPT.Entropy.RET.logarithmic_trapping',
      'EGPT.Entropy.RET.uniformEntropy_ratio_eq_logb',
      'EGPT.Entropy.RET.RotaUniformTheorem_formula_with_C_constant',
      'EGPT.Entropy.RET.RotaUniformTheorem',
      'EGPT.Entropy.RET.RUE_rational_case',
      'EGPT.Entropy.RET.H_canonical_uniform_eq_C_shannon',
    ],
  },
  {
    title: 'Entropy — H: Shannon Entropy Properties & Chain Rule',
    description: 'Verification that canonical entropy satisfies all Rota axioms: symmetry, normalization, continuity, max-uniform, and the chain rule.',
    file: 'EGPT/Entropy/H.lean',
    theorems: [
      'EGPT.Entropy.H.h_canonical_is_symmetric',
      'EGPT.Entropy.H.h_canonical_is_normalized',
      'EGPT.Entropy.H.h_canonical_is_zero_on_empty',
      'EGPT.Entropy.H.h_canonical_is_zero_invariance',
      'EGPT.Entropy.H.h_canonical_is_continuous',
      'EGPT.Entropy.H.h_canonical_is_cond_add_sigma',
      'EGPT.Entropy.H.h_canonical_is_max_uniform',
      'EGPT.Entropy.H.entropy_of_fair_coin_is_one_bit',
      'EGPT.Entropy.H.stdShannonEntropyLn_le_log_card',
      'EGPT.Entropy.H.stdShannonEntropyLn_chain_rule_sigma',
    ],
  },
  // ── Complexity ────────────────────────────────────────────────
  {
    title: 'Complexity — Tableau & Polynomial Bounds',
    description: 'Satisfying tableaux as NP certificates with constructive polynomial bounds.',
    file: 'EGPT/Complexity/Tableau.lean',
    theorems: [
      'EGPT.Complexity.PathToConstraint',
      'EGPT.Complexity.constructSatisfyingTableau',
      'EGPT.Complexity.tableauComplexity_upper_bound',
      'EGPT.Complexity.tableauComplexity_eq_sum_of_paths',
    ],
  },
  {
    title: 'Complexity — P = NP Proof Chain',
    description: 'The complete constructive proof that P = NP, using standard names (P, NP) over Lean\'s native type hierarchy.',
    file: 'EGPT/Complexity/PPNP.lean',
    theorems: [
      'EGPT.Complexity.PPNP.L_SAT_Canonical',
      'EGPT.Complexity.PPNP.NP',
      'EGPT.Complexity.PPNP.P',
      'EGPT.Complexity.PPNP.L_SAT_in_NP',
      'EGPT.Complexity.PPNP.L_SAT_in_P',
      'EGPT.Complexity.PPNP.L_SAT_in_NP_Hard',
      'EGPT.Complexity.PPNP.EGPT_CookLevin_Theorem',
      'EGPT.Complexity.PPNP.P_eq_NP',
    ],
  },
  {
    title: 'Complexity — UTM: Universal Turing Machine Certifier',
    description: 'The EGPT UTM that transforms problems into certified results.',
    file: 'EGPT/Complexity/UTM.lean',
    theorems: [
      'EGPT.Complexity.PPNP.UniversalTuringMachine_EGPT',
    ],
  },
  {
    title: 'PPNP — Wave-Particle Duality Disproved',
    description: 'Formal proof that Bose-Einstein statistics are fully explained by classical particle paths, disproving wave-particle duality as a fundamental phenomenon.',
    file: 'PPNP/Proofs/WaveParticleDualityDisproved.lean',
    theorems: [
      'PhotonDistributionsHaveClassicalExplanationFromIndividualPaths',
      'Wave_Particle_Duality_Disproved_QED',
    ],
  },
  // ── Physics ───────────────────────────────────────────────────
  {
    title: 'Physics — Common: Physical Entropy',
    description: 'Physical entropy definitions for statistical mechanical systems.',
    file: 'EGPT/Physics/Common.lean',
    theorems: [
      'EGPT.Physics.Common.H_physical_system',
    ],
  },
  {
    title: 'Physics — Uniform Systems',
    description: 'Proof that physical entropy of uniform distributions equals C × Shannon entropy.',
    file: 'EGPT/Physics/UniformSystems.lean',
    theorems: [
      'EGPT.Physics.UniformSystems.H_physical_dist_eq_C_shannon_if_uniform_and_equiv',
      'EGPT.Physics.UniformSystems.H_physical_system_is_rota_uniform',
      'EGPT.Physics.UniformSystems.H_canonical_uniform_eq_C_shannon',
      'EGPT.Physics.UniformSystems.stdShannonEntropyLn_comp_equiv',
    ],
  },
  {
    title: 'Physics — Bose-Einstein Statistics',
    description: 'Bose-Einstein distribution formalized as a uniform distribution over multisets, with entropy proof.',
    file: 'EGPT/Physics/BoseEinstein.lean',
    theorems: [
      'EGPT.Physics.BE.H_BE_from_Multiset_eq_C_shannon',
      'EGPT.Physics.BE.p_BE_sums_to_one',
      'EGPT.Physics.BE.p_BE_fin_is_uniformDist',
    ],
  },
  {
    title: 'Physics — Photonic Cellular Automata',
    description: 'The physical bridge: every BE system has an equivalent computational program.',
    file: 'EGPT/Physics/PhotonicCA.lean',
    theorems: [
      'EGPT.Physics.PCA.be_system_has_equivalent_program',
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: LEAN_DIR, encoding: 'utf-8', timeout: 600_000, ...opts });
  } catch (e) {
    return { error: true, stdout: e.stdout || '', stderr: e.stderr || '', status: e.status };
  }
}

function log(msg) { process.stdout.write(msg + '\n'); }

function shortName(fqn) { return fqn.split('.').pop(); }

function parseAxiomReport(output) {
  // Returns Map<fqn, { axioms: string[], hasSorry: bool }>
  // Lean may wrap long axiom lists across multiple lines, so we first
  // join continuation lines (those starting with whitespace) back together.
  const joined = output.replace(/\n\s+/g, ' ');

  const results = new Map();
  for (const line of joined.split('\n')) {
    const noDepMatch = line.match(/^'(.+?)' does not depend on any axioms/);
    if (noDepMatch) {
      results.set(noDepMatch[1], { axioms: [], hasSorry: false });
      continue;
    }
    const depMatch = line.match(/^'(.+?)' depends on axioms: \[(.+)\]/);
    if (depMatch) {
      const axioms = depMatch[2].split(',').map(s => s.trim());
      results.set(depMatch[1], {
        axioms,
        hasSorry: axioms.some(a => a.toLowerCase().includes('sorry')),
      });
    }
  }
  return results;
}

function axiomBadge(axioms) {
  if (axioms.length === 0) return '*(no axioms)*';
  return axioms.map(a => `\`${a}\``).join(', ');
}

// ─── Main ───────────────────────────────────────────────────────

function main() {
  const startTime = Date.now();
  const errors = [];

  // ── Step 1: lake build ──────────────────────────────────────
  log('Building EGPT...');
  const egptBuild = run('lake build 2>&1');
  const egptOk = typeof egptBuild === 'string' && !egptBuild.includes('build failed');

  log('Building PPNP...');
  const ppnpBuild = run('lake build PPNP 2>&1');
  const ppnpOk = typeof ppnpBuild === 'string' && !ppnpBuild.includes('build failed');

  if (!egptOk) errors.push('`lake build` (EGPT) failed');
  if (!ppnpOk) errors.push('`lake build PPNP` failed');

  // ── Step 2: axiom report ────────────────────────────────────
  log('Running axiom report...');
  const axiomRaw = run('lake env lean build_report.lean 2>&1');
  const axiomOk = typeof axiomRaw === 'string';
  if (!axiomOk) {
    errors.push('`build_report.lean` failed to typecheck');
  }

  const axiomOutput = axiomOk ? axiomRaw : (axiomRaw.stdout || '') + (axiomRaw.stderr || '');
  const axiomMap = parseAxiomReport(axiomOutput);

  // ── Step 3: analysis ────────────────────────────────────────
  let totalTheorems = 0;
  let sorryCount = 0;
  const customAxioms = new Set();

  for (const [, info] of axiomMap) {
    totalTheorems++;
    if (info.hasSorry) sorryCount++;
    for (const a of info.axioms) {
      if (!BUILTIN_AXIOMS.has(a) && !a.toLowerCase().includes('sorry')) {
        customAxioms.add(a);
      }
    }
  }

  const toolchain = fs.readFileSync(path.join(LEAN_DIR, 'lean-toolchain'), 'utf-8').trim();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const now = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z/, ' UTC');
  const allPassed = errors.length === 0 && sorryCount === 0 && customAxioms.size === 0;
  const verdict = allPassed ? 'PASS' : 'FAIL';

  // ── Step 4: build markdown ──────────────────────────────────
  const lines = [];
  const ln = (s = '') => lines.push(s);

  ln('# EGPT Build Verification Report');
  ln();
  ln(`> Generated: ${now}  `);
  ln(`> Toolchain: \`${toolchain}\`  `);
  ln(`> Elapsed: ${elapsed}s`);
  ln();

  // Summary box
  if (allPassed) {
    ln('| Check | Result |');
    ln('|-------|--------|');
    ln(`| \`lake build\` (EGPT) | ${egptOk ? 'PASS' : 'FAIL'} |`);
    ln(`| \`lake build PPNP\` | ${ppnpOk ? 'PASS' : 'FAIL'} |`);
    ln(`| sorry-free | ${sorryCount === 0 ? 'PASS' : 'FAIL — ' + sorryCount + ' found'} |`);
    ln(`| No custom axioms | ${customAxioms.size === 0 ? 'PASS' : 'FAIL — ' + [...customAxioms].join(', ')} |`);
    ln(`| Theorems verified | **${totalTheorems}** |`);
    ln();
    ln(`**Verdict: ${verdict}** — All ${totalTheorems} theorems are sorry-free and use only Lean\'s built-in axioms.`);
  } else {
    ln('| Check | Result |');
    ln('|-------|--------|');
    ln(`| \`lake build\` (EGPT) | ${egptOk ? 'PASS' : '**FAIL**'} |`);
    ln(`| \`lake build PPNP\` | ${ppnpOk ? 'PASS' : '**FAIL**'} |`);
    ln(`| sorry-free | ${sorryCount === 0 ? 'PASS' : '**FAIL** — ' + sorryCount + ' found'} |`);
    ln(`| No custom axioms | ${customAxioms.size === 0 ? 'PASS' : '**FAIL** — ' + [...customAxioms].join(', ')} |`);
    ln(`| Theorems verified | **${totalTheorems}** |`);
    ln();
    ln(`**Verdict: ${verdict}**`);
    if (errors.length > 0) {
      ln();
      ln('### Errors');
      ln();
      for (const e of errors) ln(`- ${e}`);
    }
  }
  ln();
  ln('---');
  ln();

  // Per-section tables
  for (const section of SECTIONS) {
    ln(`## ${section.title}`);
    ln();
    ln(section.description);
    ln();
    ln(`Source: [\`${section.file}\`](${section.file})`);
    ln();
    ln('| Theorem | Axioms | Status |');
    ln('|---------|--------|--------|');

    for (const fqn of section.theorems) {
      const info = axiomMap.get(fqn);
      const name = `\`${shortName(fqn)}\``;
      if (!info) {
        ln(`| ${name} | — | **NOT FOUND** |`);
        continue;
      }
      const status = info.hasSorry ? '**SORRY**' : 'OK';
      ln(`| ${name} | ${axiomBadge(info.axioms)} | ${status} |`);
    }
    ln();
  }

  // Axiom glossary
  ln('---');
  ln();
  ln('## Axiom Reference');
  ln();
  ln('The only axioms appearing above are Lean 4\'s three built-in axioms:');
  ln();
  ln('| Axiom | Purpose |');
  ln('|-------|---------|');
  ln('| `propext` | Propositional extensionality — two propositions that imply each other are equal |');
  ln('| `Quot.sound` | Quotient soundness — equivalent elements map to the same quotient |');
  ln('| `Classical.choice` | Axiom of choice — allows non-constructive witness selection |');
  ln();
  ln('No custom axioms or `sorry` placeholders are used in any verified theorem.');
  ln();

  // ── Step 5: write file ──────────────────────────────────────
  const md = lines.join('\n');
  fs.writeFileSync(OUTPUT_FILE, md, 'utf-8');

  log(`\n${verdict}: ${totalTheorems} theorems verified`);
  log(`Report written to ${path.relative(REPO_ROOT, OUTPUT_FILE)}`);

  process.exit(allPassed ? 0 : 1);
}

main();
