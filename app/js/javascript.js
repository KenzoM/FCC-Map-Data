$( document ).ready(function(){
  const w = 960;
  const h = 500;
  const margin = {
    top: 50,
    bottom: 90,
    left: 100,
    right: 30
  }

  function render(data){
    console.log(data)
    const width = w - (margin.left + margin.right);
    const height = h - (margin.top + margin.bottom);

    //lets create new object to add degree key and its value

    const canvas = d3.select("#canvas")
                  .append("svg")
                  .attr("width", w)
                  .attr("height", h)
    d3.json("../geo-location/custom.geo.json", function(data){
      let group = canvas.selectAll("g")
          .data(data.features)
          .enter()
          .append("g")

    let projection = d3.geoMercator();
    let path = d3.geoPath().projection(projection);

    let areas = group.append("path")
        .attr("d", path)
        .attr("class", "area")
        .attr("fill", "steelblue")

    });
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
      render(data)
    },
    fail: () =>{
    },
    error: () =>{

    }
  });
});
