var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];



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
                .sum(['userRatingCount'])
                .mean(['price', 'averageUserRating', 'userRatingCount', 'fileSizeBytes']);

            var dates = dataset.group('date', function(d)
                {
                    return new Date(d.releaseDate.getFullYear(), d.releaseDate.getMonth(), 1);
                })
                .cumulative(['Count'])
                .filter(function(d)
                {
                    return d.key < new Date(2014, 0, 1);
                });

            var chart = new insight.Chart('Chart 1', "#genreCount")
                .width(700)
                .height(350)
                .margin(
                {
                    top: 10,
                    left: 120,
                    right: 40,
                    bottom: 120
                })

            var xScale = new insight.Axis('Genre', insight.Scales.Ordinal)
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .tickOrientation('tb')
                .barPadding(0.3)
                .ordered(true);

            var yScale = new insight.Axis('Apps', insight.Scales.Linear);

            chart.addXAxis(xScale);
            chart.addYAxis(yScale);

            var series = new insight.ColumnSeries('genre', genres, xScale, yScale, '#aae');

            series.series = [
            {
                name: 'genre',
                accessor: function(d)
                {
                    return d.value.Count;
                },
                label: function(d)
                {
                    return d.key
                },
                color: 'lightblue',
                tooltipValue: function(d)
                {
                    return d.value.Count;
                }
            }];

            chart.series([series]);

            var timeChart = new insight.Chart('Chart 2', '#releases')
                .width(800)
                .height(350)
                .margin(
                {
                    top: 10,
                    left: 120,
                    right: 40,
                    bottom: 100
                });

            var xTime = new insight.Axis('Month', insight.Scales.Time)
                .tickOrientation('tb')
                .tickSize(5)
                .textAnchor('start')
                .labelFormat(InsightFormatters.dateFormatter);

            var yTime = new insight.Axis('New Apps', insight.Scales.Linear)
                .tickSize(5);

            timeChart.addXAxis(xTime);
            timeChart.addYAxis(yTime);

            var line = new insight.LineSeries('valueLine', dates, xTime, yTime, '#aae')
                .valueFunction(function(d)
                {
                    return d.value.CountCumulative;
                });


            timeChart.series()
                .push(line);

            timeChart.zoomable(xTime);


            var bubbleChart = new insight.Chart('Chart 3', '#bubbleChart')
                .width(800)
                .height(550)
                .margin(
                {
                    top: 10,
                    left: 120,
                    right: 40,
                    bottom: 100
                });

            var bubbleX = new insight.Axis('Average Number of Ratings', insight.Scales.Linear)
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .tickOrientation('tb');

            var bubbleY = new insight.Axis('Average Price', insight.Scales.Linear)
                .tickSize(5);

            bubbleChart.addXAxis(bubbleX);
            bubbleChart.addYAxis(bubbleY);

            var bubbles = new insight.BubbleSeries('bubbles', genres, bubbleX, bubbleY, '#aae')
                .xFunction(function(d)
                {
                    return d.value.userRatingCount.Average;
                })
                .yFunction(function(d)
                {
                    return d.value.price.Average;
                })
                .radiusFunction(function(d)
                {
                    return d.value.Count;
                })
                .tooltipFunction(function(d)
                {
                    return d.key;
                });

            bubbleChart.series([bubbles]);

            insight.drawCharts();


            $('.btn')
                .button()

            $('#yavgrating')
                .click(function()
                {
                    bubbles.yFunction(function(d)
                    {
                        return d.value.averageUserRating.Average;
                    });
                    bubbleY.label('Average Rating');
                    insight.redrawCharts();
                });


            $('#yavgratings')
                .click(function()
                {
                    bubbles.yFunction(function(d)
                    {
                        return d.value.userRatingCount.Average;
                    });
                    bubbleY.label('Average # Ratings');

                    insight.redrawCharts();
                });


            $('#timecumulative')
                .click(function()
                {
                    line.valueFunction(function(d)
                    {
                        return d.value.CountCumulative;
                    });

                    insight.redrawCharts();
                });

            $('#timemonthly')
                .click(function()
                {
                    line.valueFunction(function(d)
                    {
                        return d.value.Count;
                    });

                    insight.redrawCharts();
                });

            $('#yavgprice')
                .click(function()
                {
                    bubbles.yFunction(function(d)
                    {
                        return d.value.price.Average;
                    });
                    bubbleY.label('Average Price');
                    insight.redrawCharts();
                });

            $('#xsumrating')
                .click(function()
                {
                    bubbles.xFunction(function(d)
                    {
                        return d.value.userRatingCount.Sum;
                    });
                    bubbleX.label('Total Ratings');
                    insight.redrawCharts();
                });

            $('#xavgrating')
                .click(function()
                {
                    bubbles.xFunction(function(d)
                    {
                        return d.value.userRatingCount.Average;
                    });
                    bubbleX.label('Average # Ratings');

                    insight.redrawCharts();
                });

            $('#xavgsize')
                .click(function()
                {

                    bubbles.xFunction(function(d)
                    {
                        return d.value.fileSizeBytes.Average / 1024 / 1024;
                    });
                    bubbleX.label('Average File Size (Mb)');

                    insight.redrawCharts();
                });

            $('#radprice')
                .click(function()
                {

                    bubbles.radiusFunction(function(d)
                    {
                        return d.value.price.Average;
                    });

                    insight.redrawCharts();
                });
            $('#radcount')
                .click(function()
                {

                    bubbles.radiusFunction(function(d)
                    {
                        return d.value.Count;
                    });

                    insight.redrawCharts();
                });

            $('#radsize')
                .click(function()
                {

                    bubbles.radiusFunction(function(d)
                    {
                        return d.value.fileSizeBytes.Average;
                    });

                    insight.redrawCharts();
                });
        });

    });
