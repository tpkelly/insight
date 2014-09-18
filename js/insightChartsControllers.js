(function()
{
    'use strict';


    /* Controllers */

    var insightChartsControllers = angular.module('insightChartsControllers', [])
        .directive('reDraw', function()
        {
            return {
                link: function($scope, $element, $attrs)
                {
                    $scope.$watch($attrs.accessor + '()', function(v)
                    {
                        if (v) $element[0].value = v;
                    });
                    $element.bind('input', function(e)
                    {
                        $scope.$apply($attrs.accessor + '(' + e.target.value + ')');
                        $scope.$apply($attrs.func);
                    });
                }
            };
        });


    insightChartsControllers.controller('MainCtrl', ['$scope', 'Examples',
        function($scope, Examples)
        {
            $scope.title = "InsightJS";
            $scope.examples = Examples.query();
        }
    ]);

}());

(function()
{
    'use strict';

    angular.module('insightChartsControllers')
        .controller('Example', ['$scope', '$routeParams', 'ExamplePage',
            function($scope, $routeParams, ExamplePage)
            {
                $scope.onHtmlLoaded = function()
                {
                    $scope.loadContent();
                };

                $scope.loadContent = function()
                {

                    var script = $scope.page.script;
                    var css = $scope.page.partialCSS;

                    $.ajax(
                    {
                        url: script,
                        dataType: 'html',
                        success: function(result)
                        {

                            $('#source')
                                .text(result);

                            var script = document.createElement("script");
                            script.type = "text/javascript";
                            script.text = result;

                            var style = document.createElement("link");
                            style.type = "text/css";
                            style.rel = "stylesheet";
                            style.href = css;

                            document.body.appendChild(script);
                            document.body.appendChild(style);

                            Prism.highlightAll();
                        }
                    });
                };

                ExamplePage.get($routeParams.example, function(page)
                {
                    $scope.$parent.title = page.pageName;
                    $scope.page = page;
                });
            }
        ]);

}());

