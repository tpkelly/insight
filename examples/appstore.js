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
                    left: 100,
                    right: 40,
                    bottom: 120
                })
                .barPadding(0.3);

            var xScale = new insight.Scale(chart, "Genre", 'h', Scales.Ordinal)
                .ordered(true);
            var yScale = new insight.Scale(chart, "# Apps", 'v', Scales.Linear);

            var series = new insight.ColumnSeries('genre', chart, genres, xScale, yScale, 'silver');

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

            var xAxis = new insight.Axis(chart, "x", xScale, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation('tb');

            var yAxis = new insight.Axis(chart, "y", yScale, 'left')
                .tickSize(5);


            var timeChart = new insight.Chart('Chart 2', "#releases")
                .width(800)
                .height(350)
                .margin(
                {
                    top: 10,
                    left: 100,
                    right: 40,
                    bottom: 100
                });

            var xTime = new insight.Scale(timeChart, "Month", 'h', Scales.Time);
            var yTime = new insight.Scale(timeChart, "New Apps", 'v', Scales.Linear);

            var line = new insight.LineSeries('valueLine', timeChart, dates, xTime, yTime, 'cyan')
                .valueFunction(function(d)
                {
                    return d.value.CountCumulative;
                });


            timeChart.series()
                .push(line);

            timeChart.zoomable(xTime);

            var xAxis = new insight.Axis(timeChart, "x", xTime, 'bottom')
                .labelOrientation('tb')
                .tickSize(5)
                .textAnchor('start')
                .labelFormat(InsightFormatters.dateFormatter);

            var yAxis = new insight.Axis(timeChart, "y", yTime, 'left')
                .tickSize(5);

            var bubbleChart = new insight.Chart('Chart 3', "#bubbleChart")
                .width(800)
                .height(550)
                .margin(
                {
                    top: 10,
                    left: 120,
                    right: 40,
                    bottom: 100
                });

            var bubbleX = new insight.Scale(bubbleChart, 'Average Number of Ratings', 'h', Scales.Linear);

            var bubbleY = new insight.Scale(bubbleChart, 'Average Price', 'v', Scales.Linear);

            var bubbles = new insight.BubbleSeries('bubbles', bubbleChart, genres, bubbleX, bubbleY, 'cyan')
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

            var bubbleXAxis = new insight.Axis(bubbleChart, "x", bubbleX, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation('tb');

            var bubbleYAxis = new insight.Axis(bubbleChart, "y", bubbleY, 'left')
                .tickSize(5);


            bubbleChart.series([bubbles]);

            insight.drawCharts();


            $('.btn')
                .button()

            $('#yavgrating')
                .click(function()
                {
                    var ind = bubbleChart.scales()
                        .indexOf(bubbleY);
                    bubbleChart.scales()
                        .splice(ind, 1);
                    var f = bubbleChart.scales();

                    var newScale = new insight.Scale(bubbleChart, 'Average Rating', 'v', Scales.Linear);

                    bubbles.y = newScale;
                    bubbles.yFunction(function(d)
                    {
                        return d.value.averageUserRating.Average;
                    });

                    bubbleYAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

                    insight.redrawCharts();
                });

            $('#yavgratings')
                .click(function()
                {
                    var ind = bubbleChart.scales()
                        .indexOf(bubbleY);
                    bubbleChart.scales()
                        .splice(ind, 1);
                    var f = bubbleChart.scales();

                    var newScale = new insight.Scale(bubbleChart, 'Average Rating', 'v', Scales.Linear);

                    bubbles.y = newScale;
                    bubbles.yFunction(function(d)
                    {
                        return d.value.userRatingCount.Average;
                    });

                    bubbleYAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

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
                    var ind = bubbleChart.scales()
                        .indexOf(bubbleY);
                    bubbleChart.scales()
                        .splice(ind, 1);
                    var f = bubbleChart.scales();

                    var newScale = new insight.Scale(bubbleChart, 'Average Price', 'v', Scales.Linear);

                    bubbles.y = newScale;
                    bubbles.yFunction(function(d)
                    {
                        return d.value.price.Average;
                    });

                    bubbleYAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

                    insight.redrawCharts();
                });

            $('#xsumrating')
                .click(function()
                {

                    var ind = bubbleChart.scales()
                        .indexOf(bubbleX);
                    bubbleChart.scales()
                        .splice(ind, 1);
                    var f = bubbleChart.scales();

                    var newScale = new insight.Scale(bubbleChart, 'Total Number of Ratings', 'h', Scales.Linear);

                    bubbles.x = newScale;
                    bubbles.xFunction(function(d)
                    {
                        return d.value.userRatingCount.Sum;
                    });

                    bubbleXAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

                    insight.redrawCharts();
                });

            $('#xavgrating')
                .click(function()
                {

                    var ind = bubbleChart.scales()
                        .indexOf(bubbleX);
                    bubbleChart.scales()
                        .splice(ind, 1);
                    var f = bubbleChart.scales();

                    var newScale = new insight.Scale(bubbleChart, 'Average Number of Ratings', 'h', Scales.Linear);

                    bubbles.x = newScale;

                    bubbles.xFunction(function(d)
                    {
                        return d.value.userRatingCount.Average;
                    });

                    bubbleXAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

                    insight.redrawCharts();
                });

            $('#xavgsize')
                .click(function()
                {

                    var ind = bubbleChart.scales()
                        .indexOf(bubbleX);
                    bubbleChart.scales()
                        .splice(ind, 1);
                    var f = bubbleChart.scales();

                    var newScale = new insight.Scale(bubbleChart, 'Average File Size (Mb)', 'h', Scales.Linear);

                    bubbles.x = newScale;

                    bubbles.xFunction(function(d)
                    {
                        return d.value.fileSizeBytes.Average / 1024 / 1024;
                    });

                    bubbleXAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

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
