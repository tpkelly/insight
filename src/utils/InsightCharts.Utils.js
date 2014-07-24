/**
 * This module contains some helper functions used throughout the library
 * @module InsightUtils
 */
insight.Utils = (function() {

    var exports = {};

    /**
     * This is a utility method used to check if an object is an array or not
     * @returns {boolean} return - is the object an array
     * @param {object} input - The object to check
     */
    exports.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };


    exports.isDate = function(obj) {
        return obj instanceof Date;
    };

    exports.isNumber = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Number]';
    };

    exports.removeMatchesFromArray = function(array, comparer) {
        var self = this;
        var matches = array.filter(comparer);
        matches.forEach(function(match) {
            self.removeItemFromArray(array, match);
        });
    };

    exports.removeItemFromArray = function(array, item) {
        var index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
        }
    };

    exports.arrayUnique = function(array) {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }

        return a;
    };

    /**
     * This function takes two objects and returns the union, with priority given to the first parameter in the event of clashes.
     * This bias is used for scenarios where user defined CSS properties must not override default values.
     * @returns {object} union - a shallow copy representing the union between the provided objects
     * @param {object} base - The base object to have priority in the union operation.
     * @param {object} extend - The object to extend from, adding any additional properties and values defined in this parameter.
     */
    exports.objectUnion = function(base, extend) {
        var merged = {},
            key = null;

        for (key in extend) {
            merged[key] = extend[key];
        }
        for (key in base) {
            merged[key] = base[key];
        }
        return merged;
    };

    /**
     * This function takes a SVG element and returns a bounding box of coordinates at each of its compass points
     * @returns {object} return - A bounding box object {nw: ..., n: ..., ne: ..., e: ..., se: ..., s: ..., sw: ..., w: ...}
     * @param {DOMElement} element - The element to measure
     */
    exports.getSVGBoundingBox = function(element) {

        var point = element.ownerSVGElement.createSVGPoint();

        var bbox = {},
            matrix = element.getCTM(),
            tbbox = element.getBBox(),
            width = tbbox.width,
            height = tbbox.height,
            x = tbbox.x,
            y = tbbox.y;

        point.x = x;
        point.y = y;
        bbox.nw = point.matrixTransform(matrix);
        point.x += width;
        bbox.ne = point.matrixTransform(matrix);
        point.y += height;
        bbox.se = point.matrixTransform(matrix);
        point.x -= width;
        bbox.sw = point.matrixTransform(matrix);
        point.y -= height / 2;
        bbox.w = point.matrixTransform(matrix);
        point.x += width;
        bbox.e = point.matrixTransform(matrix);
        point.x -= width / 2;
        point.y -= height / 2;
        bbox.n = point.matrixTransform(matrix);
        point.y += height;
        bbox.s = point.matrixTransform(matrix);

        return bbox;
    };


    exports.safeString = function(input) {
        return input.split(' ')
            .join('_');
    };

    exports.valueForKey = function(dictionary, key, keyFunction, valueFunction) {
        var values = dictionary.filter(function(item) {
            return keyFunction(item) == key;
        });
        return valueFunction(values[0]);
    };

    return exports;
}());
