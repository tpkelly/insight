insight.Correlation = (function(insight) {

    function Correlation(xValues, yValues) {

        var self = this,
            x = xValues,
            y = yValues;

        function sum(array) {

            return array.reduce(function(previous, current) {

                return previous + current;

            });

        }

        function mean(array) {

            return sum(array) / array.length;

        }

        function multiply(array1, array2) {

            var multiplied = [];

            for (var i = 0; i < array1.length; i++) {

                multiplied.push(array1[i] * array2[i]);

            }

            return multiplied;

        }

        function subtract(array, constant) {

            return array.map(function(d) {

                return d - constant;

            });

        }

        self.pearson = function pearson() {

            var meanX = mean(x),
                meanY = mean(y),
                sumX = sum(x),
                sumY = sum(y),
                xDeviation = subtract(x, meanX),
                yDeviation = subtract(y, meanY),
                xDeviationSquared = multiply(xDeviation, xDeviation),
                yDeviationSquared = multiply(yDeviation, yDeviation),
                deviationProduct = multiply(xDeviation, yDeviation),
                sumDeviationProduct = sum(deviationProduct),
                r = sum(multiply(xDeviation, yDeviation)) / Math.sqrt(sum(xDeviationSquared) * sum(yDeviationSquared));

            return r;

        };

    }

    return Correlation;

})(insight);
