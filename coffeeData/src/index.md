---
toc: false
---

<link rel="stylesheet" href="./styles/coffee.css">
<link rel="stylesheet" href="./styles/checkboxes.css">
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
  <h2>
  Coffee, a drink consumed and enjoyed by many people across the globe. But what is a delicious cup of coffee and from what part of the world does it originate from? That is exactly the question we’ll try to clarify on this page. <br/>
  We have gathered data from the Coffee Quality Institute(CQI) which is a non-profit organization that works to improve the quality and value of coffee worldwide. From these data we have formed interesting visualizations that try to shine a light on the correlation between various factors of the growing, roasting and processing of coffee beans.
</h2>
  <a href="#coffee-charts" class="cta-button">Explore Coffee Stats<span style="display: inline-block; margin-left: 0.25rem;">↓</span></a>
</div>

```js
import { radarChart } from "./components/radarChart.js";
import createGlobalMap from "./components/globalMap.js";
import { createQualityChart } from "./components/qualityChart.js";
import { createColorScale } from "./components/colorScheme.js";
```

```js
const coffeeDataJson = await FileAttachment("./data/radarChart.json").json();
const coffeeData = coffeeDataJson.full_data;
const radarValues = coffeeDataJson.radar_data;
```

```js
const world = await FileAttachment("./data/world.json").json();
```

```js
// Initialize the global map component
const { worldView, world_point, coffeePoints, getColorForCount } =
  createGlobalMap(coffeeData, world, Generators);
```

```js
const countryOptions = Array.from(
  new Set(radarValues.map((d) => d["Country of Origin"]))
);

const checkboxes = Inputs.checkbox(countryOptions, {
  value: [countryOptions[0]],
  columns: 1,
});
const selectedCountries = view(checkboxes);

console.log("Selected countries:", selectedCountries);
```

```js
// Initialize the color scheme
const { colorScale, radarColorScheme, styleCountryCheckboxes } =
  createColorScale(countryOptions);

// Apply styling to checkboxes with a slight delay to ensure DOM is ready
setTimeout(styleCountryCheckboxes, 50);
// Add event listener for future changes
checkboxes.addEventListener("input", styleCountryCheckboxes);
```

```js
const filteredData = radarValues.filter((d) =>
  selectedCountries.includes(d["Country of Origin"])
);
console.log("Filtered data:", filteredData);
```

<div class="map-view-toggle" id="coffee-charts">
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
  
  <div class="visualization-description card">
    <h3 class="card-title">Global Coffee Origins</h3>
    <p>
      We observe the global diversity of coffee production, with samples sourced from over 20 countries. The data shows the geographical spread of coffee cultivation, from traditional producers like Colombia, Ethiopia, and Thailand to regions such as Taiwan and Vietnam. The data shows that most of the coffee is produced near the equator, where the climate is ideal for coffee cultivation. 
    </p>
    <span>
    ${worldView === "orthographic" ? html`<p><em>You can rotate the globe by dragging or switch to a 2D map view using the toggle buttons above.</em></p>`: ""}
    </span>
  </div>
</div>

<div class="card">
<div>
  <h3 class="card-title">Coffee Quality Relationship Analyzer</h3>
  <p class="card-paragraph">
    A cup of coffee can be described by a bunch of different factors like sweetness, acidity, uniformity, … But a question one could ask is, what is the effect of external factors on the flavor profile of the harvested beans. This graph aims to show this relationship. <br/>
    Simply pick a quality parameter and an external factor and observe the relationship between the 2
  </p>
  <div class="dropdown-container">
    <div class="dropdown-group">
      <label for="quality-param">Quality Parameter:</label>
      <select id="quality-param" class="coffee-dropdown">
        <option value="Total Cup Points" selected>Total Cup Points</option>
        <option value="Aroma">Aroma</option>
        <option value="Flavor">Flavor</option>
        <option value="Aftertaste">Aftertaste</option>
        <option value="Acidity">Acidity</option>
        <option value="Body">Body</option>
        <option value="Balance">Balance</option>
        <option value="Uniformity">Uniformity</option>
        <option value="Clean Cup">Clean Cup</option>
        <option value="Sweetness">Sweetness</option>
      </select>
    </div>
    <div class="dropdown-group">
      <label for="other-factor">Other Factor:</label>
      <select id="other-factor" class="coffee-dropdown">
        <option value="Altitude" selected>Altitude</option>
        <option value="Moisture Percentage">Moisture Percentage</option>
        <!-- <option value="Category One Defects">Category One Defects</option> -->
        <!-- <option value="Quakers">Quakers</option> -->
        <!-- <option value="Category Two Defects">Category Two Defects</option> -->
      </select>
    </div>
  </div>
  <div>
  <br/>
    <div>
      ${createQualityChart(coffeeData)}
    </div>
  </div>
</div>
</div>

<div class="card">
<div style="display: flex; align-items: flex-start; gap: 1rem; height: 500px; padding-bottom: 2px;">
  <div style="flex: 1; display: flex; align-items: center; justify-content: center; height: 100%;">
    ${radarChart(radarValues.filter(d => 
      selectedCountries.includes(d["Country of Origin"])
    ), {
      width: 550,
      height:550,
      maxRating: 10,
      levels: 4,
      colorScheme: radarColorScheme 
    })}
  </div>
  <div class="control-wrapper"> 
    <div class="controls">
      <h3>Filter Countries</h3>
      <div class="checkbox-list">
        ${checkboxes}
        <br/>
      </div>
    </div>
  </div>
</div>
</div>
