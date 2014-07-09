/**
 * The ScatterSeries class extends the Series class
 * @class insight.ScatterSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {Chart} chart - The parent chart object
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.ScatterSeries = function ScatterSeries(name, chart, data, x, y, color) {

    insight.Series.call(this, name, chart, data, x, y, color);

    var radiusFunction = d3.functor(1);
    var tooltipExists = false;
    var self = this;
    var selector = this.name + insight.Constants.Scatter;

    var xFunction = function(d) {
        return d.x;
    };
    var yFunction = function(d) {
        return d.y;
    };

    var mouseOver = function(d, item) {
        self.chart.mouseOver(self, this, d);

        d3.select(this)
            .classed("hover", true);
    };

    var mouseOut = function(d, item) {
        self.chart.mouseOut(self, this, d);
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

    this.yFunction = function(_) {
        if (!arguments.length) {
            return yFunction;
        }
        yFunction = _;

        return this;

    };

    this.xFunction = function(_) {
        if (!arguments.length) {
            return xFunction;
        }
        xFunction = _;

        return this;

    };

    this.rangeY = function(d) {
        var f = self.yFunction();

        return self.y.scale(self.yFunction()(d));
    };

    this.rangeX = function(d, i) {
        var f = self.xFunction();
        return self.x.scale(self.xFunction()(d));
    };

    this.radiusFunction = function(_) {
        if (!arguments.length) {
            return radiusFunction;
        }
        radiusFunction = _;

        return this;
    };

    this.pointRadius = function(_) {
        if (!arguments.length) {
            return radiusFunction();
        }
        radiusFunction = d3.functor(_);

        return this;
    };

    var className = function(d) {

        return selector + " " + insight.Constants.Scatter + " " + self.dimensionName;
    };

    this.fillFunction = function(_) {
        if (!arguments.length) {
            return fillFunction;
        }
        fillFunction = _;

        return this;
    };

    this.scatterData = function(data) {
        var max = d3.max(data, radiusFunction);

        //Minimum of pixels-per-axis-unit
        var xValues = data.map(xFunction);
        var yValues = data.map(yFunction);
        var xBounds = this.x.calculateBounds()[1];
        var yBounds = this.y.calculateBounds()[0];

        // create radius for each item
        data.forEach(function(d) {
            d.radius = radiusFunction(d);
        });

        return data;
    };

    this.draw = function(drag) {
        var duration = drag ? 0 : function(d, i) {
            return 200 + (i * 20);
        };

        var click = function(filter) {
            return self.click(this, filter);
        };

        var scatterData = this.scatterData(this.dataset());

        var points = this.chart.chart.selectAll('circle.' + selector)
            .data(scatterData);

        points.enter()
            .append('circle')
            .attr('class', className)
            .on('mouseover', mouseOver)
            .on('mouseout', mouseOut)
            .on('click', click);

        points.transition()
            .duration(duration)
            .attr('r', radiusFunction)
            .attr('cx', self.rangeX)
            .attr('cy', self.rangeY)
            .attr('opacity', 0.5)
            .attr('fill', this.color);

        if (!tooltipExists) {
            points.append('svg:text')
                .attr('class', insight.Constants.ToolTipTextClass);
            tooltipExists = true;
        }

        points.selectAll("." + insight.Constants.ToolTipTextClass)
            .text(this.tooltipFunction());
    };
};

insight.ScatterSeries.prototype = Object.create(insight.Series.prototype);
insight.ScatterSeries.prototype.constructor = insight.ScatterSeries;
