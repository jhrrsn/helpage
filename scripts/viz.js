var width = $('#map').width(),
    height = width/1.6;

var incomeWeight = 0.25;
var healthWeight = 0.25;
var employmentWeight = 0.25;
var environmentWeight = 0.25;

var projection = d3.geo.equirectangular()
    .scale((width) / 1.7 / Math.PI)
    .translate([width / 2, height / 2])
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
    .attr("viewBox", "0 0 "+width+" "+height);


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
        .attr("data-index-score", function(d) {
            var incomeScore = d["properties"]["Income Security Sub-Index"];
            var healthScore = d["properties"]["Health Status Sub-Index"];
            var employmentScore = d["properties"]["Employment and Education Sub-Index"];
            var environmentScore = d["properties"]["Age-Friendly Environment Sub-Index"];
            return (incomeScore+healthScore+employmentScore+environmentScore)/4; })
        .attr("d", path)
        .on("mouseover", function(d){ 
          tooltip.style("visibility", "visible");
          $("#tooltip").text("Calculated Global Rating: "+String(Math.round(100*$(this).attr('data-index-score'))/100));
        })
        .on("mousemove", function(){ return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
}

function styleCountries(inWeight, heWeight, emWeight, enWeight) {
  var indexScale = d3.scale.linear()
      .domain([20, 100])
      .range([0, 10])
      .clamp(true);
  $(".country").each(function(index) {
    var income = $(this).attr("data-income");
    var health = $(this).attr("data-health");
    var employment = $(this).attr("data-employment");
    var environment = $(this).attr("data-environment");
    var index = (income*inWeight + health*heWeight + employment*emWeight + environment*enWeight);
    var remapped = Math.floor(indexScale(index));
    var viz_class = "q" + remapped + "-9 country";
    $(this).attr('class', viz_class);
    $(this).attr('data-index-score', index);
    
  });
}


$(function() {
  $( ".income" ).slider({
    value: 25,
    min: 0,
    max: 100,
    change: function(event,ui){ 
      $('#incomeVal').text($(".income").slider('value'));
      if (event.originalEvent) {
        var currentValue = incomeWeight;
        var newValue = $(this).slider('value')/100;
        incomeWeight = newValue;
        change = currentValue - newValue;
        healthWeight += change/3;
        employmentWeight += change/3;
        environmentWeight += change/3;
        $('.environment').slider('value', Math.ceil(environmentWeight*100));
        $('.health').slider('value', Math.ceil(healthWeight*100));
        $('.employment').slider('value', Math.ceil(employmentWeight*100));
        styleCountries(incomeWeight, healthWeight, employmentWeight, environmentWeight);
      }
    }
  });
  $( ".health" ).slider({
    value: 25,
    min: 0,
    max: 100,
    change: function(event,ui){ 
      $('#healthVal').text($(".health").slider('value'));
      if (event.originalEvent) {
        var currentValue = healthWeight;
        var newValue = $(this).slider('value')/100;
        healthWeight = newValue;
        change = currentValue - newValue;
        incomeWeight += change/3;
        employmentWeight += change/3;
        environmentWeight += change/3;
        $('.environment').slider('value', Math.ceil(environmentWeight*100));
        $('.income').slider('value', Math.ceil(incomeWeight*100));
        $('.employment').slider('value', Math.ceil(employmentWeight*100));
        styleCountries(incomeWeight, healthWeight, employmentWeight, environmentWeight);
      }
    }
  });
  $( ".employment" ).slider({
    value: 25,
    min: 0,
    max: 100,
    change: function(event,ui){ 
      $('#employmentVal').text($(".employment").slider('value'));
      if (event.originalEvent) {
        var currentValue = employmentWeight;
        var newValue = $(this).slider('value')/100;
        employmentWeight = newValue;
        change = currentValue - newValue;
        healthWeight += change/3;
        incomeWeight += change/3;
        environmentWeight += change/3;
        $('.environment').slider('value', Math.ceil(environmentWeight*100));
        $('.health').slider('value', Math.ceil(healthWeight*100));
        $('.income').slider('value', Math.ceil(incomeWeight*100));
        styleCountries(incomeWeight, healthWeight, employmentWeight, environmentWeight);
      }
    }
  });
  $( ".environment" ).slider({
    value: 25,
    min: 0,
    max: 100,
    change: function(event,ui){
      $('#environmentVal').text($(".environment").slider('value'));
      if (event.originalEvent) {    
        var currentValue = environmentWeight;
        var newValue = $(this).slider('value')/100;
        environmentWeight = newValue;
        change = currentValue - newValue;
        healthWeight += change/3;
        employmentWeight += change/3;
        incomeWeight += change/3;
        $('.income').slider('value', Math.ceil(incomeWeight*100));
        $('.health').slider('value', Math.ceil(healthWeight*100));
        $('.employment').slider('value', Math.ceil(employmentWeight*100));
        styleCountries(incomeWeight, healthWeight, employmentWeight, environmentWeight);
      }
    }
  });
});