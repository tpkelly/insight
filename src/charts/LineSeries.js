function LineSeries(name, chart, data, x, y, color) {

    Series.call(this, name, chart, data, x, y, color);

    var self = this;

    var lineType = 'linear';
    var tooltipExists = false;

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

    this.rangeY = function(d) {
        return self.y.scale(self.yFunction()(d));
    };

    this.rangeX = function(d, i) {
        var val = 0;

        if (self.x.scale.rangeBand) {
            val = self.x.scale(self.xFunction()(d)) + (self.x.scale.rangeBand() / 2);
        } else {

            val = self.x.scale(self.xFunction()(d));
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
            .attr("r", 2.5);


        if (!tooltipExists) {
            circles.append('svg:text')
                .attr('class', InsightConstants.ToolTipTextClass);
            tooltipExists = true;
        }

        circles.selectAll("." + InsightConstants.ToolTipTextClass)
            .text(this.tooltipFunction());
    };

    this.rangeExists = function(rangeSelector) {

        return rangeSelector[0].length;
    };
}

LineSeries.prototype = Object.create(Series.prototype);
LineSeries.prototype.constructor = LineSeries;
