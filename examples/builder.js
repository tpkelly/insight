$(document)
    .ready(function()
    {
        d3.json('datasets/appstore.json', function(data)
        {
            data.forEach(function(d)
            {
                d.releaseDate = new Date(d.releaseDate);
            });

            var appstore = new insight.DataSet(data);

            var genre = appstore.group('genre', function(d)
            {
                return d.primaryGenreName;
            });

            var yearly = appstore.group('years', function(item)
                {
                    return item.releaseDate.getFullYear();
                })
                .mean(['price']);

            var chart = new insight.Chart('Genres', '#chart1')
                .width(400)
                .height(350)
                .title('Genres')
                .autoMargin(true);

            var columns = chart.addColumnSeries(
            {
                name: 'OrderAmount',
                data: genre,
                accessor: function(d)
                {
                    return d.value.Count;
                },
                color: '#ACC3EE'
            });

            columns.x.ordered(true);

            var xAxis = new insight.Axis(chart, "x", columns.x, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation('tb');

            var chart2 = new insight.Chart('Years', '#chart2')
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

            var columns2 = chart2.addColumnSeries(
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

            chart2.addLineSeries(
            {
                name: 'Revenue',
                data: yearly,
                accessor: function(d)
                {
                    return d.value.price.Sum;
                },
                color: '#95a5a6'
            });

            var xAxis2 = new insight.Axis(chart2, "x", columns2.x, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(5)
                .labelOrientation('tb')
                .labelRotation(45);

            insight.drawCharts();
        });
    });
