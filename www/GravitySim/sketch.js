/**
 * EGPT Discrete Stochastic Gravity Simulation
 * Based on Electronic Graph Paper Theory principles
 * 
 * This simulation models two particle swarms (m1 and m2) performing
 * random walks toward the center of a C x C grid space.
 */

// ##########################################################################
// # SIMULATION PARAMETERS (User can modify these)
// ##########################################################################

// Grid size - the universe will be C x C
let C = 100;

// Starting distance between masses (independent of C, but capped at C)
let r = 50; // Distance between mass centers

// Masses - number of particles spawned per tick from each side
let m1 = 5;  // Particles from left side
let m2 = 5;  // Particles from right side

// Visual parameters
let cellSize = 6;
let canvasSize = 600;
let uiHeight = 300; // Height for UI area below simulation (increased even more for clearance)
let infoWidth = 300; // Width for info panel on the right

// Simulation speed control
let simulationSpeed = 5; // ticks per second
let lastUpdateTime = 0;

// ##########################################################################
// # SIMULATION STATE
// ##########################################################################

let currentTick = 0;
let particles = [];
let collisionCount = 0;
let totalInteractions = 0;
let isRunning = false;
let targetTick = 0; // Target tick to run to (will be set to C each time)

// Grid to track particle positions (for collision detection)
let grid = {};

// Page management
let currentPage = 'simulation'; // 'simulation' or 'analysis'

// Controls panel visibility
let controlsCollapsed = false;

// Analysis data storage
let analysisData = {
  runs: [], // Store data from each simulation run
  currentRun: null
};

// ##########################################################################
// # PARTICLE CLASS
// ##########################################################################

class Particle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'm1' or 'm2'
    this.birthTick = currentTick;
    this.active = true;
  }

  // Random walk movement based on particle type
  move() {
    if (!this.active) return;

    let newX = this.x;
    let newY = this.y;

    // Both m1 and m2 particles can now move in all 8 directions
    let movements = [
      {dx: 0, dy: -1},   // up
      {dx: -1, dy: -1},  // left-up
      {dx: -1, dy: 0},   // left
      {dx: -1, dy: 1},   // left-down
      {dx: 0, dy: 1},    // down
      {dx: 1, dy: 1},    // right-down
      {dx: 1, dy: 0},    // right
      {dx: 1, dy: -1}    // right-up
    ];
    
    let movement = movements[Math.floor(random() * movements.length)];
    newX = this.x + movement.dx;
    newY = this.y + movement.dy;

    // Boundary checks - remove particle if it goes out of bounds
    if (newX < 0 || newX >= C || newY < 0 || newY >= C) {
      this.active = false;
      return;
    }

    this.x = newX;
    this.y = newY;
  }

  draw() {
    if (!this.active) return;

    let screenX = (this.x / C) * canvasSize;
    let screenY = (this.y / C) * canvasSize;
    
    if (this.type === 'm1') {
      fill(100, 150, 255); // Blue for m1
    } else {
      fill(255, 150, 100); // Orange for m2
    }
    
    noStroke();
    rect(screenX, screenY, cellSize, cellSize);
  }
}

// ##########################################################################
// # P5.JS SETUP AND DRAW FUNCTIONS
// ##########################################################################

function setup() {
  createCanvas(canvasSize + infoWidth, canvasSize + uiHeight); // Canvas with UI below and info on right
  
  // Create UI controls
  createControls();
  
  // Initialize simulation
  resetSimulation();
}

function draw() {
  background(20);
  
  if (currentPage === 'simulation') {
    drawSimulationPage();
  } else if (currentPage === 'analysis') {
    drawAnalysisPage();
  }
  
  // Update control panel visibility based on current page
  updateControlsVisibility();
  
  // Update collapse state
  updateControlsCollapse();
}

function drawSimulationPage() {
  // Draw grid lines (optional, can be toggled)
  drawGrid();
  
  // Run simulation if active with speed control
  if (isRunning && currentTick < targetTick) {
    let currentTime = millis();
    if (currentTime - lastUpdateTime > (1000 / simulationSpeed)) {
      runSimulationStep();
      lastUpdateTime = currentTime;
    }
  }
  
  // Draw all active particles with overlap detection
  drawParticlesWithOverlap();
  
  // Draw UI information
  drawUI();
}

