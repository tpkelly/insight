$(document)
    .ready(function()
    {
        d3.json('datasets/revenuereport.json', function(data)
        {
            var dataset = new insight.DataSet(data);

            var clientData = createClientGroup(dataset);

            customAggregation(clientData);

            var paretoChart = createEmptyChart();

            var x = new insight.Axis('', insight.scales.ordinal, 'bottom')
                .tickLabelOrientation('tb')
                .isOrdered(true);

            var clientRevenueAxis = new insight.Axis('', insight.scales.linear)
                .tickLabelFormat(insight.formatters.currencyFormatter);

            var cumulativeRevenueAxis = new insight.Axis('', insight.scales.linear)
                .tickLabelFormat(insight.formatters.percentageFormatter)
                .hasReversedPosition(true);

            var clientRevenues = new insight.ColumnSeries('clientColumn', clientData, x, clientRevenueAxis)
                .valueFunction(function(d)
                {
                    return d.value.CurrentRevenue.Sum;
                })
                .tooltipFormat(insight.formatters.currencyFormatter);

            var cumulativeRevenue = new insight.LineSeries('percentLine', clientData, x, cumulativeRevenueAxis)
                .tooltipFormat(insight.formatters.percentageFormatter)
                .valueFunction(function(d)
                {
                    return d.value.Percentage;
                });

            paretoChart.xAxis(x);

            paretoChart.yAxes([clientRevenueAxis, cumulativeRevenueAxis]);
            paretoChart.series([clientRevenues, cumulativeRevenue]);

            paretoChart.draw();
        });

        function createClientGroup(dataset)
        {
            return dataset.group('clients', function(d)
                {
                    return d.Client;
                })
                .sum(['CurrentRevenue'])
                .cumulative(['CurrentRevenue.Sum'])
                .orderFunction(function(a, b)
                {
                    return b.value.CurrentRevenue.Sum - a.value.CurrentRevenue.Sum;
                });
        }

        function customAggregation(group)
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

        function createEmptyChart()
        {

            var chart = new insight.Chart('Pareto', "#pareto")
                .width(500)
                .height(400);

            return chart;
        }

    });
