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

        var x = new insight.Axis('Country', insight.Scales.Ordinal)
            .tickLabelOrientation('tb');

        var y = new insight.Axis('Value', insight.Scales.Linear)
            .tickLabelFormat(d3.format("0,000"));


        var chart = new insight.Chart('Chart 1', "#exampleChart")
            .width(450)
            .height(400)
            .margin(
            {
                'left': 80,
                'top': 10,
                'right': 0,
                'bottom': 100
            })
            .xAxis(x)
            .yAxis(y);


        var series = new insight.ColumnSeries('countryColumn', dataset, x, y, 'silver');

        series.series = [
        {
            name: 'value',
            valueFunction: function(d)
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
            valueFunction: function(d)
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

        chart.draw();

        $('#toggle')
            .click(function(d)
            {
                series.stacked(!series.stacked());
                chart.draw();
            });
    });
