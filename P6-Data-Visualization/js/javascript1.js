    var color_step = 5;
    var years = ["2558","2557","2556","2555","2554","2553","2552","2551","2550"];
    var content_list = ["ratio","tax", "budget"];     
    var rateBytax = d3.map();
    var rateBybudget = d3.map();    
    var current_content = "ratio";
    var current_year = "2558";        
         
//////////// data in
    d3.queue()
        .defer(d3.json, "thailandWithName.json")
        .defer(d3.csv, "/data/tax2.csv", function(d) {rateBytax.set(d.CHA_NE, 
                                    {"2550":+d.tax2550, 
                                    "2551":+d.tax2551,
                                    "2552":+d.tax2552,
                                    "2553":+d.tax2553,
                                    "2554":+d.tax2554,
                                    "2555":+d.tax2555,
                                    "2556":+d.tax2556,
                                    "2557":+d.tax2557,
                                    "2558":+d.tax2558} 
        );})
                         
        .defer(d3.csv, "/data/expense2.csv", function(d) {rateBybudget.set(d.CHA_NE, 
                                    {"2550":+d.ex2550, 
                                    "2551":+d.ex2551,
                                    "2552":+d.ex2552,
                                    "2553":+d.ex2553,
                                    "2554":+d.ex2554,
                                    "2555":+d.ex2555,
                                    "2556":+d.ex2556,
                                    "2557":+d.ex2557,
                                    "2558":+d.ex2558} 
        );})
        .await(ready);
/////////// end of data in
    
    function ready(err,geo_data) { 
        if(err) console.log("error fetching data");
      
/////////// combine data
        var fin_data = {};
        fin_data["tax"] = {};
        fin_data["budget"] = {};
        fin_data["ratio"] = {};
        geo_data.features.forEach(function(d) {
            fin_data["tax"][d.properties.CHA_NE] ={};
            fin_data["budget"][d.properties.CHA_NE] ={};
            fin_data["ratio"][d.properties.CHA_NE] ={};
            
            years.forEach(function(year) {
                fin_data["tax"][d.properties.CHA_NE][year] = rateBytax.get(d.properties.CHA_NE)[year]; 
                fin_data["budget"][d.properties.CHA_NE][year] = rateBybudget.get(d.properties.CHA_NE)[year];
                fin_data["ratio"][d.properties.CHA_NE][year] = 
                    (rateBybudget.get(d.properties.CHA_NE)[year]/rateBytax.get(d.properties.CHA_NE)[year]).toFixed(3);
            });
        });

////////// end of combining data
      
/////////// map section      
        d3.select("body")
            .append("h2")
            .text("Tax and Budget Distribution");
  
        var margin = 50,
            width = 500 - margin,
            height = 450 - margin;  
    
        var projection = d3.geoMercator()
            .scale(1400)
            .translate( [-2200, height+150 ]);  
      
        var path = d3.geoPath().projection(projection); 
  
        var svg = d3.select("body")
            .append("svg")
            .attr('class', 'map')
            .attr("width", width + margin)
            .attr("height", height + margin)
            .append('g');
 
        var select_year = d3.select("body")
                .append("g")
                .attr("class", "years_dropdown")
                .append("select");
        
        var year_options = select_year
                .selectAll("option")
                .data(years)
                .enter()
                .append('option')
                .text(function(d) {return d;})
                .property('value', function(d) {return d;});
                
        select_year.on("change", function(d) {
                current_year = d3.select(this).property('value');
                updatemap(current_content,current_year ); 
                }); 
                
        var select_content = d3.select("body")
                .append("g")
                .attr("class", "content_dropdown")
                .append("select");
                
        var content_options = select_content
                .selectAll("option")
                .data(content_list)
                .enter()
                .append('option')
                .text(function(d) {return d;})
                .property('value', function(d) {return d;});
                
        select_content.on("change", function(d) {
                current_content = d3.select(this).property('value');
                updatemap(current_content,current_year); 
                }); 
    
 
        var mapText = svg.append("text")
            .attr("x",width/2)
            .attr("y",30)
            .attr("text-anchor","middle")
            .text("Tax Collection @year: ");
           
        var map = svg.selectAll('path')
            .data(geo_data.features)
            .enter()
            .append('path')
            .attr('d', path)  
            .style('stroke', 'black')
            .style('stroke-width', 0.5);  
        
        function updatemap (content ,year) {

            mapText.text(content + "@year: " + year);                   
/*
            var max = d3.max(d3.entries(fin_data[content]), function(d) {
                return d3.max(d3.values(d.value))
            });
*/
            var all_value = [];
            d3.entries(fin_data[content]).forEach(function(d) {
                all_value.push(d.value[year]);
            });    
           
            var quantize = d3.scaleQuantile()
                .domain(all_value)
                .range(d3.range(color_step).map(function(i) { return "q" + i + "-" + color_step; }));               

            map.attr("class", function(d) { return quantize(fin_data[content][d.properties.CHA_NE][year]); })
                .style("cursor", "pointer");  

            var text_div = d3.select("body").append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);
  
            map.on("mouseover", function(d) {      
                text_div.transition()        
                    .duration(500)      
                    .style("opacity", .8);       
                text_div.html(d.properties.CHA_NE + "<br/>"  + content+": "+ fin_data[content][d.properties.CHA_NE][year])  
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px"); 
                })
                .on("mousemove", function(d) {
                    text_div.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");               
                })              
                .on("mouseout", function(d) {       
                    text_div.transition()        
                        .duration(500)      
                        .style("opacity", 0);   
                });    
            
            map.on("click", function(d) {
                update_line(current_content, d.properties.CHA_NE);
            });  
        
/////////// update legion sub-section
  
            var legendWidth = 20,
                legendHeight = 20;                   
            var legend = svg.append("g").attr("class", "legend");
  
            var legendData = quantize.range()
                            .map(function(d) {
                                var inteval = quantize.invertExtent(d)
                                inteval[0] = inteval[0].toPrecision(3)
                                inteval[1] = inteval[1].toPrecision(3)
                                return inteval
                            });    
    
            legend
                .selectAll("rect")
                .data(legendData)
                .enter()
                .append("rect")
                .attr("x", 30)
                .attr("y", function(d, i) { return height - i * legendHeight - 1 * legendHeight;})
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .attr("class", function(d, i) { return quantize.range()[i];})
                .style("opacity", 1);
                                 
            legend
                .selectAll("text")
                .data(legendData)   
                .enter()
                .append("text")
                
            var text_legend = d3.select(".legend").selectAll("text")
                .attr("x", 60)
                .attr("y", function(d, i) { return height - i * legendHeight - 0.2 * legendHeight;})
                .text(function(d, i) { return legendData[i][0] + " - " +legendData[i][1]; });   
              
/////////////// End of update legion sub-section  
                  
        };
          
        updatemap(current_content , current_year)       
     
