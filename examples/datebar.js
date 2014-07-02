$(document)
    .ready(function()
    {
        d3.json('appstore.json', function(data)
        {

            data.forEach(function(d)
            {
                d.releaseDate = new Date(d.releaseDate);
            });

            var dataset = new insight.DataSet(data);

            var yearly = dataset.group('years', function(item)
                {
                    return new Date(item.releaseDate.getFullYear(), 0, 1);
                })
                .mean(['price']);

            var chart = new insight.Chart('Years', '#exampleChart')
                .width(500)
                .height(350)
                .title('Years')
                .margin(
                {
                    top: 0,
                    left: 180,
                    bottom: 60,
                    right: 0
                });
            var x = new insight.Axis(chart, 'Country', 'h', insight.Scales.Ordinal, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(5)
                .tickOrientation('tb')
                .tickRotation(45)
                .labelFormat(d3.time.format('%Y'));

            var y = new insight.Axis(chart, 'Avg App Price (£)', 'v', insight.Scales.Linear, 'left')
                .labelFormat(d3.format('0,000'));

            var columns = new insight.ColumnSeries('Year', chart, yearly, x, y, '#ACC3EE')
                .valueFunction(function(d)
                {
                    return d.value.price.Average;
                })
                .tooltipFormat(InsightFormatters.currencyFormatter);

            chart.series([columns]);

            insight.drawCharts();

        });
    });
