/**
 * EGPT CHARTING MODULE
 * Handles all Chart.js visualization logic for EGPT entropy analysis.
 * 
 * PEDAGOGICAL PRINCIPLE: Complete separation of mathematical calculations from visual rendering.
 * This module provides reusable chart widgets that can be embedded in any web page.
 * 
 * @fileoverview Chart.js interface for EGPT entropy visualization widgets
 * @author EGPT Development Team
 * @since 2025-07-31
 */

console.log("🎓 EGPT CHARTING: Chart.js interface for entropy visualization widgets");
console.log("📁 Module location: EGPT/js/model/EGPTCharting.js");
console.log("🎯 Architecture: Reusable chart widgets with container-based deployment");

/**
 * ENTROPY CHART WIDGET CLASS
 * Creates and manages Chart.js instances for entropy visualization.
 * Can be instantiated multiple times with different container elements.
 */
export class EGPTEntropyChart {
    constructor(containerId) {
        this.containerId = containerId;
        this.chartInstance = null;
        this.canvasId = `${containerId}_canvas`;

        // Initialize the container with canvas
        this.initializeContainer();
    }

    /**
     * Initialize the container with a canvas element for Chart.js
     */
    initializeContainer() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`Container element with id '${this.containerId}' not found`);
        }

        // Create canvas element if it doesn't exist
        let canvas = document.getElementById(this.canvasId);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = this.canvasId;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            container.appendChild(canvas);
        }
    }

    /**
     * RENDER ENTROPY UNIFORMITY CHART
     * Main visualization method for entropy deviation patterns with optional factor overlays.
     */
    renderEntropyUniformityChart({
        k,
        D,
        deviation_values_for_chart,
        division_analysis,
        deviations_H,
        use_ordinal_ranking,
        unique_groups_count,
        scale_factor,
        range_magnitude,
        factor_pairs = null // Optional factor pair data for overlay
    }) {
        console.log("🎨 CHART RENDER DEBUG: Starting chart render");
        console.log(`   Container ID: ${this.containerId}`);
        console.log(`   Canvas ID: ${this.canvasId}`);
        console.log(`   Deviation values: ${deviation_values_for_chart?.length || 'undefined'} items`);
        console.log(`   D (segments): ${D}`);

        const canvas = document.getElementById(this.canvasId);
        if (!canvas) {
            console.error(`❌ Canvas element with id '${this.canvasId}' not found`);
            throw new Error(`Canvas element with id '${this.canvasId}' not found`);
        }

        console.log("✅ Canvas element found:", canvas);

        const ctx = canvas.getContext('2d');

        // Destroy the old chart before drawing a new one
        if (this.chartInstance) {
            console.log("🔄 Destroying previous chart instance");
            this.chartInstance.destroy();
        }

        // Prepare datasets
        console.log("🎨 Preparing chart datasets...");
        const datasets = [{
            label: `Scaled Entropy Deviation for k`,
            data: deviation_values_for_chart,
            borderColor: 'rgba(99, 102, 241, 1)',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            fill: false,
            tension: 0.1,
            pointRadius: 2,
            borderWidth: 2,
            yAxisID: 'y'
        }];

        console.log(`🎨 Primary dataset created with ${deviation_values_for_chart?.length || 0} data points`);
        console.log(`🎨 Sample data: [${deviation_values_for_chart?.slice(0, 3).join(', ') || 'none'}]`);

        // Add factor overlay if factor pairs are provided
        if (factor_pairs && factor_pairs.length > 0) {
            // Create factor markers for smaller factors within sqrt(k)
            const factor_data = new Array(Number(D)).fill(null);
            const factor_labels = [];

            factor_pairs.forEach((pair, index) => {
                if (pair.smaller_in_sqrt_range) {
                    // Find which segment contains the smaller factor
                    for (let i = 0; i < division_analysis.length; i++) {
                        const segment = division_analysis[i];
                        if (segment.segment_start <= pair.smaller_factor &&
                            pair.smaller_factor <= segment.segment_end) {

                            factor_data[i] = Math.max(...deviation_values_for_chart) * 1.1; // Place above highest point
                            factor_labels.push(`Factor: ${pair.smaller_factor}`);
                            break;
                        }
                    }
                }
            });

            datasets.push({
                label: 'Discovered Factors',
                data: factor_data,
                borderColor: 'rgba(231, 76, 60, 1)',
                backgroundColor: 'rgba(231, 76, 60, 0.8)',
                pointRadius: 8,
                pointStyle: 'triangle',
                showLine: false,
                yAxisID: 'y'
            });
        }

        console.log("🎨 Creating Chart.js instance...");
        console.log(`   Chart type: line`);
        console.log(`   Labels: ${Array.from({ length: Number(D) }, (_, i) => i).length} indices`);
        console.log(`   Datasets: ${datasets.length} total`);
        console.log(`   Primary dataset points: ${datasets[0]?.data?.length || 0}`);

        try {
            this.chartInstance = new Chart(ctx,
                {
                    type: 'line',
                    data: {
                        labels: Array.from({ length: Number(D) }, (_, i) => i),
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        },
                        scales: {
                            y: {
                                type: 'linear',
                                title: {
                                    display: true,
                                    text: 'Scaled Absolute Deviation from Average Entropy'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Subdivision Index'
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: use_ordinal_ranking ?
                                    `Entropy Uniformity Pattern for k = ${k} | Ordinal ranking: ${unique_groups_count} unique deviation groups` :
                                    `Entropy Uniformity Pattern for k = ${k} | Scale factor: ${(scale_factor || 1.0).toFixed(4)}`,
                                font: { size: 14 }
                            },
                            legend: {
                                display: factor_pairs && factor_pairs.length > 0,
                                position: 'top'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const index = context.dataIndex;

                                        // Handle factor overlay points
                                        if (context.datasetIndex === 1 && factor_pairs) {
                                            const pair = factor_pairs.find(p => p.smaller_in_sqrt_range);
                                            if (pair) {
                                                return [
                                                    `🎯 FACTOR FOUND: ${pair.smaller_factor}`,
                                                    `Co-factor: ${pair.larger_factor}`,
                                                    `Product: ${pair.smaller_factor} × ${pair.larger_factor} = ${pair.product}`,
                                                    `Segment: ${pair.segment_index} (Level ${pair.refinement_level})`
                                                ];
                                            }
                                        }

                                        // Handle entropy deviation points
                                        const original_div = division_analysis[index];
                                        const original_H_dev = deviations_H[index];
                                        const dev_sign = original_div.H_deviation.getRationalParts().numerator < 0n ? '-' : '+';

                                        const method_info = use_ordinal_ranking ?
                                            [`Ordinal ranking: ${(context.parsed.y || 0).toFixed(2)}`, `Ultra-high precision mode`] :
                                            [`Scaled value: ${(context.parsed.y || 0).toFixed(8)}`, `Scale factor: ${(scale_factor || 1.0).toFixed(6)}`];

                                        return [
                                            `Division ${index}: Size = ${original_div.size}`,
                                            `Raw deviation: ${dev_sign}${original_H_dev.toMathString()}`,
                                            ...method_info,
                                            `Deviation range: ${range_magnitude.toExponential(3)}`
                                        ];
                                    }
                                }
                            }
                        }
                    }
                }
            );

            console.log("✅ Chart.js instance created successfully");

        } catch (error) {
            console.error("❌ Failed to create Chart.js instance:", error);
            throw error;
        }
    }

    /**
     * DESTROY CHART INSTANCE
     * Clean up chart resources when widget is no longer needed.
     */
    destroy() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    }

    /**
     * GET CHART INSTANCE
     * Provides access to the underlying Chart.js instance for advanced operations.
     * 
     * @returns {Chart|null} The Chart.js instance or null if not initialized
     */
    getChartInstance() {
        return this.chartInstance;
    }

    /**
     * UPDATE CHART DATA
     * Updates existing chart with new data without full re-render.
     * 
     * @param {Array<number>} newData - New data array for the chart
     * @param {Array<string>} newLabels - New labels array (optional)
     */
    updateChartData(newData, newLabels = null) {
        if (!this.chartInstance) {
            console.warn("Cannot update chart data: chart instance not initialized");
            return;
        }

        this.chartInstance.data.datasets[0].data = newData;
        if (newLabels) {
            this.chartInstance.data.labels = newLabels;
        }
        this.chartInstance.update();
    }
}

