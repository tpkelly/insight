(function() {
    'use strict';


    /* Controllers */

    var insightChartsControllers = angular.module('insightChartsControllers', []);

    insightChartsControllers.controller('Index', ['$scope', 'Examples',
        function($scope, Examples) {
            $scope.examples = Examples.query();
        }
    ]);

    insightChartsControllers.controller('MainCtrl', ['$scope', 'Examples',
        function($scope, Examples) {
            $scope.title = "Insight Charts";
            $scope.examples = Examples.query();
        }
    ]);


    insightChartsControllers.controller('Example', ['$scope', '$routeParams', 'ExamplePage',
        function($scope, $routeParams, ExamplePage) {

            $scope.onHtmlLoaded = function() {
                $scope.loadContent();
            };


            $scope.loadContent = function() {

                var script = $scope.page.script;
                var css = $scope.page.partialCSS;
                
                $.ajax({
                    url: script,
                    dataType: 'html',
                    success: function(result) {
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


            ExamplePage.get($routeParams.example, function(page) {
                $scope.$parent.title = page.pageName;
                $scope.page = page;
            });

        }
    ]);
}());
