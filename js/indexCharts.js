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

        var series = new insight.ColumnSeries('Columns', chart, dataset, xAxis, yAxis, 'silver')
            .
        valueFunction(function(d)
        {
            return d.value;
        });

        chart.series([series]);
        insight.drawCharts();
    }

    drawColumnChart();

}());