// ##########################################################################
// # SIMULATION LOGIC
// ##########################################################################

function runSimulationStep() {
  // Spawn new particles for this tick
  spawnParticles();
  
  // Move all existing particles
  for (let particle of particles) {
    particle.move();
  }
  
  // Check for collisions
  checkCollisions();
  
  // Remove inactive particles
  particles = particles.filter(p => p.active);
  
  currentTick++;
  
  // Stop simulation when reaching target tick
  if (currentTick >= targetTick) {
    isRunning = false;
    // Collect analysis data at the end of the run
    collectAnalysisData();
  }
}

function spawnParticles() {
  // Only spawn particles on the first tick
  if (currentTick !== 0) {
    return;
  }
  
  // Calculate spawn positions based on r (distance between masses)
  // Center the masses around the middle of the grid with distance r between them
  let centerX = Math.floor(C / 2);
  let centerY = Math.floor(C / 2);
  
  // Ensure r doesn't exceed C (capped at C = r)
  let effectiveR = Math.min(r, C);
  
  // Position masses r/2 distance from center on each side
  let leftSpawnX = Math.max(0, Math.min(C - 1, centerX - Math.floor(effectiveR / 2)));
  let rightSpawnX = Math.max(0, Math.min(C - 1, centerX + Math.floor(effectiveR / 2)));
  
  // Spawn C² × m1 particles from left position
  let totalM1Particles = C * C * m1;
  
  for (let i = 0; i < totalM1Particles; i++) {
    // Add some randomness to initial y position around center
    let spawnY = centerY + Math.floor(random(-2, 3));
    spawnY = Math.max(0, Math.min(C - 1, spawnY)); // Keep in bounds
    particles.push(new Particle(leftSpawnX, spawnY, 'm1'));
  }
  
  // Spawn C² × m2 particles from right position
  let totalM2Particles = C * C * m2;
  
  for (let i = 0; i < totalM2Particles; i++) {
    // Add some randomness to initial y position around center
    let spawnY = centerY + Math.floor(random(-2, 3));
    spawnY = Math.max(0, Math.min(C - 1, spawnY)); // Keep in bounds
    particles.push(new Particle(rightSpawnX, spawnY, 'm2'));
  }
}

function checkCollisions() {
  // Build position map for collision detection
  let positionMap = {};
  
  // Map all particle positions
  for (let particle of particles) {
    if (!particle.active) continue;
    
    let key = `${particle.x},${particle.y}`;
    if (!positionMap[key]) {
      positionMap[key] = [];
    }
    positionMap[key].push(particle);
  }
  
  // Check for collisions (same position, different types)
  for (let position in positionMap) {
    let particlesAtPosition = positionMap[position];
    
    if (particlesAtPosition.length > 1) {
      // Check if we have both m1 and m2 particles at the same position
      let hasM1 = particlesAtPosition.some(p => p.type === 'm1');
      let hasM2 = particlesAtPosition.some(p => p.type === 'm2');
      
      if (hasM1 && hasM2) {
        collisionCount++;
        totalInteractions++;
        
        // Mark colliding particles (visual feedback)
        for (let particle of particlesAtPosition) {
          particle.collided = true;
        }
      }
    }
  }
}

// ##########################################################################
// # ANALYSIS DATA COLLECTION
// ##########################################################################

