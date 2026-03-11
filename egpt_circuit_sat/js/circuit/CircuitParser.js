/* Copyright 2023-2025 by Essam Abadir */

/**
 * CircuitParser.js — Parse circuit descriptions into a normalized netlist.
 *
 * Supports two formats:
 *   1. Custom JSON — maps directly to EGPT circuit components
 *   2. BLIF (Berkeley Logic Interchange Format) — standard for combinational logic / SAT
 *
 * The parser produces a normalized netlist object that CircuitLayout can
 * convert into spatial positions, and that the setup factories can use
 * to build Circuit objects.
 *
 * Netlist format:
 * {
 *   name: string,
 *   inputs: string[],          // input node names (batteries)
 *   outputs: string[],         // output node names (probes/detectors)
 *   nodes: string[],           // all intermediate node names
 *   components: [
 *     { type: 'battery', name, from, to, rate },
 *     { type: 'wire', from, to, width },
 *     { type: 'gate', name, gateType, inputs: [], output },
 *     { type: 'resistor', from, to, resistance },
 *     { type: 'probe', name, node },
 *   ]
 * }
 */

(function () {

    /**
     * Parse a custom JSON circuit description.
     * The JSON format maps 1:1 to the netlist format.
     *
     * @param {Object|string} json - Circuit description (object or JSON string)
     * @returns {Object} Normalized netlist
     */
    function parseJSON(json) {
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }

        const netlist = {
            name: json.name || 'unnamed_circuit',
            inputs: [],
            outputs: [],
            nodes: json.nodes || [],
            components: [],
        };

        for (const comp of (json.components || [])) {
            switch (comp.type) {
                case 'battery':
                    netlist.components.push({
                        type: 'battery',
                        name: comp.name || 'B_' + netlist.components.length,
                        from: comp.from,
                        to: comp.to,
                        rate: comp.rate || 5,
                    });
                    if (!netlist.inputs.includes(comp.from)) netlist.inputs.push(comp.from);
                    break;

                case 'wire':
                    netlist.components.push({
                        type: 'wire',
                        from: comp.from,
                        to: comp.to,
                        width: comp.width || 6,
                    });
                    break;

                case 'gate':
                    netlist.components.push({
                        type: 'gate',
                        name: comp.name || comp.gateType + '_' + netlist.components.length,
                        gateType: comp.gateType,
                        inputs: comp.inputs || [],
                        output: comp.output,
                    });
                    break;

                case 'resistor':
                    netlist.components.push({
                        type: 'resistor',
                        from: comp.from,
                        to: comp.to,
                        resistance: comp.resistance || 0.5,
                    });
                    break;

                case 'probe':
                    netlist.components.push({
                        type: 'probe',
                        name: comp.name || 'P_' + netlist.components.length,
                        node: comp.node,
                    });
                    if (!netlist.outputs.includes(comp.node)) netlist.outputs.push(comp.node);
                    break;

                case 'ground':
                    netlist.components.push({
                        type: 'ground',
                        name: comp.name || 'GND_' + netlist.components.length,
                        node: comp.node,
                    });
                    break;

                default:
                    console.warn('[CircuitParser] Unknown component type:', comp.type);
            }
        }

        return netlist;
    }

    /**
     * Parse a BLIF (Berkeley Logic Interchange Format) netlist.
     *
     * BLIF format:
     *   .model <name>
     *   .inputs <input1> <input2> ...
     *   .outputs <output1> <output2> ...
     *   .names <in1> <in2> ... <out>
     *   <truth table rows: input pattern space output value>
     *   .end
     *
     * The truth table determines the gate type:
     *   AND: 11 1           (output 1 only when all inputs 1)
     *   OR:  1- 1 / -1 1    (output 1 when any input 1)
     *   NOT: 0 1             (output 1 when input 0)
     *   XOR: 10 1 / 01 1    (output 1 when inputs differ)
     *   BUFFER: 1 1          (output 1 when input 1)
     *
     * @param {string} blifSource - BLIF source text
     * @returns {Object} Normalized netlist
     */
    function parseBLIF(blifSource) {
        const lines = blifSource.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

        const netlist = {
            name: 'blif_circuit',
            inputs: [],
            outputs: [],
            nodes: [],
            components: [],
        };

        let i = 0;
        let currentNames = null; // current .names block being parsed
        let currentTruthTable = [];

        function flushNamesBlock() {
            if (!currentNames) return;

            const inputs = currentNames.slice(0, -1);
            const output = currentNames[currentNames.length - 1];
            const gateType = inferGateType(inputs, currentTruthTable);

            netlist.components.push({
                type: 'gate',
                name: gateType + '_' + output,
                gateType: gateType,
                inputs: inputs,
                output: output,
            });

            // Ensure output is in nodes list
            if (!netlist.nodes.includes(output)) netlist.nodes.push(output);
            for (const inp of inputs) {
                if (!netlist.nodes.includes(inp)) netlist.nodes.push(inp);
            }

            currentNames = null;
            currentTruthTable = [];
        }

        while (i < lines.length) {
            const line = lines[i];

            if (line.startsWith('.model')) {
                flushNamesBlock();
                netlist.name = line.split(/\s+/)[1] || 'blif_circuit';
            } else if (line.startsWith('.inputs')) {
                flushNamesBlock();
                const parts = line.split(/\s+/).slice(1);
                netlist.inputs.push(...parts);
                // Continuation lines (backslash)
                while (i + 1 < lines.length && lines[i].endsWith('\\')) {
                    i++;
                    netlist.inputs.push(...lines[i].replace('\\', '').trim().split(/\s+/));
                }
            } else if (line.startsWith('.outputs')) {
                flushNamesBlock();
                const parts = line.split(/\s+/).slice(1);
                netlist.outputs.push(...parts);
                while (i + 1 < lines.length && lines[i].endsWith('\\')) {
                    i++;
                    netlist.outputs.push(...lines[i].replace('\\', '').trim().split(/\s+/));
                }
            } else if (line.startsWith('.names')) {
                flushNamesBlock();
                currentNames = line.split(/\s+/).slice(1);
                currentTruthTable = [];
            } else if (line.startsWith('.end')) {
                flushNamesBlock();
                break;
            } else if (line.startsWith('.')) {
                flushNamesBlock();
                // Skip other directives (.latch, .clock, etc.)
            } else if (currentNames) {
                // Truth table row
                currentTruthTable.push(line);
            }

            i++;
        }
        flushNamesBlock();

        // Auto-generate wires: connect each gate's inputs to prior gate outputs or circuit inputs
        // and add batteries for each circuit input, probes for each output
        for (const input of netlist.inputs) {
            netlist.components.push({
                type: 'battery',
                name: 'B_' + input,
                from: input + '_src',
                to: input + '_gnd',
                rate: 5,
            });
        }

        for (const output of netlist.outputs) {
            netlist.components.push({
                type: 'probe',
                name: 'P_' + output,
                node: output,
            });
        }

        return netlist;
    }

    /**
     * Infer the gate type from a truth table.
     * Handles common combinational logic patterns.
     */
    function inferGateType(inputs, truthTable) {
        const numInputs = inputs.length;

        if (numInputs === 1) {
            // Single input: NOT or BUFFER
            if (truthTable.length === 1) {
                const row = truthTable[0].split(/\s+/);
                if (row[0] === '0' && row[1] === '1') return 'NOT';
                if (row[0] === '1' && row[1] === '1') return 'BUFFER';
            }
            // Default: check if it's an inverter
            for (const line of truthTable) {
                const parts = line.split(/\s+/);
                if (parts[0] === '0') return 'NOT';
            }
            return 'BUFFER';
        }

        if (numInputs === 2) {
            // Two inputs: AND, OR, XOR, NAND, NOR
            const onRows = truthTable.filter(l => {
                const parts = l.split(/\s+/);
                return parts[parts.length - 1] === '1';
            }).map(l => l.split(/\s+/)[0]);

            if (onRows.length === 1 && onRows[0] === '11') return 'AND';
            if (onRows.length === 3 || (onRows.length === 2 && onRows.includes('1-') && onRows.includes('-1'))) return 'OR';
            if (onRows.length === 2 && onRows.includes('10') && onRows.includes('01')) return 'XOR';

            // Check for OR with explicit rows
            if (onRows.length >= 2 && (onRows.includes('10') || onRows.includes('1-')) && (onRows.includes('01') || onRows.includes('-1'))) return 'OR';
        }

        // Multi-input: check for all-ones = AND pattern
        if (truthTable.length === 1) {
            const row = truthTable[0].split(/\s+/);
            if (row[0] === '1'.repeat(numInputs)) return 'AND';
        }

        // Check for any-one = OR pattern (using don't cares)
        const hasDontCare = truthTable.some(l => l.includes('-'));
        if (hasDontCare) return 'OR';

        // Default to AND for single truth table row
        return truthTable.length <= 1 ? 'AND' : 'OR';
    }

    /**
     * Parse a circuit description in either JSON or BLIF format.
     * Auto-detects format based on content.
     *
     * @param {string|Object} source - Circuit description
     * @returns {Object} Normalized netlist
     */
    function parseCircuit(source) {
        if (typeof source === 'object') {
            return parseJSON(source);
        }

        const trimmed = source.trim();

        // BLIF detection: starts with .model or .inputs
        if (trimmed.startsWith('.model') || trimmed.startsWith('.inputs') || trimmed.startsWith('.names')) {
            return parseBLIF(trimmed);
        }

        // Try JSON
        try {
            return parseJSON(JSON.parse(trimmed));
        } catch (e) {
            throw new Error('[CircuitParser] Unable to detect format. Expected JSON object or BLIF (.model/.inputs/.names)');
        }
    }

    // Built-in example circuits
    const EXAMPLE_CIRCUITS = {
        series: {
            name: 'series_circuit',
            nodes: ['VCC', 'GND', 'A', 'B'],
            components: [
                { type: 'battery', name: 'B1', from: 'VCC', to: 'GND', rate: 5 },
                { type: 'wire', from: 'VCC', to: 'A' },
                { type: 'resistor', from: 'A', to: 'B', resistance: 0.5 },
                { type: 'wire', from: 'B', to: 'GND' },
                { type: 'probe', name: 'P_A', node: 'A' },
                { type: 'probe', name: 'P_B', node: 'B' },
            ],
        },

        half_adder: {
            name: 'half_adder',
            nodes: ['A', 'B', 'SUM', 'CARRY', 'A_src', 'A_gnd', 'B_src', 'B_gnd'],
            components: [
                { type: 'battery', name: 'B_A', from: 'A_src', to: 'A_gnd', rate: 5 },
                { type: 'battery', name: 'B_B', from: 'B_src', to: 'B_gnd', rate: 5 },
                { type: 'wire', from: 'A_src', to: 'XOR1_in' },
                { type: 'wire', from: 'B_src', to: 'XOR1_in' },
                { type: 'gate', name: 'XOR1', gateType: 'XOR', inputs: ['A', 'B'], output: 'SUM' },
                { type: 'gate', name: 'AND1', gateType: 'AND', inputs: ['A', 'B'], output: 'CARRY' },
                { type: 'probe', name: 'P_SUM', node: 'SUM' },
                { type: 'probe', name: 'P_CARRY', node: 'CARRY' },
            ],
        },

        half_adder_blif: `.model half_adder
.inputs A B
.outputs SUM CARRY
.names A B SUM
10 1
01 1
.names A B CARRY
11 1
.end`,

        not_gate: {
            name: 'not_gate_test',
            nodes: ['IN', 'OUT', 'IN_src', 'IN_gnd'],
            components: [
                { type: 'battery', name: 'B_IN', from: 'IN_src', to: 'IN_gnd', rate: 5 },
                { type: 'wire', from: 'IN_src', to: 'NOT1_ctrl' },
                { type: 'gate', name: 'NOT1', gateType: 'NOT', inputs: ['IN'], output: 'OUT' },
                { type: 'probe', name: 'P_OUT', node: 'OUT' },
            ],
        },
    };

    // Export
    if (typeof module !== 'undefined') {
        module.exports = { parseJSON, parseBLIF, parseCircuit, inferGateType, EXAMPLE_CIRCUITS };
    } else {
        window.parseJSON = parseJSON;
        window.parseBLIF = parseBLIF;
        window.parseCircuit = parseCircuit;
        window.inferGateType = inferGateType;
        window.EXAMPLE_CIRCUITS = EXAMPLE_CIRCUITS;
    }
})();
