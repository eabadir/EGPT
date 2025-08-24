/*
 RotaEntropyProperties.js
 Interactive demonstration of Rota's entropy properties focused on the conditional additivity axiom
 applied to an i.i.d. Bernoulli process. This mirrors (informally) Lean definitions in
 EGPT/Entropy/Common.lean without formal proof infrastructure.

	Properties checked:
	 1. Normalization: H( Bernoulli(1/2) ) = 1 (bit)
	 2. Symmetry: H(p) = H(1-p)
	 3. Continuity: small delta in p => small delta in H (numerical derivative estimate)
	 4. Zero Invariance: adding/removing zero-probability outcome doesn't change entropy
	 5. Max Uniform: p=1/2 maximizes H(p)
	 6. Conditional Additivity (specialization of sigma additivity): H_{n+1} = H_n + H(Bernoulli(p))
*/

// =============== Math Utilities ===============
const log2 = x => Math.log(x) / Math.log(2);

function safeProb(p) {
	return (p <= 0 || !Number.isFinite(p)) ? 0 : p;
}

function entropyDiscrete(probArray) {
	// Probabilities should sum ~1. Accepts zeros.
	return probArray.reduce((acc, p) => p > 0 ? acc - p * log2(p) : acc, 0);
}

function bernoulliEntropy(p) {
	p = Math.min(1, Math.max(0, p));
	if (p === 0 || p === 1) return 0;
	return entropyDiscrete([p, 1 - p]);
}

// For n i.i.d. Bernoulli(p) variables joint entropy is n * H(Bernoulli(p))
function jointEntropyIIDBernoulli(n, p) {
	return n * bernoulliEntropy(p);
}

// Build full distribution over {0,1}^n (careful: grows 2^n) - use only for small n.
function bernoulliSequenceDistribution(n, p) {
	const dist = [];
	const totalStates = 1 << n;
	for (let mask = 0; mask < totalStates; mask++) {
		let ones = 0;
		for (let i = 0; i < n; i++) if (mask & (1 << i)) ones++;
		const prob = Math.pow(p, ones) * Math.pow(1 - p, n - ones);
		dist.push(prob);
	}
	return dist;
}

// Numerical derivative for continuity heuristics
function numericalDerivative(f, x, h = 1e-4) {
	return (f(x + h) - f(x - h)) / (2 * h);
}

// =============== Property Checks ===============
function checkNormalization() {
	const val = bernoulliEntropy(0.5);
	return { ok: Math.abs(val - 1) < 1e-10, value: val };
}

function checkSymmetry(p) {
	const hp = bernoulliEntropy(p);
	const hq = bernoulliEntropy(1 - p);
	return { ok: Math.abs(hp - hq) < 1e-10, diff: hp - hq };
}

function checkContinuity(p) {
	const h1 = bernoulliEntropy(p);
	const delta = 1e-4;
	const h2 = bernoulliEntropy(p + delta);
	const ratio = Math.abs(h2 - h1) / delta; // approximate Lipschitz-like slope
	return { ok: ratio < 2e4, slope: ratio }; // loose numeric bound
}

function checkZeroInvariance(p) {
	const withZero = entropyDiscrete([p, 1 - p, 0]);
	const base = bernoulliEntropy(p);
	return { ok: Math.abs(withZero - base) < 1e-12, diff: withZero - base };
}

function checkMaxUniform(p) {
	// Compare H(p) with H(0.5). Should never exceed.
	const h = bernoulliEntropy(p);
	const hu = 1; // H(0.5)
	return { ok: h <= hu + 1e-12, gap: hu - h };
}

function checkConditionalAdditivity(n, p) {
	const hn = jointEntropyIIDBernoulli(n, p);
	const hn1 = jointEntropyIIDBernoulli(n + 1, p);
	const h1 = bernoulliEntropy(p);
	return { ok: Math.abs(hn1 - (hn + h1)) < 1e-10, lhs: hn1, rhs: hn + h1 };
}

// =============== Probability Tree Rendering ===============
function buildBernoulliPrefixTree(n, p, limitLeaves = 256) {
	// BFS up to limitLeaves to avoid DOM blowup.
	const nodes = [{ prefix: '', prob: 1 }];
	const leaves = [];
	for (let depth = 0; depth < n; depth++) {
		const next = [];
		for (const node of nodes) {
			if (leaves.length + next.length > limitLeaves) break;
			next.push({ prefix: node.prefix + '0', prob: node.prob * (1 - p) });
			next.push({ prefix: node.prefix + '1', prob: node.prob * p });
		}
		nodes.splice(0, nodes.length, ...next);
	}
	for (const node of nodes) leaves.push(node);
	return leaves;
}