(function()
{
    'use strict';


    angular.module('insightChartsControllers').controller('Explorer', ['$scope', '$routeParams', 'DataSet',

        function($scope, $routeParams, DataSet)
        {


            var datasets = [
            {
                name: 'App Store',
                url: 'datasets/appstore.json'
            },
            {
                name: 'Revenue',
                url: 'datasets/revenuereport.json'
            }];

            $scope.dataset = {
                dummy: null,
                selectedItem : datasets[0],
                dimensions : [],
                groupings : [],
                ndx : {},
                measures : [],
                charts : [],
                selectedDimensions : [],
                selectedMeasures : []
            };
            
            $scope.chartId = 1;
            $scope.list1 = true;

            $scope.chartName = function(chart)
            {
                return chart.element.substr(1, chart.element.length);
            };

            $scope.isShown = function(chartType)
            {
                return chartType.Dimensions <= $scope.dataset.selectedDimensions.length && chartType.Measures <= $scope.dataset.selectedMeasures.length;
            };

            $scope.redraw = function(chart)
            {
                chart.draw();
            };

            $scope.createBarChart = function()
            {
                var measures = $scope.dataset.selectedMeasures.slice(0);
                var dimension = $scope.dataset.selectedDimensions.slice(0)[0];

                var grouping = new Grouping(dimension)
                    .average(measures);

                grouping.initialize();

                console.log(grouping.getData());

                var chart = new Chart('Chart ' + $scope.chartId, "#chart" + $scope.chartId, dimension)
                    .width(400)
                    .height(350)
                    .margin(
                    {
                        top: 10,
                        left: 100,
                        right: 40,
                        bottom: 120
                    })
                    .barPadding(0.3);

                var xScale = new Scale(chart, dimension.Name, d3.scale.ordinal(), 'h', 'ordinal');
                var yScale = new Scale(chart, "# Apps", d3.scale.linear(), 'v', 'linear');

                var series = new ColumnSeries('genre', chart, grouping, xScale, yScale, 'silver');

                series.series = [
                {
                    name: dimension.Name,
                    accessor: function(d)
                    {
                        return d.value.Count;
                    },
                    label: function(d)
                    {
                        return d.key;
                    },
                    color: '#2980b9',
                    tooltipValue: function(d)
                    {
                        return d.value.Count;
                    }
                }];

                chart.series([series]);

                var xAxis = new Axis(chart, "x", xScale, 'bottom')
                    .tickSize(5)
                    .tickPadding(0)
                    .labelOrientation('tb');

                var yAxis = new Axis(chart, "y", yScale, 'left')
                    .tickSize(5);

                $scope.chartId++;

                $scope.dataset.chartgroup.addChart(chart);
                $scope.dataset.charts.push(chart);

                chart.init(true, '#chartPanel');
            };

            $scope.createBubbleChart = function()
            {
                var measures = $scope.dataset.selectedMeasures.slice(0);
                var dimension = $scope.dataset.selectedDimensions.slice(0)[0];

                var chart = new Chart('Chart ' + $scope.chartId, "#chart" + $scope.chartId, dimension)
                    .width(400)
                    .height(350)
                    .margin(
                    {
                        top: 10,
                        left: 50,
                        right: 40,
                        bottom: 60
                    });


                var grouping = new Grouping(dimension)
                    .average(measures);

                grouping.initialize();

                console.log(grouping.getData());

                var bubbleX = new Scale(chart, measures[0], d3.scale.linear(), 'h', 'linear');
                var bubbleY = new Scale(chart, measures[1], d3.scale.linear(), 'v', 'linear');

                var bubbles = new BubbleSeries('bubbles' + $scope.chartId, chart, grouping, bubbleX, bubbleY, 'cyan')
                    .xFunction(function(d)
                    {
                        return d.value[measures[0]].Average;
                    })
                    .yFunction(function(d)
                    {
                        return d.value[measures[1]].Average;
                    })
                    .tooltipLabelFormat(function(d)
                    {
                        return d.key;
                    })
                    .radiusFunction(function(d)
                    {
                        return d.value.Count;
                    })
                    .tooltipFunction(function(d)
                    {
                        return d.value.Count;
                    });

                chart.series([bubbles]);

                var bubbleXAxis = new Axis(chart, "x", bubbleX, 'bottom')
                    .tickSize(5)
                    .tickPadding(0)
                    .labelOrientation('tb')
                    .format(d3.format("0,000"));

                var bubbleYAxis = new Axis(chart, "y", bubbleY, 'left')
                    .tickSize(5)
                    .format(d3.format("0,000"));

                $scope.chartId++;

                $scope.dataset.chartgroup.addChart(chart);
                $scope.dataset.charts.push(chart);

                chart.init(true, '#chartPanel');

            };

            $scope.drawCharts = function() {

            };


            $scope.addDimension = function(field)
            {
                var dim = $scope.dataset.chartgroup.addDimension($scope.dataset.ndx, field, function(d)
                {
                    return d[field];
                }, function(d)
                {
                    return d[field];
                });
                $scope.dataset.dimensions.push(dim);
            };

            $scope.addMeasure = function(field)
            {
                $scope.dataset.measures.push(field);
            };


            $scope.dimensionSelected = function(dimension)
            {
                var index = $scope.dataset.selectedDimensions.indexOf(dimension);

                if (index == -1)
                {
                    $scope.dataset.selectedDimensions.push(dimension);
                }
                else
                {
                    $scope.dataset.selectedDimensions.splice(index, 1);
                }
            };


            $scope.measureSelected = function(measure)
            {

                var index = $scope.dataset.selectedMeasures.indexOf(measure);
                if (index == -1)
                {
                    $scope.dataset.selectedMeasures.push(measure);
                }
                else
                {
                    $scope.dataset.selectedMeasures.splice(index, 1);
                }
            };

            $scope.updateDataSet = function()
            {
                $scope.loadData($scope.dataset.selectedItem);
            };


            $scope.newChart = function()
            {
                var chart = new Chart('Chart ' + $scope.chartId, "#genreCount", null)
                    .width(400)
                    .height(350)
                    .margin(
                    {
                        top: 10,
                        left: 40,
                        right: 40,
                        bottom: 40
                    });

                $scope.chartId++;

                $scope.dataset.chartgroup.addChart(chart);
            };

            $scope.loadData = function(dataset)
            {

                DataSet.get(dataset.url, function(data)
                {
                    $scope.data = data;
                    $scope.loadFields();
                    $scope.dataset.measures = [];
                    $scope.dataset.charts = [];
                    $scope.dataset.dimensions = [];

                    //preprocessing
                    $scope.dataset.ndx = crossfilter(data);
                    $scope.dataset.chartgroup = new ChartGroup($scope.dataset.name);
                });
            };

            $scope.loadFields = function()
            {
                $scope.fields = Object.keys($scope.data[0]);
            };

            $scope.$parent.title = 'Explorer';

            $scope.datasets = datasets;
            $scope.fields = [];

            $scope.dataset.chartTypes = [
            {
                Type: 'Bubble',
                Icon: '/css/images/bubble.png',
                Dimensions: 1,
                Measures: 2,
                Create: $scope.createBubbleChart
            },
            {
                Type: 'Bar',
                Dimensions: 1,
                Icon: '/css/images/bar.png',
                Measures: 0,
                Create: $scope.createBarChart
            },
            {
                Type: 'Line',
                Icon: '/css/images/line.png',
                Dimensions: 1,
                Measures: 1,
                Create: $scope.createLineChart
            }];


            $scope.loadData(datasets[0]);
        }
    ]);
}());

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
function createBubbleChart(chartGroup, bubbleData) {

    var bubbleChart = new insight.Chart('Bubble chart', '#bubble-chart')
        .width(300)
        .height(400);

    var xAxis = new insight.Axis('Average Rating', insight.Scales.Linear)
        .tickFrequency(1);

    var yAxis = new insight.Axis('', insight.Scales.Linear)
        .tickLabelFormat(insight.Formatters.currencyFormatter);

    bubbleChart
        .xAxis(xAxis)
        .yAxis(yAxis)
        .title('App price vs. rating vs. filesize (radius)');

    var bubbles = new insight.BubbleSeries('bubbles', bubbleData, xAxis, yAxis)
        .keyFunction(function(d) {
            return d.value.averageUserRating.Average;
        })
        .valueFunction(function(d) {
            return d.value.price.Average;
        })
        .radiusFunction(function(d) {
            return Math.sqrt(d.value.fileSizeBytes.Average);
        })
        .tooltipFunction(function(d) {
            var fileSize = d.value.fileSizeBytes.Average / 1024 / 1024;
            return d.key + ": " + Math.round(fileSize) + "MB";
        });

    bubbleChart.series([bubbles]);
    chartGroup.add(bubbleChart);
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
}

function createLanguageChart(chartGroup, languages){

    var chart = new insight.Chart('Chart 2', '#languages')
        .width(350)
        .height(400);

    var x = new insight.Axis('Language', insight.Scales.Ordinal)
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
