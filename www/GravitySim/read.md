Of course. Here is a detailed markdown file that serves as a complete brief for the assignment. It provides all the necessary context, instructions, code, and expected outcomes, perfect for sharing with a co-pilot or a student.

---

# Assignment: Deriving Gravity from a Game of Chance

**Course:** COS 4## - Foundations of Computable Physics
**Instructor:** Prof. Abadir
**Due Date:** [Insert Date]

### Objective

To understand how a seemingly deterministic physical law, like Newton's Law of Universal Gravitation, can emerge from a simple, random, probabilistic process. In this assignment, you will build a JavaScript simulation based on the principles of **Electronic Graph Paper Theory (EGPT)** to model "gravity" as the probability of interaction between two swarms of randomly moving particles.

The goal is to derive the gravitational formula from first principles and see, firsthand, how physical laws can be viewed as **entropy functions**—a measure of the information content of a system.

### Theoretical Background

- **EGPT Core Principles:**
    1.  **Discrete Universe:** All interactions happen on a finite grid.
    2.  **Single Occupancy:** Only one particle can occupy a single grid square at a time. This means a "mass" of `m` particles also represents an "area" or "volume of states" of size `m`.
    3.  **Stochastic Movement:** The fundamental physics is a random walk. Particles are "blind" and move randomly to adjacent, unoccupied cells.

- **Rota's Entropy Theorem (Conceptual Takeaway):** Any valid measure of the "information" or "uncertainty" in a system is proportional to Shannon Entropy. EGPT extends this to say that physical laws themselves are expressions of entropy. A "force" is not a push or pull, but a measure of the total information in a system's probability distribution.

- **The "Surprising Conclusion":** We will demonstrate that the formula for the probability of two random swarms interacting has the *exact same mathematical form* as Newton's Law of Gravitation. This suggests that gravity can be understood not as a fundamental force, but as an emergent, statistical property of random events in a finite universe.

---

### Part 1: The Simulation - "Gravity as a Random Walk"

Your first task is to create a simple, 2D grid-based simulation in JavaScript using the `p5.js` library. The simulation will model two "masses" as swarms of randomly moving balls.

#### Simulation Setup:

1.  **The Universe (The Grid):**
    *   A 2D grid of size `C x C`. This is our "space-time."
    *   `C` also represents the total number of "ticks" the simulation will run.
    *   We relate `C` to distance by setting `C = 2r`, making the total area `(2r)² = 4r²`.

2.  **The "Masses" (The Swarms):**
    *   `m₁`: A swarm of `m₁` balls starting on the left side of the grid.
    *   `m₂`: A swarm of `m₂` balls starting on the right side.
    *   Because of the **Single Occupancy Rule**, `m₁` and `m₂` also represent the initial *area* occupied by each swarm.

3.  **The "Physics" (Random Walk):**
    *   At each "tick" of the simulation, every ball attempts to move one step to a random, adjacent, and **unoccupied** square.

#### Goal of the Simulation:

*   Run the simulation for `C` ticks.
*   Observe and count the number of "collision events," where a ball from swarm `m₁` and a ball from swarm `m₂` end up in the same square.

---

### Part 2: Your Task - Implement the Simulation