function collectAnalysisData() {
  // Create column distribution data
  let m1Distribution = new Array(C).fill(0);
  let m2Distribution = new Array(C).fill(0);
  let overlapDistribution = new Array(C).fill(0);
  
  // Build position map to detect overlaps
  let positionMap = {};
  
  // Map all active particle positions
  for (let particle of particles) {
    if (!particle.active) continue;
    
    let key = `${particle.x},${particle.y}`;
    if (!positionMap[key]) {
      positionMap[key] = [];
    }
    positionMap[key].push(particle);
  }
  
  // Count particles in each column
  for (let position in positionMap) {
    let particlesAtPosition = positionMap[position];
    let coords = position.split(',');
    let x = parseInt(coords[0]);
    
    let hasM1 = particlesAtPosition.some(p => p.type === 'm1');
    let hasM2 = particlesAtPosition.some(p => p.type === 'm2');
    
    // Count individual particle types
    let m1Count = particlesAtPosition.filter(p => p.type === 'm1').length;
    let m2Count = particlesAtPosition.filter(p => p.type === 'm2').length;
    
    m1Distribution[x] += m1Count;
    m2Distribution[x] += m2Count;
    
    // Count overlaps (positions where both types exist)
    if (hasM1 && hasM2) {
      overlapDistribution[x] += 1; // Count as one overlap event per position
    }
  }
  
  // Store the run data
  let runData = {
    runNumber: analysisData.runs.length + 1,
    parameters: {
      C: C,
      r: r,
      m1: m1,
      m2: m2,
      totalM1Particles: C * C * m1,
      totalM2Particles: C * C * m2
    },
    distributions: {
      m1: m1Distribution,
      m2: m2Distribution,
      overlaps: overlapDistribution
    },
    stats: {
      totalCollisions: collisionCount,
      finalActiveParticles: particles.filter(p => p.active).length
    }
  };
  
  analysisData.runs.push(runData);
  analysisData.currentRun = runData;
}

// ##########################################################################
// # DRAWING FUNCTIONS
// ##########################################################################

function drawParticlesWithOverlap() {
  // Build position map to detect overlaps
  let positionMap = {};
  
  // Map all active particle positions
  for (let particle of particles) {
    if (!particle.active) continue;
    
    let key = `${particle.x},${particle.y}`;
    if (!positionMap[key]) {
      positionMap[key] = [];
    }
    positionMap[key].push(particle);
  }
  
  // Draw particles based on overlap status
  for (let position in positionMap) {
    let particlesAtPosition = positionMap[position];
    let coords = position.split(',');
    let x = parseInt(coords[0]);
    let y = parseInt(coords[1]);
    
    let screenX = (x / C) * canvasSize;
    let screenY = (y / C) * canvasSize;
    
    if (particlesAtPosition.length > 1) {
      // Check if we have both m1 and m2 particles at the same position
      let hasM1 = particlesAtPosition.some(p => p.type === 'm1');
      let hasM2 = particlesAtPosition.some(p => p.type === 'm2');
      
      if (hasM1 && hasM2) {
        // Opposing masses at same position - draw purple
        fill(200, 100, 255); // Purple for opposing mass overlaps
      } else {
        // Same mass type overlapping - use original color of that type
        let particle = particlesAtPosition[0];
        if (particle.type === 'm1') {
          fill(100, 150, 255); // Blue for m1
        } else {
          fill(255, 150, 100); // Orange for m2
        }
      }
    } else {
      // Single particle - use original color
      let particle = particlesAtPosition[0];
      if (particle.type === 'm1') {
        fill(100, 150, 255); // Blue for m1
      } else {
        fill(255, 150, 100); // Orange for m2
      }
    }
    
    noStroke();
    rect(screenX, screenY, cellSize, cellSize);
  }
}

