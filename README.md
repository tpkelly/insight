InsightJS [![Travis Results](https://travis-ci.org/ScottLogic/insight.svg?branch=master)](https://travis-ci.org/ScottLogic/insight)
=======

InsightJS is a JavaScript data aggregation and visualization library that allows you to quickly load and find patterns in datasets.  Given a data set, InsightJS can group the records across the dimensions of the data to quickly aggregate and provide statistics on the data.

### Version 1.0.1 (11-Aug-2014)

* Adds Charts with zoomable axes, gridlines and legends.
* Adds Chart groups to show filtering of data across multiple charts.
* Adds Line, Bar/Column, Marker, Scatter and Bubble series.
* Adds Tooltips when hovering over datapoints.
* Adds Tables with filtering and sorting.
* Adds Analysis tools including data grouping and dimensional analysis.
* Fix issue with cross filtering on Bubble series

### Getting Started

Using InsightJS requires the following libraries:
- [d3.js](https://github.com/mbostock/d3)
- [crossfilter](https://github.com/square/crossfilter/)

Include the required libraries and InsightJS. Include an optional stylesheet theme, or create your own.


Load a dataset and start analyzing and creating charts!

```
<link rel="stylesheet" href="insight.min.css">

<script src='crossfilter.js'></script>
<script src='d3.js'></script>
<script type='text/javascript' src='//cdnjs.cloudflare.com/ajax/libs/insightjs/0.1.1/insight.min.js'></script>
```

```javascript
d3.json('appstore.json', function(data)
  {
    var dataset = new insight.DataSet(data);
    
    var country = dataset.group('genre', function(d)
    {
        return d.primaryGenreName;
    }).mean(['price'];
    
    var chart = new insight.Chart('AppGenres', '#chart')
        .width(400)
        .height(350)
        .title('Genres')
        .autoMargin(true);

    var x = new insight.Axis('Genre', insight.Scales.Ordinal)
             .tickOrientation('tb');

    var y = new insight.Axis('#Apps', insight.Scales.Linear);
    
    chart.yAxis(y)
    chart.xAxis(x);

    var columns = new insight.ColumnSeries('columns', dataset, x, y, '#3498db')
                             .valueFunction(function(d){
                                    return d.value.Count;
                                });
    chart.series([columns]);
    
    chart.draw();
});

```
### Information

- View some examples at [InsightJS](http://scottlogic.github.io/insight/)
- Find out more at our [Wiki Page](https://github.com/ScottLogic/insight/wiki)
- Ask us questions in our [Google Group](https://groups.google.com/forum/#!forum/insightjs/)

### License
InsightJS is licensed under the [MIT License](http://opensource.org/licenses/MIT)
