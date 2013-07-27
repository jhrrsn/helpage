var width = $('#map').width(),
    height = width/1.6;

var incomeWeight = 1;
var healthWeight = 1;
var employmentWeight = 1;
var environmentWeight = 1;

var projection = d3.geo.mercator()
    .scale((width + 1) / 2 / Math.PI)
    .translate([width / 2, height / 1.5])
    .precision(.1);

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
    drawMap(world);
    styleCountries(incomeWeight, healthWeight, employmentWeight, environmentWeight);
  });
});

function drawMap(world){
  svg.append("g")
        .attr("class", "index")
      .selectAll("path")
        .data(topojson.feature(world, world.objects.helpageindex).features)
      .enter().append("path")
        .attr("class", "country")
        .attr("data-income", function(d) { return d["properties"]["Income Security Sub-Index"]; })
        .attr("data-health", function(d) { return d["properties"]["Health Status Sub-Index"]; })
        .attr("data-employment", function(d) { return d["properties"]["Employment and Education Sub-Index"]; })
        .attr("data-environment", function(d) { return d["properties"]["Age-Friendly Environment Sub-Index"]; })
        .attr("d", path)
        .on("mouseover", function(d){ 
          tooltip.style("visibility", "visible");
          $("#tooltip").text(d["properties"]["Country"]);
        })
        .on("mousemove", function(){ return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
}

function styleCountries(inWeight, heWeight, emWeight, enWeight) {
  var indexScale = d3.scale.linear()
      .domain([0, 100])
      .range([0, 10]);
  $(".country").each(function(index) {
    var income = $(this).attr("data-income");
    var health = $(this).attr("data-health");
    var employment = $(this).attr("data-employment");
    var environment = $(this).attr("data-environment");
    var index = (income*inWeight + health*heWeight + employment*emWeight + environment*enWeight) / 4;
    var remapped = Math.floor(indexScale(index));
    var viz_class = "q" + remapped + "-9 country";
    $(this).attr('class', viz_class);
  });
}

$(function() {
  $( ".income" ).slider({
    value: 100,
    min: 0,
    max: 100,
    change: function(){ 
      var currentValue = incomeWeight;
      var newValue = $(this).slider('value')/100;
      incomeWeight = newValue;
      change = currentValue - newValue;
      healthWeight += change/3;
      employmentWeight += change/3;
      environmentWeight += change/3;
      styleCountries(incomeWeight, healthWeight, employmentWeight, environmentWeight);
    }
  });
  $( ".health" ).slider({
    value: 100,
    min: 0,
    max: 100,
    change: function(){ 
      var currentValue = healthWeight;
      var newValue = $(this).slider('value')/100;
      healthWeight = newValue;
      change = currentValue - newValue;
      incomeWeight += change/3;
      employmentWeight += change/3;
      environmentWeight += change/3;
      styleCountries(incomeWeight, healthWeight, employmentWeight, environmentWeight);
    }
  });
  $( ".employment" ).slider({
    value: 100,
    min: 0,
    max: 100,
    change: function(){ 
      var currentValue = employmentWeight;
      var newValue = $(this).slider('value')/100;
      employmentWeight = newValue;
      change = currentValue - newValue;
      healthWeight += change/3;
      incomeWeight += change/3;
      environmentWeight += change/3;
      styleCountries(incomeWeight, healthWeight, employmentWeight, environmentWeight);
    }
  });
  $( ".environment" ).slider({
    value: 100,
    min: 0,
    max: 100,
    change: function(){ 
      var currentValue = environmentWeight;
      var newValue = $(this).slider('value')/100;
      environmentWeight = newValue;
      change = currentValue - newValue;
      healthWeight += change/3;
      employmentWeight += change/3;
      incomeWeight += change/3;
      styleCountries(incomeWeight, healthWeight, employmentWeight, environmentWeight);
    }
  });
});