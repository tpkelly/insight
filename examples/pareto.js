$(document)
    .ready(function()
    {
        d3.json('datasets/revenuereport.json', function(data)
        {
            var dataset = new insight.DataSet(data);

            var clientData = dataset.group('clients', function(d)
                {
                    return d.Client;
                })
                .sum(['CurrentRevenue'])
                .cumulative(['CurrentRevenue.Sum'])
                .orderFunction(function(a, b)
                {
                    return b.value.CurrentRevenue.Sum - a.value.CurrentRevenue.Sum;
                });


            computeGroupValues(clientData);

            var chart = new insight.Chart('Chart 1', "#chart1")
                .width(500)
                .height(400)
                .margin(
                {
                    top: 10,
                    left: 130,
                    right: 45,
                    bottom: 150
                });

            var x = new insight.Axis('Client', insight.Scales.Ordinal, 'bottom')
                .textAnchor('start')
                .tickOrientation('tb')
                .ordered(true);

            var y = new insight.Axis('', insight.Scales.Linear)
                .labelFormat(insight.Formatters.currencyFormatter);

            var y2 = new insight.Axis('', insight.Scales.Linear)
                .labelFormat(insight.Formatters.percentageFormatter)
                .reversedPosition(true);

            chart.xAxis(x)
                .yAxes([y, y2]);

            var series = new insight.ColumnSeries('clientColumn', clientData, x, y, '#e74c3c')
                .valueFunction(function(d)
                {
                    return d.value.CurrentRevenue.Sum;
                })
                .tooltipFormat(insight.Formatters.currencyFormatter);

            var line = new insight.LineSeries('percentLine', clientData, x, y2, 'cyan')
                .tooltipFormat(insight.Formatters.percentageFormatter)
                .valueFunction(function(d)
                {
                    return d.value.Percentage;
                });

            chart.series([series, line]);

            chart.draw();
        });
    });


function computeGroupValues(group)
{
    var aggregateFunction = function(grouping)
    {
        var total = 0;

        grouping.getData()
            .forEach(function(d)
            {
                total += d.value.CurrentRevenue.Sum;
            });
        grouping.getData()
            .forEach(function(d)
            {
                d.value.Percentage = d.value.CurrentRevenue.SumCumulative / total;
            });
    };

    group.postAggregation(aggregateFunction);
}
