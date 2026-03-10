/* Copyright 2023-2025 by Essam Abadir */

let DEBUG_QUADTREE = false;
let DEBUG_MACROBLOCK = true;

function debugLog(t, ...e) {
    (DEBUG_QUADTREE && "quadtree" === t || DEBUG_MACROBLOCK && "frame" === t) && console.log(...e);
}

class CapacityError extends Error {
    constructor(t, e) {
        super(t);
        this.name = "CapacityError";
        this.uninserted_object = e;
    }
}

class Rectangle {
    constructor(t, e, s, i, h = null, r = true) {
        this.is_centered = r;
        this.data = h;
        if (r) {
            this._x = t;
            this._y = e;
            this.w = s;
            this.h = i;
            this._left = t - s / 2;
            this.right = t + s / 2;
            this._top = e - i / 2;
            this.bottom = e + i / 2;
            this.r = s / 2;
        } else {
            this._x = t + s / 2;
            this._y = e + i / 2;
            this.w = s;
            this.h = i;
            this._left = t;
            this.right = t + s;
            this._top = e;
            this.bottom = e + i;
            this.r = s / 2;
        }
    }

    set x(t) {
        this._x = t;
        this.left = t - this.w / 2;
        this.right = t + this.w / 2;
    }
    get x() {
        return this._x;
    }

    set y(t) {
        this._y = t;
        this.top = t - this.h / 2;
        this.bottom = t + this.h / 2;
    }
    get y() {
        return this._y;
    }

    set left(t) {
        this._left = t;
        this._x = t + this.w / 2;
        this._right = t + this.w;
    }
    get left() {
        return this._left;
    }

    set top(t) {
        this._top = t;
        this._y = t + this.h / 2;
        this._bottom = t + this.h;
    }
    get top() {
        return this._top;
    }

    get area() {
        return this.w * this.h;
    }

    contains(t) {
      return (this.left <= t.left && this.right >= t.right &&
              this.top <= t.top && this.bottom >= t.bottom);
    }

    intersects(t) {
      return (this.left <= t.right && this.right >= t.left &&
              this.top <= t.bottom && this.bottom >= t.top);
    }

    overlaps(t) {
        if (!this.intersects(t)) return null;
        let e = Math.max(this.left, t.left);
        let s = Math.min(this.right, t.right);
        let i = Math.max(this.top, t.top);
        let h = Math.min(this.bottom, t.bottom);
        return new Rectangle(e, i, s - e, h - i, null, false);
    }

    quadDivide(t) {
        const e = Math.floor(this.left + this.w / 2);
        const s = Math.floor(this.top + this.w / 2);
        let i = null;
        switch (t) {
            case "nw":
                i = new Rectangle(this.left, this.top, e - this.left + 1, s - this.top + 1, null, false);
                break;
            case "ne":
                i = new Rectangle(e + 1, this.top, this.left + this.w - (e + 1), s - this.top + 1, null, false);
                break;
            case "sw":
                i = new Rectangle(this.left, s + 1, e - this.left + 1, this.top + this.h - (s + 1), null, false);
                break;
            case "se":
                i = new Rectangle(e + 1, s + 1, this.left + this.w - (e + 1), this.top + this.h - (s + 1), null, false);
                break;
            default:
                throw new Error("Invalid quadrant. Use 'ne', 'nw', 'se', or 'sw'.");
        }
        return i;
    }

    xDistanceFrom(t) {
        return this.left <= t.rect.x && t.rect.x <= this.right ?
            0 :
            Math.min(Math.abs(t.rect.x - this.left), Math.abs(t.rect.x - this.right));
    }

    yDistanceFrom(t) {
        return this.top <= t.rect.y && t.rect.y <= this.bottom ?
            0 :
            Math.min(Math.abs(t.rect.y - this.top), Math.abs(t.rect.y - this.bottom));
    }

    sqDistanceFrom(t) {
        const e = this.xDistanceFrom(t);
        const s = this.yDistanceFrom(t);
        return e * e + s * s;
    }

    distanceFrom(t) {
        return Math.sqrt(this.sqDistanceFrom(t));
    }

