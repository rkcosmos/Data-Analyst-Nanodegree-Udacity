    var color_step = 5;
    var years = ["2015","2014","2013","2012","2011","2010","2009","2008","2007"];
    var content_list = ["budget/tax ratio","tax","tax per 1000 capita", "budget", "budget per 1000 capita"];     
    var rateBytax = d3.map();
    var rateBybudget = d3.map(); 
    var rateBypopulation = d3.map();    
    var current_content = "budget/tax ratio";
    var current_year = "2015";        
    
//////////// data in
    d3.queue()
        .defer(d3.json, "/data/thailandWithName.json")
        .defer(d3.csv, "/data/tax2.csv", function(d) {rateBytax.set(d.CHA_NE, 
                                    {"2007":+d.tax2007, 
                                    "2008":+d.tax2008,
                                    "2009":+d.tax2009,
                                    "2010":+d.tax2010,
                                    "2011":+d.tax2011,
                                    "2012":+d.tax2012,
                                    "2013":+d.tax2013,
                                    "2014":+d.tax2014,
                                    "2015":+d.tax2015} 
        );})               
        .defer(d3.csv, "/data/expense2.csv", function(d) {rateBybudget.set(d.CHA_NE, 
                                    {"2007":+d.ex2007, 
                                    "2008":+d.ex2008,
                                    "2009":+d.ex2009,
                                    "2010":+d.ex2010,
                                    "2011":+d.ex2011,
                                    "2012":+d.ex2012,
                                    "2013":+d.ex2013,
                                    "2014":+d.ex2014,
                                    "2015":+d.ex2015}  
        );})
        .defer(d3.csv, "/data/population.csv", function(d) {rateBypopulation.set(d.CHA_NE, d.population);})
        .await(ready);
/////////// end of data in
    
    function ready(err,geo_data) { 
        if(err) console.log("error fetching data");
      
/////////// combine data
        var fin_data = {};
        fin_data["tax"] = {};
        fin_data["tax per 1000 capita"] = {};
        fin_data["budget"] = {};
        fin_data["budget per 1000 capita"] = {};
        fin_data["budget/tax ratio"] = {};
        geo_data.features.forEach(function(d) {
            fin_data["tax"][d.properties.CHA_NE] ={};
            fin_data["tax per 1000 capita"][d.properties.CHA_NE] ={};
            fin_data["budget"][d.properties.CHA_NE] ={};
            fin_data["budget per 1000 capita"][d.properties.CHA_NE] ={};
            fin_data["budget/tax ratio"][d.properties.CHA_NE] ={};
            
            years.forEach(function(year) {
                fin_data["tax"][d.properties.CHA_NE][year] = rateBytax.get(d.properties.CHA_NE)[year]; 
                fin_data["tax per 1000 capita"][d.properties.CHA_NE][year] = 
                    (rateBytax.get(d.properties.CHA_NE)[year]/rateBypopulation.get(d.properties.CHA_NE)*1000).toFixed(3);
                fin_data["budget"][d.properties.CHA_NE][year] = rateBybudget.get(d.properties.CHA_NE)[year];
                fin_data["budget per 1000 capita"][d.properties.CHA_NE][year] = 
                    (rateBybudget.get(d.properties.CHA_NE)[year]/rateBypopulation.get(d.properties.CHA_NE)*1000).toFixed(3);
                fin_data["budget/tax ratio"][d.properties.CHA_NE][year] = 
                    (rateBybudget.get(d.properties.CHA_NE)[year]/rateBytax.get(d.properties.CHA_NE)[year]).toFixed(3);  
            });
        });

////////// end of combining data
      
        d3.select("body")
            .append("h2")
            .text("Tax/Budget Ratio Distribution Among Provinces in Thailand");
                  
        d3.select("body")
            .append("h4")
            .text("Tax and budget units are in million baht. Data from: www.bb.go.th, www.rd.go.th, en.wikipedia.org/wiki/Provinces_of_Thailand");      
        /*
        var table_section = d3.select('body').append('div').attr('class', 'table');
        
        var table_high = table_section.append('table'),
		    thead_high = table_high.append('thead'),
		    tbody_high = table_high.append('tbody');
        */   
/////////// map section   
        var margin = 50,
            width = 500 - margin,
            height = 450 - margin;  
    
        var projection = d3.geoMercator()
            .scale(1500)
            .translate( [-2330, height+190 ]);  
      
        var path = d3.geoPath().projection(projection); 
  
        var svg = d3.select("body")
            .append("svg")
            .attr('class', 'map')
            .attr("width", width + margin)
            .attr("height", height + margin)
            .append('g');
 
        var select_year = d3.select("body")
                .append("div")
                .attr("class", "years_dropdown")
                .html("year: ")
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
                .append("div")
                .attr("class", "content_dropdown")
                .html("content: ")
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

            mapText.text(content + " @year: " + year);                   

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
                                inteval[0] = parseFloat(inteval[0].toPrecision(3))
                                inteval[1] = parseFloat(inteval[1].toPrecision(3))
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
                  
/////////////// Table Section                  
	       /* 
	        // The table generation function
            function tabulate(data, columns) {
                var table = d3.select("body").append("table")
                    .attr("style", "margin-left: 250px"),
                thead = table.append("thead"),
                tbody = table.append("tbody");

            // append the header row
                thead.append("tr")
                    .selectAll("th")
                    .data(columns)
                    .enter()
                    .append("th")
                    .text(function(column) { return column; });

            // create a row for each object in the data
                var rows = tbody.selectAll("tr")
                    .data(data)
                    .enter()
                    .append("tr");

            // create a cell in each row for each column
                var cells = rows.selectAll("td")
                    .data(function(row) {
                        return columns.map(function(column) {
                            return {column: column, value: row[column]};
                        });
                    })
                    .enter()
                    .append("td")
                    .attr("style", "font-family: Courier") // sets the font style
                        .html(function(d) { return d.value; });
    
                return table;
            }
	        
	        var columns = ["province", content];
	        
	        
	        //fin_data["budget/tax ratio"][province][year]
	        
	        
            var table_data =  [
                { "province" : "1", content : 45 },
                { "province" : "2", content : 50 },
	            { "province" : "3", content : 55 },
	            { "province" : "4", content : 50 },
	            { "province" : "5", content : 45 }
            ];
	        
	        var table1 = tabulate(table_data, ["province", content])
	            .attr('class', 'table');
	       */        
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
    
        var time_extent = [2007,2015];
        var time_scale = d3.scaleLinear()
            .range([line_margin, line_width])
            .domain(time_extent);
        var time_axis = d3.axisBottom(time_scale).tickFormat(d3.format("d"));
 
    function update_line(content, province) { 
     
        lineText.text(content+ ": " + province);  
  
        var line_data = [];  
        years.forEach(function(d) {
            line_data.push({year: +d, data: +fin_data[content][province][+d]});
        });    
    
        var count_extent = d3.extent(line_data, function(d) {
            return d["data"];
        });  
        var count_scale = d3.scaleLinear()
            .range([line_height, line_margin])
            .domain(count_extent);
        var count_axis = d3.axisLeft(count_scale)
            .ticks(6);
  
        d3.selectAll('.x_axis').remove();
        d3.select(".lineplot")
            .append('g')
            .attr('class', 'x_axis')
            .attr('transform', "translate(0," + line_height + ")")
            .call(time_axis);
            
        line_svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ line_width/2 +","+(line_height+40)+")")  // centre below axis
            .text("Year");
        
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
// ?table? http://bl.ocks.org/d3noob/473f0cf66196a008cf99
