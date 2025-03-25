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
  <h2>Exploring coffee statistics across the globe - production, consumption, and trends in different regions</h2>
  <a href="#coffee-charts" class="cta-button">Explore Coffee Stats<span style="display: inline-block; margin-left: 0.25rem;">↓</span></a>
</div>

```js
const coffeeData = await FileAttachment("./data/coffeeDataset.csv").csv();
const world = await FileAttachment("./data/world.json").json();

// Create a mapping of countries to their coordinates
// This is a simplified mapping of country names to [longitude, latitude]
const countryCoordinates = {
  "Brazil": [-55, -10],
  "Colombia": [-74, 4],
  "Costa Rica": [-84, 10],
  "El Salvador": [-89, 14],
  "Ethiopia": [38, 8],
  "Guatemala": [-90, 15],
  "Honduras": [-86, 15],
  "Indonesia": [120, -5],
  "Kenya": [38, 0],
  "Laos": [105, 18],
  "Madagascar": [47, -20],
  "Mexico": [-102, 23],
  "Myanmar": [96, 21],
  "Nicaragua": [-85, 13],
  "Panama": [-80, 9],
  "Peru": [-76, -10],
  "Taiwan": [121, 24],
  "Tanzania, United Republic Of": [35, -6],
  "Thailand": [101, 15],
  "Uganda": [32, 1],
  "United States (Hawaii)": [-155, 20],
  "Vietnam": [108, 16]
};

// Process coffee data to get counts by country
const countryCounts = {};
coffeeData.forEach(d => {
  const country = d["Country of Origin"];
  if (country && countryCoordinates[country]) {
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  }
});

// Create points data for the map
const coffeePoints = Object.entries(countryCounts).map(([country, count]) => {
  return {
    country: country,
    coordinates: countryCoordinates[country],
    count: count
  };
});

// Find min and max counts for color scaling
const counts = coffeePoints.map(d => d.count);
const minCount = Math.min(...counts);
const maxCount = Math.max(...counts);

// Create a better color scale function that handles outliers
const getColorForCount = (count) => {
  // Use a square root scale to compress the range
  const t = Math.sqrt((count - minCount) / (maxCount - minCount));

  return d3.interpolate("#e0d0c1", "#aa6122")(t);
};

let isGlobe = true;
const worldView = Generators.observe((notify) => {
  const clickHandler = (event) => {
    if (event.target.id === "globe-toggle") {
      isGlobe = true;
      notify("orthographic");
      event.target.classList.add("active");
      const mapButton = document.getElementById("map-toggle");
      mapButton.classList.remove("active");
    } else if(event.target.id === "map-toggle") {
      isGlobe = false;
      event.target.classList.add("active");
      const globeButton = document.getElementById("globe-toggle");
      globeButton.classList.remove("active");
      notify("equirectangular");
    }
  }
  notify("orthographic");

  document.addEventListener('click', clickHandler)

  return () => {
    document.removeEventListener('click', clickHandler);
  }
})

const world_point = Generators.observe((notify) => {
  let curr_pos = 0;
  let isDragging = false;
  let lastMouseX = 0;
  let dragRotation = 0;

  const removeInterv = setInterval(() => {
   
    const world = document.getElementById("world-map");
    if (world && world.matches(':hover')) {
    } else {
       if (!isGlobe) return notify(0)
      curr_pos -= 0.5;
      notify(curr_pos);
    }
  }, 25);

  const waitForWorldMap = setInterval(() => {
    const world = document.getElementById("world-map");
    if (world) {
      clearInterval(waitForWorldMap);

      world.addEventListener("mousedown", (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        e.preventDefault();
      });

      world.addEventListener("touchstart", (e) => {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        e.preventDefault();
      });
    }
  }, 100);


  document.addEventListener("mousemove", (e) => {
        if (isDragging) {
          const deltaX = e.clientX - lastMouseX;
          dragRotation += deltaX * 0.5; 
          
          lastMouseX = e.clientX;
          curr_pos = dragRotation;
          notify(curr_pos);
        }
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
      });

      document.addEventListener("mouseleave", () => {
        isDragging = false;
      });

       document.addEventListener("touchmove", (e) => {
        if (isDragging) {
          const deltaX = e.touches[0].clientX - lastMouseX;
          dragRotation += deltaX * 0.5;
          lastMouseX = e.touches[0].clientX;
          curr_pos = dragRotation;
          notify(curr_pos);
        }
      });
      document.addEventListener("touchend", () => {
        isDragging = false;
      });


  notify(0);
  return () => {
    clearInterval(removeInterv);
    const world = document.getElementById("world-map");
    if (world) {
      world.removeEventListener("mousedown", () => {});
      world.removeEventListener("touchstart", () => {});
    }
    document.removeEventListener("mousemove", () => {});
    document.removeEventListener("mouseup", () => {});
    document.removeEventListener("mouseleave", () => {});
    document.removeEventListener("touchmove", () => {});
    document.removeEventListener("touchend", () => {});
  };
});
```



<div class="map-view-toggle">
  <button id="globe-toggle" class="map-toggle-button active" data-view="globe">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="1.5"/>
      <path d="M2 12H22" stroke="currentColor" stroke-width="1.5"/>
      <path d="M12 2V22" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    Globe
  </button>
  <button id="map-toggle" class="map-toggle-button" data-view="flat">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <path d="M2 8H22" stroke="currentColor" stroke-width="1.5"/>
      <path d="M2 16H22" stroke="currentColor" stroke-width="1.5"/>
      <path d="M8 4V20" stroke="currentColor" stroke-width="1.5"/>
      <path d="M16 4V20" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    Map
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
    <h3>Global Coffee Origins</h3>
    <p>This map displays coffee samples. TODO add more text</p>
    <p><em>You can rotate the globe by dragging or switch to a flat map view using the toggle buttons above.</em></p>
  </div>
</div>



<style>

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

.visualization-description h3 {
  color: #c19a6b;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1rem;
  font-weight: 700;
}

.visualization-description p, 
.visualization-description ul {
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

<script>
// Fix toggle button click behavior
document.addEventListener('DOMContentLoaded', () => {
  const toggleButtons = document.querySelectorAll('.map-toggle-button');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      // This will work regardless of whether the SVG or button itself is clicked
      document.querySelectorAll('.map-toggle-button').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
});
</script>