    display() {
        rect(this.x, this.y, this.w, this.h);
    }

    toString() {
        return `Rectangle(x: ${this._x}, y: ${this._y}, w: ${this.w}, h: ${this.h}, left: ${this._left}, right: ${this.right}, top: ${this._top}, bottom: ${this.bottom}, is_centered: ${this.is_centered})`;
    }

    eject(t, e, s = false) {
        if (!this.overlaps(t)) return;

        let i = t.left;
        let h = t.top;

        switch (e) {
            case "top":
                h = this.top - t.h - 1;
                break;
            case "bottom":
                h = this.bottom + 1;
                break;
            case "left":
                i = this.left - t.w - 1;
                break;
            case "right":
                i = this.right + 1;
                break;
            default:
                let e = Math.abs(this.left - t.left);
                let r = Math.abs(this.right - t.left);
                let n = Math.abs(this.top - t.top);
                let a = Math.abs(this.bottom - t.top);
                let o = Math.min(e, r, n, a);
                if (o === e) {
                    i = s ? this.left + 1 : this.left - t.w - 1;
                } else if (o === r) {
                    i = s ? this.right - t.w - 1 : this.right + 1;
                } else {
                    h = o === n ? s ? this.top + 1 : this.top - t.h - 1 : s ? this.bottom - t.h - 1 : this.bottom + 1;
                }
        }
        t.top = h;
        t.left = i;
    }
}

class Circle {
    constructor(t, e, s) {
        this.x = t;
        this.y = e;
        this.r = s;
        this.rSquared = this.r * this.r;
    }

    contains(t) {
        let e = t.x;
        let s = t.y;
        if (!e) {
            e = t.rect.x;
            s = t.rect.y;
        }
        return Math.pow(e - this.x, 2) + Math.pow(s - this.y, 2) <= this.rSquared;
    }

    intersects(t) {
        let e = Math.abs(t.x - this.x);
        let s = Math.abs(t.y - this.y);
        let i = this.r;
        let h = t.w / 2;
        let r = t.h / 2;
        let n = Math.pow(e - h, 2) + Math.pow(s - r, 2);
        return !(e > i + h || s > i + r) && (e <= h || s <= r || n <= this.rSquared);
    }
}

class QuadTree {
    DEFAULT_CAPACITY = 1;
    MIN_SQUARE_WIDTH = 2;
    MAX_DEPTH = 8;
    static DEFAULT_CAPACITY = 1;
    static MIN_SQUARE_WIDTH = 2;
    static MAX_DEPTH = 8;

    constructor(t, e = QuadTree.DEFAULT_CAPACITY, s = 0, i = null, h = QuadTree.MIN_SQUARE_WIDTH) {
        if (!t) throw TypeError("rect is null or undefined");
        if (!(t instanceof Rectangle)) throw TypeError("rect should be a Rectangle");
        if ("number" != typeof e) throw TypeError("capacity should be a number but is a " + typeof e);
        if (e < 1) throw RangeError("capacity must be greater than 0");
        this.rect = t;
        this.capacity = e;
        this.quanta = [];
        this.divided = false;
        this.depth = s;
        this.mass = 0;
        this.center_of_mass = {
            x: 0,
            y: 0
        };
        this.parent = null;
        this.minSquareWidth = h;
    }

    get density() {
        return this.mass / this.rect.area;
    }

    updateMassAndCenterOfMass(t, e) {
        this.mass += e;
        this.center_of_mass = {
            x: (this.center_of_mass.x * (this.mass - e) + t.rect.x * e) / this.mass,
            y: (this.center_of_mass.y * (this.mass - e) + t.rect.y * e) / this.mass,
        };
    }

    closest(t, e = 1, s = 1 / 0) {
        if (void 0 === t) throw TypeError("Method 'closest' needs a quantum");
        const i = s ** 2;
        return this.kNearest(t, e, i, 0, 0).found;
    }

    get children() {
        return this.divided ? [this.northeast, this.northwest, this.southeast, this.southwest] : [];
    }

