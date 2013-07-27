var width = $('#map').width(),
    height = width/1.6;

var projection = d3.geo.mercator()
    .scale((width + 1) / 2 / Math.PI)
    .translate([width / 2, height / 1.5])
    .precision(.1);

var indexScale = d3.scale.linear()
indexScale.domain([0, 100]);
indexScale.range([0, 10]);

var path = d3.geo.path()
    .projection(projection);

var tooltip = d3.select("body")
  .append("div")
  .attr('id', 'tooltip')
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .text(".");

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("/json/countries.json", function(error, world) {
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
            var income = d["properties"]["Income Security Sub-Index"];
            var health = d["properties"]["Health Status Sub-Index"];
            var employment = d["properties"]["Employment and Education Sub-Index"];
            var environment = d["properties"]["Age-Friendly Environment Sub-Index"];
            var index = (income + health + employment + environment) / 4
            var remapped = Math.floor(index/10);
            return "q" + remapped + "-9";
          })
          .attr("d", path)
          .on("mouseover", function(d){ 
            tooltip.style("visibility", "visible");
            $("#tooltip").text(d["properties"]["Country"]);
          })
          .on("mousemove", function(){ return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
          .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
  });
});

