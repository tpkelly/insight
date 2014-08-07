$(document)
    .ready(function()
    {
        d3.json('datasets/appstore.json', function(data)
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
                .title('Years');

            var x = new insight.Axis('Country', insight.Scales.Ordinal)
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(5)
                .tickOrientation('tb')
                .tickRotation(45)
                .labelFormat(d3.time.format('%Y'));

            var y = new insight.Axis('Avg App Price', insight.Scales.Linear)
                .labelFormat(insight.Formatters.currencyFormatter);

            chart.xAxis(x)
                .yAxis(y);

            var columns = new insight.ColumnSeries('Year', yearly, x, y, '#ACC3EE')
                .valueFunction(function(d)
                {
                    return d.value.price.Average;
                })
                .tooltipFormat(insight.Formatters.currencyFormatter);

            chart.series([columns]);

            chart.draw();

        });
    });
