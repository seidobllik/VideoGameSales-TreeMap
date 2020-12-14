// tree map: https://www.d3indepth.com/layouts/

const DATASETS = {
  videogames: {
    TITLE: "Video Game Data",
    DESCRIPTION: "data for video games",
    URL:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
  },
  movies: {
    TITLE: "Movie Data",
    DESCRIPTION: "data for movies",
    URL:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
  },
  kickstarter: {
    TITLE: "Kickstarter Data",
    DESCRIPTION: "data for kickstarter",
    URL:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
  }
};

const urlParams = new URLSearchParams(window.location.search);
const DATASET = DATASETS[urlParams.get("data") || "videogames"];
document.getElementById("title").textContent = DATASET.TITLE;
document.getElementById("description").textContent = DATASET.DESCRIPTION;

fetch(DATASET.URL)
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("description").textContent = data.name;
    const width = 1000,
      height = 550;
    const treemapLayout = d3.treemap().size([width, height]);
    const root = d3.hierarchy(data);
    const categories = root.data.children.map((item) => item.name);
    root.sum((d) => {
      return d.value;
    });
    treemapLayout(root);

    const tooltip = d3
      .select("#diagram")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0.0);

    const svg = d3
      .select("#diagram")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const cell = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d, i) => "translate(" + d.x0 + ", " + d.y0 + ")");

    cell
      .append("rect")
      .attr("width", (d, i) => d.x1 - d.x0)
      .attr("height", (d, i) => d.y1 - d.y0)
      .attr("class", "tile")
      .attr("data-name", (d, i) => d.data.name)
      .attr("data-category", (d, i) => d.data.category)
      .attr("data-value", (d, i) => d.data.value)
      .style("fill", (d, i) => {
        const val = categories.indexOf(d.data.category) / categories.length;
        return d3.interpolateSinebow(val);
      })
      .on("mousemove", (d, i) => {
        tooltip.style("opacity", 0.9);
        tooltip.style("left", d3.event.pageX + 10 + "px");
        tooltip.style("top", d3.event.pageY - 30 + "px");
        tooltip.attr("data-value", d.data.value);
        tooltip.html(
          "Name: " +
            d.data.name +
            "<br>Category: " +
            d.data.category +
            "<br>Value: " +
            d.data.value
        );
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    cell
      .append("text")
      .selectAll("tspan")
      .data((d, i) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => 10 + i * 10)
      .text((d, i) => {
        return d;
      });

    const legend = d3
      .select("#legend-div")
      .append("svg")
      .attr("id", "legend")
      .attr("width", width / 2)
      .attr("height", height / 3);

    const legendCell = legend
      .selectAll("g")
      .data(categories)
      .enter()
      .append("g")
      .attr("transform", (d, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return "translate(" + col * 150 + ", " + row * 30 + ")";
      });

    legendCell
      .append("rect")
      .attr("class", "legend-item")
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", (d, i) => {
        const val = categories.indexOf(d) / categories.length;
        return d3.interpolateSinebow(val);
      });

    legendCell
      .append("text")
      .text((d, i) => d)
      .attr("transform", "translate(17, 12)");
  });
