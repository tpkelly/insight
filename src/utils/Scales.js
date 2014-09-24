insight.Scales = (function() {
    var exports = {};

    exports.Ordinal = {
        name: 'ordinal',
        scale: d3.scale.ordinal
    };
    exports.Linear = {
        name: 'linear',
        scale: d3.scale.linear
    };
    exports.Time = {
        name: 'time',
        scale: d3.time.scale
    };
    return exports;
}());
