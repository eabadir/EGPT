import React, { useState } from 'react';

interface IntroModalProps {
  show: boolean;
  onClose: () => void;
}

export const IntroModal: React.FC<IntroModalProps> = ({ show, onClose }) => {
  const [currentSection, setCurrentSection] = useState<'intro' | 'npcomplete' | 'tsp' | 'circuit' | 'encoder' | 'overlays'>('intro');

  if (!show) return null;

  const renderIntro = () => (
    <div className="space-y-4 text-slate-300 max-h-[70vh] overflow-y-auto pr-2">
      <p>
        This interactive demo explores math and science as a cryptography problem—a process of encoding and decoding information. We demonstrate this using the "Address Is The Map" thought experiment, which shows a bijective mapping from natural numbers to the complex plane.
      </p>
      <p>
        Historically, Napier's creation of the logarithm was based on coding principles, not abstract "real valued functions." We take a similar geometric approach to show how entropy adds up, satisfying the rule <b className="text-pink-400 font-mono">H(p*q) = H(p) + H(q)</b>.
      </p>
      
      <details className="bg-slate-900/50 rounded-lg p-3 cursor-pointer group">
        <summary className="font-semibold text-slate-300 list-none group-open:mb-2">
            <span className="group-open:hidden">▶</span>
            <span className="hidden group-open:inline">▼</span>
            <span className="ml-2">Technical Details for the Curious</span>
        </summary>
        <div className="text-sm text-slate-400 space-y-3 border-t border-slate-700 pt-3">
            <p>
                The rigorous, axiom-free P=NP proof in the Lean repository is based on <b className="text-emerald-400">Rota's Entropy Theorem (RET)</b>. RET shows that all valid entropy functions are equivalent to scaled discrete Shannon Entropy (<b className="font-mono">C * log(n)</b>).
            </p>
            <p>
                This equivalence means they are efficiently codeable under Shannon's Coding Theorem. The objective here is to visualize this principle. If an entropy function satisfies Rota's five properties, it behaves like a logarithm.
            </p>
        </div>
      </details>
    </div>
  );

  const renderTSP = () => (
    <div className="space-y-4 text-slate-300 max-h-[70vh] overflow-y-auto pr-2">
      <h3 className="text-xl font-bold text-cyan-400 mb-3">The Traveling Salesman Problem</h3>
      
      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-emerald-400">The Setup</h4>
        <p>Imagine you're a traveling salesman in Manhattan, where every address follows a perfect grid. You need to visit specific cities (addresses), avoiding certain neighborhoods, and find the most efficient route.</p>
        
        <div className="bg-slate-800/50 rounded p-3">
          <p className="text-sm"><strong>Traditional Manhattan:</strong> Address "3-East, 5-South" tells you exactly how to get there: walk 3 blocks east, then 5 blocks south. <span className="text-cyan-300">The address IS the map.</span></p>
        </div>
        
        <div className="bg-slate-800/50 rounded p-3">
          <p className="text-sm"><strong>Composite Addresses:</strong> Address "15" doesn't tell you whether to go 15 blocks east, or 3 east and 5 south, or some other combination. <span className="text-red-300">The address is NOT the map.</span></p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-yellow-400">The Problem</h4>
        <p>Find the most efficient route that:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Visits all required cities</li>
          <li>Avoids all forbidden neighborhoods</li>
          <li>Minimizes total Manhattan distance</li>
        </ul>
        
        <div className="bg-red-900/30 border border-red-500/50 rounded p-3">
          <p className="text-sm"><strong>Traditional Approach:</strong> Brute force O(2^n) - try every possible combination of visits/avoids</p>
        </div>
        
        <div className="bg-green-900/30 border border-green-500/50 rounded p-3">
          <p className="text-sm"><strong>EGPT Insight:</strong> If addresses are maps, routing becomes O(n²) - each constraint has a known cost</p>
        </div>
      </div>
    </div>
  );

  const renderCircuit = () => (
    <div className="space-y-4 text-slate-300 max-h-[70vh] overflow-y-auto pr-2">
      <h3 className="text-xl font-bold text-cyan-400 mb-3">Circuit SAT / Graph Coloring</h3>
      
      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-emerald-400">The Circuit</h4>
        <p>Imagine a circuit with multiple inputs and outputs. Some inputs must be active (true), others inactive (false), and there are constraints on which combinations are valid.</p>
        
        <div className="bg-slate-800/50 rounded p-3">
          <p className="text-sm"><strong>Example:</strong> Circuit with inputs A, B, C. Constraint: "At least one of A or B must be true, but not both A and C"</p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-purple-400">Graph Coloring Equivalent</h4>
        <p>This is equivalent to a graph coloring problem:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Nodes:</strong> Variables (A, B, C)</li>
          <li><strong>Colors:</strong> True (green) or False (red)</li>
          <li><strong>Constraints:</strong> Edges between incompatible nodes</li>
        </ul>
        
        <div className="bg-slate-800/50 rounded p-3">
          <p className="text-sm"><strong>Certificate:</strong> A bitmap showing which inputs are active (true/false)</p>
        </div>
        
        <div className="bg-slate-800/50 rounded p-3">
          <p className="text-sm"><strong>Verification:</strong> Check that all constraints are satisfied by the coloring</p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-yellow-400">Why Graph Coloring?</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Easier to understand visually</li>
          <li>Certificate is just a color bitmap</li>
          <li>Constraints are local (adjacent nodes)</li>
          <li>Can verify by inspection</li>
        </ul>
      </div>
    </div>
  );

  const renderEncoder = () => (
    <div className="space-y-4 text-slate-300 max-h-[70vh] overflow-y-auto pr-2">
      <h3 className="text-xl font-bold text-cyan-400 mb-3">The Encoder/Decoder Insight</h3>
      
      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-emerald-400">The Key Insight</h4>
        <p>The address (natural number) encodes the path bijectively. With the right encoding, Address → Path becomes an O(1) lookup operation.</p>
        
        <div className="bg-slate-800/50 rounded p-3">
          <p className="text-sm"><strong>Bijection:</strong> Every address has exactly one path, every path has exactly one address</p>
        </div>
        
        <div className="bg-slate-800/50 rounded p-3">
          <p className="text-sm"><strong>Efficient Encoding:</strong> The "decoder ring" converts addresses to paths in constant time</p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-yellow-400">Complexity Transformation</h4>
        <p>This changes complexity fundamentally:</p>
        
        <div className="bg-red-900/30 border border-red-500/50 rounded p-3">
          <p className="text-sm"><strong>Traditional Approach:</strong> Try all 2^N possible assignments - exponential time</p>
          <p className="text-xs text-slate-400">For N=10: 1,024 assignments. For N=20: 1,048,576 assignments.</p>
        </div>
        
        <div className="bg-green-900/30 border border-green-500/50 rounded p-3">
          <p className="text-sm"><strong>EGPT Approach:</strong> Direct lookup from address to path - polynomial time</p>
          <p className="text-xs text-slate-400">Complexity bounded by N² operations, not 2^N.</p>
        </div>
        
        <div className="bg-blue-900/30 border border-blue-500/50 rounded p-3">
          <p className="text-sm"><strong>The P=NP Question:</strong> Can NP problems be solved in polynomial time?</p>
          <p className="text-xs text-slate-400">EGPT answers: Yes, when addresses are maps (bijective encoding).</p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-purple-400">The Proof</h4>
        <p>EGPT constructs number theory to prove:</p>
        <div className="bg-slate-800/50 rounded p-3 font-mono text-sm">
          <p>Nat ↔ ParticlePath ↔ ComputerProgram ↔ List Bool</p>
        </div>
        <p className="text-sm">Every natural number has a unique computational path representation, and every computational path corresponds to a natural number. The address truly is the map.</p>
      </div>
    </div>
  );

  const renderNPComplete = () => (
    <div className="space-y-4 text-slate-300 max-h-[70vh] overflow-y-auto pr-2">
      <h3 className="text-xl font-bold text-cyan-400 mb-3">Understanding NP-Complete Problems</h3>
      
      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-green-400">What is NP-Complete?</h4>
        <p>NP-Complete problems are the most important class in computational complexity theory. They have these key properties:</p>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li><strong className="text-green-300">Easy to Verify</strong>: Given a solution (certificate), you can verify it's correct in polynomial time (N²)</li>
          <li><strong className="text-red-300">Hard to Find</strong>: Finding the solution can require exponential time (2ᴺ) with brute force</li>
          <li><strong className="text-cyan-300">Universal</strong>: If you solve one NP-Complete problem efficiently, you solve them all</li>
        </ul>
      </div>

      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-green-400">🏆 Certificates: The Key to NP-Complete</h4>
        <p className="text-sm">A <strong className="text-green-300">certificate</strong> is a witness that proves a problem is solvable:</p>
        
        <div className="bg-slate-800/50 rounded p-3 mt-2">
          <p className="text-sm mb-2"><strong>Example: 3-SAT Problem</strong></p>
          <p className="text-xs mb-1">Problem: (x₁ ∨ x₂) ∧ (x₂ ∨ x₃) ∧ (¬x₁ ∨ ¬x₃)</p>
          <p className="text-xs mb-1">Certificate: [x₁=TRUE, x₂=TRUE, x₃=FALSE]</p>
          <div className="mt-2 space-y-1 text-xs">
            <div className="text-green-300">✓ Clause 1: x₁=TRUE satisfies (x₁ ∨ x₂)</div>
            <div className="text-green-300">✓ Clause 2: x₂=TRUE satisfies (x₂ ∨ x₃)</div>
            <div className="text-green-300">✓ Clause 3: ¬x₃=TRUE satisfies (¬x₁ ∨ ¬x₃)</div>
          </div>
        </div>
        
        <p className="text-sm mt-3">Verification takes <strong className="text-green-300 font-mono">O(N)</strong> time - just check each clause. But finding this certificate with brute force takes <strong className="text-red-300 font-mono">O(2ᴺ)</strong> - try all possible assignments!</p>
      </div>

      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-cyan-400">🎯 Problem Types in This Visualizer</h4>
        
        <div className="space-y-2">
          <div className="bg-slate-800/50 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-400 font-bold">🏆 NP-Complete</span>
              <span className="text-xs bg-green-900/30 px-2 py-0.5 rounded">Has Certificate</span>
            </div>
            <p className="text-xs text-slate-400">All pre-canned problems in our library are NP-Complete with verified certificates. They demonstrate the P=NP question.</p>
          </div>
          
          <div className="bg-slate-800/50 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-400 font-bold">❓ NP-Uncertified</span>
              <span className="text-xs bg-blue-900/30 px-2 py-0.5 rounded">No Certificate</span>
            </div>
            <p className="text-xs text-slate-400">User-uploaded problems without certificates. May be SAT, UNSAT, or unknown until solved.</p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-emerald-400">💡 EGPT Insight: "Address Is The Map"</h4>
        <p className="text-sm">The key insight of EGPT (Entropy Goldbach Prime Theorem) is that NP-Complete problems can be solved in polynomial time using bijective encoding:</p>
        
        <div className="bg-slate-800/50 rounded p-3 mt-2 space-y-2">
          <p className="text-xs"><strong className="text-red-300">Brute Force Approach:</strong> Try all 2ᴺ possible assignments</p>
          <p className="text-xs"><strong className="text-yellow-300">Problem:</strong> 20 variables = 1,048,576 possibilities!</p>
          <p className="text-xs"><strong className="text-green-300">EGPT Approach:</strong> Bijective mapping requires at most N² operations</p>
          <p className="text-xs"><strong className="text-emerald-300">Result:</strong> 20 variables = 400 operations (2,600x faster!)</p>
        </div>
        
        <p className="text-sm mt-3">When "the address IS the map," each constraint has a known computational cost, transforming exponential search into polynomial navigation.</p>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-yellow-400">📊 Problem Complexity Matrix</h4>
        <p className="text-xs text-slate-400 mb-2">How problems are categorized:</p>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-green-400 font-semibold mb-1">Polynomial Solution</div>
            <div className="text-slate-400">Iterations ≤ N²</div>
            <div className="text-emerald-300 text-[10px]">✓ Within N² bound</div>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-yellow-400 font-semibold mb-1">Exponential Solution</div>
            <div className="text-slate-400">Iterations &gt; N²</div>
            <div className="text-orange-300 text-[10px]">⚠ Exceeded bound</div>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-orange-400 font-semibold mb-1">Timeout/Unknown</div>
            <div className="text-slate-400">Incomplete search</div>
            <div className="text-slate-300 text-[10px]">? Status unknown</div>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-blue-400 font-semibold mb-1">Proven UNSAT</div>
            <div className="text-slate-400">All 2ᴺ exhausted</div>
            <div className="text-blue-300 text-[10px]">✗ No solution exists</div>
          </div>
        </div>
      </div>

      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-purple-400">🎓 Why This Matters</h4>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
          <li>NP-Complete problems include: Traveling Salesman, Circuit SAT, Graph Coloring, Scheduling, and many more</li>
          <li>They represent countless real-world optimization problems</li>
          <li>A polynomial solution to one solves them all (P=NP)</li>
          <li>EGPT provides such a solution through bijective encoding</li>
        </ul>
      </div>
    </div>
  );

  const renderOverlays = () => (
    <div className="space-y-4 text-slate-300 max-h-[70vh] overflow-y-auto pr-2">
      <h3 className="text-xl font-bold text-cyan-400 mb-3">Interactive Overlays</h3>
      
      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-emerald-400">Turning The Address Into The Map</h4>
        <p>The visualizer offers different views of the same mathematical structure. Each overlay helps you understand how addresses encode paths in different contexts.</p>
        
        <div className="bg-amber-900/30 border border-amber-500/50 rounded p-3">
          <p className="text-sm"><strong>🏙️ Manhattan City View:</strong> See the spiral as a city grid where salespeople visit buildings</p>
          <ul className="list-disc list-inside text-xs mt-2 space-y-1 text-slate-400">
            <li>Golden buildings: Required destinations to visit</li>
            <li>Gray buildings with X: Locations to avoid</li>
            <li>Green building: Starting point</li>
            <li>Red building with flag: Final destination</li>
          </ul>
        </div>
        
        <div className="bg-green-900/30 border border-green-500/50 rounded p-3">
          <p className="text-sm"><strong>⚡ Circuit Board View:</strong> See the spiral as electronic components on a circuit</p>
          <ul className="list-disc list-inside text-xs mt-2 space-y-1 text-slate-400">
            <li>Green LEDs: Active nodes that must be powered</li>
            <li>Gray resistors: Blocked paths (high resistance)</li>
            <li>Blue power source: Circuit input</li>
            <li>Purple terminal: Circuit output</li>
          </ul>
        </div>
        
        <div className="bg-cyan-900/30 border border-cyan-500/50 rounded p-3">
          <p className="text-sm"><strong>🧠 Neural Network View:</strong> See the spiral as neurons in a network</p>
          <ul className="list-disc list-inside text-xs mt-2 space-y-1 text-slate-400">
            <li>Cyan neurons: Activated/firing neurons</li>
            <li>Gray neurons: Inactive neurons</li>
            <li>Connections: Synaptic links between neurons</li>
            <li>Green/Amber: Input and output layers</li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-yellow-400">Controls</h4>
        <p>In the visualizer, you'll find overlay controls that let you:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Switch overlays:</strong> Choose between City, Circuit, or None</li>
          <li><strong>Adjust transparency:</strong> Control how much the spiral shows through</li>
          <li><strong>See both views:</strong> Understand the connection between abstract math and real problems</li>
        </ul>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-purple-400">Why Multiple Views?</h4>
        <p className="text-sm">Different problems use different metaphors, but the underlying math is the same:</p>
        <div className="bg-slate-800/50 rounded p-3 mt-2 space-y-2">
          <p className="text-xs"><strong>TR: Traveling Salesman:</strong> Visit cities efficiently → Manhattan overlay</p>
          <p className="text-xs"><strong>SAT: Circuit Satisfiability:</strong> Power circuit nodes → Circuit overlay</p>
          <p className="text-xs"><strong>AI: Neural Network Training:</strong> Activate neurons → Neural Net overlay</p>
        </div>
        <p className="text-sm mt-2">By switching views, you see that "The Address Is The Map" applies universally across problem domains. Problems in the library are tagged (TR:, SAT:, AI:) to help you understand their context.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'intro': return renderIntro();
      case 'npcomplete': return renderNPComplete();
      case 'tsp': return renderTSP();
      case 'circuit': return renderCircuit();
      case 'encoder': return renderEncoder();
      case 'overlays': return renderOverlays();
      default: return renderIntro();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full p-6 md:p-8 text-slate-300 opacity-0 scale-95 animate-intro"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in-scale {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-intro {
            animation: fade-in-scale 300ms ease-out forwards;
          }
        `}</style>
        
        <h2 className="text-3xl font-bold text-cyan-400 mb-4">The Address Is The Map</h2>
        
        {/* Navigation tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-slate-900/50 rounded-lg p-1">
          {[
            { key: 'intro', label: 'Introduction' },
            { key: 'npcomplete', label: 'NP-Complete' },
            { key: 'overlays', label: 'Overlays' },
            { key: 'tsp', label: 'Traveling Salesman' },
            { key: 'circuit', label: 'Circuit SAT' },
            { key: 'encoder', label: 'Encoder/Decoder' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCurrentSection(key as any)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentSection === key
                  ? 'bg-cyan-500 text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {renderContent()}

        <div className="flex mt-8">
          <button
            onClick={onClose}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};