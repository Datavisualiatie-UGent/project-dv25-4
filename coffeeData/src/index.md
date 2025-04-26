---
toc: false
---

<div class="hero">
  <div class="coffee-svg-container">
    <svg class="coffee-svg" width="120" height="120" viewBox="0 0 120 120">
      <!-- Coffee cup and smoke container -->
      <g class="smoke-container" transform="translate(35, 5)">
        <g class="smokes" stroke="#c19a6b" stroke-width="2" fill="none">
          <g class="smoke-1">
            <path d="M0.5,0 C0.5,0 3.5,5 3.5,10 C3.5,15 0.5,15 0.5,20 C0.5,25 3.5,25 3.5,30 C3.5,35 0.5,35 0.5,40"></path>
          </g>
          <g class="smoke-2">
            <path d="M20.5,0 C20.5,0 23.5,5 23.5,10 C23.5,15 20.5,15 20.5,20 C20.5,25 23.5,25 23.5,30 C23.5,35 20.5,35 20.5,40"></path>
          </g>
          <g class="smoke-3">
            <path d="M40.5,0 C40.5,0 43.5,5 43.5,10 C43.5,15 40.5,15 40.5,20 C40.5,25 43.5,25 43.5,30 C43.5,35 40.5,35 40.5,40"></path>
          </g>    </g>
      </g>
      <!-- Existing coffee cup with updated fill colors -->
      <path class="coffee-path cup" d="M 30,50 L 30,90 C 30,95 35,100 40,100 L 80,100 C 85,100 90,95 90,90 L 90,50 Z" fill="#46301e" stroke="#c19a6b" stroke-width="3"/>
      <path class="coffee-path handle" d="M 90,60 C 100,60 105,70 100,80 C 95,90 90,85 90,80" fill="none" stroke="#c19a6b" stroke-width="3"/>
      <path class="coffee-path coffee-fill" d="M 30,60 L 90,60 L 90,90 C 90,95 85,100 80,100 L 40,100 C 35,100 30,95 30,90 Z" fill="#603813" fill-opacity="0.6"/>
      <path class="coffee-path coffee" d="M 35,60 L 85,60" fill="none" stroke="#603813" stroke-width="3"/>
    </svg>
  </div>
  <h1>CoffeeData</h1>
  <h2>Exploring coffee statistics across the globe - coffee quality in different regions</h2>
  <a href="#coffee-charts" class="cta-button">Explore Coffee Stats<span style="display: inline-block; margin-left: 0.25rem;">↓</span></a>
</div>

```js
import { radarChart } from "./components/radarChart.js";
```

```js
const coffeeData = await FileAttachment("./data/coffeeDataset.csv").csv();
```

```js
const world = await FileAttachment("./data/world.json").json();
```

```js
const radarValues = await FileAttachment("./data/radarChart.json").json();
```

