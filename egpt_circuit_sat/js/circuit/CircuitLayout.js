/* Copyright 2023-2025 by Essam Abadir */

/**
 * CircuitLayout.js — Convert a parsed netlist into spatial positions.
 *
 * Uses Manhattan routing (horizontal + vertical segments only) on the pixel grid.
 * Components are placed in columns left-to-right:
 *   batteries → input wires → gates (topologically sorted) → output probes
 *
 * The layout engine produces a placement map: node_name → { x, y }
 * which the setup factories use to position CircuitObjects.
 */

(function () {

    /**
     * Layout a circuit netlist into spatial positions.
     *
     * @param {Object} netlist - Parsed netlist from CircuitParser
     * @param {Object} options - Layout options
     * @param {number} options.originX - Top-left X of layout area (default 50)
     * @param {number} options.originY - Top-left Y of layout area (default 50)
     * @param {number} options.wireWidth - Channel width (default 6)
     * @param {number} options.columnSpacing - Horizontal spacing between component columns (default 80)
     * @param {number} options.rowSpacing - Vertical spacing between parallel components (default 40)
     * @param {number} options.canvasWidth - Available canvas width (default 600)
     * @param {number} options.canvasHeight - Available canvas height (default 600)
     *
     * @returns {Object} Layout result:
     *   {
     *     nodePositions: Map<string, {x, y}>,
     *     componentPlacements: Array<{component, x, y, ...}>,
     *     wires: Array<{from: {x,y}, to: {x,y}, ...}>,
     *     bounds: {minX, minY, maxX, maxY}
     *   }
     */
    function layoutCircuit(netlist, options = {}) {
        const originX = options.originX || 50;
        const originY = options.originY || 50;
        const columnSpacing = options.columnSpacing || 80;
        const rowSpacing = options.rowSpacing || 40;
        const wireWidth = options.wireWidth || 6;
        const canvasWidth = options.canvasWidth || 600;
        const canvasHeight = options.canvasHeight || 600;

        const nodePositions = {};
        const componentPlacements = [];
        const wirePlacements = [];

        // Step 1: Identify component layers via topological sort
        const gates = netlist.components.filter(c => c.type === 'gate');
        const batteries = netlist.components.filter(c => c.type === 'battery');
        const probes = netlist.components.filter(c => c.type === 'probe');
        const resistors = netlist.components.filter(c => c.type === 'resistor');

        // Build dependency graph for gates
        const gateByOutput = {};
        for (const gate of gates) {
            gateByOutput[gate.output] = gate;
        }

        // Topological sort of gates by dependency depth
        const gateDepth = {};
        function getDepth(gateName) {
            if (gateDepth[gateName] !== undefined) return gateDepth[gateName];
            const gate = gateByOutput[gateName];
            if (!gate) return 0; // Input node, no depth
            let maxInputDepth = 0;
            for (const inp of gate.inputs) {
                maxInputDepth = Math.max(maxInputDepth, getDepth(inp) + 1);
            }
            gateDepth[gateName] = maxInputDepth;
            return maxInputDepth;
        }

        for (const gate of gates) {
            getDepth(gate.output);
        }

        // Group gates by depth level
        const gateLevels = {};
        let maxLevel = 0;
        for (const gate of gates) {
            const depth = gateDepth[gate.output] || 0;
            if (!gateLevels[depth]) gateLevels[depth] = [];
            gateLevels[depth].push(gate);
            maxLevel = Math.max(maxLevel, depth);
        }

        // Step 2: Place batteries (column 0)
        const batteryCol = originX;
        const inputNodes = netlist.inputs.length > 0 ? netlist.inputs : batteries.map(b => b.from);
        const totalInputHeight = inputNodes.length * rowSpacing;
        const inputStartY = originY + Math.max(0, (canvasHeight - 2 * originY - totalInputHeight) / 2);

        for (let i = 0; i < batteries.length; i++) {
            const bat = batteries[i];
            const y = inputStartY + i * rowSpacing + rowSpacing / 2;

            // Source (+ terminal) on the left
            const srcX = batteryCol;
            const srcY = y;

            // Find which input this battery corresponds to
            const inputName = bat.from.replace('_src', '');
            nodePositions[bat.from] = { x: srcX, y: srcY };
            nodePositions[inputName] = { x: srcX + columnSpacing / 2, y: srcY };

            componentPlacements.push({
                component: bat,
                type: 'battery',
                sourceX: srcX,
                sourceY: srcY,
            });
        }

        // Step 3: Place gates by level
        for (let level = 0; level <= maxLevel; level++) {
            const levelGates = gateLevels[level] || [];
            const colX = originX + (level + 1) * columnSpacing;
            const totalGateHeight = levelGates.length * rowSpacing;
            const gateStartY = originY + Math.max(0, (canvasHeight - 2 * originY - totalGateHeight) / 2);

            for (let j = 0; j < levelGates.length; j++) {
                const gate = levelGates[j];
                const gateY = gateStartY + j * rowSpacing + rowSpacing / 2;
                const gateX = colX;

                nodePositions[gate.output] = { x: gateX + columnSpacing / 2, y: gateY };

                // Place control region positions for gate inputs
                const controlPositions = [];
                for (let k = 0; k < gate.inputs.length; k++) {
                    const ctrlY = gateY - (gate.inputs.length - 1) * (wireWidth + 4) / 2 + k * (wireWidth + 4);
                    controlPositions.push({ x: gateX - wireWidth, y: ctrlY });
                }

                componentPlacements.push({
                    component: gate,
                    type: 'gate',
                    x: gateX,
                    y: gateY,
                    controlPositions: controlPositions,
                });
            }
        }

        // Step 4: Place probes and ground sinks (last column)
        const probeColX = originX + (maxLevel + 2) * columnSpacing;
        const sinkColX = probeColX + columnSpacing;

        for (let i = 0; i < probes.length; i++) {
            const probe = probes[i];
            const probeNode = probe.node;
            // Position probe near the output node
            const sourcePos = nodePositions[probeNode];
            const py = sourcePos ? sourcePos.y : originY + i * rowSpacing + rowSpacing / 2;

            nodePositions['probe_' + probe.name] = { x: probeColX, y: py };

            componentPlacements.push({
                component: probe,
                type: 'probe',
                x: probeColX,
                y: py,
            });
        }

        // Place battery sinks (ground terminals)
        for (let i = 0; i < batteries.length; i++) {
            const bat = batteries[i];
            const srcPos = nodePositions[bat.from];
            if (srcPos) {
                nodePositions[bat.to] = { x: sinkColX, y: srcPos.y };
                componentPlacements.push({
                    component: bat,
                    type: 'battery_sink',
                    x: sinkColX,
                    y: srcPos.y,
                });
            }
        }

        // Step 5: Generate wire connections (Manhattan routing)
        // Connect each gate input to its source node
        for (const placement of componentPlacements) {
            if (placement.type === 'gate') {
                const gate = placement.component;
                for (let k = 0; k < gate.inputs.length; k++) {
                    const inputName = gate.inputs[k];
                    const fromPos = nodePositions[inputName];
                    const toPos = placement.controlPositions[k];

                    if (fromPos && toPos) {
                        // Manhattan route: horizontal then vertical
                        const midX = (fromPos.x + toPos.x) / 2;
                        if (Math.abs(fromPos.y - toPos.y) < 2) {
                            // Direct horizontal wire
                            wirePlacements.push({ from: fromPos, to: toPos, width: wireWidth });
                        } else {
                            // L-shaped route
                            const corner = { x: toPos.x, y: fromPos.y };
                            wirePlacements.push({ from: fromPos, to: corner, width: wireWidth });
                            wirePlacements.push({ from: corner, to: toPos, width: wireWidth });
                        }
                    }
                }

                // Connect gate output to its output node
                const outPos = nodePositions[gate.output];
                if (outPos) {
                    wirePlacements.push({
                        from: { x: placement.x + 8, y: placement.y },
                        to: outPos,
                        width: wireWidth,
                    });
                }
            }
        }

        // Connect probes to their source nodes
        for (const placement of componentPlacements) {
            if (placement.type === 'probe') {
                const probeNode = placement.component.node;
                const fromPos = nodePositions[probeNode];
                if (fromPos) {
                    wirePlacements.push({
                        from: fromPos,
                        to: { x: placement.x, y: placement.y },
                        width: wireWidth,
                    });
                }
            }
        }

        // Connect battery sources to sinks via the circuit (through output column)
        for (const placement of componentPlacements) {
            if (placement.type === 'battery_sink') {
                // Wire from probe column area to sink
                const sinkPos = nodePositions[placement.component.to];
                const srcPos = nodePositions[placement.component.from];
                if (sinkPos && srcPos) {
                    // Route along the bottom or top edge to avoid crossing
                    const routeY = originY + canvasHeight - 2 * originY - 10;
                    wirePlacements.push({ from: { x: probeColX + wireWidth, y: srcPos.y }, to: { x: probeColX + wireWidth, y: routeY }, width: wireWidth });
                    wirePlacements.push({ from: { x: probeColX + wireWidth, y: routeY }, to: { x: sinkPos.x, y: routeY }, width: wireWidth });
                    wirePlacements.push({ from: { x: sinkPos.x, y: routeY }, to: sinkPos, width: wireWidth });
                }
            }
        }

        // Compute bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const [, pos] of Object.entries(nodePositions)) {
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x);
            maxY = Math.max(maxY, pos.y);
        }

        return {
            nodePositions,
            componentPlacements,
            wires: wirePlacements,
            bounds: { minX, minY, maxX, maxY },
        };
    }

    // Export
    if (typeof module !== 'undefined') {
        module.exports = { layoutCircuit };
    } else {
        window.layoutCircuit = layoutCircuit;
    }
})();
