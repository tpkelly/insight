insight.correlation = (function(insight) {

    return {
        fromValues: function(x, y) {

            if (!insight.Utils.isArray(x) || !insight.Utils.isArray(y) ||
                x.length !== y.length) {

                throw new Error('correlation.fromValues expects two array parameters of equal length');

            }

            var meanX = mean(x),
                meanY = mean(y),
                xDeviation = subtract(x, meanX),
                yDeviation = subtract(y, meanY),
                xDeviationSquared = multiply(xDeviation, xDeviation),
                yDeviationSquared = multiply(yDeviation, yDeviation),

                deviationProduct = multiply(xDeviation, yDeviation),
                r = sum(deviationProduct) / Math.sqrt(sum(xDeviationSquared) * sum(yDeviationSquared));

            return r;

        },

        fromDataSet: function(dataset, correlationPairs) {



        }
    };

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

    return correlation;

})(insight);
