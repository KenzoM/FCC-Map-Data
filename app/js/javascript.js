$( document ).ready(function(){
  const w = 1300;
  const h = 600;
  const margin = {
    top: 50,
    bottom: 90,
    left: 100,
    right: 30
  }

  function title(){
    const mainTitle = document.createElement("div");
    mainTitle.innerHTML = "Title Needed"
    mainTitle.className = "title";

    const year = document.createElement("div");
    year.innerHTML = "1753 - 2015";
    year.className = "year";

    const description = document.createElement("div")
    description.innerHTML = 'Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average.<br>' +
                    'Estimated Jan 1951-Dec 1980 absolute temperature ℃: 8.66 +/- 0.07';
    description.className = "description"

    let chart = document.getElementById("canvas")

    chart.appendChild(mainTitle)
    chart.appendChild(year)
    chart.appendChild(description)


  }
  function render(base, rawData){
    let toolTip = d3.select("#canvas")
                    .append("div")
                    .classed("toolTip",true)
                    .style("opacity",0)

    const colors = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4",
                "#e6f598", "#ffffbf", "#fee08b", "#fdae61",
                "#f46d43", "#d53e4f", "#9e0142"];

    const width = w - (margin.left + margin.right);
    const height = h - (margin.top + margin.bottom);
    const yOffset = 40;

    //lets create new object to add degree key and its value
    data = rawData.map( oneData  => {
      let degree = base + oneData.variance
      return Object.assign({}, oneData, {degree: degree})
    })


    const svg = d3.select("#canvas")
                  .append("svg")
                  .attr("id","chart")
                  .attr("width", w)
                  .attr("height", h)

    const chart = svg.append("g")
                    .classed("display", true)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const yearParser = d3.timeParse("%Y")
    const monthParser = d3.timeParse("%m")

    const x = d3.scaleTime()
                .domain(d3.extent(data,function(d){
                  let year = yearParser(d.year)
                  return year
                }))
                .range([0,width]);

    const y = d3.scaleTime()
                .domain([monthParser(data[0].month),monthParser(data[11].month)])
                .range([0,height-yOffset])

    const xAxis = d3.axisBottom(x)
                    .tickFormat(d3.timeFormat("%Y")).tickSize(9)

    const yAxis = d3.axisLeft(y)
                    .tickFormat(d3.timeFormat("%B")).tickSize(0).tickPadding(6);

    const colorScale = d3.scaleQuantile()
                          .domain(d3.extent(data,function(d){
                            return d.degree
                          }))
                          .range(colors)

    function toolTipText(d){
      const rawMonth = monthParser(d.month);
      const monthFormat = d3.timeFormat("%B");

      const month = monthFormat(rawMonth)
      let text = '<strong>' + month + " " + d.year + '</strong>'+ '<br>';
      text +=  d.degree.toFixed(3) +' °C'+ '<br>';
      text += 'Variance: '+d.variance +' °C'+ '<br>';
      return text
    }
    //credit: Mark from stackoverflow. Thanks for the help
    function drawLegend(){
      const legend = this.select(".x.axis").append("g").classed("legend", true)
      const legW = 30;

    legend.selectAll('rect')
      .data(colorScale.range())
      .enter()
      .append('rect')
      .attr('width', legW)
      .attr('x', function(d,i){
        return (i + 28) * legW;
      })
      .attr('y', 50)
      .attr('height', 20)
        .style('fill', function(d){
         return d;
    });

    legend.selectAll('text')
      //[0].concat is use to add '0' label for legend
      .data([0].concat(colorScale.quantiles()))
      .enter()
      .append('text')
      .attr('x', function(d,i){
       return (i + 28) * legW;
      })
      .attr('y', 85)
      .text(function(d,i){
          let value = Math.round(d*10)/10;
          return  value;
      })
      .attr("dx",13)
      .style('fill', 'black')
      .style('stroke', 'none')
      .style("font-size",15);
     }

    function drawAxis(params){
      //draw xAxis
      this.append("g")
          .call(params.axis.x)
          .classed("x axis", true)
          .attr("transform", "translate(0,"+ height +")")
          .selectAll("text")
            .style("font-size",20)

      //draw yAxis
      this.append("g")
          .call(params.axis.y)
          .classed("y axis",true)
          .attr("transform","translate(0,0)")
            .selectAll("text")
            .attr("dy",25)
            .style("font-size",16)

      //label x axis
      this.select(".x.axis")
          .append("text")
          .classed("x axis-label",true)
          .attr("transform","translate(-60,"+ -height/2 +") rotate(-90)")
          .style("fill","black")
          .text("Months")

      this.select(".y.axis")
          .append("text")
          .classed("y axis-label",true)
          .attr("transform","translate("+ width/2 +","+ (height+60) +")")
          .style("fill","black")
          .text("Years")
    }

    function plot(params){
      if (params.initialize){
        drawAxis.call(this,params)
      }
      //enter()
      this.selectAll(".degree")
        .data(params.data)
        .enter()
          .append("rect")
          .classed("degree", true)

      //update
      this.selectAll(".degree")
        .transition()
        .delay(100)
        .attr("x",function(d,i){
          let year = yearParser(d.year)
          return x(year)
        })
      this.selectAll(".degree")
        .attr("y",function(d,i){
          let month = monthParser(d.month)
          return y(month)
        })
      this.selectAll(".degree")
        .attr("width", 4)
      this.selectAll(".degree")
        .attr("height", yOffset)
      this.selectAll(".degree")
        .style("fill", function(d,i){
          return colorScale(d.degree)
        })
      .on("mouseover",function(d,i){
        let text = toolTipText(d)
        toolTip.transition()
              .style("opacity",.9)
        toolTip.html(text)
              .style("left", (d3.event.pageX + 15) + "px")
              .style("top", (d3.event.pageY - 28) + "px")

        d3.select(this)
          .style("stroke","gray")
          .style("stroke-width", 3)
      })
      .on("mouseout",function(d,i){
        toolTip.transition()
          .style("opacity",0)
        d3.select(this)
          .style("stroke","none")
      })

      //exit()
      this.selectAll(".degree")
        .data(params.data)
        .exit()
        .remove()

        drawLegend.call(this);
    }

    plot.call(chart,{
      base: base,
      data: data,
      axis: {
        x: xAxis,
        y: yAxis
      },
      initialize: true
    })

  }
  const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';
  $.ajax({
    type: "GET",
    dataType: "json",
    url: url,
    beforeSend: ()=> {
    },
    complete: () =>{
    },
    success: data =>{
    },
    fail: () =>{
    },
    error: () =>{

    }
  });
});
