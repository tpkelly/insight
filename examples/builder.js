$(document)
    .ready(function()
    {
        d3.json('appstore.json', function(data)
        {
            data.forEach(function(d)
            {
                d.releaseDate = new Date(d.releaseDate);
            });


            var dashboard = new Dashboard("#container");

            var appstore = dashboard.addData(data);

            var genre = dashboard.group(appstore, 'genre', function(d)
            {
                return d.primaryGenreName;
            });


            var chart = new Chart('Genres', '#exampleChart')
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

            var xAxis = new Axis(chart, "x", columns.x, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation('tb');


            dashboard.addChart(chart);
            dashboard.initCharts();
        });
    });
