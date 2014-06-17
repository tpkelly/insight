function Series(name, chart, data, x, y, color) {

    this.chart = chart;
    this.data = data;
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = d3.functor(color);
    this.animationDuration = 300;
    this.topValues = null;

    x.addSeries(this);
    y.addSeries(this);

    var self = this;
    var cssClass = "";

    var filter = null;

    // private functions used internally, set by functions below that are exposed on the object

    var xFunction = function(d) {
        return d.key;
    };

    var yFunction = function(d) {
        return d.value;
    };

    var tooltipFormat = function(d) {
        return d;
    };

    var tooltipAccessor = function(d) {
        return yFunction(d);
    };

    var tooltipFunction = function(d) {
        return tooltipFormat(tooltipAccessor(d));
    };

    this.dataset = function() {
        //won't always be x that determines this (rowcharts, bullets etc.), need concept of ordering by data scale?

        var data = this.x.ordered() ? this.data.getOrderedData(this.topValues) : this.data.getData();

        if (filter) {
            data = data.filter(filter);
        }

        return data;
    };

    this.keys = function() {
        return this.dataset()
            .map(xFunction);
    };

    this.cssClass = function(_) {
        if (!arguments.length) {
            return cssClass;
        }
        cssClass = _;
        return this;
    };

    this.keyAccessor = function(d) {
        return d.key;
    };

    this.xFunction = function(_) {
        if (!arguments.length) {
            return xFunction;
        }
        xFunction = _;

        return this;
    };

    this.yFunction = function(_) {
        if (!arguments.length) {
            return yFunction;
        }

        yFunction = _;

        return this;
    };

    this.filterFunction = function(_) {
        if (!arguments.length) {
            return filter;
        }
        filter = _;

        return this;
    };

    this.tooltipFormat = function(_) {
        if (!arguments.length) {
            return tooltipFormat;
        }
        tooltipFormat = _;

        return this;
    };

    this.tooltipFunction = function(_) {
        if (!arguments.length) {
            return tooltipFunction;
        }
        tooltipFunction = _;

        return this;
    };

    this.top = function(_) {
        if (!arguments.length) {
            return this.topValues;
        }
        this.topValues = _;

        return this;
    };


    this.findMax = function(scale) {
        var self = this;

        var max = 0;
        var data = this.data.getData();

        var func = scale == self.x ? self.xFunction() : self.yFunction();

        var m = d3.max(data, func);

        max = m > max ? m : max;

        return max;
    };

    this.draw = function() {};

    return this;
}
