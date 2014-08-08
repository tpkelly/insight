/**
 * Convenience formatters for formatting string values.
 */
insight.Formatters = (function(d3) {
    var exports = {};

    exports.moduleProperty = 1;

    /** Format the string with £, thousand-groupings, and 2 decimal places.
     * E.g. `2345.2` becomes `£2,345.20`.
     * @param {String} value The value to be formatted.
     * @returns {String} - The formatted value.
     */
    exports.currencyFormatter = function(value) {
        var format = d3.format(",.02f");
        return '£' + format(value);
    };

    /** Format the string with thousand-groupings.
     * E.g. `2345.2234` becomes `2,345.2234`.
     * @param {String} value The value to be formatted.
     * @returns {String} - The formatted value.
     */
    exports.numberFormatter = function(value) {
        var format = d3.format(",.f");
        return format(value);
    };

    /** Format the date as a month and year.
     * E.g. `new Date(2014,0,1)` becomes `Jan 2014`.
     * @param {Date} date The date to be formatted.
     * @returns {String} - The date formatted as a string.
     */
    exports.dateFormatter = function(date) {
        var format = d3.time.format("%b %Y");
        return format(date);
    };

    /** Format the number as a percentage.
     * E.g. `0.15` becomes `15%`.
     * @param {Number} value The number to be formatted.
     * @returns {String} - The formatted value.
     */
    exports.percentageFormatter = function(value) {
        var format = d3.format("%");
        return format(value);
    };

    /** A wrapper for d3.format().
     * See <a href="https://github.com/mbostock/d3/wiki/Formatting#d3_format">D3 API reference</a> for more information.
     * @param {String} format The format to apply.
     * @param {Object} value The value to be formatted.
     * @returns {String} - The formatted value.
     */
    exports.format = function(format, value) {
        var formatter = d3.format(format);
        return formatter(value);
    };

    return exports;
}(d3));