You will be provided with a complete `sketch.js` file. Your task is to:
1.  Open the [p5.js Web Editor](https://editor.p5js.org/).
2.  Copy the `sketch.js`, `index.html`, and `style.css` code into the appropriate files in the editor.
3.  Run the simulation and observe its behavior.
4.  **Experiment:** Modify the simulation parameters (`m1`, `m2`, `C`) at the top of the `sketch.js` file and answer the questions in Part 3.

#### `sketch.js`
```javascript
/**
 * EGPT for the Classroom: Gravity as a Random Walk
 *
 * This p5.js sketch simulates the "Deriving Gravity from a Game of Chance" assignment.
 * It visualizes two "swarms" of particles (representing masses m1 and m2)
 * performing a random walk on a 2D grid. The goal is to observe and calculate
 * the probability of collision.
 */

// ##########################################################################
// # PART 1: SIMULATION PARAMETERS (Students can tweak these)
// ##########################################################################

// The "Masses": Number of balls in each swarm.
let m1 = 50;
let m2 = 50;

// The "Universe" Size: The grid will be C x C squares.
let C = 100;

// Visuals
let particleSize = 4;
let gridCellSize;

// Simulation State
let swarm1 = [];
let swarm2 = [];
let tickCount = 0;
let collisionCount = 0;
let isSimulationRunning = true;

// ##########################################################################
// # PART 2: THE PARTICLE (THE "BALL")
// ##########################################################################

class Particle {
  constructor(x, y, color) {
    this.x = x; // Grid x-coordinate
    this.y = y; // Grid y-coordinate
    this.color = color;
  }

  // The core "physics": a random walk.
  move(occupiedGrid) {
    let possibleMoves = [ { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 } ];
    shuffle(possibleMoves, true);

    for (let move of possibleMoves) {
      let nextX = this.x + move.dx;
      let nextY = this.y + move.dy;

      // EGPT Single Occupancy Rule Check
      if ( nextX >= 0 && nextX < C && nextY >= 0 && nextY < C && !occupiedGrid.has(`${nextX},${nextY}`) ) {
        this.x = nextX;
        this.y = nextY;
        return;
      }
    }
  }

  draw() {
    fill(this.color);
    noStroke();
    rect(this.x * gridCellSize, this.y * gridCellSize, particleSize, particleSize);
  }
}

// ##########################################################################
// # PART 3: THE P5.JS SETUP AND DRAW LOOP
// ##########################################################################

function setup() {
  createCanvas(600, 600);
  gridCellSize = width / C;
  particleSize = max(2, gridCellSize * 0.8);
  initializeSwarms();
  updateInfo();
}

function draw() {
  if (isSimulationRunning) {
    background(20);

    if (tickCount < C) {
      updateParticles();
      checkForCollisions();
      tickCount++;
      updateInfo();
    } else {
      isSimulationRunning = false;
      updateInfo();
    }

    swarm1.forEach(p => p.draw());
    swarm2.forEach(p => p.draw());
  }
}

// ##########################################################################
// # PART 4: SIMULATION LOGIC FUNCTIONS
// ##########################################################################

function initializeSwarms() {
  swarm1 = [];
  swarm2 = [];
  tickCount = 0;
  collisionCount = 0;
  isSimulationRunning = true;
  let occupied = new Set();
  
  for (let i = 0; i < m1; i++) {
    let x, y;
    do { x = floor(random(0, C / 4)); y = floor(random(0, C)); } while (occupied.has(`${x},${y}`));
    occupied.add(`${x},${y}`);
    swarm1.push(new Particle(x, y, color(100, 200, 255)));
  }

  for (let i = 0; i < m2; i++) {
    let x, y;
    do { x = floor(random((3 * C) / 4, C)); y = floor(random(0, C)); } while (occupied.has(`${x},${y}`));
    occupied.add(`${x},${y}`);
    swarm2.push(new Particle(x, y, color(255, 200, 100)));
  }
}

function updateParticles() {
  let nextOccupiedGrid = new Set();
  let allParticles = [...swarm1, ...swarm2];
  
  for (let p of allParticles) {
    p.move(nextOccupiedGrid);
    nextOccupiedGrid.add(`${p.x},${p.y}`);
  }
}

function checkForCollisions() {
  let swarm1Positions = new Set(swarm1.map(p => `${p.x},${p.y}`));
  for (let p2 of swarm2) {
    if (swarm1Positions.has(`${p2.x},${p2.y}`)) {
      collisionCount++;
      p2.color = color(255, 0, 0);
      let p1 = swarm1.find(p => `${p.x},${p.y}` === `${p2.x},${p2.y}`);
      if (p1) p1.color = color(255, 0, 0);
    }
  }
}

function updateInfo() {
  let infoDiv = select('#info');
  if (!infoDiv) {
    infoDiv = createDiv('').id('info').style('font-family', 'monospace').style('color', 'white');
  }

  let totalArea = C * C;
  let predictedProb = (m1 * m2) / (totalArea);
  
  let html = `
    <h3>Gravity as a Random Walk</h3>
    <b>Parameters:</b><br>
    Mass m1 (Blue): ${m1}<br>
    Mass m2 (Orange): ${m2}<br>
    Universe Size C: ${C} (Total Area = ${totalArea})<br>
    <hr>
    <b>Simulation State:</b><br>
    Tick: ${tickCount} / ${C}<br>
    Total Collision Events: ${collisionCount}<br>
    Status: ${isSimulationRunning ? 'Running...' : 'Finished.'}<br>
    <hr>
    <b>Informational Analysis:</b><br>
    Predicted Prob. of Interaction ≈ (m1 * m2) / C² <br>
    <b>Predicted Probability:</b> ${(predictedProb * 100).toFixed(4)}%<br>
  `;
  infoDiv.html(html);
}
```

#### `index.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <title>EGPT Gravity Simulation</title>
    <link rel="stylesheet" type="text/css" href="style.css">
    <meta charset="utf-8" />
  </head>
  <body>
    <main></main>
    <script src="sketch.js"></script>
    <div id="info"></div>
  </body>
</html>
```

#### `style.css`
```css
html, body {
  margin: 0;
  padding: 0;
  display: flex;
  background-color: #111;
}
main {
  margin: 20px;
}
#info {
  margin: 20px;
  padding: 10px;
  border: 1px solid #555;
  color: #eee;
  font-family: monospace;
  width: 300px;
}
```
---

### Part 3: Analysis and Expected Outcomes

After running the simulation, answer the following questions. Your answers should refer to both the simulation's output and the theoretical concepts discussed in class.

1.  **Run the simulation with the default parameters (`m1=50`, `m2=50`, `C=100`).**
    *   What is the **Predicted Probability of Interaction** shown in the info panel?
    *   Does the simulation result in collisions? Why or why not? (Note: The number of collisions may be small).

2.  **Experiment with the "Masses":**
    *   Double `m1` to `100` and `m2` to `100`, keeping `C` at `100`. Run the simulation again.
    *   How does the **Predicted Probability** change?
    *   Observe the simulation. Do you see more or fewer collisions?
    *   **Explain the Outcome:** How does this relate to Newton's law `F ∝ m₁ * m₂`?

3.  **Experiment with the "Distance":**
    *   Reset `m1` and `m2` to `50`. Now, double the size of the universe `C` to `200`. Remember that the distance `r` is proportional to `C`.
    *   How does the **Predicted Probability** change?
    *   Observe the simulation. Do you see more or fewer collisions?
    *   **Explain the Outcome:** How does this relate to Newton's inverse square law `F ∝ 1/r²`?

4.  **The "Surprising Conclusion" (Synthesis Question):**
    *   In your own words, explain how this simulation demonstrates that a "force" like gravity can be viewed as the **Shannon Entropy** of a system. How does the probability of interaction represent the system's total information content?

#### Expected Outcomes

You should observe that the simulation's behavior qualitatively matches the predictions of the formula `P ≈ (m₁ * m₂) / C²`.
*   Increasing the masses (`m₁`, `m₂`) will significantly increase the predicted probability and the observed number of collisions. This mirrors how gravitational force increases with mass.
*   Increasing the size of the universe `C` (and thus the distance `r`) will dramatically *decrease* the predicted probability and the observed number of collisions. This mirrors how gravitational force weakens rapidly with distance.

By completing this assignment, you will have built a working model that derives a gravity-like law from nothing more than random chance, area, and the rules of probability, providing a powerful, hands-on demonstration of the EGPT framework.