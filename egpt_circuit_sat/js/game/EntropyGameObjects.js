/* Copyright 2023-2025 by Essam Abadir */

const CollisionTypes = {
    NONE: 'NONE',

    REFLECT_X: 'REFLECT_X',
    REFLECT_Y: 'REFLECT_Y',
    REFLECT_XY: 'REFLECT_XY',
    RANDOM_X: 'RANDOM_X',
    RANDOM_Y: 'RANDOM_Y',
    RANDOM_XY: 'RANDOM_XY',
    MOMENTUM_BASED: 'MOMENTUM_BASED',
    BOUNCE: 'BOUNCE',
    BOUNCE_UP: 'BOUNCE_UP',
    BOUNCE_DOWN: 'BOUNCE_DOWN',
    BOUNCE_LEFT: 'BOUNCE_LEFT',
    BOUNCE_RIGHT: 'BOUNCE_RIGHT',
    WALL: 'WALL', // Reposition only — subtracts this tick's displacement from momentum to restore pre-move vx/vy. No flip, no move_undo. For circuit wire walls where brownian motion handles path exploration.
};

const CollisionActions = {
    NONE: 'NONE',
    COUNT: 'COUNT', //count at the detector screen
    RECOLOR: 'RECOLOR',
    FORCE_RENDER: 'FORCE_RENDER',
    DETECT: 'DETECT', //detect at the slit, forces collisions (i.e. "observes" the quantum)
    MARK: 'MARK', //mark the quantum with the name of slit it passes through without "observing" the quantum (i.e. no collisions)
    KILL: 'KILL', //kill the quantum,
    CONTAIN_X: 'CONTAIN_X', //contain the quantum in rectangular bounds of the object it collides with
    CONTAIN_Y: 'CONTAIN_Y', //contain the quantum in rectangular bounds of the object it collides with
    BLOCK: 'BLOCK', //block the quantum from moving in the direction of the collision. Moves the quantum to the closest side of the object it collides with
    BOUNCE: 'BOUNCE', //bounce the quantum off the object it collides with in a direction opposite to the name of the object. For example, if the object is named "LEFT" the quantum will bounce to the right
    ABSORB: 'ABSORB'
};

/**
 * A LargeObject is a convenience object which respects our collision rules. We do this so we don't have to recursively build objects from pixels 
 * and frames (and strain our poor CPU). The LargeObject class, 
 * via a frametree search range, is implements a collidable rectangle that can be used to represent a wall or other large object.
 * The LargeObject can simulate different packing internals by setting how the quantum should respond to collisions with quanta and frames presumed to be at smaller dimensional scales: ABSORB is equivalent to a loosely packed LargeObject (useful for replicating 'detectors'), REFLECT is densely packed.
 * Simulation data only — no rendering. Consumers render via rect, color, etc.
 */
class LargeObject {
    constructor(context, color, rect, collision_type, arr_collision_actions = [], name = "", reposition = null, observedDimensions = null) {
        this.context = context;
        this.color = color;
        this.rect = rect;
        this.observedDimensions = observedDimensions;
        this.tracedQuantum = null;
        this.tracedFrame = null;
        if (!reposition) {
            reposition = "CLOSEST";
        }

        /** if otherRect overlaps  this rect this will move the other rect such that it no longer overlaps.
         * @param {Rectangle} otherRect - the rectangle to move
         * @param {string} toSide - the side of this rectangle to move the other rectangle to. One of 'top', 'bottom', 'left', 'right', or 'closest'
         */



        this.reposition = reposition; //LEFT, RIGHT, TOP, BOTTOM -- move a collided quantum to the left, right, top, or bottom of the large object
        this.collision_type = collision_type;
        //Map of maps. 
        //MAP LEVEL1: Top level Map key is a tag name placed by a detector, the values are the 2nd level Map
        //MAP LEVEL2: Keys are 2D coordinate corresponds to a quantum's hit position. The value at each position is a count of the collisions there.
        this.collision_positions = new Map();
        this.visible = true;
        this.alpha = 255;
        this.arr_collision_actions = arr_collision_actions;
        this.search_rect = new Rectangle(this.rect.left, this.rect.top, this.rect.w, this.rect.h, null, false);
        this.name = name;
    }

    eject(otherRect, toSide, contain = false, forceReposition = false) {
        //if the other rect is not overlapping this rect, return (unless forceReposition for frames that passed through)
        let overlap = this.rect.overlaps(otherRect);
        if (!overlap && !forceReposition) {
            return;
        }
        let newLeft = otherRect.left;
        let newTop = otherRect.top;

        switch (toSide) {
            case 'top':
                newTop = this.rect.top - otherRect.h - 1;
                break;
            case 'bottom':
                newTop = this.rect.bottom + 1;
                break;
            case 'left':
                newLeft = this.rect.left - otherRect.w - 1;
                break;
            case 'right':
                newLeft = this.rect.right + 1;
                break;
            default:
                //move to the closest side
                let leftDist = Math.abs(this.rect.left - otherRect.left);
                let rightDist = Math.abs(this.rect.right - otherRect.left);
                let topDist = Math.abs(this.rect.top - otherRect.top);
                let bottomDist = Math.abs(this.rect.bottom - otherRect.top);
                let minDist = Math.min(leftDist, rightDist, topDist, bottomDist);

                if (minDist === leftDist) {
                    if (!contain) {
                        newLeft = this.rect.left - otherRect.w - 1;
                    } else {
                        newLeft = this.rect.left + 1;
                    }
                } else if (minDist === rightDist) {
                    if (!contain) {
                        newLeft = this.rect.right + 1;
                    } else {
                        newLeft = this.rect.right - otherRect.w - 1;
                    }
                } else if (minDist === topDist) {
                    if (!contain) {
                        newTop = this.rect.top - otherRect.h - 1;
                    } else {
                        newTop = this.rect.top + 1;
                    }
                } else {
                    if (!contain) {
                        newTop = this.rect.bottom + 1;
                    } else {
                        newTop = this.rect.bottom - otherRect.h - 1;
                    }
                }

                break;
        }
        otherRect.left = newLeft;
        otherRect.top = newTop;
        otherRect.right = newLeft + otherRect.w;
        otherRect.bottom = newTop + otherRect.h;
    }

    /** True if frame rect is past this wall (on the exterior side). Used to catch frames that moved through in one tick. */
    _isFramePastWall(frameRect) {
        let wallDir = this.name ? this.name.split("_")[0] : "";
        switch (wallDir) {
            case "LEFT": return frameRect.right < this.rect.left;
            case "RIGHT": return frameRect.left > this.rect.right;
            case "TOP": return frameRect.bottom < this.rect.top;
            case "BOTTOM": return frameRect.top > this.rect.bottom;
            default: return false;
        }
    }

    tickFunction() {
        //If there is a quantum or frame being traced because it collided with the large object, check if it is inside the large object and if so, remove the trace. If it is outside the large object, continue the trace and print the position.
        // this.traceCollisions(null);
        // let observedDimensions = (this.observedDimensions) ? this.observedDimensions : this.context.universe.dimensions.keys();
        // for (let dimNum of observedDimensions) {
        //     let dim = this.context.universe.dimensions.get(dimNum);
        //     let frameTree = dim.getFrameTree();
        //     if (frameTree.mass !== dim.frames.length) {
        //         //console.log("Dim", dimNum, "FrameTree mass: ", frameTree.mass, " dim.frames.length: ", dim.frames.length);
        //     }
        //     let collided = this.collide(frameTree);
        //     for (let quantum of collided) {

        //         this.traceCollisions(quantum, dimNum);
        //         quantum.move_undo();
        //         this.doCollision(quantum);
        //     }
        // }

        
    }

