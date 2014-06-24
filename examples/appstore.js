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

            console.log(data);

            var charts = new Dashboard('AppStore');

            var dataset = charts.addData(data);

            var genres = charts.group(dataset, 'genre', function(d)
                {
                    return d.primaryGenreName;
                })
                .sum(['userRatingCount'])
                .mean(['price', 'averageUserRating', 'userRatingCount', 'fileSizeBytes']);

            var dates = charts.group(dataset, 'date', function(d)
                {
                    return new Date(d.releaseDate.getFullYear(), d.releaseDate.getMonth(), 1);
                })
                .cumulative(['Count'])
                .filter(function(d)
                {
                    return d.key < new Date(2014, 0, 1);
                });

            console.log(dates.getData());

            var chart = new Chart('Chart 1', "#genreCount")
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

            var xScale = new Scale(chart, "Genre", d3.scale.ordinal(), 'h', 'ordinal')
                .ordered(true);
            var yScale = new Scale(chart, "# Apps", d3.scale.linear(), 'v', 'linear');

            var series = new ColumnSeries('genre', chart, genres, xScale, yScale, 'silver');

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

            var xAxis = new Axis(chart, "x", xScale, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation('tb');

            var yAxis = new Axis(chart, "y", yScale, 'left')
                .tickSize(5);


            var timeChart = new Chart('Chart 2', "#releases")
                .width(800)
                .height(350)
                .margin(
                {
                    top: 10,
                    left: 100,
                    right: 40,
                    bottom: 100
                });

            var xTime = new Scale(timeChart, "Month", d3.time.scale(), 'h', 'time');
            var yTime = new Scale(timeChart, "New Apps", d3.scale.linear(), 'v', 'linear');

            var line = new LineSeries('valueLine', timeChart, dates, xTime, yTime, 'cyan')
                .yFunction(function(d)
                {
                    return d.value.CountCumulative;
                })
                .xFunction(function(d)
                {
                    return d.key;
                });


            timeChart.series()
                .push(line);

            timeChart.zoomable(xTime);

            var xAxis = new Axis(timeChart, "x", xTime, 'bottom')
                .labelOrientation('tb')
                .tickSize(5)
                .textAnchor('start')
                .format(InsightFormatters.dateFormatter);

            var yAxis = new Axis(timeChart, "y", yTime, 'left')
                .tickSize(5);

            var bubbleChart = new Chart('Chart 3', "#bubbleChart")
                .width(800)
                .height(550)
                .margin(
                {
                    top: 10,
                    left: 120,
                    right: 40,
                    bottom: 100
                });

            var bubbleX = new Scale(bubbleChart, 'Average Number of Ratings', d3.scale.linear(), 'h', 'linear');

            var bubbleY = new Scale(bubbleChart, 'Average Price', d3.scale.linear(), 'v', 'linear');

            var bubbles = new BubbleSeries('bubbles', bubbleChart, genres, bubbleX, bubbleY, 'cyan')
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

            var bubbleXAxis = new Axis(bubbleChart, "x", bubbleX, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .labelOrientation('tb');

            var bubbleYAxis = new Axis(bubbleChart, "y", bubbleY, 'left')
                .tickSize(5);


            bubbleChart.series([bubbles]);

            charts.addChart(bubbleChart);

            charts.addChart(timeChart);

            charts.addChart(chart);

            charts.initCharts();
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

                    var newScale = new Scale(bubbleChart, 'Average Rating', d3.scale.linear(), 'v', 'linear');

                    bubbles.y = newScale;
                    bubbles.yFunction(function(d)
                    {
                        return d.value.averageUserRating.Average;
                    });

                    bubbleYAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

                    charts.redrawCharts();
                });

            $('#yavgratings')
                .click(function()
                {
                    var ind = bubbleChart.scales()
                        .indexOf(bubbleY);
                    bubbleChart.scales()
                        .splice(ind, 1);
                    var f = bubbleChart.scales();

                    var newScale = new Scale(bubbleChart, 'Average Rating', d3.scale.linear(), 'v', 'linear');

                    bubbles.y = newScale;
                    bubbles.yFunction(function(d)
                    {
                        return d.value.userRatingCount.Average;
                    });

                    bubbleYAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

                    charts.redrawCharts();
                });

            $('#timecumulative')
                .click(function()
                {
                    line.yFunction(function(d)
                    {
                        return d.value.CountCumulative;
                    });

                    charts.redrawCharts();
                });

            $('#timemonthly')
                .click(function()
                {
                    line.yFunction(function(d)
                    {
                        return d.value.Count;
                    });

                    charts.redrawCharts();
                });

            $('#yavgprice')
                .click(function()
                {
                    var ind = bubbleChart.scales()
                        .indexOf(bubbleY);
                    bubbleChart.scales()
                        .splice(ind, 1);
                    var f = bubbleChart.scales();

                    var newScale = new Scale(bubbleChart, 'Average Price', d3.scale.linear(), 'v', 'linear');

                    bubbles.y = newScale;
                    bubbles.yFunction(function(d)
                    {
                        return d.value.price.Average;
                    });

                    bubbleYAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

                    charts.redrawCharts();
                });

            $('#xsumrating')
                .click(function()
                {

                    var ind = bubbleChart.scales()
                        .indexOf(bubbleX);
                    bubbleChart.scales()
                        .splice(ind, 1);
                    var f = bubbleChart.scales();

                    var newScale = new Scale(bubbleChart, 'Total Number of Ratings', d3.scale.linear(), 'h', 'linear');

                    bubbles.x = newScale;
                    bubbles.xFunction(function(d)
                    {
                        return d.value.userRatingCount.Sum;
                    });

                    bubbleXAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

                    charts.redrawCharts();
                });

            $('#xavgrating')
                .click(function()
                {

                    var ind = bubbleChart.scales()
                        .indexOf(bubbleX);
                    bubbleChart.scales()
                        .splice(ind, 1);
                    var f = bubbleChart.scales();

                    var newScale = new Scale(bubbleChart, 'Average Number of Ratings', d3.scale.linear(), 'h', 'linear');

                    bubbles.x = newScale;

                    bubbles.xFunction(function(d)
                    {
                        return d.value.userRatingCount.Average;
                    });

                    bubbleXAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

                    charts.redrawCharts();
                });

            $('#xavgsize')
                .click(function()
                {

                    var ind = bubbleChart.scales()
                        .indexOf(bubbleX);
                    bubbleChart.scales()
                        .splice(ind, 1);
                    var f = bubbleChart.scales();

                    var newScale = new Scale(bubbleChart, 'Average File Size (Mb)', d3.scale.linear(), 'h', 'linear');

                    bubbles.x = newScale;

                    bubbles.xFunction(function(d)
                    {
                        return d.value.fileSizeBytes.Average / 1024 / 1024;
                    });

                    bubbleXAxis.scale = newScale;

                    newScale.addSeries(bubbles);

                    newScale.initialize();

                    charts.redrawCharts();
                });

            $('#radprice')
                .click(function()
                {

                    bubbles.radiusFunction(function(d)
                    {
                        return d.value.price.Average;
                    });

                    charts.redrawCharts();
                });
            $('#radcount')
                .click(function()
                {

                    bubbles.radiusFunction(function(d)
                    {
                        return d.value.Count;
                    });

                    charts.redrawCharts();
                });

            $('#radsize')
                .click(function()
                {

                    bubbles.radiusFunction(function(d)
                    {
                        return d.value.fileSizeBytes.Average;
                    });

                    charts.redrawCharts();
                });
        });

    });
