$(document)
    .ready(function()
    {
        var leaguePlaces = [
        {
            teamName: 'Chuffed FC',
            currentPosition: 8,
            targetPosition: 2
        },
        {
            teamName: 'Old Boys',
            currentPosition: 3,
            targetPosition: 4
        },
        {
            teamName: 'Hairy Harriers',
            currentPosition: 1,
            targetPosition: 1
        },
        {
            teamName: 'Kings Arms',
            currentPosition: 8,
            targetPosition: 2
        },
        {
            teamName: 'Chuffed FC',
            currentPosition: 8,
            targetPosition: 2
        },
        {
            teamName: 'Chuffed FC',
            currentPosition: 8,
            targetPosition: 2
        },
        {
            teamName: 'Chuffed FC',
            currentPosition: 8,
            targetPosition: 2
        },
        {
            teamName: 'Chuffed FC',
            currentPosition: 8,
            targetPosition: 2
        },
        {
            teamName: 'Chuffed FC',
            currentPosition: 8,
            targetPosition: 2
        }, ];

        d3.json('datasets/revenuereport.json', function(data)
        {
            var dataset = new insight.DataSet(data);

            var clientData = createClientGroup(dataset);

            computeGroupValues(clientData);

            var paretoChart = createEmptyChart();

            var x = new insight.Axis('', insight.Scales.Ordinal, 'bottom')
                .tickLabelOrientation('tb')
                .ordered(true);

            var clientRevenueAxis = new insight.Axis('', insight.Scales.Linear)
                .tickLabelFormat(insight.Formatters.currencyFormatter);

            var cumulativeRevenueAxis = new insight.Axis('', insight.Scales.Linear)
                .tickLabelFormat(insight.Formatters.percentageFormatter)
                .reversedPosition(true);

            var clientRevenues = new insight.ColumnSeries('clientColumn', clientData, x, clientRevenueAxis, '#3182bd')
                .valueFunction(function(d)
                {
                    return d.value.CurrentRevenue.Sum;
                })
                .tooltipFormat(insight.Formatters.currencyFormatter);

            var cumulativeRevenue = new insight.LineSeries('percentLine', clientData, x, cumulativeRevenueAxis, '#c6dbed')
                .tooltipFormat(insight.Formatters.percentageFormatter)
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

        function createEmptyChart()
        {

            var chart = new insight.Chart('Pareto', "#pareto")
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