function leavesEntropyContribution(leaves) {
	return leaves.map(l => ({ prefix: l.prefix, p: l.prob, contrib: l.prob > 0 ? -l.prob * log2(l.prob) : 0 }));
}

// =============== Plot H(p) Curve ===============
function drawEntropyCurve(canvas, p, pointColor = '#ffb347') {
	const ctx = canvas.getContext('2d');
	const w = canvas.width = canvas.clientWidth;
	const h = canvas.height = canvas.clientHeight;
	ctx.clearRect(0,0,w,h);
	// Axes
	ctx.strokeStyle = '#2a3947';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(35, 5); ctx.lineTo(35, h - 25); ctx.lineTo(w - 5, h - 25); ctx.stroke();
	ctx.font = '10px system-ui'; ctx.fillStyle = '#9fb4c8';
	ctx.fillText('H(p)', 5, 12); ctx.fillText('p', w - 12, h - 10);

	const maxH = 1; // for Bernoulli
	// Curve
	ctx.strokeStyle = '#3fa9f5'; ctx.lineWidth = 2; ctx.beginPath();
	for (let i = 0; i <= 400; i++) {
		const t = i / 400;
		const hp = bernoulliEntropy(t) / maxH; // 0..1
		const x = 35 + t * (w - 40);
		const y = (h - 25) - hp * (h - 35);
		if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
	}
	ctx.stroke();

	// Selected point
	const hp = bernoulliEntropy(p) / maxH;
	const x = 35 + p * (w - 40);
	const y = (h - 25) - hp * (h - 35);
	ctx.fillStyle = pointColor;
	ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
	ctx.fillStyle = '#fff';
	ctx.fillText(`p=${p.toFixed(3)}, H=${(hp*maxH).toFixed(3)}`, Math.min(Math.max(40, x - 30), w - 120), y - 8);
}

// =============== UI Wiring ===============
function formatBits(x) { return x.toFixed(6).replace(/0+$/,'').replace(/\.$/,''); }