    canSubdivide() {
        return this.rect.w > this.minSquareWidth && this.rect.h > this.minSquareWidth;
    }

    clear() {
        this.quanta = [];
        if (this.divided) {
            this.divided = false;
            delete this.northwest;
            delete this.northeast;
            delete this.southwest;
            delete this.southeast;
        }
    }

    static create(rectOrX, capacityOrY, widthOrCapacity, heightOrMinSquareWidth, minSquareWidth) {
        let rect, capacity, minW;
        if (rectOrX instanceof Rectangle) {
            rect = rectOrX;
            capacity = (typeof capacityOrY === "number" && capacityOrY >= 1) ? capacityOrY : QuadTree.DEFAULT_CAPACITY;
            minW = (typeof widthOrCapacity === "number" && widthOrCapacity >= 1) ? widthOrCapacity : QuadTree.MIN_SQUARE_WIDTH;
            if (typeof heightOrMinSquareWidth === "number" && heightOrMinSquareWidth >= 1) {
                minW = heightOrMinSquareWidth;
            }
        } else if (
            typeof rectOrX === "number" &&
            typeof capacityOrY === "number" &&
            typeof widthOrCapacity === "number" &&
            typeof heightOrMinSquareWidth === "number"
        ) {
            rect = new Rectangle(rectOrX, capacityOrY, widthOrCapacity, heightOrMinSquareWidth);
            capacity = minSquareWidth || QuadTree.DEFAULT_CAPACITY;
            minW = QuadTree.MIN_SQUARE_WIDTH;
        } else if (typeof width !== "undefined" && typeof height !== "undefined") {
            rect = new Rectangle(width / 2, height / 2, width, height);
            capacity = QuadTree.DEFAULT_CAPACITY;
            minW = QuadTree.MIN_SQUARE_WIDTH;
        } else {
            throw new TypeError("QuadTree.create requires (Rectangle, capacity?, minSquareWidth?) or (x, y, w, h)");
        }
        return new QuadTree(rect, capacity, 0, null, minW);
    }

    _setCollisionPair(t, existing) {
        t.other = existing;
        existing.other = t;
    }

    insert(t) {
        if (!this.rect.contains(t.rect)) return false;

        this.updateMassAndCenterOfMass(t, 1);
        if (!this.divided) {
            if (this.quanta.length < this.capacity) {
                return this.quanta.push(t), true;
            }
            if (this.depth === this.MAX_DEPTH || !this.canSubdivide()) {
                const existing = (this.quanta && this.quanta.length > 0)
                    ? (this.quanta.find((q) => q.rect && q.rect.intersects && q.rect.intersects(t.rect)) || this.quanta[0])
                    : null;
                if (existing) this._setCollisionPair(t, existing);
                return this.updateMassAndCenterOfMass(t, -1), false;
            }
            if (!this.subdivide()) {
                const existing = (this.quanta && this.quanta.length > 0)
                    ? (this.quanta.find((q) => q.rect && q.rect.intersects && q.rect.intersects(t.rect)) || this.quanta[0])
                    : null;
                if (existing) this._setCollisionPair(t, existing);
                return this.updateMassAndCenterOfMass(t, -1), false;
            }
        }
        const inserted =
            this.northeast.insert(t) ||
            this.northwest.insert(t) ||
            this.southeast.insert(t) ||
            this.southwest.insert(t);
        if (!inserted) {
            this.updateMassAndCenterOfMass(t, -1);
        }
        return inserted;
    }

    insertAll(t) {
        let e = [];
        for (const s of t) this.insert(s) || e.push(s);
        return e;
    }

    remove(t) {
        if (!this.rect.contains(t.rect)) return this.updateMassAndCenterOfMass(t, -1), false;

        if (this.updateMassAndCenterOfMass(t, -1), !this.divided) {
            const e = this.quanta.indexOf(t);
            return -1 !== e && (this.quanta.splice(e, 1), true);
        }
        return (
            this.northeast.remove(t) ||
            this.northwest.remove(t) ||
            this.southeast.remove(t) ||
            this.southwest.remove(t)
        );
    }

