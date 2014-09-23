InsightJS [![Travis Results](https://travis-ci.org/ScottLogic/insight.svg?branch=master)](https://travis-ci.org/ScottLogic/insight)
=======

InsightJS is a JavaScript data aggregation and visualization library that allows you to quickly load and find patterns in datasets.  Given a data set, InsightJS can group the records across the dimensions of the data to quickly aggregate and provide statistics on the data.

### Version 1.1.1-Hotfix (23-Sep-2014)

* Fixed issue with chart highlighting in IE 11.

### Version 1.1.1 (18-Sep-2014)

* Library changes
  * Sets default currency of currency formatter to USD.
  * Merges common functionality in ScatterSeries and BubbleSeries into a common PointSeries.
  * Deprecated “ScatterSeries.pointRadius”. Use “ScatterSeries.radiusFunction” instead.
  * ChartGroup.filterByGrouping: allows a given grouping to be filtered by a given value.
  * ChartGroup.clearFilters: allows all previously applied filters to be removed.

* Issues fixed
  * Horizontal axis tick labels were not anchored at the middle by default.
  * Chart titles were not within the chart SVG bounds.
  * Points were hidden when plotting multiple line series on a single chart.
  * Calculated charts margins were too large or too small.
  * Axis tick marks were obscured in bottom/right axis orientation.
  * There were too many ticks appearing on small charts.
  * Points on a scatter series were not transitioning when drawn.
  * Axis line width and color were not being displayed as they were set.

### Getting Started

Using InsightJS requires the following libraries:
- [d3.js](https://github.com/mbostock/d3)
- [crossfilter](https://github.com/square/crossfilter/)

Include the required libraries and InsightJS.


Load a dataset and start analyzing and creating charts!

```
<link rel="stylesheet" href="insight.min.css">

<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/crossfilter/1.3.7/crossfilter.min.js"></script>
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/d3/3.4.11/d3.min.js"></script>
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/insightjs/1.1.1/insight.min.js"></script>
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
    
    chart.xAxis(x);
    chart.yAxis(y);

    var columns = new insight.ColumnSeries('columns', dataset, x, y)
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
