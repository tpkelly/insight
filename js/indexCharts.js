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
        var chart = new insight.Chart('Columnchart', '#column-chart');

        var xAxis = new insight.Scale(chart, '', 'h', Scales.Linear);
        var yAxis = new insight.Scale(chart, '', 'v', Scales.Linear);

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
