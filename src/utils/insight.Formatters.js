/**
 * Convenience formatters for formatting string values.
 * @namespace insight.formatters
 */
insight.formatters = (function(d3) {


    return {

        /** Format the number with $, thousand-groupings, and 2 decimal places.
         * @example 2345.2 becomes '$2,345.20'.
         * @memberof! insight.formatters
         * @param {Number} value The value to be formatted.
         * @returns {String} - The formatted value.
         */
        currencyFormatter: function(value) {
            var format = d3.format(",.02f");
            return '$' + format(value);
        },

        /** Format the number with thousand-groupings.
         * @example 2345.2234 becomes '2,345.2234'.
         * @memberof! insight.formatters
         * @param {Number} value The value to be formatted.
         * @returns {String} - The formatted value.
         */
        numberFormatter: function(value) {
            var format = d3.format(",.f");
            return format(value);
        },

        /** Format the date as a month and year.
         * @example new Date(2014,0,1) becomes 'Jan 2014'.
         * @memberof! insight.formatters
         * @param {Date} date The date to be formatted.
         * @returns {String} - The date formatted as a string.
         */
        dateFormatter: function(date) {
            var format = d3.time.format("%b %Y");
            return format(date);
        },

        /** Format the number as a percentage.
         * @example 0.15 becomes '15%'.
         * @memberof! insight.formatters
         * @param {Number} value The number to be formatted.
         * @returns {String} - The formatted value.
         */
        percentageFormatter: function(value) {
            var format = d3.format("%");
            return format(value);
        },

        /** A wrapper for <code>d3.format()</code>.
         * @see {@link https://github.com/mbostock/d3/wiki/Formatting#d3_format|D3 API reference} for more information.
         * @memberof! insight.formatters
         * @param {String} format The format to apply.
         * @param {Object} value The value to be formatted.
         * @returns {String} - The formatted value.
         */
        format: function(format, value) {
            var formatter = d3.format(format);
            return formatter(value);
        }

    };

}(d3));
