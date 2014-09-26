insight.Constants = (function() {
    var exports = {};

    exports.Behind = 'behind';
    exports.Front = 'front';
    exports.ChartTitleClass = 'chart-title';
    exports.AxisTextClass = 'axis-text';
    exports.AxisLabelClass = 'axis-label';
    exports.YAxisClass = 'y-axis';
    exports.AxisClass = 'in-axis';
    exports.XAxisClass = 'x-axis';
    exports.XAxisRotation = 'rotate(90)';
    exports.Tooltip = 'd3-tip';
    exports.ToolTipTextClass = 'tooltip';
    exports.BarGroupClass = 'bargroup';
    exports.RowClass = 'row';
    exports.ColClass = 'col';
    exports.LineClass = 'in-line';
    exports.LinePoint = 'target-point';
    exports.ContainerClass = 'incontainer';
    exports.ChartSVG = 'chartSVG';
    exports.PlotArea = 'plotArea';
    exports.Legend = 'legend';
    exports.LegendView = 'legend-view';
    exports.Bubble = 'bubble';
    exports.Scatter = 'scatter';
    exports.Point = 'point';
    exports.TableClass = 'in-table';
    exports.TableRowClass = 'in-datarow';

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
