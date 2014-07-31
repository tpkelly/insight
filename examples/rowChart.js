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

        var x = new insight.Axis('Population', insight.Scales.Linear)
            .tickSize(5)
            .tickOrientation('tb')
            .tickRotation('45');

        var y = new insight.Axis('', insight.Scales.Ordinal);


        var chart = new insight.Chart('Chart 1', '#exampleChart')
            .width(450)
            .height(400)
            .margin(
            {
                top: 0,
                left: 150,
                right: 40,
                bottom: 100
            })
            .xAxis(x)
            .yAxis(y);

        var series = new insight.RowSeries('countryColumn', dataset, x, y, 'silver')
            .tooltipFormat(insight.Formatters.numberFormatter);

        series.series = [
        {
            name: 'value',
            valueFunction: function(d)
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
            valueFunction: function(d)
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

        chart.draw();

        $('#toggle')
            .click(function(d)
            {
                series.stacked(!series.stacked());
                chart.draw();
            });
    });
