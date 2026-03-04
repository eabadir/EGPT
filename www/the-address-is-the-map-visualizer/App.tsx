import React, { useState, useMemo } from 'react';
import { GridVisualization } from './components/GridVisualization';
import { Controls } from './components/Controls';
import { IntroModal } from './components/IntroModal';
import { PathCalculator } from './components/PathCalculator';
import { ProblemSpecification } from './components/ProblemSpecification';
import { SolverInterface } from './components/SolverInterface';
import { NPCompleteResultsBadge } from './components/NPCompleteResultsBadge';
import { ClauseDisplay } from './components/ClauseDisplay';
import { OverlayControls } from './components/OverlayControls';
import { useSquareSpiral, getPointDetails, calculateSpiralPoint } from './hooks/useSquareSpiral';
import { Chat } from './components/Chat';
import { ChatIcon } from './components/ChatIcon';
import { cnfToOverlay, simpleCnfToProblem } from './utils/cnfToOverlay';
import { isSudokuProblem } from './utils/sudokuDetector';
import type { Point, PointWithDetails, Clause, Literal, OverlayType, OverlayPlacementConfig, CNFProblem, Certificate, SolverResult } from './types';

const VISUAL_SPIRAL_POINTS = 5000;
const NUM_CLAUSE_CITIES = 20;
const NUM_CLAUSES = 8;

