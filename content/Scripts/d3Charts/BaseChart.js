var BaseChart = function BaseChart(name, element, dimension, group) {
    this.element = element;
    this.dimension = dimension;
    this.group = group;
    this._name = name;
    this._displayName = name;
    this._keyAccessor = function (d) { return d.key; };
    this._barColor = '#acc3ee';
    this._valueAccessor = function (d) { return d.value; };
    this._limitFunction = function (d) { return true; };
    this._labelAccessor = function (d) { return d.key; };
    this._tooltipFormat = function (d) { return d; };
    this._yAxisFormat = function (d) { return d; };
    this._currentMax = 0;
    this._cumulative = false;
    this._labelFontSize = "11px";
    this._targets = [];
    this.series = [];
    this._ranges = [];
    this._redrawAxes = false;
    this.isFiltered = false;
    this._margin = { top: 0, bottom: 0, left: 0, right: 0 };
    this.duration = 500;
    this.filters = [];
    this._labelPadding = 20;
    this.hasTooltip = false;
    this.tooltipText = "";
    this._invert = false;
}

BaseChart.prototype.displayName = function(name)
{
    if (!arguments.length) { return this._displayName }
    this._displayName = name;
    return this;
}

BaseChart.prototype.width = function (w) {
    if (!arguments.length) { return this._width }
    this._width = w;
    return this;
}

BaseChart.prototype.y = function (y) {
    if (!arguments.length) { return this._y; }
    this._y = y;
    return this;
}

BaseChart.prototype.x = function (x) {
    if (!arguments.length) { return this._x; }
    this._x = x;
    return this;
}

BaseChart.prototype.cumulative = function (v)
{
    if (!arguments.length) { return this._cumulative; }
    this._cumulative = v;
    return this;
}

BaseChart.prototype.updateMax = function (d) {
    var value = 0;
    this._currentMax = 0;

    if (this.series.length) {
        for (seriesFunction in this.series) {
            var func = this.cumulative() ? this.series[seriesFunction].cumulative : this.series[seriesFunction].calculation;
            value += func(d);
            this._currentMax = value > this._currentMax ? value : this._currentMax;
        }
    }
    else {
        value += this._valueAccessor(d);
        this._currentMax = value > this._currentMax ? value : this._currentMax;
    }
    if (this._targets.length)
    {
        for (target in this._targets)
        {
            var func = this.cumulative() ? this._targets[target].cumulative : this._targets[target].calculation;
            value = func(d);
            this._currentMax = value > this._currentMax ? value : this._currentMax;
        }
    }

    return this._currentMax;
}

BaseChart.prototype.findMax = function () {
    var self = this;
    var max = d3.max(this.dataset(), function (d) {
        return self.updateMax(d);
    });

    return max;
}

BaseChart.prototype.zeroValueEntry = function (d)
{
    var hasValue = 0;
    
    if (this.series.length) {
        for (seriesFunction in this.series) {
            var func = this.cumulative() ? this.series[seriesFunction].cumulative : this.series[seriesFunction].calculation;
            
            hasValue = hasValue | (Math.round(func(d),1) > 0);
        }
    }
    else {
        hasValue = hasValue | (Math.round(this._valueAccessor(d), 1) > 0);
        
    }
    if (this._targets.length) {
        for (target in this._targets) {
            var func = this.cumulative() ? this._targets[target].cumulative : this._targets[target].calculation;
            hasValue = hasValue | (Math.round(func(d), 1) > 0);
        }
    }
    return hasValue;
}


BaseChart.prototype.keys = function () {
    var self = this;

    var keys = [];

    if (this._redrawAxes) {
        keys = this.dataset().filter(function (d) { return self.zeroValueEntry(d); }).map(this._keyAccessor);
    }
    else {
        keys = this.dataset().map(this._keyAccessor);
    }
    return keys;
}

BaseChart.prototype.targets = function (targets)
{
    if (!arguments.length) { return this._targets; }
    this._targets = targets;
    return this;
}

BaseChart.prototype.ranges = function (ranges) {
    if (!arguments.length) { return this._ranges; }
    this._ranges = ranges;
    return this;
}

BaseChart.prototype.height = function (h) {
    if (!arguments.length) { return this._height }
    this._height = h;
    return this;
}

BaseChart.prototype.createChart = function () {
    this.chart = d3.select(this.element).append("svg")
                                        .attr("class", "chart")
    this.chart.attr("width", this.width())
              .attr("height", this.height());

    this.chart = this.chart.append("g").attr("transform", "translate(" + this.margin().left + "," + this.margin().top + ")");

    this.tooltip();
}

BaseChart.prototype.topResults = function (top)
{
    if (!arguments.length) { return this._topResults; }
    this._topResults = top;
    return this;
}

