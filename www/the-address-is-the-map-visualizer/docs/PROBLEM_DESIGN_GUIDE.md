# Problem Design Guide

## Welcome to the NP-Complete Problem Design Guide

This guide helps you create, validate, and upload your own NP-Complete problems to the **Address Is The Map** visualizer. Whether you're working with Traveling Salesman problems, Circuit Satisfiability, or Neural Network training constraints, this guide will help you format your problems correctly.

---

## Table of Contents

1. [Understanding NP-Complete Problems](#understanding-np-complete-problems)
2. [Problem Formats](#problem-formats)
3. [Creating Your Problem](#creating-your-problem)
4. [Certificates and Verification](#certificates-and-verification)
5. [Real-World Applications](#real-world-applications)
6. [Best Practices](#best-practices)
7. [Common Pitfalls](#common-pitfalls)
8. [Validation Checklist](#validation-checklist)

---

## Understanding NP-Complete Problems

### What Makes a Problem NP-Complete?

An NP-Complete problem has these key properties:

1. **Has a certificate**: A solution that can be verified quickly (in polynomial time)
2. **Certificate is a boolean assignment**: Each variable gets a TRUE or FALSE value
3. **All clauses must be satisfied**: The certificate must make every clause true

### CNF (Conjunctive Normal Form)

Problems are expressed as CNF:
- **Variables**: Boolean values (x₁, x₂, x₃, ...)
- **Literals**: Variables or their negations (x₁, ¬x₂)
- **Clauses**: Disjunctions (ORs) of literals ((x₁ ∨ ¬x₂ ∨ x₃))
- **Formula**: Conjunction (AND) of clauses

**Example**: (x₁ ∨ x₂) ∧ (¬x₁ ∨ x₃) ∧ (x₂ ∨ ¬x₃)

### Why This Matters

NP-Complete problems demonstrate the P=NP question:
- **Verification is fast**: Checking a solution takes polynomial time (N²)
- **Finding is hard**: Brute force can require exponential time (2ᴺ)
- **EGPT's insight**: The "Address Is The Map" - bijective encoding can find solutions in N² time

---

## Problem Formats

### DIMACS CNF Format (Standard)

The DIMACS format is the standard format used by SAT solvers worldwide.

**Structure**:
```
c <comment lines start with c>
p cnf <num_variables> <num_clauses>
<literal> <literal> ... 0
<literal> <literal> ... 0
...
```

**Rules**:
- Comment lines start with `c`
- Problem line: `p cnf <vars> <clauses>`
- Literals: positive integers for variables, negative for negation
- Each clause terminates with `0`
- Variables numbered 1 to N (not 0-indexed)

**Example**:
```dimacs
c Simple 3-SAT problem
c Variables: x1, x2, x3
p cnf 3 3
1 2 0
-1 3 0
2 -3 0
```

This represents: (x₁ ∨ x₂) ∧ (¬x₁ ∨ x₃) ∧ (x₂ ∨ ¬x₃)

### JSON Format (Extended)

Our extended format includes certificates and metadata for educational purposes.

**Structure**:
```json
{
  "numVariables": 3,
  "clauses": [
    [
      { "city": { "x": 0, "y": 0, "num": 1 }, "positive": true },
      { "city": { "x": 1, "y": 0, "num": 2 }, "positive": true }
    ]
  ],
  "description": "Problem description",
  "hasCertificate": true,
  "certificate": {
    "assignment": [true, true, false],
    "witnessLiterals": [0, 0, 0],
    "complexity": 6
  },
  "tag": "TR",
  "suggestedOverlay": "manhattan",
  "realWorldContext": "Delivery routing problem",
  "problemSource": "user-uploaded"
}
```

**Required Fields**:
- `numVariables`: Number of boolean variables
- `clauses`: Array of clauses (arrays of literals)

**Optional Fields**:
- `certificate`: Pre-computed solution (makes it NP-Complete)
- `description`: Short description of the problem
- `tag`: Problem type (`TR`, `SAT`, or `AI`)
- `suggestedOverlay`: Visualization (`manhattan`, `circuit`, or `neuralnet`)
- `realWorldContext`: Meaningful context
- `problemSource`: Origin (`user-uploaded`, `example`, etc.)

---

## Creating Your Problem

### Step 1: Define Your Variables

Decide how many variables you need (N). Keep it reasonable:
- **Small (3-8 variables)**: Quick to solve, good for testing
- **Medium (9-15 variables)**: Educational examples
- **Large (16-25 variables)**: Challenging problems
- **Very Large (25+ variables)**: May cause performance issues

### Step 2: Create Clauses

Each clause is a set of literals connected by OR.

**Example**: For variables x₁, x₂, x₃:
- Clause 1: `(x₁ ∨ ¬x₂)` - "Either x₁ is true OR x₂ is false"
- Clause 2: `(¬x₁ ∨ x₃)` - "Either x₁ is false OR x₃ is true"
- Clause 3: `(x₂ ∨ ¬x₃)` - "Either x₂ is true OR x₃ is false"

### Step 3: Find a Solution (Certificate)

To make your problem NP-Complete, you need a known solution:

1. **Try assignments**: Start with all TRUE or all FALSE
2. **Check each clause**: Verify at least one literal is satisfied
3. **Adjust as needed**: Flip variables until all clauses are satisfied
4. **Document the solution**: This becomes your certificate

**Example**: For the clauses above:
- Assignment: x₁=TRUE, x₂=TRUE, x₃=FALSE
- Check Clause 1: x₁=TRUE ✓
- Check Clause 2: x₃=FALSE means ¬x₃=TRUE... wait, we need ¬x₁ ∨ x₃. Since x₁=TRUE, we need x₃=TRUE
- Adjust: x₁=TRUE, x₂=TRUE, x₃=TRUE
- Verify all clauses satisfy ✓

### Step 4: Format Your Problem

Choose DIMACS for simplicity or JSON for rich metadata.

**DIMACS**:
```dimacs
c My custom problem
p cnf 3 3
1 -2 0
-1 3 0
2 -3 0
```

**JSON** (with certificate):
```json
{
  "numVariables": 3,
  "clauses": [
    [
      {"city": {"x": 0, "y": 0, "num": 1}, "positive": true},
      {"city": {"x": 1, "y": 0, "num": 2}, "positive": false}
    ],
    [
      {"city": {"x": 0, "y": 0, "num": 1}, "positive": false},
      {"city": {"x": 2, "y": 0, "num": 3}, "positive": true}
    ],
    [
      {"city": {"x": 1, "y": 0, "num": 2}, "positive": true},
      {"city": {"x": 2, "y": 0, "num": 3}, "positive": false}
    }
  ],
  "hasCertificate": true,
  "certificate": {
    "assignment": [true, true, true],
    "witnessLiterals": [0, 1, 0],
    "complexity": 6
  },
  "description": "My custom 3-SAT",
  "tag": "SAT"
}
```

---

## Certificates and Verification

### What is a Certificate?

A certificate is a **witness** to the problem's satisfiability - a specific assignment that proves a solution exists.

**Components**:
1. **Assignment**: Boolean array (one per variable)
2. **Witness Literals**: Index of the literal that satisfies each clause
3. **Complexity**: Measure of computational complexity

### How to Create a Certificate

**Manual Method**:
1. Start with an assignment (e.g., all TRUE)
2. Check each clause
3. Adjust variables until all clauses are satisfied

**Solver Method**:
1. Use our visualizer's solver
2. Export the resulting certificate
3. Include in your problem definition

**Example**:
```
Problem: (x₁ ∨ x₂) ∧ (x₂ ∨ x₃) ∧ (¬x₁ ∨ ¬x₃)
Certificate: [true, true, false]

Verification:
- Clause 1: x₁=TRUE satisfies (x₁ ∨ x₂) ✓
- Clause 2: x₂=TRUE satisfies (x₂ ∨ x₃) ✓
- Clause 3: ¬x₃=TRUE satisfies (¬x₁ ∨ ¬x₃) ✓
```

### Why Include a Certificate?

1. **Makes it NP-Complete**: Proves the problem is satisfiable
2. **Educational value**: Shows polynomial-time verification
3. **Visualization**: Enables path drawing and overlay highlighting
4. **Performance**: Solvers can verify quickly vs. searching

---

## Real-World Applications

### 1. Traveling Salesman (TR:)

**Use Case**: Route optimization, delivery planning, network routing

**Variables**: Edges or paths in a graph
**Clauses**: Constraints ensuring:
- Each city visited exactly once
- Path is connected
- No sub-tours

**Example**:
```json
{
  "tag": "TR",
  "suggestedOverlay": "manhattan",
  "realWorldContext": "Delivery routing for 12 distribution centers",
  "numVariables": 12,
  ...
}
```

### 2. Circuit Satisfiability (SAT:)

**Use Case**: Circuit verification, logic design, hardware validation

**Variables**: Circuit inputs/gates
**Clauses**: Logic gate constraints:
- AND gates: (¬a ∨ ¬b ∨ c) ∧ (a ∨ ¬c) ∧ (b ∨ ¬c)
- OR gates: (a ∨ b ∨ ¬c) ∧ (¬a ∨ c) ∧ (¬b ∨ c)
- NOT gates: (a ∨ b) ∧ (¬a ∨ ¬b)

**Example**:
```json
{
  "tag": "SAT",
  "suggestedOverlay": "circuit",
  "realWorldContext": "8-bit circuit validation problem",
  "numVariables": 8,
  ...
}
```

### 3. Neural Network Training (AI:)

**Use Case**: Network architecture search, constraint-based learning

**Variables**: Neuron activations, connection weights (binarized)
**Clauses**: Training constraints:
- Input/output relationships
- Activation patterns
- Weight constraints

**Example**:
```json
{
  "tag": "AI",
  "suggestedOverlay": "neuralnet",
  "realWorldContext": "Neural network layer training with 15 neurons",
  "numVariables": 15,
  ...
}
```

---

## Best Practices

### 1. Start Small

Begin with 3-5 variables to test your problem structure. Scale up once validated.

### 2. Test Your Problem

Before uploading:
1. Verify your certificate manually
2. Check that all clauses are satisfiable
3. Ensure variables are numbered correctly (1 to N)

### 3. Provide Context

Include meaningful descriptions:
- **Good**: "15-city delivery route optimization for metropolitan area"
- **Bad**: "Problem 1"

### 4. Use Meaningful Tags

- **TR**: For routing, path-finding, scheduling
- **SAT**: For logic, circuits, verification
- **AI**: For neural networks, learning, optimization

### 5. Document Your Source

If based on real data:
```json
{
  "realWorldContext": "Training constraints from MNIST digit classifier",
  "uploadedBy": "Your Name",
  "uploadedDate": "2025-11-01"
}
```

### 6. Keep It Reasonable

- **Recommended**: 3-20 variables
- **Maximum**: 25 variables (performance)
- **Clauses**: 1-3x the number of variables

---

## Common Pitfalls

### ❌ Off-by-One Errors

**Problem**: Variables numbered 0 to N-1 instead of 1 to N

**DIMACS uses 1-indexed variables!**

```dimacs
# WRONG
p cnf 3 2
0 1 0      # Variable 0 doesn't exist!
1 -2 0

# CORRECT
p cnf 3 2
1 2 0
2 -3 0
```

### ❌ Missing Clause Terminators

**Problem**: Forgetting the `0` at the end of each clause

```dimacs
# WRONG
p cnf 3 2
1 2        # Missing 0!
-1 3 0

# CORRECT
p cnf 3 2
1 2 0
-1 3 0
```

### ❌ Invalid Certificates

**Problem**: Certificate doesn't actually satisfy all clauses

**Solution**: Verify manually or use a solver to generate the certificate

### ❌ Contradictory Clauses

**Problem**: Clauses that can't all be true simultaneously

```dimacs
# UNSAT problem (unsatisfiable)
p cnf 2 4
1 2 0
-1 2 0
1 -2 0
-1 -2 0    # These four clauses contradict each other!
```

### ❌ Too Large Problems

**Problem**: Problems with 30+ variables cause browser performance issues

**Solution**: Keep problems under 25 variables for browser-based solving

---

## Validation Checklist

Before uploading your problem, verify:

- [ ] **Format**: Valid DIMACS or JSON structure
- [ ] **Variables**: Numbered 1 to N (not 0 to N-1)
- [ ] **Clauses**: Each terminated with 0 (DIMACS) or properly formatted (JSON)
- [ ] **Certificate**: If provided, actually satisfies all clauses
- [ ] **Size**: Under 25 variables for best performance
- [ ] **Testing**: Manually verified or solver-tested
- [ ] **Description**: Meaningful, informative
- [ ] **Context**: Real-world application explained
- [ ] **Tag**: Appropriate category (TR, SAT, AI)

---

## Example: Complete Problem

Here's a complete example showing both formats:

### Problem: 5-City Delivery Route

**Scenario**: Find a delivery route visiting 5 distribution centers with specific constraints

**DIMACS**:
```dimacs
c 5-City Delivery Route Optimization
c Variables represent route segments
c Clauses ensure valid tour
p cnf 5 8
1 2 0
2 3 0
3 4 0
4 5 0
-1 5 0
1 -3 0
2 -4 0
3 -5 0
```

**JSON** (with certificate):
```json
{
  "numVariables": 5,
  "clauses": [
    [
      {"city": {"x": 0, "y": 0, "num": 1}, "positive": true},
      {"city": {"x": 1, "y": 0, "num": 2}, "positive": true}
    ],
    [
      {"city": {"x": 1, "y": 0, "num": 2}, "positive": true},
      {"city": {"x": 2, "y": 0, "num": 3}, "positive": true}
    ],
    [
      {"city": {"x": 2, "y": 0, "num": 3}, "positive": true},
      {"city": {"x": 3, "y": 0, "num": 4}, "positive": true}
    ],
    [
      {"city": {"x": 3, "y": 0, "num": 4}, "positive": true},
      {"city": {"x": 4, "y": 0, "num": 5}, "positive": true}
    ],
    [
      {"city": {"x": 0, "y": 0, "num": 1}, "positive": false},
      {"city": {"x": 4, "y": 0, "num": 5}, "positive": true}
    ],
    [
      {"city": {"x": 0, "y": 0, "num": 1}, "positive": true},
      {"city": {"x": 2, "y": 0, "num": 3}, "positive": false}
    ],
    [
      {"city": {"x": 1, "y": 0, "num": 2}, "positive": true},
      {"city": {"x": 3, "y": 0, "num": 4}, "positive": false}
    ],
    [
      {"city": {"x": 2, "y": 0, "num": 3}, "positive": true},
      {"city": {"x": 4, "y": 0, "num": 5}, "positive": false}
    }
  ],
  "hasCertificate": true,
  "certificate": {
    "assignment": [true, true, true, true, true],
    "witnessLiterals": [0, 0, 0, 0, 1, 0, 0, 0],
    "complexity": 15
  },
  "description": "TR: 5-City Delivery Route - Metropolitan optimization",
  "tag": "TR",
  "suggestedOverlay": "manhattan",
  "realWorldContext": "Urban delivery routing for local distribution network",
  "problemSource": "user-uploaded"
}
```

---

## Getting Help

### Resources

1. **Visualizer**: Use our built-in solver to test problems
2. **Examples**: Study the pre-canned problems in the library
3. **Parser**: Upload and let the parser validate your format

### Common Questions

**Q: Can I upload UNSAT problems?**
A: Yes, but they won't be marked as NP-Complete since they have no certificate. Our focus is on satisfiable problems that demonstrate P=NP concepts.

**Q: How do I convert my problem from another format?**
A: Most SAT formats can be converted to DIMACS. Use online converters or manual translation.

**Q: What if my problem is too large?**
A: Consider reducing it to a smaller representative instance, or focus on a specific sub-problem.

**Q: Can I share my problems?**
A: Yes! Export your problems as JSON or DIMACS and share with others.

---

## Conclusion

Creating NP-Complete problems helps you understand:
- The structure of computational complexity
- The P=NP question
- How polynomial verification differs from exponential search
- The power of bijective encoding (Address Is The Map)

Start simple, test thoroughly, and enjoy exploring the fascinating world of NP-Complete problems!

---

**Happy problem designing! 🎯**


