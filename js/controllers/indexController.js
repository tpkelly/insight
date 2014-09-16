(function()
{
    'use strict';
    
    /**
     * This method turns JSON string properties into Dates and ints where they need to be
     * This is the sort of preprocessing I would like the library to handle, eithe rwith a provided type mapping or automatically.
     * @param {object[]} data - The input data
     */
    function preprocess(data) {
        data.forEach(function(d)
        {
            d.releaseDate = new Date(d.releaseDate);
            d.fileSizeBytes = +d.fileSizeBytes;
        });
    }

    function createBubbleChart(chartGroup, bubbleData) {

        var bubbleChart = new insight.Chart('Bubble chart', '#bubble-chart')
                .width(300)
                .height(400);

            var bubbleX = new insight.Axis('Average Rating', insight.Scales.Linear)
                .tickSize(5)
                .tickPadding(5);

            bubbleX.ticksHint = d3.functor(4);

            var bubbleY = new insight.Axis('', insight.Scales.Linear)
                .tickSize(5)
                .tickPadding(5)
                .tickLabelFormat(insight.Formatters.currencyFormatter);

            bubbleChart
                .xAxis(bubbleX)
                .yAxis(bubbleY)
                .title('App price vs. rating vs. filesize (radius)');

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
                    return Math.sqrt(d.value.fileSizeBytes.Average);
                })
                .tooltipFunction(function(d)
                {
                    return d.key + " <br/> Average App Size (Mb) = " + Math.round(d.value.fileSizeBytes.Average/1024/1024);
                });

            bubbleChart.series([bubbles]);
            chartGroup.add(bubbleChart);

    }

    function createLanguageChart(chartGroup, languages){

        var chart = new insight.Chart('Chart 2', '#languages')
                .width(350)
                .height(400);

            var x = new insight.Axis('Language', insight.Scales.Ordinal)
                .tickSize(5)
                .tickPadding(5)
                .isOrdered(true);

            var y = new insight.Axis('', insight.Scales.Linear);

            chart.xAxis(x)
                 .yAxis(y)
                .title("Total number of Apps by language");

            var lSeries = new insight.ColumnSeries('languages', languages, x, y)
                .top(10);

            chart.series([lSeries]);
            chartGroup.add(chart);
    }

    function createGenreCountChart(chartGroup, genreData){

        var chart = new insight.Chart('Genre Chart', "#genre-count")
                .width(450)
                .height(400);

        var y = new insight.Axis('', insight.Scales.Ordinal)
            .tickSize(0)
            .tickPadding(5)
            .isOrdered(true);

        var x = new insight.Axis('', insight.Scales.Linear)
                        .hasReversedPosition(true)
            .tickPadding(0)
            .tickSize(0)
            .lineWidth(0)
            .lineColor('#fff');

        chart.xAxis(x)
             .yAxis(y)
            .title("Total number of Apps by genre");

        var series = new insight.RowSeries('genre', genreData, x, y)
                                .valueFunction(function(d){ return d.value.Count; });

        chart.series([series]);
        chartGroup.add(chart);

        return chart;
    }

    angular.module('insightChartsControllers').controller('Index', ['$scope', 'Examples',
        function($scope, Examples)
        {
            $scope.examples = Examples.query();
            $scope.$parent.title = 'InsightJS - Open Source Analytics and Visualization for JavaScript';

            var chartGroup, genreGrouping, languageGrouping;

            $scope.filter = function(genres, languages) {

                chartGroup.clearFilters();

                if (genres) {
                    genres.forEach(function(genre) {
                        chartGroup.filterByGrouping(genreGrouping, genre);
                    });
                }

                if (languages) {

                    languages.forEach(function(language) {
                        chartGroup.filterByGrouping(languageGrouping, language);
                    });

                }

            };

            $scope.clearFilters = function() {
                chartGroup.clearFilters();
            };

            // need to improve dependency management here, to allow the controller to know that it will need to load d3 and insight instead of just assuming they'll be there
            d3.json('datasets/appstore.json', function(data)
            {
                preprocess(data);                

                var dataset = new insight.DataSet(data);
                chartGroup = new insight.ChartGroup();

                genreGrouping = dataset.group('genre', function(d)
                    {
                        return d.primaryGenreName;
                    })
                    .sum(['userRatingCount'])
                    .mean(['price', 'averageUserRating', 'userRatingCount', 'fileSizeBytes']);

                languageGrouping = dataset.group('languages', function(d)
                {
                    return d.languageCodesISO2A;
                }, true)
                .count(['languageCodesISO2A']);

                var genreChart = createGenreCountChart(chartGroup, genreGrouping);
                var bubbleChart = createBubbleChart(chartGroup, genreGrouping);
                var languageChart = createLanguageChart(chartGroup, languageGrouping);
                
                chartGroup.draw();

            });
        }
    ]);
}());