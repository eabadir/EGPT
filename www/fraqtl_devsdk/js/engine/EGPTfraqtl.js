/* Copyright 2023-2025 by Essam Abadir */
/** EGPT FRAQTL VM EDUCATIONAL EDITION
 * The EGPT is a discrete fractal ontology of the universe. The simple model implementing EGPT has only three classes: 
 * - the EGPTUniverse, 
 * - Dimension, 
 * - Quantum/Frame (which should derive from the same baseclass in languages other than javascript). 
 * 
 * FRAMES ONLY MOVE 1 PIXEL PER TICK. "QUANTA" ARE LEAF FRAMES.
* - Move is positional translation: dx and dy
* - Momentum is the vector (vx, vy)
* - NOTE --- "velocity" and "momentum" are the same in EGPTfraqtl.js
 * The fractal/recursive computations produces emergent fundamental behaviours matching observed physics from the 
 * smallest scales (like wave-quantum duality, atom formation), to the largest (gravity and an expanding universe). 
 * The model implements simple quantum collision detection and schocastic random walk movement, 
 * extended with simple frames and layers common to video compression and rendering. Loosely, dimensions of scale 
 * in physics (e.g. the 'quantum' scale or the 'galactic' scale) correspond to a rendering animation layer. 
 * Frame "mass" goes up exponentially with dimensional layer levels. Dimension 0 is an animation layer allowing only 1x1 pixels (Quanta), 
 * Dimension 1 4x4 pixel Frames,Dimension 2 has 4x4 layer 1 Frames (a "mass" of 64pixels), etc..) 
 * 
 * Generally, the implementation attempts to be as efficient as possible in terms of rendering and collision detection. The 
 * goal in rendering and collision detection is to be as close to Shannon's limit as possible. We use structures and techniques 
 * like QuadTrees in order to achieve this.
 * 
 * The educational addition differences from the VM reference design in a few ways to make visualizations more accessible to students and educators.  The primary differences are:
1. Visulizations on Desktop and Mobile Sized Screens: To scrunch down very large physical systems to fit on a screen, the educational edition allows for fractional pixels (quanta) to be displayed and, therefore, floating point numbers are used to represent positions and velocities. This allows for the simulation of very large systems on a screen but, technically, it makes it seem like two objects can occupy the same space. Two objects occupying the same space is a technical violation of a discrete system but, for the purposes of visualization, it is a useful simplification.
2. Simplified Engine Implementation: The educational edition has a simplified implementation of the underlying fractal compression algorithm. It uses a somewhat off the shelf quadtree implementation from Daniel Shifmann's excellent tutorial on the subject (see //Based on code from Daniel Shiffman http://codingtra.in). The quadtree implementation is not strict in forcing single pixel occupancy of space (see point 1) but the end result still has the same fractal compression effect and, but for scaling factors, the same emergent behaviors and computational efficiency.

 */
// our one global variable for all objects in the universe
let quantum_id = 0;
let WAVELENGTH_CONSTANT = 1;
let BROWNIAN_MOTION = false;
let ENABLE_LOGGING = false;
/** When true, logs promotion flow (collisions → handleStructurePromotion → createParentFrame) to trace why parent frames aren't created. */
let DEBUG_PROMOTION = false;

const Spins = {
    UP: 'UP',
    DOWN: 'DOWN'
};

const Charge = {
    POSITIVE: 0,
    NEGATIVE: 1
};

class LightColor {
    static fullnessColorMap = {
        'red': 0.1,
        'orange': 0.2,
        'yellow': 0.3,
        'green': 0.4,
        'cyan': 0.5,
        'blue': 0.6,
        'indigo': 0.7,
        'violet': 0.8,
        'pink': 0.9
    };

    static getRgbColorFromFullness(fullness) {
        if (typeof chroma !== 'undefined') {
            let targetColor = 'red';
            for (const [color, value] of Object.entries(this.fullnessColorMap)) {
                if (fullness <= value) { targetColor = color; break; }
            }
            if (targetColor === 'red') return chroma(targetColor);
            const colors = Object.keys(this.fullnessColorMap);
            const targetIndex = colors.indexOf(targetColor);
            const previousColor = colors[targetIndex - 1];
            const mixRatio = (fullness - this.fullnessColorMap[previousColor]) / (this.fullnessColorMap[targetColor] - this.fullnessColorMap[previousColor]);
            return chroma.mix(previousColor, targetColor, isNaN(mixRatio) ? 0 : mixRatio);
        }
        return null;
    }

    static getColorNameFor(fullness) {
        let targetColor = null;
        for (const [color, value] of Object.entries(this.fullnessColorMap)) {
            if (fullness <= value) {
                targetColor = color;
                break; // Found the ceiling color, exit loop
            }
        }
        return targetColor;
    }

    static getFullnessForColorName(colorName) {
        return this.fullnessColorMap[colorName] !== undefined ? this.fullnessColorMap[colorName] : null;
    }
}

function consoleLog(...args) {
    if (ENABLE_LOGGING) {
        console.log(...args);
    }
}

/**
 * SortableDictionary: key-value store with sorted keys. Used for dimensions (key = layer number).
 * Supports get(key), getNext(currentKey), push(key, value), remove(key), keys(), and iteration.
 */
class SortableDictionary {
    constructor() {
        this.items = [];
        this.keyIndexMap = new Map();
    }

    push(key, value) {
        if (value === undefined) throw new Error("Value cannot be undefined.");
        this.items.push({ key, value });
        this.sortItems();
    }

    sortItems() {
        this.items.sort((a, b) => Number(a.key) - Number(b.key));
        this.keyIndexMap.clear();
        for (let i = 0; i < this.items.length; i++) {
            this.keyIndexMap.set(this.items[i].key, i);
        }
    }

    get(key) {
        const index = this.keyIndexMap.get(key);
        return index !== undefined ? this.items[index].value : undefined;
    }

    getNext(currentKey) {
        const currentIndex = this.keyIndexMap.get(currentKey);
        if (currentIndex !== undefined && currentIndex < this.items.length - 1) {
            return this.items[currentIndex + 1].value;
        }
        return undefined;
    }

    getNextKey(currentKey) {
        const currentIndex = this.keyIndexMap.get(currentKey);
        if (currentIndex !== undefined && currentIndex < this.items.length - 1) {
            return this.items[currentIndex + 1].key;
        }
        return undefined;
    }

    remove(key) {
        const index = this.keyIndexMap.get(key);
        if (index !== undefined) {
            this.items.splice(index, 1);
            this.sortItems();
        }
    }

    get length() {
        return this.items.length;
    }

    get highestKey() {
        return this.items[this.items.length - 1]?.key;
    }

    keys() {
        return this.items.map(item => item.key);
    }

    [Symbol.iterator]() {
        let index = 0;
        return {
            next: () => {
                if (index < this.items.length) {
                    return { value: this.items[index++].value, done: false };
                }
                return { done: true };
            }
        };
    }
}

/**
 * EGPTUniverse — the main simulation engine.
 *
 * Usage: construct, then call init() to configure simulation parameters, then
 * register experiment tick functions, then call doTick() each frame.
 * doTick() returns TickData (pure physics). doRender(tickData) handles P5 drawing.
 */
class EGPTUniverse {

    /**
     * @param {number} fps - Target frames per second (default 60)
     * @param {number} iframe_interval_seconds - Seconds between iframe ticks when Phase B structure building runs (default 1)
     * @param {boolean} withInterQuantumCollisions - Enable inter-frame collisions within the lowest dimension (default false)
     * @param {boolean} withBonding - Enable bonding on collision (default false)
     * @param {boolean} withFrames - Enable frame hierarchy (default true)
     * @param {number|boolean} emergentPhysics - If truthy, engine spawns new dimensions on demand. If 0/false, dimensions must be pre-registered. (default 0)
     * @param {number} minMBFillRate - Minimum fill rate (0-1) for frame creation in generateFrames (default 0.1)
     * @param {Rectangle} universe_rect - Simulation bounds rectangle (default auto-created 1980x1080)
     * @param {number} wavelength_constant - Wavelength/scale constant (default 1)
     * @param {number} lowest_dimension - Initial lowest dimension layer number. NOTE: init() overrides this with fundamental_dimension_number.
     */
    constructor(fps = 60, iframe_interval_seconds = 1, withInterQuantumCollisions = false, withBonding = false, withFrames = true, emergentPhysics = 0, minMBFillRate = .1, universe_rect = null, wavelength_constant = WAVELENGTH_CONSTANT, lowest_dimension = 0) {
        /* Reset Global Variables */
        quantum_id = 0;
        WAVELENGTH_CONSTANT = 1;
        BROWNIAN_MOTION = false;
        ENABLE_LOGGING = false;

        this.enableLogging = ENABLE_LOGGING;
        this.withInterQuantumCollisions = withInterQuantumCollisions;
        this.withBonding = withBonding;
        this.withFrames = withFrames;

        this._fps = fps;
        this._iframe_interval_seconds = 1 / this.fps;
        this._iframe_interval_ticks = Math.floor(this.fps * iframe_interval_seconds);

        this.quanta_tree = null;

        this.emergentPhysics = emergentPhysics;

        this.largeObjects = [];

        this.experimentTickFunctions = [];
        this._emergentPhysics = emergentPhysics;
        this.resetDimensions();

        this.tick = 0;
        this.minMBFillRate = minMBFillRate;
        this.quantaalltime = 0;
        this.quanta_killed = 0;
        this.lowest_dimension = lowest_dimension;
        this.highest_dimension = lowest_dimension;
        this.smallestMBWidth = Math.pow(2, this.lowest_dimension);
        WAVELENGTH_CONSTANT = wavelength_constant;

        //debug counters

        this.universe_rect = universe_rect;

        if (!universe_rect) {
            this.universe_rect = new Rectangle(0, 0, 1980, 1080, null, false);
        }

    }

    resetDimensions() {
        this.dimensions = new SortableDictionary();
        return this.dimensions;
    }