/**
* CHART WIDGET FACTORY
* Factory function for creating EGPT chart widgets with simplified API.
* 
* @param {string} containerId - ID of the container element
* @returns {EGPTEntropyChart} Configured chart widget instance
*/
export function createEntropyChart(containerId) {
    console.log(`🎯 Creating EGPT entropy chart widget in container: ${containerId}`);
    return new EGPTEntropyChart(containerId);
}

/**
 * CHART THEME CONFIGURATION
 * Centralized styling configuration for consistent EGPT chart appearance.
 */
export const EGPTChartTheme = {
    colors: {
        primary: 'rgba(99, 102, 241, 1)',
        primaryLight: 'rgba(99, 102, 241, 0.2)',
        secondary: 'rgba(231, 76, 60, 1)',
        secondaryLight: 'rgba(231, 76, 60, 0.2)',
        text: '#2c3e50',
        grid: '#e0e0e0'
    },
    fonts: {
        title: { size: 14, weight: 'bold' },
        axis: { size: 12 },
        tooltip: { size: 11 }
    }
};

/**
 * CHART UTILITIES
 * Helper functions for common chart operations.
 */
export const ChartUtils = {
    /**
     * Format large numbers for display in charts
     * @param {BigInt|number} value - Value to format
     * @param {number} maxLength - Maximum display length
     * @returns {string} Formatted string
     */
    formatLargeNumber(value, maxLength = 30) {
        const str = value.toString();
        return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
    },

    /**
     * Generate responsive chart dimensions based on container
     * @param {string} containerId - Container element ID
     * @returns {Object} Dimensions object with width and height
     */
    getResponsiveDimensions(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            return { width: 400, height: 300 };
        }

        const rect = container.getBoundingClientRect();
        return {
            width: Math.max(300, rect.width - 40),
            height: Math.max(250, rect.height - 40)
        };
    }
};
