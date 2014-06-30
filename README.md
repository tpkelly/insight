InsightJS
=======

InsightJS is a JavaScript data aggregation and visualization library that allows you to quickly load and find patterns in datasets.  Given a data set, InsightJS can group the records across the dimensions of the data to quickly aggregate and provide statistics on the data.

### Getting Started

InsightJS requires the following libraries:
- [d3.js](https://github.com/mbostock/d3)
- [d3-tip.js](https://github.com/Caged/d3-tip)
- [crossfilter](https://github.com/square/crossfilter/)

Include the required libraries and InsightJS. Include an optional stylesheet theme, or create your own.

Load a dataset and start analyzing and creating charts!

```
<script src="lib/crossfilter.js"></script>
<script src="lib/d3.js"></script>
<script src="lib/d3.tip.js"></script>
<script type="text/javascript" src="./dist/insight.min.js"></script>
```

```javascript
d3.json("appstore.json", function(data)
  {
    var dataset = new insight.DataSet(data);
    
    var country = dataset.group("genre", function(d)
    {
        return d.Country;
    }).mean(['price'];
    
    var chart = new insight.Chart("AppGenres", "#chart")
        .width(400)
        .height(350)
        .title("Genres")
        .autoMargin(true);
        
    var columns = chart.addColumnSeries(
    {
        name: "AveragePrice",
        data: genre,
        accessor: function(d)
        {
            return d.value.price.Average;
        },
        color: "#ACC3EE"
    });
    
    insight.drawCharts();
});

```
### Information

- View some examples at [InsightJS](http://scottlogic.github.io/insight/)
- Find out more at our [Wiki Page](https://github.com/ScottLogic/insight/wiki)
- Ask us questions in our [Google Group](https://groups.google.com/forum/#!forum/insightjs/)

### License
InsightJS is licensed under the [MIT License](http://opensource.org/licenses/MIT)
