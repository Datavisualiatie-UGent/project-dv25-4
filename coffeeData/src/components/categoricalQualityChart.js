import * as Plot from "npm:@observablehq/plot";

export function createCategoricalQualityChart(coffeeData) {
  const qualityParams = ["Total Cup Points", "Aroma", "Flavor", "Aftertaste", "Acidity", "Body", "Balance", "Uniformity", "Clean Cup", "Sweetness", "Overall"];
  const categoricalFactors = ["Processing Method", "Variety", "Color"];
  const defaultQualityParam = "Total Cup Points";
  const defaultCategoricalFactor = "Processing Method";
  
  let currentParams = {
    qualityParam: defaultQualityParam,
    categoricalFactor: defaultCategoricalFactor
  };
  
  const prepareData = (data) => {
    return data.filter(d => 
      d[currentParams.qualityParam] !== undefined && 
      d[currentParams.qualityParam] !== null &&
      !isNaN(Number(d[currentParams.qualityParam])) && 
      Number(d[currentParams.qualityParam]) > 0 &&
      d[currentParams.categoricalFactor] !== undefined && 
      d[currentParams.categoricalFactor] !== null
    ).map(d => ({
      ...d,
      // Convert quality parameter to number
      [currentParams.qualityParam]: Number(d[currentParams.qualityParam])
    }));
  };
  
  const element = document.createElement("div");
  element.className = "coffee-categorical-chart";
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
    
    // Group by categorical factor and calculate statistics
    const grouped = new Map();
    processedData.forEach(d => {
      const category = d[currentParams.categoricalFactor];
      if (!grouped.has(category)) {
        grouped.set(category, {
          values: [],
          mean: 0,
          count: 0
        });
      }
      grouped.get(category).values.push(d[currentParams.qualityParam]);
      grouped.get(category).count++;
    });
    
    // Calculate means and prepare data for boxplot
    const groupedData = Array.from(grouped.entries()).map(([category, stats]) => {
      const values = stats.values;
      stats.mean = values.reduce((a, b) => a + b, 0) / values.length;
      
      // Calculate median for tooltip information
      const sortedValues = [...values].sort((a, b) => a - b);
      const median = sortedValues.length % 2 === 0
        ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
        : sortedValues[Math.floor(sortedValues.length / 2)];
      
      return {
        category,
        mean: stats.mean,
        median: median,
        count: stats.count,
        values
      };
    }).sort((a, b) => b.mean - a.mean); // Sort by mean value descending
    
    // Only show top categories if there are too many
    const maxCategories = 15;
    const displayData = groupedData.length > maxCategories 
      ? groupedData.slice(0, maxCategories) 
      : groupedData;
    

   
    
    // Create the plot
    const plot = Plot.plot({
      width: element.clientWidth || 800,
      height: Math.max(400, 30 * displayData.length)*1.2,
      marginLeft: 220, // Increased left margin to avoid label overlap
      marginBottom: 70, // Increased for the legend
      marginRight: 70, // Increased right margin for sample counts
      marginTop: 40,

      y: {
        domain: displayData.map(d => d.category),
        tickPadding: 5,
        tickSize: 0,
        fontSize: 14,
        fontWeight: "bold",
        // Add custom formatter to truncate text
        tickFormat: (d) => {
          return d.length > 32 ? d.slice(0, 32) + "..." : d;
        }
      },
      x: {
        label: currentParams.qualityParam,
        grid: true,
        tickFormat: "f",
        labelOffset: 35,
        fontSize: 14,
        fontWeight: "bold",
        tickCount: 8
      },
      style: {
        fontSize: 12
      },
      marks: [
      
        
        // Enhanced boxplot without tooltip
        Plot.boxX(processedData, {
          y: d => d[currentParams.categoricalFactor],
          x: d => d[currentParams.qualityParam],
          fill: "#aa6122",
          fillOpacity: 0.7,
          stroke: "#46301e",
          strokeWidth: 2,
          zIndex: 0,
          tip: false // Remove tooltip from boxplot
        }),
        
        // Enhanced individual data points with tooltips
        Plot.dot(processedData, {
          y: d => d[currentParams.categoricalFactor],
          x: d => d[currentParams.qualityParam],
          stroke: "#46301e",
          fill: "#f0d6a3",
          strokeWidth: 1,
          r: 2,
          opacity: 0.7,
          zIndex: 0,
        }),

        // Styled mean indicator to match the boxplot aesthetic
        Plot.dot(displayData, {
          y: d => d.category,
          x: d => d.median,
          r: 5, 
          fill: "#f0d6a3", 
          stroke: "#46301e", 
          strokeWidth: 2, 
          symbol: "square", 
          zIndex: 10, 
          tip: true,
          title: d => {
            return `${d.category}\n` +
                   `Mean: ${d.mean.toFixed(2)}\n` +
                   `Median: ${d.median.toFixed(2)}\n` +
                   `Samples: ${d.count}`;
          }
        }),
      ],
      caption: `Distribution of ${currentParams.qualityParam} by ${currentParams.categoricalFactor}`
    });
    
    element.appendChild(plot);
    
    // Add tooltip functionality to truncated labels
    setTimeout(() => {
      const yAxisLabels = element.querySelectorAll('.coffee-categorical-chart > figure > svg > g:nth-child(2) text');
      
      yAxisLabels.forEach((label, index) => {
        if (index < displayData.length) {
          const fullText = displayData[index].category;
          
          // Set max-width constraint on labels
          label.setAttribute('style', 'max-width: 50px; overflow: hidden; text-overflow: ellipsis;');
          
          // Add title attribute for tooltip
          label.setAttribute('title', fullText);
          
          // Optional: Add event listeners for custom tooltip if needed
          label.addEventListener('mouseover', (e) => {
            if (fullText.length > 10) {
              const tooltip = document.createElement('div');
              tooltip.textContent = fullText;
              tooltip.style.position = 'absolute';
              tooltip.style.background = '#21160E';
              tooltip.style.padding = '5px';
              tooltip.style.border = '1px solid #c19a6b';
              tooltip.style.borderRadius = '3px';
              tooltip.style.zIndex = '1000';
              tooltip.style.left = `${e.pageX + 10}px`;
              tooltip.style.top = `${e.pageY + 10}px`;
              tooltip.classList.add('category-tooltip');
              document.body.appendChild(tooltip);
            }
          });
          
          label.addEventListener('mouseout', () => {
            const tooltips = document.querySelectorAll('.category-tooltip');
            tooltips.forEach(t => t.remove());
          });
        }
      });
    }, 100);
  };
  
  setTimeout(() => {
    const qualitySelect = document.getElementById("quality-param-cat");
    const categoricalSelect = document.getElementById("categorical-factor");
    if (qualitySelect && categoricalSelect) {
      qualitySelect.value = currentParams.qualityParam;
      categoricalSelect.value = currentParams.categoricalFactor;
      
      qualitySelect.addEventListener("change", () => {
        currentParams.qualityParam = qualitySelect.value;
        updateVisualization();
      });
      
      categoricalSelect.addEventListener("change", () => {
        currentParams.categoricalFactor = categoricalSelect.value;
        updateVisualization();
      });

      
      
      updateVisualization();
    }
  }, 300);
  
  return element;
}
