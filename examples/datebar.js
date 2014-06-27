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
                .width(400)
                .height(350)
                .title('Years')
                .margin(
                {
                    top: 0,
                    left: 0,
                    bottom: 60,
                    right: 0
                });

            var columns = chart.addColumnSeries(
                {
                    name: 'Year',
                    data: yearly,
                    accessor: function(d)
                    {
                        return d.value.price.Average;
                    },
                    color: '#ACC3EE'
                })
                .tooltipFormat(InsightFormatters.decimalCurrencyFormatter);

            var xAxis = new insight.Axis(chart, "x", columns.x, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(5)
                .labelOrientation('tb')
                .labelRotation(45)
                .labelFormat(d3.time.format("%Y"));

            insight.drawCharts();

        });
    });
