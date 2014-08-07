insight.Formatters = (function(d3) {
    var exports = {};

    exports.moduleProperty = 1;

    exports.currencyFormatter = function(value) {
        var format = d3.format(",.02f");
        return '£' + format(value);
    };

    exports.numberFormatter = function(value) {
        var format = d3.format(",.f");
        return format(value);
    };

    exports.dateFormatter = function(value) {
        var format = d3.time.format("%b %Y");
        return format(value);
    };

    exports.percentageFormatter = function(value) {
        var format = d3.format("%");
        return format(value);
    };

    exports.format = function(format, value) {
        var formatter = d3.format(format);
        return formatter(value);
    };

    return exports;
}(d3));