    set enableLogging(value) {
        ENABLE_LOGGING = value;
    }

    /**
     * Configure simulation parameters and create the fundamental dimension.
     * Must be called after construction and before the first doTick().
     *
     * @param {Rectangle} universe_rect - Simulation bounds (required)
     * @param {number} fundamental_dimension_number - Layer number for the fundamental (leaf) dimension. Sets lowest_dimension and smallestMBWidth. (required)
     * @param {number} wavelengthConstant - Wavelength/scale constant (default 1)
     * @param {boolean} isGreedy - Greedy frame packing (default false)
     * @param {boolean} noEscape - Prevent quanta from leaving boundaries (default false)
     * @param {boolean} emergentDimensions - Maps to emergentPhysics: if true, engine spawns dimensions on demand. (default false)
     * @param {boolean} noObserverFrame - If true, disables brownianMotion (no gravitational pull from observer). Use for beam/laser experiments. (default false)
     * @param {boolean} withWrapping - Wrap quanta at boundaries (default false)
     */
    init(universe_rect, fundamental_dimension_number, wavelengthConstant = 1, isGreedy = false, noEscape = false, emergentDimensions = false, noObserverFrame = false, withWrapping = false) {
        if (!universe_rect || (fundamental_dimension_number === undefined || fundamental_dimension_number === null)) {
            throw new Error("Universe rectangle and fundamental dimension are required to initialize the simulation.");
        }
        this.universe_rect = universe_rect;
        // emergentDimensions param flows to emergentPhysics (the canonical property used for all branching).
        // emergentPhysics bundles related flags — the two frame-generation models are mutually exclusive:
        //   emergentPhysics=true  → TOP-DOWN: density-based clustering, brownian motion, no inter-quantum collisions
        //   emergentPhysics=false → GROUND-UP: collision-based promotion, wave-walk, inter-quantum collisions allowed
        this.emergentPhysics = emergentDimensions;
        if (this.emergentPhysics) {
            this.brownianMotion = true;
            if (this.withInterQuantumCollisions) {
                console.warn('[EGPT] emergentPhysics=true forces withInterQuantumCollisions=false. Top-down and ground-up frame generation are mutually exclusive.');
            }
            this.withInterQuantumCollisions = false;
            this.withBonding = false;
        }
        if (noObserverFrame) {
            // No observer frame → stochastic movement is a random walk in the direction of the
            // velocity vector without gravitational pull from the observer frame.
            this.brownianMotion = false;
        }
        this.noEscape = noEscape;
        this.isGreedy = isGreedy;
        this.wavelengthConstant = wavelengthConstant;

        this.largeObjects = [];
        this.withWrapping = withWrapping;
        this._fundamental_dimension_number = fundamental_dimension_number;
        this.lowest_dimension = fundamental_dimension_number;
        this.smallestMBWidth = Math.pow(2, fundamental_dimension_number);
        this.addDimension(fundamental_dimension_number);
        this._initialized = true;

    }

    addTickFunction(tickFunction, objRef) {
        if (objRef) {
            this.largeObjects.push(objRef);
            this.experimentTickFunctions.push(tickFunction.bind(objRef));
        } else {
            this.experimentTickFunctions.push(tickFunction);
        }
    }

    set fps(value) {
        this._fps = value;
        this._iframe_interval_seconds = 1 / value;
        this._iframe_interval_ticks = Math.floor(value * this._iframe_interval_seconds);
    }
    get fps() {
        return this._fps;
    }
    set iframe_interval_seconds(value) {
        this._iframe_interval_seconds = value;
        this._fps = Math.round(1 / value);
        this._iframe_interval_ticks = Math.floor(this.fps * value);
    }

    get iframe_interval_ticks() {
        return this._iframe_interval_ticks;
    }

    set wavelengthConstant(value) {
        WAVELENGTH_CONSTANT = value;
    }
    get wavelengthConstant() {
        return WAVELENGTH_CONSTANT;
    }



    set brownianMotion(value) {
        BROWNIAN_MOTION = value;
    }

    set emergentPhysics(value) {
        this._emergentPhysics = value;

        if (value && this.dimensions.length === 0) {
            this.addDimension(this.lowest_dimension);
            //the universe itself is the highest dimension of which all other dimensions are a part and frames are children of the universe
            //find teh power of 4 that is greater than the width of the universe
            // let dimLevel = 2;
            // while (Math.pow(4, dimLevel) < Math.max(this.rect.w, this.rect.h)) {
            //   dimLevel++;
            // }
            // this.universe = new Dimension(0, dimLevel, null, true, this.emergentPhysics);

        } else if (!value) {
            this.resetDimensions();
        }
    }

    get emergentPhysics() {
        return this._emergentPhysics;
    }
    /**
   * doTick() - the main function that runs the simulation. It is called every frame by P5.js draw() function. 
   * On each tick the simulation updates the state of the universe and renders the state of the universe to the canvas in the following steps:
   * 1. Quantum / MB State: Update the state of the universe by counting the quanta in the dimensions and frames, adding new quanta from experiment specific functions, or removing 'dead' quanta.
   * 2. iFrames and Frames: If it is time for a new iframe, create new frames from the lower dimension quanta/frames which are not in a higher dimension frame
   */
    /**
     * doTick() — Main simulation loop. Pure physics, returns TickData for rendering.
     *
     * PHASE A: INJECTION
     *   Run experiment tick functions (e.g. OvenBox emitters, PointSource).
     *   New leaf frames are added to the lowest (fundamental) dimension.
     *
     * PHASE B: STRUCTURE BUILDING (Upward Pass, on iframe ticks only)
     *   Build a quadtree from fundamental dimension frames.
     *   Each higher dimension absorbs matching frames from the quadtree via addPointsFromQuadTree.
     *   [emergentPhysics ONLY]: Also run buildFramesFromSprites to recursively create new
     *   dimensions and frames from unparented leaves. This path spawns dimensions automatically.
     *   When emergentPhysics=false, dimensions must be pre-registered by the experiment and
     *   frame promotion happens event-driven in Phase C (not here).
     *
     * PHASE C: PHYSICS UPDATE (per-dimension)
     *   For each dimension (low to high):
     *     1. Optional: inter-frame collisions within the lowest dimension (if withInterQuantumCollisions).
     *     2. dim.update() — moves frames, detects collisions via quadtree.insertAll,
     *        calls merge + handleStructurePromotion for colliding pairs, collides with LargeObjects.
     *        This is where EVENT-DRIVEN PROMOTION happens: when two unparented frames in dim N
     *        collide, handleStructurePromotion creates a parent in dim N+1 (next registered dim).
     *        - emergentPhysics=true: if no next dim exists, one is spawned.
     *        - emergentPhysics=false: promotion only occurs if the next dim already exists.
     *     3. Released frames (escaped children) are returned for re-injection.
     *
     * PHASE D: COLLECT TICK DATA
     *   Gather FrameData from each dimension into a TickData object for rendering.
     */
    doTick() {
        this.tick++;
        if (DEBUG_PROMOTION && this.tick === 1) {
            let dimKeys = this.dimensions.keys();
            console.log(`[DEBUG_PROMOTION] Startup: emergentPhysics=${this.emergentPhysics} withInterQuantumCollisions=${this.withInterQuantumCollisions} lowest=${this.lowest_dimension} dimensions=[${[...dimKeys].join(',')}]`);
        }

        // ── PHASE A: INJECTION ──
        // Experiment tick functions fire new leaf frames (e.g. OvenBox wall emitters, PointSource).
        // Returned frames are added to the fundamental (lowest) dimension.
        let new_quanta = [];
        if (this.tick === 1 && this.experimentTickFunctions.length === 0 && typeof console !== 'undefined') {
            console.warn('[EGPT] No experiment tick functions registered — emissions will not appear. Check setup pushes to universe.experimentTickFunctions.');
        }
        for (let tickFunction of this.experimentTickFunctions) {
            let return_quanta = tickFunction();
            if (return_quanta) {
                new_quanta = new_quanta.concat(return_quanta);
            }
        }
        if (new_quanta.length > 0) {
            this.addFundamentalFrames(new_quanta);
            this.quantaalltime += new_quanta.length;
        }

        // ── PHASE B: STRUCTURE BUILDING (Upward Pass) ──
        // Runs on iframe ticks (every iframe_interval_ticks). Populates higher dimensions from
        // the fundamental quadtree. This is the PERIODIC path for filling pre-registered dimensions.
        let fundamentalDim = this.dimensions.get(this.lowest_dimension);
        if (!fundamentalDim) {
            fundamentalDim = this.addDimension(this.lowest_dimension);
        }

        let fundamentalDimQtree = QuadTree.create(this.universe_rect, 1, this.smallestMBWidth);
        fundamentalDimQtree.insertAll(fundamentalDim.frames);

        // ── TOP-DOWN frame generation (emergentPhysics ONLY) ──
        // When emergentPhysics=true, higher dimensions absorb unparented leaf frames from the
        // fundamental quadtree (density-based clustering). Dimensions auto-spawn as needed.
        // When emergentPhysics=false, this is SKIPPED entirely — frame promotion happens
        // event-driven in Phase C via handleStructurePromotion (ground-up, collision-based).
        // The two models are MUTUALLY EXCLUSIVE.
        if (this.emergentPhysics && this.tick % (this.iframe_interval_ticks) === 0) {
            let sortedDimensions = [];
            for (let key of this.dimensions.keys()) {
                sortedDimensions.push(this.dimensions.get(key));
            }

            for (let dim of sortedDimensions) {
                if (dim.layer === this.lowest_dimension) continue;
                fundamentalDimQtree = dim.addPointsFromQuadTree(fundamentalDimQtree);
            }

            // Recursively build new frames from unparented leaves, spawning dimensions as needed.
            let unparented = fundamentalDim.frames.filter(f => !f.parent);
            this.buildFramesFromSprites(unparented);
        }

        // ── PHASE C: PHYSICS UPDATE ──
        // Per-dimension: move → collide → merge → promote → large object collisions.
        this.quanta_tree = QuadTree.create(this.universe_rect, 1, this.smallestMBWidth);

        let allDimensions = [];
        for (let key of this.dimensions.keys()) {
            allDimensions.push(this.dimensions.get(key));
        }

        for (let dim of allDimensions) {
            // Step C.1: Optional inter-frame collisions within the lowest dimension.
            // Only active when withInterQuantumCollisions=true (e.g. DoubleSlit experiment).
            if (this.withInterQuantumCollisions && dim.layer === this.lowest_dimension) {
                let localQTree = QuadTree.create(this.universe_rect, 1, dim.mb_w);
                localQTree.insertAll(dim.frames);
                for (let p of dim.frames) {
                    let range = new Circle(p.rect.x, p.rect.y, p.r);
                    let neighbors = localQTree.query(range);
                    p.checkCollision(neighbors, true, this.withBonding, this.tick);
                }
            }

            // Step C.2: dim.update() — the core physics step for this dimension.
            // Inside update(): move frames → build quadtree → insertAll detects collisions →
            // for each collision pair: merge (transfer children) then handleStructurePromotion
            // (event-driven parent creation in the next higher dimension).
            // Also collides frames with LargeObjects (walls, detectors).
            let released_points = dim.update(this.tick, this.largeObjects);

            // Step C.3: Re-inject released frames (children that escaped their parent).
            if (released_points.length > 0) {
                this.addFundamentalFrames(released_points);
            }
        }

        // ── PHASE D: COLLECT TICK DATA ──
        // Gather state from all dimensions into TickData for rendering or analysis.
        // No P5/rendering calls here — doRender(tickData) handles drawing.
        let universeData = new UniverseData(this.tick, this.dimensions.length, this.universe_rect);
        let tickData = new TickData(universeData);

        for (let dim of allDimensions) {
            let dimData = new DimensionData(this.tick, dim.layer, dim.frames.length, dim.boundary_rect);
            tickData.addDimensionData(dimData);
            let frameDataList = dim.collectFrameData(this.tick);
            for (let fd of frameDataList) {
                tickData.addFrameData(fd);
            }
        }
        return tickData;
    }

