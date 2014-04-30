'use strict';

/* Controllers */

var insightChartsControllers = angular.module('insightChartsControllers', []);

insightChartsControllers.controller('Index', ['$scope', 'Examples',
    function($scope, Examples) {
        $scope.title = "moo";
        $scope.examples = Examples.query();
    } 
  ]
);

insightChartsControllers.controller('MainCtrl', ['$scope',
    function($scope) {
        $scope.title = "Index";
    } 
  ]
);


insightChartsControllers.controller('Example', ['$scope', '$routeParams', 'ExamplePage',
    function($scope, $routeParams, ExamplePage) {
        
        $scope.loadScript = function(script){
            $.ajax(
                {
                    url: script,
                    dataType:'html',
                    success: function(result){
                        $('#source').text(result);

                        var script   = document.createElement("script");
                        script.type  = "text/javascript";
                        script.text  = result;
                        document.body.appendChild(script);

                        Prism.highlightAll();
                    }
                }
            ); 
        };

        ExamplePage.get($routeParams.example, function(page){
          $scope.$parent.title = page.pageName;
          $scope.example = page;          
          $scope.loadScript(page.script);
        });

    } 
  ]
);