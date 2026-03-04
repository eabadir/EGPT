// EGPT Fractal Wave (Synchronized CA) — p5.js sketch
// Clean implementation using PhotonicCA with exact arithmetic (BigInt).
// All CAs are synchronized per tick t with x = 2t. Each CA maintains a small
// y counter in [0..n-1] (wrap counter) so y==0 is a base collision without modulo.
// Events per tick:
//  a) none y==0 -> spawn PRIME wave at t
//  b) all y==0 -> spawn FACTORIAL wave (product of all n)

let canvasWidthFW = 600;
let canvasHeightFW = 600;
// NEXT_SCALE_X is the next apex x-threshold (in domain units, BigInt) for ca0 to trigger zoom
let NEXT_SCALE_X = 0n;


// Simulation state
let isRunningFW = true;
class SimTime {
	static _T = 1n; // start so first tick is t=2
	static _nextPow2 = 2n; // next power of 2 for bit-level precision
	static _isEven = false; // true if T is even, false if odd
	static get T() { return this._T; }
	static set T(value) {
		if (typeof value === 'bigint') {
			this._T = value;
			this._isEven = (value % 2n === 0n); // update even/odd state
			if (this._T >= this._nextPow2) {
				// calculate the last power of 2 that is less than or equal to T
				this._nextPow2 = 1n;
				while (this._nextPow2 <= this._T) {
					this._nextPow2 *= 2n; // double the next power of 2 for bit-level precision
				}
			}
		} else {
			throw new TypeError('SimTime.T must be a BigInt');
		}
	}
	static reset() {
		// Full reset to t=0 with even parity and nextPow2 baseline
		this._T = 0n;
		this._isEven = true; // 0 is even
		this._nextPow2 = 2n;
	}
	static tick() {
		this._T += 1n; // increment time step
		this._isEven = !(this._isEven); // toggle even/odd state
		if (this._T / 2n > this._nextPow2) {
			this._nextPow2 *= 2n; // double the next power of 2 for bit-level precision
		}
	}
	static isEven() {
		return this._isEven;
	}
	static isOdd() {
		return !this._isEven;
	}

	static get nextPow2() {
		return this._nextPow2;
	}
}
// Scaling and layout (simple scheme)
let unitsRangeX = 600; // domain width mapped to drawable width
let unitsRangeY = 120; // domain height mapped to drawable height
const marginLeft = 20;
const marginBottom = 20;
const ZOOM_FACTOR = 1.2; // when triggered, zoom out by 1.2 uniformly

// UI elements
let statusDivFW, metricsDivFW, primeListUlFW, controlButtonFW, fpsSliderFW, fpsValueFW;

// Compute the next domain-unit x threshold for ca0 apex to reach screen midpoint.
// We maintain scaling via unitsRangeX and a simple linear mapping inside margins:
// scaleXForFW(x) = (Number(x)/unitsRangeX) * (width - 2*marginLeft)
// We want scaleXForFW(threshold) == (width - 2*marginLeft)/2
// => Number(threshold)/unitsRangeX == 1/2 => threshold == unitsRangeX/2.
// We'll round up and convert to BigInt to keep a fast integer compare.
function computeNextScaleThreshold() {
	const halfUnits = Math.ceil(unitsRangeX / 2);
	return BigInt(halfUnits);
}

