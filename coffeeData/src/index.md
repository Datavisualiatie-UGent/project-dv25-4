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

<div id="coffee-charts" class="grid grid-cols-2" style="grid-auto-rows: 504px;">
  <div class="card">${
    resize((width) => Plot.plot({
      title: "Your awesomeness over time 🚀",
      subtitle: "Up and to the right!",
      width,
      y: {grid: true, label: "Awesomeness"},
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(aapl, {x: "Date", y: "Close", tip: true})
      ]
    }))
  }</div>
  <div class="card">${
    resize((width) => Plot.plot({
      title: "How big are penguins, anyway? 🐧",
      width,
      grid: true,
      x: {label: "Body mass (g)"},
      y: {label: "Flipper length (mm)"},
      color: {legend: true},
      marks: [
        Plot.linearRegressionY(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species"}),
        Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species", tip: true})
      ]
    }))
  }</div>
</div>

---

## Next steps

Here are some ideas of things you could try…

<div class="grid grid-cols-4">
  <div class="card">
    Chart your own data using <a href="https://observablehq.com/framework/lib/plot"><code>Plot</code></a> and <a href="https://observablehq.com/framework/files"><code>FileAttachment</code></a>. Make it responsive using <a href="https://observablehq.com/framework/javascript#resize(render)"><code>resize</code></a>.
  </div>
  <div class="card">
    Create a <a href="https://observablehq.com/framework/project-structure">new page</a> by adding a Markdown file (<code>whatever.md</code>) to the <code>src</code> folder.
  </div>
  <div class="card">
    Add a drop-down menu using <a href="https://observablehq.com/framework/inputs/select"><code>Inputs.select</code></a> and use it to filter the data shown in a chart.
  </div>
  <div class="card">
    Write a <a href="https://observablehq.com/framework/loaders">data loader</a> that queries a local database or API, generating a data snapshot on build.
  </div>
  <div class="card">
    Import a <a href="https://observablehq.com/framework/imports">recommended library</a> from npm, such as <a href="https://observablehq.com/framework/lib/leaflet">Leaflet</a>, <a href="https://observablehq.com/framework/lib/dot">GraphViz</a>, <a href="https://observablehq.com/framework/lib/tex">TeX</a>, or <a href="https://observablehq.com/framework/lib/duckdb">DuckDB</a>.
  </div>
  <div class="card">
    Ask for help, or share your work or ideas, on our <a href="https://github.com/observablehq/framework/discussions">GitHub discussions</a>.
  </div>
  <div class="card">
    Visit <a href="https://github.com/observablehq/framework">Framework on GitHub</a> and give us a star. Or file an issue if you’ve found a bug!
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

</style>
