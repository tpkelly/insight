var data = [
{
    key: 'England',
    value: 53012456,
    target: 64012456
},
{
    key: 'Scotland',
    value: 5295000,
    target: 13195000
},
{
    key: 'Wales',
    value: 3063456,
    target: 43076456
},
{
    key: 'Northern Ireland',
    value: 1810863,
    target: 9012456
}];

$(document)
    .ready(function()
    {
        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Chart 1', "#exampleChart")
            .width(450)
            .height(400)
            .margin(
            {
                top: 10,
                left: 150,
                right: 40,
                bottom: 120
            });

        var x = new insight.Scale(chart, '', 'h', Scales.Ordinal);
        var y = new insight.Scale(chart, 'Population', 'v', Scales.Linear);

        var series = new insight.ColumnSeries('countryColumn', chart, dataset, x, y, 'silver')
            .valueFunction(function(d)
            {
                return d.value;
            });


        var targets = new insight.MarkerSeries('targets', chart, dataset, x, y, '#333')
            .valueFunction(function(d)
            {
                return d.target;
            })
            .widthFactor(0.3);

        chart.series([series, targets]);

        var xAxis = new insight.Axis(chart, "x", x, 'bottom')
            .labelOrientation('tb')
            .labelRotation(45)
            .tickSize(5)
            .gridlines(4);

        var yAxis = new insight.Axis(chart, "y", y, 'left')
            .labelFormat(d3.format("0,000"));

        insight.drawCharts();
    });
