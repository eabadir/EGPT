# Collision System Design Document

This document describes the collision rules and frame generation modes in the EGPT/FRAQTL engine (devsdk), with references to the codebase. It covers the two mutually exclusive frame generation models, Frame-Frame collisions, Frame-LargeObject collisions, and the merge/promotion logic that determines outcomes.

**Core axioms**: TIME = 1 tick (discrete). SPACE = 1 pixel (discrete). MASS = pixel occupancy (leaf count). Universal speed limit: 1 pixel/tick. Wavelength = floor(capacity/mass * WAVELENGTH_CONSTANT), minimum 4. Conservation laws emerge from the rules.

**Note on devsdk**: The educational edition allows overlap and fractional positions for visualization purposes (unlike egpt_core which enforces strict integer grid with single occupancy).

---

## 1. Dimension Paradigm: SortableDictionary + addDimension

### 1.1 Overview

Dimensions are SCALE layers (not spatial dimensions). They are stored in a **SortableDictionary** keyed by layer number, supporting non-consecutive layers (e.g. `{0, 3, 8}`).

Dimensions can be created by:
- **Explicit registration**: The developer calls `addDimension(N)` before the simulation starts.
- **Auto-spawn (emergentPhysics=true)**: The engine creates the next layer on demand during Phase B (density clustering) or via `handleStructurePromotion` when colliding frames need a parent.
- **Ground-up promotion (emergentPhysics=false)**: `handleStructurePromotion` uses the next *registered* dimension. If none exists, promotion is skipped.

### 1.2 SortableDictionary

| Method | Description |
|--------|-------------|
| `push(key, value)` | Add dimension: `dimensions.push(layer, dimension)` |
| `get(key)` | Lookup by layer: `dimensions.get(0)` |
| `getNext(currentKey)` | Next higher dimension in sorted order (e.g. `getNext(0)` returns dim 3 when layers are `{0, 3, 8}`) |
| `getNextKey(currentKey)` | Next layer number |
| `remove(key)` | Remove dimension by layer |
| `keys()` | Array of layer numbers |
| `highestKey` | Highest layer number |
| `length` | Number of dimensions |

Entries are kept sorted by key (layer number), so `getNext(layer)` returns the smallest dimension with layer > current.

### 1.3 addDimension

```javascript
addDimension(dimension_number) {
  let dimension = this.dimensions.get(dimension_number);
  if (dimension) return dimension;
  dimension = new Dimension(this.tick, dimension_number, this, ...);
  this.dimensions.push(dimension_number, dimension);
  return dimension;
}
```

Returns existing dimension if layer already exists. Otherwise creates and stores via `push(layer, dimension)`.

---

## 2. Frame Generation Modes (Mutually Exclusive)

The engine has two mutually exclusive models for building frame hierarchy. The canonical flag is `this.emergentPhysics` (the init() parameter `emergentDimensions` is a backward-compat alias).

### 2.1 TOP-DOWN Mode (emergentPhysics=true)

**How it works**: Phase B runs periodically on iframe ticks. It builds a quadtree from fundamental dimension frames, then each higher dimension absorbs unparented leaves via `addPointsFromQuadTree` (density-based clustering). `buildFramesFromSprites` recursively creates new dimensions and frames from remaining unparented leaves, spawning dimensions as needed.

**Flags set automatically by init()**:
```javascript
this.emergentPhysics = emergentDimensions;
if (this.emergentPhysics) {
    this.brownianMotion = true;
    this.withInterQuantumCollisions = false;  // overridden with warning if was true
    this.withBonding = false;
}
```

**Guard**: If `withInterQuantumCollisions` was already true when `emergentPhysics` is set, the engine logs a warning and forces it to false.

**Phase B gate**: `if (this.emergentPhysics && this.tick % (this.iframe_interval_ticks) === 0)` -- Phase B structure building is entirely skipped when `emergentPhysics=false`.

### 2.2 GROUND-UP Mode (emergentPhysics=false + withInterQuantumCollisions=true)

**How it works**: Phase B is skipped. Frame promotion happens event-driven in Phase C: when two unparented frames at the same layer collide (detected by quadtree insert failure), `handleStructurePromotion` creates a parent frame in the next higher dimension.

