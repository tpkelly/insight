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

            var genres = dataset.group('genre', function(d)
            {
                return d.primaryGenreName;
            });

            var contentRatings = dataset.group('ratings', function(d)
            {
                return d.contentAdvisoryRating;
            });

            var chart = new insight.Chart('Genres', '#chart1')
                .width(600)
                .height(350)
                .title('Genres')
                .autoMargin(true);

            var columns = chart.addColumnSeries(
            {
                name: 'OrderAmount',
                data: genres,
                accessor: function(d)
                {
                    return d.value.Count;
                },
                color: '#ACC3EE'
            });

            var chart2 = new insight.Chart('Ratings', '#chart2')
                .width(600)
                .height(350)
                .title('Ratings')
                .autoMargin(true);

            var columns2 = chart2.addColumnSeries(
            {
                name: 'OrderAmount',
                data: contentRatings,
                accessor: function(d)
                {
                    return d.value.Count;
                },
                color: '#ACC3EE'
            });

            columns.x.ordered(true)

            var x = new insight.Axis("x", columns.x, "bottom")
                .textAnchor("start")
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation("tb")
                .labelRotation(90);

            var x2 = new insight.Axis("x", columns2.x, "bottom")
                .textAnchor("start")
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation("tb")
                .labelRotation(90);

            chart.addAxis(x);
            chart.addAxis(x2);

            insight.drawCharts();
        });
    });