    traceCollisions(quantum, dimNum = null) {
        return;
        if (!quantum) {
            if (!this.parentRect) return;
            //pre-tick check of traced quantum
            if (this.tracedQuantum) {
                if (this.parentRect.contains(this.tracedQuantum.rect)) {
                    this.tracedQuantum.startedTraceMessage = null;
                    this.tracedQuantum = null;
                } else {
                    if (this.tracedQuantum.startedTraceMessage) {
                        console.log("****** ", this.tracedQuantum.collidedLargeObjectMsg);
                        console.log(this.tracedQuantum.startedTraceMessage);
                        this.tracedQuantum.startedTraceMessage = null;
                    }
                    console.log(this.context.universe.tick, "--", this.tracedQuantum.rect.toString(), "--- Dim0 TRACING  --- Outside large object: ", this.tracedQuantum.quantum_id);
                }
            }
            if (this.tracedFrame) {
                if (this.parentRect.contains(this.tracedFrame.rect)) {
                    this.tracedFrame.startedTraceMessage = null;
                    this.tracedFrame = null;
                } else {
                    if (this.tracedFrame.startedTraceMessage) {
                        console.log("****** ", this.tracedFrame.collidedLargeObjectMsg);
                        console.log(this.tracedFrame.startedTraceMessage);
                        this.tracedFrame.startedTraceMessage = null;
                    }
                    console.log(this.context.universe.tick, "--", this.tracedFrame.rect.toString(), "--- Dim1 TRACING  --- Outside large object: ", this.tracedFrame.quantum_id);
                }
            }
        } else {
            if (!this.tracedQuantum && dimNum === 0) {
                this.tracedQuantum = quantum;
                let startedTraceMessage = `${this.context.universe.tick} -- ${quantum.rect.toString()} ---- Dim0 TRACE STARTED --- : ${quantum.quantum_id}`;
                quantum.startedTraceMessage = startedTraceMessage;

            } else if (!this.tracedFrame && dimNum > 0) {
                this.tracedFrame = quantum;
                let startedTraceMessage = `${this.context.universe.tick} -- ${quantum.rect.toString()} ---- Dim1 TRACE STARTED --- : ${quantum.quantum_id}`;
                quantum.startedTraceMessage = startedTraceMessage;
            }
        }
        
    }

    addToUniverse(observedDimensions) {
        this.observedDimensions = observedDimensions;
        //bind the tick function to the object so it can be called by the universe
        this.context.universe.addTickFunction(this.tickFunction, this);
    }

    collide(qtree, mb_search_padding = 1, additionalFrames = []) {
        // CollisionTypes.NONE with no meaningful actions: nothing to do.
        // Early return avoids spurious "released_points" that would duplicate frames.
        if (this.collision_type === CollisionTypes.NONE && !this.arr_collision_actions.includes(CollisionActions.ABSORB)) {
            return [];
        }
        //let range = new Circle(this.rect.x, this.rect.y, this.rect.w);
        //create a new search rect that is the size of the large object plus the padding
        let search_rect = new Rectangle(this.rect.left - mb_search_padding, this.rect.top - mb_search_padding, this.rect.w + 2 * mb_search_padding, this.rect.h + 2 * mb_search_padding, null, false);
        // Use intersects (3rd param=true) so we catch frames that overlap the wall but aren't fully contained
        let quanta = qtree.query(search_rect, [], true);
        // Include frames rejected from the quadtree (collision-list) that fall within the search area.
        // These frames are not in the tree due to single-occupancy, but must still interact with walls/detectors.
        for (let frame of additionalFrames) {
            if (frame.is_alive && search_rect.intersects(frame.rect) && !quanta.includes(frame)) {
                quanta.push(frame);
            }
        }
        let collided_points = [];
        let uncollided_points = [];
        let quantum_points = [];
        let force_collision = this.arr_collision_actions.includes(CollisionActions.DETECT);
        let no_release = this.arr_collision_actions.includes(CollisionActions.MARK);
        for (let p of quanta) {
            //if the p is an instance of frame then we need to ask the frame for the collided quantum quanta that are in the frame
            // if (!p.is_leaf) {
            //     //need to get the quanta from the frame that are in the search_rect
            //     let mb_collided = p.collide(this.rect, force_collision, no_release);
            //     quantum_points.push(...mb_collided);
            // } else {
            //     quantum_points.push(p);
            // }
            quantum_points.push(p);
        }
        let detector_kill = false;
        for (let quantum_point of quantum_points) {
            let overlaps = this.rect.intersects(quantum_point.rect);
            let pastWall = !overlaps && this._isFramePastWall(quantum_point.rect);
            if (overlaps || pastWall) {
                collided_points.push(quantum_point);


                this.record_collision(quantum_point);
                if (this.arr_collision_actions.includes(CollisionActions.ABSORB)) {
                    quantum_point.kill();
                    if (this.name == "detector_screen") detector_kill = true;
                } else {

                    if (!quantum_point.is_alive || quantum_point.collided) {
                        continue;
                    }
                    quantum_point.collided = true;


                    if (this.collision_type === CollisionTypes.REFLECT_X) {
                        quantum_point.vx *= -1;
                    } else if (this.collision_type === CollisionTypes.REFLECT_Y) {
                        quantum_point.vy *= -1;
                    } else if (this.collision_type === CollisionTypes.REFLECT_XY) {
                        //pretend the large object is a quantum with no velocity to bounce the quantum off of
                        // let lo = this;
                        // lo.vx = 0;
                        // lo.vy = 0;
                        // quantum_point.bounce(lo)
                        quantum_point.vx *= -1;
                        quantum_point.vy *= -1;
                        this.eject(quantum_point.rect, this.reposition, false, pastWall);
                        if (this.arr_collision_actions.includes(CollisionActions.RECOLOR)) {
                            quantum_point._pos_color = this.color;
                        }

                    } else if (this.collision_type === CollisionTypes.RANDOM_X) {
                        quantum_point.vx = Math.random() * 2 - 1;
                        quantum_point.vy = 1;
                    } else if (this.collision_type === CollisionTypes.RANDOM_Y) {
                        //quantum_point.reset();
                        let vx = 1;
                        let vy = Math.random() * 2 - 1;
                        quantum_point.reset(null, null, vx, vy);
                        //move the quantum to the right of the large object
                        //quantum_point.rect.left = this.rect.right + 20;
                    } else if (this.collision_type === CollisionTypes.RANDOM_XY) {
                        let vx = Math.random();
                        let vy = Math.random() * 2 - 1;

                        quantum_point.reset(null, null, vx, vy);

                    } else if (this.collision_type === CollisionTypes.WALL) {
                        // Reposition particle out of wall. No move_undo, no momentum
                        // flip. Conservation already restored vx/vy to pre-move values
                        // (both axes subtracted for all particle types), so the particle
                        // retains its original drift momentum and tries again next tick.
                        // Brownian motion provides lateral exploration to find gaps.
                        this.eject(quantum_point.rect, this.reposition, false, pastWall);
                    } else if (this.collision_type === CollisionTypes.MOMENTUM_BASED) {
                        quantum_point.move_undo();
                    } else if (this.collision_type === CollisionTypes.BOUNCE) {
                        let wallDir = this.name ? this.name.split("_")[0] : "";
                        if (wallDir === "LEFT" || wallDir === "RIGHT") {
                            quantum_point._vx = -quantum_point.vx;
                        } else if (wallDir === "TOP" || wallDir === "BOTTOM") {
                            quantum_point._vy = -quantum_point.vy;
                        } else {
                            quantum_point._vx = -quantum_point.vx;
                            quantum_point._vy = -quantum_point.vy;
                        }
                        quantum_point.move_undo();
                    }

                    if (this.arr_collision_actions.includes(CollisionActions.BOUNCE)) {
                        this.eject(quantum_point.rect, this.reposition, false, pastWall);
                    }

                    if (this.arr_collision_actions.includes(CollisionActions.BLOCK)) {
                        if (pastWall) {
                            this.eject(quantum_point.rect, this.reposition, false, true);
                        } else {
                            this.rect.eject(quantum_point.rect, this.reposition, false);
                        }
                    }

                    if (this.arr_collision_actions.includes(CollisionActions.CONTAIN_Y)) {

                        if (quantum_point.rect.top < this.rect.top) {
                            quantum_point.rect.top = this.rect.top + 1;
                        } else if (quantum_point.rect.bottom > this.rect.bottom) {
                            quantum_point.rect.top = this.rect.bottom - quantum_point.rect.h - 1;
                        }


                    }
                }


            } else {
                uncollided_points.push(quantum_point);
            }
            quantum_point.collided = false;
        }
        if (detector_kill) {
            let detector_name = this.name;
        }

        return (no_release) ? [] : collided_points;
    }