```js
// Create a mapping of countries to their coordinates
// This is a simplified mapping of country names to [longitude, latitude]
const countryCoordinates = {
  Brazil: [-55, -10],
  Colombia: [-74, 4],
  "Costa Rica": [-84, 10],
  "El Salvador": [-89, 14],
  Ethiopia: [38, 8],
  Guatemala: [-90, 15],
  Honduras: [-86, 15],
  Indonesia: [120, -5],
  Kenya: [38, 0],
  Laos: [105, 18],
  Madagascar: [47, -20],
  Mexico: [-102, 23],
  Myanmar: [96, 21],
  Nicaragua: [-85, 13],
  Panama: [-80, 9],
  Peru: [-76, -10],
  Taiwan: [121, 24],
  "Tanzania, United Republic Of": [35, -6],
  Thailand: [101, 15],
  Uganda: [32, 1],
  "United States (Hawaii)": [-155, 20],
  Vietnam: [108, 16],
};

const qualityPoints = coffeeData.map((d) => ({
  altitude: parseFloat(d.Altitude),
  cupPoints: parseFloat(d["Total Cup Points"]),
}));

const countryCounts = {};
coffeeData.forEach((d) => {
  const country = d["Country of Origin"];
  if (country && countryCoordinates[country]) {
    countryCounts[country] ??= {
      count: 0,
    };

    countryCounts[country].count++;
  } else {
    console.warn(`Country not found in coordinates mapping: ${country}`);
  }
});

const coffeePoints = Object.entries(countryCounts).map(([country, count]) => {
  return {
    country: country,
    coordinates: countryCoordinates[country],
    count: count.count,
  };
});

const counts = coffeePoints.map((d) => d.count);
const minCount = Math.min(...counts);
const maxCount = Math.max(...counts);

const getColorForCount = (count) => {
  const t = Math.sqrt((count - minCount) / (maxCount - minCount));

  // Using a more distinct and vibrant color range for better visibility
  return d3.interpolate("#ffe4b5", "#d2691e")(t); // Lighter gradient from moccasin to chocolate
};

let isGlobe = false;
const worldView = Generators.observe((notify) => {
  const clickHandler = (event) => {
    if (event.target.id === "globe-toggle") {
      isGlobe = true;
      notify("orthographic");
      event.target.classList.add("active");
      const mapButton = document.getElementById("map-toggle");
      mapButton.classList.remove("active");
    } else if (event.target.id === "map-toggle") {
      isGlobe = false;
      event.target.classList.add("active");
      const globeButton = document.getElementById("globe-toggle");
      globeButton.classList.remove("active");
      notify("equirectangular");
    }
  };
  notify("equirectangular");

  document.addEventListener("click", clickHandler);

  return () => {
    document.removeEventListener("click", clickHandler);
  };
});

const world_point = Generators.observe((notify) => {
  let curr_pos = 0;
  let isDragging = false;
  let lastMouseX = 0;
  let dragRotation = 0;

  const removeInterv = setInterval(() => {
    const world = document.getElementById("world-map");
    if (world && world.matches(":hover")) {
    } else {
      if (!isGlobe) return notify(0);
      curr_pos -= 0.5;
      notify(curr_pos);
    }
  }, 25);
  const movedownHandler = (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    e.preventDefault();
  };

  const touchStartHandler = (e) => {
    isDragging = true;
    lastMouseX = e.touches[0].clientX;
    e.preventDefault();
  };

  const waitForWorldMap = setInterval(() => {
    const world = document.getElementById("world-map");
    if (world) {
      clearInterval(waitForWorldMap);

      world.addEventListener("mousedown", movedownHandler);

      world.addEventListener("touchstart", touchStartHandler);
    }
  }, 100);

  const touchmoveHandler = (e) => {
    if (isDragging) {
      const deltaX = e.touches[0].clientX - lastMouseX;
      dragRotation += deltaX * 0.5;
      lastMouseX = e.touches[0].clientX;
      curr_pos = dragRotation;
      notify(curr_pos);
    }
  };

  const mousemoveHandler = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMouseX;
      dragRotation += deltaX * 0.5;

      lastMouseX = e.clientX;
      curr_pos = dragRotation;
      notify(curr_pos);
    }
  };

  const mouseupHandler = () => {
    isDragging = false;
  };

  document.addEventListener("mousemove", mousemoveHandler);

  document.addEventListener("mouseup", mouseupHandler);

  document.addEventListener("mouseleave", mouseupHandler);

  document.addEventListener("touchmove", touchmoveHandler);
  document.addEventListener("touchend", mouseupHandler);

  notify(0);
  return () => {
    clearInterval(removeInterv);
    const world = document.getElementById("world-map");
    if (world) {
      world.removeEventListener("mousedown", movedownHandler);
      world.removeEventListener("touchstart", touchStartHandler);
    }
    document.removeEventListener("mousemove", mousemoveHandler);
    document.removeEventListener("mouseup", mouseupHandler);
    document.removeEventListener("mouseleave", mouseupHandler);
    document.removeEventListener("touchmove", touchmoveHandler);
    document.removeEventListener("touchend", mouseupHandler);
  };
});
console.log(coffeePoints);
```

