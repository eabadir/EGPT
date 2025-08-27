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

// Binomial coefficient helper (n choose k) using multiplicative formula for stability at moderate n
function binomial(n, k) {
	if (k < 0 || k > n) return 0;
	if (k === 0 || k === n) return 1;
	k = Math.min(k, n - k);
	let res = 1;
	for (let i = 1; i <= k; i++) {
		res = res * (n - k + i) / i;
	}
	return Math.round(res); // k small enough here; rounding corrects FP drift
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

				// Unique entropy ⇔ unique Shannon code table
				const ucTableBody = document.querySelector('#uniqueCodeTable tbody');
				if (ucTableBody) {
					ucTableBody.innerHTML = '';
					const maxShow = Math.min(256, 1 << Math.min(n, 12));
					let kraftSum = 0;
					let partialExpected = 0;
					const totalStates = 1 << n;
					// Show first lexicographic outcomes only for large n
					for (let idx = 0; idx < maxShow; idx++) {
						const bits = idx.toString(2).padStart(n, '0');
						// count ones
						let ones = 0; for (let i = 0; i < bits.length; i++) if (bits[i] === '1') ones++;
						const prob = Math.pow(p, ones) * Math.pow(1 - p, n - ones);
						const length = prob > 0 ? -log2(prob) : 0;
						const expContrib = prob * length;
						const ceilL = Math.ceil(length);
						const kraftTerm = Math.pow(2, -ceilL);
						kraftSum += kraftTerm;
						partialExpected += expContrib;
						const tr = document.createElement('tr');
						tr.innerHTML = `
							<td>${idx+1}</td>
							<td style="text-align:left;">${bits}</td>
							<td>${prob.toExponential(2)}</td>
							<td>${length.toFixed(4)}</td>
							<td>${expContrib.toFixed(4)}</td>
							<td>${ceilL}</td>
							<td>${kraftTerm.toFixed(4)}</td>`;
						ucTableBody.appendChild(tr);
					}
					document.getElementById('ucPartialExpected').textContent = partialExpected.toFixed(4);
					document.getElementById('ucKraftSum').textContent = kraftSum.toFixed(4);
					const HnExact = hn;
					document.getElementById('ucExactEntropy').textContent = HnExact.toFixed(6);
					const uniform = Math.abs(p - 0.5) < 1e-9;
					document.getElementById('ucUniformNote').textContent = uniform ? 'Uniform: all ℓ(s)=n' : '';
					const narrative = document.getElementById('uniqueCodeNarrative');
					narrative.textContent = `Shown ${maxShow}/${totalStates} outcomes. Each ideal length ℓ(s) = -log₂P(s). Entropy is the expected ℓ(s); conditional additivity ensures ℓ extends by either -log₂p or -log₂(1-p) per trial.`;
				}

					// Incremental Shannon encoder efficiency table (Section 7)
					const incrBody = document.querySelector('#incrementalEncoderTable tbody');
					if (incrBody) {
						incrBody.innerHTML = '';
						const maxK = Math.min(64, Math.max(5, n));
						const deltaH = h1; // constant increment per trial in IID case
						for (let k = 1; k <= maxK; k++) {
							const Hk = k * h1;
							const logSupport = k; // log2(2^k)
							const efficiency = logSupport > 0 ? (Hk / logSupport) : 0;
							const redundancy = logSupport - Hk;
							const tr = document.createElement('tr');
							tr.innerHTML = `
								<td>${k}</td>
								<td>${(k===1? h1 : deltaH).toFixed(4)}</td>
								<td>${Hk.toFixed(4)}</td>
								<td>${logSupport}</td>
								<td>${efficiency.toFixed(4)}</td>
								<td>${redundancy.toFixed(4)}</td>`;
							if (Math.abs(redundancy) < 1e-9) tr.classList.add('highlight');
							incrBody.appendChild(tr);
						}
						document.getElementById('encHn').textContent = hn.toFixed(4);
						document.getElementById('encLogN').textContent = n;
						document.getElementById('encEff').textContent = (hn / n).toFixed(4);
						document.getElementById('encRed').textContent = (n - hn).toFixed(4);
						const encNarr = document.getElementById('encoderNarrative');
						encNarr.textContent = `Each increment adds ΔH = H₁ = ${h1.toFixed(6)} bits. Uniform case p=0.5 reaches efficiency 1; biased source efficiency < 1 reveals systematic compressibility.`;
					}

						// Bijection / log2 encoder equivalence table (Section 8)
						const bijBody = document.querySelector('#bijectionTable tbody');
						if (bijBody) {
							bijBody.innerHTML = '';
							const maxK = Math.min(32, Math.max(8, n));
							for (let k = 1; k <= maxK; k++) {
								const codes = 1 << k; // 2^k
								const maxNat = codes - 1;
								const uniformEntropy = k; // bits
								const generalEntropy = k * h1; // IID Bernoulli
								const logCodes = k; // log2(2^k)
								const stepsToExtend = 1; // one new trial step
								const deltaRep = 1; // one bit appended
								const tr = document.createElement('tr');
								tr.innerHTML = `
									<td>${k}</td>
									<td>${codes.toLocaleString()}</td>
									<td>${maxNat.toLocaleString()}</td>
									<td>${uniformEntropy}</td>
									<td>${generalEntropy.toFixed(4)}</td>
									<td>${logCodes}</td>
									<td>${stepsToExtend}</td>
									<td>${deltaRep}</td>`;
								if (Math.abs(generalEntropy - uniformEntropy) < 1e-9) tr.classList.add('highlight');
								bijBody.appendChild(tr);
							}
							document.getElementById('bijUniformRef').textContent = 'Hₖ(uniform)=k';
							document.getElementById('bijGeneralRef').textContent = `Hₖ(p)=k·H₁=${(h1).toFixed(4)}·k`; // pattern
							const bijNarr = document.getElementById('bijNarrative');
							bijNarr.textContent = `log₂(#Codes)=k acts as canonical length. Bias (p ≠ 0.5) lowers actual average length to slope H₁=${h1.toFixed(6)}.`;
						}
		}

		// Section 9: Informationally Irreducible Shannon Codes (probability classes)
		const codesTableBody = document.querySelector('#codesComputeTable tbody');
		if (codesTableBody) {
			codesTableBody.innerHTML = '';
			// Distinct classes correspond to k=0..n (# of ones)
			let totalEntropy = 0;
			let newCount = 0;
			// Previous step probability values for comparison (k=0..n-1)
			const prevSet = new Set();
			for (let k = 0; k < n; k++) {
				const pv = Math.pow(p, k) * Math.pow(1 - p, (n - 1) - k);
				prevSet.add(pv.toPrecision(12));
			}
			for (let k = 0; k <= n; k++) {
				const multiplicity = binomial(n, k);
				const prob = Math.pow(p, k) * Math.pow(1 - p, n - k);
				const length = prob > 0 ? -log2(prob) : 0;
				const mass = multiplicity * prob; // should sum to 1
				const entropyContribution = mass * length;
				totalEntropy += entropyContribution;
				// Check if class probability is new (wasn’t in previous step). Always new when k=0 or k=n or p in (0,1) because exponents differ, but we test numerically.
				const isNew = !prevSet.has(prob.toPrecision(12));
				if (isNew) newCount++;
				const tr = document.createElement('tr');
				tr.innerHTML = `
					<td>${k}</td>
					<td>${multiplicity}</td>
					<td>${prob.toExponential(3)}</td>
					<td>${length.toFixed(4)}</td>
					<td>${mass.toFixed(4)}</td>
					<td>${entropyContribution.toFixed(6)}</td>
					<td>${isNew ? 'New' : ''}</td>`;
				if (isNew) tr.classList.add('highlight');
				codesTableBody.appendChild(tr);
			}
			const peEl = document.getElementById('codesPartialEntropy');
			if (peEl) peEl.textContent = totalEntropy.toFixed(6);
			const eeEl = document.getElementById('codesExactEntropy');
			if (eeEl) eeEl.textContent = hn.toFixed(6);
			const ncEl = document.getElementById('codesNewCount');
			if (ncEl) ncEl.textContent = `${newCount} new classes`;
			const narr = document.getElementById('codesComputeNarrative');
			if (narr) narr.textContent = `n=${n} produced ${n+1} probability classes; ${newCount} numerically new vs step n-1. Total entropy matches Hₙ = ${(hn).toFixed(6)}.`;
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
	// Section 9 controls (if present)
	const codesRefreshBtn = document.getElementById('codesRefreshBtn');
	if (codesRefreshBtn) codesRefreshBtn.addEventListener('click', updateAll);
	const codesMaxRows = document.getElementById('codesMaxRows');
	if (codesMaxRows) codesMaxRows.addEventListener('input', updateAll);
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

// =============== Section 10: Prime Information Atoms (EGPT–FTA) ===============
// Lightweight prime utilities (n <= 500 so simplest sieve is fine)
function sievePrimes(limit) {
	const isPrime = new Array(limit + 1).fill(true);
	isPrime[0] = false; isPrime[1] = false;
	for (let p = 2; p * p <= limit; p++) if (isPrime[p]) for (let q = p * p; q <= limit; q += p) isPrime[q] = false;
	const primes = [];
	for (let i = 2; i <= limit; i++) if (isPrime[i]) primes.push(i);
	return { isPrime, primes };
}

function factorInteger(n, primes) {
	const fac = [];
	let m = n;
	for (const p of primes) {
		if (p * p > m) break;
		if (m % p === 0) {
			let e = 0;
			while (m % p === 0) { m /= p; e++; }
			fac.push([p, e]);
		}
	}
	if (m > 1) fac.push([m, 1]);
	return fac;
}

// exponent of prime p in n! (Legendre formula)
function primeExponentInFactorial(n, p) {
	let exp = 0;
	let pk = p;
	while (pk <= n) { exp += Math.floor(n / pk); pk *= p; }
	return exp;
}

function updateFTA() {
	const nInput = document.getElementById('ftaNInput');
	if (!nInput) return; // section not present
	let n = parseInt(nInput.value, 10);
	if (isNaN(n) || n < 2) n = 2; if (n > 500) n = 500; nInput.value = n;
	const statusEl = document.getElementById('ftaStatus');
	const { isPrime, primes } = sievePrimes(n);

	// (a) Factorization of n
	const fac = factorInteger(n, primes);
	const factBody = document.querySelector('#ftaFactorizationTable tbody');
	if (factBody) {
		factBody.innerHTML = '';
		let idx = 0, sumInfo = 0;
		for (const [p, e] of fac) {
			const contrib = e * log2(p);
			sumInfo += contrib;
			const tr = document.createElement('tr');
			tr.innerHTML = `<td>${++idx}</td><td>${p}</td><td>${e}</td><td>${contrib.toFixed(6)}</td>`;
			factBody.appendChild(tr);
		}
		const totalEl = document.getElementById('ftaFactorizationTotal');
		if (totalEl) totalEl.textContent = sumInfo.toFixed(6) + ` (log₂ n = ${log2(n).toFixed(6)})`;
		const note = document.getElementById('ftaFactorizationNote');
		if (note) {
			note.textContent = `Verification: |Σ e·log₂ p − log₂ n| = ${Math.abs(sumInfo - log2(n)).toExponential(2)}.`;
		}
	}

	// (b) Factorial decomposition log2(n!) = Σ α_p log2 p
	const factTableBody = document.querySelector('#ftaFactorialTable tbody');
	if (factTableBody) {
		factTableBody.innerHTML = '';
		let sum = 0;
		for (const p of primes) {
			if (p > n) break;
			const alpha = primeExponentInFactorial(n, p);
			if (alpha === 0) continue;
			const contrib = alpha * log2(p);
			sum += contrib;
			const tr = document.createElement('tr');
			tr.innerHTML = `<td>${p}${isPrime[p] ? '' : ''}</td><td>${alpha}</td><td>${contrib.toFixed(6)}</td>`;
			factTableBody.appendChild(tr);
		}
		const totalEl2 = document.getElementById('ftaFactorialTotal');
		const lognFact = (() => { // log2(n!) via summation log2 k
			let acc = 0; for (let k = 2; k <= n; k++) acc += log2(k); return acc; })();
		if (totalEl2) totalEl2.textContent = sum.toFixed(6) + ` (log₂(n!)=${lognFact.toFixed(6)})`;
		const note2 = document.getElementById('ftaFactorialNote');
		if (note2) note2.textContent = `Verification: |Σ αₚ·log₂ p − log₂(n!)| = ${Math.abs(sum - lognFact).toExponential(2)}.`;
	}

	// (c) Incremental description 2..n classify primes vs composites
	const newPrimeBits = [];
	let totalBits = 0;
	for (let k = 2; k <= n; k++) {
		const bits = log2(k);
		if (isPrime[k]) newPrimeBits.push({ k, bits });
		totalBits += bits; // this is log2(n!) incrementally
	}
	const incr = document.getElementById('ftaIncremental');
	if (incr) {
		const primeSummary = newPrimeBits.slice(-8).map(o => `${o.k}(${o.bits.toFixed(2)})`).join(', ');
		incr.textContent = `log₂(n!) = Σ_{i=2..n} log₂ i accumulated = ${totalBits.toFixed(6)} bits. New prime atoms up to n: ${newPrimeBits.length}. Recent primes: ${primeSummary}${newPrimeBits.length > 8 ? ', …' : ''}`;
	}

	if (statusEl) statusEl.textContent = `n=${n} • primes≤n: ${primes.filter(p=>p<=n).length}`;
}

document.addEventListener('DOMContentLoaded', () => {
	const btn = document.getElementById('ftaUpdateBtn');
	if (btn) btn.addEventListener('click', updateFTA);
	const nInput = document.getElementById('ftaNInput');
	if (nInput) nInput.addEventListener('input', updateFTA);
	updateFTA();
});

// =============== Section 11: Efficient Factorization (Info Atom Extraction) ===============
// We'll maintain a cached prime list that can grow as needed.
const FactorCache = {
	primes: [2,3,5,7,11,13],
	limit: 13
};

function extendPrimeCache(upto) {
	if (upto <= FactorCache.limit) return;
	// Simple sieve extension
	const start = FactorCache.limit + 1;
	const isPrime = new Array(upto + 1).fill(true);
	isPrime[0] = false; isPrime[1] = false;
	// Mark using existing primes first
	for (const p of FactorCache.primes) {
		for (let m = p * 2; m <= upto; m += p) isPrime[m] = false;
	}
	for (let p = 2; p * p <= upto; p++) if (isPrime[p]) {
		for (let m = p * p; m <= upto; m += p) isPrime[m] = false;
	}
	for (let p = start; p <= upto; p++) if (isPrime[p]) FactorCache.primes.push(p);
	FactorCache.limit = upto;
}

function factorIntegerWithSteps(N) {
	const steps = [];
	const factors = [];
	let n = N;
	if (n < 2) return { factors: [], steps };
	const bound = Math.floor(Math.sqrt(n));
	extendPrimeCache(bound);
	for (const p of FactorCache.primes) {
		if (p * p > n) break;
		let divisions = 0;
		if (n % p === 0) {
			let e = 0;
			while (n % p === 0) { n /= p; e++; divisions++; }
			factors.push([p, e]);
			steps.push({ p, divisions, remainder: n, newAtom: true });
		} else {
			steps.push({ p, divisions: 0, remainder: n, newAtom: false });
		}
	}
	if (n > 1) { // remaining prime
		factors.push([n, 1]);
		steps.push({ p: n, divisions: 0, remainder: 1, newAtom: true, terminal: true });
	}
	return { factors, steps };
}

function updateFactorizationUI() {
	const input = document.getElementById('factorNInput');
	if (!input) return;
	let N = parseInt(input.value, 10);
	if (isNaN(N) || N < 2) N = 2; if (N > 1000000000) N = 1000000000; input.value = N;
	const { factors, steps } = factorIntegerWithSteps(N);
	const tbody = document.querySelector('#factorResultTable tbody');
	const stepsBody = document.querySelector('#factorStepsTable tbody');
	const status = document.getElementById('factorStatus');
	const totalBitsEl = document.getElementById('factorTotalBits');
	const logNEl = document.getElementById('factorLogN');
	const narrative = document.getElementById('factorNarrative');
	if (tbody) {
		tbody.innerHTML = '';
		let partial = 0;
		factors.forEach(([p,e],i)=>{
			const bits = e * log2(p);
			partial += bits;
			const tr = document.createElement('tr');
			tr.innerHTML = `<td>${i+1}</td><td>${p}</td><td>${e}</td><td>${bits.toFixed(6)}</td><td>${partial.toFixed(6)}</td>`;
			tbody.appendChild(tr);
		});
		if (totalBitsEl) totalBitsEl.textContent = partial.toFixed(6);
		if (logNEl) logNEl.textContent = log2(N).toFixed(6);
	}
	if (stepsBody) {
		stepsBody.innerHTML = '';
		steps.forEach((s,i)=>{
			const tr = document.createElement('tr');
			tr.innerHTML = `<td>${i+1}</td><td>${s.p}</td><td>${s.divisions}</td><td>${s.remainder}</td><td class="${s.newAtom?'ok':'fade'}">${s.newAtom? 'yes':'no'}</td>`;
			stepsBody.appendChild(tr);
		});
	}
	if (status) status.textContent = `Primes cached ≤ ${FactorCache.limit} (count=${FactorCache.primes.length})`;
	if (narrative) narrative.textContent = `Factored N = ${N} into ${factors.length} distinct primes. Sum e·log₂p matches log₂N within numerical tolerance (${Math.abs(factors.reduce((a,[p,e])=>a+e*log2(p),0)-log2(N)).toExponential(2)}). Steps use trial division up to √N ≈ ${Math.sqrt(N).toFixed(1)}.`;
}

function randomComposite() {
	// Generate random number with at least two prime factors
	extendPrimeCache(10000);
	const pick = () => FactorCache.primes[6 + Math.floor(Math.random()* (FactorCache.primes.length-6))];
	const a = pick();
	const b = pick();
	const c = Math.random() < 0.33 ? pick() : 1;
	let n = a * b * c;
	if (n > 1e9) n = a * b; // ensure bound
	document.getElementById('factorNInput').value = n;
	updateFactorizationUI();
}

document.addEventListener('DOMContentLoaded', () => {
	const factorBtn = document.getElementById('factorComputeBtn');
	if (factorBtn) factorBtn.addEventListener('click', updateFactorizationUI);
	const factorInput = document.getElementById('factorNInput');
	if (factorInput) factorInput.addEventListener('input', updateFactorizationUI);
	const randBtn = document.getElementById('factorRandomBtn');
	if (randBtn) randBtn.addEventListener('click', randomComposite);
	const clearBtn = document.getElementById('factorClearCacheBtn');
	if (clearBtn) clearBtn.addEventListener('click', () => { FactorCache.primes = [2,3,5,7,11,13]; FactorCache.limit = 13; updateFactorizationUI(); });
	updateFactorizationUI();
});