    /**
     * Takes a list of quanta and builds frames from them. Uses a binary search / quadtree like method to build the frames. Our goal is to build square frames, each of which has four children (quadrants) which are also frames. We only build a frame if it is more than 25% full. If a frame is less than 25% full then we will not build it. If a frame is more than 25% full then we will build it and then build any children which are more than 25% full. Frames of the same size squares are said to be in the same "dimension" and are therefore placed into the corresponding Dimension object. Therefore Dimension 1 is 2x2 (4 children/quadrants each 1 pixel), Dimension2 is 4x4 (4 children quadrants, each 2x2), etc. This is recursive.
     * Since the quanta are sorted by their left, top position, we can use a binary search to efficiently build the frames.
     * @param {*} sprites (quanta or frames) which have no parent
     */
    /**
   * Takes a list of quanta and builds frames from them.  
   * @param {Array} unparentedSprites  An array of quantum objects with rect 'left' and 'top' properties.
   * @returns {Array} Array of leftover quanta which were not added to a frame/Dimension.
   */
    buildFramesFromSprites(unparentedSprites) {

        // Sort the quanta by their left, top position
        let leftSortedQuanta = unparentedSprites.sort((a, b) => a.rect.left - b.rect.left);
        let newMBList = [];
        let remainingquanta = [];
        // Start the recursive frame building process

        this.buildFramesRecursive(leftSortedQuanta, null, null, null, newMBList, remainingquanta);

        //sort the new frames by their layer (smallest to largest)
        newMBList.sort((a, b) => a.layer - b.layer);


        //add the frames to the dimensions
        //both the newMBList and the dimensions are sorted by layer so we can just add them in order
        if (newMBList.length > 0) {
            let currentMBDim = this.addDimension(newMBList[0].layer)
            for (let mb of newMBList) {
                if (mb.layer != currentMBDim.layer) {
                    currentMBDim = this.addDimension(mb.layer);
                }
                currentMBDim.addFrame(mb);
            }
        }

        return remainingquanta;

    }

    /**
  * Recursively builds frames from quanta or other frames.
  * @param {Array} leftSortedQuanta Array of quantum sorted by 'left' position and then 'top' position
  * @param {number} dimLevel Current dimension level (starts at 0)
  * @param {Rectangle} higherDimRect  Rectangle representing the current region 
  * @param {Frame} parentMB Parent frame
  * @param {Array} newMBList Array of new frames
  * @param {Array} remainingQuanta Array of leftover quanta
  * @returns {Array} Array of leftover quanta
  */
    buildFramesRecursive(leftSortedQuanta, higherDimRect, dimLevel, parentMB, newMBList, remainingQuanta) {
        if (leftSortedQuanta.length === 0) {
            return;
        }
        let lowestDim = leftSortedQuanta[0].layer;
        if (!higherDimRect) {
            //find the maxsize of the rect which would contain the quanta

            let minleft = leftSortedQuanta[0].rect.left;
            let maxright = leftSortedQuanta[leftSortedQuanta.length - 1].rect.left;
            let mintop = leftSortedQuanta[0].rect.top;
            let maxbottom = leftSortedQuanta[0].rect.bottom;
            for (let p of leftSortedQuanta) {
                if (p.rect.left < minleft) {
                    minleft = p.rect.left;
                }
                if (p.rect.right > maxright) {
                    maxright = p.rect.right;
                }
                if (p.rect.top < mintop) {
                    mintop = p.rect.top;
                }
                if (p.rect.bottom > maxbottom) {
                    maxbottom = p.rect.bottom;
                }
            }
            let rect_w = maxright - minleft;
            let rect_h = maxbottom - mintop;
            mintop = Math.max(0, mintop);
            // Calculate the maximum dimension level based on the largest square with side 2^dimLevel that can fit all quanta
            //what is the largest power of 4 that is less than the maxleft - minleft
            let maxSize = Math.max(rect_w, rect_h);
            dimLevel = 2;
            while (Math.pow(2, dimLevel) < maxSize) { // Minimum frame size is 2x2 (dim level 1) 
                dimLevel++;
            }
            maxSize = Math.pow(2, dimLevel);
            higherDimRect = new Rectangle(minleft, mintop, maxSize, maxSize, null, false);
            //since the quadrants are one dimension below the current dimension we need to decrease the dimLevel
            dimLevel--;
        }
        let sideLength = higherDimRect.w / 2;
        const minQuanta = this.minMBFillRate * sideLength * sideLength;




        // Get quanta in each quadrant with remainder handling
        let { nwQuad, neQuad, swQuad, seQuad, remainder } = this.getQuadrantQuantaForRect(leftSortedQuanta, higherDimRect);



        //remaining quanta are the quanta that are not in the quadrants or were over the capacity of the quadrants
        remainingQuanta.push(...remainder);


        // Destructure the count from the length of each array
        let nwCount = nwQuad.mass;
        let neCount = neQuad.mass;
        let swCount = swQuad.mass;
        let seCount = seQuad.mass;

        let nwMB;
        let neMB;
        let swMB;
        let seMB;

        // Create Frames for full quadrants
        let dimension = this.addDimension(dimLevel);
        if (nwCount >= minQuanta) {
            nwMB = dimension.createFrameFromRect(nwQuad.rect, [], 0, 0);
            newMBList.push(nwMB);
            if (parentMB) { parentMB.children.push(nwMB); };
        }
        if (neCount >= minQuanta) {
            neMB = dimension.createFrameFromRect(neQuad.rect, [], 0, 0);
            newMBList.push(neMB);
            if (parentMB) { parentMB.children.push(neMB); };
        }
        if (swCount >= minQuanta) {
            swMB = dimension.createFrameFromRect(swQuad.rect, [], 0, 0);
            newMBList.push(swMB);
            if (parentMB) { parentMB.children.push(swMB); };
        }
        if (seCount >= minQuanta) {
            seMB = dimension.createFrameFromRect(seQuad.rect, [], 0, 0);
            newMBList.push(seMB);
            if (parentMB) { parentMB.children.push(seMB); };
        }

        // Recurse into quadrants, handling the leftover quanta
        if (dimLevel > lowestDim + 1) {
            dimLevel--;
            this.buildFramesRecursive(nwQuad.quanta, nwQuad.rect, dimLevel, nwMB, newMBList, remainingQuanta);
            this.buildFramesRecursive(neQuad.quanta, neQuad.rect, dimLevel, neMB, newMBList, remainingQuanta);
            this.buildFramesRecursive(swQuad.quanta, swQuad.rect, dimLevel, swMB, newMBList, remainingQuanta);
            this.buildFramesRecursive(seQuad.quanta, seQuad.rect, dimLevel, seMB, newMBList, remainingQuanta);
        } else {
            //we are at the lowest level so we add the quanta to the frames
            if (nwMB) {
                nwMB.addPoints(nwQuad.quanta);
            }
            else {
                remainingQuanta.push(...nwQuad.quanta);
            }
            if (neMB) {
                neMB.addPoints(neQuad.quanta);
            }
            else {
                remainingQuanta.push(...neQuad.quanta);
            }
            if (swMB) {
                swMB.addPoints(swQuad.quanta);
            }
            else {
                remainingQuanta.push(...swQuad.quanta);
            }
            if (seMB) {
                seMB.addPoints(seQuad.quanta);
            }
            else {
                remainingQuanta.push(...seQuad.quanta);
            }

        }
    }




