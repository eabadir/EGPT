/* Copyright 2023-2025 by Essam Abadir */

/**
 * P5Renderer - Standard P5.js consumer for EGPT simulation data.
 * Renders TickData and largeObjects to a P5 canvas.
 * Requires P5.js (fill, rect, ellipse, background, etc.) and chroma for color mapping.
 */
class P5Renderer {
    /**
     * Render simulation data to the P5 canvas.
     * @param {TickData} tickData - Simulation output from universe.doTick()
     * @param {Array} largeObjects - Array of LargeObject instances (have rect, color, visible, alpha)
     */
    static render(tickData, largeObjects) {
        if (typeof background === 'undefined') return;

        background(0);
        fill(255);
        noStroke();
        stroke(255);

        // Render large objects (walls, detectors, etc.)
        if (largeObjects) {
            for (let lo of largeObjects) {
                if (lo.visible !== false) {
                    noStroke();
                    fill(lo.color[0], lo.color[1], lo.color[2], lo.alpha !== undefined ? lo.alpha : 255);
                    if (lo.drawAsCircle) {
                        ellipse(lo.rect.left + lo.rect.w / 2, lo.rect.top + lo.rect.h / 2, lo.rect.w, lo.rect.h);
                    } else {
                        rect(lo.rect.left, lo.rect.top, lo.rect.w, lo.rect.h);
                    }
                }
            }
        }

        // Render frames
        if (tickData && tickData.frameData) {
            for (let fd of tickData.frameData) {
                let rgb;
                if (fd.colorOverride) {
                    rgb = fd.colorOverride;
                } else {
                    let chromaColor = LightColor.getRgbColorFromFullness(fd.fullness);
                    if (chromaColor) {
                        let alpha = 180;
                        if (fd.fullness > 0.75) {
                            alpha += (fd.fullness - 0.75) * 300;
                        }
                        chromaColor = chromaColor.alpha(alpha / 255);
                        rgb = chromaColor._rgb;
                    } else {
                        rgb = [255, 255, 255, 1];
                    }
                }

                noStroke();
                if (!fd.outline) {
                    // Use at least 1px radius so 1x1 fundamental particles remain visible
                    const r1 = Math.max(1, fd.rect.w / 2);
                    const r2 = Math.max(2, fd.rect.w);
                    fill(rgb[0], rgb[1], rgb[2], (rgb[3] || 1) * 255);
                    ellipse(fd.rect.x, fd.rect.y, r1, r1);
                    fill(rgb[0], rgb[1], rgb[2], 25);
                    ellipse(fd.rect.x, fd.rect.y, r2, r2);
                } else {
                    strokeWeight(1);
                    stroke(rgb[0], rgb[1], rgb[2], (rgb[3] || 1) * 255);
                    noFill();
                    rect(fd.rect.left, fd.rect.top, fd.rect.w, fd.rect.h);
                }
            }
        }
    }
}

if (typeof module !== 'undefined') {
    module.exports = { P5Renderer };
}
