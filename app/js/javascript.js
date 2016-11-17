//Inspired by various blogs from http://bl.ocks.org/
document.addEventListener('DOMContentLoaded', function() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const margin = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
  const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';

  function render(meteorData){
    let toolTip = d3.select("#canvas")
                    .append("div")
                    .classed("toolTip", true)
                    .style("opacity", 0)

    const width = w - (margin.left + margin.right);
    const height = h - (margin.top + margin.bottom);
    const rotate = 0;
    const maxlat = 83;

    const projection = d3.geo.mercator()
        .rotate([rotate,0])
        .scale(0.90)
        .translate([width/2, height/2 + 100]);

    const scaleMass = d3.scale.sqrt()
                            .domain([0, 24000000])
                            .range([0, 50])

    function mercatorBounds(projection, maxlat) {
        var yaw = projection.rotate()[0],
            xymax = projection([-yaw+180-1e-6,-maxlat]),
            xymin = projection([-yaw-180+1e-6, maxlat]);

        return [xymin,xymax];
    }

    const b = mercatorBounds(projection, maxlat),
        s = width/(b[1][0]-b[0][0]),
        scaleExtent = [s, 10*s];

    projection
        .scale(scaleExtent[0]);

    const linearColorScale = d3.scale.linear()
                                    .domain([0, 1000])
                                    .range(["green", "red"])

    const zoom = d3.behavior.zoom()
        .scaleExtent(scaleExtent)
        .scale(projection.scale())
        .translate([0,0])
        .on("zoom", redraw)

    const path = d3.geo.path()
        .projection(projection);

    const svg = d3.select("#canvas")
        .append('svg')
            .attr('width',width)
            .attr('height',height)
            .call(zoom)

    const g = svg.append("g");

    d3.json("https://raw.githubusercontent.com/cjsheets/d3-projects/master/world-110m2.json", function(topology){
       g.selectAll("path")
         .data(topojson.feature(topology, topology.objects.countries).features)
         .enter()
         .append("path")
         .attr("d", path)
         .style("fill", "D7C7AD")
         .style("stroke", "9B8C74")
        redraw();
    });

    d3.json(url, function(meteorData){
      g.selectAll("circle")
        .data(meteorData.features)
        .enter()
        .append("circle")
        .on("mouseover", (d,i) =>{
          let text = toolTipText(d.properties);
          toolTip.transition()
                  .style("opacity", 0.9)
          toolTip.html(text)
                  .style("left", (d3.event.pageX ) + "px")
                  .style("top", (d3.event.pageY ) + "px" )
        })
        .on("mouseout", (d,i) => {
          toolTip.transition()
                  .style("opacity", 0)
        })
        .attr("cx", d => projection([d.properties.reclong, d.properties.reclat])[0])
        .attr("cy", d => projection([d.properties.reclong, d.properties.reclat])[1])
        .attr("r", (d) => {
          let radius = scaleMass(d.properties.mass);
          return radius  * (projection.scale()/250)
        })
        .style("fill", (d,i) =>(linearColorScale(i)) )
        .style("stroke", "black")
        .style("stroke-width", "2")
        redraw();
    });



    var tlast = [0,0],
        slast = null;

    function redraw() {
      if (d3.event) {
        let scale = d3.event.scale,
          t = d3.event.translate;

        if (scale != slast) {
          projection.scale(scale);
        } else {
            let dx = t[0]-tlast[0],
                dy = t[1]-tlast[1],
                yaw = projection.rotate()[0],
                tp = projection.translate();
            projection.rotate([yaw+360.*dx/width*scaleExtent[0]/scale, 0, 0]);
            let b = mercatorBounds(projection, maxlat);
            if (b[0][1] + dy > 0) dy = -b[0][1];
            else if (b[1][1] + dy < height) dy = height-b[1][1];
            projection.translate([tp[0],tp[1]+dy]);
        }
        slast = scale;
        tlast = t;
      }

      g.selectAll('path')
        .attr('d', path);

      g.selectAll("circle")
        .attr("cx", d => projection([d.properties.reclong, d.properties.reclat])[0])
        .attr("cy", d => projection([d.properties.reclong, d.properties.reclat])[1])
        .attr("r", (d) => {
          let radius = scaleMass(d.properties.mass);
          return radius  * (projection.scale()/250)
        })
    }

    function toolTipText(d){
      let text = `<strong> Name: ${d.name} </strong> <br>`
      text += `Mass: ${d.mass} G <br>`
      text += `Class: ${d.recclass} <br>`
      text += `Fall: ${d.fall} <br>`
      text += `Year: ${d.year} <br>`
      return text
    }
  }
  render() //Start rendering!
});
