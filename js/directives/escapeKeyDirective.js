/*
 * Allows a controller to do something when the user presses the escape key.
 */
angular.module('insightCharts').directive('ngEscapeKey', function ($document) {
    return function (scope, element, attrs) {

        $document.keydown(function (event) {
            if(event.which === 27) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEscapeKey);
                });

                event.preventDefault();
            }
        });

    };
});