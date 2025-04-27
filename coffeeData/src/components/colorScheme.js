import * as d3 from "npm:d3";

// Extended color palette
export const extendedColorPalette = [
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

export function createColorScale(countryOptions) {
  // Create a global colorScale that multiple components will use
  const colorScale = d3.scaleOrdinal(extendedColorPalette).domain(countryOptions);
  
  // Create radar chart color scheme
  const radarColorScheme = {
    domain: countryOptions,
    range: countryOptions.map((country) => colorScale(country)),
  };
  
  function styleCountryCheckboxes() {
    console.log("Applying checkbox styling");
    
    document.querySelectorAll(".controls label").forEach((label) => {
      const country = label.textContent.trim();
      const c = colorScale(country);
      const input = label.querySelector("input");
      
      const isChecked = input.checked 
      
      if (isChecked) {
        if (!input.checked && country === countryOptions[0]) {
          input.checked = true;
        }
        
        label.style.borderColor = c;
        label.classList.add('checked');
        
        const col = d3.color(c);
        col.opacity = 0.15;
        label.style.backgroundColor = col.formatRgb();
      } else {
        label.style.borderColor = 'grey';
        label.classList.remove('checked');
        label.style.backgroundColor = 'transparent';
      }
      
      input.style.accentColor = c;
    });
  }

  return { colorScale, radarColorScheme, styleCountryCheckboxes };
}
