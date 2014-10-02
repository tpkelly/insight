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

    angular.module('insightChartsControllers').controller('Index', ['$scope', 'Examples', '$http',
        function($scope, Examples, $http)
        {
            $scope.examples = Examples.query();
            $scope.$parent.title = 'InsightJS - Open Source Analytics and Visualization for JavaScript';

            var chartGroup, genreGrouping, languageGrouping;

            var tooltip = d3.tip();
            var visibleButton = null;

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


            $scope.prepareTooltip = function (filePath, targetId) {

                $http.get(filePath).success(function(content) {

                    var codedContent = '<pre class="language-javascript">' + content + '</pre>';

                    tooltip.html(d3.functor(codedContent));

                    var element = d3.select(targetId)
                        .call(tooltip)
                        .on('click', $scope.toggleTooltipVisibilty);

                });

            };

            $scope.$on('$routeChangeStart', function(next, current) {
                tooltip.hide();
            });

            $scope.toggleTooltipVisibilty = function() {
                var textElement = d3.select(this.previousElementSibling);
                if (visibleButton) {
                    visibleButton.text("See the code");
                }

                if (tooltip.style('opacity') === "0") {
                    tooltip.show();
                    textElement.text("Hide the code");
                    visibleButton = textElement;
                }
                else {
                    tooltip.hide();
                }
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