import * as d3 from "npm:d3";

export default function createGlobalMap(coffeeData, world, Generators) {
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

  const countryCounts = {};
  
  coffeeData.forEach((d) => {
    const country = d["Country of Origin"];
    if (country && countryCoordinates[country]) {
      countryCounts[country] ??= {
        count: 0,
      };
      
      countryCounts[country].count += 1;
    }
  });

  const coffeePoints = Object.entries(countryCounts).map(([country, data]) => {
    return {
      country: country,
      coordinates: countryCoordinates[country],
      count: data.count,
    };
  });

  const counts = coffeePoints.map((d) => d.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  const getColorForCount = (count) => {
    const t = Math.sqrt((count - minCount) / (maxCount - minCount));
    return d3.interpolate("#ffe4b5", "#d2691e")(t);
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

  return { worldView, world_point, coffeePoints, getColorForCount };
}
