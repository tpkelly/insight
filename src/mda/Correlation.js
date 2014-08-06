insight.correlation = (function(insight) {

    var correlation = {};

    correlation.fromValues = function(x, y) {

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

    };

    correlation.fromDataSet = function(dataset, correlationPairs) {

        var dataArray = getArray(dataset),
            propertyValues = {},
            results = {};

        correlationPairs.forEach(function(pair) {

            var x = pair[0],
                y = pair[1],
                r;

            addPropertyArrays(dataArray, propertyValues, [x, y]);

            r = insight.correlation.fromValues(propertyValues[x], propertyValues[y]);
            results[correlationPropertyName(x, y)] = r;
            results[correlationPropertyName(y, x)] = r;

        });

        return results;

    };

    function correlationPropertyName(x, y) {

        return x + '_Cor_' + y;

    }

    function addPropertyArrays(dataArray, container, propertyNames) {

        propertyNames.forEach(function(propertyName) {

            if (!container.hasOwnProperty(propertyName)) {

                container[propertyName] = dataArray.map(function(d) {
                    return d[propertyName];
                });

            }

        });

    }

    function getArray(obj) {

        if (obj instanceof insight.DataSet) {
            return obj.getData();
        }

        if (!insight.Utils.isArray(obj)) {
            throw new Error('correlation.fromDataSet expects an insight.DataSet or Array');
        }

        return obj;

    }

    function sum(array) {

        return array.reduce(function(previous, current) {

            if (!insight.Utils.isNumber(current)) {
                throw new Error('The correlation data contains non-numeric values.');
            }

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
