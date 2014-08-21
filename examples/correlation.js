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

            var scatterChart = new insight.Chart('Chart 3', '#bubbleChart')
                .width(500)
                .height(400)
                .margin(
                {
                    top: 10,
                    left: 150,
                    right: 40,
                    bottom: 80
                });

            var xAxis = new insight.Axis('Average Number of Ratings', insight.Scales.Linear)
                .tickSize(5)
                .tickPadding(0)
                .tickLabelOrientation('tb');

            var yAxis = new insight.Axis('Average Price', insight.Scales.Linear)
                .tickSize(5);

            scatterChart.xAxis(xAxis);
            scatterChart.yAxis(yAxis);

            var scatter = new insight.ScatterSeries('bubbles', genres, xAxis, yAxis)
                .keyFunction(function(d)
                {
                    return d.value.userRatingCount.Average;
                })
                .valueFunction(function(d)
                {
                    return d.value.price.Average;
                })
                .tooltipFunction(function(d)
                {
                    return d.key;
                });

            scatterChart.series([scatter]);
            buttonClick();

            $('.btn')
                .button();

            function buttonClick()
            {
                var correlation = insight.correlation.fromDataSet(genres, scatter.keyFunction(), scatter.valueFunction());
                var coefficientDiv = document.getElementById('correlationCoefficient');
                coefficientDiv.innerHTML = correlation.toFixed(3);
                console.log(correlation);

                scatterChart.draw();
            }

            $('#yavgrating')
                .click(function()
                {
                    scatter.valueFunction(function(d)
                    {
                        return d.value.averageUserRating.Average;
                    });
                    yAxis.label('Average Rating');
                    buttonClick();
                });


            $('#yavgratings')
                .click(function()
                {
                    scatter.valueFunction(function(d)
                    {
                        return d.value.userRatingCount.Average;
                    });
                    yAxis.label('Avg # Ratings');
                    buttonClick();
                });

            $('#yavgprice')
                .click(function()
                {
                    scatter.valueFunction(function(d)
                    {
                        return d.value.price.Average;
                    });
                    yAxis.label('Average Price');
                    buttonClick();
                });

            $('#xsumrating')
                .click(function()
                {
                    scatter.keyFunction(function(d)
                    {
                        return d.value.userRatingCount.Sum;
                    });
                    xAxis.label('Total Ratings');
                    buttonClick();
                });

            $('#xavgrating')
                .click(function()
                {
                    scatter.keyFunction(function(d)
                    {
                        return d.value.averageUserRating.Average;
                    });
                    xAxis.label('Average Rating');
                    buttonClick();
                });

            $('#xavgsize')
                .click(function()
                {

                    scatter.keyFunction(function(d)
                    {
                        return d.value.fileSizeBytes.Average / 1024 / 1024;
                    });
                    xAxis.label('Average File Size (Mb)');
                    buttonClick();
                });
        });

    });
