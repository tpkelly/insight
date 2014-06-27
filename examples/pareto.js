$(document)
    .ready(function()
    {
        d3.json('revenuereport.json', function(data)
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

            var x = new insight.Scale(chart, 'Client', 'h', Scales.Ordinal)
                .ordered(true);

            var y = new insight.Scale(chart, 'Revenue', 'v', Scales.Linear);
            var y2 = new insight.Scale(chart, '%', 'v', Scales.Linear);

            var series = new insight.ColumnSeries('clientColumn', chart, clientData, x, y); //.tooltipFormat(InsightFormatters.currencyFormatter);

            var line = new insight.LineSeries('percentLine', chart, clientData, x, y2, 'cyan')
                .tooltipFormat(InsightFormatters.percentageFormatter)
                .valueFunction(function(d)
                {
                    return d.value.Percentage;
                });

            series.series = [
            {
                name: 'value',
                accessor: function(d)
                {
                    return d.value.CurrentRevenue.Sum;
                },
                color: '#e74c3c',
                tooltipValue: function(d)
                {
                    return InsightFormatters.currencyFormatter(d.value.CurrentRevenue.Sum);
                }
            }];


            chart.series([series, line]);

            var xAxis = new insight.Axis(chart, "x", x, 'bottom')
                .textAnchor('start')
                .labelOrientation('tb');

            var yAxis = new insight.Axis(chart, "y", y, 'left')
                .labelFormat(InsightFormatters.currencyFormatter);

            var yAxis2 = new insight.Axis(chart, "y2", y2, 'right')
                .labelFormat(InsightFormatters.percentageFormatter);

            insight.drawCharts();
        });
    });


function computeGroupValues(group)
{
    var aggregateFunction = function()
    {

        var self = this;
        var total = 0;

        this.getData()
            .forEach(function(d)
            {
                total += d.value.CurrentRevenue.Sum;
            });
        this.getData()
            .forEach(function(d)
            {
                d.value.Percentage = d.value.CurrentRevenue.SumCumulative / total;
            });

    }.bind(group);

    group.computeFunction(aggregateFunction);
    group.recalculate();
}