BaseChart.prototype.dataset = function () {
    if (this._topResults) {
        return this.group.getData().filter(this._limitFunction);
    }
    else {
        return this.group.getData().filter(this._limitFunction);
    }
}

BaseChart.prototype.keyAccessor = function (k) {
    if (!arguments.length) { return this._keyAccessor; }
    this._keyAccessor = k;
    return this;
}

BaseChart.prototype.labelAccessor = function (k) {
    if (!arguments.length) { return this._labelAccessor; }
    this._labelAccessor = k;
    return this;
}

BaseChart.prototype.tooltipFormat = function (f)
{
    if (!arguments.length) { return this._tooltipFormat; }
    this._tooltipFormat = f;
    return this;
}


BaseChart.prototype.yAxisFormat = function (f)
{
    if (!arguments.length) { return this._yAxisFormat; }
    this._yAxisFormat = f;
    return this;
}

BaseChart.prototype.valueAccessor = function (v) {
    if (!arguments.length) { return this._valueAccessor; }
    this._valueAccessor = v;
    return this;
}

BaseChart.prototype.redrawAxes = function (v)
{
    if (!arguments.length) { return this._redrawAxes; }
    this._redrawAxes = v;
    return this;
}

BaseChart.prototype.margin = function (m) {
    if (!arguments.length) { return this._margin }
    this._margin = m;
    return this;
};


BaseChart.prototype.draw = function () {

}

BaseChart.prototype.init = function () {


}

BaseChart.prototype.invert = function (i) {

    if (!arguments.length) { return this._invert; }
    this._invert = i;
    return this;

}

BaseChart.prototype.setHover = function (item)
{
    d3.select(item).classed("active", true);
}


BaseChart.prototype.removeHover = function (item) {
    d3.select(item).classed("active", false);
}

BaseChart.prototype.mouseOver = function (chart, item, d) {
    if (chart.hasTooltip) {
        var tipValue = $(item).find('.tipValue').first().html();
        var tipLabel = $(item).find('.tipLabel').first().html();

        chart.tip.show({ label: tipLabel, value: tipValue });
    }
    this.setHover(item);
}

BaseChart.prototype.mouseOut = function (chart, item, d) {
    if (chart.hasTooltip) {
        chart.tip.hide(d);
    }
    this.removeHover(item);
}

BaseChart.prototype.labelColor = function (c) {
    if (!arguments.length) { return this._labelColor; }
    this._labelColor = c;
    return this;
}

BaseChart.prototype.barColor = function (c) {
    if (!arguments.length) { return this._barColor; }
    this._barColor = c;
    return this;
}

BaseChart.prototype.tooltipLabel = function (label) {
    if (!arguments.length) { return this.toolTipText; }
    this.toolTipText = label;
    return this;
}

BaseChart.prototype.tooltip = function () {
    var self = this;
    this.hasTooltip = true;

    this.tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return "<span class='tiplabel'>" + d.label + ": </span><span class='tipvalue'>" + d.value + "</span>";
            });

    this.chart.call(this.tip);

    return this;
}

BaseChart.prototype.filterKey = function () { }



BaseChart.prototype.limitFunction = function (d) {
    if (!arguments.length) { return this._limitFunction; }
    this._limitFunction = d;
    return this;
}

BaseChart.prototype.removeFromArray = function (array, value) {
    var i = array.indexOf(value);
    if (i != -1) {
        array.splice(i, 1);
    }
}
BaseChart.prototype.labelPadding = function (p) {
    if (!arguments.length) { return this._labelPadding; }
    this._labelPadding = p;
    return this;
}

BaseChart.prototype.labelFontSize = function (s) {
    if (!arguments.length) { return this._labelFontSize; }
    this._labelFontSize = s;
    return this;
}

BaseChart.prototype.xBounds = function (d) {

    var start = this.invert() ? this.margin().right : this.margin().left;
    var end = this.width() - (this.margin().right+this.margin().left);

    return { start: start, end: end };
}

BaseChart.prototype.yBounds = function (d) {

    var start = this.invert() ? this.margin().top : this.margin().bottom;
    var end = this.height() - (this.margin().top + this.margin().bottom);

    return { start: start, end: end };
}

BaseChart.prototype.labelAnchoring = function (d) {
    if (this.invert()) {
        return "end";
    }
    else { return "start"; }
};

BaseChart.prototype.filterFunction = function (filter)
{
    var value = filter.key ? filter.key : filter;

    return value;
}


BaseChart.prototype.filterClick = function (element, filter) {

    if (d3.select(element).classed("selected")) {
        d3.select(element).classed("selected", false);
    }
    else {
        d3.select(element).classed("selected", true);
    }

    var value = this.filterFunction(filter);

    this.filterEvent(this.group, this.dimension, value);
};


BaseChart.prototype.filterEvent = function (data, dimension, filter) {

}

BaseChart.prototype.updateTargets = function () { };
BaseChart.prototype.drawTargets = function () { };