    removeAll(t) {
        for (const e of t) this.remove(e);
    }

    subdivide() {
        this.northwest = new QuadTree(this.rect.quadDivide("nw"), this.capacity, this.depth + 1, this, this.minSquareWidth);
        this.southwest = new QuadTree(this.rect.quadDivide("sw"), this.capacity, this.depth + 1, this, this.minSquareWidth);
        this.northeast = new QuadTree(this.rect.quadDivide("ne"), this.capacity, this.depth + 1, this, this.minSquareWidth);
        this.southeast = new QuadTree(this.rect.quadDivide("se"), this.capacity, this.depth + 1, this, this.minSquareWidth);
        this.divided = true;
        for (const t of this.quanta) {
            if (!(
                this.northwest.insert(t) ||
                this.northeast.insert(t) ||
                this.southwest.insert(t) ||
                this.southeast.insert(t)
            ))
                return false;
        }
        this.quanta = null;
    }

    query(t, e, s = false) {
        if (e || (e = []), !t.intersects(this.rect)) return e;
        if (this.divided)
            return (
                this.northwest.query(t, e, s),
                this.northeast.query(t, e, s),
                this.southwest.query(t, e, s),
                this.southeast.query(t, e, s),
                e
            );
        for (const i of this.quanta) {
            (s ? t.intersects(i.rect) : t.contains(i.rect)) && e.push(i);
        }
        return e;
    }

    queryAll() {
        let t = [];
        return this.divided ?
            ((t = t.concat(this.northwest.queryAll())),
                (t = t.concat(this.northeast.queryAll())),
                (t = t.concat(this.southwest.queryAll())),
                (t = t.concat(this.southeast.queryAll()))) :
            (t = t.concat(this.quanta)),
            t;
    }

    findRegions(t, e, s = false, i = false) {
        let h = [];
        let r = [this];
        for (; r.length > 0;) {
            let s = r.shift();
            s.rect.w <= t.w && s.rect.h <= t.h && s.mass >= e ?
                h.push(s) :
                s.divided ?
                    (r.push(s.northeast), r.push(s.northwest), r.push(s.southeast), r.push(s.southwest)) :
                    s.mass >= e && h.push(s);
        }
        return h.map((e => {
            let h = new Rectangle(e.center_of_mass.x, e.center_of_mass.y, t.w, t.h, null, true),
                r = this.query(h, null, i);
            return s && this.deleteInRange(h), {
                rect: h,
                quanta: r
            };
        }));
    }

    merge(t, e) {
        let s = Math.min(this.rect.left, t.rect.left);
        let i = Math.max(this.rect.right, t.rect.right);
        let h = Math.min(this.rect.top, t.rect.top);
        let r = Math.max(this.rect.bottom, t.rect.bottom) - h;
        let n = i - s;
        let a = new Rectangle(s + n / 2, h + r / 2, n, r);
        let o = new QuadTree(a, e);
        return this.forEach((t => o.insert(t))), t.forEach((t => o.insert(t))), o;
    }

    get length() {
        return this.divided ?
            this.northwest.length + this.northeast.length + this.southwest.length + this.southeast.length :
            this.quanta.length;
    }

    deleteInRange(t) {
        this.divided &&
            (this.northwest.deleteInRange(t),
                this.northeast.deleteInRange(t),
                this.southwest.deleteInRange(t),
                this.southeast.deleteInRange(t));
        this.quanta &&
            this.quanta.length > 0 &&
            (this.quanta = this.quanta.filter((e => !t.contains(e.rect))));
    }

    kNearest(t, e, s, i, h) {
        let r = [];
        if (this.divided) {
            this.children
                .sort(((e, s) => e.rect.sqDistanceFrom(t) - s.rect.sqDistanceFrom(t)))
                .forEach((n => {
                    const a = n.rect.sqDistanceFrom(t);
                    if (!(a > s) && (h < e || a < i)) {
                        const a = n.kNearest(t, e, s, i, h),
                            o = a.found;
                        (r = r.concat(o)), (h += o.length), (i = a.furthestSqDistance);
                    }
                }));
        } else {
            this.quanta
                .sort(((e, s) => e.sqDistanceFrom(t) - s.sqDistanceFrom(t)))
                .forEach((n => {
                    const a = n.sqDistanceFrom(t);
                    a > s ||
                        ((h < e || a < i) && (r.push(n), (i = Math.max(a, i)), h++));
                }));
        }
        return {
            found: r.sort(((e, s) => e.sqDistanceFrom(t) - s.sqDistanceFrom(t))).slice(0, e),
            furthestSqDistance: Math.sqrt(i),
        };
    }

