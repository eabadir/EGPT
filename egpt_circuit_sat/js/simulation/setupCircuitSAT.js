/* Copyright 2023-2025 by Essam Abadir */

/**
 * createCircuitSATSetup - Setup factory for Circuit SAT experiments.
 *
 * Builds a half-adder and lets particles diffuse through it via brownian
 * motion. Logic gates are density-activated conditional boundaries.
 *
 * Layout (4 horizontal channels with dual-exit chambers):
 *
 *   Row 1: [Bat A] ===wire=== [ctrl] [XOR gate] [chamber row1] ===wire=== [Probe SUM]  === [Sink A]
 *   Row 2: [Bat B] ===wire=== [ctrl] [XOR gate] [chamber row2] ===wire=== [Probe SUM]  === [Sink B]
 *   Row 3: [Bat A'] ==wire=== [ctrl] [AND gate] [chamber row3] ===wire=== [Probe CARRY] == [Sink A]
 *   Row 4: [Bat B'] ==wire=== [ctrl] [AND gate] [chamber row4] ===wire=== [Probe CARRY] == [Sink B]
 *
 * Each gate has two horizontal input wires (one per control input).
 * The gate body spans both input rows with a full divider wall keeping
 * rows completely separated. After the gate body, each row has its own
 * independent passage through the chamber with its own exit. Both rows'
 * output wires lead to the same probe. No mixing gap = no backflow
 * contamination between rows.
 *
 * Circuit SAT mapping:
 *   - Input variables = batteries ON/OFF
 *   - Logic gates = density-activated walls
 *   - Output = probes; SAT iff particles reach detector
 *   - Signal propagation = physical (1px/tick)
 *
 * @param {Object} context - { universe, canvas_rect }
 * @param {Object} options - Optional overrides
 */
