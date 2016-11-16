document.addEventListener('DOMContentLoaded', function() {
  const w = 1220;
  const h = 660;
  const margin = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
  const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';

  function render(meteorData){
    const width = w - (margin.left + margin.right);
    const height = h - (margin.top + margin.bottom);
    const rotate = 0        // so that [-60, 0] becomes initial center of projection
    const maxlat = 83;        // clip northern and southern poles (infinite in mercator)

    var projection = d3.geo.mercator()
        .rotate([rotate,0])
        .scale(0.90)           // we'll scale up to match viewport shortly.
        .translate([width/2, height/2]);

    var scaleMass = d3.scale.sqrt()
                            .domain([0, 23000000])
                            .range([0, 30])

    // find the top left and bottom right of current projection
    function mercatorBounds(projection, maxlat) {
        var yaw = projection.rotate()[0],
            xymax = projection([-yaw+180-1e-6,-maxlat]),
            xymin = projection([-yaw-180+1e-6, maxlat]);

        return [xymin,xymax];
    }

    // set up the scale extent and initial scale for the projection
    var b = mercatorBounds(projection, maxlat),
        s = width/(b[1][0]-b[0][0]),
        scaleExtent = [s, 10*s];

    projection
        .scale(scaleExtent[0]);

    var zoom = d3.behavior.zoom()
        .scaleExtent(scaleExtent)
        .scale(projection.scale())
        .translate([0,0])               // not linked directly to projection
        .on("zoom", redraw)

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#canvas")
        .append('svg')
            .attr('width',width)
            .attr('height',height)
            .call(zoom)
            // .on("click", redraw)

    var g = svg.append("g");

    d3.json("https://raw.githubusercontent.com/cjsheets/d3-projects/master/world-110m2.json", function(topology){
       g.selectAll("path")
         .data(topojson.feature(topology, topology.objects.countries).features)
         .enter()
         .append("path")
         .attr("d", path)
         .style("fill", "D7C7AD")
         .style("stroke", "9B8C74")
        redraw();       // update path data
    });

    d3.json(url, function(meteorData){
      g.selectAll("circle")
        .data(meteorData.features)
        .enter()
        .append("circle")
        .attr("cx", function(d){
          return projection([d.properties.reclong, d.properties.reclat])[0];
        })
        .attr("cy", function(d){
          return projection([d.properties.reclong, d.properties.reclat])[1];
        })
        .attr("r", function(d){
          let radius = scaleMass(d.properties.mass);
          return radius  * (projection.scale()/250)
        })
        .style("fill", "rgb(15, 77, 39)")
        .style("opacity", "0.4")
        .style("stroke", "green")
        .style("stroke-width", "3")
        redraw();
    });



    // track last translation and scale event we processed
    var tlast = [0,0],
        slast = null;

    function redraw() {
      if (d3.event) {
        var scale = d3.event.scale,
          t = d3.event.translate;

        // if scaling changes, ignore translation (otherwise touch zooms are weird)
        if (scale != slast) {
          projection.scale(scale);
        } else {
            var dx = t[0]-tlast[0],
                dy = t[1]-tlast[1],
                yaw = projection.rotate()[0],
                tp = projection.translate();

            // use x translation to rotate based on current scale
            projection.rotate([yaw+360.*dx/width*scaleExtent[0]/scale, 0, 0]);
            // use y translation to translate projection, clamped by min/max
            var b = mercatorBounds(projection, maxlat);
            if (b[0][1] + dy > 0) dy = -b[0][1];
            else if (b[1][1] + dy < height) dy = height-b[1][1];
            projection.translate([tp[0],tp[1]+dy]);
        }
        // save last values.  resetting zoom.translate() and scale() would
        // seem equivalent but doesn't seem to work reliably?
        slast = scale;
        tlast = t;
      }

      g.selectAll('path')       // re-project path data
        .attr('d', path);

      g.selectAll("circle")
        .attr("cx", function(d) {
          return projection([d.properties.reclong, d.properties.reclat])[0];
        })
        .attr("cy", function(d) {
          return projection([d.properties.reclong, d.properties.reclat])[1];
        })
        .attr("r", function(d){
          let radius = scaleMass(d.properties.mass);
          return radius  * (projection.scale()/250)
        })
    }
  }
  render()
});
