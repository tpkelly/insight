/**
 * The LineSeries class extends the Series class and draws horizontal bars on a Chart
 * @class insight.LineSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.LineSeries = function LineSeries(name, data, x, y, color) {

    insight.Series.call(this, name, data, x, y, color);

    var self = this,
        lineType = 'linear',
        displayPoints = true;

    var lineOver = function(d, item) {

    };

    var lineOut = function(d, item) {

    };

    var lineClick = function(d, item) {

    };

    /**
     * Whether or not to show circular points on top of the line for each datapoint.
     *
     * If no arguments are given, then this returns whether the points are currently displayed. Otherwise, it sets the offset to the supplied argument.
     * @memberof insight.LineSeries
     * @param {object} [value] Whether points should be displayed.
     * @returns {*} - If no arguments are supplied, returns whether the points are currently displayed. Otherwise returns this.
     */
    this.showPoints = function(value) {
        if (!arguments.length) {
            return displayPoints;
        }
        displayPoints = value;
        return this;
    };

    this.rangeY = function(d) {
        return self.y.scale(self.valueFunction()(d));
    };

    this.rangeX = function(d, i) {
        var val = 0;

        if (self.x.scale.rangeBand) {
            val = self.x.scale(self.keyFunction()(d)) + (self.x.scale.rangeBand() / 2);
        } else {

            val = self.x.scale(self.keyFunction()(d));
        }

        return val;
    };

    this.lineType = function(_) {
        if (!arguments.length) {
            return lineType;
        }
        lineType = _;
        return this;
    };

    this.draw = function(chart, dragging) {

        this.initializeTooltip(chart.container.node());

        var transform = d3.svg.line()
            .x(self.rangeX)
            .y(self.rangeY)
            .interpolate(lineType);

        var data = this.dataset();

        var rangeIdentifier = "path." + this.name + ".in-line";

        var rangeElement = chart.plotArea.selectAll(rangeIdentifier);

        if (!this.rangeExists(rangeElement)) {
            chart.plotArea.append("path")
                .attr("class", this.name + " in-line")
                .attr("stroke", this.color)
                .attr("fill", "none")
                .attr("clip-path", "url(#" + chart.clipPath() + ")")
                .on('mouseover', lineOver)
                .on('mouseout', lineOut)
                .on('click', lineClick);
        }

        var duration = dragging ? 0 : function(d, i) {
            return 300 + i * 20;
        };

        chart.plotArea.selectAll(rangeIdentifier)
            .datum(this.dataset(), this.matcher)
            .transition()
            .duration(duration)
            .attr("d", transform);

        if (displayPoints) {
            var circles = chart.plotArea.selectAll("circle")
                .data(this.dataset());

            circles.enter()
                .append('circle')
                .attr('class', 'target-point')
                .attr("clip-path", "url(#" + chart.clipPath() + ")")
                .attr("cx", self.rangeX)
                .attr("cy", chart.height() - chart.margin()
                    .bottom - chart.margin()
                    .top)
                .on('mouseover', self.mouseOver)
                .on('mouseout', self.mouseOut);


            circles
                .transition()
                .duration(duration)
                .attr("cx", self.rangeX)
                .attr("cy", self.rangeY)
                .attr("r", 3)
                .attr("fill", this.color);
        }
    };

    this.rangeExists = function(rangeSelector) {

        return rangeSelector[0].length;
    };
};

insight.LineSeries.prototype = Object.create(insight.Series.prototype);
insight.LineSeries.prototype.constructor = insight.LineSeries;