    add_hit_position_for_detector(detector_name = "", hit_position) {
        let increment = hit_position.increment;
        hit_position = { x: hit_position.x, y: hit_position.y };
        if (this.collision_positions.has(detector_name)) {
            let detector_positions = this.collision_positions.get(detector_name);
            if (detector_positions.has(hit_position)) {
                detector_positions.set(hit_position, detector_positions.get(hit_position) + increment);
            } else {
                detector_positions.set(hit_position, increment);
            }
        } else {
            let detector_positions = new Map();
            detector_positions.set(hit_position, increment);
            this.collision_positions.set(detector_name, detector_positions);
        }
    }

    record_collision(quantum) {

        let lo_x = Math.floor(quantum.rect.left - this.rect.left);
        let lo_y = Math.floor(quantum.rect.top - this.rect.top);

        let reset_quantum_wavelength_remainder = true;
        for (let collision_action of this.arr_collision_actions) {
            if (collision_action === CollisionActions.COUNT) {
                //print ("counting quantum_id: ", quantum.quantum_id, " at ", lo_x, ",", lo_y, "with spin: ", quantum.spin)
                //the i,j position in the 2D array corresponds to the order quantum was put in the array

                //let increment = quantum.p_up;
                let increment = 1;

                let hit_position = { x: lo_x, y: lo_y, increment: increment };
                let detector_name = quantum.data ? quantum.data.detector_name : "Undetected";
                this.add_hit_position_for_detector(detector_name, hit_position);

            }

            if (collision_action === CollisionActions.MARK) {
                //mark the user data with the name of the quantum detector
                quantum.data = { detector_name: this.name };
            }

            if (collision_action === CollisionActions.DETECT) {
                //mark the user data with the name of the quantum detector
                quantum.data = { detector_name: this.name };
            }

        }

    }

    getCollisionDataByY() {
        let return_map = new Map();

        // Loop through each detector (LEVEL2 Map)
        for (let [detector_name, detector_positions] of this.collision_positions.entries()) {
            let collisionData = new Map();
            //zero fill the collisionData map
            for (let i = 0; i < this.rect.h; i++) {
                collisionData.set(i, 0);
            }

            // Aggregate collision counts by Y position
            for (let [position, count] of detector_positions.entries()) {
                let y = position.y;
                if (collisionData.has(y)) {
                    collisionData.set(y, collisionData.get(y) + count);
                } else {
                    collisionData.set(y, count);
                }
            }

            // Convert the Map to an array of objects for D3.js
            let hit_data = Array.from(collisionData, ([y, count]) => ({ y, count }));

            // Sort the array by y (highest to lowest)
            hit_data.sort((a, b) => b.y - a.y);

            // Put each array in a Map keyed by the detector name
            return_map.set(detector_name, hit_data);
        }

        return return_map;
    }
}

/**
 * A QuantumEmitter is a convenience object for introducing new quanta into the simulation. It is a quantum emitter.
 */
class QuantumEmitter {
    constructor(context, color, left, top, width, height, vx, vy, level, wavelength, charge, wrap = true, auto_fire = false, canvas_rect = null, random_direction = false, quantum_limit = Infinity, burst_size = 100, name = "quantum_emitter") {
        this.context = context;
        this.controller = null
        this.quantum_limit = quantum_limit;
        this.left = left;
        this.top = top;
        this.vx = vx;
        this.vy = vy;
        this.random_direction = random_direction;
        this.color = color;
        this.level = level;
        this.wavelength = wavelength;
        this.charge = charge;
        this.wrap = wrap;
        this.w = width;
        this.h = height;
        this.auto_fire = auto_fire;
        this.canvas_rect = canvas_rect;
        this.burst_size = burst_size;
        this.source_rects = [];
        this.delay = 0;
        this.remaining_delay = 0;
        this.source_rect = new Rectangle(left, top, width, height, null, false);
        this.name = name;
        // Optional compatibility switches for core-like wave experiments.
        this.fixedLeafMass = null;
        this.coreWaveMode = false;


    }
    fire(source_rect = this.source_rect, burst_size = 100) {
        let quanta = [];
        let from_x, from_y;

        if (this.quantum_limit != Infinity) {
            if (this.burst_size > this.quantum_limit) {
                burst_size = this.quantum_limit;
            } else {
                burst_size = this.burst_size;
            }
        }
        //else {
        //     burst_size = this.burst_size;
        // }

        const rnd = (typeof random !== 'undefined') ? random : (a, b) => (b === undefined ? (a === undefined ? Math.random() : Math.random() * a) : a + Math.random() * (b - a));
        for (let i = 0; i < burst_size; i++) {
            from_x = Math.floor(rnd(source_rect.left, source_rect.left + source_rect.w - 1));
            from_y = Math.floor(rnd(source_rect.top, source_rect.bottom));
            // (this.name, " firing at ", from_x, from_y, "vx: ", this.vx, "vy: ", this.vy);
            let vx = this.vx;
            let vy = this.vy;
            if (this.random_direction) {
                vx = Math.floor(Math.random() * 3) - 1;
                vy = Math.floor(Math.random() * 3) - 1;
            }

            let charge = Math.random() < 0.5 ? Charge.POSITIVE : Charge.NEGATIVE;
            if (this.charge !== undefined && this.charge !== null) {
                charge = this.charge;
            }

            let new_quantum = Frame.makeLeafFrame(from_x, from_y, this.level, this.wavelength, vx, vy, false, charge, this.canvas_rect, this.color);

            quanta.push(new_quantum);
        }
        this.quantum_limit -= burst_size;
        return quanta;
    }

    getDefaultTickFunction(burst_size = 100) {
        return function () {
            let return_quanta = [];
            if (this.auto_fire && this.remaining_delay <= 0) {

                for (let source_rect of this.source_rects) {
                    return_quanta = return_quanta.concat(this.fire(source_rect, burst_size));
                }

                this.remaining_delay = this.delay;

            } else {
                if (this.remaining_delay > 0) {
                    this.remaining_delay--;
                } else {
                    this.remaining_delay = 0;
                }

            }
            return return_quanta;
        }.bind(this);


    }


}

