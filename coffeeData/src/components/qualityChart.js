import * as Plot from "npm:@observablehq/plot";

export function createQualityChart(coffeeData) {
  const qualityParams = ["Total Cup Points", "Aroma", "Flavor", "Aftertaste", "Acidity", "Body", "Balance", "Uniformity", "Clean Cup", "Sweetness", "Overall"];
  const otherFactors = ["Altitude", "Number of Bags", "Bag Weight", "Moisture Percentage", "Category One Defects", "Quakers", "Category Two Defects"];
  const defaultQualityParam = "Total Cup Points";
  const defaultOtherFactor = "Altitude";
  
  const prepareData = (data) => {
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
    const plot = Plot.plot({
      width: element.clientWidth || 800,
      height: (element.clientWidth || 800) * 0.6,
      margin: 60,
      x: {
        label: currentParams.otherFactor,
        grid: true,
        labelOffset: 35,
        fontSize: 14,
        fontWeight: "bold",
        type: "linear", 
        tickCount: 8   
      },
      y: {
        label: currentParams.qualityParam,
        grid: true,
        tickFormat: "d",
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
          title: d => `${currentParams.qualityParam}: ${d[currentParams.qualityParam]}\n${currentParams.otherFactor}: ${d[currentParams.otherFactor]}\nCountry: ${d["Country of Origin"]}`
        }),
        Plot.linearRegressionY(processedData, {
          x: d => d[currentParams.otherFactor],
          y: d => d[currentParams.qualityParam],
          stroke: "#c19a6b",
          strokeWidth: 2.5,
          strokeOpacity: 0.8,
          label: "Trend Line"
        })
      ],
      caption: `Relationship between ${currentParams.otherFactor} and ${currentParams.qualityParam}`
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
