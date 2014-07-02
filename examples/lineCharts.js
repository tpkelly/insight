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

            var xScale = new insight.Axis(chart, 'Time', 'h', insight.Scales.Time, 'bottom')
                .tickRotation(90)
                .tickOrientation('tb')
                .labelFormat(InsightFormatters.dateFormatter);

            var yScale = new insight.Axis(chart, 'Revenue', 'v', insight.Scales.Linear, 'left');

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

            insight.drawCharts();
        });
    });
