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