    /**
     * Finds quanta within the quadrants of a given rectangle using sorted quantum lists.
     * @param {Array} leftSortedQuanta Array of quantum objects sorted by 'left' and then 'top'.
     * @param {Rectangle} higherDimRect Rectangle with 'left', 'top', 'right', 'bottom', 'w', and 'h' properties.
     * @returns {object} Object with properties:
     *   * neQuanta: Array of quanta in the northeast quadrant
     *   * nwQuanta: Array of quanta in the northwest quadrant
     *   * seQuanta: Array of quanta in the southeast quadrant
     *   * swQuanta: Array of quanta in the southwest quadrant
     *   * remainder: Array of quanta outside all quadrants
     */
    getQuadrantQuantaForRect(leftSortedQuanta, higherDimRect, rejectiffull = true) {
        const sideLength = higherDimRect.w / 2; // Side length of a quadrant 
        // Quadrants 
        const nwRect = new Rectangle(higherDimRect.left, higherDimRect.top, sideLength, sideLength, null, false);
        const neRect = new Rectangle(higherDimRect.left + sideLength, higherDimRect.top, sideLength, sideLength, null, false);
        const swRect = new Rectangle(higherDimRect.left, higherDimRect.top + sideLength, sideLength, sideLength, null, false);
        const seRect = new Rectangle(higherDimRect.left + sideLength, higherDimRect.top + sideLength, sideLength, sideLength, null, false);
        const nwQuanta = [];
        const neQuanta = [];
        const swQuanta = [];
        const seQuanta = [];
        const remainder = [];
        let nwMass = 0, neMass = 0, swMass = 0, seMass = 0;
        let maxQuantaPerQuad = sideLength * sideLength;
        for (const quantum of leftSortedQuanta) {
            if (seRect.contains(quantum.rect)) { // SE
                if (rejectiffull && seQuanta.length >= maxQuantaPerQuad) {
                    remainder.push(quantum);
                } else {
                    seMass += quantum.mass;
                    seQuanta.push(quantum);
                }
            } else if (swRect.contains(quantum.rect)) { // SW
                if (rejectiffull && swQuanta.length >= maxQuantaPerQuad) {
                    remainder.push(quantum);
                } else {
                    swMass += quantum.mass;
                    swQuanta.push(quantum);
                }
            } else if (neRect.contains(quantum.rect)) { // NE 
                if (rejectiffull && neQuanta.length >= maxQuantaPerQuad) {
                    remainder.push(quantum);
                } else {
                    neMass += quantum.mass;
                    neQuanta.push(quantum);
                }
            } else if (nwRect.contains(quantum.rect)) { // NW
                if (rejectiffull && nwQuanta.length >= maxQuantaPerQuad) {
                    remainder.push(quantum);
                } else {
                    nwMass += quantum.mass;
                    nwQuanta.push(quantum);
                }
            } else {
                remainder.push(quantum);
            }
        }
        let nwQuad = { quanta: nwQuanta, rect: nwRect, mass: nwMass };
        let neQuad = { quanta: neQuanta, rect: neRect, mass: neMass };
        let swQuad = { quanta: swQuanta, rect: swRect, mass: swMass };
        let seQuad = { quanta: seQuanta, rect: seRect, mass: seMass };

        return { nwQuad, neQuad, swQuad, seQuad, remainder };
    }






    addDimension(dimension_number) {
        let dimension = this.dimensions.get(dimension_number);
        if (dimension) return dimension;
        if (dimension_number > this.highest_dimension) {
            this.highest_dimension = dimension_number;
        } else if (dimension_number <= this.lowest_dimension) {
            this.lowest_dimension = dimension_number;
        }
        dimension = new Dimension(this.tick, dimension_number, this, true, this.emergentPhysics);
        this.dimensions.push(dimension_number, dimension);

        return dimension;
    }

    removeDimension(dimension_number) {
        this.dimensions.remove(dimension_number);
    }

    addFundamentalFrames(frames, reinit = false) {
        if (!frames || frames.length === 0) return;

        let dim = this.dimensions.get(this.lowest_dimension);
        if (!dim) {
            dim = this.addDimension(this.lowest_dimension);
        }

        // Filter for alive frames
        let validFrames = frames.filter(p => p.is_alive);

        // Add to the dimension's frames
        // Note: Dimension.frames is an array, so we can push
        dim.frames.push(...validFrames);
    }

    // Deprecated alias for backward compatibility
    addOutOfDimensionQuanta(quanta, reinit = false) {
        this.addFundamentalFrames(quanta, reinit);
    }

    addLargeObject(lo) {
        this.largeObjects.push(lo);
    }

    /** Count of active quanta/frames - used by OvenBox for temperature control. Aligns with egpt_core activeQuanta. */
    get activeQuanta() {
        let count = 0;
        if (this.dimensions && this.dimensions.length > 0) {
            for (let dim of this.dimensions) {
                if (dim.frames) {
                    count += dim.frames.length;
                }
            }
        }
        return count;
    }
}


/**
 * A frame is a sprite that is a collection of quanta (i.e. the definitions are recursive such that quanta are smaller frames who themselves have child quanta and so on).
 */
class Frame {

    constructor(layer, rect, vx = 0, vy = 0, wrap = true, boundary_rect = null, parent = null, emergentPhysics = false) {

        //the rect is centered on the center of mass of the quanta in the quadtree node
        //start with the center of the frame as the center of mass of the quanta in the quadtree node
        this.rect = rect; // Rectangle representing the boundary of the frame
        this.mass = 0;
        this.children = [];
        this.center_of_mass = { x: rect.x, y: rect.y };
        this.r = Math.max(rect.w, rect.h) / 2;
        this.capacity = rect.w * rect.h;
        this.layer = layer; // The dimensional layer of the frame

        this.quantum_id = quantum_id++;
        this.parent = parent;
        this.boundary_rect = boundary_rect;
        //choose a charge randomly for now
        this.charge = Math.random() < 0.5 ? Charge.POSITIVE : Charge.NEGATIVE;
        //normalize so that vx^2 + vy^2 = 1
        /*
        if (vx + vy !== 0) {
          let mag = Math.sqrt(vx * vx + vy * vy);
          vx /= mag;
          vy /= mag;
        }*/
        this._vx = vx; //the underlying velocity of the frame
        this._vy = vy; //the underlying velocity of the frame
        this.dx = 0; //the last incremental movement of the frame
        this.dy = 0; //the last incremental movement of the frame

        this._pos_color = [255, 255, 255, 255];
        this._neg_color = [100, 100, 100, 50];

        // how many moves it takes to go through a full cycle
        this.setWavelength(); // how many moves it takes to go through a full cycle. Minimum is 4 (2 up and 2 down. E.g. Sine is 1 up, 2 down, 1 up)
        this.local_time = 0;
        this.wrap = wrap;
        this._p_heads = Math.floor(this.wavelength / 2) / (Math.floor(this.wavelength / 2) + 1)
        this._p_tails = 1 - this._p_heads
        this.is_alive = true;

        this.density = this.mass / (this.rect.w * this.rect.h); // Add density property
        this.local_time = 0;
        this.last_move_time = 0;
        this.dirty = true; // Flag to indicate if the frame is new or has been rebuilt
        this.is_leaf = false; // Flag to indicate if the frame is a leaf node
        this.is_stationary = false; // Flag to indicate if the frame is stationary (for bespoke experiments)
        this.emergentPhysics = emergentPhysics;
        //if this is emergent physics then we create a dimension for the universe itself which is the parent of all frames

        this._color_override = null;
    }

    static makeLeafFrame(left, top, level, wavelength, vx = 0, vy = 0, wrap = true, charge = null, boundary_rect = null, color_override = null, emergentPhysics = false) {
        //width and height are the dimensions of the frame, presumed to be square of side 2^level. So the capacity is 2^2*level = 4^level. Since wavelength = capacity / mass, mass = capacity / wavelength = 4^level / wavelength
        //wavelength must be even since it is the number of moves it takes to go through a full cycle. If it is odd then the quantum will not return to its starting position.

        let width = Math.max(1, 2 ** level);
        let height = width;
        let capacity = width * height;
        let mass = 1;
        if (!wavelength) {
            mass = capacity;
        } else {
            mass = capacity / wavelength;
            mass = Math.max(1, mass);
        }


        let rect = new Rectangle(left, top, width, height, null, false);
        let frame = new Frame(level, rect, vx, vy, wrap, boundary_rect, null, emergentPhysics);
        frame.mass = mass;
        frame.is_leaf = true;
        if (color_override) {
            frame.color_override = color_override;
        }
        frame.charge = charge !== undefined && charge !== null ? charge : (Math.random() < 0.5 ? Charge.POSITIVE : Charge.NEGATIVE);

        frame.setWavelength(mass);
        return frame;
    }
    set color_override(value) {
        if (value) {
            this._color_override = Array.isArray(value) ? value : [value[0] || 0, value[1] || 0, value[2] || 0, 255];
        }
    }

    get color_override() {
        return this._color_override;
    }

    get fullness() {
        return this.capacity > 0 ? this.mass / this.capacity : 0;
    }


    get wavelength() {
        //wavelength is the number of moves it takes to go through a full cycle.
        if (!this._wavelength) {
            this.setWavelength(this.mass);
        }
        return this._wavelength;
    }

    setWavelength(mass) {
        if (!mass) {
            mass = this.mass;
        }
        //Every Frame is an oscillator with a wavelength. The wavelength is how long the center of mass of it's constituent quanta take to return to where they started - this is proportionate to the area of its mass (as if it's mass were in one square area, to the diameter of the frame itself).
        //wavelength is smaller for frames with higher number of quanta (E=mc^2 and all that so we can say that the more energy a frame has the shorter the wavelength and the higher the frequency)
        let newWavelength = Math.floor((this.capacity / Math.max(1, this.mass)) * WAVELENGTH_CONSTANT);
        newWavelength = Math.max(4, newWavelength);
        //bigger frames have longer wavelengths in relation to their size
        this._wavelength = newWavelength;
        //increase the heads probability as the wavelength increases
        //this._p_heads = (this._wavelength / WAVELENGTH_CONSTANT) / (Math.floor(this._wavelength / WAVELENGTH_CONSTANT) + 1);
        this._p_heads = Math.floor(this._wavelength) / (Math.floor(this._wavelength) + 1);
        this._p_tails = 1 - this._p_heads;
    }