class SlitLightSource {
    constructor(context, slitScreen, angle_increment, use_point_source, laser_color, quantum_dimension_number) {
        this.context = context;

        let light_source_left = 20;
        let light_source_r = Math.round(slitScreen.wavelength * .25);
        let light_source_height = light_source_r * 2;
        let light_source_width = light_source_r * 2;


        let light_source_1y = slitScreen.slit1.rect.y;
        let light_source_rect1 = new Rectangle(light_source_left, light_source_1y, light_source_width, light_source_height, null, true);
        let light_source_2y = slitScreen.slit2.rect.y;
        let light_source_rect2 = new Rectangle(light_source_left, light_source_2y, light_source_width, light_source_height, null, true);
        let light_source_center_y = slitScreen.wall2.rect.y;
        let quantumlimit = Infinity;
        this.lightSource = null;
        let pg_autofire = true, random_direction = false;
        let bouncy_box = false;
        use_point_source = true;
        if (bouncy_box) {
            let wallColor = [120, 120, 120], wallThickness = 10, slitHeight = 40, wallCollisionType = CollisionTypes.BOUNCE, wallCollisionActions = [CollisionActions.BOUNCE], num_bouncing_balls = 1000;

            let boxRect = new Rectangle(20, this.context.canvas_rect.y, slitScreen.wall2.rect.w, slitScreen.wall2.rect.h / 2, null, true);
            //Create a new BlackBody instance (an "oven" built of walls and radiating light - and a slit for light to escape)
            let bouncyBox = new BouncyBox(this.context, boxRect, wallColor, wallThickness, boxRect.h, wallCollisionType, wallCollisionActions, num_bouncing_balls, 2, 2)
            this.lightSource = bouncyBox;
        }
        else if (use_point_source) {
            //emits bands of light
            let pointSOURCESIZE = 16;
            let delay = 1;
            let color = [0, 255, 0], squareSide = pointSOURCESIZE, charge = null, wrap = false;

            let pointSourceCenter = new PointSource(this.context, color, light_source_rect1.x, light_source_center_y, squareSide, 1, slitScreen.wavelength, charge, wrap, true, this.context.canvas_rect, delay, quantumlimit, angle_increment, quantum_dimension_number);
            pointSourceCenter.remaining_delay = delay;
            this.lightSource = pointSourceCenter;


        } else {
            //this one does a plane wave
            let pg_color = laser_color ? laser_color : [255, 0, 0], pg_x = light_source_rect1.x, pg_y = light_source_center_y, pg_w = 1, pg_h = 10, pg_vx = 1, pg_vy = 0, level = quantum_dimension_number, pg_wrap = true, pg_autofire = false, random_direction = false, charge = null;

            let quantum_emitter = new QuantumEmitter(this.context, pg_color, pg_x, pg_y, pg_w, pg_h, pg_vx, pg_vy, level, slitScreen.wavelength, charge, pg_wrap, pg_autofire, this.context.canvas_rect, random_direction, quantumlimit);

            quantum_emitter.auto_fire = true;

            let gun_height = light_source_rect2.bottom - light_source_rect1.top;
            let light_source_rect_center = new Rectangle(light_source_rect1.x, light_source_center_y, 1, gun_height, null, true);

            quantum_emitter.source_rects.push(light_source_rect_center);
            this.lightSource = quantum_emitter;
        }
    }
    getTickFunction() {

        if (this.lightSource instanceof Laser) {
            return function () {
                if (this.lightSource.auto_fire) {
                    this.lightSource.fire();
                }
            }.bind(this);

        } else if (this.lightSource instanceof BouncyBox) {
            //return a no-op function
            return function () {
                return [];
            };
        }
        else {
            return this.lightSource.getDefaultTickFunction();
        }




    }
}

class DetectorWall {
    constructor(context, canvas_rect, wall_x = null, wall_y = null, wall_action = CollisionTypes.ABSORB, wall_color = [120, 120, 120], wall_height = null, wall_width = null, wall_name = "detector_wall", arrDetectionDimenionNumbers = null) {
        this.context = context;
        this.observedDimensions = arrDetectionDimenionNumbers;
        this.wall_x = wall_x !== null ? wall_x : canvas_rect.right - 20;
        this.wall_y = wall_y !== null ? wall_y : 0;
        wall_height = wall_height !== null ? wall_height : canvas_rect.h;
        wall_width = wall_width !== null ? wall_width : 20;
        //add a random number to the wall_name for uniqueness
        wall_name = wall_name + Math.floor(Math.random() * 1000000);
        this.detector_wall = new LargeObject(this.context, wall_color, new Rectangle(this.wall_x, this.wall_y, wall_width, wall_height, null, false), wall_action, [CollisionActions.COUNT, CollisionActions.ABSORB], wall_name);
        //this.detector_screen = new LargeObject(this.entropyGame, [120, 120, 120], new Rectangle(this.wall_x, 0, 20, canvas_rect.h, null, false), CollisionTypes.ABSORB, [CollisionActions.COUNT, CollisionActions.RECOLOR], "detector_screen");

    }

    addToUniverse(observedDimensions) {
        //get all the dimensions in the universe
        this.detector_wall.addToUniverse(observedDimensions);
    }

    get x() {
        return this.detector_wall.rect.x;
    }

    set x(x) {
        this.detector_wall.rect.x = x;
    }


}

class SlitScreen {
    constructor(context, wall_left, wall_width, canvas_height, wavelength, absorb_at_slit_wall, detect_at_slits) {
        this.context = context;
        this.wavelength = wavelength;
        this.slit_height = Math.floor(wavelength * 0.8);
        this.slit_wall_gap_height = Math.floor(wavelength * .8);
        this.slit_group_height = this.slit_height + this.slit_wall_gap_height + this.slit_height;
        this.slit_group_center_y = canvas_height / 2;
        this.slit1_top = this.slit_group_center_y - this.slit_group_height / 2;
        this.slit_wall_gap_top = this.slit1_top + this.slit_height;
        this.slit2_bottom = this.slit_group_center_y + this.slit_group_height / 2;
        this.slit2_top = this.slit2_bottom - this.slit_height;
        this.slit_group_left = wall_left;
        this.slit_width = wall_width;
        this.bottom_wall_height = canvas_height - this.slit2_bottom;


        this.wall_collision_actions = absorb_at_slit_wall ? [CollisionActions.ABSORB] : [CollisionActions.BLOCK];
        this.wall_collision_type = CollisionTypes.NONE;


        this.detector_actions = [CollisionActions.MARK];
        this.detector_type = CollisionTypes.NONE;
        this.slit1_color = [0, 0, 0, 0];
        this.slit2_color = [0, 0, 0, 0];

        if (detect_at_slits == 1) {
            this.detector_actions.push(CollisionActions.DETECT);
            this.detector_type = CollisionTypes.RANDOM_XY;
        }
        if (detect_at_slits == 2) {
            this.detector_actions.push(CollisionActions.DETECT);
            //this.detector_type = CollisionTypes.REFLECT_Y;
            this.slit1_color = [0, 0, 255];
            this.slit2_color = [0, 0, 255];
        }
        //this.slit1_color = [0, 0, 255, 25];
        //this.slit2_color = [0, 0, 255, 25];

        let wall1 = new LargeObject(this.context, [255, 0, 0], new Rectangle(this.slit_group_left, 0, this.slit_width, this.slit1_top - 1, null, false), CollisionTypes.NONE, this.wall_collision_actions, "wall1");

        let slit1 = new LargeObject(this.context, this.slit1_color, new Rectangle(this.slit_group_left, this.slit1_top, this.slit_width, this.slit_height - 1, null, false), this.detector_type, this.detector_actions, "slit1");
        let liner_height = 10;
        //add a slit liner to the top of the slit
        let slit1_liner_top = new LargeObject(this.context, [0, 0, 255], new Rectangle(this.slit_group_left, this.slit1_top, this.slit_width, liner_height, null, false), CollisionTypes.RANDOM_XY, [CollisionActions.BLOCK], "slit1_liner_top");

        //add a slit liner to the bottom of the slit
        let slit1_liner_bottom = new LargeObject(this.context, [0, 0, 255], new Rectangle(this.slit_group_left, this.slit1_top + this.slit_height - liner_height, this.slit_width, liner_height, null, false), CollisionTypes.RANDOM_XY, [CollisionActions.BLOCK], "slit1_liner_bottom");

        let wall2 = new LargeObject(this.context, [128, 0, 0], new Rectangle(this.slit_group_left, this.slit_wall_gap_top, this.slit_width, this.slit_wall_gap_height - 1, null, false), this.wall_collision_type, this.wall_collision_actions, "wall2");

        let slit2 = new LargeObject(this.context, this.slit2_color, new Rectangle(this.slit_group_left, this.slit2_top, this.slit_width, this.slit_height - 1, null, false), this.detector_type, this.detector_actions, "slit2");

        //add a slit liner to the top of the slit
        let slit2_liner_top = new LargeObject(this.context, [0, 0, 255], new Rectangle(this.slit_group_left, this.slit2_top, this.slit_width, liner_height, null, false), CollisionTypes.RANDOM_XY, [CollisionActions.BLOCK], "slit2_liner_top");

        //add a slit liner to the bottom of the slit
        let slit2_liner_bottom = new LargeObject(this.context, [0, 0, 255], new Rectangle(this.slit_group_left, this.slit2_top + this.slit_height - liner_height, this.slit_width, liner_height, null, false), CollisionTypes.RANDOM_XY, [CollisionActions.BLOCK], "slit2_liner_bottom");

        let wall3 = new LargeObject(this.context, [255, 0, 0], new Rectangle(this.slit_group_left, this.slit2_bottom, this.slit_width, this.bottom_wall_height - 1, null, false), this.wall_collision_type, this.wall_collision_actions, "wall3");

        this.slit1 = slit1;
        this.slit2 = slit2;
        this.wall1 = wall1;
        this.wall2 = wall2;
        this.wall3 = wall3;
        this.walls = [wall1, slit1, wall2, slit2, wall3, slit1_liner_top, slit1_liner_bottom, slit2_liner_top, slit2_liner_bottom];

    }

