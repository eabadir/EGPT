/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useCallback } from 'react';
import { factorize } from './math';

interface PrimeCodesPageProps {
    onNavigate: (path: string) => void;
}

const PrimeCodesPage: React.FC<PrimeCodesPageProps> = ({ onNavigate }) => {
    const [n, setN] = useState(12);

    const handleNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 2;
        if (val < 2) val = 2;
        if (val > 100000) val = 100000; // Keep N reasonable for performance
        setN(val);
    };

    const randomN = useCallback(() => {
        setN(Math.floor(Math.random() * 200) + 2);
    }, []);

    const renderPath = (num: number, maxLength = 60) => {
        if (num * 2 > maxLength) {
            const side = Math.floor((maxLength - 5) / 2);
            return `[${'1,'.repeat(side)}...,${'0,'.repeat(side-1)}0]`;
        }
        const ones = Array(num).fill('1').join(',');
        const zeros = Array(num).fill('0').join(',');
        return `[${ones},${zeros}]`;
    };

    const analysis = useMemo(() => {
        const divisors = factorize(n).map(pair => pair.P).sort((a, b) => a - b);
        divisors.push(n); // Add n to its own list of divisors from factorize
        const uniqueDivisors = [...new Set(divisors)];
        const isPrime = uniqueDivisors.length === 2; // Divisors are 1 and N
        const properDivisors = uniqueDivisors.filter(d => d > 1 && d < n);

        return { isPrime, properDivisors };
    }, [n]);


    return (
        <>
            <header>
                <h1>EGPT Prime Shannon Codes</h1>
                <div className="small">Visualizing Factorization as ParticlePath Decomposition</div>
                <a href="#/" className="back-link" onClick={(e) => { e.preventDefault(); onNavigate('/'); }}>&larr; Back to Demos</a>
            </header>
            <main id="prime-codes-page" className="flex">
                <section className="panel">
                    <h3>1. Input Number</h3>
                    <p>Enter a number `N` to see its EGPT ParticlePath representation and its informational structure.</p>
                    <label htmlFor="nInput">Enter a number N (2 – 100,000)</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input id="nInput" type="number" min="2" max="100000" value={n} onChange={handleNChange} />
                        <button id="randomNBtn" title="Select a random number" onClick={randomN}>Random</button>
                    </div>
                </section>

                <section className="panel">
                    <h3>2. ParticlePath Representation</h3>
                    <p>In EGPT, a number `N` is physically represented by a symmetric path of `N` 'up' steps (1s) and `N` 'down' steps (0s).</p>
                    <div><strong>Path({n}) =</strong> <span className="path-code">{renderPath(n)}</span></div>
                    <div className="small" style={{ marginTop: '.5rem' }}>Total path length = 2n = {2 * n} steps.</div>
                </section>

                <section className="panel full-width">
                    <h3>3. Code Analysis and Decomposition</h3>
                    <p>A number's prime or composite nature determines if its ParticlePath is "informationally irreducible" or can be decomposed into repeating, smaller sub-paths corresponding to its factors.</p>
                    
                    {analysis.isPrime ? (
                        <>
                            <div className="status-badge status-prime">Prime Shannon Code</div>
                            <p style={{ marginTop: '.75rem' }}>
                                <strong>{n} is a prime number.</strong> Its ParticlePath is an irreducible "information atom". It cannot be constructed by repeating any smaller path other than the trivial Path(1).
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="status-badge status-composite">Composite Shannon Code</div>
                            <p style={{ marginTop: '.75rem' }}>
                                <strong>{n} is a composite number.</strong> Its ParticlePath can be perfectly constructed by repeating the paths of its divisors. This transforms factorization into a structural analysis of the code.
                            </p>
                            {analysis.properDivisors.map(d => (
                                <div className="decomposition-block" key={d}>
                                    <h4>Decomposition by Factor {d}</h4>
                                    <div>Path({n}) is composed of <strong>{n/d}</strong> repetitions of Path({d}).</div>
                                    <div className="small">Path({d}) = <span className="path-code">{renderPath(d)}</span></div>
                                </div>
                            ))}
                        </>
                    )}
                </section>

                <section className="panel full-width">
                    <h3>4. Decomposition via Recursive Structural Analysis</h3>
                    <p>
                        On the <strong>Rota's Entropy</strong> demo, we saw how information accumulates recursively, like building a binary tree where each level adds a fixed amount of entropy (<code>H_n+1 = H_n + H_1</code>). Code decomposition can be viewed as the inverse process: we start with the final code and recursively analyze its structure to find the fundamental "prime codes" that generated it.
                    </p>
                    <p>
                        Our hypothesis is that a composite code <code>Path(N)</code> is formed by repeating a smaller, more fundamental code, <code>Path(d)</code>. This transforms factorization into a search for periodicity. For example, <code>Path(6)</code> is just <code>Path(2)</code> repeated 3 times, or <code>Path(3)</code> repeated 2 times. The goal is to find these repeating sub-structures.
                    </p>
                    <p>
                        The most efficient way to search for structure is a "divide and conquer" strategy. The simplest check is a <strong>binary split</strong>: can <code>Path(N)</code> be constructed from two identical halves? This is only possible if N is even, where <code>Path(N)</code> would be composed of two <code>Path(N/2)</code> codes. This mirrors the logic of balanced binary search trees (like Red-Black Trees), which achieve <code>O(log n)</code> efficiency by recursively halving the search space at each step. While not all numbers are even, this "binary split" thinking guides our approach to recursively breaking down the problem.
                    </p>
                    <p>
                        We apply this recursive mindset to find the smallest possible repeating sub-code. If a code <code>Path(N)</code> cannot be decomposed by any structural repetition (other than the trivial <code>Path(1)</code>), we define it as a <strong>prime code class</strong>. It is an informationally irreducible "atom" that serves as a fundamental building block for all larger composite codes. This aligns perfectly with the Rota framework, where the system's properties are derived from its irreducible components.
                    </p>
                </section>

                <section className="panel full-width">
                    <h3>5. Conclusion</h3>
                    <p>
                        This model recasts number theory into the language of information and computation. Factorization is no longer just an arithmetic procedure but a search for periodic, repeating sub-structures within a number's canonical code.
                    </p>
                     <ul>
                        <li><strong>Prime Numbers</strong> are fundamental, aperiodic codes that cannot be compressed or described by smaller components.</li>
                        <li><strong>Composite Numbers</strong> are repetitive, structured codes whose complexity is defined by the prime codes that construct them.</li>
                    </ul>
                    <p>This perspective aligns with Rota's axioms, where the information (entropy) of a system is additive over its independent components. Here, the "components" of a number are its prime factors, and the "additivity" is reflected in the structural decomposition of its code.</p>
                </section>
                <div className="footerNote">An EGPT Interactive Teaching Tool. All computations are performed client-side.</div>
            </main>
        </>
    );
};

export default PrimeCodesPage;