// PhotonicCA: exact BigInt CA with x=2t and y wrap counter (no modulo)
class PhotonicCA {
	constructor(key, waveType = 'PRIME', startX = null, startY = null) {
		startX = startX || SimTime.T;
		startY = startY || 0n;
		this.n = key; // BigInt
		this.x = startX;   // BigInt
		this.y = startY;   // BigInt in [0..n-1]
		this.waveType = waveType; // 'PRIME' or 'FACTORIAL'
		this.period = 2n * this.n; // period is 2n for each CA
		this.amplitude = this.n; // amplitude is n for each CA
		this._cycles = 0; // number of cycles completed
		this._remainingPeriod = this.period; // remaining period for current cycle
		this.color = (waveType === 'PRIME') ? 'gold' : 'silver'; // color for drawing
		this.sourceFactorial = null; // source factorial CA if this is a factorial wave
	}
	get isDirty() {
		return this.y === 0n; // dirty CA flag for drawing
	}
	get Ydirection() {
		// direction is +1 in first half of period, -1 in second half
		return (this.y <= this.n) ? 1n : -1n;
	}
	draw() {
		if (!this.isDirty) return; // only draw if at base
		// Draw symmetric pyramid: left=(x - 2n*n), apex at x, right=(x + 2n*n)
		const left = this.x - 2n * this.n;
		const right = this.x + 2n * this.n;
		const apexX = this.x;
		const x0 = scaleXForFW(left);
		const x1 = scaleXForFW(right);
		const xp = scaleXForFW(apexX);
		const yp = -scaleYForFW(this.n); // height of the pyramid

		stroke(this.color);
		strokeWeight(1.25);
		noFill();
		beginShape();
		vertex(x0, 0);
		vertex(xp, yp);
		vertex(x1, 0);
		endShape(CLOSE);


	}
	move(tBig) {
		// Synchronize x to global time: x = 2*T ensures left edge for first wave starts at 0
		if (typeof tBig === 'bigint') {
			this.x = 2n * tBig;
		} else {
			this.x = this.x + 2n;
		}
		this.y = (this.y + 1n === this.n) ? 0n : this.y + 1n;
		this._remainingPeriod -= 1n; // decrement remaining period

		if (this._remainingPeriod <= 0n) {
			this._cycles += 1; // complete a cycle
			this._remainingPeriod = this.period; // reset remaining period
		}

		return { x: this.x, y: this.y };
	}
}

// Waves and tracking
const waves = []; // PhotonicCA[]

const primesSpawned = []; // string list
const factorialsSpawned = []; // string list

// Scaling helpers
function scaleXForFW(x) { return (Number(x) / unitsRangeX) * (width - marginLeft * 2); }
function scaleYForFW(y) { return (Number(y) / unitsRangeY) * (height - marginBottom * 2); }


function addWave(tBig, anyZero, zeroWaves) {
	const key = tBig / 2n; // key is the n value (tBig must be even)
	// Compute the wave type
	let label = null;
	label = (!anyZero) ? 'PRIME' : label;
	label = (zeroWaves && zeroWaves.length > 0) ? 'FACTORIAL' : label; // if allZero, label as FACTORIAL

	if (label === null) {
		return false; // no new wave if anyZero is true (no prime) and allZero is false (no factorial)
	}


	let isOdd = SimTime.isOdd();
	let ca;
	if (SimTime.T < 4n) {
		return false; // no new waves before t=4
	} else if (SimTime.T === 4n) {
		// Special case for t=4, always add the first wave (2)
		label = 'PRIME'; // always a prime wave
	} else if (label === 'FACTORIAL') {
		// Factorials are always even numbers so we only add them at even time steps
		if (!isOdd) {

			console.log(`Adding FACTORIAL wave at t=${tBig} (n=${key})`);
		}
	} else if (!isOdd || key === 2n || key === SimTime.nextPow2) {
		return false; // no new waves at even time steps
	}


	

	if (label === 'PRIME') {
		ca = new PhotonicCA(key, label);
		const wasEmpty = waves.length === 0;
		waves.push(ca);
		primesSpawned.push(key);
		const li = createElement('li', `Prime ${key}`);
		li.addClass('prime-pyramid');
		primeListUlFW?.child(li);
		if (wasEmpty) {
			// Recompute threshold now that ca0 exists
			NEXT_SCALE_X = computeNextScaleThreshold();
		}
	} else if (label === 'FACTORIAL') {
		// create a new factorial wave from zeroWaves
		let factWaveAmplitude = 0n;
		let factWavePeriod = 0n;
		// loop through zeroWaves to compute the factorial wave
		if (zeroWaves && zeroWaves.length > 0) {
			let factWave = zeroWaves[zeroWaves.length - 1]; // use the last zero wave's n
			factWaveRight = factWave.x + 2n * factWave.n; // rightmost x of the first wave
			factWaveAmplitude = factWaveRight / 2n; // amplitude is rightmost x / 2

			ca = new PhotonicCA(factWaveAmplitude, label);
			ca.sourceFactorial = factWave; // link to the source factorial CA
			
		}
		
		
		// Factorials logged in metrics; UI list remains primes-only for clarity
	}
	return ca;
}