**Typical flags**: `emergentPhysics=false`, `withInterQuantumCollisions=true`, `brownianMotion=false` (wave-walk movement).

**Dimension creation**: Uses the next *registered* dimension via `getNextKey(this.layer)`. If no next dimension exists, promotion is skipped (the developer must pre-register dimensions). However, if `emergentPhysics=true` (which would be unusual in this mode given the mutual exclusivity), it would auto-spawn.

### 2.3 Summary Table

| Property | TOP-DOWN | GROUND-UP |
|----------|----------|-----------|
| `emergentPhysics` | `true` | `false` |
| `brownianMotion` | `true` (forced) | `false` (typical) |
| `withInterQuantumCollisions` | `false` (forced) | `true` |
| `withBonding` | `false` (forced) | developer choice |
| Phase B runs? | Yes (on iframe ticks) | No |
| Promotion mechanism | Density clustering (Phase B) | Collision-driven `handleStructurePromotion` (Phase C) |
| Dimension creation | Auto-spawn | Must be pre-registered |

---

## 3. Core Concepts: The "Pure Fractal" Model

### 3.1 Everything is a Frame

There is no separate "Quantum" class or "out of dimension" storage.
- **Leaf Frames (Quanta)**: Frames at the lowest dimension (`is_leaf = true`). Stored in `dimensions.get(lowest_dimension).frames`.
- **Unified Storage**: All objects are Frames stored in Dimensions.

### 3.2 Same-Size Frames Do Not "Add"

When two frames of the same size (same layer) overlap, they **collide** and follow the collision rules. The outcome is determined by the cascade of those rules (merge, bounce, charge, bond, etc.).

### 3.3 Frame Hierarchy & Dimensions

- **Frames**:
  - **Leaf Frames**: Smallest units (`is_leaf = true`, `children.length === 0`).
  - **Recursive frame hierarchy**: Contain child frames; created when frames collide and form parent frames at higher dimensions.
  - **`frame.addPoints` / `frame.insert`**: Only accepts smaller objects; `frame.layer > quantum.layer` is required. Frames cannot take same-size or larger objects.
- **Dimensions**: A Dimension is a scale layer managing its own frames.
  - Dimensions need not be consecutive.
  - The **Fundamental Dimension** is the lowest dimension present in the universe.
  - Only a Dimension of layer N may create frames in layer N.

---

## 4. The Unified Loop (doTick)

### 4.1 Phase A: Injection (Input)

Experiment tick functions return new Frames. These are added to the fundamental dimension via `addFundamentalFrames`.

### 4.2 Phase B: Structure Building (Upward Pass)

**Gated behind**: `this.emergentPhysics && this.tick % (this.iframe_interval_ticks) === 0`

When `emergentPhysics=false`, this entire phase is skipped.

When active:
1. Build `fundamentalDimQtree` from the lowest dimension frames.
2. Each higher dimension absorbs unparented frames via `addPointsFromQuadTree`.
3. `buildFramesFromSprites` recursively creates new dimensions and frames from remaining unparented leaves.

### 4.3 Phase C: Physics Update (per-dimension)

For each dimension (low to high):

**Step C.1**: Optional inter-frame collisions within the lowest dimension.
Only active when `withInterQuantumCollisions=true`. Builds a local quadtree, queries neighbors for each frame, calls `p.checkCollision(neighbors, true, withBonding, tick)`.

**Step C.2**: `dim.update(tick, largeObjects)` -- the core physics step (see Section 5 for details).

**Step C.3**: Re-inject released frames (children that escaped their parent) via `addFundamentalFrames`.

### 4.4 Phase D: Collect Tick Data

Gather `FrameData` from each dimension into a `TickData` object for rendering. No P5/rendering calls here.

---

## 5. Dimension.update() -- Per-Dimension Physics

Called from doTick Phase C for every dimension.

| Step | Name | Description |
|------|------|-------------|
| 1 | REINIT | Recalculate mass/velocity for dirty frames (after merges) |
| 2 | MOVE | Probabilistic 1px step per frame |
| 3 | COMPRESS | Children pulled toward parent center (gravitational pull, skipped for highest dim) |
| 4 | COLLISION DETECTION | `qtree.insertAll(this.frames)` -- frames that fail to insert are returned as `collisionList` with `.other` set to the frame they collided with |
| 5 | COLLISION PROCESSING | Gated behind `withInterQuantumCollisions`. For each pair: 5a) merge, 5b) handleStructurePromotion |
| 6 | LARGE OBJECT COLLISIONS | `lo.collide(qtree, mb_w, collisionList)` for walls/detectors |
| 7 | CLEANUP | Remove dead frames and empty non-leaf frames |