    get spin() {
        let wavelength_remainder = this.local_time % this.wavelength;
        //for positively charged (sine wave like) quantum will spin up in quarter 0 and 3 and down in quarter 1 and 2 
        let quadrant = (Math.floor(wavelength_remainder / (this.wavelength / 4)) + this.charge) % 4;
        if (quadrant === 0 || quadrant === 3) {
            return this.charge === Charge.POSITIVE ? Spins.UP : Spins.DOWN;
        } else {
            return this.charge === Charge.POSITIVE ? Spins.DOWN : Spins.UP;
        }
    }

    get p_up() {
        return this.spin === Spins.UP ? this._p_heads : this._p_tails;
    }

    get p_down() {
        return this.spin === Spins.UP ? this._p_tails : this._p_heads;
    }

    reset(x, y, vx, vy) {
        this.local_time = 0;
        this.rect.x = x ? x : this.rect.x;
        this.rect.y = y ? y : this.rect.y;
        this.start_x = this.rect.x;
        this.start_y = this.rect.y;
        this.vx = vx ? vx : this.vx;
        this.vy = vy ? vy : this.vy;
        this.collided = false;
        this.is_alive = true;
        //this.charge = (this.original_charge !== undefined && this.original_charge !== null) ? this.original_charge : (Math.random() < 0.5 ? Charge.POSITIVE : Charge.NEGATIVE);
        this.charge = (Math.random() < 0.5 ? Charge.POSITIVE : Charge.NEGATIVE);
        this.orthogonal_disploacement = 0;
    }

    /**
     * FRAMES ONLY MOVE 1 PIXEL PER TICK. "QUANTA" ARE LEAF FRAMES.
     * - Move is positional translation: dx and dy
     * - Momentum is the vector (vx, vy)
     * - NOTE --- "velocity" and "momentum" are the same in EGPTfraqtl.js
     * Moves the quantum/macrobolock in a random walk with baseline in the direction of the velocity vector.
     * On average, over many quanta, the random walk will be a sine wave for Charge.POSITIVE quanta and a cosine wave for Charge.NEGATIVE quanta.
     * The "coin flip" for the random walk uses a coin which flip-flops its heads probability as the quantum moves through the different quadrants
       of its 'wave'. 
       - For Charge.POSITIVE quanta (avg random walk = sine wave). 
       -- "Spins.UP" in quadrants 0 and 3 where the heads probability is greater than the tails probability; 
       -- "Spins.DOWN" in quadrants 1 and 2 where the tails probability is greater than the heads probability.
       - For Charge.NEGATIVE quanta (avg random walk = cosine wave) and Spins.UP and Spins.DOWN are reversed relative to the quadrants for Charge.POSITIVE quanta.
  
     * @param {*} t 
     * @param {*} boundary_rect : constrains the movement of the frame to the boundary_rect dictated by the dimension which is moving the quantum/mb. 
     * If the frame moves outside the boundary_rect then it will be moved back inside the boundary_rect
     * @returns 
     */
    move(t, boundary_rect) {
        if (!this.is_alive || (this.vx == 0 && this.vy == 0)) {
            if (this.is_alive && this.children.length > 0 && !this.is_leaf) {
                this.reinit();
            }

        }

        this.last_move_time = t;
        this.local_time++; // Default: particle age. Some compatibility branches override this.
        this.dx = 0; //the last incremental movement of the frame
        this.dy = 0; //the last incremental movement of the frame

        if (!boundary_rect) {
            //boundary_rect will get passed in from the root frame. If this is the root frame then set the boundary_rect to the screen size
            boundary_rect = this.boundary_rect;
        }

        if (!this.is_stationary) {
            let abs_vx = Math.abs(this.vx);
            let abs_vy = Math.abs(this.vy);
            let total = abs_vx + abs_vy;

            //If not emergent physics then Brownian motion is a perperndicular step to the velocity vector
            if (!this.emergentPhysics && !BROWNIAN_MOTION && !this.is_stationary) {
                // Update velocity.
                // Quanta move in a random walk with baseline in the direction of their velocity vector.
                let perpendicular_angle = Math.atan2(this.vy, this.vx) + (Math.PI / 2);

                // Determine the direction for the perpendicular step.
                let is_heads = Math.random() < this.p_up ? 1 : -1;

                // Compute the perpendicular step components.
                let dx_perpendicular = is_heads * Math.cos(perpendicular_angle);
                let dy_perpendicular = is_heads * Math.sin(perpendicular_angle);

                // Normalize the baseline velocity to ensure the quantum moves exactly 1 unit in that direction.
                let magnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                let dx_baseline = (magnitude > 0) ? (this.vx / magnitude) : 0;
                let dy_baseline = (magnitude > 0) ? (this.vy / magnitude) : 0;

                // Combine the baseline movement and the perpendicular step.
                // Each component is 1 unit: baseline along velocity, perpendicular orthogonal.
                // Diagonal displacement is sqrt(2) Euclidean but 1 unit per axis (Chebyshev metric).
                // This is correct for a discrete grid — "1 pixel per tick" means 1 unit per active axis.
                this.dx = dx_baseline + dx_perpendicular;
                this.dy = dy_baseline + dy_perpendicular;
            } else if (!this.is_stationary) {
                //if emergent physics then Brownian motion is a random movement with value 1 or 0 or -1 in both the x and y directions
                let brownian_x = Math.floor(Math.random() * 3) - 1;
                let brownian_y = Math.floor(Math.random() * 3) - 1;
                //only one of dx or dy can be non-zero and have magnitude 1, the other must be zero. The one which is non-zero is chosen randomly by their relative probabilities
                let abs_vx = Math.abs(this.vx);
                let abs_vy = Math.abs(this.vy);
                let prob_vx = (abs_vx + Math.abs(brownian_x)) / (abs_vx + abs_vy + Math.abs(brownian_x) + Math.abs(brownian_y));
                let prob_vy = 1 - prob_vx;
                let normalized_vx = abs_vx !== 0 ? (this.vx / abs_vx) : 0;
                let normalized_vy = abs_vy !== 0 ? (this.vy / abs_vy) : 0;

                this.dx = (Math.random() < prob_vx ? normalized_vx : 0) + brownian_x;
                this.dy = (Math.random() < prob_vy ? normalized_vy : 0) + brownian_y;
                this.vx += this.dx;
                this.vy += this.dy;

            }

            if (this.parent) {
                this.vx -= this.dx;
                this.vy -= this.dy;
            } else if (!this.parent && !this.emergentPhysics && !BROWNIAN_MOTION) {
                // Core-compatible free-particle wave branch: baseline vx/vy is preserved.
                // Orthogonal wave motion is represented in displacement, not spent from vx/vy.
            } else {
                // Free particles (Wave-Particle Duality):
                // Conserve primary momentum (no drag), but spend orthogonal momentum (virtual forces).
                // We assume the larger velocity component is the primary travel direction.
                if (Math.abs(this.vx) > Math.abs(this.vy)) {
                    this.vy -= this.dy;
                } else {
                    this.vx -= this.dx;
                }
            }
        }




        this.move_relative(this.dx, this.dy);
        this.boundary_check(boundary_rect);

        //then we move the children
        this.move_children(this.dx, this.dy, t);

    }

    move_undo() {
        this.rect.x -= this.dx;
        this.rect.y -= this.dy;

        this.move_children(-this.dx, -this.dy, this.local_time);
        this.vx += this.dx;
        this.vy += this.dy;
        this.dx = 0;
        this.dy = 0;
    }
    move_relative(dx, dy, boundary_rect = null) {

        //this doesn't change our last_move_time because we are moving relative to our parent
        let orig_x = this.rect.x;
        let orig_y = this.rect.y;
        //move without checking for anything
        this.rect.x = this.rect.x + dx;
        this.rect.y = this.rect.y + dy;

        this.boundary_check(boundary_rect);
    }

