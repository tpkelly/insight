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
            $scope.title = "Insight Charts";
            $scope.examples = Examples.query();
        }
    ]);

}());