### 5.1 Step 5 Detail: Collision Processing

Gated: `if (this.universe.withInterQuantumCollisions && collisionList.length > 0)`

For each frame in `collisionList` where `frame.other` exists:
1. **5a: Merge** -- `frame.merge(frame.other)` transfers children from smaller to larger.
2. **5b: Event-driven promotion** -- checks `canPromote = emergentPhysics || (nextLayer !== undefined)`. If both frames still overlap after merge, calls `handleStructurePromotion(frame, frame.other)`.

### 5.2 handleStructurePromotion

Called from update() Step 5b when two frames in the same dimension collide and overlap.

**Preconditions** (all must pass):
- `frameA !== frameB`
- Both alive (not killed by merge or LargeObject collision)
- Both unparented (no existing parent frame)

**Next-dimension lookup**:
```javascript
let nextLayer = this.universe.dimensions.getNextKey(this.layer);
if (nextLayer === undefined) {
    if (this.universe.emergentPhysics) {
        nextLayer = this.layer + 1;
        this.universe.addDimension(nextLayer);  // auto-spawn
    } else {
        return;  // no next dim registered, skip
    }
}
let parentDim = this.universe.dimensions.get(nextLayer);
parentDim.createParentFrame(frameA, frameB);
```

Key: uses `getNextKey` (not `layer + 1`) to support non-consecutive dimensions.

---

## 6. Frame-Frame Collisions (Same Layer)

### 6.1 checkCollision Path (Phase C, Step C.1)

**When active**: `withInterQuantumCollisions = true`, lowest dimension only.

**Flow**:
1. Build local quadtree from dimension frames.
2. For each frame `p`, query nearby frames: `localQTree.query(new Circle(p.rect.x, p.rect.y, p.r))`.
3. Call `p.checkCollision(neighbors, withBouncing=true, withBonding, tick)`.

**Collision detection**:
```javascript
let d = dist(this.rect.x, this.rect.y, other.rect.x, other.rect.y);
if (d < other.r / 2 + this.r / 2) { ... }
```

**Effects (in order)**:
1. **Merge** -- `this.merge(other)` transfers overlapping children.
2. **Bounce** -- `this.bounce(other)` separates rects, reverses velocity on overlap axis.
3. **Charge** -- If `!withBonding`: assign `POSITIVE`/`NEGATIVE` charge.
4. **Bond** -- If `withBonding`: `this.bond(other)` adds each to the other's `bound_particles`.

### 6.2 Dimension.update Collision Path (Phase C, Step 4-5)

**Flow**:
1. `qtree.insertAll(this.frames)` returns `collisionList` -- frames that failed to insert due to spatial overlap.
2. QuadTree sets `frame.other = existing` and `existing.other = frame` via `_setCollisionPair`.
3. Step 5 processes each pair: merge then handleStructurePromotion (see Section 5.1).

---

## 7. Frame-LargeObject Collisions

**Entry point**: `Dimension.update` Step 6: `lo.collide(qtree, this.mb_w, collisionList)`.

### 7.1 LargeObject.collide() Signature

```javascript
collide(qtree, mb_search_padding = 1, additionalFrames = [])
```

**Early return**: If `collision_type === CollisionTypes.NONE` and no `ABSORB` action, returns `[]` immediately.

**Flow**:
1. Build padded search rect: `new Rectangle(this.rect.left - mb_search_padding, ...)`.
2. Query quadtree: `qtree.query(search_rect, [], true)` (intersects mode).
3. Include frames from `additionalFrames` (the `collisionList` from Step 4) that intersect the search rect but are not already in the query result. These frames were rejected by the quadtree due to single-occupancy and would otherwise be invisible to spatial queries.
4. For each frame whose `rect.intersects(this.rect)` or has passed the wall:
   - Call `record_collision(quantum_point)`.
   - If ABSORB action: `quantum_point.kill()`.
   - Otherwise: apply CollisionType (velocity changes), then CollisionActions (block, contain, etc.).

