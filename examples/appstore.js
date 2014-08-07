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
                d.fileSizeBytes = +d.fileSizeBytes;
            });

            var chartGroup = new insight.ChartGroup();

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
                });

            var xScale = new insight.Axis('Genre', insight.Scales.Ordinal)
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .tickOrientation('tb')
                .ordered(true);

            var yScale = new insight.Axis('Apps', insight.Scales.Linear);

            chart.xAxis(xScale);
            chart.yAxis(yScale);

            var series = new insight.ColumnSeries('genre', genres, xScale, yScale, 'lightblue')
                .valueFunction(function(d)
                {
                    return d.value.Count;
                });

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
                .labelFormat(insight.Formatters.dateFormatter);

            var yTime = new insight.Axis('New Apps', insight.Scales.Linear)
                .tickSize(5);

            timeChart.xAxis(xTime);
            timeChart.yAxis(yTime);

            var line = new insight.LineSeries('valueLine', dates, xTime, yTime, 'cyan')
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

            bubbleChart.xAxis(bubbleX);
            bubbleChart.yAxis(bubbleY);

            var bubbles = new insight.BubbleSeries('bubbles', genres, bubbleX, bubbleY, 'cyan')
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

            var table = new insight.Table('stats', '#table', genres)
                .columns([
                {
                    label: 'Average Price ($)',
                    value: function(d)
                    {
                        return insight.Formatters.format('00.2f', d.value.price.Average);
                    }
                },
                {
                    label: 'Average Filesize (Mb)',
                    value: function(d)
                    {
                        return insight.Formatters.format('.2f', d.value.fileSizeBytes.Average / 1024 / 1024);
                    }
                }])
                .descending(function(d)
                {
                    return d.value.price.Average
                });


            chartGroup.add(bubbleChart);
            chartGroup.add(timeChart);
            chartGroup.add(chart);
            chartGroup.add(table);
            chartGroup.draw();


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
                    chartGroup.draw();
                });


            $('#yavgratings')
                .click(function()
                {
                    bubbles.yFunction(function(d)
                    {
                        return d.value.userRatingCount.Average;
                    });
                    bubbleY.label('Average # Ratings');

                    chartGroup.draw();
                });


            $('#timecumulative')
                .click(function()
                {
                    line.valueFunction(function(d)
                    {
                        return d.value.CountCumulative;
                    });

                    chartGroup.draw();
                });

            $('#timemonthly')
                .click(function()
                {
                    line.valueFunction(function(d)
                    {
                        return d.value.Count;
                    });

                    chartGroup.draw();
                });

            $('#yavgprice')
                .click(function()
                {
                    bubbles.yFunction(function(d)
                    {
                        return d.value.price.Average;
                    });
                    bubbleY.label('Average Price');
                    chartGroup.draw();
                });

            $('#xsumrating')
                .click(function()
                {
                    bubbles.xFunction(function(d)
                    {
                        return d.value.userRatingCount.Sum;
                    });
                    bubbleX.label('Total Ratings');
                    chartGroup.draw();
                });

            $('#xavgrating')
                .click(function()
                {
                    bubbles.xFunction(function(d)
                    {
                        return d.value.averageUserRating.Average;
                    });
                    bubbleX.label('Average Rating');

                    chartGroup.draw();
                });

            $('#xavgsize')
                .click(function()
                {

                    bubbles.xFunction(function(d)
                    {
                        return d.value.fileSizeBytes.Average / 1024 / 1024;
                    });
                    bubbleX.label('Average File Size (Mb)');

                    chartGroup.draw();
                });

            $('#radprice')
                .click(function()
                {

                    bubbles.radiusFunction(function(d)
                    {
                        return d.value.price.Average;
                    });

                    chartGroup.draw();
                });
            $('#radcount')
                .click(function()
                {

                    bubbles.radiusFunction(function(d)
                    {
                        return d.value.Count;
                    });

                    chartGroup.draw();
                });

            $('#radsize')
                .click(function()
                {

                    bubbles.radiusFunction(function(d)
                    {
                        return d.value.fileSizeBytes.Average;
                    });

                    chartGroup.draw();
                });
        });

    });