    addToUniverse() {
        // universe.addLargeObject(this.wall1);
        // universe.addLargeObject(this.slit1);
        // universe.addLargeObject(this.wall2);
        // universe.addLargeObject(this.slit2);
        // universe.addLargeObject(this.wall3);
        for (let wall of this.walls) {
            wall.addToUniverse();
        }
    }


}

class EgptFractal {
    /**
     * The EGPT Fractal demonstrates the basic fractal which produces an osilating pattern that is perceived as a wave depending on your frame of reference (how zoomed in on the fractal you are). The fractal is created by a quantum doing a random walk within a 2D grid contianer (the Frame), where that Frame is itself a quantum doing a random walk relative to a larger frame, and so on. In addition to the random walk, the quantum is also subject to a force that pulls it towards the center of the frame. Leaving aside collision rules, this is effectively the full fractal. The fractal is created by the following steps:
     * 1. Create a fundamental quantum which will do the random walk within the frame. The fundamental quantum is a frame with a width and height of 1. The fundamental quantum is the smallest unit of the fractal.
     * 2 .Create a reference frame which will be the oscillator as perceived by the observer. The width of the oscillator frame should relatively large (e.g. 64) and the quantum should be at it's left top.
     * 3. Create a frame which will be relatively large (e.g. 1024) and contain the oscillator frame. The oscillator left,top should be at it's left top.
     * 4. Animate by recursively calling a tick function that moves any frame in the same way: move 1 is a random move in the x or y direction, move 2 is a move towards the center of the frame. The maximum move magnitude is 1 but the sum of the two moves is accumulated into the velocity vector (i.e. conservation of momentum). This animation will create the fractal and the recursive library for this is EGPTfraqtl_edu_edition_v1.js
        
     * @param {*} quantum_dimension_number
     * @param {*} canvas_rect 
     * @param {*} universe 
     */
    constructor(context, canvas_rect = null, universe = null) {
        this.context = context;
        let framedelta = 3;
        this.universe = universe || context.universe;

        this.quantum_dimension_number = 2;

        //the observer dimension size has width which is the highest power of 2 that is less than h,w of the canvas_rect
        const rectForObs = canvas_rect || context.canvas_rect;
        let observer_dimension_number = Math.pow(2, Math.floor(Math.log2(Math.min(rectForObs.w, rectForObs.h))));
        observer_dimension_number = Math.log2(observer_dimension_number);

        // Call init() FIRST — it resets dimensions via emergentPhysics setter.
        // Then add the oscillator hierarchy dimensions after init().
        const rect = canvas_rect || context.canvas_rect;
        this.universe.init(rect, this.quantum_dimension_number, 1, false, false, false, true, false);

        this.quantum_dimension = this.universe.addDimension(this.quantum_dimension_number);
        this.oscillator_dimension = this.universe.addDimension(this.quantum_dimension_number + framedelta);
        this.observer_dimension = this.universe.addDimension(observer_dimension_number);

        this.canvas_rect = rect;
        this.quanta = [];
        this.oscillator = null;
        this.observer_frame = null;
    }

    setupGameControls() {
        //this.context.ui.gameControls = 
    }

    setupFractal() {
        //Put the observer in the middle of the canvas
        let observer_rect = new Rectangle(this.canvas_rect.x, this.canvas_rect.y, this.observer_dimension.mb_w, this.observer_dimension.mb_h, null, true)

        //position the oscillator in the middle Y of the observer to the left of middle by 1/4 of the observer width
        this.oscOffsetX = observer_rect.x - this.observer_dimension.mb_w / 4;
        this.oscOffsetY = observer_rect.y;
        let oscillator_rect = new Rectangle(this.oscOffsetX, this.oscOffsetY, this.oscillator_dimension.mb_w, this.oscillator_dimension.mb_h, null, true)

        //position the quantum on the lower Y axis of the oscillator
        let pOffsetX = oscillator_rect.x;
        let pOffsetY = oscillator_rect.y + this.oscillator_dimension.mb_h / 4;
        let quantumRect = new Rectangle(pOffsetX, pOffsetY, this.quantum_dimension.mb_w, this.quantum_dimension.mb_h, null, true);
        let quantumFrame = Frame.makeLeafFrame(quantumRect.left, quantumRect.top, this.quantum_dimension_number, 1, 0, 0, false, Charge.POSITIVE, this.canvas_rect);
        quantumFrame.name = "quantum";

        //put the quantum at the bottom middle of the oscillator
        this.quanta.push(quantumFrame);
        // this.quanta.push(Frame.makeLeafFrame(this.oscillator_dimension.mb_w/2 + this.offsetX, 0 + this.offsetY, this.quantum_dimension_number, 1, 0, 0, false, Charge.POSITIVE, this.canvas_rect));

        // this.quanta.push(Frame.makeLeafFrame(0 + this.offsetX, this.oscillator_dimension.mb_w/2 + this.offsetY, this.quantum_dimension_number, 1, 0, 0, false, Charge.POSITIVE, this.canvas_rect));
        // put the quantum in the dimension
        for (let quantum of this.quanta) {
            this.quantum_dimension.addFrame(quantum);
        }

        //createFrameFromRect(rect, childFrames, vx, vy, addToDimension = true)
        this.oscillator = this.oscillator_dimension.createFrameFromRect(oscillator_rect, this.quanta, 0, 0);
        this.oscillator.name = "oscillator";
        //this.oscillator.vx = this.observer_dimension.mb_w / 2;

        this.observer_frame = this.observer_dimension.createFrameFromRect(observer_rect, [this.oscillator], 0, 0, true, true);
        this.universe.leafQuantaWidth = this.quantum_dimension.mb_w;
        this.universe.brownianMotion = true;
        this.oscillator_dimension.showFrameOutlinesOnly = true;
        this.observer_dimension.showFrameOutlinesOnly = true;
        this.observer_frame.name = "observer";
        //this.universe.withInterQuantumCollisions = true;

        return [];
    }

    handleCanvasClick(canvasX, canvasY) {
        return; //COMING SOON! Zooming in and out of the fractal from light to atoms to planets to galaxies
        let framedelta = 5;
        let highestDim = this.universe.highest_dimension;


        if (this.universe.tick === 0) {
            //place quantum at clicked coordinates
            this.quanta.push(Frame.makeLeafFrame(canvasX, canvasY, this.quantum_dimension.level - framedelta, 1, 0, 0, false, Charge.POSITIVE, this.canvas_rect));
            this.quantum_dimension.frames.push(this.quanta[this.quanta.length - 1]);

        } else if (this.quanta.length > 0 && !this.oscillator) {
            //place oscillator frame using clicked coordinates as bottom right corner of the oscillator

            let osc_w = this.oscillator_dimension.mb_w;
            let osc_h = this.oscillator_dimension.mb_h;
            let oscleft = canvasX - osc_w;
            let osctop = canvasY - osc_h;

            this.oscOffsetX = oscleft;
            this.oscOffsetY = osctop;
            let oscillator_rect = new Rectangle(this.oscOffsetX, this.oscOffsetY, osc_w, osc_h, null, false);

            this.oscillator = this.oscillator_dimension.createFrameFromRect(oscillator_rect, this.quanta, 0, 0);
            this.quanta = [];
            this.quanta.push(this.oscillator);

        } else if (this.quanta.length > 0 && !this.observer_frame) {
            //place observer frame using the clicked coordinates as the bottom right of the observer
            let obsleft = canvasX - this.observer_dimension.mb_w;
            let obstop = canvasY - this.observer_dimension.mb_h;
            let observer_rect = new Rectangle(obsleft, obstop, this.observer_dimension.mb_w, this.observer_dimension.mb_h, null, false)

            this.observer_frame = this.observer_dimension.createFrameFromRect(observer_rect, this.quanta, 0, 0, true, true);
            this.quanta = [];
            this.quanta.push(this.observer_frame);
        }
        if (this.universe.tick > 0 && !this.oscillator) {

            this.universe.highest_dimension = highestDim;
        }
    }
}