```js
const countryOptions = Array.from(
  new Set(radarValues.map((d) => d["Country of Origin"]))
);

console.log("Options:", countryOptions);
const checkboxes = Inputs.checkbox(countryOptions, {
  value: [countryOptions[0]],
  columns: 1,
});
const selectedCountries = view(checkboxes);

console.log("Selected countries:", selectedCountries);
```

```js
import * as d3 from "npm:d3";

// Use a color scheme with more colors - d3.schemeCategory20 is no longer available in d3v6+
// Create a custom expanded color palette
const extendedColorPalette = [
  // Vibrant primary and secondary colors
  "#FF3E4D", // Vibrant red
  "#00CC66", // Emerald green
  "#4D79FF", // Royal blue
  "#FF9900", // Amber orange
  "#CC00FF", // Electric purple
  "#00CCFF", // Cyan blue
  "#FFCC00", // Golden yellow
  "#FF66CC", // Hot pink
  "#33CC33", // Lime green
  "#6666FF", // Periwinkle blue

  // Bright tertiary colors
  "#FF6600", // Bright orange
  "#00FFCC", // Turquoise
  "#9933FF", // Violet
  "#FFFF33", // Bright yellow
  "#FF0099", // Magenta
  "#3399FF", // Azure blue
  "#FF99CC", // Pink
  "#99CC00", // Chartreuse
  "#FF6666", // Salmon

  // Additional vibrant hues
  "#00FF66", // Spring green
  "#CC3399", // Deep magenta
  "#FFCC66", // Pale orange
  "#3366FF", // Dodger blue
  "#FF33CC", // Deep pink
  "#33FFAA", // Medium spring green
  "#6633CC", // Royal purple
  "#CCFF33", // Lime
  "#FF5733", // Deep orange
  "#33CCFF", // Sky blue

  // Bonus colors for extra options
  "#FF9966", // Coral
  "#66CC99", // Medium aquamarine
  "#9966FF", // Amethyst
  "#FFCC99", // Peach
  "#66CCFF", // Sky blue
];
// Create a global colorScale that both components will use
const colorScale = d3.scaleOrdinal(extendedColorPalette).domain(countryOptions);

// Pass this colorScale to the radarChart
const radarColorScheme = {
  domain: countryOptions,
  range: countryOptions.map((country) => colorScale(country)),
};

function styleCountryCheckboxes() {
  document.querySelectorAll(".controls label").forEach((label) => {
    const country = label.textContent.trim();
    const c = colorScale(country);

    // Existing checkbox styling code...
    // base styles
    label.style.cursor = "pointer";
    label.style.padding = "4px 6px";
    label.style.margin = "2px 1px";
    label.style.border = `2px solid ${c}`;
    label.style.borderRadius = "6px";
    label.style.position = "relative";
    label.style.width = "fit-content";

    // smooth transitions for hover
    label.style.transition = "transform 0.15s ease, box-shadow 0.15s ease";

    // cover the whole label with the invisible input
    const input = label.querySelector("input");
    input.style.position = "absolute";
    input.style.top = "0";
    input.style.left = "0";
    input.style.width = "100%";
    input.style.height = "100%";
    input.style.margin = "0";
    input.style.opacity = "0";
    input.style.accentColor = c;

    // selected background
    if (input.checked) {
      const col = d3.color(c);
      col.opacity = 0.15;
      label.style.backgroundColor = col.formatRgb();
    } else {
      label.style.backgroundColor = "transparent";
    }

    // add hover handlers
    label.addEventListener("mouseenter", () => {
      label.style.transform = "scale(1.03)";
      label.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
    });
    label.addEventListener("mouseleave", () => {
      label.style.transform = "scale(1)";
      label.style.boxShadow = "none";
    });
  });
}

// invoke & bind
styleCountryCheckboxes();
checkboxes.addEventListener("input", styleCountryCheckboxes);
```

```js
const filteredData = radarValues.filter((d) =>
  selectedCountries.includes(d["Country of Origin"])
);
console.log("Filtered data:", filteredData);
```

