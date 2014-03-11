var BaseChart = function BaseChart(element, dimension, group) {
    this.element = element;
    this.dimension = dimension;
    this.group = group;
    this._keyAccessor = function (d) { return d.key; };
    this._valueAccessor = function (d) { return d.value; };
    this._limitFunction = function (d) { return true; };
    this._labelFontSize = "11px";
    this.isFiltered = false;
    this._margin = { top: 50, bottom: 100, left: 50, right: 50 };
    this.duration = 500;
    this.filters = [];
    this._labelPadding = 20;
    this.hasTooltip = false;
    this.tooltipText = "";
    this._invert = false;
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
BaseChart.prototype.keys = function () {
    return this.group().all().map(this._keyAccessor);
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

BaseChart.prototype.dataset = function () {
    return this.group().all().filter(this._limitFunction);
}

BaseChart.prototype.keyAccessor = function (k) {
    if (!arguments.length) { return this._keyAccessor; }
    this._keyAccessor = k;
    return this;
}

BaseChart.prototype.valueAccessor = function (v) {
    if (!arguments.length) { return this._valueAccessor; }
    this._valueAccessor = v;
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

BaseChart.prototype.mouseOver = function (chart, item, d) {
    if (chart.hasTooltip) {
        chart.tip.show(d);
    }
    d3.select(item).classed("active", true);
}

BaseChart.prototype.mouseOut = function (chart, item, d) {
    if (chart.hasTooltip) {
        chart.tip.hide(d);
    }
    d3.select(item).classed("active", false);
}

BaseChart.prototype.labelColor = function (c) {
    if (!arguments.length) { return this._labelColor; }
    this._labelColor = c;
    return this;
}

BaseChart.prototype.barColor = function (c) {
    if (!arguments.length) { return this.barColor; }
    this.barColor = c;
    return this;
}
BaseChart.prototype.tooltipLabel = function (label) {
    if (!arguments.length) { return this.toolTipText; }
    this.toolTipText = label;
    return this;
}
BaseChart.prototype.tooltipAccessor = function (item) {
    return this._valueAccessor(item);
}

BaseChart.prototype.tooltip = function () {
    var self = this;
    this.hasTooltip = true;
    this.tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return "<span class='tiplabel'>" + self.tooltipLabel() + "</span><span class='tipvalue'>" + self.tooltipAccessor(d) + "</span>";
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
    var end = this.width() - (this.margin().right + this.margin().left);

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

BaseChart.prototype.filterClick = function (element, filter) {

    if (d3.select(element).classed("selected")) {
        d3.select(element).classed("selected", false);
    }
    else {
        d3.select(element).classed("selected", true);
    }

    this.filterEvent(this.group, this.dimension, filter);
};


BaseChart.prototype.filterEvent = function (data, dimension, filter) {

}