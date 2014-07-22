var data = [
{
    key: 'England',
    value: 53012456
},
{
    key: 'Scotland',
    value: 5295000
},
{
    key: 'Wales',
    value: 3063456
},
{
    key: 'Northern Ireland',
    value: 1810863
}];

$(document)
    .ready(function()
    {
        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Chart 1', '#exampleChart')
            .width(450)
            .height(400)
            .margin(
            {
                top: 10,
                left: 150,
                right: 40,
                bottom: 120
            });

        var x = new insight.Axis('Country', insight.Scales.Ordinal)
            .tickOrientation('tb');

        var y = new insight.Axis('Population', insight.Scales.Linear)
            .tickSize(5)
            .labelFormat(d3.format('0,000'));

        chart.addXAxis(x);
        chart.addYAxis(y);

        var series = new insight.ColumnSeries('countryColumn', dataset, x, y, '#aae')
            .valueFunction(function(d)
            {
                return d.value;
            })
            .tooltipFormat(InsightFormatters.currencyFormatter);

        chart.series([series]);

        insight.drawCharts();
    });