<div class="map-view-toggle">
  <button id="map-toggle" class="map-toggle-button active" data-view="flat">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <path d="M2 8H22" stroke="currentColor" stroke-width="1.5"/>
      <path d="M2 16H22" stroke="currentColor" stroke-width="1.5"/>
      <path d="M8 4V20" stroke="currentColor" stroke-width="1.5"/>
      <path d="M16 4V20" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    Map
  </button>
  <button id="globe-toggle" class="map-toggle-button " data-view="globe">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="1.5"/>
      <path d="M2 12H22" stroke="currentColor" stroke-width="1.5"/>
      <path d="M12 2V22" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    Globe
  </button>
</div>

<div class="visualization-container">
  <div id="world-map">
    <div>
    ${
      resize(async (width) => Plot.plot({
          projection: {type: worldView, rotate: [world_point, 0]},
          width: width,
          height: width * 0.6,
          margin: 0,
          style: {
            // Removing the backgroundColor for transparency
            color: "#e0d0c1" // Lighter text color for dark theme
          },
          marks: [
            Plot.geo(topojson.feature(world, world.objects.countries), {
              fill: "#e0d0c1",
              stroke: "#c19a6b",
              strokeWidth: 0.5,
              fillOpacity: 0.3 // Reduced opacity for dark background
            }),
            Plot.dot(coffeePoints, {
              x: d => d.coordinates[0],
              y: d => d.coordinates[1],
              r: d => d.count * 4 + 5, // Using sqrt for better scaling
              fill: d => getColorForCount(d.count),
              fillOpacity: 0.9, // Increased opacity for visibility
              stroke: "#46301e",
              strokeWidth: 1,
              tip: true, // Simplified tooltip configuration
              title: d => `${d.country}: ${d.count} samples`
            }),
            Plot.sphere({ stroke: "#c19a6b", strokeOpacity: 0.3 })
          ]
        })
      )
    }
    </div>
  </div>
  
  <div class="visualization-description">
    <h3 class="card-title">Global Coffee Origins</h3>
    <p>
      We observe the global diversity of coffee production, with samples sourced from over 20 countries. The data shows the geographical spread of coffee cultivation, from traditional producers like Colombia, Ethiopia, and Brazil to regions such as Taiwan and Laos. The data shows that most of the coffee is produced near the equator, where the climate is ideal for coffee cultivation.
    </p>
    ${worldView === "orthographic" ? html`<p><em>You can rotate the globe by dragging or switch to a 2D map view using the toggle buttons above.</em></p>`: ""}
  </div>
</div>

<div class="card">
<div >

  <h3  class="card-title">Coffee quality and height</h3>
</div>
  TODO... Continue work on this
  <div>
    <div>
      ${
        resize(async (width) => Plot.plot({
          width: width,
          height: width * 0.6,
                    marks: [
                    Plot.dot(qualityPoints, {
                    x: d => d.cupPoints,
                    y: d => d.altitude,
                    fill: d => "#aa6122",
                    fillOpacity: 0.9,
                    stroke: "#46301e",
                    strokeWidth: 1,
                    tip: true,
                    title: d => `Altitude of ${d.altitude} meter\n${d.cupPoints} total cup points`
                    }),
                    Plot.linearRegressionY(qualityPoints, {
                    x: d => d.cupPoints,
                    y: d => d.altitude,
                    stroke: "#c19a6b", // Subtle coffee-themed color
                    strokeWidth: 2.5, // Slightly thinner line for balance
                    strokeOpacity: 0.8, // Softer opacity for blending
                    label: "Trend Line"
                    })
                    ],    }))    }
    </div>
  </div>
</div>

<div style="display: flex; flex-direction: row; align-items: flex-start; justify-content: center; gap: 1rem; height: 600px; flex-grow: 1;">
  <div>
    ${radarChart(radarValues.filter(d =>
      selectedCountries.includes(d["Country of Origin"])
    ), {
      width: 600,
      height: 600,
      maxRating: 10,
      levels: 4,
      colorScheme: radarColorScheme  // Pass the custom color scheme
    })}
  </div>
  <div
    class="controls"
    style="padding: 1rem; background: rgba(70, 48, 30, 0.1); border-radius: 12px; border: 1px solid rgba(193, 154, 107, 0.3); min-width: 200px;max-width: 310px;height: 100%;"
  >
    <h3>Filter Countries</h3>
    <div class="checkbox-list">
      ${checkboxes}
    </div>
  </div>
