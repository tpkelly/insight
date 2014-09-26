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
                .tickSize(2)
                .tickLabelOrientation('tb');

            var yAxis = new insight.Axis('Average Price', insight.Scales.Linear);

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

                scatterChart.draw();
            }

            function selectButton(selectedButton, deselectedButtons)
            {
                //Select the selected button
                if (!$(selectedButton)
                    .hasClass('selected'))
                {
                    $(selectedButton)
                        .addClass('selected')
                }

                //Deselect the other buttons
                deselectedButtons.forEach(function(button)
                {
                    if ($(button)
                        .hasClass('selected'))
                    {
                        $(button)
                            .removeClass('selected')
                    }
                });

                buttonClick();
            }

            $('#yavgrating')
                .click(function()
                {
                    scatter.valueFunction(function(d)
                    {
                        return d.value.averageUserRating.Average;
                    });
                    yAxis.label('Average Rating');

                    selectButton('#yavgrating', ['#yavgratings', '#yavgprice']);
                });


            $('#yavgratings')
                .click(function()
                {
                    scatter.valueFunction(function(d)
                    {
                        return d.value.userRatingCount.Average;
                    });
                    yAxis.title('Avg # Ratings');

                    selectButton('#yavgratings', ['#yavgrating', '#yavgprice']);
                });

            $('#yavgprice')
                .click(function()
                {
                    scatter.valueFunction(function(d)
                    {
                        return d.value.price.Average;
                    });
                    yAxis.title('Average Price');

                    selectButton('#yavgprice', ['#yavgrating', '#yavgratings']);
                });

            $('#xsumrating')
                .click(function()
                {
                    scatter.keyFunction(function(d)
                    {
                        return d.value.userRatingCount.Sum;
                    });
                    xAxis.title('Total Ratings');

                    selectButton('#xsumrating', ['#xavgrating', '#xavgsize']);
                });

            $('#xavgrating')
                .click(function()
                {
                    scatter.keyFunction(function(d)
                    {
                        return d.value.averageUserRating.Average;
                    });
                    xAxis.title('Average Rating');

                    selectButton('#xavgrating', ['#xsumrating', '#xavgsize']);
                });

            $('#xavgsize')
                .click(function()
                {

                    scatter.keyFunction(function(d)
                    {
                        return d.value.fileSizeBytes.Average / 1024 / 1024;
                    });
                    xAxis.title('Average File Size (Mb)');

                    selectButton('#xavgsize', ['#xavgrating', '#xsumrating']);
                });
        });

    });
