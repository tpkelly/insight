var InsightConstants = (function() {
    var exports = {};

    exports.Behind = 'behind';
    exports.Front = 'front';
    exports.AxisTextClass = 'axis-text';
    exports.AxisLabelClass = 'axis-label';
    exports.YAxisClass = 'y-axis';
    exports.AxisClass = 'in-axis';
    exports.XAxisClass = 'x-axis';
    exports.XAxisRotation = "rotate(90)";
    exports.ToolTipTextClass = "tipValue";
    exports.ToolTipLabelClass = "tipLabel";
    exports.BarGroupClass = "bargroup";
    exports.ContainerClass = "incontainer";
    exports.ChartSVG = "chartSVG";
    exports.Bubble = "bubble";
    return exports;
}());


/**
 * This modules contains some helper functions used throughout the library
 * @module InsightUtils
 */
var InsightUtils = (function() {

    var exports = {};

    /**
     * This is a utility method used to check if an object is an array or not
     * @returns {boolean} return - is the object an array
     * @param {object} input - The object to check
     */
    exports.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    return exports;
}());
