insight.Constants = (function() {
    var exports = {};

    exports.Behind = 'behind';
    exports.Front = 'front';
    exports.AxisTextClass = 'axis-text';
    exports.AxisLabelClass = 'axis-label';
    exports.YAxisClass = 'y-axis';
    exports.AxisClass = 'in-axis';
    exports.XAxisClass = 'x-axis';
    exports.XAxisRotation = 'rotate(90)';
    exports.Tooltip = 'd3-tip';
    exports.ToolTipTextClass = 'tooltip';
    exports.BarGroupClass = 'bargroup';
    exports.ContainerClass = 'incontainer';
    exports.ChartSVG = 'chartSVG';
    exports.Bubble = 'bubble';
    exports.Scatter = 'scatter';
    exports.TableClass = 'insight-table';
    exports.TableRowClass = 'in_datarow';

    return exports;
}());


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
