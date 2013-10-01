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

function to2dp(decimal) {
  return Math.round(decimal*100)/100;
}

function to1dp(decimal) {
  return Math.round(decimal*10)/10;
}

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
            var income = d["properties"]["Income Security Sub-Index"];
            var health = d["properties"]["Health Status Sub-Index"];
            var employment = d["properties"]["Employment and Education Sub-Index"];
            var environment = d["properties"]["Age-Friendly Environment Sub-Index"];
            return (to2dp(Math.pow(income,incomeWeight) * Math.pow(health,healthWeight) * Math.pow(employment,employmentWeight) * Math.pow(environment,environmentWeight)))})
        .attr("d", path)
        .on("mouseover", function(d){
          var rank = getRank($(this).attr('data-index-score'));
          tooltip.style("visibility", "visible");
          $("#tooltip-rank").text(String(rank));
          $("#tooltip-value").text(String((to1dp($(this).attr('data-index-score'))).toFixed(1)));
          $("#tooltip-country").text($(this).attr('data-country'));
        })

        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
}


$( document ).on( "mousemove", function( event ) {
  event = event || window.event;
  if (event.pageX > width/2) {
    return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX-250)+"px");
  }
  else {
    return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
  }
});

function styleCountries(inWeight, heWeight, emWeight, enWeight) {
  var indexScale = d3.scale.linear()
      .domain([20, 100])
      .range([0, 9])
      .clamp(true);
  $(".country").each(function(index) {
    var income = $(this).attr("data-income");
    var health = $(this).attr("data-health");
    var employment = $(this).attr("data-employment");
    var environment = $(this).attr("data-environment");
    var index = to2dp(Math.pow(income,inWeight) * Math.pow(health,heWeight) * Math.pow(employment,emWeight) * Math.pow(environment,enWeight));
    var remapped = Math.floor(indexScale(index));
    var viz_class = "q" + remapped + "-9 country";
    $(this).attr('class', viz_class);
    $(this).attr('data-index-score', index);
  });
}

function getRank(value) {
  var indexValues = [];
  $(".country").each(function(index) {
    var calculatedIndex = $(this).attr('data-index-score');
    indexValues.push(parseFloat(calculatedIndex));  
  });
  indexValues.sort(function(a,b){return b-a});
  return indexValues.indexOf(parseFloat(value))+1;
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

        var healthChange, employmentChange, environmentChange;
        var otherSlidersSum = healthWeight + employmentWeight + environmentWeight;

        // Calculate size proportion amongst the three other values:
        if (otherSlidersSum > 0.1) {
          healthChange = healthWeight / otherSlidersSum;
          employmentChange = employmentWeight / otherSlidersSum;
          environmentChange = environmentWeight / otherSlidersSum;
        } else {
          healthChange = 0.33;
          employmentChange = 0.33;
          environmentChange = 0.33;
        }

        // Adjust the other values based on their proportion:
        healthWeight += change * healthChange;
        employmentWeight += change * employmentChange;
        environmentWeight += change * environmentChange;

        // Round the weights to 2 d.p.
        incomeWeight = to2dp(incomeWeight);
        healthWeight = to2dp(healthWeight);
        employmentWeight = to2dp(employmentWeight);
        environmentWeight = to2dp(environmentWeight);

        var healthSlider = Math.floor(healthWeight*100);
        var employmentSlider = Math.floor(employmentWeight*100);
        var environmentSlider = Math.floor(environmentWeight*100);
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

        var incomeChange, employmentChange, environmentChange;
        var otherSlidersSum = incomeWeight + employmentWeight + environmentWeight;

        if (otherSlidersSum > 0.1) {
          incomeChange = incomeWeight / otherSlidersSum;
          employmentChange = employmentWeight / otherSlidersSum;
          environmentChange = environmentWeight / otherSlidersSum;
        } else {
          incomeChange = 0.33;
          employmentChange = 0.33;
          environmentChange = 0.33;
        }

        incomeWeight += change * incomeChange;
        employmentWeight += change * employmentChange;
        environmentWeight += change * environmentChange;

        incomeWeight = to2dp(incomeWeight);
        healthWeight = to2dp(healthWeight);
        employmentWeight = to2dp(employmentWeight);
        environmentWeight = to2dp(environmentWeight);

        var incomeSlider = Math.floor(incomeWeight*100);
        var employmentSlider = Math.floor(employmentWeight*100);
        var environmentSlider = Math.floor(environmentWeight*100);
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

        var incomeChange, healthChange, environmentChange;
        var otherSlidersSum = incomeWeight + healthWeight + environmentWeight;

        if (otherSlidersSum > 0.1) {
          incomeChange = incomeWeight / otherSlidersSum;
          healthChange = healthWeight / otherSlidersSum;
          environmentChange = environmentWeight / otherSlidersSum;
        } else {
          incomeChange = 0.33;
          healthChange = 0.33;
          environmentChange = 0.33;
        }

        incomeWeight += change * incomeChange;
        healthWeight += change * healthChange;
        environmentWeight += change * environmentChange;

        incomeWeight = to2dp(incomeWeight);
        healthWeight = to2dp(healthWeight);
        employmentWeight = to2dp(employmentWeight);
        environmentWeight = to2dp(environmentWeight);

        var incomeSlider = Math.floor(incomeWeight*100);
        var healthSlider = Math.floor(healthWeight*100);
        var environmentSlider = Math.floor(environmentWeight*100);
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
        
        var incomeChange, healthChange, employmentChange;
        var otherSlidersSum = incomeWeight + healthWeight + employmentWeight;

        if (otherSlidersSum > 0.1) {
          incomeChange = incomeWeight / otherSlidersSum;
          healthChange = healthWeight / otherSlidersSum;
          employmentChange = employmentWeight / otherSlidersSum;
        } else {
          incomeChange = 0.33;
          healthChange = 0.33;
          employmentChange = 0.33;
        }

        incomeWeight += change * incomeChange;
        healthWeight += change * healthChange;
        employmentWeight += change * employmentChange;

        incomeWeight = to2dp(incomeWeight);
        healthWeight = to2dp(healthWeight);
        employmentWeight = to2dp(employmentWeight);
        environmentWeight = to2dp(environmentWeight);

        var incomeSlider = Math.floor(incomeWeight*100);
        var healthSlider = Math.floor(healthWeight*100);
        var employmentSlider = Math.floor(employmentWeight*100);
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