function drawAnalysisPage() {
  fill(255);
  textFont('monospace');
  textSize(16);
  
  // Page title and back button
  fill(100, 255, 100);
  text('SIMULATION ANALYSIS', 50, 40);
  
  // Back button
  fill(60, 60, 60);
  stroke(120);
  strokeWeight(1);
  rect(width - 120, 20, 100, 30);
  fill(255);
  textSize(12);
  text('← Back', width - 110, 40);
  
  if (analysisData.runs.length === 0) {
    fill(255);
    textSize(14);
    text('No simulation data available. Run a simulation first.', 50, 80);
    text('Click "Back" or press \'S\' to return to simulation page.', 50, 100);
    return;
  }
  
  let currentRun = analysisData.currentRun || analysisData.runs[analysisData.runs.length - 1];
  
  // Run information
  fill(200, 200, 100);
  textSize(14);
  text(`Run #${currentRun.runNumber} - Parameters: C=${currentRun.parameters.C}, r=${currentRun.parameters.r}, m1=${currentRun.parameters.m1}, m2=${currentRun.parameters.m2}`, 50, 70);
  text(`Total Particles: m1=${currentRun.parameters.totalM1Particles}, m2=${currentRun.parameters.totalM2Particles}`, 50, 90);
  text(`Final Stats: ${currentRun.stats.totalCollisions} collisions, ${currentRun.stats.finalActiveParticles} particles remaining`, 50, 110);
  
  // Collision analysis metrics calculated for later display
  let collisionsPerC2 = currentRun.stats.totalCollisions / (currentRun.parameters.C * currentRun.parameters.C);
  let collisionsPerR2 = currentRun.stats.totalCollisions / (currentRun.parameters.r * currentRun.parameters.r);
  
  // Chart dimensions - adjust for controls panel at bottom
  let chartWidth = width - 100;
  let chartHeight = 140; // Reduced to make room for controls
  let chartStartY = 140; // Back to original position
  let availableHeight = height - 250; // Leave space for controls panel
  let spacing = Math.min(40, (availableHeight - 3 * chartHeight) / 3); // Dynamic spacing
  
  // Draw three distribution charts with calculated spacing
  drawDistributionChart(currentRun.distributions.m1, 'M1 Particle Distribution', 
                       50, chartStartY, chartWidth, chartHeight, color(100, 150, 255));
  
  drawDistributionChart(currentRun.distributions.m2, 'M2 Particle Distribution', 
                       50, chartStartY + chartHeight + spacing, chartWidth, chartHeight, color(255, 150, 100));
  
  drawDistributionChart(currentRun.distributions.overlaps, 'Overlap Distribution', 
                       50, chartStartY + 2 * (chartHeight + spacing), chartWidth, chartHeight, color(200, 100, 255));
  
  // Collision analysis metrics - positioned below the charts
  let analysisY = chartStartY + 3 * chartHeight + 2 * spacing + 200; // 200px below charts
  fill(255, 200, 100); // Different color for analysis metrics
  textSize(14);
  text(`Total Collision Analysis: Collisions/C² = ${collisionsPerC2.toFixed(6)}, Collisions/r² = ${collisionsPerR2.toFixed(6)}`, 50, analysisY);
  
  // Current collision analysis (collisions happening at final tick)
  // Count current overlaps from the overlap distribution
  let currentOverlapCount = currentRun.distributions.overlaps.reduce((sum, count) => sum + count, 0);
  let currentCollisionsPerC2 = currentOverlapCount / (currentRun.parameters.C * currentRun.parameters.C);
  let currentCollisionsPerR2 = currentOverlapCount / (currentRun.parameters.r * currentRun.parameters.r);
  
  fill(100, 255, 200); // Different color for current analysis metrics
  text(`Current Collision Analysis: Collisions/C² = ${currentCollisionsPerC2.toFixed(6)}, Collisions/r² = ${currentCollisionsPerR2.toFixed(6)}`, 50, analysisY + 20);
  
  // Navigation instructions - positioned to not conflict with controls
  fill(255);
  textSize(12);
  text('Controls: S - Return to Simulation | R - Run History | Click "Back" button | Use controls below to adjust parameters', 50, height - 230);
}

function drawDistributionChart(distribution, title, x, y, w, h, chartColor) {
  // Chart background
  fill(40, 40, 40);
  stroke(80);
  strokeWeight(1);
  rect(x, y, w, h);
  
  // Title
  fill(255);
  textSize(12);
  text(title, x + 10, y - 5);
  
  if (distribution.length === 0) return;
  
  // Find max value for scaling
  let maxValue = Math.max(...distribution);
  if (maxValue === 0) maxValue = 1; // Prevent division by zero
  
  // Draw bars
  let barWidth = w / distribution.length;
  
  for (let i = 0; i < distribution.length; i++) {
    if (distribution[i] > 0) {
      let barHeight = (distribution[i] / maxValue) * (h - 20);
      
      fill(chartColor);
      noStroke();
      rect(x + i * barWidth, y + h - barHeight, barWidth - 1, barHeight);
      
      // Show value on hover (simplified - show all values > threshold)
      if (distribution[i] > maxValue * 0.1) { // Only show significant values
        fill(255);
        textSize(8);
        text(distribution[i], x + i * barWidth + 2, y + h - barHeight - 2);
      }
    }
  }
  
  // X-axis labels (column numbers)
  fill(150);
  textSize(8);
  for (let i = 0; i < distribution.length; i += Math.floor(distribution.length / 10)) {
    text(i, x + i * barWidth, y + h + 12);
  }
  
  // Y-axis max value
  fill(150);
  text(`Max: ${maxValue}`, x + w - 60, y + 15);
}

