import * as Plot from "npm:@observablehq/plot";

export function createQualityChart(coffeeData) {
  const qualityParams = ["Total Cup Points", "Aroma", "Flavor", "Aftertaste", "Acidity", "Body", "Balance", "Uniformity", "Clean Cup", "Sweetness", "Overall"];
  const otherFactors = ["Altitude", "Number of Bags", "Bag Weight", "Moisture Percentage", "Category One Defects", "Quakers", "Category Two Defects"];
  const defaultQualityParam = "Total Cup Points";
  const defaultOtherFactor = "Altitude";
  
  const prepareData = (coffeeData) => {
    return coffeeData.map(d => {
      const result = { countryOfOrigin: d["Country of Origin"] };
      qualityParams.forEach(param => {
        result[param] = parseFloat(d[param]) || 0;
      });
      if (d["Altitude"]) {
        const altStr = d["Altitude"].toString();
        if (altStr.includes("-")) {
          const [min, max] = altStr.split("-").map(v => parseFloat(v.trim()));
          result["Altitude"] = (min + max) / 2; 
        } else {
          result["Altitude"] = parseFloat(altStr) || 0;
        }
      } else {
        result["Altitude"] = 0;
      }
      result["Number of Bags"] = parseFloat(d["Number of Bags"]) || 0;
      if (d["Bag Weight"]) {
        const bagWeight = d["Bag Weight"].toString();
        const match = bagWeight.match(/(\d+)/);
        result["Bag Weight"] = match ? parseFloat(match[1]) : 0;
      } else {
        result["Bag Weight"] = 0;
      }
      result["Moisture Percentage"] = parseFloat(d["Moisture Percentage"]) || 0;
      result["Category One Defects"] = parseFloat(d["Category One Defects"]) || 0;
      result["Quakers"] = parseFloat(d["Quakers"]) || 0;
      result["Category Two Defects"] = parseFloat(d["Category Two Defects"]) || 0;
      return result;
    }).filter(d => !isNaN(d["Total Cup Points"]) && d["Total Cup Points"] > 0);
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
        fontWeight: "bold"
      },
      y: {
        label: currentParams.qualityParam,
        grid: true,
        tickFormat: "d",
        labelOffset: 45,
        fontSize: 14,
        fontWeight: "bold"
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
          title: d => `${currentParams.qualityParam}: ${d[currentParams.qualityParam]}\n${currentParams.otherFactor}: ${d[currentParams.otherFactor]}\nCountry: ${d.countryOfOrigin}`
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
