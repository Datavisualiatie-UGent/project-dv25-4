import * as Plot from "npm:@observablehq/plot";

export function createQualityChart(coffeeData) {
  const qualityParams = ["Total Cup Points", "Aroma", "Flavor", "Aftertaste", "Acidity", "Body", "Balance", "Uniformity", "Clean Cup", "Sweetness", "Overall"];
  const otherFactors = ["Altitude", "Moisture Percentage"];
  const defaultQualityParam = "Total Cup Points";
  const defaultOtherFactor = "Altitude";
  
  // Factor units mapping
  const factorUnits = {
    "Altitude": "meters",
    "Moisture Percentage": "%"
  };
  
  // Helper function to get display name with units
  const getDisplayName = (factor) => {
    if (factorUnits[factor]) {
      return `${factor} (${factorUnits[factor]})`;
    }
    return factor;
  };
  
  const prepareData = (data) => {
    // For numeric data, convert both to numbers
    return data.filter(d => 
      d[currentParams.qualityParam] !== undefined && 
      d[currentParams.qualityParam] !== null &&
      !isNaN(Number(d[currentParams.qualityParam])) && 
      Number(d[currentParams.qualityParam]) > 0 &&
      d[currentParams.otherFactor] !== undefined && 
      d[currentParams.otherFactor] !== null &&
      !isNaN(Number(d[currentParams.otherFactor]))
    ).map(d => ({
      ...d,
      // Ensure numeric values are actually numbers
      [currentParams.qualityParam]: Number(d[currentParams.qualityParam]),
      [currentParams.otherFactor]: Number(d[currentParams.otherFactor])
    }));
  };
  
  let currentParams = {
    qualityParam: defaultQualityParam,
    otherFactor: defaultOtherFactor
  };
  
  const element = document.createElement("div");
  element.className = "coffee-quality-chart";
  element.style.width = "100%";
  element.style.minHeight = "400px";
  
  const updateVisualization = () => {
    const processedData = prepareData(coffeeData);
    element.innerHTML = '';
    
    // Check if there's enough data to display
    if (processedData.length === 0) {
      const noDataMsg = document.createElement("div");
      noDataMsg.textContent = "No valid data available for the selected parameters.";
      noDataMsg.style.padding = "40px";
      noDataMsg.style.textAlign = "center";
      element.appendChild(noDataMsg);
      return;
    }
    
    // X-scale configuration (always numeric now)
    const xScaleConfig = {
      type: "linear",
      label: getDisplayName(currentParams.otherFactor),
      grid: true,
      labelOffset: 35,
      fontSize: 14,
      fontWeight: "bold",
      tickCount: 8
    };
    
    // Create plot (always with numeric x-axis)
    const plot = Plot.plot({
      width: element.clientWidth || 800,
      height: (element.clientWidth || 800) * 0.6,
      margin: 60,
      x: xScaleConfig,
      y: {
        label: currentParams.qualityParam,
        grid: true,
        tickFormat: "f",
        labelOffset: 45,
        fontSize: 14,
        fontWeight: "bold",
        tickCount: 8   
      },
      style: {
        fontSize: 12
      },
      marks: [
        Plot.dot(processedData, {
          x: d => d[currentParams.otherFactor],
          y: d => d[currentParams.qualityParam],
          fill: "#aa6122",
          fillOpacity: 0.9,
          stroke: "#46301e",
          strokeWidth: 1,
          tip: true,
          title: d => {
            const unit = factorUnits[currentParams.otherFactor] ? ` ${factorUnits[currentParams.otherFactor]}` : '';
            return `${currentParams.qualityParam}: ${d[currentParams.qualityParam].toFixed(2)}\n${currentParams.otherFactor}: ${d[currentParams.otherFactor].toFixed(2)}${unit}\nCountry: ${d["Country of Origin"]}`;
          }
        }),
        // Always add regression line (all options are numeric)
        Plot.linearRegressionY(processedData, {
          x: d => d[currentParams.otherFactor],
          y: d => d[currentParams.qualityParam],
          stroke: "#c19a6b",
          strokeWidth: 2.5,
          strokeOpacity: 0.8,
          label: "Trend Line"
        })
      ],
      caption: `Relationship between ${getDisplayName(currentParams.otherFactor)} and ${currentParams.qualityParam}`
    });
    element.appendChild(plot);
  };
  
  setTimeout(() => {
    const qualitySelect = document.getElementById("quality-param");
    const otherFactorSelect = document.getElementById("other-factor");
    if (qualitySelect && otherFactorSelect) {
      qualitySelect.value = currentParams.qualityParam;
      otherFactorSelect.value = currentParams.otherFactor;
      qualitySelect.addEventListener("change", () => {
        currentParams.qualityParam = qualitySelect.value;
        updateVisualization();
      });
      otherFactorSelect.addEventListener("change", () => {
        currentParams.otherFactor = otherFactorSelect.value;
        updateVisualization();
      });
      updateVisualization();
    }
  }, 300);
  
  return element;
}