function updateControlsVisibility() {
  let controlPanel = select('#controls');
  if (controlPanel) {
    if (currentPage === 'simulation') {
      controlPanel.style('display', 'block');
      // Position for simulation page
      controlPanel.style('top', (canvasSize + 80) + 'px');
      controlPanel.style('left', '20px');
      controlPanel.style('width', (canvasSize - 40) + 'px');
    } else if (currentPage === 'analysis') {
      controlPanel.style('display', 'block');
      // Position for analysis page - at the bottom
      controlPanel.style('top', (height - 200) + 'px');
      controlPanel.style('left', '50px');
      controlPanel.style('width', (width - 100) + 'px');
    }
  }
}

function updateControlsCollapse() {
  let contentContainer = select('#controlsContent');
  let collapseButton = select('#collapseButton');
  let controlPanel = select('#controls');
  
  if (contentContainer && collapseButton && controlPanel) {
    // Only show collapse functionality on simulation page
    if (currentPage === 'simulation') {
      collapseButton.style('display', 'block');
      if (controlsCollapsed) {
        contentContainer.style('display', 'none');
        collapseButton.html('Show Controls');
        controlPanel.style('height', '50px'); // Just enough for the button
      } else {
        contentContainer.style('display', 'block');
        collapseButton.html('Hide Controls');
        controlPanel.style('height', 'auto'); // Let it expand to full height
      }
    } else {
      // On analysis page, always show content and hide collapse button
      collapseButton.style('display', 'none');
      contentContainer.style('display', 'block');
      controlPanel.style('height', 'auto');
    }
  }
}

// ##########################################################################
// # UI AND CONTROLS
// ##########################################################################