/////////////// end of map section 
       
///////////////  line chart section  
    
        var line_width = 400,
            line_height = 400;  
            line_margin = 50;    
    
        var line_svg = d3.select("body")
              .append("svg")
              .attr('class', 'lineplot')
              .attr("width", line_width + margin)
              .attr("height", line_height + margin)
              .append('g');   
                  
        var lineText = line_svg.append("text")
            .attr("x",line_width/2)
            .attr("y",30)
            .attr("text-anchor","middle")
            .text("Tax by year: ");    
    
        var time_extent = [2550,2558];
        var time_scale = d3.scaleLinear()
            .range([line_margin, line_width])
            .domain(time_extent);
        var time_axis = d3.axisBottom(time_scale).tickFormat(d3.format("d"));
 
 
    function update_line(content, province) { 
     
        lineText.text(content+ " by year: " + province);  
/*
        var line_data = [
            {year: 2550, data: fin_data[content][province][2550]},
            {year: 2551, data: fin_data[content][province][2551]},
            {year: 2552, data: fin_data[content][province][2552]},
            {year: 2553, data: fin_data[content][province][2553]},
            {year: 2554, data: fin_data[content][province][2554]},
            {year: 2555, data: fin_data[content][province][2555]},
            {year: 2556, data: fin_data[content][province][2556]},
            {year: 2557, data: fin_data[content][province][2557]},
            {year: 2558, data: fin_data[content][province][2558]}   
        ];
 */       
        var line_data = [];  
        years.forEach(function(d) {
            line_data.push({year: +d, data: +fin_data[content][province][+d]});
        });
        
    
        var count_extent = d3.extent(line_data, function(d) {
            return d["data"];
        });  
        var count_scale = d3.scaleLinear()
            .range([height, line_margin])
            .domain(count_extent);
        var count_axis = d3.axisLeft(count_scale)
            .ticks(6);
        debugger;
        d3.selectAll('.x_axis').remove();
        d3.select(".lineplot")
            .append('g')
            .attr('class', 'x_axis')
            .attr('transform', "translate(0," + line_height + ")")
            .call(time_axis);
        
        d3.selectAll('.y_axis').remove();
        d3.select(".lineplot")
            .append('g')
            .attr('class', 'y_axis')
            .attr('transform', "translate(" + line_margin + ",0)")
            .call(count_axis);

        d3.select('.lineplot')
            .selectAll("circle")
            .data(line_data)
            .enter()
            .append("circle");
   
        var circle = d3.selectAll('circle')
            .attr('cx', function(d) {
                return time_scale(d['year']);
            })
            .attr('cy', function(d) {
                return count_scale(d["data"]);
            })
            .attr('r', 5)
            .on("click", function(d) {
                    updatemap(content ,d['year']);
                })
            .attr('fill', "red"); 
               
        var valueline = d3.line()
            .x(function(d) { return time_scale(d.year); })
            .y(function(d) { return count_scale(d.data); });

        //circle.exit().remove();  
         d3.selectAll('.line').remove();
         line_svg.append("path")
                .data([line_data])
                .attr("class", "line")
                .attr("d", valueline);
          
        // textbox 
        var text_div = d3.select("body").append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);
  
            circle.on("mouseover", function(d) {      
                text_div.transition()        
                    .duration(200)      
                    .style("opacity", .8);      
                text_div.html(province + " "+d.year + "<br/>"  +content+": "+ d.data)  
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px"); 
                })
                .on("mousemove", function(d) {
                    text_div.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");               
                })              
                .on("mouseout", function(d) {       
                    text_div.transition()        
                        .duration(500)      
                        .style("opacity", 0);   
            });
            
        }; 
    
        update_line(current_content, "Bangkok");
/////////////  end of line chart section    
    }; 
/////////////  end of ready function
