# Interactive Data Visualization using d3.js

Not finished yet!

As part of Udacity's Data Analyst Nanodegree

By: Rakpong Kittinaradorn

Date: 31 October 2016

Link to visualization: https://bl.ocks.org/rkcosmos/raw/987e6568d4242a121736c3048dea288e/

##Summary

Budget/Tax ratio in Big cities(those generate most tax) are low comparing to poorer provinces. Overall tax and budget are increasing in most provinces. With the exception of Bangkok, budget per capita is comparable in all provinces.

##Design

The visualisation has two parts, choropleth map and line graph. The map uses color hue as visual encoding to demonstrate tax/budget distribution among provinces in Thailand. I choose map to represent this information because the viewer can easily see spatial distribution along different region of Thailand. Tax and budget are generally incresing over time, so I use line graph to illustrate this time development.

After the feedbacks, I made changes in several points as follow: 

1. Scientific notion in display into normal notation. 
2. The map is now bigger. 
3. Visulization for tax and budget per 1000 capita are added.
4. Textual description as added to convey storytelling.
5. Axis is a little bit thinner.
6. Y-axis is now starting from zero.

##Feedback

####Commenter 1:

What questions do you have about the data?: In general, is the budget increasing? Are there certain regions receiving more budget than the others?

What relationships do you notice?: I see budgets distributed broadly. The tax, however, is concentrated in the central and north regions.

Main takeaway: Budgets are increasing. Tax are quite concentrated.

Something I don't understand: The legend is displayed in scientific notation which is difficult to read. The line graph doesn't start at zero, making it difficult to compare scale.

####Commenter 2:

Overall is good. I don't have any confusion in these data. It would be nice to have comparison with country average or region average in budget/tax ratio part. The visualization that group provinces into region would also be a good addition. Scientific notion in scale should be changed into normal number. Tax and budget per capita are also meaningful and should benefit the viewers. There should be a short list that show top ten for each categories.

####Commenter 3:

Map is too small, it is hard to click on provinces. If possible, percent increase/decrease from previous year should be shown. A table showing which province get the most budget is a good addition.

####Commenter 4:

The visualization is great. Some minor suggestions:

1. Make axes lines a little bit lighter
2. Start y-axis from zero
3. Add some textual description of the visualization

##Resources

- javascript

http://learnjsdata.com/index.html

- choropleth

http://bl.ocks.org/mbostock/4060606

- textbox

http://bl.ocks.org/mbostock/1087001

http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html  

- dropdown

http://bl.ocks.org/jfreels/6734245
