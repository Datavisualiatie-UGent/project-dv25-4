// Import necessary libraries and inputs helper
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

// Simple template literal tag for SVG content
const svg = (strings, ...values) => {
    const result = strings.reduce((acc, str, i) =>
        acc + str + (values[i] || ''), '');
    const div = document.createElement('div');
    div.innerHTML = result;
    return div.firstChild;
};

// Define parameters for the chart
const parameters = [
    "Aroma", "Flavor", "Aftertaste", "Acidity", "Body", "Balance", "Uniformity", "Clean Cup", "Sweetness"
];

// Create a longitude scale for parameter positioning
function createLongitudeScale(params) {
    const domain = params;
    const range = params.map((_, i) => -180 + (i * 360 / params.length));
    return d3.scaleOrdinal().domain(domain).range(range);
}

// Radar chart factory with new styling
export function radarChart(data, { width = 600, height = 600, maxRating = 10, levels = 5, colorScheme = "tableau10" } = {}) {

    // Create longitude scale for parameters
    const longitude = createLongitudeScale(parameters);

    // Prepare data points for plot
    const points = [];
    data.forEach(countryData => {
        const country = countryData["Country of Origin"];
        if (!country) return;

        parameters.forEach(param => {
            // Reduce the scale factor from 0.5 to 0.4 to keep bars shorter
            const value = (countryData[param] ?? 0) / maxRating * 0.5;
            points.push({
                name: country,
                key: param,
                value: value
            });
        });
    });

    // Scale levels to match the 0-0.5 range
    const levelValues = d3.range(1, levels + 1).map(level => (level / levels) * 0.5);

    // Handle both string scheme names and custom schemes with domain/range
    const colorConfig = typeof colorScheme === "string"
        ? { scheme: colorScheme }
        : {
            domain: colorScheme.domain,
            range: colorScheme.range
        };

    return Plot.plot({
        width,
        height,
        projection: {
            type: "azimuthal-equidistant",
            rotate: [0, -90],
            // Increase radius from 0.625 to 0.7 to give more space
            domain: d3.geoCircle().center([0, 90]).radius(0.7)()
        },
        color: colorConfig,
        marks: [
            // Background circles
            Plot.geo(levelValues, {
                geometry: (r) => d3.geoCircle().center([0, 90]).radius(r)(),
                stroke: "white",
                fill: "white",
                strokeOpacity: 0.3,
                fillOpacity: 0.03,
                strokeWidth: 0.5
            }),

            // Parameter axes
            Plot.link(parameters, {
                x1: longitude,
                y1: 90 - 0.57,
                x2: 0,
                y2: 90,
                curve: "linear",
                stroke: "white",
                strokeOpacity: 0.5,
                strokeWidth: 1
            }),

            // Tick labels
            Plot.text(levelValues, {
                x: 180,
                y: (d) => 90 - d,
                dx: 2,
                textAnchor: "start",
                text: (d) => `${(d / 0.5 * maxRating).toFixed(1)}`,
                fill: "currentColor",
                fontSize: 10,
                fontWeight: "500"
            }),

            // Parameter labels
            Plot.text(parameters, {
                x: longitude,
                y: 90 - 0.62, // Move labels further out from 0.57 to 0.62
                text: Plot.identity,
                fill: "currentColor",
                fontSize: 12,
                fontWeight: "bold",
                lineWidth: 5
            }),

            // Data areas
            Plot.area(points, {
                x1: ({ key }) => longitude(key),
                y1: ({ value }) => 90 - value,
                x2: 0,
                y2: 90,
                fill: "name",
                stroke: "name",
                curve: "cardinal-closed",
                fillOpacity: 0.1,
                strokeWidth: 1.5
            }),

            // Data points
            Plot.dot(points, {
                x: ({ key }) => longitude(key),
                y: ({ value }) => 90 - value,
                fill: "name",
                stroke: "white",
                r: 2.5
            }),

            // Interactive point labels
            Plot.text(
                points,
                Plot.pointer({
                    x: ({ key }) => longitude(key),
                    y: ({ value }) => 90 - value,
                    text: (d) => `${(d.value * maxRating * 2).toFixed(1)}`,
                    textAnchor: "start",
                    dx: 4,
                    fill: "currentColor",
                    stroke: "white",
                    strokeWidth: 0.2,
                    maxRadius: 10
                })
            ),

            // Interactive opacity style
            () =>
                svg`<style>
                    g[aria-label=area] path {fill-opacity: 0.1; transition: fill-opacity .2s;}
                    g[aria-label=area]:hover path:not(:hover) {fill-opacity: 0.05; transition: fill-opacity .2s;}
                    g[aria-label=area] path:hover {fill-opacity: 0.3; transition: fill-opacity .2s;}
                </style>`
        ]
    });
}