### 7.2 CollisionTypes (Velocity Behavior)

| Type | Effect |
|------|--------|
| `NONE` | No velocity change (early return if no ABSORB action) |
| `REFLECT_X` | `quantum_point.vx *= -1` |
| `REFLECT_Y` | `quantum_point.vy *= -1` |
| `REFLECT_XY` | `vx *= -1`, `vy *= -1`; `eject(quantum_point.rect, reposition)` |
| `RANDOM_X` | `vx = random(-1,1)`, `vy = 1` |
| `RANDOM_Y` | `vx = 1`, `vy = random(-1,1)` |
| `RANDOM_XY` | `vx`, `vy` randomized |
| `MOMENTUM_BASED` | `quantum_point.move_undo()` |
| `BOUNCE_UP`, `BOUNCE_DOWN`, `BOUNCE_LEFT`, `BOUNCE_RIGHT` | Directional bounce |

### 7.3 CollisionActions (Outcome)

| Action | Effect |
|--------|--------|
| `ABSORB` / `KILL` | `quantum_point.kill()` |
| `BLOCK` | `this.rect.eject(quantum_point.rect, reposition)` |
| `CONTAIN_Y` | Clamp `quantum_point.rect.top` to LargeObject vertical bounds |
| `RECOLOR` | `quantum_point._pos_color = this.color` |
| `COUNT` | Record hit position in `collision_positions` |
| `MARK` | `quantum_point.data = { detector_name: this.name }` |
| `DETECT` | Force collision check even without spatial overlap |
| `FORCE_RENDER` | Force render of collided quantum |

---

## 8. Leaf Frame (Quantum) vs LargeObject

Leaf frames have no children, so `Frame.collide` returns `[]` and does not release children. LargeObject collision uses `quantum_point.rect.intersects` and applies velocity/position changes directly on the Frame.

---

## 9. Merge Logic

### 9.1 Frame.merge

1. Compute overlap: `overlap = this.rect.overlaps(other.rect)`.
2. Identify `larger` = higher mass, `smaller` = lower mass.
3. `giver = smaller`, `taker = larger` -- smaller gives children to larger.
4. For each child of `giver` in the overlap: if `taker.insert(child)` succeeds, transfer and remove from `giver`.
5. Mark parents dirty if children were transferred.

---

## 10. Bounce Logic

**`bounce(other)`**:
1. If `BROWNIAN_MOTION && this.is_leaf`: use `bounceBrownian(other)` (random direction, reposition to avoid overlap).
2. Else: compute overlap on X and Y; choose axis with smaller overlap.
3. Reposition rect to eliminate overlap on that axis; reverse velocity on that axis; call `reset()`.

**`bounceBrownian(other)`**: Random velocity; reposition to nearest non-overlapping edge.

---

## 11. Summary Table

| Collision Type | Entry Point | Gated By | Effects |
|----------------|-------------|----------|---------|
| Frame-Frame (checkCollision) | Phase C Step C.1 | `withInterQuantumCollisions`, lowest dim only | Merge, bounce, charge/bond |
| Frame-Frame (Dimension.update) | Phase C Step 4-5 | `withInterQuantumCollisions` | QuadTree collision detection, merge, handleStructurePromotion |
| Frame-LargeObject | Phase C Step 6 | Always runs | CollisionTypes (velocity) + CollisionActions (kill, block, contain, etc.) |

---

## 12. Configuration Flags

| Flag | Default | Effect |
|------|---------|--------|
| `emergentPhysics` | `false` | TOP-DOWN mode: density clustering, auto-spawn dims, brownianMotion=true, forces withInterQuantumCollisions=false. Init param name: `emergentDimensions` (backward compat). |
| `withInterQuantumCollisions` | `false` | Enables Frame-Frame collisions and ground-up promotion via handleStructurePromotion. Forced false when emergentPhysics=true. |
| `withBonding` | `false` | When true, `checkCollision` calls `bond()` instead of assigning charge. Forced false when emergentPhysics=true. |
| `brownianMotion` | `false` | `bounce` uses `bounceBrownian` for leaf frames. Forced true when emergentPhysics=true. |
| `iframe_interval_ticks` | derived from fps | Tick interval for Phase B structure building (only relevant when emergentPhysics=true). |