(function () {
    let Circuit, CircuitGate, Rectangle, LargeObject, CollisionTypes, CollisionActions;
    if (typeof module !== 'undefined') {
        const circuitObjs = require('../game/CircuitObjects.js');
        Circuit = circuitObjs.Circuit;
        CircuitGate = circuitObjs.CircuitGate;
        Rectangle = require('../engine/engine.node.js').Rectangle;
        const gameObjs = require('../game/EntropyGameObjects.js');
        LargeObject = gameObjs.LargeObject;
        CollisionTypes = gameObjs.CollisionTypes;
        CollisionActions = gameObjs.CollisionActions;
    } else {
        Circuit = window.Circuit;
        CircuitGate = window.CircuitGate;
        Rectangle = window.Rectangle;
        LargeObject = window.LargeObject;
        CollisionTypes = window.CollisionTypes;
        CollisionActions = window.CollisionActions;
    }

    function createCircuitSATSetup(context, options = {}) {
        const { canvas_rect, universe } = context;

        const wireWidth = options.wireWidth || 10;
        const emissionRate = options.emissionRate || 3;
        const voltage = options.voltage || 2;
        const gateThreshold = options.gateThreshold || 3;
        const inputA = options.inputA !== undefined ? options.inputA : true;
        const inputB = options.inputB !== undefined ? options.inputB : true;
        const fundamentalDim = 0;
        const wallThick = options.wallThickness || 6;

        // Initialize universe: ground-up mode with brownian motion
        universe.init(canvas_rect, fundamentalDim, 1, false, false, false, false, false);
        universe.brownianMotion = true;
        universe.withInterQuantumCollisions = true;

        const circuit = new Circuit(context, {
            wireWidth: wireWidth,
            wallThickness: wallThick,
            fundamentalDim: fundamentalDim,
            gateThreshold: gateThreshold,
            gateWindowTicks: 60,
        });

        // Layout: 4 rows, each a simple horizontal channel
        const margin = 40;
        const rowHeight = wireWidth + 2 * wallThick + 2;
        const totalRows = 4;
        const totalHeight = totalRows * rowHeight;
        const startY = Math.round((canvas_rect.h - totalHeight) / 2);

        const row1Y = startY + rowHeight * 0.5;   // XOR input A
        const row2Y = startY + rowHeight * 1.5;   // XOR input B
        const row3Y = startY + rowHeight * 2.5;   // AND input A
        const row4Y = startY + rowHeight * 3.5;   // AND input B

        // Column positions
        const batX = margin;
        const gateX = Math.round(canvas_rect.w * 0.45);
        const probeX = Math.round(canvas_rect.w * 0.75);
        const sinkX = canvas_rect.w - margin;

        const termSize = wireWidth;
        const halfTerm = termSize / 2;
        const gateLen = 8;
        const halfGate = gateLen / 2;
        const chamberLen = 20; // shorter chamber since no mixing needed
        const halfWire = wireWidth / 2;

        // Control region placement
        const ctrlLen = 20;
        const ctrlGap = 20;
        const ctrlX = gateX - halfGate - ctrlGap - ctrlLen;

        // Wire X positions
        const inputWireX1 = batX - halfTerm;
        const inputWireX2 = gateX - halfGate + wallThick;
        const chamberRightX = gateX + halfGate + chamberLen;
        const outputWireX1 = chamberRightX - wallThick;
        const outputWireX2 = sinkX + halfTerm;

        // Gate center Y positions
        const xorY = (row1Y + row2Y) / 2;
        const andY = (row3Y + row4Y) / 2;

        // Divider Y positions (horizontal wall between rows within each gate section)
        const xorDividerY = (row1Y + row2Y) / 2 - wallThick / 2;
        const andDividerY = (row3Y + row4Y) / 2 - wallThick / 2;

        // Full divider length: from gate body left edge through entire chamber
        const fullDividerLen = (chamberRightX + wallThick) - (gateX - halfGate);

        // Extra walls to collect
        const extraWalls = [];

        // === Helper: create a bi-directional divider wall ===
        // A single LargeObject can only reposition in one direction.
        // To properly separate two rows, we need TWO walls stacked together:
        // - Upper half pushes particles back UP (toward upper row)
        // - Lower half pushes particles back DOWN (toward lower row)
        // This prevents cross-contamination regardless of which side a particle enters from.
        function addBiDivider(x, dividerY, width, label) {
            const upperH = Math.ceil(wallThick / 2);
            const lowerH = wallThick - upperH;
            extraWalls.push(new LargeObject(
                context, [60, 60, 80],
                new Rectangle(x, dividerY, width, upperH, null, false),
                CollisionTypes.WALL, [], label + "_UP", "top"
            ));
            extraWalls.push(new LargeObject(
                context, [60, 60, 80],
                new Rectangle(x, dividerY + upperH, width, lowerH, null, false),
                CollisionTypes.WALL, [], label + "_DN", "bottom"
            ));
        }

        // === Helper: create a dual-exit chamber section ===
        // The chamber has a full divider separating the two rows. Each row
        // gets its own exit gap in the right wall, and its own output wire.
        function createDualExitChamber(upperRowY, lowerRowY, dividerY, label) {
            const chamberLeftX = gateX + halfGate;
            // Extend top/bottom walls to cover the gate body zone too,
            // preventing particles from escaping vertically around the gate body
            const extendedLeftX = gateX - halfGate;
            const extendedLen = chamberLen + gateLen; // gate body + chamber

            // Top wall (above upper row) — spans gate body through chamber
            extraWalls.push(new LargeObject(
                context, [60, 60, 80],
                new Rectangle(extendedLeftX, upperRowY - halfWire - wallThick, extendedLen, wallThick, null, false),
                CollisionTypes.WALL, [], label + "_TOP", "bottom"
            ));

            // Bottom wall (below lower row) — spans gate body through chamber
            extraWalls.push(new LargeObject(
                context, [60, 60, 80],
                new Rectangle(extendedLeftX, lowerRowY + halfWire, extendedLen, wallThick, null, false),
                CollisionTypes.WALL, [], label + "_BOTTOM", "top"
            ));

            // Right wall: three segments with two exit gaps (one per row)
            // Segment 1: above upper row exit (from top wall bottom to upper row top)
            // (not needed — top wall already blocks above)

            // Segment 2: between upper row exit and divider
            const seg2Top = upperRowY + halfWire;
            const seg2Height = dividerY - seg2Top;
            if (seg2Height > 0) {
                extraWalls.push(new LargeObject(
                    context, [60, 60, 80],
                    new Rectangle(chamberRightX, seg2Top, wallThick, seg2Height, null, false),
                    CollisionTypes.WALL, [], label + "_RIGHT_MID1", "left"
                ));
            }

            // Segment 3: between divider and lower row exit
            const seg3Top = dividerY + wallThick;
            const seg3Height = (lowerRowY - halfWire) - seg3Top;
            if (seg3Height > 0) {
                extraWalls.push(new LargeObject(
                    context, [60, 60, 80],
                    new Rectangle(chamberRightX, seg3Top, wallThick, seg3Height, null, false),
                    CollisionTypes.WALL, [], label + "_RIGHT_MID2", "left"
                ));
            }

            // Segment 4: below lower row exit (from lower row bottom to chamber bottom)
            // (not needed — bottom wall already blocks below)
        }

        // === XOR SECTION ===

        // Battery A → XOR input wire (row 1)
        const batA1 = circuit.addBattery(batX, row1Y, sinkX, row1Y, emissionRate, termSize, voltage);
        batA1.setEnabled(inputA);
        circuit.addWire(inputWireX1, row1Y, inputWireX2, row1Y, wireWidth);

        // Battery B → XOR input wire (row 2)
        const batB1 = circuit.addBattery(batX, row2Y, sinkX, row2Y, emissionRate, termSize, voltage);
        batB1.setEnabled(inputB);
        circuit.addWire(inputWireX1, row2Y, inputWireX2, row2Y, wireWidth);

        // Input divider between rows 1 and 2
        const xorInputDividerY = row1Y + halfWire + wallThick;
        const xorInputDividerH = (row2Y - halfWire - wallThick) - xorInputDividerY;
        if (xorInputDividerH > 0) {
            const upperH = Math.ceil(xorInputDividerH / 2);
            const lowerH = xorInputDividerH - upperH;
            const divWidth = inputWireX2 - inputWireX1;
            extraWalls.push(new LargeObject(
                context, [60, 60, 80],
                new Rectangle(inputWireX1, xorInputDividerY, divWidth, upperH, null, false),
                CollisionTypes.WALL, [], "XOR_INPUT_DIV_UP", "top"
            ));
            if (lowerH > 0) {
                extraWalls.push(new LargeObject(
                    context, [60, 60, 80],
                    new Rectangle(inputWireX1, xorInputDividerY + upperH, divWidth, lowerH, null, false),
                    CollisionTypes.WALL, [], "XOR_INPUT_DIV_DN", "bottom"
                ));
            }
        }

        // XOR gate body — spans rows 1 and 2
        const xorGateHeight = row2Y - row1Y + wireWidth;
        const xorGate = circuit.addGate('XOR', gateX, xorY, xorGateHeight, gateLen, true, {
            thresholdHigh: gateThreshold,
            thresholdLow: Math.max(1, gateThreshold - 1),
        });

        // Control regions
        xorGate.addControlRegion(new Rectangle(ctrlX, row1Y - wireWidth / 2, ctrlLen, wireWidth, null, false));
        xorGate.addControlRegion(new Rectangle(ctrlX, row2Y - wireWidth / 2, ctrlLen, wireWidth, null, false));

        // Full divider: keeps rows 1 and 2 completely separated through
        // gate body AND entire chamber. No mixing gap = no backflow.
        // Uses bi-directional walls to push particles back to their own row.
        addBiDivider(gateX - halfGate, xorDividerY, fullDividerLen, "XOR_DIVIDER");

        // Dual-exit chamber for XOR
        createDualExitChamber(row1Y, row2Y, xorDividerY, "XOR_CHAMBER");

        // XOR output: both rows get independent output wires to the same SUM probe
        // Row 1 output wire
        circuit.addWire(outputWireX1, row1Y, probeX - halfTerm, row1Y, wireWidth);
        // Row 2 output wire
        circuit.addWire(outputWireX1, row2Y, probeX - halfTerm, row2Y, wireWidth);
        // SUM probe spans both rows
        const probeSumHeight = row2Y - row1Y + wireWidth;
        const probeSUM = circuit.addProbe(probeX, xorY, 'SUM', probeSumHeight);
        // Post-probe wires to sinks
        circuit.addWire(probeX + halfTerm, row1Y, outputWireX2, row1Y, wireWidth);
        circuit.addWire(probeX + halfTerm, row2Y, outputWireX2, row2Y, wireWidth);

        // Output divider between rows 1 and 2 (same as input divider, for output section)
        const xorOutputDividerY = row1Y + halfWire + wallThick;
        const xorOutputDividerH = (row2Y - halfWire - wallThick) - xorOutputDividerY;
        if (xorOutputDividerH > 0) {
            const upperH = Math.ceil(xorOutputDividerH / 2);
            const lowerH = xorOutputDividerH - upperH;
            const divWidth = outputWireX2 - outputWireX1;
            extraWalls.push(new LargeObject(
                context, [60, 60, 80],
                new Rectangle(outputWireX1, xorOutputDividerY, divWidth, upperH, null, false),
                CollisionTypes.WALL, [], "XOR_OUTPUT_DIV_UP", "top"
            ));
            if (lowerH > 0) {
                extraWalls.push(new LargeObject(
                    context, [60, 60, 80],
                    new Rectangle(outputWireX1, xorOutputDividerY + upperH, divWidth, lowerH, null, false),
                    CollisionTypes.WALL, [], "XOR_OUTPUT_DIV_DN", "bottom"
                ));
            }
        }

        // === AND SECTION ===

        // Battery A → AND input wire (row 3)
        const batA2 = circuit.addBattery(batX, row3Y, sinkX, row3Y, emissionRate, termSize, voltage);
        batA2.setEnabled(inputA);
        circuit.addWire(inputWireX1, row3Y, inputWireX2, row3Y, wireWidth);

        // Battery B → AND input wire (row 4)
        const batB2 = circuit.addBattery(batX, row4Y, sinkX, row4Y, emissionRate, termSize, voltage);
        batB2.setEnabled(inputB);
        circuit.addWire(inputWireX1, row4Y, inputWireX2, row4Y, wireWidth);

        // Input divider between rows 3 and 4
        const andInputDividerY = row3Y + halfWire + wallThick;
        const andInputDividerH = (row4Y - halfWire - wallThick) - andInputDividerY;
        if (andInputDividerH > 0) {
            const upperH = Math.ceil(andInputDividerH / 2);
            const lowerH = andInputDividerH - upperH;
            const divWidth = inputWireX2 - inputWireX1;
            extraWalls.push(new LargeObject(
                context, [60, 60, 80],
                new Rectangle(inputWireX1, andInputDividerY, divWidth, upperH, null, false),
                CollisionTypes.WALL, [], "AND_INPUT_DIV_UP", "top"
            ));
            if (lowerH > 0) {
                extraWalls.push(new LargeObject(
                    context, [60, 60, 80],
                    new Rectangle(inputWireX1, andInputDividerY + upperH, divWidth, lowerH, null, false),
                    CollisionTypes.WALL, [], "AND_INPUT_DIV_DN", "bottom"
                ));
            }
        }

        // AND gate body — spans rows 3 and 4
        const andGateHeight = row4Y - row3Y + wireWidth;
        const andGate = circuit.addGate('AND', gateX, andY, andGateHeight, gateLen, true, {
            thresholdHigh: gateThreshold,
            thresholdLow: Math.max(1, gateThreshold - 1),
        });

        // Control regions
        andGate.addControlRegion(new Rectangle(ctrlX, row3Y - wireWidth / 2, ctrlLen, wireWidth, null, false));
        andGate.addControlRegion(new Rectangle(ctrlX, row4Y - wireWidth / 2, ctrlLen, wireWidth, null, false));

        // Full divider for AND gate body + chamber
        addBiDivider(gateX - halfGate, andDividerY, fullDividerLen, "AND_DIVIDER");

        // Dual-exit chamber for AND
        createDualExitChamber(row3Y, row4Y, andDividerY, "AND_CHAMBER");

        // AND output: both rows get independent output wires to the same CARRY probe
        circuit.addWire(outputWireX1, row3Y, probeX - halfTerm, row3Y, wireWidth);
        circuit.addWire(outputWireX1, row4Y, probeX - halfTerm, row4Y, wireWidth);
        const probeCarryHeight = row4Y - row3Y + wireWidth;
        const probeCARRY = circuit.addProbe(probeX, andY, 'CARRY', probeCarryHeight);
        circuit.addWire(probeX + halfTerm, row3Y, outputWireX2, row3Y, wireWidth);
        circuit.addWire(probeX + halfTerm, row4Y, outputWireX2, row4Y, wireWidth);

        // Output divider between rows 3 and 4
        const andOutputDividerY = row3Y + halfWire + wallThick;
        const andOutputDividerH = (row4Y - halfWire - wallThick) - andOutputDividerY;
        if (andOutputDividerH > 0) {
            const upperH = Math.ceil(andOutputDividerH / 2);
            const lowerH = andOutputDividerH - upperH;
            const divWidth = outputWireX2 - outputWireX1;
            extraWalls.push(new LargeObject(
                context, [60, 60, 80],
                new Rectangle(outputWireX1, andOutputDividerY, divWidth, upperH, null, false),
                CollisionTypes.WALL, [], "AND_OUTPUT_DIV_UP", "top"
            ));
            if (lowerH > 0) {
                extraWalls.push(new LargeObject(
                    context, [60, 60, 80],
                    new Rectangle(outputWireX1, andOutputDividerY + upperH, divWidth, lowerH, null, false),
                    CollisionTypes.WALL, [], "AND_OUTPUT_DIV_DN", "bottom"
                ));
            }
        }

        // === SECTION SEPARATOR ===
        // Bi-directional wall between XOR and AND sections (fills gap between row2 and row3).
        // Upper half pushes XOR particles back up, lower half pushes AND particles back down.
        const separatorY = row2Y + halfWire;
        const separatorHeight = Math.max((row3Y - halfWire - wallThick) - separatorY, wallThick);
        const sepWidth = outputWireX2 - inputWireX1;
        const sepUpperH = Math.ceil(separatorHeight / 2);
        const sepLowerH = separatorHeight - sepUpperH;
        extraWalls.push(new LargeObject(
            context, [60, 60, 80],
            new Rectangle(inputWireX1, separatorY, sepWidth, sepUpperH, null, false),
            CollisionTypes.WALL, [], "SEPARATOR_UP", "top"
        ));
        if (sepLowerH > 0) {
            extraWalls.push(new LargeObject(
                context, [60, 60, 80],
                new Rectangle(inputWireX1, separatorY + sepUpperH, sepWidth, sepLowerH, null, false),
                CollisionTypes.WALL, [], "SEPARATOR_DN", "bottom"
            ));
        }

        // Add everything to universe
        circuit.addToUniverse();
        for (const wall of extraWalls) {
            wall.addToUniverse();
        }

        return {
            universe,
            circuit,
            batteries: { A: [batA1, batA2], B: [batB1, batB2] },
            gates: { XOR: xorGate, AND: andGate },
            probes: { SUM: probeSUM, CARRY: probeCARRY },
            setInputA: (enabled) => { batA1.setEnabled(enabled); batA2.setEnabled(enabled); },
            setInputB: (enabled) => { batB1.setEnabled(enabled); batB2.setEnabled(enabled); },
            getCircuitState: () => circuit.getCircuitState(),
        };
    }

    if (typeof module !== 'undefined') {
        module.exports = { createCircuitSATSetup };
    } else {
        window.createCircuitSATSetup = createCircuitSATSetup;
    }
})();
