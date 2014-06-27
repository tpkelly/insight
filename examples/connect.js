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

            var dataset = new insight.DataSet(data);

            var genres = dataset.group('genre', function(d)
                {
                    return d.primaryGenreName;
                })
                .count(["supportedDevices"]);

            var languageGroup = dataset.group('languages', function(d)
                {
                    return d.languageCodesISO2A;
                }, true)
                .count(["languageCodesISO2A"]);

            var chart = new insight.Chart('Chart 1', "#genreCount")
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

            var xScale = new insight.Scale(chart, "Genre", 'h', Scales.Ordinal)
                .ordered(true);

            var yScale = new insight.Scale(chart, "# Apps", 'v', Scales.Linear);

            var series = new insight.ColumnSeries('genre', chart, genres, xScale, yScale, 'silver')
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

            var xAxis = new insight.Axis(chart, "x", xScale, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation('tb');

            var yAxis = new insight.Axis(chart, "y", yScale, 'left')
                .tickSize(5);


            var languageChart = new insight.Chart('Chart 2', "#languages")
                .width(1200)
                .height(400)
                .margin(
                {
                    top: 10,
                    left: 200,
                    right: 40,
                    bottom: 50
                });

            var lxScale = new insight.Scale(languageChart, "Language", 'h', Scales.Ordinal)
                .ordered(true);

            var lyScale = new insight.Scale(languageChart, "# Apps Supported", 'v', Scales.Linear);

            var lSeries = new insight.ColumnSeries('languages', languageChart, languageGroup, lxScale, lyScale, 'silver')
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

            var xAxis = new insight.Axis(languageChart, "x", lxScale, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation('tb');

            var yAxis = new insight.Axis(languageChart, "y", lyScale, 'left')
                .tickSize(5);

            insight.drawCharts();

        });
    });
