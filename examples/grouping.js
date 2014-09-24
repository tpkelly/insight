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
            });

            yearly.mean(['price']);

            var chart = new insight.Chart('Years', '#exampleChart')
                .width(500)
                .height(350)
                .title('Annual Average App Price');

            var x = new insight.Axis('', insight.Scales.Ordinal)
                .tickSize(5)
                .tickPadding(5)
                .tickLabelFormat(d3.time.format('%Y'));

            var y = new insight.Axis('', insight.Scales.Linear)
                .tickLabelFormat(insight.formatters.currencyFormatter);

            chart.xAxis(x)
                .yAxis(y);

            var columns = new insight.ColumnSeries('Year', yearly, x, y)
                .valueFunction(function(d)
                {
                    return d.value.price.Average;
                })
                .tooltipFormat(insight.formatters.currencyFormatter);

            chart.series([columns]);

            chart.draw();

        });
    });