class Box {
    constructor(context, rect, useInnerRect, wallThickness, slitHeight, wallColor, wallCollisionType, arrCollisionActions, observedDimensions = null) {
        this.context = context;
        if (useInnerRect) {
            //the rect passed in is the inner rect, so calculate the outer rect
            let outerWidth = rect.w + 2 * wallThickness;
            let outerHeight = rect.h + 2 * wallThickness;
            this.rect = new Rectangle(rect.left - wallThickness, rect.top - wallThickness, outerWidth, outerHeight, null, false);
            this.innerRect = rect;
        } else {
            //rect passed in is the outer rect, so calculate the inner rect
            this.innerRect = new Rectangle(rect.left - wallThickness, rect.top - wallThickness, rect.w - wallThickness, rect.h - wallThickness, null, false);
            this.rect = rect;
        }

        this.wall_thickness = wallThickness;
        this.slit_height = slitHeight;
        this.wall_color = wallColor;
        this.wall_collision_type = wallCollisionType;
        this.arr_collision_actions = arrCollisionActions;
        this.walls = [];
        this.quantum_emitters = [];
        //calculate the inner rect to pass to the createWalls function
        this.createWalls(this.innerRect, this.wall_thickness, this.slit_height, this.wall_collision_type, this.arr_collision_actions, this.wall_color);
        this.addToUniverse();
    }

    createWalls(innerRect, wallWidth, slitHeight, wallCollisionType = CollisionTypes.REFLECT_XY, arrCollisionActions = [CollisionActions.BLOCK], wallColor = [20, 20, 20]) {

        let outerRect = this.rect

        // Top wall
        let topWall = new LargeObject(this.context, wallColor, new Rectangle(
            outerRect.left,
            outerRect.top,
            outerRect.w,
            wallWidth,
            null,
            false
        ), wallCollisionType, arrCollisionActions, "TOP", "bottom");
        this.walls.push(topWall);

        // Bottom wall
        let bottomWall = new LargeObject(this.context, wallColor, new Rectangle(
            outerRect.left,
            outerRect.bottom - wallWidth,
            outerRect.w,
            wallWidth,
            null,
            false
        ), wallCollisionType, arrCollisionActions, "BOTTOM", "top");
        this.walls.push(bottomWall);

        // Left wall
        let leftWall = new LargeObject(this.context, wallColor, new Rectangle(
            outerRect.left,
            outerRect.top,
            wallWidth,
            outerRect.h,
            null,
            false
        ), wallCollisionType, arrCollisionActions, "LEFT", "right");
        this.walls.push(leftWall);

        let slitTopHeight = outerRect.top - (outerRect.y - slitHeight) / 2;

        let topWallHeight = (outerRect.h - slitHeight) / 2;

        // Right wall with slit
        let rightWallTop = new LargeObject(this.context, wallColor, new Rectangle(
            outerRect.right - wallWidth,
            outerRect.top,
            wallWidth,
            topWallHeight,
            null,
            false
        ), wallCollisionType, arrCollisionActions, "RIGHT_T", "left");
        this.walls.push(rightWallTop);

        let rightWallBottom = new LargeObject(this.context, wallColor, new Rectangle(
            outerRect.right - wallWidth,
            outerRect.bottom - topWallHeight - 1,
            wallWidth,
            topWallHeight,
            null,
            false
        ), wallCollisionType, arrCollisionActions, "RIGHT_B", "left");
        this.walls.push(rightWallBottom);

        for (let wall of this.walls) {
            wall.parentRect = outerRect;
            wall.observedDimensions = this.observedDimensions;
        }
        return outerRect;
    }

    addToUniverse() {
        //get all the dimensions in the universe
        let allDims = null;
        for (let wall of this.walls) {
            wall.addToUniverse(allDims);
            //this.universe.addLargeObject(wall);

        }
    }
}

class BouncyBox {
    constructor(context, boxRect, wallColor = [20, 20, 150], wallThickness = 10, slitHeight = 20, wallCollisionType = CollisionTypes.MOMENTUM_BASED, arrCollisionActions = [CollisionActions.BOUNCE], num_bouncing_balls, fundamental_dimension_number = 0, quantum_dimension_number = 5, wavelength = null) {

        this.rect = boxRect;
        this.context = context;
        //init(universe_rect, fundamental_dimension_number, wavelengthConstant, isGreedy, noEscape, emergentPhysics, noObserverFrame, withWrapping)
        let isGreedy = false, wavelengthConstant = 1, noEscape = false, emergentPhysics = false, noObserverFrame = false, withWrapping = false;
        context.universe.init(context.canvas_rect, fundamental_dimension_number, wavelengthConstant, isGreedy, noEscape, emergentPhysics, noObserverFrame, withWrapping);
        // Ground-up mode: inter-quantum collisions drive frame promotion (handleStructurePromotion).
        context.universe.withInterQuantumCollisions = true;

        let reflectorBoxInner = new Box(context, boxRect, false, wallThickness, slitHeight, wallColor, wallCollisionType, arrCollisionActions);

        this.temperatureDial = new OvenBox(context, reflectorBoxInner, [1, 1, 1, 1], fundamental_dimension_number, quantum_dimension_number, num_bouncing_balls, 1, wavelength);

        //entropyGame.universe.addDimension
        this.addToUniverse();
    }

    addToUniverse() {
        // boxes add themselves to the universe. We didn't add anything else that also needs to be added to the universe
    }

}

/**
 * Given a box, the oven radiators will radiate inward from the boxwalls and try to maintain the given temperature. Temperature corresponds to the active quanta within the box (universe). 
 * @param {*} entropyGame
 * @param {*} box
 * @param {*} radiateFrom indicates wall to radiate from [LEFT,TOP,RIGHT,BOTTOM]. [1, 1, 1, 1] means radiate from all walls
 * @param {*} fundamental_dimension_number: the dimension where radiated quanta will be placed
 * @param {*} quantum_dimension_number: the dimension where frames will aggregate radiated quanta
 */
class OvenBox {
    constructor(context, box, radiateFrom = [1, 1, 1, 1], fundamental_dimension_number = 0, quantum_dimension_number = 2, initial_temp = 100, temp_multiplier = 1, wavelength = null) {

        this.context = context;
        this.universe = context.universe;
        this.canvas_rect = context.canvas_rect;
        // Center the black body in the canvas by creating a centered rectangle
        let isCentered = true;

        this.radiateFrom = radiateFrom;
        this.rect = box.rect;
        this.temp = initial_temp;
        this.burst_to_temp_ratio = temp_multiplier;
        this.quantum_wavelength = wavelength;

        //let quantum_dimension = new Dimension(0, quantum_dimension_number + 1, this.universe, false);
        //this.universe.dimensions.push(quantum_dimension);
        let quantum_dimension = null;
        if (quantum_dimension_number && quantum_dimension_number > fundamental_dimension_number) {
            // Ensure the target quantum dimension exists. We do NOT auto-fill intermediate dimensions.
            // This allows for non-consecutive dimensions (e.g. 0 and 4).
            quantum_dimension = context.universe.addDimension(quantum_dimension_number);
        }
        this.universe.brownianMotion = true;


        this.quantum_dimension_number = quantum_dimension_number;
        this.fundamental_dimension_number = fundamental_dimension_number;
        this.quantum_emitters = [];
        this.quantum_color = [255, 255, 255];
        this.quantum_charge = null;
        this.quantum_limit = Infinity;

        this.createQuantumEmitters(box.walls)
        this.addToUniverse();
    }