    dist(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    move_children(dx, dy, t) {

        if (!this.children) return;

        // Parent movement cascades as momentum to children (deferred propagation).
        // Children spend this momentum on their next move() tick.
        for (let child of this.children) {
            child.vx += dx;
            child.vy += dy;
        }
    }

    addPoints(quanta) {
        if (this.is_leaf) {
            return quanta;
        }

        let rejected_points = [];

        for (let quantum of quanta) {
            if (this.layer <= quantum.layer) {
                rejected_points.push(quantum);
                continue;
            }
            if (!this.check_space_available(quantum)) {
                rejected_points.push(quantum);
            } else {
                let inserted = this.insert(quantum);
                if (!inserted) {
                    rejected_points.push(quantum);
                }
            }
        }
        this.setWavelength();
        return rejected_points;
    }

    check_space_available(quantum) {
        if (this.is_leaf) {
            //if the frame is a leaf then it can't have children and therefore no space available
            return false;
        }
        //check if the corresponding quantum in the frame is already occupied
        //for now we make it simple, if the mass of the frame is < then the number of pixels in the frame then there is space available
        return this.mass < this.rect.w * this.rect.h;

    }


    // Method to update mass and center of mass
    insert(quantum) {
        if (!this.is_alive || this.is_leaf) {
            return false;
        }
        //check if the quantum is in the frame
        if (!this.rect.contains(quantum.rect) || this.mass >= this.capacity || quantum.mass == 0) {
            return false;
        } else {
            //update the mass and center of mass
            this.mass += quantum.mass;
            this.vx += quantum.vx * quantum.mass;
            this.vy += quantum.vy * quantum.mass;
            quantum.parent = this;
            quantum.boundary_rect = this.rect;
            quantum.wrap = true;
            this.children.push(quantum);
            return true;
        }
    }

    get momentum() {
        return { x: this.mass * this.vx, y: this.mass * this.vy };
    }


    get vx() {
        return this._vx;
    }

    set vx(vx) {
        this._vx = vx;
    }

    get vy() {
        return this._vy;
    }

    set vy(vy) {
        this._vy = vy;
    }



    toFrameData(t, showFrameOutlineOnly = false) {
        let fd = new FrameData(
            t,
            this.quantum_id,
            this.layer,
            { x: this.rect.x, y: this.rect.y, left: this.rect.left, top: this.rect.top, w: this.rect.w, h: this.rect.h, right: this.rect.right, bottom: this.rect.bottom },
            this.fullness,
            showFrameOutlineOnly,
            this.is_alive,
            this.children.length,
            this.mass,
            this.collided ? this.collided.quantum_id : null,
            this.vx,
            this.vy
        );
        fd.colorOverride = this._color_override;
        this.collided = false;
        return fd;
    }

    boundary_check(boundary_rect) {
        if (!boundary_rect) {
            return;
        }
        if (this.rect.left < boundary_rect.left || this.rect.right > boundary_rect.right ||
            this.rect.top < boundary_rect.top || this.rect.bottom > boundary_rect.bottom) {
            if (!this.wrap) {
                this.kill();
            } else {
                let temp = this.vx;
                this._vx = -this.vy;
                this._vy = temp;

                let newLeft = Math.max(boundary_rect.left, Math.min(this.rect.left, boundary_rect.right - this.rect.w));
                let newTop = Math.max(boundary_rect.top, Math.min(this.rect.top, boundary_rect.bottom - this.rect.h));
                this.rect._left = newLeft;
                this.rect.right = newLeft + this.rect.w;
                this.rect._x = newLeft + this.rect.w / 2;
                this.rect._top = newTop;
                this.rect.bottom = newTop + this.rect.h;
                this.rect._y = newTop + this.rect.h / 2;
            }
        }

        //reflect the quantum if it hits the boundary
        // if (this.rect.x < 0 || this.rect.x + this.w > boundary_rect.w) {
        //   this.vx *= -1;
        // }
        // if (this.rect.y < 0 || this.rect.x + this.w > boundary_rect.h) {
        //   this.vy *= -1;
        // }


    }

    bond(other) {
        return
        //we check if other will bind to this quantum using a checkerboad pattern
        if (this.bound_partices.includes(other)) {
            return;
        }
        this.bound_partices.push(other);
        other.bound_partices.push(this);
    }


    kill(remove_children = true) {
        this.is_alive = false;

        this._vx = 0;
        this._vy = 0;
        this._pos_color = this._neg_color;
        if (remove_children) {
            this.removeAllChildren();
        }

    }

    remove_children(child_idx_list) {
        if (!this.children) return;

        // Sort the removal list in descending order
        child_idx_list.sort((a, b) => b - a);

        for (let i = 0; i < child_idx_list.length; i++) {

            let child = this.children[child_idx_list[i]];
            this.vx -= child.vx * child.mass;
            this.vy -= child.vy * child.mass;
            this.mass -= child.mass;
            console.assert(child, "child is null");
            child.parent = null;
            this.children.splice(child_idx_list[i], 1);
        }
        this.reinit();

        if (this.children.length === 0 && !this.is_leaf) {
            this.kill();
        }
    }

    removeAllChildren() {
        this.children = [];
        this.mass = 0;
        this.center_of_mass = { x: this.rect.x, y: this.rect.y };
        this.vx = 0;
        this.vy = 0;

    }

    bounceBrownian(other) {
        //send the quantum in a random direction that is not overlapping with the other quantum
        this.vx = Math.random() * (Math.random() > 0.5 ? 1 : -1);
        this.vy = Math.random() * (Math.random() > 0.5 ? 1 : -1);


        //this is a quantum so it has width and height of 1, so just find the nearest quantum on the other quantum and move away from it
        let dx = 0, dy = 0;
        let distance_to_other_left = other.rect.left - this.rect.left;
        dx = distance_to_other_left
        let distance_to_other_right = other.rect.right - this.rect.right;
        dx = (Math.abs(distance_to_other_right) < Math.abs(dx)) ? distance_to_other_right : dx;
        let distance_to_other_top = other.rect.top - this.rect.y;
        dy = distance_to_other_top;
        let distance_to_other_bottom = other.rect.bottom - this.rect.y;
        dy = (Math.abs(distance_to_other_bottom) < Math.abs(dy)) ? distance_to_other_bottom : dy;
        if (Math.abs(dx) < Math.abs(dy)) {
            this.reset();
            dy = 0;
            //adjust the x so that the quantum is not overlapping with the other quantum
            if (dx > 0) {
                this.rect.right = other.rect.left - 1;
            } else {
                this.rect.left = other.rect.right + 1;
            }
        } else {
            this.reset();
            dx = 0;
            //adjust the y so that the quantum is not overlapping with the other quantum
            if (dy > 0) {
                this.rect.bottom = other.rect.top - 1;
            } else {
                this.rect.top = other.rect.bottom + 1;
            }

        }

    }
    bounce(other) {
        if (BROWNIAN_MOTION && this.is_leaf) {
            this.bounceBrownian(other);
            return;
        }
        // Determine the center quanta of the quantum and the other rectangle
        let quantumCenterX = this.rect.x + this.w / 2;
        let quantumCenterY = this.rect.y + this.h / 2;
        let otherCenterX = other.rect.x + other.rect.w / 2;
        let otherCenterY = other.rect.y + other.rect.h / 2;

        // Calculate the difference in positions
        let deltaX = quantumCenterX - otherCenterX;
        let deltaY = quantumCenterY - otherCenterY;

        // Calculate the combined half widths and half heights
        let combinedHalfWidths = this.w / 2 + other.rect.w / 2;
        let combinedHalfHeights = this.h / 2 + other.rect.h / 2;
        this.local_time = 0;
        // Check for collision
        if (Math.abs(deltaX) < combinedHalfWidths && Math.abs(deltaY) < combinedHalfHeights) {
            // Calculate the overlap on both axes
            let overlapX = combinedHalfWidths - Math.abs(deltaX);
            let overlapY = combinedHalfHeights - Math.abs(deltaY);

            // Determine the minimum overlap direction
            if (overlapX < overlapY) {
                // Horizontal collision
                if (deltaX > 0) {
                    // Quantum hits the left side of the rectangle
                    this.rect.right = other.rect.left - 1;
                } else {
                    // Quantum hits the right side of the rectangle
                    this.rect.left = other.rect.right + 1;
                }
                this.vx = -this.vx; // Reverse horizontal velocity
                this.reset();
            } else {
                // Vertical collision
                if (deltaY > 0) {
                    // Quantum hits the top side of the rectangle
                    this.rect.bottom = other.rect.top - 1;
                } else {
                    // Quantum hits the bottom side of the rectangle
                    this.rect.top = other.rect.bottom + 1;
                }
                this.vy = -this.vy; // Reverse vertical velocity
                this.reset();
            }
        }
    }



    collide(other_object_rect, force_collisions = false, no_release = false) {
        //return a list of quanta that collided with the frame
        //a quantum collides with the other object with a probability of (object's distance from the center of mass / frame's radius)

        let collided_quanta = [];
        // if there are no children then return ourselves because we are the smallest unit
        if (this.children.length === 0) {
            return collided_quanta;
        }

        let d = Math.hypot(other_object_rect.x - this.rect.x, other_object_rect.y - this.rect.y);
        let p = d / this.r;
        let removal_list = [];
        if (!force_collisions) {
            for (let i = this.children.length - 1; i >= 0; i--) {
                let r = Math.random();
                if (r < p) {
                    collided_quanta.push(this.children[i]);
                    if (!no_release) {
                        removal_list.push(i);
                    }
                }
            }
            this.remove_children(removal_list);
        } else {
            collided_quanta = this.children;
            this.kill(true);
        }
        //remove the quanta from the frame

        return collided_quanta;
    }




    checkCollision(others, withbouncing = false, withbonding = false) {
        //inter frame collisions occur when the frames are in the same layer
        let collisionList = [];
        for (let other of others) {
            if (other) {
                if (other === this) continue;
                if (other.layer !== this.layer) continue;
            }
            let d = Math.hypot(other.rect.x - this.rect.x, other.rect.y - this.rect.y);
            if (d < other.r / 2 + this.r / 2) {
                collisionList.push(other);
                this.merge(other);
                if (withbouncing) {
                    this.bounce(other);
                }

                if (!withbonding) {
                    this.charge = Charge.POSITIVE;
                    other.charge = Charge.NEGATIVE;
                } else {
                    this.bond(other);
                }
            }
        }
        return collisionList;
    }

    merge(other) {
        //merge the other frame into this one
        //smaller gives children to larger (smaller is child to larger)
        let larger = this.mass >= other.mass ? this : other;
        let smaller = (other === larger) ? this : other;
        let giver = smaller;
        let taker = larger;

        //see what the percentage overlap is
        let overlap = this.rect.overlaps(other.rect);

        if (!overlap) return;
        //move any quanta in the overlap from smaller to larger frame
        let removal_list = [];
        let transferred_children = 0;
        let orig_giver_length = giver.children.length;
        for (let i = giver.children.length - 1; i >= 0; i--) {
            let child = giver.children[i];
            if (overlap.contains(child.rect)) {
                if (taker.insert(child)) {
                    transferred_children++;
                    removal_list.push(i);
                }
            }
        }
        if (removal_list.length > 0) {
            if (taker.parent) { taker.parent.dirty = true; }
            if (giver.parent) { giver.parent.dirty = true; }
        }
        //remove the quanta from the smaller frame
        if (removal_list.length > 0) {
            giver.remove_children(removal_list);
        }
        if (orig_giver_length !== giver.children.length + transferred_children) {
            consoleLog("Error in merge");
        }
    }

    compress() {
        //every tick, we move each of the children towards the center of the Frame (the attractive force).
        // Movement for child frames as directed by the parent
        for (let child of this.children) {
            let dx = 0;
            let dy = 0;
            if (child.rect.x != this.rect.x) dx = (child.rect.x > this.rect.x) ? -1 : 1;
            if (child.rect.y != this.rect.y) dy = (child.rect.y > this.rect.y) ? -1 : 1;

            child.vx += dx;
            child.vy += dy;

            //child.move_relative(dx, dy, this.rect);
        }
    }

    reinit() {
        if (this.is_leaf) {
            this.dirty = false;
            return;
        }
        this.mass = 0;
        if (this.emergentPhysics) {
            this._vx = 0;
            this._vy = 0;
        }
        this._wavelength = 0;
        this._p_heads = 0.5;
        this._p_tails = 0.5;

        let quanta = this.children;
        //filter out dead quanta
        quanta = quanta.filter(p => p.is_alive);
        if (quanta.length === 0) {
            this.kill(true);
            return;
        }
        this.children = [];
        this.center_of_mass = { x: this.rect.x, y: this.rect.y };

        //addPoints recomputes the mass, center of mass, vx, vy, wavelength, p_heads, p_tails
        this.addPoints(quanta);
        this.dirty = false;
    }
    get is_valid_configuration() {
        // Check if the frame has a valid configuration (not just opposite quadrants filled)
        return this.fill_mask !== 0b1010 && this.fill_mask !== 0b0101;
    }

    get fill_mask() {
        let fill_mask = 0b0000;
        for (let [key, value] of this.children) {
            // Update fill mask based on the filled state of the children
            if (value.fill_mask !== 0b0000) {
                fill_mask |= (1 << key);
            }
        }
        return fill_mask; // Return the calculated fill mask
    }
}

class Dimension {
    constructor(t, layer, universe, wrap = true, emergentPhysics = false) {
        this.layer = layer;
        this.local_time = t;
        this.last_render_time = t;
        this.universe = universe;
        this.wrap = wrap;
        this.mb_w = Math.pow(2, this.layer);
        this.mb_h = Math.pow(2, this.layer);
        this.fill_threshold = Math.floor(this.universe.minMBFillRate * this.mb_w ** 2); // Frame fill threshold
        //this.fill_threshold = 1;
        this.frames = [];
        this.emergentPhysics = emergentPhysics; // Emergent physics flag settable at the dimension level for experiments where only this dimension has emergent physics
        this.boundary_rect = this.universe.universe_rect;
        this.points_released = [];
        this.isHidden = false;
        this.showFrameOutlinesOnly = false;
    }

