var data = [
{
    key: 'England',
    wins: 10,
    losses: 4,
    target: 5
},
{
    key: 'Scotland',
    wins: 13,
    losses: 4,
    target: 7
},
{
    key: 'Wales',
    wins: 2,
    losses: 11,
    target: 6
},
{
    key: 'Ireland',
    wins: 6,
    losses: 5,
    target: 10
}, ];

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
                bottom: 90
            });

        var x = new insight.Axis(chart, 'Country', 'h', insight.Scales.Ordinal, 'bottom')
            .tickOrientation('tb');

        var y = new insight.Axis(chart, 'Value', 'v', insight.Scales.Linear, 'left')
            .labelFormat(d3.format("0,000"));

        var series = new insight.ColumnSeries('countryColumn', chart, dataset, x, y, 'silver');

        series.series = [
        {
            name: 'value',
            accessor: function(d)
            {
                return d.wins;
            },
            label: 'Wins',
            color: '#e67e22',
            tooltipValue: function(d)
            {
                return d.wins;
            }
        },
        {
            name: 'value2',
            accessor: function(d)
            {
                return d.losses;
            },
            label: 'Losses',
            color: '#2980b9',
            tooltipValue: function(d)
            {
                return d.losses;
            }
        }];


        chart.series([series]);


        insight.drawCharts();

        $('#toggle')
            .click(function(d)
            {
                series.stacked(!series.stacked());
                chart.draw();
            });
    });
