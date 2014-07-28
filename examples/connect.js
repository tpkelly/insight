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
                })
                .count(['supportedDevices']);

            var languageGroup = dataset.group('languages', function(d)
                {
                    return d.languageCodesISO2A;
                }, true)
                .count(['languageCodesISO2A']);

            var chart = new insight.Chart('Chart 1', '#genreCount')
                .width(800)
                .height(350)
                .margin(
                {
                    top: 10,
                    left: 100,
                    right: 40,
                    bottom: 120
                });

            var xScale = new insight.Axis('Genre', insight.Scales.Ordinal)
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .tickOrientation('tb')
                .ordered(true);

            var yScale = new insight.Axis('Apps', insight.Scales.Linear)
                .tickSize(5);

            chart.xAxis(xScale);
            chart.yAxis(yScale);

            var series = new insight.ColumnSeries('genre', genres, xScale, yScale, '#ACC3EE')
                .tooltipFunction(function(d)
                {
                    return d;
                })
                .valueFunction(function(d)
                {
                    return d.value.Count;
                })
                .tooltipFunction(function(d)
                {
                    return d.value.Count + " Apps";
                })
                .top(10);

            chart.series([series]);

            var languageChart = new insight.Chart('Chart 2', '#languages')
                .width(1200)
                .height(400)
                .margin(
                {
                    top: 10,
                    left: 200,
                    right: 40,
                    bottom: 50
                });

            var lxScale = new insight.Axis('Language', insight.Scales.Ordinal)
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .tickOrientation('tb')
                .ordered(true);

            var lyScale = new insight.Axis('AppsSupported', insight.Scales.Linear);

            languageChart.xAxis(lxScale);
            languageChart.yAxis(lyScale);

            var lSeries = new insight.ColumnSeries('languages', languageGroup, lxScale, lyScale, 'silver')
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
                    return '';
                },
                color: '#ACC3EE',
                tooltipValue: function(d)
                {
                    return d.value;

                }
            }];

            languageChart.series([lSeries]);

            insight.drawCharts();

        });
    });
