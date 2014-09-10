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

        var bubbleChart = new insight.Chart('Chart 3', '#bubble-chart')
                .width(300)
                .height(400)
                .margin(
                {
                    top: 30,
                    left: 40,
                    right: 30,
                    bottom: 50
                });

            var bubbleX = new insight.Axis('Average Rating', insight.Scales.Linear)
                .tickSize(5)
                .tickPadding(0);

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
                    return d.value.fileSizeBytes.Average;
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
                .tickPadding(0)
                .isOrdered(true);

            var y = new insight.Axis('', insight.Scales.Linear);

            chart.xAxis(x)
                 .yAxis(y);

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
                        .hasReversedPosition(true);

        chart.xAxis(x)
             .yAxis(y);

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

            // need to improve dependency management here, to allow the controller to know that it will need to load d3 and insight instead of just assuming they'll be there
            d3.json('datasets/appstore.json', function(data)
            {
                preprocess(data);                

                var dataset = new insight.DataSet(data);
                var chartGroup = new insight.ChartGroup();

                var genres = dataset.group('genre', function(d)
                    {
                        return d.primaryGenreName;
                    })
                    .sum(['userRatingCount'])
                    .mean(['price', 'averageUserRating', 'userRatingCount', 'fileSizeBytes']);

                var languages = dataset.group('languages', function(d)
                {
                    return d.languageCodesISO2A;
                }, true)
                .count(['languageCodesISO2A']);

                var genreChart = createGenreCountChart(chartGroup, genres);
                var bubbleChart = createBubbleChart(chartGroup, genres);
                var languageChart = createLanguageChart(chartGroup, languages);
                
                chartGroup.draw();
            });
        }
    ]);
}());