    addFrame(mb) {
        //check the frame is the right size
        if (mb.rect.w !== this.mb_w || mb.rect.h !== this.mb_h) {
            return false;
        }
        this.frames.push(mb);
        return true;
    }
    createFrameFromRect(rect, childFrames, vx, vy, addToDimension = true, is_stationary = false) {
        //since the quanta/mb are given to us, we don't need a quadtree, we just confirm that the rect is the same as the dimension's frame's rect
        if (rect.w !== this.mb_w || rect.h !== this.mb_h) {
            return null;
        }



        //add each quantum or mb from the quantum_mb list to this frame
        let frame = new Frame(this.layer, rect, vx, vy, this.wrap, this.boundary_rect, null,
            this.universe.emergentPhysics);
        frame.is_stationary = is_stationary;
        frame.addPoints(childFrames);
        if (addToDimension) {
            this.frames.push(frame);
        }
        return frame;
    }

    createParentFrame(childA, childB) {
        // Bounding-box approach: compute the smallest rect that contains both children
        let minLeft = Math.min(childA.rect.left, childB.rect.left);
        let minTop = Math.min(childA.rect.top, childB.rect.top);
        let maxRight = Math.max(childA.rect.right, childB.rect.right);
        let maxBottom = Math.max(childA.rect.bottom, childB.rect.bottom);

        let spanW = maxRight - minLeft;
        let spanH = maxBottom - minTop;

        // If the children span more than mb_w×mb_h, they can't fit in one parent
        if (spanW > this.mb_w || spanH > this.mb_h) {
            if (DEBUG_PROMOTION && this.universe.tick % 60 === 0) {
                console.log(`[DEBUG_PROMOTION] createParentFrame FAIL: span ${spanW.toFixed(1)}x${spanH.toFixed(1)} exceeds ${this.mb_w}x${this.mb_h}`);
            }
            return null;
        }

        // Position parent rect to contain the bounding box (non-centered)
        let rect = new Rectangle(minLeft, minTop, this.mb_w, this.mb_h, null, false);

        let frame = new Frame(this.layer, rect, 0, 0, this.wrap, this.boundary_rect, null, this.universe.emergentPhysics);

        let rejected = frame.addPoints([childA, childB]);

        if (frame.children.length > 0) {
            this.frames.push(frame);
            return frame;
        }
        if (DEBUG_PROMOTION && this.universe.tick % 60 === 0) {
            console.log(`[DEBUG_PROMOTION] createParentFrame FAIL: addPoints rejected=${rejected.length} A.rect=(${childA.rect.left.toFixed(1)},${childA.rect.top.toFixed(1)},r=${childA.rect.right.toFixed(1)},b=${childA.rect.bottom.toFixed(1)}) B.rect=(${childB.rect.left.toFixed(1)},${childB.rect.top.toFixed(1)},r=${childB.rect.right.toFixed(1)},b=${childB.rect.bottom.toFixed(1)}) parent=(${rect.left.toFixed(1)},${rect.top.toFixed(1)},r=${rect.right.toFixed(1)},b=${rect.bottom.toFixed(1)})`);
        }
        return null;
    }

    /**
     * handleStructurePromotion() — Event-driven parent frame creation.
     * Called from update() Step 5b when two frames in this dimension collide.
     *
     * Preconditions (all must pass):
     *   - frameA !== frameB (not self-paired)
     *   - Both alive (not killed by merge or large object collision)
     *   - Both unparented (no existing parent frame — if they already share a parent, skip)
     *
     * Next-dimension lookup — KEY BRANCHING POINT:
     *   - Uses SortableDictionary.getNextKey(this.layer) to find the next registered dimension.
     *     This supports non-consecutive dimensions (e.g. dim 0 → dim 4).
     *   - emergentPhysics=true: if no next dim exists, SPAWN one at layer+1.
     *   - emergentPhysics=false: if no next dim exists, STOP. The developer must have
     *     pre-registered it (e.g. via OvenBox calling universe.addDimension).
     *
     * Then delegates to parentDim.createParentFrame(A, B) which creates the actual parent.
     */
    handleStructurePromotion(frameA, frameB) {
        if (frameA === frameB) return;

        if (DEBUG_PROMOTION && this.universe.tick % 60 === 0) {
            console.log(`[DEBUG_PROMOTION] handleStructurePromotion dim=${this.layer} A.id=${frameA.quantum_id} B.id=${frameB.quantum_id} A.alive=${frameA.is_alive} B.alive=${frameB.is_alive} A.parent=${!!frameA.parent} B.parent=${!!frameB.parent}`);
        }
        if (!frameA.is_alive || !frameB.is_alive) {
            if (DEBUG_PROMOTION && this.universe.tick % 60 === 0) console.log(`[DEBUG_PROMOTION] REJECT: not alive`);
            return;
        }

        if (frameA.parent || frameB.parent) {
            if (DEBUG_PROMOTION && this.universe.tick % 60 === 0) console.log(`[DEBUG_PROMOTION] REJECT: has parent`);
            return;
        }

        // Next-dimension lookup: getNextKey returns the next registered dim layer (non-consecutive safe)
        let nextLayer = this.universe.dimensions.getNextKey(this.layer);

        if (nextLayer === undefined) {
            if (this.universe.emergentPhysics) {
                // emergentPhysics=true: auto-spawn the next dimension
                nextLayer = this.layer + 1;
                this.universe.addDimension(nextLayer);
            } else {
                // emergentPhysics=false: no next dim registered, cannot promote
                if (DEBUG_PROMOTION && this.universe.tick % 60 === 0) console.log(`[DEBUG_PROMOTION] REJECT: no nextLayer, emergentPhysics=false`);
                return;
            }
        }

        let parentDim = this.universe.dimensions.get(nextLayer);
        if (!parentDim) {
            if (DEBUG_PROMOTION) console.log(`[DEBUG_PROMOTION] REJECT: parentDim missing for nextLayer=${nextLayer}`);
            return;
        }

        let created = parentDim.createParentFrame(frameA, frameB);
        if (DEBUG_PROMOTION && created) console.log(`[DEBUG_PROMOTION] SUCCESS: created parent in dim=${nextLayer}`);
        if (DEBUG_PROMOTION && !created && this.universe.tick % 60 === 0) console.log(`[DEBUG_PROMOTION] REJECT: createParentFrame returned null`);
    }

    getQtreeFromFrames() {
        let qtree = QuadTree.create(this.universe.universe_rect, 1, this.mb_w);
        for (let frame of this.frames) {
            qtree.insert(frame);
        }
        return qtree;
    }

    /**
     * Given a quadtree of fundamental quanta
     * @param {*} qtree 
     * @returns 
     */
    generateFrames(qtree) {
        if (!qtree) {
            return [];
        }
        // Assuming the quadtree is already created and populated
        let frames = [];
        let mb_size_rect = new Rectangle(0, 0, this.mb_w, this.mb_h, null, true);
        let mb_candidates = qtree.findRegions(mb_size_rect, this.fill_threshold, true, false); //gets us an array of objects which are {rect: Rectangle, quanta: quanta[]} where Rect is a new Rectangle centered on the node's center of mass and with width and height equal to the rect_size, and quanta is an array of the quanta in the node

        let rejected_points = [];
        //for each mb_candidate we will create a frame
        for (let mb_candidate of mb_candidates) {
            let mb_rect = mb_candidate.rect;
            let pointsInRect = mb_candidate.quanta;
            if (pointsInRect.length === 0) {
                continue;
            }
            //give the frame a random velocity
            //let vx = random(-1, 1);
            //let vy = random(-1, 1);
            let vx = 0;
            let vy = 0;
            if (!this.universe.emergentPhysics) {
                vx = 1;
                vy = 0;
            }
            this.alignMBtoDimGrid(mb_rect); //make sure the frame is aligned to the dimension grid
            let frame = new Frame(this.layer, mb_rect, vx, vy, this.wrap, this.boundary_rect, null, this.universe.emergentPhysics);
            let new_rejected = frame.addPoints(pointsInRect);
            rejected_points = rejected_points.concat(new_rejected);
            if (frame.children.length > 0) {
                frames.push(frame);
            } else {
                consoleLog("frame has no children");
            }

        }
        //we return the rejected quanta to the quadtree so that it can be re-queried
        if (rejected_points.length > 0) {
            //we tried to overfill the frames, so we need to re-query the quadtree and combine the results with the rejected quanta into a new quadtree
            rejected_points = rejected_points.concat(qtree.queryAll());
            qtree = QuadTree.create(this.universe.universe_rect, 1, this.mb_w);
            qtree.insertAll(rejected_points);
        }
        return { frames, qtree };
    }

