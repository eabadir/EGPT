# The Address Is The Map Visualizer - Enhanced Edition

This enhanced version of the visualizer extends the original "Address Is The Map" concept with a comprehensive P=NP Problem Test Center, demonstrating the core insights from the EGPT (Electronic Graph Paper Theory) framework.

## Features

### Enhanced Introduction
- **Multi-section intro modal** with tabs for:
  - Introduction to the cryptography approach
  - Traveling Salesman Problem explanation
  - Circuit SAT / Graph Coloring visualization
  - Encoder/Decoder insight
- **Navigation options** to either explore the visualizer or test your own problems

### P=NP Problem Test Center
A comprehensive testing environment with four main panels:

#### 1. Problem Specification Panel
- **Example Problems**: Pre-built CNF problems with known solutions
  - Simple 3-SAT problems
  - Graph coloring problems
  - Pigeonhole principle examples
  - Circuit verification problems
- **Random Problem Generation**: Generate CNF problems with specified parameters
- **Manual CNF Input**: Support for DIMACS format and visual clause building
- **Certificate Input**: Optional known solutions for testing

#### 2. Circuit Visualization Panel
- **Graph Coloring View**: Variables as nodes, constraints as edges
- **Interactive Display**: Shows satisfied/unsatisfied clauses
- **Witness Highlighting**: Marks which literals satisfy each clause
- **Real-time Updates**: Visual feedback during solving process

#### 3. Solver Interface Panel
- **Built-in Solvers**:
  - Brute Force: Exhaustive search through all assignments
  - Random Search: Stochastic local search
  - DPLL: Davis-Putnam-Logemann-Loveland algorithm
- **Custom Solver Support**: JavaScript code editor for implementing custom algorithms
- **Performance Metrics**: Iterations, time, complexity tracking

#### 4. Certificate Verification Panel
- **Clause-by-Clause Verification**: Shows which clauses are satisfied
- **Complexity Analysis**: Calculates actual vs theoretical bounds
- **EGPT Theory Connection**: Links to formal mathematical framework

## Technical Implementation

### Core Concepts
- **CNF Problems**: Conjunctive Normal Form representation of logical constraints
- **Certificates**: Satisfying assignments with witness literals and complexity measures
- **PathToConstraint**: EGPT's measure of information cost for each constraint
- **Tableau Complexity**: Sum of witness path costs, bounded by n²

### EGPT Theory Integration
The visualizer explicitly connects to the formal EGPT framework:

- **Certificate = SatisfyingTableau**: From `EGPT/Complexity/Tableau.lean`
- **Witness Paths = PathToConstraint**: Each literal's cost is its variable index
- **Complexity Bound**: Demonstrates `tableauComplexity_upper_bound`
- **Bijection**: Mirrors `equivParticlePathToNat` from `EGPT/NumberTheory/Core.lean`
- **P=NP Proof**: Shows definitional equality from `EGPT/Complexity/PPNP.lean`

### File Structure
```
components/
├── TestCenter.tsx              # Main test center container
├── ProblemSpecification.tsx    # CNF problem input interface
├── CircuitVisualization.tsx    # Graph coloring visualization
├── SolverInterface.tsx         # Solver selection and execution
├── CertificateVerifier.tsx     # Certificate validation
└── IntroModal.tsx             # Enhanced intro with tabs

examples/
└── problems.ts                # Pre-built example problems

solvers/
└── BruteForceSolver.ts        # Solver implementations

utils/
└── cnfUtils.ts               # CNF parsing and utilities
```

## Usage

### Getting Started
1. **Launch the app** - you'll see the enhanced intro modal
2. **Explore the tabs** to understand the Traveling Salesman and Circuit SAT metaphors
3. **Choose your path**:
   - "Explore the Visualizer" - original spiral visualization
   - "Test Your Own Problems" - P=NP Test Center

### Using the Test Center
1. **Load a Problem**: Use examples, generate random, or input manually
2. **Visualize**: See the problem as a graph coloring
3. **Solve**: Run built-in or custom solvers
4. **Verify**: Check certificate validity and complexity

### Custom Solvers
Implement your own solver by:
1. Selecting "Custom Solver"
2. Writing JavaScript code that implements a `solve(cnf)` function
3. Returning a `SolverResult` with certificate and metrics
4. Testing on various problems

## The "Address Is The Map" Metaphor

### Traditional Manhattan Grid
- Address "3-East, 5-South" tells you exactly how to get there
- **The address IS the map** - direct navigation

### Composite Addresses
- Address "15" doesn't tell you the route
- **The address is NOT the map** - requires search

### EGPT Insight
- **Nat ↔ ParticlePath ↔ ComputerProgram ↔ List Bool**
- Every natural number has a unique computational path
- **The address truly is the map** - bijective encoding

### P=NP Proof
- Find the right encoder/decoder mapping (bijectively reversible Shannon Coding)
- Once you have the "decoder ring", routing becomes O(n²)
- **P = NP when addresses are maps**

## Connection to Formal Proof

This visualizer demonstrates the key concepts from the formal EGPT proof:

1. **Number Theory Foundations**: `EGPT/NumberTheory/Core.lean`
2. **Entropy and RET**: `EGPT/Entropy/RET.lean`
3. **Constraints and CNF**: `EGPT/Constraints.lean`
4. **SatisfyingTableau**: `EGPT/Complexity/Tableau.lean`
5. **P=NP Definition**: `EGPT/Complexity/PPNP.lean`

The visualizer makes these abstract concepts concrete and interactive, showing how the "Address Is The Map" insight leads directly to P=NP.

## License

This enhanced visualizer is part of the EGPT project and follows the same licensing terms as the main repository.