function App() {
  const [targetN, setTargetN] = useState<number>(42);
  const [showIntro, setShowIntro] = useState(true);
  const [path, setPath] = useState<number[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Overlay state
  const [overlayType, setOverlayType] = useState<OverlayType>('manhattan');
  const [spiralOpacity, setSpiralOpacity] = useState<number>(0.3);
  
  // CNF Problem state (unified)
  const [currentProblem, setCurrentProblem] = useState<CNFProblem | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  
  // Legacy SAT problem state (for backward compatibility with simple generator)
  const [clauseCities, setClauseCities] = useState<Point[]>([]);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [solutionAssignment, setSolutionAssignment] = useState<Map<number, boolean>>(new Map()); // Map<city.num, isVisited>

  const { spiralPoints } = useSquareSpiral(VISUAL_SPIRAL_POINTS);

  const currentTargetPointDetails = useMemo<PointWithDetails>(
    () => getPointDetails(targetN),
    [targetN]
  );

  const pathPoints = useMemo(() => path.map(n => getPointDetails(n)), [path]);
  
  // Certificate path - points to visit based on solver solution
  const certificatePath = useMemo<Point[]>(() => {
    if (!currentProblem || !certificate || !certificate.assignment) return [];
    
    // Extract all unique variable numbers from the problem
    const variableSet = new Set<number>();
    currentProblem.clauses.forEach(clause => {
      clause.forEach(literal => {
        variableSet.add(literal.city.num);
      });
    });
    
    const variables = Array.from(variableSet).sort((a, b) => a - b);
    
    // Get points for variables that are true in the assignment
    const truePoints: Point[] = [];
    variables.forEach((varNum, idx) => {
      if (idx < certificate.assignment.length && certificate.assignment[idx]) {
        truePoints.push(calculateSpiralPoint(varNum));
      }
    });
    
    return truePoints;
  }, [currentProblem, certificate]);
  
  // Overlay placement configuration - use currentProblem if available, otherwise use legacy state
  const overlayPlacementConfig = useMemo<OverlayPlacementConfig>(() => {
    // If we have a formal CNF problem, use that
    if (currentProblem) {
      return cnfToOverlay(currentProblem, certificate);
    }
    
    // Otherwise use legacy state (simple SAT generator)
    const mustVisit = clauseCities.filter(p => solutionAssignment.get(p.num) === true);
    const mustAvoid = clauseCities.filter(p => solutionAssignment.get(p.num) === false);
    
    return {
      mustVisit,
      mustAvoid,
      mustStartAt: mustVisit.length > 0 ? mustVisit[0] : undefined,
      mustEndAt: mustVisit.length > 1 ? mustVisit[mustVisit.length - 1] : undefined,
    };
  }, [currentProblem, certificate, clauseCities, solutionAssignment]);
  
  const scaleChangePoints = useMemo<Point[]>(() => {
    const markerNumbers = new Set<number>();
    for (let k = 1; ; k++) {
      const marker = Math.pow(2 * k - 1, 2);
      if (marker >= VISUAL_SPIRAL_POINTS) break;
      markerNumbers.add(marker);
    }
    return spiralPoints.filter(p => markerNumbers.has(p.num));
  }, [spiralPoints]);

  const { solutionPath, totalSolutionEntropy } = useMemo(() => {
    if (solutionAssignment.size === 0) {
      return { solutionPath: [], totalSolutionEntropy: 0 };
    }

    const hitPoints = clauseCities
      .filter(p => solutionAssignment.get(p.num) === true)
      .sort((a, b) => a.num - b.num);

    if (hitPoints.length < 2) {
      return { solutionPath: hitPoints, totalSolutionEntropy: 0 };
    }

    let totalEntropy = 0;
    for (let i = 0; i < hitPoints.length - 1; i++) {
      const p1 = hitPoints[i];
      const p2 = hitPoints[i + 1];
      totalEntropy += Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
    }

    return { solutionPath: hitPoints, totalSolutionEntropy: totalEntropy };
  }, [clauseCities, solutionAssignment]);

  const handleNChange = (newN: number) => {
    let n = isNaN(newN) ? 0 : newN;
    n = Math.max(0, n);
    if (n > Number.MAX_SAFE_INTEGER) {
      n = Number.MAX_SAFE_INTEGER;
    }
    setTargetN(n);
  };
  
  const handleAddToPath = (n: number) => {
    setPath(prev => [...prev, n]);
  };

  const handleRemoveFromPath = (indexToRemove: number) => {
    setPath(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleClearPath = () => {
    setPath([]);
  };

  const handleOverlayTypeChange = (type: OverlayType) => {
    setOverlayType(type);
    // Adjust spiral opacity based on overlay type
    if (type === 'none') {
      setSpiralOpacity(1.0);
    } else if (spiralOpacity > 0.8) {
      setSpiralOpacity(0.3);
    }
  };

  const handleSpiralOpacityChange = (opacity: number) => {
    setSpiralOpacity(opacity);
  };

  const handleProblemChange = (problem: CNFProblem | null) => {
    setCurrentProblem(problem);
    setCertificate(null);
    setSolverResult(null);
    // Clear legacy state when using formal problem
    if (problem) {
      setClauseCities([]);
      setClauses([]);
      setSolutionAssignment(new Map());
      
      // Auto-detect Sudoku and set overlay
      if (isSudokuProblem(problem)) {
        setOverlayType('sudoku');
      } else if (problem.suggestedOverlay) {
        setOverlayType(problem.suggestedOverlay);
      }
    }
  };

  const handleCertificateChange = (cert: Certificate | null) => {
    setCertificate(cert);
  };

  const handleSolverResult = (result: SolverResult) => {
    setSolverResult(result);
    if (result.certificate) {
      setCertificate(result.certificate);
    }
  };

  const handleStartSolving = () => {
    setIsSolving(true);
  };

  const handleSolvingComplete = () => {
    setIsSolving(false);
  };

  const generateCnfProblem = () => {
    if (spiralPoints.length < NUM_CLAUSE_CITIES) return;

    // 1. Pick a pool of unique cities
    const cityPool: Point[] = [];
    const usedIndices = new Set<number>();
    while (cityPool.length < NUM_CLAUSE_CITIES) {
      const randomIndex = Math.floor(Math.random() * spiralPoints.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        cityPool.push(spiralPoints[randomIndex]);
      }
    }
    setClauseCities(cityPool);

    // 2. Decide the "ground truth" solution assignment (which cities to visit/avoid)
    const assignment = new Map<number, boolean>();
    cityPool.forEach(city => {
      assignment.set(city.num, Math.random() > 0.5);
    });
    setSolutionAssignment(assignment);
    
    // 3. Generate clauses that are consistent with this solution
    const newClauses: Clause[] = [];
    for (let i = 0; i < NUM_CLAUSES; i++) {
      let clauseIsSatisfying = false;
      while (!clauseIsSatisfying) {
        const clauseLiterals: Literal[] = [];
        const pickedCities: Point[] = [];
        while(pickedCities.length < 3) {
            const randomCity = cityPool[Math.floor(Math.random() * cityPool.length)];
            if (!pickedCities.find(p => p.num === randomCity.num)) {
                pickedCities.push(randomCity);
            }
        }

        for (const city of pickedCities) {
            clauseLiterals.push({ city, positive: Math.random() > 0.5 });
        }
        
        // Check if this random clause is satisfied by our ground truth `assignment`
        for (const literal of clauseLiterals) {
          const cityIsVisited = assignment.get(literal.city.num)!;
          if ((literal.positive && cityIsVisited) || (!literal.positive && !cityIsVisited)) {
            clauseIsSatisfying = true;
            break;
          }
        }

        if (clauseIsSatisfying) {
          newClauses.push(clauseLiterals);
        }
      }
    }
    setClauses(newClauses);
    
    // Create a certificate from the solution assignment
    const assignmentArray = cityPool.map(city => assignment.get(city.num) || false);
    const cert: Certificate = {
      assignment: assignmentArray,
      witnessLiterals: [],
      complexity: 0
    };
    
    // Also create a formal CNFProblem from this with certificate
    const problem = simpleCnfToProblem(cityPool, newClauses, 'Generated SAT Problem', cert);
    setCurrentProblem(problem);
    setCertificate(cert);
  };

  const handleStart = () => {
    setShowIntro(false);
  };

  // Unified render (no more separate visualizer/test center views)
  const renderUnified = () => (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col p-4 lg:p-6 font-sans">
      <header className="text-center mb-6">
        <h1 className="text-4xl lg:text-5xl font-bold text-cyan-400 tracking-tight">The Address is the Map</h1>
        <p className="text-slate-400 mt-2 max-w-3xl mx-auto">
          An interactive visualization showing how addresses encode paths. Explore pre-built problems or generate your own CNF constraints.
        </p>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Column 1-2: Spiral Map Visualization */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-lg shadow-2xl p-4 flex items-start justify-center">
          <div className="w-full aspect-square max-h-[calc(100vh-12rem)]">
            {currentTargetPointDetails && (
              <GridVisualization 
                spiralPoints={spiralPoints} 
                targetPoint={currentTargetPointDetails}
                scaleChangePoints={scaleChangePoints}
                onPointSelect={handleNChange}
                clauseCities={clauseCities}
                solutionAssignment={solutionAssignment}
                solutionPath={solutionPath}
                pathPoints={pathPoints}
                certificatePath={certificatePath}
                overlayType={overlayType}
                spiralOpacity={spiralOpacity}
                overlayPlacementConfig={overlayPlacementConfig}
                currentProblem={currentProblem}
                certificate={certificate}
              />
            )}
          </div>
        </div>

        {/* Column 2: Problem Specification + Solver Interface */}
        <div className="flex flex-col gap-6">
          {/* Solver Interface */}
          <div className="bg-slate-800/50 rounded-lg shadow-xl p-4">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Solver</h2>
            <SolverInterface
              problem={currentProblem}
              onResult={handleSolverResult}
              onStartSolving={handleStartSolving}
              onCompleteSolving={handleSolvingComplete}
              isSolving={isSolving}
            />
          </div>

          {/* NP-Complete Results Badge */}
          {currentProblem && (
            <NPCompleteResultsBadge
              problem={currentProblem}
              result={solverResult}
              certificate={certificate}
            />
          )}

          {/* Clause Display */}
          {currentProblem && (
            <div className="bg-slate-800/50 rounded-lg shadow-xl p-4">
              <ClauseDisplay
                problem={currentProblem}
                certificate={certificate}
                isSolving={isSolving}
              />
            </div>
          )}

          {/* Problem Library */}
          <div className="bg-slate-800/50 rounded-lg shadow-xl p-4">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">Problem Library</h2>
            <ProblemSpecification
              onProblemChange={handleProblemChange}
              onCertificateChange={handleCertificateChange}
              currentProblem={currentProblem}
              currentCertificate={certificate}
            />
          </div>
        </div>

        {/* Column 3: SAT Controls + Path Calculator + Overlay Controls */}
        <div className="flex flex-col gap-6">
          <OverlayControls
            overlayType={overlayType}
            onOverlayTypeChange={handleOverlayTypeChange}
            spiralOpacity={spiralOpacity}
            onSpiralOpacityChange={handleSpiralOpacityChange}
          />
          <Controls 
            targetN={targetN} 
            onNChange={handleNChange} 
            maxN={Number.MAX_SAFE_INTEGER}
            targetPointDetails={currentTargetPointDetails} 
            onGenerateCnf={generateCnfProblem}
            totalSolutionEntropy={totalSolutionEntropy}
            clauses={clauses}
            onAddToPath={handleAddToPath}
          />
          <PathCalculator 
            path={path} 
            onRemovePathItem={handleRemoveFromPath} 
            onClearPath={handleClearPath} 
          />
        </div>
      </main>

      <footer className="text-center mt-6 text-slate-500 text-sm">
        <p>The existence of an address implies an analytical map, bypassing the need for an exhaustive search. P=NP.</p>
      </footer>
      
      <ChatIcon onClick={() => setIsChatOpen(true)} />
      {isChatOpen && <Chat onClose={() => setIsChatOpen(false)} />}
    </div>
  );

  return (
    <>
      <IntroModal 
        show={showIntro} 
        onClose={handleStart}
      />

      {/* Main Content - Unified View */}
      {renderUnified()}
    </>
  );
}

export default App;