'use strict';

/* App Module */

var insightCharts = angular.module('insightCharts', [
  'ngRoute',
  'insightChartsControllers',
  'insightChartsServices'
]);

insightCharts.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index.html',
        controller: 'Index'
      }).
      when('/example/:example', {
         templateUrl: 'partials/example.html',
         controller: 'Example'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
