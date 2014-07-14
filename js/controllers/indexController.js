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

    function createBubbleChart(bubbleData) {

        var bubbleChart = new insight.Chart('Chart 3', '#bubble-chart')
                .width(400)
                .height(300)
                .margin(
                {
                    top: 30,
                    left: 40,
                    right: 30,
                    bottom: 50
                });

            var bubbleX = new insight.Axis(bubbleChart, 'Average Rating', 'h', insight.Scales.Linear, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .tickOrientation('tb');

            var bubbleY = new insight.Axis(bubbleChart, '$', 'v', insight.Scales.Linear, 'left')
                .tickSize(5);

            var bubbles = new insight.BubbleSeries('bubbles', bubbleChart, bubbleData, bubbleX, bubbleY, '#336699')
                .xFunction(function(d)
                {
                    return d.value.averageUserRating.Average;
                })
                .yFunction(function(d)
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

    }

    function createLanguageChart(languages){

        var chart = new insight.Chart('Chart 2', '#languages')
                .width(400)
                .height(300)
                .margin(
                {
                    top: 30,
                    left: 50,
                    right: 0,
                    bottom: 50
                });

            var x = new insight.Axis(chart, 'Language', 'h', insight.Scales.Ordinal, 'bottom')
                .textAnchor('start')
                .tickSize(5)
                .tickPadding(0)
                .tickOrientation('tb')
                .ordered(true);

            var y = new insight.Axis(chart, '', 'v', insight.Scales.Linear, 'left');

            var lSeries = new insight.ColumnSeries('languages', chart, languages, x, y, '#336699')
                .top(10);

            chart.series([lSeries]);
    }

    function createGenreCountChart(genreData){

        var chart = new insight.Chart('Genre Chart', "#genre-count")
                .width(500)
                .height(325)
                .margin(
                {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 120
                })
                .barPadding(0.3);

        var x = new insight.Axis(chart, '', 'h', insight.Scales.Ordinal, 'bottom')
            .textAnchor('start')
            .tickSize(5)
            .tickPadding(0)
            .tickOrientation('tb')
            .ordered(true);

        var y = new insight.Axis(chart, 'Apps', 'v', insight.Scales.Linear, 'left')
                           .display(false);

        var series = new insight.ColumnSeries('genre', chart, genreData, x, y, '#336699')
                                .valueFunction(function(d){return d.value.Count;});

        chart.series([series]);

        return chart;
    }

    function createTimeChart(timeData) {
        var timeChart = new insight.Chart('Releases over time', '#time-releases')
                .width(600)
                .height(325)
                .margin(
                {
                    top: 0,
                    left: 90,
                    right: 0,
                    bottom: 100
                });

            var xTime = new insight.Axis(timeChart, '', 'h', insight.Scales.Time, 'bottom')
                .tickOrientation('tb')
                .tickSize(5)
                .textAnchor('start')
                .labelFormat(InsightFormatters.dateFormatter);

            var yTime = new insight.Axis(timeChart, 'Apps', 'v', insight.Scales.Linear, 'left')
                .tickSize(5);

            var line = new insight.LineSeries('valueLine', timeChart, timeData, xTime, yTime, '#336699')
                .valueFunction(function(d)
                {
                    return d.value.CountCumulative;
                }).showPoints(false);


            timeChart.series()
                .push(line);

            timeChart.zoomable(xTime);
    }




    function createAdvisoryChart(contentRating) {

        var chart = new insight.Chart('Languages', '#content-advisory')
                                    .width(250)
                                    .height(300)
                                    .margin({
                                        top: 30,
                                        bottom: 50,
                                        left: 100,
                                        right: 0
                                    });

        var x = new insight.Axis(chart, '', 'h', insight.Scales.Linear, 'bottom').display(false);

        var y = new insight.Axis(chart, '', 'v', insight.Scales.Ordinal, 'left')
                           .ordered(true);

        var rowSeries = new insight.RowSeries('content', chart, contentRating, x, y, '#336699')
                                   .valueFunction(function(d){ return d.value.Count;});
        
        chart.series().push(rowSeries);

        return chart;
    }




    angular.module('insightChartsControllers').controller('Index', ['$scope', 'Examples',
        function($scope, Examples)
        {
            insight.init();

            $scope.examples = Examples.query();
            $scope.$parent.title = 'Insight Charts';

            // need to improve dependency management here, to allow the controller to know that it will need to load d3 and insight instead of just assuming they'll be there
            d3.json('/datasets/appstore.json', function(data)
            {
                preprocess(data);                

                console.log(data);

                var dataset = new insight.DataSet(data);

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

                var dates = dataset.group('date', function(d)
                    {
                        return new Date(d.releaseDate.getFullYear(), d.releaseDate.getMonth(), 1);
                    })
                    .cumulative(['Count'])
                    .filter(function(d)
                    {
                        return d.key < new Date(2014, 0, 1);
                    });

                var contentRating = dataset.group('contentRating', function(d)
                    {
                        return d.contentAdvisoryRating;
                    });

                var genreChart = createGenreCountChart(genres);
                var timeChart = createTimeChart(dates);
                var langChart = createAdvisoryChart(contentRating);
                var bubbleChart = createBubbleChart(genres);
                var languageChart = createLanguageChart(languages);
                insight.drawCharts();
            });
        }
    ]);
}());