function createControls() {
  // Create control panel that will be repositioned based on current page
  let controlPanel = createDiv().id('controls');
  controlPanel.style('position', 'absolute');
  controlPanel.style('color', 'white');
  controlPanel.style('font-family', 'monospace');
  controlPanel.style('background-color', '#222');
  controlPanel.style('border', '1px solid #444');
  controlPanel.style('border-radius', '8px');
  controlPanel.style('padding', '20px');
  
  // Add collapse button at the top right of the panel (only visible on simulation page)
  let collapseButton = createButton(controlsCollapsed ? 'Show Controls' : 'Hide Controls');
  collapseButton.parent(controlPanel);
  collapseButton.style('position', 'absolute');
  collapseButton.style('top', '10px');
  collapseButton.style('right', '10px');
  collapseButton.style('width', '120px');
  collapseButton.style('height', '25px');
  collapseButton.style('font-size', '10px');
  collapseButton.mousePressed(() => {
    controlsCollapsed = !controlsCollapsed;
    updateControlsCollapse();
  });
  collapseButton.id('collapseButton');
  
  // Create content container that can be hidden/shown
  let contentContainer = createDiv().parent(controlPanel).id('controlsContent');
  contentContainer.style('margin-top', '20px'); // Space for collapse button
  
  // Create a grid layout for controls (now only 2 columns for parameters)
  let controlsGrid = createDiv().parent(contentContainer);
  controlsGrid.style('display', 'grid');
  controlsGrid.style('grid-template-columns', '1fr 1fr');
  controlsGrid.style('gap', '40px');
  controlsGrid.style('margin-bottom', '10px');
  
  // Column 1: Speed and Grid Size
  let col1 = createDiv().parent(controlsGrid);
  col1.style('padding', '10px');
  
  createP('SIMULATION SPEED').parent(col1).style('color', '#4CAF50').style('font-weight', 'bold').style('margin', '0 0 10px 0');
  createP('Ticks per second:').parent(col1).style('color', 'white').style('margin', '5px 0');
  let speedSlider = createSlider(1, 30, simulationSpeed, 1);
  speedSlider.parent(col1);
  speedSlider.style('width', '100%');
  speedSlider.input(() => { simulationSpeed = speedSlider.value(); });
  createP(`Current: ${simulationSpeed} ticks/sec`).parent(col1).style('color', '#ccc').style('margin', '5px 0 20px 0').id('speedDisplay');
  
  createP('GRID SIZE').parent(col1).style('color', '#4CAF50').style('font-weight', 'bold').style('margin', '0 0 10px 0');
  createP('Universe size (C):').parent(col1).style('color', 'white').style('margin', '5px 0');
  let cSlider = createSlider(50, 200, C, 10);
  cSlider.parent(col1);
  cSlider.style('width', '100%');
  cSlider.input(() => { 
    C = cSlider.value(); 
    // Ensure r doesn't exceed C
    if (r > C) {
      r = C;
      rSlider.value(r);
    }
    resetSimulation(); 
  });
  
  createP('DISTANCE').parent(col1).style('color', '#4CAF50').style('font-weight', 'bold').style('margin', '15px 0 10px 0');
  createP('Mass separation (r):').parent(col1).style('color', 'white').style('margin', '5px 0');
  let rSlider = createSlider(10, 200, r, 5);
  rSlider.parent(col1);
  rSlider.style('width', '100%');
  rSlider.input(() => { 
    r = Math.min(rSlider.value(), C); // Cap r at C
    rSlider.value(r); // Update slider if capped
  });
  
  // Column 2: Particle Masses
  let col2 = createDiv().parent(controlsGrid);
  col2.style('padding', '10px');
  
  createP('PARTICLE MASSES').parent(col2).style('color', '#4CAF50').style('font-weight', 'bold').style('margin', '0 0 10px 0');
  createP('m1 (Left mass multiplier):').parent(col2).style('color', 'white').style('margin', '5px 0');
  let m1Slider = createSlider(1, 5, m1, 1);
  m1Slider.parent(col2);
  m1Slider.style('width', '100%');
  m1Slider.input(() => { m1 = m1Slider.value(); });
  
  createP('m2 (Right mass multiplier):').parent(col2).style('color', 'white').style('margin', '15px 0 5px 0');
  let m2Slider = createSlider(1, 5, m2, 1);
  m2Slider.parent(col2);
  m2Slider.style('width', '100%');
  m2Slider.input(() => { m2 = m2Slider.value(); });
  
  // Add control buttons below the sliders in a centered row
  let buttonRow = createDiv().parent(contentContainer);
  buttonRow.style('display', 'flex');
  buttonRow.style('justify-content', 'center');
  buttonRow.style('gap', '15px');
  buttonRow.style('margin-top', '20px');
  
  let startButton = createButton('Start/Resume');
  startButton.parent(buttonRow);
  startButton.style('width', '120px');
  startButton.mousePressed(() => { 
    // Always run for C ticks from current position
    targetTick = currentTick + C;
    isRunning = true; 
  });
  
  let pauseButton = createButton('Pause');
  pauseButton.parent(buttonRow);
  pauseButton.style('width', '120px');
  pauseButton.mousePressed(() => { isRunning = false; });
  
  let resetButton = createButton('Reset');
  resetButton.parent(buttonRow);
  resetButton.style('width', '120px');
  resetButton.mousePressed(resetSimulation);
  
  let analysisButton = createButton('Analysis');
  analysisButton.parent(buttonRow);
  analysisButton.style('width', '120px');
  analysisButton.mousePressed(() => { currentPage = 'analysis'; });
  
  // Update speed display function
  speedSlider.input(() => { 
    simulationSpeed = speedSlider.value(); 
    select('#speedDisplay').html(`Current: ${simulationSpeed} ticks/sec`);
  });
  
  // Initialize collapse state
  updateControlsCollapse();
}

function drawGrid() {
  stroke(40);
  strokeWeight(1);
  
  // Draw vertical lines (only in simulation area)
  for (let i = 0; i <= C; i += 10) {
    let x = (i / C) * canvasSize;
    line(x, 0, x, canvasSize);
  }
  
  // Draw horizontal lines (only in simulation area)
  for (let j = 0; j <= C; j += 10) {
    let y = (j / C) * canvasSize;
    line(0, y, canvasSize, y);
  }
  
  // Draw border around simulation area
  stroke(80);
  strokeWeight(2);
  noFill();
  rect(0, 0, canvasSize, canvasSize);
}

