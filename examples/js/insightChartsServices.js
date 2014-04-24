'use strict';

/* Services */

var insightChartsServices = angular.module('insightChartsServices', ['ngResource']);

insightChartsServices.factory('Examples', ['$resource',
  function($resource){
    return $resource('pages.json', {}, {
      query: {method:'GET', params:{}, isArray:true}
    });
  }]);


insightChartsServices.factory('ExamplePage', ['$http',
  
  function($http){
    
    var factory = {};
    
    factory.get = function(input, callback){
        $http.get('pages.json').success(function(data){
        var page = data.filter(function(item){return item.name == input; });
        if (page.length==1)
        {
            callback(page[0]);
        }

        return [];
    });
    };

    return factory;
  }]);