var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];


$(document)
    .ready(function()
    {

        d3.json('appstore.json', function(data)
        {

            data.forEach(function(d)
            {
                d.releaseDate = new Date(d.releaseDate);
            });

            var charts = new Dashboard('AppStore');

            var dataset = charts.addData(data);

            var genre = charts.addDimension(ndx, 'genre', function(d)
            {
                return d.primaryGenreName;
            }, function(d)
            {
                return d.primaryGenreName;
            });

            var supportedDevices = charts.addDimension(ndx, 'supportedDevices', function(d)
                {
                    return d.supportedDevices;
                }, function(d)
                {
                    return d.supportedDevices;
                },
                true
            );

            var languages = charts.addDimension(ndx, 'languages', function(d)
                {
                    return d.languageCodesISO2A;
                }, function(d)
                {
                    return d.languageCodesISO2A;
                },
                true
            );


            var genres = new Grouping(genre)
                .count(["supportedDevices"]);

            var devices = new Grouping(supportedDevices)
                .count(["supportedDevices"]);

            var languageGroup = new Grouping(languages)
                .count(["languageCodesISO2A"]);

            charts.addGroup(genres);
            charts.addGroup(devices);
            charts.addGroup(languageGroup);

            var chart = new Chart('Chart 1', "#genreCount")
                .width(800)
                .height(350)
                .margin(
                {
                    top: 10,
                    left: 100,
                    right: 40,
                    bottom: 120
                })
                .barPadding(0.3);

            var xScale = new Scale(chart, "Genre", d3.scale.ordinal(), 'h', 'ordinal')
                .ordered(true);

            var yScale = new Scale(chart, "# Apps", d3.scale.linear(), 'v', 'linear');

            var series = new ColumnSeries('genre', chart, genres, xScale, yScale, 'silver')
                .tooltipFunction(function(d)
                {
                    return d;
                })
                .top(10);

            series.series = [
            {
                name: 'genre',
                accessor: function(d)
                {
                    return d.value.Count;
                },
                label: function(d)
                {
                    return "";
                },
                color: '#ACC3EE',
                tooltipValue: function(d)
                {
                    return d.value.Count + " Apps";

                }
            }];

            chart.series([series]);

            var xAxis = new Axis(chart, "x", xScale, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation('tb');

            var yAxis = new Axis(chart, "y", yScale, 'left')
                .tickSize(5);


            var languageChart = new Chart('Chart 2', "#languages")
                .width(1200)
                .height(400)
                .margin(
                {
                    top: 10,
                    left: 200,
                    right: 40,
                    bottom: 50
                });

            var lxScale = new Scale(languageChart, "Language", d3.scale.ordinal(), 'h', 'ordinal')
                .ordered(true);

            var lyScale = new Scale(languageChart, "# Apps Supported", d3.scale.linear(), 'v', 'linear');

            var lSeries = new ColumnSeries('languages', languageChart, languageGroup, lxScale, lyScale, 'silver')
                .tooltipFunction(function(d)
                {
                    return d;
                })
                .top(10);

            lSeries.series = [
            {
                name: 'language',
                accessor: function(d)
                {
                    return d.value;
                },
                label: function(d)
                {
                    return "";
                },
                color: '#ACC3EE',
                tooltipValue: function(d)
                {
                    return d.value;

                }
            }];

            languageChart.series([lSeries]);

            var xAxis = new Axis(languageChart, "x", lxScale, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation('tb');

            var yAxis = new Axis(languageChart, "y", lyScale, 'left')
                .tickSize(5);


            charts.addChart(chart);
            charts.addChart(languageChart);

            charts.initCharts();

        });
    });
