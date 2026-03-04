import React, { useMemo } from 'react';
import { calculateEntropy } from '../hooks/useSquareSpiral';

interface PathCalculatorProps {
  path: number[];
  onRemovePathItem: (index: number) => void;
  onClearPath: () => void;
}

const formatBigInt = (n: bigint): string => {
    const s = n.toString();
    const isNegative = s[0] === '-';
    const numStr = isNegative ? s.substring(1) : s;

    // Show smaller numbers as-is.
    if (numStr.length < 10) {
        return s;
    }

    const exponent = numStr.length - 1;
    // We want 2 decimal places, so we need the first 3 digits. Pad with zeros if needed.
    const mantissa = numStr.substring(0, 3).padEnd(3, '0');
    const formattedMantissa = `${mantissa[0]}.${mantissa.substring(1)}`;

    return `${isNegative ? '-' : ''}${formattedMantissa}e+${exponent}`;
}

export const PathCalculator: React.FC<PathCalculatorProps> = ({ path, onRemovePathItem, onClearPath }) => {
    const { productOfNs, sumOfEntropies, entropyOfProduct, productIsTooLarge } = useMemo(() => {
        if (path.length === 0) {
            return { productOfNs: 0n, sumOfEntropies: 0, entropyOfProduct: 0, productIsTooLarge: false };
        }

        // Use BigInt for product to avoid overflow. Handle 0s by treating them as 1s in multiplication.
        const product = path.reduce((acc, n) => acc * BigInt(n || 1), 1n);
        const sum = path.reduce((acc, n) => acc + calculateEntropy(n), 0);
        
        let isTooLarge = false;
        let entropyOfProd = 0;

        if (product > BigInt(Number.MAX_SAFE_INTEGER)) {
            isTooLarge = true;
        } else {
            entropyOfProd = calculateEntropy(Number(product));
        }

        return { 
            productOfNs: product, 
            sumOfEntropies: sum, 
            entropyOfProduct: entropyOfProd, 
            productIsTooLarge: isTooLarge 
        };
    }, [path]);

    const difference = Math.abs(sumOfEntropies - entropyOfProduct);

  return (
    <div className="bg-slate-800/50 rounded-lg shadow-xl p-4 space-y-4 flex flex-col h-full">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-violet-400">Path Construction</h3>
            <button
                onClick={onClearPath}
                disabled={path.length === 0}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Clear Path
            </button>
        </div>

        <div className="flex-grow bg-slate-900/50 rounded-lg p-2 space-y-2 overflow-y-auto min-h-[10rem]">
            <h4 className="text-sm text-slate-400 px-1">Path Steps (Addresses)</h4>
            <ul className="space-y-1">
                {path.length > 0 ? path.map((n, i) => (
                    <li key={`${n}-${i}`} className="flex items-center justify-between bg-slate-800/70 rounded p-2 text-cyan-300 font-mono text-sm transition-all hover:bg-slate-800">
                        <span><span className="text-slate-500 mr-2">{i+1}.</span>{n}</span>
                        <button 
                            onClick={() => onRemovePathItem(i)} 
                            aria-label={`Remove step ${i+1} with value ${n}`}
                            className="text-red-400 hover:text-red-300 font-bold text-lg px-2 rounded-full leading-none transition-colors"
                        >
                            &times;
                        </button>
                    </li>
                )) : (
                    <li className="text-slate-500 italic not-font-mono text-center p-4">Path is empty. Add addresses from the control panel.</li>
                )}
            </ul>
        </div>
        
        {path.length > 0 && (
        <div className="space-y-3">
            <h4 className="text-md font-semibold text-slate-400 text-center">Path Analysis</h4>
            
            <div className="bg-slate-900/50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Path Product (Π N)</span>
                    <span className="text-base font-mono text-slate-200" title={productOfNs.toString()}>{formatBigInt(productOfNs)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Sum of Entropies (Σ e(N))</span>
                    <span className="text-base font-mono text-violet-300" title={sumOfEntropies.toString()}>{sumOfEntropies.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Entropy of Product (e(Π N))</span>
                    <span className="text-base font-mono text-violet-300" title={productIsTooLarge ? "Product too large to calculate entropy" : entropyOfProduct.toString()}>
                        {productIsTooLarge ? 'N/A' : entropyOfProduct.toFixed(4)}
                    </span>
                </div>
                <div className="border-t border-slate-700 my-1"></div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Difference</span>
                    <span className="text-base font-mono text-slate-400" title={difference.toString()}>{productIsTooLarge ? 'N/A' : difference.toFixed(4)}</span>
                </div>
            </div>

            <p className="text-xs text-slate-500 text-center leading-relaxed p-2 bg-slate-900/30 rounded">
                This confirms that our custom entropy metric `e(N)` behaves like a logarithm. Adding entropies in "log space" is equivalent to multiplying addresses in normal space, demonstrating the property: <b className="text-slate-400 font-mono">log(a*b) = log(a)+log(b)</b>. The small difference arises from the discrete, integer-based nature of the spiral.
            </p>
        </div>
        )}
    </div>
  );
};