</div>

<style>

  .checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 5px 2px;
    max-width: 300px;
    height: 95%;
  }
  
  .checkbox-list div {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .checkbox-list > form {
    height: 100%;
  }

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
  padding: 3rem 1rem;
}

.coffee-svg-container {
  margin-bottom: 1rem;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coffee-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 2s forwards ease-in-out;
}

.cup {
  animation-delay: 0s;
}

.handle {
  animation-delay: 0.5s;
}

.coffee {
  animation-delay: 1s;
}

/* Remove the old heat-wave styles */

.smoke-1 {
  animation: draw 1s forwards ease-in-out 1s, shift 5s linear 1.5s infinite;
  opacity: 0;
}

.smoke-2 {
  animation: draw 1s forwards ease-in-out 1.2s, shift-2 4s linear 1.7s infinite;
  opacity: 0;
}

.smoke-3 {
  animation: draw 1s forwards ease-in-out 1.4s, shift-3 5s linear 1.9s infinite;
  opacity: 0;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes shift {
  0% {
    transform: translate(0, 45px);
    opacity: 0.7;
  }
  80% {
    opacity: 0;
  }
  100% {
    transform: translate(0, 0);
    opacity: 0;
  }
}

@keyframes shift-2 {
  0% {
    transform: translate(0, 45px);
    opacity: 0.7;
  }
  80% {
    opacity: 0;
  }
  100% {
    transform: translate(0, 0);
    opacity: 0;
  }
}

@keyframes shift-3 {
  0% {
    transform: translate(0, 45px);
    opacity: 0.7;
  }
  80% {
    opacity: 0;
  }
  100% {
    transform: translate(0, 0);
    opacity: 0;
  }
}

/* You can remove the old animation keyframes that are no longer used */

.coffee-fill {
  animation: fadeIn 1s forwards ease-in-out 1s;
  opacity: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3)) brightness(1.1);
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, #603813, #c19a6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 40em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

.cta-button {
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: #603813;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(96, 56, 19, 0.2);
}

.cta-button:hover {
  background-color: #7e572b;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(96, 56, 19, 0.3);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
  
  .coffee-svg {
    width: 150px;
    height: 150px;
  }
}

.map-view-toggle {
  display: flex;
  justify-content: center;
  background: rgba(70, 48, 30, 0.2);
  border-radius: 50px;
  padding: 0.5rem;
  margin: 2rem auto;
  width: fit-content;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(193, 154, 107, 0.3);
}

.map-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #e0d0c1;
  border-radius: 50px;
  cursor: pointer;
  font-family: var(--sans-serif);
  font-weight: 600;
  transition: all 0.3s ease;
}

.map-toggle-button:hover {
  color: #fff;
}

.map-toggle-button.active {
  background: #603813;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.map-toggle-button svg {
  transition: all 0.3s ease;
  pointer-events: none; /* Prevents the SVG from capturing the click event */
}

.map-toggle-button:hover svg {
  transform: scale(1.1);
}

/* Visualization description styles */
.visualization-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.visualization-description {
  background: rgba(70, 48, 30, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(193, 154, 107, 0.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h3, .card-title {
  color: #c19a6b;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1rem;
  font-weight: 700;
}

p, ul {
  color: var(--theme-foreground);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.visualization-description ul {
  padding-left: 1.5rem;
}

.visualization-description li {
  margin-bottom: 0.5rem;
}

.visualization-description em {
  color: var(--theme-foreground-muted);
}

#world-map {
  cursor: grab;
}

#world-map:active {
  cursor: grabbing;
}

/* Responsive layout for larger screens */
@media (min-width: 768px) {
  .visualization-container {
    flex-direction: row;
    align-items: flex-start;
  }
  
  #world-map {
    flex: 2;
  }
  
  .visualization-description {
    flex: 1;
    max-width: 350px;
    position: sticky;
    top: 2rem;
  }
}
</style>
