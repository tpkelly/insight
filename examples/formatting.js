$(document)
    .ready(function()
    {
        d3.json('datasets/revenuereport.json', function(data)
        {
            var dataset = new insight.DataSet(data);

            var clientData = createClientGroup(dataset);

            var revenueChart = createEmptyChart();

            var x = new insight.Axis('', insight.Scales.Ordinal)
                .tickLabelOrientation('tb');

            var y = new insight.Axis('', insight.Scales.Linear)
                .tickLabelFormat(function(tickValue)
                {
                    var thousands = (tickValue / 1000)
                        .toFixed(0);
                    return '£' + thousands + 'k';
                });

            var clientRevenues = new insight.ColumnSeries('clientColumn', clientData, x, y)
                .valueFunction(function(d)
                {
                    return d.value.CurrentRevenue.Sum;
                })
                .tooltipFormat(insight.Formatters.currencyFormatter);

            // set ColumnSeries to first color in the default series palette
            //  - workaround until ColumnSeries has sub-series removed
            clientRevenues.series[0].color = d3.functor(insight.defaultTheme.chartStyle.seriesPalette[0]);

            revenueChart.xAxis(x)
                .yAxis(y)
                .series([clientRevenues]);

            revenueChart.draw();
        });

        function createClientGroup(dataset)
        {
            return dataset.group('clients', function(d)
                {
                    return d.Client;
                })
                .sum(['CurrentRevenue'])
                .orderFunction(function(a, b)
                {
                    return b.value.CurrentRevenue.Sum - a.value.CurrentRevenue.Sum;
                });
        }

        function createEmptyChart()
        {

            var chart = new insight.Chart('Revenue', "#revenue")
                .width(500)
                .height(400)
                .margin(
                {
                    top: 10,
                    left: 130,
                    right: 45,
                    bottom: 150
                });

            return chart;
        }

    });