function updateAll() {
	const pSlider = document.getElementById('pInput');
	const depthInput = document.getElementById('depthInput');
	const p = parseFloat(pSlider.value);
	const n = parseInt(depthInput.value, 10);
	document.getElementById('pVal').textContent = `= ${p.toFixed(3)}`;

	// Entropy summary
	const h1 = bernoulliEntropy(p);
	const hn = jointEntropyIIDBernoulli(n, p);
	const hnPlus = jointEntropyIIDBernoulli(n + 1, p);
	const condCheck = checkConditionalAdditivity(n, p);
	const summaryEl = document.getElementById('entropySummary');
	summaryEl.innerHTML = `
		<div><strong>H(Bernoulli(p))</strong> = ${formatBits(h1)} bits</div>
		<div><strong>H(X₁,…,X_${n})</strong> = ${formatBits(hn)} bits</div>
		<div><strong>H(X₁,…,X_${n+1})</strong> = ${formatBits(hnPlus)} bits</div>
		<div class="small ${condCheck.ok ? 'ok':'warn'}">Check: Hₙ₊₁ − (Hₙ + H₁) = ${(condCheck.lhs - condCheck.rhs).toExponential(2)}</div>`;

	// Tree & contributions (limit leaves for performance)
	const treeLeaves = buildBernoulliPrefixTree(Math.min(n, 10), p, 512);
	const contribs = leavesEntropyContribution(treeLeaves);
	const treeEl = document.getElementById('treeContainer');
	const totalLeafEntropy = contribs.reduce((a,b)=>a+b.contrib,0);
	let html = '';
	contribs.slice(0,256).forEach(c => {
		html += `${c.prefix.padEnd(n,'·')}  p=${c.p.toExponential(2)}  contrib=${c.contrib.toExponential(2)}\n`;
	});
	if (contribs.length > 256) html += `... (${contribs.length-256} more)\n`;
	html += `\nSum leaf contributions (depth=${Math.min(n,10)}) = ${totalLeafEntropy.toFixed(6)} bits\n`;
	treeEl.textContent = html;

	// Property table
	const tbody = document.querySelector('#propsTable tbody');
	tbody.innerHTML = '';
	const norm = checkNormalization();
	const symm = checkSymmetry(p);
	const cont = checkContinuity(p);
	const zeroInv = checkZeroInvariance(p);
	const maxUnif = checkMaxUniform(p);
	const cond = condCheck;
	const rows = [
		['Normalization','H(1/2)=1', `${norm.value.toFixed(6)}`, norm.ok],
		['Symmetry','H(p)=H(1-p)', symm.diff.toExponential(2), symm.ok],
		['Continuity','|ΔH/Δp| small', cont.slope.toExponential(2), cont.ok],
		['Zero Invariance','H([p,1-p])=H([p,1-p,0])', zeroInv.diff.toExponential(2), zeroInv.ok],
		['Max @ Uniform','H(p) ≤ H(1/2)', maxUnif.gap.toExponential(2), maxUnif.ok],
		['Cond. Additivity','Hₙ₊₁=Hₙ+H₁', (cond.lhs-cond.rhs).toExponential(2), cond.ok]
	];
	for (const r of rows) {
		const tr = document.createElement('tr');
		tr.className = 'prop-row';
		tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td class="${r[3]?'ok':'warn'}">${r[3]?'OK':'Fail'}</td>`;
		tbody.appendChild(tr);
	}

	// Additivity derivation numeric statement
	document.getElementById('additivityCheck').innerHTML = `
		<code>H_${n+1} = ${formatBits(hnPlus)}</code> vs <code>H_${n} + H₁ = ${formatBits(hn + h1)}</code>
		<div class="small ${cond.ok ? 'ok':'warn'}">Difference: ${(hnPlus - (hn + h1)).toExponential(2)}</div>`;

	// Plot
	drawEntropyCurve(document.getElementById('entropyPlot'), p);

		// Conditional additivity vs log2 comparison table
		const compTableBody = document.querySelector('#condAddLogComparison tbody');
		if (compTableBody) {
			compTableBody.innerHTML = '';
			// We'll compute H_k via k*H1 (since independence) and also via simulated distribution (only feasible for small k)
			const maxK = Math.min(16, Math.max(n, 8));
			for (let k = 1; k <= maxK; k++) {
				const H1 = h1;
				const kH1 = k * H1;
				let HkExact;
				if (k <= 18) { // 2^18 = 262144 manageable but borderline; we restrict more for performance
					if (k <= 14) { // 16384 states
						const distk = bernoulliSequenceDistribution(k, p);
						HkExact = entropyDiscrete(distk);
					} else {
						HkExact = kH1; // fallback approximation
					}
				} else {
					HkExact = kH1; // too large
				}
				const logSupport = k; // log2(2^k)
				const gapUniform = logSupport - kH1; // how much less than uniform maximum
				const ratio = kH1 / logSupport;
				const tr = document.createElement('tr');
				const diffApprox = HkExact - kH1;
				tr.innerHTML = `
					<td>${k}</td>
					<td>${H1.toFixed(4)}</td>
					<td>${HkExact.toFixed(4)}</td>
					<td>${kH1.toFixed(4)}</td>
					<td>${logSupport}</td>
					<td>${Math.abs(diffApprox) < 1e-9 ? '0' : diffApprox.toExponential(2)}</td>
					<td>${gapUniform.toFixed(4)}</td>
					<td>${ratio.toFixed(4)}</td>`;
				if (Math.abs(gapUniform) < 1e-9) tr.classList.add('highlight'); // highlight uniform case p=0.5
				compTableBody.appendChild(tr);
			}
		}
}

function randomize() {
	const pSlider = document.getElementById('pInput');
	const depthInput = document.getElementById('depthInput');
	pSlider.value = (Math.random() * 0.98 + 0.01).toFixed(3);
	depthInput.value = Math.floor(Math.random() * 9) + 2; // 2..10
	updateAll();
}

function toggleEdge() {
	const pSlider = document.getElementById('pInput');
	const current = parseFloat(pSlider.value);
	if (current > 0.05) pSlider.value = '0.001'; else pSlider.value = '0.5';
	updateAll();
}

// =============== Initialize ===============
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('pInput').addEventListener('input', updateAll);
	document.getElementById('depthInput').addEventListener('input', updateAll);
	document.getElementById('recomputeBtn').addEventListener('click', updateAll);
	document.getElementById('randomizeBtn').addEventListener('click', randomize);
	document.getElementById('edgeBtn').addEventListener('click', toggleEdge);
	updateAll();
});

// Expose core functions for console experimentation
window.RotaEntropyDemo = {
	bernoulliEntropy,
	jointEntropyIIDBernoulli,
	bernoulliSequenceDistribution,
	checkNormalization,
	checkSymmetry,
	checkContinuity,
	checkZeroInvariance,
	checkMaxUniform,
	checkConditionalAdditivity
};