    addToUniverse() {
        let experiment_tick = this.getDefaultTickFunction();

        this.universe.experimentTickFunctions.push(experiment_tick);
    }
    /**
    * Create quantum emitters for each wall of the black body. These are the oscillators in the Black Body oven walls.
    */
    createQuantumEmitters(walls) {
        // We want the guns to be 1 pixel wide if they are vertical and 1 pixel tall if they are horizontal.
        // The guns should be positioned 1 pixel inward from the wall and shoot towards the center of the black body.

        let gun_wrap = true;
        let gun_autofire = true;
        let random_direction = false;
        let num_emitters = 1;
        for (let wall of walls) {
            // Determine the position of the gun based on the wall name
            let gun_left, gun_top, gunWidth, gunHeight, gun_vx, gun_vy, wall_thickness;
            //split the wall name on underscore to get the first part
            let wall_name = wall.name.split("_")[0];
            switch (wall_name) {
                case "LEFT":
                    if (this.radiateFrom[0] == 0) continue;
                    wall_thickness = wall.rect.w;
                    gun_left = wall.rect.right + 4;
                    gun_top = wall.rect.top + 2;
                    gunWidth = 1;
                    gunHeight = wall.rect.h - 4;
                    gun_vx = 1;
                    gun_vy = 0;
                    break;
                case "RIGHT":
                    if (this.radiateFrom[2] == 0) continue;
                    wall_thickness = wall.rect.w;
                    gun_left = wall.rect.left - 4;
                    gun_top = wall.rect.top + 2;
                    gunWidth = 1;
                    gunHeight = wall.rect.h - 4;
                    gun_vx = -1;
                    gun_vy = 0;
                    break;
                case "TOP":
                    if (this.radiateFrom[1] == 0) continue;
                    wall_thickness = wall.rect.h;
                    gun_left = wall.rect.left + 2 * wall_thickness + 2;
                    gun_top = wall.rect.bottom + 5;
                    gunWidth = wall.rect.w - 2 * wall_thickness - 4;
                    gunHeight = 1;
                    gun_vx = 0;
                    gun_vy = 1;
                    break;
                case "BOTTOM":
                    if (this.radiateFrom[3] == 0) continue;
                    wall_thickness = wall.rect.h;
                    gun_left = wall.rect.left + 2 * wall_thickness + 2;
                    gun_top = wall.rect.top - 2;
                    gunWidth = wall.rect.w - 2 * wall_thickness - 4;
                    gunHeight = 1;
                    gun_vx = 0;
                    gun_vy = -1;
                    break;


                default:
                    break;
            }


            //random_direction = true;
            // Create a quantum gun
            let emitter = new QuantumEmitter(this.context,
                this.quantum_color, gun_left, gun_top, gunWidth, gunHeight, gun_vx, gun_vy,
                this.fundamental_dimension_number, this.quantum_wavelength, this.quantum_charge,
                gun_wrap, gun_autofire, this.canvas_rect, random_direction, this.quantum_limit, this.burst_to_temp_ratio, wall.name + "_gun");
            this.quantum_emitters.push(emitter);


        }
        let totalSurfaceArea = 0;
        for (let emitter of this.quantum_emitters) {
            totalSurfaceArea += emitter.source_rect.w * emitter.source_rect.h;
        }
        for (let emitter of this.quantum_emitters) {
            emitter.quantum_share = (emitter.source_rect.w * emitter.source_rect.h / totalSurfaceArea);
        }
    }

    setTemperature(temp) {

        // try to keep the number of active quanta in the universe proportional to the temperature
        this.temp = temp;

    }

    getDefaultTickFunction() {
        return function () {
            let return_quanta = [];
            let active_quanta = this.context.universe.activeQuanta;
            let remainingBurst = Math.floor((this.temp - active_quanta) * this.burst_to_temp_ratio);
            let total_burst_size = remainingBurst;

            // Iterate over each quantum gun and call its default tick function
            for (let i = 0; i < this.quantum_emitters.length; i++) {
                let gun = this.quantum_emitters[i];
                let new_burst_size = Math.floor(gun.quantum_share * total_burst_size);
                if (gun.auto_fire && gun.remaining_delay <= 0) {
                    if (remainingBurst <= 0) {
                        return return_quanta;
                    }
                    remainingBurst -= new_burst_size;
                    let source_rect = gun.source_rect;
                    return_quanta = return_quanta.concat(gun.fire(source_rect, new_burst_size));
                    gun.remaining_delay = gun.delay;

                } else {
                    if (gun.remaining_delay > 0) {
                        gun.remaining_delay--;
                    } else {
                        gun.remaining_delay = 0;
                    }

                }

            }
            return return_quanta;
        }.bind(this);
    }

}






/**
 * A PointSource is a convenience object for emitting quanta in every direction around a single quantum. 
 */
class PointSource {
    constructor(context, color, x, y, diameter, vx, wavelength, charge, wrap = true, auto_fire = false, canvas_rect = null, delay = 0, quantum_limit = Infinity, angle_increment = 5, frameDimension = 1, emergentPhysics = false) {
        this.context = context;
        this.color = color;
        this.rect = new Rectangle(x, y, diameter, diameter, null, false);
        this.x = this.rect.x;
        this.y = this.rect.y;

        this.vx = vx;

        this.wavelength = wavelength;
        this.charge = charge;

        this.wrap = wrap;
        this.w = diameter;
        this.h = diameter;
        this.auto_fire = auto_fire;
        this.canvas_rect = canvas_rect;
        this.delay = delay;
        this.remaining_delay = delay;
        this.quantum_limit = quantum_limit;
        this.source_rect = new Rectangle(this.x, this.y, this.w, this.h, null, true);
        this.source_rects = [this.source_rect];
        this.angle_increment = angle_increment;
        this.frameDimension = frameDimension;
        this.emergentPhysics = emergentPhysics;

        this.angle = 0;
    }

    fire(minRadius = null) {
        let quanta = [];
        let from_x, from_y;

        if (!minRadius) minRadius = this.w / 2;


        let maxRadius = Math.max(minRadius, this.w / 2);

        if (this.quantum_limit != Infinity) {
            if (this.quantum_limit <= 0) {
                return quanta;
            }
        }


        for (let r = maxRadius; r >= minRadius; r -= 2) {
            let numQuanta = 360 / this.angle_increment; // Calculate the number of quanta based on 360 degrees 
            let vx = 0, vy = 0;
            for (let i = 0; i < numQuanta; i++) {
                let angle = radians(i * this.angle_increment); // Adjust the angle calculation to take into account the angle_increment
                from_x = this.rect.x + r * cos(angle);
                from_y = this.rect.y + r * sin(angle);
                if (!this.emergentPhysics) {
                    vx = from_x - this.rect.x;
                    vy = from_y - this.rect.y;
                }
                let new_quantum = Frame.makeLeafFrame(from_x, from_y, this.frameDimension, this.wavelength, vx, vy, false, this.charge, this.canvas_rect, this.color, this.emergentPhysics);
                quanta.push(new_quantum);
                this.quantum_limit -= 1;
            }
        }
        return quanta;
    }


    getDefaultTickFunction(minRadius = null) {
        //return the fire function bound to this object with parameter minRadius
        return function () {
            let return_quanta = [];

            return_quanta = return_quanta.concat(this.fire(minRadius));
            return return_quanta;
        }.bind(this);
    }
}



/**
 * A Laser shoots frames of particlular color and dimensions into the simulation. It is a frame emitter. Colors are: black, red, green, blue, white
 */
class Laser {
    constructor(context, colorName, x, y, height, vx, vy, dimension, auto_fire = false, canvas_rect = null, random_direction = false, quantum_limit = Infinity) {
        this.context = context;
        this.controller = null
        this.quantum_limit = quantum_limit;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.random_direction = random_direction;
        this.colorName = colorName;
        this.dimension = dimension;
        this.auto_fire = auto_fire;
        this.canvas_rect = canvas_rect;

        this.delay = dimension.mb_w;
        this.remaining_delay = this.delay;

    }

