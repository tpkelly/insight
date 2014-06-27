var data = [
{
    key: 'England',
    value: 53012456,
    value2: 1023131
},
{
    key: 'Scotland',
    value: 5295000,
    value2: 5675655
},
{
    key: 'Wales',
    value: 3063456,
    value2: 2342342
},
{
    key: 'Northern Ireland',
    value: 1810863,
    value2: 1231444
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
                top: 100,
                left: 150,
                right: 40,
                bottom: 0
            });

        var y = new insight.Scale(chart, '', 'v', Scales.Ordinal);
        var x = new insight.Scale(chart, 'Population', 'h', Scales.Linear);

        var series = new insight.RowSeries('countryColumn', chart, dataset, x, y, 'silver')
            .tooltipFormat(InsightFormatters.numberFormatter);


        series.series = [
        {
            name: 'value',
            accessor: function(d)
            {
                return d.value;
            },
            label: 'Value',
            color: '#e67e22',
            tooltipValue: function(d)
            {
                return d.value;
            }
        },
        {
            name: 'value2',
            accessor: function(d)
            {
                return d.value2;
            },
            label: 'Value 2',
            color: '#2980b9',
            tooltipValue: function(d)
            {
                return d.value2;
            }
        }];

        chart.series([series]);

        var xAxis = new insight.Axis(chart, "x", x, 'top')
            .textAnchor('end')
            .tickSize(5)
            .tickPadding(0)
            .labelOrientation('tb');

        var yAxis = new insight.Axis(chart, "y", y, 'left');

        insight.drawCharts();

        $('#toggle')
            .click(function(d)
            {
                series.stacked(!series.stacked());
                chart.draw();
            });
    });
