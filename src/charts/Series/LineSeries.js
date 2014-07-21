/**
 * The LineSeries class extends the Series class and draws horizontal bars on a Chart
 * @class insight.LineSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {Chart} chart - The parent chart object
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.LineSeries = function LineSeries(name, chart, data, x, y, color) {

    insight.Series.call(this, name, chart, data, x, y, color);

    var self = this;

    var lineType = 'linear';
    var tooltipExists = false;
    var displayPoints = true;

    var mouseOver = function(d, item) {
        self.chart.mouseOver(self, this, d);

        d3.select(this)
            .classed("hover", true);
    };

    var mouseOut = function(d, item) {
        self.chart.mouseOut(self, this, d);
    };

    var lineOver = function(d, item) {

    };

    var lineOut = function(d, item) {

    };

    var lineClick = function(d, item) {

    };

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

    this.draw = function(dragging) {
        var transform = d3.svg.line()
            .x(self.rangeX)
            .y(self.rangeY)
            .interpolate(lineType);

        var data = this.dataset();

        var rangeIdentifier = "path." + this.name + ".in-line";

        var rangeElement = this.chart.chart.selectAll(rangeIdentifier);

        if (!this.rangeExists(rangeElement)) {
            this.chart.chart.append("path")
                .attr("class", this.name + " in-line")
                .attr("stroke", this.color)
                .attr("fill", "none")
                .attr("clip-path", "url(#" + this.chart.clipPath() + ")")
                .on('mouseover', lineOver)
                .on('mouseout', lineOut)
                .on('click', lineClick);
        }

        var duration = dragging ? 0 : function(d, i) {
            return 300 + i * 20;
        };

        this.chart.chart.selectAll(rangeIdentifier)
            .datum(this.dataset(), this.matcher)
            .transition()
            .duration(duration)
            .attr("d", transform);

        if (displayPoints) {
            var circles = this.chart.chart.selectAll("circle")
                .data(this.dataset());

            circles.enter()
                .append('circle')
                .attr('class', 'target-point')
                .attr("clip-path", "url(#" + this.chart.clipPath() + ")")
                .attr("cx", self.rangeX)
                .attr("cy", self.chart.height() - self.chart.margin()
                    .bottom - self.chart.margin()
                    .top)
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut);


            circles
                .transition()
                .duration(duration)
                .attr("cx", self.rangeX)
                .attr("cy", self.rangeY)
                .attr("r", 3)
                .attr("fill", this.color);


            if (!tooltipExists) {
                circles.append('svg:text')
                    .attr('class', insight.Constants.ToolTipTextClass);
                tooltipExists = true;
            }

            circles.selectAll("." + insight.Constants.ToolTipTextClass)
                .text(this.tooltipFunction());
        }
    };

    this.rangeExists = function(rangeSelector) {

        return rangeSelector[0].length;
    };
};

insight.LineSeries.prototype = Object.create(insight.Series.prototype);
insight.LineSeries.prototype.constructor = insight.LineSeries;
