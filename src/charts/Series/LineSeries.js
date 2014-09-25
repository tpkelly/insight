(function(insight) {

    /**
     * The LineSeries class extends the Series class and draws horizontal bars on a Chart
     * @class insight.LineSeries
     * @extends insight.Series
     * @param {String} name - A uniquely identifying name for this series
     * @param {insight.DataSet | Array<Object>} data - The DataSet containing this series' data
     * @param {insight.Axis} x - The x axis
     * @param {insight.Axis} y - The y axis
     */
    insight.LineSeries = function LineSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            lineType = 'linear',
            displayPoints = true;

        // Internal variables -----------------------------------------------------------------------------------------

        self.classValues = [insight.Constants.LineClass];

        // Private functions ------------------------------------------------------------------------------------------

        function lineOver(d, item) {

        }

        function lineOut(d, item) {

        }

        function lineClick(d, item) {

        }

        // Internal functions -----------------------------------------------------------------------------------------

        self.rangeY = function(d) {
            return self.y.scale(self.valueFunction()(d));
        };

        self.rangeX = function(d) {
            var val = 0;

            if (self.x.scale.rangeBand) {
                val = self.x.scale(self.keyFunction()(d)) + (self.x.scale.rangeBand() / 2);
            } else {

                val = self.x.scale(self.keyFunction()(d));
            }

            return val;
        };

        self.rangeExists = function(rangeSelector) {

            if (rangeSelector.length === 0) {
                return 0;
            }


            return rangeSelector[0].length;
        };

        self.draw = function(chart, isDragging) {

            self.tooltip = chart.tooltip;

            var transform = d3.svg.line()
                .x(self.rangeX)
                .y(self.rangeY)
                .interpolate(lineType);

            var data = self.dataset();

            var classValue = self.name + 'line ' + insight.Constants.LineClass;
            var classSelector = '.' + self.name + 'line.' + insight.Constants.LineClass;

            var rangeIdentifier = "path" + classSelector;

            var rangeElement = chart.plotArea.selectAll(rangeIdentifier);

            if (!self.rangeExists(rangeElement)) {
                chart.plotArea.append("path")
                    .attr("class", classValue)
                    .style("stroke", self.color)
                    .attr("fill", "none")
                    .attr("clip-path", "url(#" + chart.clipPath() + ")")
                    .on('mouseover', lineOver)
                    .on('mouseout', lineOut)
                    .on('click', lineClick);
            }

            var duration = isDragging ? 0 : 300;

            chart.plotArea.selectAll(rangeIdentifier)
                .datum(self.dataset())
                .transition()
                .duration(duration)
                .attr("d", transform);

            var pointClassName = self.name + 'line' + insight.Constants.LinePoint;
            pointClassName = insight.Utils.alphaNumericString(pointClassName);

            if (displayPoints) {
                var circles = chart.plotArea.selectAll("circle." + pointClassName)
                    .data(self.dataset());

                circles.enter()
                    .append('circle')
                    .attr('class', pointClassName)
                    .attr("clip-path", "url(#" + chart.clipPath() + ")")
                    .attr("cx", self.rangeX)
                    .attr("cy", chart.height() - chart.margin().bottom - chart.margin().top)
                    .on('mouseover', self.mouseOver)
                    .on('mouseout', self.mouseOut);

            }

            var colorFunc = (displayPoints) ? self.color : d3.functor(undefined);
            var allCircles = chart.plotArea.selectAll("circle." + pointClassName);

            allCircles
                .transition()
                .duration(duration)
                .attr("cx", self.rangeX)
                .attr("cy", self.rangeY)
                .attr("r", 5)
                .style("fill", colorFunc)
                .style("stroke-width", 0);
        };

        // Public functions -------------------------------------------------------------------------------------------

        /**
         * Whether or not to show circular points on top of the line for each datapoint.
         * @memberof! insight.LineSeries
         * @instance
         * @returns {Boolean} - Whether or not to show circular points on top of the line for each datapoint.
         *
         * @also
         *
         * Sets whether or not to show circular points on top of the line for each datapoint.
         * @memberof! insight.LineSeries
         * @instance
         * @param {Boolean} showPoints Whether or not to show circular points on top of the line for each datapoint.
         * @returns {this}
         */
        self.shouldShowPoints = function(showPoints) {
            if (!arguments.length) {
                return displayPoints;
            }
            displayPoints = showPoints;
            return self;
        };

        /**
         * The line type that this lineSeries will draw. Defaults to 'linear'.
         * @see [d3's shapes]{@link https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate} for all options.
         * @memberof! insight.LineSeries
         * @instance
         * @returns {String} - The line type that this lineSeries will draw.
         *
         * @also
         *
         * Sets the line type that this lineSeries will draw..
         * @see [d3's shapes]{@link https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate} for all options.
         * @memberof! insight.LineSeries
         * @instance
         * @param {String} newLineType The line type that this lineSeries will draw.
         * @returns {this}
         */
        self.lineType = function(newLineType) {
            if (!arguments.length) {
                return lineType;
            }

            lineType = newLineType;

            return self;
        };

        self.applyTheme(insight.defaultTheme);
    };

    insight.LineSeries.prototype = Object.create(insight.Series.prototype);
    insight.LineSeries.prototype.constructor = insight.LineSeries;

    insight.LineSeries.prototype.applyTheme = function(theme) {
        this.lineType(theme.seriesStyle.lineStyle);
        this.shouldShowPoints(theme.seriesStyle.shouldShowPoints);

        return this;
    };

})(insight);