function setup() {
	const canvas = createCanvas(canvasWidthFW, canvasHeightFW);
	canvas.parent('canvas-container');

	statusDivFW = select('#status');
	metricsDivFW = select('#metrics');
	primeListUlFW = select('#prime-list');
	controlButtonFW = select('#control-button');
	fpsSliderFW = select('#framerate-slider');
	fpsValueFW = select('#framerate-value');

	const initFPS = fpsSliderFW?.value() ? parseInt(fpsSliderFW.value(), 10) : 24;
	frameRate(initFPS);

	background('#111');
	push();
	translate(marginLeft, height - marginBottom);
	drawAxes();
	pop();

	// Initialize next threshold for zoom trigger
	NEXT_SCALE_X = computeNextScaleThreshold();

	// //Advance time to T = 4n (first tick will be t=3)

	// SimTime.T = 5n; // start so first tick is t=3
	// let wave2 = addWave(4n, false, false,5n,0n); // seed with 2   
	//SimTime.tick(); // advance to t=5
	updateStatus();
}

function keyPressed() {
	if (key === 'r' || key === 'R') window.restartFractalWave?.();
}

function draw() {
	if (!isRunningFW) return;

	// Advance time
	SimTime.tick();

	// Note: We do NOT clear the canvas each frame; history accumulates to form the fractal.
	// Axes were drawn once in setup. Scaling is kept static to preserve blitted history.

	let anyZero = false;
	let allZero = false;

	// Draw only the new geometry for this frame while moving CAs and computing flags
	push();
	translate(marginLeft, height - marginBottom);
	let maxX = 0n; // track max X for scaling
	let maxY = 0n; // track max Y for scaling
	let factorialCount = factorialsSpawned.length;
	let currentZeroWaves = []; // track current zero waves for factorial logic
	for (let i = 0; i < waves.length; i++) {
		const ca = waves[i];
		// The waves are an ordered list by their appearance in time.
		const { x, y } = ca.move(SimTime.T);

		const atBase = (y === 0n);
		ca.draw(); // draw the CA, it will draw its pyramid if at base
		if (ca.waveType === 'PRIME') {
			if (atBase) {
				anyZero = true; // if any prime is at base, anyZero is true
			}
			if (waves.length > 1 && i <= factorialCount) {
				if (atBase) {
					allZero = true; // if these primes are all at base, allZero is true
					if (currentZeroWaves) {
						currentZeroWaves.push(ca); // track current zero waves for factorial logic
					}
				} else {
					allZero = false; // if any prime is not at base, allZero is false
					currentZeroWaves = null; // reset current zero waves
				}
			}

		}
		maxX = (x > maxX) ? x : maxX; // track max X for scaling
		maxY = (y > maxY) ? y : maxY; // track max Y for scaling
	}
	pop();

	// Let addWave() handle spawning new waves
	let addedCA = addWave(SimTime.T, anyZero, currentZeroWaves); // if a new wave is added, it doesn't get drawn this frame since it hasn't completed its first full period yet

	if (addedCA && addedCA.waveType === 'FACTORIAL') {
		factorialsSpawned.push(addedCA.n);
		console.log(`Adding FACTORIAL wave at t=${SimTime.T} (n=${addedCA.sourceFactorial.n})`);
		//draw it once
		
	}

	// Simple zoom-out when the first wave reaches the right edge
	zoomOutIfNeeded();

	// No additional drawing here; triangles are blitted above when CAs hit base

	updateStatus();
}

