$(document)
    .ready(function()
    {
        d3.json('datasets/appstore.json', function(data)
        {
            var dataset = prepareDataSet(data);
            var genres = createGenreGroup(dataset);
            var ageRatings = createAgeRatingsGroup(dataset);

            var ageRatingRows = createAgeRatingsChart(ageRatings);
            var genreBubbles = createGenreBubbleChart(genres);
            var genreTable = createGenreTable(genres);

            var chartGroup = new insight.ChartGroup();

            chartGroup.add(ageRatingRows);
            chartGroup.add(genreBubbles);
            chartGroup.add(genreTable);
            chartGroup.draw();

        });

        function prepareDataSet(data)
        {
            // ensure releaseDate is a date and fileSizeBytes is a number
            data.forEach(function(d)
            {
                d.releaseDate = new Date(d.releaseDate);
                d.fileSizeBytes = +d.fileSizeBytes;
            });

            var dataset = new insight.DataSet(data);

            return dataset;

        }

        function createGenreGroup(dataset)
        {

            var genres = dataset.group('genre', function(d)
                {
                    return d.primaryGenreName;
                })
                .sum(['userRatingCount'])
                .mean(['price', 'averageUserRating', 'userRatingCount', 'fileSizeBytes']);

            return genres;

        }

        function createAgeRatingsGroup(dataset)
        {

            var ratingGroup = dataset.group('contentRating', function(d)
            {
                return d.contentAdvisoryRating;
            });

            return ratingGroup;
        }

        function createGenreBubbleChart(bubbleData)
        {

            var bubbleChart = new insight.Chart('Genre bubbles', '#bubbles')
                .width(350)
                .height(350)
                .margin(
                {
                    top: 40,
                    left: 60,
                    right: 40,
                    bottom: 60
                });

            var bubbleX = new insight.Axis('Average Rating', insight.Scales.Linear)
                .tickSize(5)
                .tickLabelOrientation('tb');

            var bubbleY = new insight.Axis('$', insight.Scales.Linear)
                .tickSize(5);

            bubbleChart.xAxis(bubbleX)
                .yAxis(bubbleY);

            var bubbles = new insight.BubbleSeries('bubbles', bubbleData, bubbleX, bubbleY)
                .keyFunction(function(d)
                {
                    return d.value.averageUserRating.Average;
                })
                .valueFunction(function(d)
                {
                    return d.value.price.Average;
                })
                .radiusFunction(function(d)
                {
                    return d.value.fileSizeBytes.Average / 1024 / 1024;
                })
                .tooltipFunction(function(d)
                {
                    return d.key + " <br/> Average App Size (Mb) = " + Math.round(d.value.fileSizeBytes.Average / 1024 / 1024);
                });

            // set RowSeries to first color in the default series palette
            //  - workaround until ColumnSeries has sub-series removed
            bubbles.color = d3.functor(insight.defaultTheme.chartStyle.seriesPalette[0]);

            bubbleChart.series([bubbles]);

            return bubbleChart;

        }

        function createGenreTable(tableData)
        {

            var table = new insight.Table('Genre table', '#table', tableData)
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

            return table;

        }

        function createAgeRatingsChart(ratings)
        {

            var chart = new insight.Chart('Ratings', '#ageRatings')
                .width(350)
                .height(350)
                .margin(
                {
                    top: 0,
                    bottom: 50,
                    left: 100,
                    right: 0
                });

            var axisOrder = ['Not yet rated', '4+', '9+', '12+', '17+'];

            var x = new insight.Axis('', insight.Scales.Linear)
                .tickSize(5)
                .tickLabelRotation(45)
                .display(false);

            var y = new insight.Axis('', insight.Scales.Ordinal)
                .ordered(true)
                .orderingFunction(function(a, b)
                {
                    var aIndex = axisOrder.indexOf(a.key),
                        bIndex = axisOrder.indexOf(b.key);

                    return bIndex - aIndex;
                });

            chart.xAxis(x)
                .yAxis(y);

            var rowSeries = new insight.RowSeries('content', ratings, x, y)
                .valueFunction(function(d)
                {
                    return d.value.Count;
                });

            // set RowSeries to first color in the default series palette
            //  - workaround until ColumnSeries has sub-series removed
            rowSeries.series[0].color = d3.functor(insight.defaultTheme.chartStyle.seriesPalette[0]);

            chart.series([rowSeries]);

            return chart;
        }

    });
