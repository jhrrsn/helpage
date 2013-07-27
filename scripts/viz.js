var width = $('#map').width(),
    height = 960;

var projection = d3.geo.mercator()
    .scale((width + 1) / 2 / Math.PI)
    .translate([width / 2, height / 2])
    .precision(.1);

var indexScale = d3.scale.linear()
indexScale.domain([0, 100]);
indexScale.range([0, 10]);


var path = d3.geo.path()
    .projection(projection);

var graticule = d3.geo.graticule();

var svg = d3.select("#map").append("svg")
    .attr("width", width);

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

d3.json("/json/countriestopo.json", function(error, world) {
  svg.append("g")
        .attr("class", "countries")
      .selectAll("path")
        .data(topojson.feature(world, world.objects.countries).features)
      .enter().append("path")
      .attr("d", path);
  d3.json("/json/helpagetopo.json", function(error, world) {
    svg.append("g")
          .attr("class", "index")
        .selectAll("path")
          .data(topojson.feature(world, world.objects.helpageindex).features)
        .enter().append("path")
          .attr("class", function(d) {
            var index = d["properties"]["Overall Index"];
            var remapped = Math.floor(index/10);
            return "q" + remapped + "-9";
          })
          .attr("d", path);
  });
});

d3.select(self.frameElement).style("height", height + "px");