    forEach(t) {
        this.divided ?
            (this.northeast.forEach(t),
                this.northwest.forEach(t),
                this.southeast.forEach(t),
                this.southwest.forEach(t)) :
            this.quanta.forEach(t);
    }

    filter(t) {
        let e = new QuadTree(this.rect, this.capacity);
        return this.forEach((s => {
            t(s) && e.insert(s);
        })), e;
    }

    toJSON(t = 0, e = "root") {
        let s = {};
        return (
            console.log("QTREE level: " + t + ", quadrant: " + e),
            this.divided ?
                (((this.northeast.divided || this.northeast.quanta.length > 0) &&
                    (s.ne = this.northeast.toJSON())),
                    ((this.northwest.divided || this.northwest.quanta.length > 0) &&
                        (s.nw = this.northwest.toJSON())),
                    ((this.southeast.divided || this.southeast.quanta.length > 0) &&
                        (s.se = this.southeast.toJSON())),
                    ((this.southwest.divided || this.southwest.quanta.length > 0) &&
                        (s.sw = this.southwest.toJSON()))) :
                ((s.quanta = this.quanta),
                    0 === this.depth &&
                    ((s.capacity = this.capacity),
                        (s.rect.x = this.rect.x),
                        (s.rect.y = this.rect.y),
                        (s.rect.w = this.rect.w),
                        (s.rect.h = this.rect.h))),
            s
        );
    }

    static fromJSON(t, e, s, i, h, r, n) {
        if (void 0 === e) {
            if (!("x" in t)) throw TypeError("JSON missing rect information");
            (e = t.rect.x),
                (s = t.rect.y),
                (i = t.rect.w),
                (h = t.rect.h),
                (r = t.capacity),
                (n = 0);
        }
        let a = new QuadTree(new Rectangle(e, s, i, h), r, n);
        if (
            ((a.quanta = t.quanta ?? null),
                (a.divided = null === a.quanta),
                "ne" in t || "nw" in t || "se" in t || "sw" in t)
        ) {
            const e = a.rect.x,
                s = a.rect.y,
                i = a.rect.w / 2,
                h = a.rect.h / 2;
            (a.northeast =
                "ne" in t ?
                    QuadTree.fromJSON(t.ne, e + i / 2, s - h / 2, i, h, r, n + 1) :
                    new QuadTree(a.rect.quadDivide("ne"), r, n + 1)),
                (a.northwest =
                    "nw" in t ?
                        QuadTree.fromJSON(t.nw, e - i / 2, s - h / 2, i, h, r, n + 1) :
                        new QuadTree(a.rect.quadDivide("nw"), r, n + 1)),
                (a.southeast =
                    "se" in t ?
                        QuadTree.fromJSON(t.se, e + i / 2, s + h / 2, i, h, r, n + 1) :
                        new QuadTree(a.rect.quadDivide("se"), r, n + 1)),
                (a.southwest =
                    "sw" in t ?
                        QuadTree.fromJSON(t.sw, e - i / 2, s + h / 2, i, h, r, n + 1) :
                        new QuadTree(a.rect.quadDivide("sw"), r, n + 1));
        }
        return a;
    }
}

if (typeof window !== 'undefined') {
    window.Rectangle = Rectangle;
    window.Circle = Circle;
    window.QuadTree = QuadTree;
    window.CapacityError = CapacityError;
}
"undefined" != typeof module &&
    (module.exports = {
        Rectangle: Rectangle,
        Circle: Circle,
        QuadTree: QuadTree,
        CapacityError: CapacityError,
    });