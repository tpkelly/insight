$(document)
    .ready(function()
    {
        d3.json('datasets/revenuereport.json', function(data)
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

            var xScale = new insight.Axis('Time', insight.Scales.Time)
                .tickRotation(90)
                .tickOrientation('tb')
                .labelFormat(InsightFormatters.dateFormatter)
                .showGridlines(true);

            var yScale = new insight.Axis('Revenue', insight.Scales.Linear)
                .showGridlines(true);

            chart.addXAxis(xScale);
            chart.addYAxis(yScale);

            var line = new insight.LineSeries('valueLine', dateData, xScale, yScale, '#aae')
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
