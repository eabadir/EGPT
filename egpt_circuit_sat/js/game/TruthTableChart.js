/* Copyright 2023-2025 by Essam Abadir */

/**
 * TruthTableChart.js - Data collection and D3-based visualization for
 * circuit SAT truth table sweep experiments.
 *
 * TruthTableCollector: State machine that cycles through all 4 input
 * combinations of a half-adder, recording probe flow rates for each.
 *
 * TruthTableChart: D3-based report renderer that displays expected vs
 * observed truth table results with a grouped bar chart.
 */

(function () {

    /**
     * TruthTableCollector - Data collection state machine for sweep mode.
     * Cycles through all 4 input combinations (A,B), letting the circuit
     * settle for each, then collects flow rate data from probes.
     *
     * @param {Object} satSetup - Return value of createCircuitSATSetup()
     * @param {Object} options - { settleTickCount, flushTicks, probeThreshold }
     */
    class TruthTableCollector {
        constructor(satSetup, options = {}) {
            this.satSetup = satSetup;
            this.settleTickCount = options.settleTickCount || 400;
            this.flushTicks = options.flushTicks || 20;
            this.probeThreshold = options.probeThreshold || 3;

            this.combinations = [
                { a: false, b: false },
                { a: false, b: true },
                { a: true, b: false },
                { a: true, b: true },
            ];

            this.results = new Map();
            this.results.set("0,0", { flowRates: { SUM: [], CARRY: [] }, finalState: null });
            this.results.set("0,1", { flowRates: { SUM: [], CARRY: [] }, finalState: null });
            this.results.set("1,0", { flowRates: { SUM: [], CARRY: [] }, finalState: null });
            this.results.set("1,1", { flowRates: { SUM: [], CARRY: [] }, finalState: null });

            this.expectedTruthTable = {
                "0,0": { SUM: false, CARRY: false },
                "0,1": { SUM: true, CARRY: false },
                "1,0": { SUM: true, CARRY: false },
                "1,1": { SUM: false, CARRY: true },
            };

            this.sweepState = {
                running: false,
                phase: 'IDLE',
                currentComboIndex: 0,
                ticksInCurrentCombo: 0,
            };

            this.originalInputA = true;
            this.originalInputB = true;
            this.onComplete = null;
        }

        /**
         * Start the sweep. Saves original input state, applies first combination.
         * @param {Function} onComplete - Callback when all 4 combinations are done
         */
        startSweep(onComplete) {
            this.onComplete = onComplete;

            // Save original input state
            this.originalInputA = this.satSetup.batteries.A[0].enabled;
            this.originalInputB = this.satSetup.batteries.B[0].enabled;

            // Reset state
            this.sweepState.running = true;
            this.sweepState.phase = 'SETTLING';
            this.sweepState.currentComboIndex = 0;
            this.sweepState.ticksInCurrentCombo = 0;

            // Apply first combination
            this._applyCurrentCombo();
        }

        /** Per-tick function. Call this every tick while sweep is running. */
        tick() {
            if (this.sweepState.phase === 'IDLE' || this.sweepState.phase === 'COMPLETE') {
                return;
            }

            this.sweepState.ticksInCurrentCombo++;

            const key = this.getCurrentComboKey();
            const result = this.results.get(key);

            // Flush period: skip recording to let old particles clear
            if (this.sweepState.ticksInCurrentCombo <= this.flushTicks) {
                return;
            }

            // Record flow rates
            const state = this.satSetup.getCircuitState();
            if (state.SUM) result.flowRates.SUM.push(state.SUM.flowRate);
            if (state.CARRY) result.flowRates.CARRY.push(state.CARRY.flowRate);

            // Check if this combination is done
            if (this.sweepState.ticksInCurrentCombo >= this.settleTickCount + this.flushTicks) {
                // Store final state
                result.finalState = this.satSetup.getCircuitState();

                // Advance to next combination
                this.sweepState.currentComboIndex++;

                if (this.sweepState.currentComboIndex >= this.combinations.length) {
                    // All done
                    this.sweepState.phase = 'COMPLETE';
                    this.sweepState.running = false;

                    // Restore original inputs
                    this.satSetup.setInputA(this.originalInputA);
                    this.satSetup.setInputB(this.originalInputB);

                    if (this.onComplete) {
                        this.onComplete();
                    }
                } else {
                    // Apply next combination
                    this.sweepState.ticksInCurrentCombo = 0;
                    this._applyCurrentCombo();
                }
            }
        }

        /** Get the current combination key string "A,B" */
        getCurrentComboKey() {
            const combo = this.combinations[this.sweepState.currentComboIndex];
            if (!combo) return "0,0";
            return (combo.a ? "1" : "0") + "," + (combo.b ? "1" : "0");
        }

        /** Get structured summary of results for chart rendering */
        getSummary() {
            const summary = {};
            for (const [key, result] of this.results) {
                const expected = this.expectedTruthTable[key];
                const observed = result.finalState || { SUM: { flowRate: 0, isHigh: false }, CARRY: { flowRate: 0, isHigh: false } };

                const sumFlowRates = result.flowRates.SUM;
                const carryFlowRates = result.flowRates.CARRY;

                const avgSumFlow = sumFlowRates.length > 0
                    ? sumFlowRates.reduce((a, b) => a + b, 0) / sumFlowRates.length : 0;
                const avgCarryFlow = carryFlowRates.length > 0
                    ? carryFlowRates.reduce((a, b) => a + b, 0) / carryFlowRates.length : 0;

                const observedSUM = observed.SUM ? observed.SUM.isHigh : false;
                const observedCARRY = observed.CARRY ? observed.CARRY.isHigh : false;

                summary[key] = {
                    expected: expected,
                    observed: {
                        SUM: observedSUM,
                        CARRY: observedCARRY,
                    },
                    flowRates: {
                        SUM: avgSumFlow,
                        CARRY: avgCarryFlow,
                    },
                    correct: (expected.SUM === observedSUM) && (expected.CARRY === observedCARRY),
                };
            }
            return summary;
        }

        /** Check if sweep is complete */
        isComplete() {
            return this.sweepState.phase === 'COMPLETE';
        }

        /** Apply current combination inputs to the circuit */
        _applyCurrentCombo() {
            const combo = this.combinations[this.sweepState.currentComboIndex];
            this.satSetup.setInputA(combo.a);
            this.satSetup.setInputB(combo.b);
        }
    }

    /**
     * TruthTableChart - D3-based report rendering for truth table sweep results.
     * Follows the InterferenceChart pattern from charting.js.
     *
     * @param {Object} options - { width, height }
     */
    class TruthTableChart {
        constructor(options = {}) {
            this.width = options.width || 500;
            this.height = options.height || 400;
        }

        /**
         * Render the truth table report into a container div.
         * @param {HTMLElement} chartDiv - Container element (DOM element, not p5 wrapper)
         * @param {Object} summary - Output of TruthTableCollector.getSummary()
         */
        showChart(chartDiv, summary) {
            // Handle both p5 elements and raw DOM elements
            const container = chartDiv.elt ? chartDiv.elt : chartDiv;

            // Clear previous content
            container.innerHTML = '';

            // Apply dark theme styling
            container.style.backgroundColor = '#1a1a1a';
            container.style.color = '#95a3ab';
            container.style.padding = '20px';
            container.style.fontFamily = 'monospace';
            container.style.overflowY = 'auto';

            // Title
            const title = document.createElement('h3');
            title.textContent = 'Half-Adder Truth Table Report';
            title.style.color = '#b6161c';
            title.style.textAlign = 'center';
            title.style.marginBottom = '15px';
            container.appendChild(title);

            // Build HTML truth table
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginBottom = '20px';
            table.style.fontSize = '14px';

            // Header row
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['A', 'B', 'SUM (exp)', 'SUM (obs)', 'CARRY (exp)', 'CARRY (obs)'];
            for (const h of headers) {
                const th = document.createElement('th');
                th.textContent = h;
                th.style.padding = '8px 12px';
                th.style.borderBottom = '2px solid #444';
                th.style.textAlign = 'center';
                th.style.color = '#95a3ab';
                headerRow.appendChild(th);
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Data rows
            const tbody = document.createElement('tbody');
            const comboKeys = ["0,0", "0,1", "1,0", "1,1"];
            let correctCount = 0;

            for (const key of comboKeys) {
                const row = document.createElement('tr');
                const data = summary[key];
                if (!data) continue;

                if (data.correct) correctCount++;

                const parts = key.split(',');
                const aVal = parts[0];
                const bVal = parts[1];

                // A column
                this._addCell(row, aVal, '#333');
                // B column
                this._addCell(row, bVal, '#333');

                // SUM expected
                this._addCell(row, data.expected.SUM ? 'HIGH' : 'LOW', '#2a2a2a');

                // SUM observed
                const sumMatch = data.expected.SUM === data.observed.SUM;
                const sumBg = sumMatch ? '#2d5a2d' : '#5a2d2d';
                const sumText = (data.observed.SUM ? 'HIGH' : 'LOW') + ' (' + data.flowRates.SUM.toFixed(1) + ')';
                this._addCell(row, sumText, sumBg);

                // CARRY expected
                this._addCell(row, data.expected.CARRY ? 'HIGH' : 'LOW', '#2a2a2a');

                // CARRY observed
                const carryMatch = data.expected.CARRY === data.observed.CARRY;
                const carryBg = carryMatch ? '#2d5a2d' : '#5a2d2d';
                const carryText = (data.observed.CARRY ? 'HIGH' : 'LOW') + ' (' + data.flowRates.CARRY.toFixed(1) + ')';
                this._addCell(row, carryText, carryBg);

                tbody.appendChild(row);
            }
            table.appendChild(tbody);
            container.appendChild(table);

            // D3 grouped bar chart
            this._renderBarChart(container, summary, comboKeys);

            // Pass/Fail summary
            const summaryLine = document.createElement('p');
            summaryLine.style.textAlign = 'center';
            summaryLine.style.fontSize = '18px';
            summaryLine.style.fontWeight = 'bold';
            summaryLine.style.marginTop = '15px';
            const allCorrect = correctCount === 4;
            summaryLine.style.color = allCorrect ? '#4CAF50' : '#f44336';
            summaryLine.textContent = 'Half-adder: ' + correctCount + '/4 correct';
            container.appendChild(summaryLine);
        }

        /** Helper: add a cell to a table row */
        _addCell(row, text, bgColor) {
            const td = document.createElement('td');
            td.textContent = text;
            td.style.padding = '8px 12px';
            td.style.textAlign = 'center';
            td.style.borderBottom = '1px solid #333';
            td.style.backgroundColor = bgColor || 'transparent';
            row.appendChild(td);
        }

        /** Render D3 grouped bar chart showing flow rates */
        _renderBarChart(container, summary, comboKeys) {
            if (typeof d3 === 'undefined') return;

            const chartDiv = document.createElement('div');
            chartDiv.style.textAlign = 'center';
            container.appendChild(chartDiv);

            const margin = { top: 30, right: 30, bottom: 40, left: 50 };
            const w = this.width - margin.left - margin.right;
            const h = this.height - margin.top - margin.bottom;

            const svg = d3.select(chartDiv)
                .append('svg')
                .attr('width', this.width)
                .attr('height', this.height)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // Prepare data
            const barData = [];
            for (const key of comboKeys) {
                const data = summary[key];
                if (data) {
                    barData.push({ combo: key, type: 'SUM', value: data.flowRates.SUM });
                    barData.push({ combo: key, type: 'CARRY', value: data.flowRates.CARRY });
                }
            }

            // X scale: combo groups
            const x0 = d3.scaleBand()
                .domain(comboKeys)
                .range([0, w])
                .padding(0.3);

            // X1 scale: bars within each group
            const x1 = d3.scaleBand()
                .domain(['SUM', 'CARRY'])
                .range([0, x0.bandwidth()])
                .padding(0.1);

            // Y scale
            const maxVal = d3.max(barData, function (d) { return d.value; }) || 10;
            const y = d3.scaleLinear()
                .domain([0, maxVal * 1.2])
                .range([h, 0]);

            // Color scale
            const colorMap = { SUM: '#4a9eff', CARRY: '#ff9f43' };

            // X axis
            svg.append('g')
                .attr('transform', 'translate(0,' + h + ')')
                .call(d3.axisBottom(x0))
                .selectAll('text')
                .style('fill', '#95a3ab');
            svg.selectAll('.domain, .tick line').style('stroke', '#555');

            // Y axis
            svg.append('g')
                .call(d3.axisLeft(y).ticks(5))
                .selectAll('text')
                .style('fill', '#95a3ab');

            // X axis label
            svg.append('text')
                .attr('x', w / 2)
                .attr('y', h + 35)
                .attr('text-anchor', 'middle')
                .style('fill', '#95a3ab')
                .style('font-size', '12px')
                .text('Input Combination (A,B)');

            // Y axis label
            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -h / 2)
                .attr('y', -40)
                .attr('text-anchor', 'middle')
                .style('fill', '#95a3ab')
                .style('font-size', '12px')
                .text('Flow Rate');

            // Bars
            const groups = svg.selectAll('.combo-group')
                .data(comboKeys)
                .enter()
                .append('g')
                .attr('transform', function (d) { return 'translate(' + x0(d) + ',0)'; });

            groups.selectAll('rect')
                .data(function (combo) {
                    const data = summary[combo];
                    return [
                        { type: 'SUM', value: data ? data.flowRates.SUM : 0 },
                        { type: 'CARRY', value: data ? data.flowRates.CARRY : 0 },
                    ];
                })
                .enter()
                .append('rect')
                .attr('x', function (d) { return x1(d.type); })
                .attr('y', function (d) { return y(d.value); })
                .attr('width', x1.bandwidth())
                .attr('height', function (d) { return h - y(d.value); })
                .attr('fill', function (d) { return colorMap[d.type]; })
                .attr('rx', 2);

            // Threshold line
            // Use a default threshold of 3 (matches default gateThreshold)
            const threshold = 3;
            svg.append('line')
                .attr('x1', 0)
                .attr('x2', w)
                .attr('y1', y(threshold))
                .attr('y2', y(threshold))
                .attr('stroke', '#f44336')
                .attr('stroke-dasharray', '5,5')
                .attr('stroke-width', 1.5);

            svg.append('text')
                .attr('x', w - 5)
                .attr('y', y(threshold) - 5)
                .attr('text-anchor', 'end')
                .style('fill', '#f44336')
                .style('font-size', '11px')
                .text('HIGH threshold');

            // Legend
            const legend = svg.append('g')
                .attr('transform', 'translate(' + (w - 100) + ', 0)');

            const legendItems = [
                { label: 'SUM', color: '#4a9eff' },
                { label: 'CARRY', color: '#ff9f43' },
            ];
            legendItems.forEach(function (item, i) {
                legend.append('rect')
                    .attr('x', 0)
                    .attr('y', i * 20)
                    .attr('width', 14)
                    .attr('height', 14)
                    .attr('fill', item.color);
                legend.append('text')
                    .attr('x', 20)
                    .attr('y', i * 20 + 12)
                    .style('fill', '#95a3ab')
                    .style('font-size', '12px')
                    .text(item.label);
            });
        }
    }

    // UMD export
    if (typeof module !== 'undefined') {
        module.exports = { TruthTableCollector, TruthTableChart };
    } else {
        window.TruthTableCollector = TruthTableCollector;
        window.TruthTableChart = TruthTableChart;
    }
})();
