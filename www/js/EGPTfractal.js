// ===============================================
// Pyramids of EGPT Fractal - p5.js Sketch
// ===============================================

let canvasWidth = 600;
let canvasHeight = 600;

// Simulation state
let currentStep = 2;
let maxStep = 150; // Set a limit for the simulation

let isSimulationRunning = true; // Track simulation state

// Data tracking
// We don't need to track every single x-value. The prime check is now mathematical.
let pyramids = []; // We will store all pyramids drawn so far
let primePyramids = [];

// DOM Elements
let statusDiv;
let primeListUl;
let controlButton;

function setup() {
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    
    // Get references to our HTML display elements
    statusDiv = select('#status');
    primeListUl = select('#prime-list');
    controlButton = select('#control-button');

       // Set a slightly slower frame rate to watch the growth
    frameRate(10); 
        // Set up the drawing environment
    background('#111'); // Start with a clean background
    translate(width / 2, height); // Center origin at bottom-center
    
    // Initial state: Start with Pyramid 2
    let p2 = { num: 2, isPrime: true, baseSize: 2 };
    pyramids.push(p2);
    primePyramids.push(p2.num);
    
    let li = createElement('li', `Pyramid ${p2.num}`);
    li.addClass('prime-pyramid');
    primeListUl.child(li);
}

/**
 * Handle keyboard input
 */
function keyPressed() {
    if (key === 'r' || key === 'R') {
        restartSimulation();
    }
}

function draw() {
    // Only run the simulation if it's active
    if (!isSimulationRunning) {
        return;
    }

// We will redraw everything each frame to show the growth cleanly
    background('#111');
    translate(width / 2, height);

    if (currentStep <= maxStep) {
        statusDiv.html(`Step n = ${currentStep}: Growing all pyramids and introducing Pyramid ${currentStep}.`);
        
        // --- The "Growth" Step ---
        // At step 'n', every existing pyramid 'p' grows its base to cover [-p, p], [-2p, 2p], etc.
        // A point 'n' is "touched" or "covered" by a smaller pyramid 'p' if n is a multiple of p.
        let isTouchedBySmallerPyramid = false;
        for (const p of primePyramids) { // We only need to check against primes for efficiency (Sieve of Eratosthenes)
            if (currentStep % p === 0) {
                isTouchedBySmallerPyramid = true;
                break; // Found a factor, it's not a new prime
            }
        }
        
        const isPrimePyramid = !isTouchedBySmallerPyramid;

        // --- Create and Store the New Pyramid ---
        let newPyramid = { num: currentStep, isPrime: isPrimePyramid, baseSize: currentStep };
        pyramids.push(newPyramid);

        if (isPrimePyramid) {
            primePyramids.push(newPyramid.num);
            
            // Update the display list
            let li = createElement('li', `Pyramid ${newPyramid.num}`);
            li.addClass('prime-pyramid');
            primeListUl.child(li);
        }

        // --- The "Drawing" Step ---
        // Draw all pyramids at their current size for this step 'n'.
        // This creates the visual effect of simultaneous growth.
        for (const pyramid of pyramids) {
            // At step 'n', the base of pyramid 'p' covers all multiples of 'p' up to 'n'.
            // For visualization, we just draw it with its base at [-p, p].
            // The "growth" is represented by the ever-increasing number of faint composite pyramids.
            drawPyramid(pyramid.num, pyramid.isPrime);
        }

        // Move to the next step
        currentStep++;

    } else {
        // Simulation reached the end of current batch
        statusDiv.html(`Simulation paused at step n = ${maxStep}. Click Continue to extend simulation.`);
        controlButton.html('Continue');
        isSimulationRunning = false;
        noLoop(); // Stop the draw loop
    }
}

/**
 * Helper function to draw a single pyramid.
 * A pyramid of number 'n' has a base from -n to n and a height of 'n'.
 * @param {number} n - The number of the pyramid.
 * @param {boolean} isPrime - If true, draw the outline in gold.
 */
function drawPyramid(n, isPrime) {
     // Scale the pyramid to fit on the screen based on the current max step.
    // This allows the view to adapt as the simulation extends beyond the initial range.
    const scaleX = (width * 0.9) / (maxStep * 2);
    const scaleY = (height * 0.9) / maxStep;

    const baseLeft = -n * scaleX;
    const baseRight = n * scaleX;
    const peakY = -n * scaleY; // p5.js y-axis is inverted

    // Set the drawing style
    if (isPrime) {
        stroke('gold');
        strokeWeight(1.5);
        noFill();
    } else {
        stroke(255, 30); // Faint white for composite pyramids
        strokeWeight(0.5);
        noFill();
    }

    // Draw the triangular wave/pyramid
    beginShape();
    vertex(baseLeft, 0);
    vertex(0, peakY);
    vertex(baseRight, 0);
    endShape(CLOSE);
}

/**
 * Toggle function for the start/stop button
 */
function toggleSimulation() {
    if (currentStep > maxStep) {
        // Continue the simulation with another batch of 150 iterations
        const nextMaxStep = maxStep + 150;
        maxStep = nextMaxStep;
        statusDiv.html(`Extending simulation to step n = ${maxStep}...`);
        controlButton.html('Stop');
        isSimulationRunning = true;
        loop(); // Continue the draw loop
    } else if (isSimulationRunning) {
        // Stop the simulation
        isSimulationRunning = false;
        statusDiv.html(`Simulation paused at step n = ${currentStep}`);
        controlButton.html('Start');
    } else {
        // Resume the simulation
        isSimulationRunning = true;
        statusDiv.html(`Resuming simulation at step n = ${currentStep}...`);
        controlButton.html('Stop');
        loop(); // Resume the draw loop
    }
}

/**
 * Complete restart function - clears all progress and starts over
 * This can be called by adding a separate restart button or key press
 */
function restartSimulation() {
    currentStep = 2;
    maxStep = 150; // Reset to initial value
    pyramids = [];
    primePyramids = [];
    primeListUl.html(''); // Clear the prime list
    
    // Re-initialize with Pyramid 2
    let p2 = { num: 2, isPrime: true, baseSize: 2 };
    pyramids.push(p2);
    primePyramids.push(p2.num);
    
    let li = createElement('li', `Pyramid ${p2.num}`);
    li.addClass('prime-pyramid');
    primeListUl.child(li);
    
    statusDiv.html('Simulation restarted from beginning...');
    controlButton.html('Stop');
    isSimulationRunning = true;
    loop();
}