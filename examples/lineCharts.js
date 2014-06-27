$(document)
    .ready(function()
    {
        d3.json('revenuereport.json', function(data)
        {
            data.forEach(function(item)
            {
                item.Date = new Date(item.Date);
            });

            var dataset = new insight.DataSet(data);

            var dateData = dataset.group('date', function(d)
                {
                    return d.Date;
                })
                .sum(['CurrentRevenue'])
                .cumulative(['CurrentRevenue.Sum']);

            var chart = new insight.Chart('Chart 1', "#chart1")
                .width(650)
                .height(350)
                .margin(
                {
                    top: 0,
                    left: 130,
                    right: 40,
                    bottom: 100
                });

            var xScale = new insight.Scale(chart, 'Time', 'h', Scales.Time);
            var yScale = new insight.Scale(chart, 'Revenue', 'v', Scales.Linear);

            var line = new insight.LineSeries('valueLine', chart, dateData, xScale, yScale, 'cyan')
                .tooltipFormat(InsightFormatters.currencyFormatter)
                .lineType('monotone')
                .valueFunction(function(d)
                {
                    return d.value.CurrentRevenue.SumCumulative;
                });

            chart.series()
                .push(line);

            chart.zoomable(xScale);

            var xAxis = new insight.Axis(chart, "x", xScale, 'bottom')
                .labelOrientation('tb')
                .tickSize(5)
                .textAnchor('start')
                .labelFormat(InsightFormatters.dateFormatter);

            var yAxis = new insight.Axis(chart, "y", yScale, 'left')
                .tickSize(5)
                .labelFormat(InsightFormatters.currencyFormatter);

            insight.drawCharts();
        });
    });
