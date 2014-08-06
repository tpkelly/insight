/**
 * Module for calculating correlation coefficients on pairs of values.
 * @namespace insight.correlation
 */
insight.correlation = (function(insight) {

    var correlation = {};

    /**
     * Calculates the pearson correlation coefficient for two arrays of numbers.
     * The two arrays must be equal in length and must only contain numbers.
     * @memberof! insight.correlation
     * @param {Array<Number>} x The x values
     * @param {Array<Number>} y The y values
     * @returns {Number} The pearson correlation coefficient for two arrays of numbers
     */
    correlation.fromValues = function(x, y) {

        if (!insight.Utils.isArray(x) || !insight.Utils.isArray(y) ||
            x.length !== y.length ||
            x.length === 0) {

            throw new Error('correlation.fromValues expects two non-empty array parameters of equal length');

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

    /**
     * Calculates the pearson correlation coefficients for all given property pairs in the given dataset.
     * @memberof! insight.correlation
     * @param {insight.DatSet|Array<Object>} dataset The insight.DataSet or
     * array to calclulate correlation coefficients for.
     * @param {Array<String[]>} correlationPairs An array of pairs of property names to calculate correlation coefficients
     * for. Each element of the array must be an array of two strings.
     * @returns {Object} An object containing properties for all correlation pairs e.g. { X_Cor_Y: 0.75 }
     */
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

    /*
     * Returns the property name to use for a correlation between two properties, x and y.
     */
    function correlationPropertyName(x, y) {

        return x + '_Cor_' + y;

    }

    /*
     * Adds an array to the container for each element in propertyNames.
     * An array will not be added to the container object if it has been added before.
     * Each array will contain the 'propertyName' property from the object in dataArray.
     */
    function addPropertyArrays(dataArray, container, propertyNames) {

        propertyNames.forEach(function(propertyName) {

            if (!container.hasOwnProperty(propertyName)) {

                container[propertyName] = dataArray.map(function(d) {
                    return d[propertyName];
                });

            }

        });

    }

    /*
     * Returns an array based on the given object.
     * If the object is an insight.DataSet then its data is returned, otherwise the array id returned directly.
     */
    function getArray(obj) {

        if (obj instanceof insight.DataSet) {
            return obj.getData();
        }

        if (!insight.Utils.isArray(obj)) {
            throw new Error('correlation.fromDataSet expects an insight.DataSet or Array');
        }

        return obj;

    }

    /*
     * Sums the elements of an array;
     */
    function sum(array) {

        return array.reduce(function(previous, current) {

            if (!insight.Utils.isNumber(current)) {
                throw new Error('The correlation data contains non-numeric values.');
            }

            return previous + current;

        });

    }

    /*
     * Calculates the mean of all elements in an array
     */
    function mean(array) {

        return sum(array) / array.length;

    }

    /*
     * Multiplies each element in an array with the corresponding element
     * in another array and returns a new array with the results.
     */
    function multiply(array1, array2) {

        var multiplied = [];

        for (var i = 0; i < array1.length; i++) {

            multiplied.push(array1[i] * array2[i]);

        }

        return multiplied;

    }

    /*
     * Subtracts a constant from each element in an array and returns a new array with the results.
     */
    function subtract(array, constant) {

        return array.map(function(d) {

            return d - constant;

        });

    }

    return correlation;

})(insight);
