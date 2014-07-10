/**
 * Created by tkelly on 02/07/2014.
 */

(function()
{
    var areaData = [
    {
        key: 0,
        value: 1,
        area: 1,
        columnKey: 0
    },
    {
        key: 1,
        value: 4,
        area: 3,
        columnKey: 1
    },
    {
        key: 2,
        value: 2,
        area: 4,
        columnKey: 0
    },
    {
        key: 3,
        value: 6,
        area: 2,
        columnKey: 1
    },
    {
        key: 4,
        value: 8,
        area: 2,
        columnKey: 0
    },
    {
        key: 6,
        value: 7,
        area: 3,
        columnKey: 1
    },
    {
        key: 7,
        value: 11,
        area: 1,
        columnKey: 0
    }];

    var columnData = [
    {
        key: 0,
        value: 5,
        target: 8
    },
    {
        key: 1,
        value: 8,
        target: 9
    }];

    function drawColumnChart()
    {
        var dataset = new insight.DataSet(columnData);
        var chart = new insight.Chart('Columnchart', '#column-chart')
            .width(200)
            .height(200)
            .margin(
            {
                top: 20,
                left: 20,
                right: 20,
                bottom: 20
            });

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Ordinal, 'left')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear, 'bottom')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });

        var series = new insight.ColumnSeries('Columns', chart, dataset, xAxis, yAxis, '#bbe')
            .valueFunction(function(d)
            {
                return d.value;
            });

        chart.series([series]);
    }

    function drawLineChart()
    {
        var dataset = new insight.DataSet(areaData);
        var chart = new insight.Chart('LineChart', '#line-chart')
            .width(200)
            .height(200)
            .margin(
            {
                top: 20,
                left: 20,
                right: 20,
                bottom: 20
            });

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Ordinal, 'left')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear, 'bottom')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });

        var series = new insight.LineSeries('Lines', chart, dataset, xAxis, yAxis, '#bbe')
            .valueFunction(function(d)
            {
                return d.value;
            })
            .keyFunction(function(d)
            {
                return d.key;
            });

        chart.series([series]);
    }

    function drawBubbleChart()
    {
        var dataset = new insight.DataSet(areaData);
        var chart = new insight.Chart('BubbleSeries', '#bubble-chart')
            .width(200)
            .height(200)
            .margin(
            {
                top: 20,
                left: 20,
                right: 20,
                bottom: 20
            });

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Ordinal, 'left')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear, 'bottom')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });

        var series = new insight.BubbleSeries('Bubbles', chart, dataset, xAxis, yAxis, '#bbe')
            .yFunction(function(d)
            {
                return d.value;
            })
            .xFunction(function(d)
            {
                return d.key;
            })
            .radiusFunction(function(d)
            {
                return Math.sqrt(d.area);
            })
            .valueFunction(function(d)
            {
                return d.area;
            });
        chart.series([series]);
    }

    function drawCorrelationChart()
    {
        // Bubbles
        var dataset = new insight.DataSet(areaData);
        var chart = new insight.Chart('CorrelationChart', '#correlation')
            .width(200)
            .height(200)
            .margin(
            {
                top: 20,
                left: 20,
                right: 20,
                bottom: 20
            });

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Linear, 'left')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear, 'bottom')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });

        var bubbleSeries = new insight.ScatterSeries('Points', chart, dataset, xAxis, yAxis, '#bbe')
            .yFunction(function(d)
            {
                return d.value;
            })
            .xFunction(function(d)
            {
                return d.key;
            })
            .pointOpacity(1)
            .tooltipFunction(function(d)
            {
                return '(' + d.key + ', ' + d.value + ')';
            });

        // Line of best fit
        var bestFitData = [
        {
            key: -0.5,
            value: 1
        },
        {
            key: 7.5,
            value: 11
        }];

        var bestFitDataset = new insight.DataSet(bestFitData);
        var bestFitLine = new insight.LineSeries('BestFit', chart, bestFitDataset, xAxis, yAxis, '#888');

        chart.series([bubbleSeries, bestFitLine]);
    }

    function drawMarkerChart()
    {
        var dataset = new insight.DataSet(columnData);
        var chart = new insight.Chart('MarkerChart', '#targets')
            .width(200)
            .height(200)
            .margin(
            {
                top: 20,
                left: 20,
                right: 20,
                bottom: 20
            });

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Ordinal, 'left')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear, 'bottom')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });

        var columnSeries = new insight.ColumnSeries('Columns', chart, dataset, xAxis, yAxis, '#bbe')
            .valueFunction(function(d)
            {
                return d.value;
            });

        var targetSeries = new insight.MarkerSeries('Targets', chart, dataset, xAxis, yAxis, '#888')
            .valueFunction(function(d)
            {
                return d.target;
            })
            .widthFactor(0.3);

        chart.series([columnSeries, targetSeries]);
    }

    function drawLinkedChart()
    {
        //Add the linker chart
        var dataset = new insight.DataSet(columnData);
        var chart = new insight.Chart('LinkedColumns', '#drill-down')
            .width(200)
            .height(100)
            .margin(
            {
                top: 20,
                left: 20,
                right: 20,
                bottom: 20
            });

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Ordinal, 'left')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear, 'bottom')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });

        var series = new insight.ColumnSeries('Columns', chart, dataset, xAxis, yAxis, '#bbe')
            .valueFunction(function(d)
            {
                return d.value;
            });

        chart.series([series]);

        //Add the linked chart
        var linedataset = new insight.DataSet(areaData);
        var linechart = new insight.Chart('LineChart', '#drill-down')
            .width(200)
            .height(100)
            .margin(
            {
                top: 20,
                left: 20,
                right: 20,
                bottom: 20
            });

        var xAxisLine = new insight.Axis(chart, '', 'h', insight.Scales.Ordinal, 'left')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });
        var yAxisLine = new insight.Axis(chart, '', 'v', insight.Scales.Linear, 'bottom')
            .tickSize(0)
            .labelFormat(function(d)
            {
                return '';
            });

        var lineSeries = new insight.LineSeries('Lines', linechart, linedataset, xAxisLine, yAxisLine, '#bbe')
            .valueFunction(function(d)
            {
                return d.value;
            })
            .keyFunction(function(d)
            {
                return d.key;
            });

        linechart.series([lineSeries]);
    }

    insight.init();
    drawLineChart();
    drawColumnChart();
    drawBubbleChart();
    drawCorrelationChart();
    drawMarkerChart();
    drawLinkedChart();
    insight.drawCharts();

}());
