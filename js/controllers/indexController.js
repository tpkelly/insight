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
                .width(400)
                .height(300)
                .margin(
                {
                    top: 30,
                    left: 40,
                    right: 30,
                    bottom: 50
                });

            var bubbleX = new insight.Axis('Average Rating', insight.Scales.Linear)
                .tickSize(5)
                .tickPadding(0)
                .tickOrientation('tb');

            var bubbleY = new insight.Axis('$', insight.Scales.Linear)
                .tickSize(5);

            bubbleChart.xAxis(bubbleX)
                       .yAxis(bubbleY);

            var bubbles = new insight.BubbleSeries('bubbles', bubbleData, bubbleX, bubbleY, '#336699')
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
                .width(400)
                .height(300)
                .margin(
                {
                    top: 30,
                    left: 50,
                    right: 0,
                    bottom: 50
                });

            var x = new insight.Axis('Language', insight.Scales.Ordinal)
                .tickSize(5)
                .tickPadding(0)
                .tickOrientation('tb')
                .ordered(true);

            var y = new insight.Axis('', insight.Scales.Linear);

            chart.xAxis(x)
                 .yAxis(y);

            var lSeries = new insight.ColumnSeries('languages', languages, x, y, '#336699')
                .top(10);

            chart.series([lSeries]);
            chartGroup.add(chart);
    }

    function createGenreCountChart(chartGroup, genreData){

        var chart = new insight.Chart('Genre Chart', "#genre-count")
                .width(500)
                .height(325)
                .margin(
                {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 120
                });

        var x = new insight.Axis('', insight.Scales.Ordinal)
            .tickSize(5)
            .tickPadding(0)
            .tickOrientation('tb')
            .ordered(true);

        var y = new insight.Axis('Apps', insight.Scales.Linear)
                        .display(false);

        chart.xAxis(x)
             .yAxis(y);

        var series = new insight.ColumnSeries('genre', genreData, x, y, '#336699')
                                .valueFunction(function(d){ return d.value.Count; });

        chart.series([series]);
        chartGroup.add(chart);

        return chart;
    }

    function createTimeChart(chartGroup, timeData) {
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

            var xTime = new insight.Axis('', insight.Scales.Time)
                .tickOrientation('tb')
                .tickSize(5)
                .labelFormat(insight.Formatters.dateFormatter);

            var yTime = new insight.Axis('Apps', insight.Scales.Linear)
                .tickSize(5);

            timeChart.xAxis(xTime)
                     .yAxis(yTime);

            var cumulative = new insight.LineSeries('valueLine', timeData, xTime, yTime, '#336699')
                .valueFunction(function(d)
                {
                    return d.value.CountCumulative;
                }).showPoints(false);


            timeChart.series([cumulative]);

            timeChart.zoomable(xTime);
            chartGroup.add(timeChart);
    }



    function createAdvisoryChart(chartGroup, contentRating) {

        var chart = new insight.Chart('Languages', '#content-advisory')
                                    .width(250)
                                    .height(300)
                                    .margin({
                                        top: 30,
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
                           .orderingFunction(function(a,b) {
                                var aIndex = axisOrder.indexOf(a.key),
                                    bIndex = axisOrder.indexOf(b.key);

                                return bIndex - aIndex;
                           });
        chart.xAxis(x)
             .yAxis(y);

        var rowSeries = new insight.RowSeries('content', contentRating, x, y, '#336699')
                                   .valueFunction(function(d){ return d.value.Count;});
        
        chart.series().push(rowSeries);
        chartGroup.add(chart);
        
        return chart;
    }




    angular.module('insightChartsControllers').controller('Index', ['$scope', 'Examples',
        function($scope, Examples)
        {
            $scope.examples = Examples.query();
            $scope.$parent.title = 'Insight Charts - An open source analytics and visualization library for JavaScript';

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

                var dates = dataset.group('date', function(d)
                    {
                        return new Date(d.releaseDate.getFullYear(), d.releaseDate.getMonth(), 1);
                    })
                    .cumulative(['Count'])
                    .filterFunction(function(d)
                    {
                        return d.key < new Date(2014, 0, 1);
                    });

                var contentRating = dataset.group('contentRating', function(d)
                    {
                        return d.contentAdvisoryRating;
                    });

                var genreChart = createGenreCountChart(chartGroup, genres);
                var timeChart = createTimeChart(chartGroup, dates);
                var langChart = createAdvisoryChart(chartGroup, contentRating);
                var bubbleChart = createBubbleChart(chartGroup, genres);
                var languageChart = createLanguageChart(chartGroup, languages);
                
                chartGroup.draw();
            });
        }
    ]);
}());