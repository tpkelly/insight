(function()
{
    'use strict';

    /* App Module */

    var insightCharts = angular.module('insightCharts', [
        'ngRoute',
        'insightChartsControllers',
        'insightChartsServices',
        'ui.bootstrap'
    ]);


    insightCharts.config(['$routeProvider',
        function($routeProvider)
        {
            $routeProvider.
            when('/',
            {
                templateUrl: 'partials/index.html',
                controller: 'Index'
            })
                .when('/example/:example',
                {
                    templateUrl: 'partials/example.html',
                    controller: 'Example'
                })
                .when('/explorer',
                {
                    templateUrl: 'partials/explorer.html',
                    controller: 'Explorer'
                })
                .otherwise(
                {
                    redirectTo: '/'
                });
        }
    ]);

}());

$('.dropdown-toggle')
    .click(function(e)
    {
        e.preventDefault();
        e.stopPropagation();

        return false;
    });
