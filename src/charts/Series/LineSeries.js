(function(insight) {

    /**
     * The LineSeries class extends the Series class and draws horizontal bars on a Chart
     * @class insight.LineSeries
     * @param {string} name - A uniquely identifying name for this chart
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.LineSeries = function LineSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        var self = this,
            lineType = 'linear',
            displayPoints = true;


        this.classValues = [insight.Constants.LineClass];

        var lineOver = function(d, item) {

        };

        var lineOut = function(d, item) {

        };

        var lineClick = function(d, item) {

        };

        /**
         * Whether or not to show circular points on top of the line for each datapoint.
         * @memberof! insight.LineSeries
         * @instance
         * @returns {boolean} - Whether or not to show circular points on top of the line for each datapoint.
         *
         * @also
         *
         * Sets whether or not to show circular points on top of the line for each datapoint.
         * @memberof! insight.LineSeries
         * @instance
         * @param {boolean} showPoints Whether or not to show circular points on top of the line for each datapoint.
         * @returns {this}
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

        /**
         * The line type that this lineSeries will draw. Defaults to 'linear'.
         * See https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate for all options.
         * @memberof! insight.LineSeries
         * @instance
         * @returns {String} - The line type that this lineSeries will draw.
         *
         * @also
         *
         * Sets the line type that this lineSeries will draw..
         * @memberof! insight.LineSeries
         * @instance
         * @param {String} - The line type that this lineSeries will draw.
         * @returns {this}
         */
        this.lineType = function(newType) {
            if (!arguments.length) {
                return lineType;
            }

            lineType = newType;

            return this;
        };

        this.draw = function(chart, dragging) {

            this.initializeTooltip(chart.container.node());

            var transform = d3.svg.line()
                .x(self.rangeX)
                .y(self.rangeY)
                .interpolate(lineType);

            var data = this.dataset();

            var classValue = this.name + 'line ' + insight.Constants.LineClass;
            var classSelector = '.' + this.name + 'line.' + insight.Constants.LineClass;

            var rangeIdentifier = "path" + classSelector;

            var rangeElement = chart.plotArea.selectAll(rangeIdentifier);

            if (!this.rangeExists(rangeElement)) {
                chart.plotArea.append("path")
                    .attr("class", classValue)
                    .style("stroke", this.color)
                    .attr("fill", "none")
                    .attr("clip-path", "url(#" + chart.clipPath() + ")")
                    .on('mouseover', lineOver)
                    .on('mouseout', lineOut)
                    .on('click', lineClick);
            }

            var duration = dragging ? 0 : 300;

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

            }

            var colorFunc = (displayPoints) ? this.color : d3.functor(undefined);
            var allCircles = chart.plotArea.selectAll("circle");

            allCircles
                .transition()
                .duration(duration)
                .attr("cx", self.rangeX)
                .attr("cy", self.rangeY)
                .attr("r", 5)
                .style("fill", colorFunc)
                .style("stroke-width", 0);
        };

        this.rangeExists = function(rangeSelector) {
            if (rangeSelector.length === 0)
                return 0;

            return rangeSelector[0].length;
        };

        this.applyTheme(insight.defaultTheme);
    };

    insight.LineSeries.prototype = Object.create(insight.Series.prototype);
    insight.LineSeries.prototype.constructor = insight.LineSeries;


    insight.LineSeries.prototype.applyTheme = function(theme) {
        this.lineType(theme.seriesStyle.lineStyle);
        this.showPoints(theme.seriesStyle.showPoints);

        return this;
    };


})(insight);