    alignMBtoDimGrid(mb_rect) {
        // Align the frame to the dimension grid
        //allowed left positions Math.floor((this.boundary_rect.left / this.mb_w)) * this.mb_w
        //allowed top positions Math.floor((this.boundary_rect.top / this.mb_h)) * this.mb_h
        let left = Math.floor((mb_rect.left / this.mb_w)) * this.mb_w;
        let top = Math.floor((mb_rect.top / this.mb_h)) * this.mb_h;
        mb_rect.left = left;
        mb_rect.top = top;
    }

    releasePoints(quanta) {
        //called by the children frames to release their quanta to the dimension (which will then release them to the universe)
    }
    /***
     * Given a qtree of quanta, add quanta to existing frames if covered or create new ones if not. Return the remainder (non-dimension quanta) as a quadtree
     */
    addPointsFromQuadTree(qtree) {
        //first iterate through existing frames and search for quanta that are in the frame
        for (let frame of this.frames) {
            //for the frame to add the quanta, the quanta must be fully in the frame's rect
            let pointsInRect = qtree.query(frame.rect);
            if (pointsInRect.length > 0) {
                let new_rejected = frame.addPoints(pointsInRect);
                //remove the quanta from the quadtree
                qtree.removeAll(pointsInRect);
                //add the rejected quanta back to the quadtree
                qtree.insertAll(new_rejected);
            }
        }

        //next we will create frames from the quadtree
        let ret_obj = this.generateFrames(qtree);
        let new_mb = ret_obj.frames;
        qtree = ret_obj.qtree;
        //add the quanta from the frames to the quantum list
        let new_points = [];
        for (let frame of new_mb) {
            new_points = new_points.concat(frame.children);

        }

        this.frames = this.frames.concat(new_mb);
        //return the remainder (non-dimension quanta) as a quadtree
        return qtree; //technically not needed since the quadtree is passed by reference
    }

    reset() {
        this.frames = [];
    }

    /**
     * update() — Per-dimension physics step. Called from doTick Phase C for every dimension.
     *
     * Step 1: REINIT dirty frames (recalculate mass/velocity from children after merges).
     * Step 2: MOVE each frame (probabilistic 1px step, integer positions).
     * Step 3: COMPRESS children toward parent center (gravitational pull, only if not highest dim).
     * Step 4: COLLISION DETECTION via quadtree.insertAll — frames that can't be inserted collide.
     *         The quadtree sets frame.other on each collision pair.
     * Step 5: For each collision pair:
     *   5a. MERGE — transfer children from smaller to larger frame in the overlap region.
     *   5b. EVENT-DRIVEN PROMOTION — if both frames are alive, unparented, and overlapping,
     *       call handleStructurePromotion to create a parent frame in the next higher dimension.
     *       Branching: emergentPhysics=true → spawns dim if needed; =false → requires pre-registered dim.
     * Step 6: LARGE OBJECT COLLISIONS — walls, detectors interact with frames in this dimension.
     * Step 7: CLEANUP — remove dead frames and empty non-leaf frames.
     */
    update(t, large_object_list = null) {
        if (this.frames.length === 0) {
            return [];
        }
        this.local_time = t;

        let qtree = QuadTree.create(this.universe.universe_rect, 1, this.mb_w);

        // Steps 1-3: Reinit, Move, Compress
        for (let frame of this.frames) {
            if (frame.dirty == true) {
                frame.reinit();
            }
            frame.move(t);

            // Compress: parent frames attract children toward their center.
            // Only non-leaf frames have children to attract.
            if (!frame.is_leaf) {
                frame.compress();
            }
        }

        // Step 4: Collision detection — insertAll returns frames that couldn't be inserted (colliders).
        // Each returned frame has .other set to the frame it collided with.
        let collisionList = qtree.insertAll(this.frames);

        let released_points = [];

        // Step 5: Process collisions only when inter-quantum collisions are enabled.
        // Free-space experiments (wave interference, particle walk) set withInterQuantumCollisions=false
        // so overlapping leaf frames pass through each other without merging or promoting.
        // The quadtree is still built (Step 4) for LargeObject collision queries in Step 6.
        if (this.universe.withInterQuantumCollisions && collisionList.length > 0) {
            if (DEBUG_PROMOTION && this.universe.tick % 60 === 0) {
                console.log(`[DEBUG_PROMOTION] dim=${this.layer} tick=${this.universe.tick} collisions=${collisionList.length} (with frame.other: ${collisionList.filter(f => f.other).length})`);
            }
            for (let frame of collisionList) {
                if (frame.other) {
                    // 5a: Merge — smaller gives children to larger in the overlap area
                    frame.merge(frame.other);

                    // 5b: Event-driven promotion — create parent in next dimension
                    let nextLayer = this.universe.dimensions.getNextKey(this.layer);
                    let canPromote = this.universe.emergentPhysics || (nextLayer !== undefined);

                    let overlaps = frame.rect.overlaps && frame.rect.overlaps(frame.other.rect);
                    if (canPromote && overlaps) {
                        this.handleStructurePromotion(frame, frame.other);
                    } else if (DEBUG_PROMOTION && this.universe.tick % 60 === 0 && canPromote && !overlaps) {
                        console.log(`[DEBUG_PROMOTION] dim=${this.layer} skip: frames do not overlap`);
                    } else if (DEBUG_PROMOTION && this.universe.tick % 60 === 0) {
                        console.log(`[DEBUG_PROMOTION] dim=${this.layer} canPromote=false nextLayer=${nextLayer} emergentPhysics=${this.universe.emergentPhysics}`);
                    }
                }
            }
            consoleLog(collisionList.length, "collisions detected");
        }

        // Step 6: Large object collisions (walls, detectors)
        // lo.collide() processes frames in-place (bounce, reflect, absorb, eject).
        // Absorbed frames are killed and will be removed by Step 7 cleanup.
        // Bounced/reflected frames remain in this dimension — do NOT re-inject as released_points,
        // which would duplicate them in dim.frames and cause double-movement (acceleration bug).
        if (large_object_list) {
            for (let lo of large_object_list) {
                lo.collide(qtree, this.mb_w, collisionList);
            }
        }

        // Step 7: Cleanup — remove dead frames and empty non-leaf frames
        this.frames = this.frames.filter(frame => frame.is_alive && (frame.is_leaf || frame.children.length > 0));

        return released_points;
    }

    move(t) {
        let released_points = [];
        // Move each frame
        for (let frame of this.frames) {
            frame.move(t);
            // Check if this frame has completely escaped the boundary of its parent frame (if it has one)
            if (frame.parent && !frame.parent.rect.contains(frame.rect)) {
                // Release all the quanta in this frame
                released_points.push(frame);
            }
        }
    }

    collectFrameData(t) {
        this.last_render_time = t;
        let frameDataList = [];
        if (this.isHidden) {
            return frameDataList;
        }
        for (let frame of this.frames) {
            frameDataList.push(frame.toFrameData(t, this.showFrameOutlinesOnly));
        }
        return frameDataList;
    }

    getMassForColor(colorName) {
        const capacity = this.mb_w * this.mb_h;
        return LightColor.getFullnessForColorName(colorName) * capacity;
    }

    /// A convenience method to get wavelength associated with a color. This is not really part of the physics model.
    getWavelengthForColor(colorName) {
        const mass = this.getMassForColor(colorName);
        if (mass === undefined) {
            throw new Error(`Invalid color name: ${colorName}`);
        }

        let wavelengthFactor = Math.floor((this.capacity / mass) * WAVELENGTH_CONSTANT);
        wavelengthFactor = Math.max(1, wavelengthFactor);
        const wavelength = wavelengthFactor * this.rect.w;

        return wavelength;
    }


}


class FrameData {
    constructor(tick, id, layer, rect, fullness, outline, isAlive, childCount, mass, collidedId, vx, vy) {
        this.tick = tick;
        this.id = id;
        this.layer = layer;
        this.rect = rect;
        this.fullness = fullness;
        this.outline = outline;
        this.isAlive = isAlive;
        this.childCount = childCount;
        this.mass = mass;
        this.collidedId = collidedId;
        this.vx = vx;
        this.vy = vy;
    }
}

class DimensionData {
    constructor(tick, layer, frameCount, boundaryRect) {
        this.tick = tick;
        this.layer = layer;
        this.frameCount = frameCount;
        this.boundaryRect = boundaryRect;
    }
}

class UniverseData {
    constructor(tick, dimensionCount, boundaryRect) {
        this.tick = tick;
        this.dimensionCount = dimensionCount;
        this.boundaryRect = boundaryRect;
    }
}

class TickData {
    constructor(universeData) {
        this.universeData = universeData;
        this.dimensionData = [];
        this.frameData = [];
    }

    addDimensionData(dimensionData) {
        this.dimensionData.push(dimensionData);
    }

    addFrameData(frameData) {
        this.frameData.push(frameData);
    }
}

if (typeof module !== 'undefined') {
    module.exports = { EGPTUniverse, Frame, Dimension, TickData, FrameData, DimensionData, UniverseData, LightColor, Charge };
} else if (typeof window !== 'undefined') {
    window.EGPTUniverse = EGPTUniverse;
    window.Frame = Frame;
    window.Dimension = Dimension;
    window.Charge = Charge;
    window.LightColor = LightColor;
}