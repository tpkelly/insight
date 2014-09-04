InsightJS [![Travis Results](https://travis-ci.org/ScottLogic/insight.svg?branch=master)](https://travis-ci.org/ScottLogic/insight)
=======

InsightJS is a JavaScript data aggregation and visualization library that allows you to quickly load and find patterns in datasets.  Given a data set, InsightJS can group the records across the dimensions of the data to quickly aggregate and provide statistics on the data.

### Version 1.1.0 (05-Sep-2014)

* Adds theming to charts and tables. By default this uses the LightTheme.
* Removes the concept of sub-series from Column and Row series. Instead, multiple bars should be represented by multiple series.
* Introduces the “Correlation Coefficient” calculator, as “insight.correlation”.
* Adjusted sorting for ColumnSeries and RowSeries. If the key-axis is ordered, all series will be sorted in ascending order, except;
  * RowSeries - sorts such that the longest bar is at the top.
  * ColumnSeries - sorts such that the longest bar is on the left.

* Renames methods to more meaningful names
  * Axis.ordered => Axis.isOrdered
  * Axis.reversedPosition => Axis.hasReversedPosition
  * Axis.showGridlines => Axis.shouldShowGridlines
  * Axis.horizontal => Axis.isHorizontal
  * Axis.display => Axis.shouldDisplay
  * Axis.tickOrientation => Axis.tickLabelOrientation
  * Axis.tickRotation => Axis.tickLabelRotation
  * Axis.labelFormat => Axis.tickLabelFormat
  * Axis.color => Axis.lineColor
  * Chart.zoomable => Chart.setInteractiveAxis
  * LineSeries.showPoints => LineSeries.shouldShowPoints

* Fixes issue with Chart titles not displaying correctly.
* Fixes issue with margins being too small when using auto margin.
* Fixes issue where tables are not redrawn after cross filter is applied.

### Getting Started

Using InsightJS requires the following libraries:
- [d3.js](https://github.com/mbostock/d3)
- [crossfilter](https://github.com/square/crossfilter/)

Include the required libraries and InsightJS.


Load a dataset and start analyzing and creating charts!

```
<link rel="stylesheet" href="insight.min.css">

<script src='crossfilter.js'></script>
<script src='d3.js'></script>
<script type='text/javascript' src='//cdnjs.cloudflare.com/ajax/libs/insightjs/1.0.1/insight.min.js'></script>
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