function drawUI() {
  // Draw information panels on the right side of the simulation
  fill(255);
  textFont('monospace');
  textSize(12);
  
  let infoStartX = canvasSize + 20;
  let infoStartY = 30;
  
  // Create status info background (top right)
  fill(40, 40, 40);
  stroke(80);
  strokeWeight(1);
  rect(infoStartX - 10, infoStartY - 20, infoWidth - 20, 200);
  
  let statusInfo = [
    `SIMULATION STATUS`,
    ``,
    `Parameters:`,
    `Grid Size (C): ${C}`,
    `Distance (r): ${r}`,
    `m1 (Left): ${m1} (${C * C * m1} particles)`,
    `m2 (Right): ${m2} (${C * C * m2} particles)`,
    `Speed: ${simulationSpeed} ticks/sec`,
    ``,
    `Current State:`,
    `Tick: ${currentTick} / ${targetTick}`,
    `Target Tick: ${targetTick}`,
    `Active Particles: ${particles.filter(p => p.active).length}`,
    `Total Collisions: ${collisionCount}`,
    `Status: ${isRunning ? 'Running' : (currentTick >= targetTick ? 'Completed' : 'Paused')}`
  ];
  
  // Draw status title with different color
  fill(100, 255, 100);
  text(statusInfo[0], infoStartX, infoStartY);
  
  // Draw rest of status info
  fill(255);
  for (let i = 1; i < statusInfo.length; i++) {
    if (statusInfo[i].includes('Parameters:') || statusInfo[i].includes('Current State:')) {
      fill(200, 200, 100);
    } else {
      fill(255);
    }
    text(statusInfo[i], infoStartX, infoStartY + i * 14);
  }
  
  // Draw theoretical analysis panel (bottom right)
  let analysisStartY = 260;
  
  // Create analysis background
  fill(40, 40, 40);
  stroke(80);
  strokeWeight(1);
  rect(infoStartX - 10, analysisStartY - 20, infoWidth - 20, 160);
  
  let analysisInfo = [
    `THEORETICAL ANALYSIS`,
    ``,
    `Expected interaction ∝ (m1 × m2) / r²`,
    `Where r relates to distance`,
    ``,
    `EGPT Principle:`,
    `Force = Shannon Entropy`,
    ``,
    `Controls:`,
    `SPACEBAR: Pause/Resume`,
    `R: Reset simulation`,
    `A: View Analysis`,
    `C: Toggle Controls`
  ];
  
  // Draw analysis title
  fill(100, 255, 100);
  text(analysisInfo[0], infoStartX, analysisStartY);
  
  // Draw analysis content
  fill(255);
  for (let i = 1; i < analysisInfo.length; i++) {
    if (analysisInfo[i].includes('EGPT Principle:') || analysisInfo[i].includes('Controls:')) {
      fill(200, 200, 100);
    } else {
      fill(255);
    }
    text(analysisInfo[i], infoStartX, analysisStartY + i * 14);
  }
}

function resetSimulation() {
  currentTick = 0;
  particles = [];
  collisionCount = 0;
  totalInteractions = 0;
  isRunning = false;
  targetTick = C; // Reset target tick to C
  
  // Recalculate cell size based on new C value
  cellSize = Math.max(2, Math.floor(canvasSize / C * 0.8));
}

// ##########################################################################
// # KEYBOARD CONTROLS
// ##########################################################################

function keyPressed() {
  if (currentPage === 'simulation') {
    if (key === ' ') {
      isRunning = !isRunning;
    } else if (key === 'r' || key === 'R') {
      resetSimulation();
    } else if (key === 'a' || key === 'A') {
      currentPage = 'analysis';
    } else if (key === 'c' || key === 'C') {
      controlsCollapsed = !controlsCollapsed;
      updateControlsCollapse();
    }
  } else if (currentPage === 'analysis') {
    if (key === 's' || key === 'S') {
      currentPage = 'simulation';
    } else if (key === 'r' || key === 'R') {
      // Future: Show run history
      console.log('Run history - Total runs:', analysisData.runs.length);
    }
  }
}

function mousePressed() {
  // Handle back button click on analysis page
  if (currentPage === 'analysis') {
    // Back button coordinates: x: width-120, y: 20, w: 100, h: 30
    if (mouseX >= width - 120 && mouseX <= width - 20 && 
        mouseY >= 20 && mouseY <= 50) {
      currentPage = 'simulation';
    }
  }
}
