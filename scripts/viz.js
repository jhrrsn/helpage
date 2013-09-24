var width = $('#map').width(),
    height = width/1.6;

var incomeWeight = 0.25;
var healthWeight = 0.25;
var employmentWeight = 0.25;
var environmentWeight = 0.25;

var projection = d3.geo.mercator()
    .scale((width + 1) / 2 / Math.PI)
    .translate([width / 2, (height / 2) + (height/8)])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var tooltip = d3.select("#tooltip");

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
        .attr("data-country", function(d) { return d["properties"]["Country"]; })
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
          $("#tooltip-value").text(String((Math.round(100*$(this).attr('data-index-score'))/100).toFixed(1)));
          $("#tooltip-country").text($(this).attr('data-country'));
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
    var index = (Math.pow(income,inWeight) * Math.pow(health,heWeight) * Math.pow(employment,emWeight) * Math.pow(environment,enWeight));
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
        
        var healthSlider = Math.ceil(healthWeight*100);
        var employmentSlider = Math.ceil(employmentWeight*100);
        var environmentSlider = Math.ceil(environmentWeight*100);
        var sliderSum = $(this).slider('value') + healthSlider + employmentSlider + environmentSlider;
        
        if (sliderSum > 100) {
          healthSlider -= sliderSum-100;
          healthWeight = healthSlider/100;
        } 
        else if (sliderSum < 100) {
          healthSlider += 100-sliderSum;
          healthWeight = healthSlider/100;
        }

        $('.health').slider('value', healthSlider);
        $('.employment').slider('value', employmentSlider);
        $('.environment').slider('value', environmentSlider);

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
        
        var incomeSlider = Math.ceil(incomeWeight*100);
        var employmentSlider = Math.ceil(employmentWeight*100);
        var environmentSlider = Math.ceil(environmentWeight*100);
        var sliderSum = $(this).slider('value') + incomeSlider + employmentSlider + environmentSlider;
        
        if (sliderSum > 100) {
          employmentSlider -= sliderSum-100;
          employmentWeight = employmentSlider/100;
        } 
        else if (sliderSum < 100) {
          employmentSlider += 100-sliderSum;
          employmentWeight = employmentSlider/100;
        }

        $('.income').slider('value', incomeSlider);
        $('.employment').slider('value', employmentSlider);
        $('.environment').slider('value', environmentSlider);

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

        var incomeSlider = Math.ceil(incomeWeight*100);
        var healthSlider = Math.ceil(healthWeight*100);
        var environmentSlider = Math.ceil(environmentWeight*100);
        var sliderSum = $(this).slider('value') + healthSlider + incomeSlider + environmentSlider;
        
        if (sliderSum > 100) {
          environmentSlider -= sliderSum-100;
          environmentWeight = environmentSlider/100;
        } 
        else if (sliderSum < 100) {
          environmentSlider += 100-sliderSum;
          environmentWeight = environmentSlider/100;
        }

        $('.income').slider('value', incomeSlider);
        $('.health').slider('value', healthSlider);
        $('.environment').slider('value', environmentSlider);

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

        var incomeSlider = Math.ceil(incomeWeight*100);
        var healthSlider = Math.ceil(healthWeight*100);
        var employmentSlider = Math.ceil(employmentWeight*100);
        var sliderSum = $(this).slider('value') + incomeSlider + healthSlider + employmentSlider;
        
        if (sliderSum > 100) {
          incomeSlider -= sliderSum-100;
          incomeWeight = incomeSlider/100;
        } 
        else if (sliderSum < 100) {
          incomeSlider += 100-sliderSum;
          incomeWeight = incomeSlider/100;
        }

        $('.income').slider('value', incomeSlider);
        $('.health').slider('value', healthSlider);
        $('.employment').slider('value', employmentSlider);

        styleCountries(incomeWeight, healthWeight, employmentWeight, environmentWeight);
      }
    }
  });
});
