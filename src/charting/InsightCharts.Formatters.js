var InsightFormatters = (function(d3)
{
    var exports = {};


    exports.moduleProperty = 1;

    exports.currencyFormatter = function(value)
    {
        var format = d3.format(",f");
        return '£' + format(value);
    };

    exports.dateFormatter = function(value)
    {
        var format = d3.time.format("%b %Y");
        return format(value);
    };

    exports.percentageFormatter = function(value)
    {
        var format = d3.format("%");
        return format(value);
    };

    return exports;
}(d3));
