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
     * @param {Object} [errorContainer] An object that will contain
     * information about any errors that were encountered with the operation.
     * @returns {Number} - The pearson correlation coefficient for two arrays of numbers
     */
    correlation.fromValues = function(x, y, errorContainer) {

        if (!insight.Utils.isArray(x) || !insight.Utils.isArray(y) ||
            x.length !== y.length) {

            if (typeof errorContainer === 'object') {
                errorContainer.error = "Expects two arrays of equal length.";
            }
            return undefined;

        }


        var xyPairs = zipTwoArrays(x, y);
        var invalidPairs = xyPairs.filter(isNotPairOfNumbers);
        var validPairs = xyPairs.filter(isPairOfNumbers);
        var validX = validPairs.map(function(element) {
            return element.x;
        });
        var validY = validPairs.map(function(element) {
            return element.y;
        });

        if (typeof errorContainer === 'object') {
            errorContainer.ignoredValues = invalidPairs;
        }

        if (validX.length < 2) {
            return validX.length;
        }

        var meanX = mean(validX);
        var meanY = mean(validY);
        var xDeviation = subtract(validX, meanX);
        var yDeviation = subtract(validY, meanY);
        var xDeviationSquared = multiply(xDeviation, xDeviation);
        var yDeviationSquared = multiply(yDeviation, yDeviation);

        var deviationProduct = multiply(xDeviation, yDeviation);
        var r = sum(deviationProduct) / Math.sqrt(sum(xDeviationSquared) * sum(yDeviationSquared));

        return r;

    };

    /**
     * Calculates the pearson correlation coefficients for a given property pair in the dataset.
     * @memberof! insight.correlation
     * @param {insight.DatSet|Object[]} dataset The insight.DataSet or array to calculate correlation coefficients for.
     * @param {Function} xFunction A function that will return a value from one element in the dataset.
     * The value that the function returns will be used in the correlation calculation.
     * @param {Function} yFunction A function that will return a value from one element in the dataset.
     * The value that the function returns will be used in the correlation calculation.
     * @param {Object} [errorContainer] An object that will contain
     * information about any errors that were encountered with the operation.
     * @returns {Number} - The pearson correlation coefficient for the given property pair in the dataset.
     */
    correlation.fromDataSet = function(dataset, xFunction, yFunction, errorContainer) {

        var dataArray = getArray(dataset);

        if (!insight.Utils.isArray(dataArray)) {

            if (typeof errorContainer === 'object') {
                errorContainer.message = 'insight.correlation.fromDataSet expects first argument to be an insight.DataSet or an object Array.';
            }

            return undefined;

        }

        if (!insight.Utils.isFunction(xFunction) || !insight.Utils.isFunction(yFunction)) {

            if (typeof errorContainer === 'object') {
                errorContainer.message = 'insight.correlation.fromDataSet expects second and third arguments to be functions.';
            }

            return undefined;
        }

        var x = dataArray.map(xFunction);
        var y = dataArray.map(yFunction);

        var r = insight.correlation.fromValues(x, y);

        return r;
    };

    /*
     * Returns an array based on the given object.
     * If the object is an insight.DataSet then its data is returned, otherwise the array id returned directly.
     */
    function getArray(obj) {

        if (obj instanceof insight.DataSet) {
            return obj.getData();
        }

        return obj;

    }

    /*
     * Takes two input sequences and produces an output sequence where elements with the same index are stored in a single object.
     * Assumes that both arrays have the same length.
     */
    function zipTwoArrays(x, y) {
        var results = x.map(function(xValue, index) {
            var yValue = y[index];
            return {
                x: xValue,
                y: yValue,
                index: index
            };
        });

        return results;
    }

    function isPairOfNumbers(element) {
        var result = insight.Utils.isNumber(element.x) && insight.Utils.isNumber(element.y);

        return result;
    }

    function isNotPairOfNumbers(element) {
        return !isPairOfNumbers(element);
    }

    /*
     * Sums the elements of an array;
     */
    function sum(array) {

        return array.reduce(function(previous, current) {
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
