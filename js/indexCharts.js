/**
 * Created by tkelly on 02/07/2014.
 */

(function()
{
    function drawColumnChart()
    {
        var data = [
        {
            key: 0,
            value: 5
        },
        {
            key: 1,
            value: 8
        }];
        var dataset = new insight.DataSet(data);
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

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Ordinal, 'left');
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear, 'bottom');

        var series = new insight.ColumnSeries('Columns', chart, dataset, xAxis, yAxis, 'black')
            .
        valueFunction(function(d)
        {
            return d.value;
        });

        chart.series([series]);
    }

    function drawLineChart()
    {
        var data = [
        {
            key: 0,
            value: 1
        },
        {
            key: 1,
            value: 4
        },
        {
            key: 2,
            value: 2
        },
        {
            key: 3,
            value: 6
        }];
        var dataset = new insight.DataSet(data);
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

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Linear, 'left');
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear, 'bottom');

        var series = new insight.LineSeries('Lines', chart, dataset, xAxis, yAxis, 'black')
            .
        valueFunction(function(d)
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
        var data = [
        {
            key: 0,
            value: 1,
            area: 1
        },
        {
            key: 1,
            value: 4,
            area: 3
        },
        {
            key: 2,
            value: 2,
            area: 4
        },
        {
            key: 3,
            value: 6,
            area: 2
        }];

        var dataset = new insight.DataSet(data);
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

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Linear, 'left');
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear, 'bottom');

        var series = new insight.BubbleSeries('Lines', chart, dataset, xAxis, yAxis, 'black')
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

    drawLineChart();
    drawColumnChart();
    drawBubbleChart();
    insight.drawCharts();

}());