    fire() {
        if (this.remaining_delay > 0) {
            this.remaining_delay--;
            return;
        }
        //clone the template frame and set the position to the x,y of the laser
        let mb_rect = new Rectangle(this.x, this.y, this.dimension.mb_w, this.dimension.mb_h, null, false);

        let colorMass = this.dimension.getMassForColor(this.colorName);
        let mbCapacity = this.dimension.mb_w * this.dimension.mb_h;
        let mbFillRate = colorMass / mbCapacity;
        //the frame is a square with side mb_w. The colorMass is how many quanta can fit in the frame. We want to fill the frame to the colorMass so we loop from the top left to the bottom right of the frame and add quanta until we reach the colorMass
        let quanta = [];
        let left = mb_rect.left;
        let top = mb_rect.top;
        let right = mb_rect.right;
        let bottom = mb_rect.bottom;
        let quantum_count = 0;
        // randomly pick a charge
        let charge = Math.random() < 0.5 ? Charge.POSITIVE : Charge.NEGATIVE;

        for (let i = left; i < right; i++) {
            for (let j = top; j <= bottom; j++) {
                if (quantum_count < colorMass) {

                    //let x be a random number between left and right
                    //let y be a random number between top and bottom
                    let x = Math.floor(Math.random() * (right - left) + left);
                    let y = Math.floor(Math.random() * (bottom - top) + top);

                    let new_quantum = Frame.makeLeafFrame(x, y, this.dimension.layer - 1, 4, this.vx, this.vy, false, charge, this.canvas_rect, 255)

                    quanta.push(new_quantum);
                    quantum_count++;
                }
            }
        }
        let templatemb = this.dimension.createFrameFromRect(mb_rect, quanta, this.vx, this.vy, true);

        this.remaining_delay = this.delay;
        return templatemb;
    }
}
/**
 * AtomDropper is a convenience object for introducing a new atom into the simulation. It is an atom emitter. The atom dropper
 * effectively places quanta into a grid and then creates concentric frames around the quanta. Dimensions have frames of size
 * Math.pow(2, dimension). We will use three di
 */
class AtomDropper {
    constructor(context = null) {

        //add the quantum dimension

        this.universe = context.universe;
        let subatomic_dimension_number = 3;
        let atom_dimension_num = 6;
        this.subatomic_dimension = this.universe.addDimension(subatomic_dimension_number);
        this.atomic_dimension = this.universe.addDimension(atom_dimension_num);
        this.quantum_dimension_number = this.subatomic_dimension.layer - 2; //these are the quanta for the subatomic particles. Allow upto 16 quarks per subatomic particle
        this.quantum_dimension = new Dimension(0, this.quantum_dimension_number, this.universe, true);
        this.canvas_rect = context.canvas_rect;
        this.drop(this.canvas_rect.x, this.canvas_rect.y, 0, 0);
    }

    drop(center_x, center_y, try_random_element_formation = false) {
        //Create a rectangle that is the size of the nucleus layer and centered on the center_x, center_y. Then create quanta at each quantum in the rectangle.
        //each quantum will have velocity 0. The dimensions should then create the concentric frames around the nucleus.
        let protonQuanta = [];
        let subatomic_particle_width = this.subatomic_dimension.mb_w;
        let proton_rect = new Rectangle(center_x, center_y, subatomic_particle_width * 4, subatomic_particle_width * 4, null, true);
        let protonWidth = proton_rect.w;
        let protonHeight = proton_rect.h;
        let protonLeft = proton_rect.left;
        let protonRight = proton_rect.right;
        let protonTop = proton_rect.top;
        let protonBottom = proton_rect.bottom;

        //it's important that the proton is nearly full of quark quanta, otherwise the atom will not be stable because the electron will decay into the nucleus
        for (let x = protonLeft; x < protonLeft + protonWidth; x++) {
            for (let y = protonTop; y < protonTop + protonHeight; y++) {
                let proton_quark = Frame.makeLeafFrame(x, y, 0, this.quantum_dimension_number, 0, 0, false, Charge.POSITIVE, this.canvas_rect, 255);
                protonQuanta.push(proton_quark);
            }
        }
        let proton = this.subatomic_dimension.createFrameFromRect(proton_rect, protonQuanta, 0, 0);

        let electronQuanta = []; //we'll only make a single electron for now ... this is a hydrogen atom

        //Are we trying to see some element creation? We'll put some "sub atomic particles" randomly around a square at a random spot along that side. 
        let num_electrons_along_each_edge = (try_random_element_formation) ? this.atomic_dimension.mb_w : 0;
        let valence_rect = null;
        for (let i = 0; i < 4; i++) {
            protonQuanta = [];
            for (let j = 0; j < num_electrons_along_each_edge; j++) {
                let x, y;
                if (i === 0) { // top edge
                    x = protonLeft + j;
                    y = protonTop - 1;
                    //valence_rect is the rectangle above the top edge
                    valence_rect = new Rectangle(protonLeft, protonTop - protonHeight, protonWidth, protonHeight, null, false);
                } else if (i === 1) { // right edge
                    x = protonRight + 1;
                    y = protonTop + j
                    //valence_rect is the rectangle to the right of the right edge
                    valence_rect = new Rectangle(protonLeft + protonWidth, protonTop, protonWidth, protonHeight, null, false);
                } else if (i === 2) { // bottom edge
                    x = protonLeft + j;
                    y = protonBottom + 1;
                    //valence_rect is the rectangle below the bottom edge
                    valence_rect = new Rectangle(protonLeft, protonTop + protonHeight, protonWidth, protonHeight, null, false);
                } else if (i === 3) { // left edge
                    x = protonLeft - 1;
                    y = protonTop + j;
                    //valence_rect is the rectangle to the left of the left edge
                    valence_rect = new Rectangle(protonLeft - protonWidth, protonTop, protonWidth, protonHeight, null, false);
                }
                let new_quantum = Frame.makeLeafFrame(x, y, 0, 1, 0, 0, false, Charge.NEGATIVE, this.canvas_rect, 255);
                let valence_rect_contains = valence_rect.contains(new_quantum.rect);
                protonQuanta.push(new_quantum);
            }
            //randomly assign vx and vy to be 1,0,-1
            let vx = Math.floor(Math.random() * 3) - 1;
            let vy = Math.floor(Math.random() * 3) - 1;
            let valence_shell = this.subatomic_dimension.createFrameFromRect(valence_rect, protonQuanta, vx, vy);
        }

        //the atom's rect is 4 times the size of the nucleus rect, both are centered on the same quantum
        let atom_rect = new Rectangle(center_x, center_y, this.atomic_dimension.mb_w, this.atomic_dimension.mb_h, null, true);
        let em_points = this.subatomic_dimension.frames;
        let atom_stays_centered_on_screen = true;
        let atom = this.atomic_dimension.createFrameFromRect(atom_rect, em_points, 0, 0, true, atom_stays_centered_on_screen);


        this.universe.leafQuantaWidth = this.quantum_dimension.mb_w;
        this.universe.brownianMotion = true;
        //this.subatomic_dimension.showFrameOutlinesOnly = true;
        //this.atomic_dimension.showFrameOutlinesOnly = true;
        return [];
    }
}




/* EXperimental code for capturing snap shots*/

if (typeof window !== 'undefined') {
    window.CollisionTypes = CollisionTypes;
    window.CollisionActions = CollisionActions;
    window.LargeObject = LargeObject;
    window.QuantumEmitter = QuantumEmitter;
    window.SlitLightSource = SlitLightSource;
    window.DetectorWall = DetectorWall;
    window.SlitScreen = SlitScreen;
    window.EgptFractal = EgptFractal;
    window.Box = Box;
    window.BouncyBox = BouncyBox;
    window.OvenBox = OvenBox;
    window.PointSource = PointSource;
    window.Laser = Laser;
    window.AtomDropper = AtomDropper;
}
if (typeof module !== 'undefined') {
    // Set globals for modules that expect browser-style globals (e.g. setupBlackbody)
    global.CollisionTypes = CollisionTypes;
    global.CollisionActions = CollisionActions;
    module.exports = {
        CollisionTypes,
        CollisionActions,
        LargeObject,
        QuantumEmitter,
        SlitLightSource,
        DetectorWall,
        SlitScreen,
        EgptFractal,
        Box,
        BouncyBox,
        OvenBox,
        PointSource,
        Laser,
        AtomDropper
    };
}