// ============= Zoom-out (uniform) =============
function zoomOutIfNeeded() {
	if (!waves.length) return;
	const ca0 = waves[0]; // earliest wave (largest triangle)
	// Trigger when apex reaches the precomputed domain-unit threshold
	if (ca0.x <= NEXT_SCALE_X) return;

	// Capture only the drawable area (inside margins) so placement aligns
	const drawW = width - marginLeft * 2;
	const drawH = height - marginBottom * 2;
	const srcX = marginLeft;
	const srcW = drawW;
	const srcH = drawH;
	const srcY = height - marginBottom - srcH; // top-left of drawable area
	const img = get(srcX, srcY, srcW, srcH);

	// Clear and redraw uniformly scaled, anchored at bottom-left of drawable area
	background('#111');
	const s = 1 / ZOOM_FACTOR;
	const newW = Math.max(1, Math.round(srcW * s));
	// Use ceil for height to keep the baseline visually consistent (avoid a visible gap)
	const newH = Math.max(1, Math.ceil(srcH * s));
	const dstX = marginLeft;
	const dstY = height - marginBottom - newH;
	image(img, dstX, dstY, newW, newH);

	// Update mapping so future drawings match the compressed history
	unitsRangeX = Math.ceil(unitsRangeX * ZOOM_FACTOR);
	unitsRangeY = Math.ceil(unitsRangeY * ZOOM_FACTOR);

	// Recompute NEXT_SCALE_X for the next trigger under new mapping
	NEXT_SCALE_X = computeNextScaleThreshold();

	// Redraw axes
	push();
	translate(marginLeft, height - marginBottom);
	drawAxes();
	pop();
}

// ============= Rendering =============
function drawAxes() {
	stroke('#333');
	strokeWeight(1);
	line(0, 0, scaleXForFW(unitsRangeX), 0);
	line(0, 0, 0, -scaleYForFW(unitsRangeY * 0.9));
}

function drawWaveMarker(ca) {
	// Visualize each CA as a vertical gold tick up to its current triangular height
	const nNum = Number(ca.n <= Number.MAX_SAFE_INTEGER ? ca.n : BigInt(Math.min(Number.MAX_SAFE_INTEGER, 1e9)));
	const yNum = Number(ca.y <= BigInt(Number.MAX_SAFE_INTEGER) ? ca.y : BigInt(Number.MAX_SAFE_INTEGER));
	const tri = Math.min(yNum, nNum - yNum); // simple triangle-ish height
	const x = scaleXForFW(ca.x);
	const h = scaleYForFW(tri);
	stroke('gold');
	strokeWeight(1.25);
	line(x, 0, x, -h);
}



// ============= UI helpers =============
function updateStatus() {
	const tNum = SimTime.T.toString();
	const primeCount = primesSpawned.length;
	const lastPrime = primeCount ? primesSpawned[primeCount - 1] : '—';
	const facts = factorialsSpawned.length ? ` | factorials: ${factorialsSpawned.length}` : '';
	statusDivFW?.html(`t=${tNum} | waves=${waves.length}${facts}`);
	metricsDivFW?.html(`primes: [${primesSpawned.join(', ')}] | last=${lastPrime}`);
}

// expose controls for HTML
window.toggleFractalWave = function toggleFractalWave() {
	isRunningFW = !isRunningFW;
	controlButtonFW?.html(isRunningFW ? 'Stop' : 'Start');
	if (isRunningFW) loop(); else noLoop();
};

window.restartFractalWave = function restartFractalWave() {
	isRunningFW = true;
	SimTime.reset();
	waves.length = 0;

	primesSpawned.length = 0;
	factorialsSpawned.length = 0;
	if (primeListUlFW) primeListUlFW.html('');

	// Reset scaling to defaults (square canvas, simple mapping)
	unitsRangeX = 600;
	unitsRangeY = 120;
	NEXT_SCALE_X = computeNextScaleThreshold();
	background('#111');
	push();
	translate(marginLeft, height - marginBottom);
	drawAxes();
	pop();

	controlButtonFW?.html('Stop');
	loop();
	updateStatus();
};

// Expose frame-rate control for UI slider
window.setFractalWaveFPS = function setFractalWaveFPS(fps) {
	if (Number.isFinite(fps) && fps > 0) {
		frameRate(fps);
		if (fpsValueFW) fpsValueFW.html(String(fps));
	}
};

console.log('🎓 CANONICAL INFORMATION SPACE: Exact discrete math (sync CA)');
console.log('📁 p5.js UI: EGPT/js/ui/EGPTFractalWave.js');

// ================= Scaling helpers =================
function getMaxN() {
	let m = 0;
	for (const ca of waves) {
		const nNum = Number(ca.n <= BigInt(Number.MAX_SAFE_INTEGER) ? ca.n : BigInt(Number.MAX_SAFE_INTEGER));
		if (nNum > m) m = nNum;
	}
	return m;
}

// Simple Y helpers no longer needed; zoomOutIfNeeded adjusts both units
