/* Copyright 2023-2025 by Essam Abadir */

// Description: This file contains the code for creating the interference chart.
// The chart displays the interference pattern detected by the detectors in the double-slit experiment.
class InterferenceChart {
    constructor(canvas_rect, wavelength, d_distance_between_slits, L_distance_slits_to_screen) {
        this.canvas_rect = canvas_rect; //keep a reference to the canvas rectangle object so we can get the width and height even if the canvas is resized
        this._wavelength = wavelength;
        this.d_distance_between_slits = d_distance_between_slits;
        this.L_distance_slits_to_screen = L_distance_slits_to_screen;
        this.expectedFringeSpacing = this.L_distance_slits_to_screen * this.wavelength / this.d_distance_between_slits;
        //round expected
        this.expectedFringeSpacing = Math.floor(this.expectedFringeSpacing)
        this.isShown = false;
        
    }

    get wavelength() {
        return this._wavelength * WAVELENGTH_CONSTANT;
    }

    // Method to display the chart
    showChart(chartDiv, dataMap, chartType = 'area') {
        this.isShown = true;
        let chart_elm = chartDiv.elt; // Get the DOM element from the p5.js element
        chartDiv.style('background-color', 'white'); // Set the background color of the chart div
        let display_width = chart_elm.offsetWidth;
        let display_height = chart_elm.offsetHeight;

        //If there is no data yet, print a message and return
        if (dataMap.size === 0) {
                        chart_elm.innerHTML = "<h1 style='display: flex; justify-content: center; align-items: center; height: 100%; margin: 0;'>No data collected yet.</h1>";
            return;
        }

        // Compute aggregated data once
        let aggregatedData = null;
        if (dataMap.size > 1) {
            aggregatedData = [];
            dataMap.forEach(data => {
                data.forEach(d => {
                    let existing = aggregatedData.find(item => item.y === d.y);
                    if (existing) {
                        existing.count += d.count;
                    } else {
                        aggregatedData.push({ ...d });
                    }
                });
            });
        } 

        const margin = { top: 10, right: 30, bottom: 30, left: 60 },
            width = display_width - margin.left - margin.right,
            height = display_height - margin.top - margin.bottom;

        // Clear the previous chart
        d3.select(chart_elm).selectAll("*").remove();

        // Create a button for toggling between area and line charts
        const toggleButton = document.createElement("button");
        toggleButton.className = "btn btn-primary"; // Bootstrap button styling
        toggleButton.innerText = "Toggle Chart Type";
        toggleButton.addEventListener("click", () => {
            let currentType = toggleButton.dataset.chartType === 'area' ? 'line' : 'area';
            toggleButton.dataset.chartType = currentType;
            updateCharts(currentType);
        });
        chart_elm.appendChild(toggleButton);

        // Create a button for cycling through charts
        const nextButton = document.createElement("button");
        nextButton.className = "btn btn-secondary"; // Bootstrap button styling
        nextButton.innerText = "Next";
        nextButton.style.display = 'none'; // Initially hidden
        nextButton.addEventListener("click", cycleCharts);
        chart_elm.appendChild(nextButton);

        // Create a div to contain the buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "center";
        buttonContainer.style.gap = "10px";
        chart_elm.appendChild(buttonContainer);

        // Move the existing buttons into the button container
        buttonContainer.appendChild(toggleButton);
        buttonContainer.appendChild(nextButton);

        

        let chartIndex = 0;
        let charts = [];

        // Function to cycle through charts
        function cycleCharts() {
            charts[chartIndex].style.display = "none";
            chartIndex = (chartIndex + 1) % charts.length;
            charts[chartIndex].style.display = "block";
        }

        // Function to update all charts to the new type
        const updateCharts = (newChartType) => {
            // Clear existing chart-container divs
            d3.select(chart_elm).selectAll(".chart-container").remove();

            // clear the charts array
            charts = [];

            // Redraw charts with the new type
            dataMap.forEach((data, detectorName) => {
                let chartData = detectorName === 'Aggregated' ? aggregatedData : data;
                createInterferenceReport(chartData, detectorName, newChartType, this.canvas_rect.h,this);
            });

            // Redraw aggregated chart if it exists
            if (aggregatedData) {
                createInterferenceReport(aggregatedData, 'Aggregated', newChartType, this.canvas_rect.h,this);
            }

            // Show the first chart
            chartIndex = 0;
            if (charts.length == 0) {
                return;
            }
            charts[chartIndex].style.display = "block";
            chartDiv.show();
        }

        function calculateFringeSpacingAndError(data, expectedFringeSpacing,chartInstance) {
            let fringeSpacing = 0;
            let errorFringeSpacing = 0;
            let count = 0;
            let totalError = 0;
            let totalFringeSpacing = 0;
        
            // Sort the data by y
            data.sort((a, b) => a.y - b.y);
        

        
            // Smooth the data using a moving average
            const smoothedYValues = smooth(data, chartInstance.wavelength/2);
        
            // Identify peaks in the smoothed data
            const peaks = findPeaks(smoothedYValues,chartInstance);
        
            // Calculate fringe spacing and error
            for (let i = 1; i < peaks.length; i++) {
                let spacing = peaks[i].start - peaks[i - 1].end;
                totalFringeSpacing += spacing;
                totalError += Math.abs(spacing - expectedFringeSpacing);
                count++;
            }
        
            if (count > 0) {
                fringeSpacing = totalFringeSpacing / count;
                errorFringeSpacing = totalError / count;
            }
        
            return {
                fringeSpacing: fringeSpacing,
                errorFringeSpacing: errorFringeSpacing
            };
        }
        
        // Smooth the data using a moving average
        function smooth(data, windowSize) {
            let smoothed = [];
            // round window size
            windowSize = Math.floor(windowSize);
            let start = Math.max(data[0].y,0);
            let end = start + windowSize;
            let max_y = data[data.length - 1].y;
            for (let i = 0; i < max_y; i++) {

                let sum = 0;
                for (let j = start; j < end && j < max_y; j++) {
                    sum += data[j].count;
                }
                //if there is no data in the window then we don't want to add it to the smoothed array
                if (sum === 0) {
                    continue;
                }
                let dataSection = { start: start, count: sum, end: end };
                try {
                    if (isNaN(dataSection.start) || isNaN(dataSection.count) || isNaN(dataSection.end) || dataSection.start === undefined || dataSection.count === undefined || dataSection.end === undefined || dataSection.start === null || dataSection.count === null || dataSection.end === null ) {
                        console.log("dataSection.start is NaN");
                        //continue;
                    } else {
                        smoothed.push(dataSection);
                    }
                } catch (e) {
                    console.log("error pushing dataSection to smoothed");
                }   
                

                sum = 0;
                i = end;
                if (i >= max_y) {
                    break;
                }
                start = data[i].y;
                end = Math.min(start + windowSize, max_y);
            }
            return smoothed;
        }
        
        // Find peaks in the data
        function findPeaks(data,chartInstance) {
            if (data.length < 3) {
                return [];
            }
            // a peak is define as window which is 2X its next neighbor. 
            //we assume the first value is a valley but if it is a peak we will add it to the peaks array
            //if the next neighbor is above .5 of the current value we will extend the peak or valley. 
            //if the next neighbor is below .5 of the current value we will end the peak 
            let peaks = [];
            let currentSection = data[0];
            currentSection.ispeak = false;
            let threshold_hits_per_y = 5; //the entire window must average 5 hits to be considered a peak
            for (let i = 1; i < data.length; i++) {

                let next = data[i];

                if (currentSection.ispeak) {
                    if (next.count > currentSection.count * .5) {
                        //the next value is above .5 of the current value so we extend the peak
                        currentSection.end = next.end;
                    } else {
                        //the next value is below .5 of the current value so we end the peak, add the peak to the peaks array and start a new valley
                        let peakmidpoint = Math.floor((currentSection.start + currentSection.end) / 2);
                        if (isNaN(peakmidpoint)) {
                            console.log("peakmidpoint is NaN");
                        }
                        peaks.push(currentSection);
                        currentSection = data[i];
                        currentSection.ispeak = false;
                    }
                } else {
                    //we believe we are in a valley, check if the next value is much lower than the current value, if so we are really in a peak
                    if ( (currentSection.count > next.count * 2) && (currentSection.count > chartInstance.wavelength) ) {
                        //---Check if this section is a peak
                        //the next value is above 2X the current value and is far enough away so we end the valley and start a new peak
                        currentSection.ispeak = true;
                    } else if ( (next.count >= currentSection.count * 2) && (next.count > chartInstance.wavelength) )  {
                        //---Check if the next section is a peak
                        //the next value is 2X the current value so the next section is a peak 
                        next.ispeak = true;
                        currentSection = next;
                        
                    }
                }
            }
            return peaks;

        }

        function createInterferenceReport(data, detectorName, chartType, y_max,chartInstance) {
            let div = document.createElement("div");
            div.className = "chart-container"; // For custom styling
            div.dataset.detectorName = detectorName;
            div.dataset.chartType = chartType;
            div.style.display = "none"; // Hide initially
            chartInstance.isShown = true;

            const svg = d3.select(div)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // X axis (counts)
            const x = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.count)])
                .range([width, 0]);
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));

            let y = d3.scaleLinear()
                .domain([0, y_max]) // Assuming 'd.y' is your hit position
                .range([height, 0]);

            svg.append("g")
                .attr("transform", `translate(${width}, 0)`)
                .call(d3.axisRight(y));

            if (chartType === 'area') {
                // Drawing area
                const area = d3.area()
                    .x(d => x(d.count))
                    .y0(height)
                    .y1(d => y(d.y));
                svg.append("path")
                    .datum(data)
                    .attr("fill", "steelblue")
                    .attr("d", area);
            } else if (chartType === 'line') {
                // Drawing line
                const line = d3.line()
                    .x(d => x(d.count))
                    .y(d => y(d.y))
                    .curve(d3.curveBasis); // For a smooth line
                svg.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("d", line);
            }


            // Optional: Add title for each detector
            svg.append("text")
                .attr("x", (width / 2))
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text(`Detector: ${detectorName}`);

            // Labels
            const labelYOffset = 10; // Vertical space between labels
            let currentYPosition = 20; // Starting position for the first label
            let { fringeSpacing: avgFringeSpacing, errorFringeSpacing: avgErrorFringeSpacing } = calculateFringeSpacingAndError(data,chartInstance.expectedFringeSpacing,chartInstance);
            //Fringe Spacing Formula
            svg.append("text")
                .attr("x", 0)
                .attr("y", currentYPosition)
                .style("font-size", "12px")
                .text("Fringe Spacing Formula: L\u03BB / d");
            currentYPosition += labelYOffset;
            // Wavelength
            svg.append("text")
                .attr("x", 0)
                .attr("y", currentYPosition)
                .style("font-size", "12px")
                .text(`Wavelength (\u03BB): ${chartInstance.wavelength} Distance To Screen (L): ${chartInstance.L_distance_slits_to_screen} Distance Between Slits (d): ${chartInstance.d_distance_between_slits}`);
            currentYPosition += labelYOffset;

            // Expected Fringe Spacing
            svg.append("text")
                .attr("x", 0)
                .attr("y", currentYPosition)
                .style("font-size", "12px")
                .text(`Expected Fringe Spacing: ${chartInstance.expectedFringeSpacing}`);
            currentYPosition += labelYOffset;

            // Average Fringe Spacing
            svg.append("text")
                .attr("x", 0)
                .attr("y", currentYPosition)
                .style("font-size", "12px")
                .text(`Average Fringe Spacing: ${avgFringeSpacing}`);
            currentYPosition += labelYOffset;

            // Average Error on the Fringe Spacing
            svg.append("text")
                .attr("x", 0)
                .attr("y", currentYPosition)
                .style("font-size", "12px")
                .text(`Average Error on the Fringe Spacing: ${avgErrorFringeSpacing}`);

            // Add the chart to chartDiv
            chart_elm.appendChild(div);
            charts.push(div);
        }



        // Loop through each detector and create a chart
        dataMap.forEach((data, detectorName) => {
            createInterferenceReport(data, detectorName, chartType, this.canvas_rect.h,this);
        });

        if (aggregatedData) {
            createInterferenceReport(aggregatedData, 'Aggregated', chartType, this.canvas_rect.h,this);
        }

        // Optional: Create an aggregated chart if there's more than one detector
        if (dataMap.size > 1) {
            let aggregatedData = [];
            dataMap.forEach((data, detectorName) => {
                //if the detector  name is "undetected" then we don't want to include it in the aggregated data
                if (detectorName.toLowerCase() === "undetected") {
                    return;
                }
                data.forEach(d => {


                    let existing = aggregatedData.find(item => item.y === d.y);
                    if (existing) {
                        existing.count += d.count;
                    } else {
                        aggregatedData.push({ ...d });
                    }
                });
            });
            createInterferenceReport(aggregatedData, 'Aggregated No Undected', chartType, this.canvas_rect.h,this);
        }

        // Initialize the chart display
        if (charts.length > 1) {
            nextButton.style.display = 'block'; // Show the button if more than one chart
            cycleCharts(); // Show the first chart
        }
    }

    hideChart(chartDiv) {
        this.isShown = false;
        chartDiv.hide();
    }
}


