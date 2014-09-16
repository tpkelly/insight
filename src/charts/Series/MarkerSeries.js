(function(insight) {

    /**
     * The MarkerSeries class extends the Series class and draws markers/targets on a chart
     * @class insight.MarkerSeries
     * @extends insight.Series
     * @param {string} name - A uniquely identifying name for this series
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.MarkerSeries = function MarkerSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            thickness = 5,
            widthFactor = 1,
            offset = 0,
            isHorizontal = false;

        // Internal functions -----------------------------------------------------------------------------------------

        self.xPosition = function(d) {
            var pos = 0;

            if (self.isHorizontal()) {
                pos = self.x.scale(self.valueFunction()(d));

            } else {
                pos = self.x.scale(self.keyFunction()(d));

                offset = self.calculateOffset(d);

                pos = widthFactor !== 1 ? pos + offset : pos;
            }

            return pos;
        };


        self.keys = function() {

            var f = self.keyFunction();

            return self.dataset().map(f);
        };

        self.calculateOffset = function(d) {

            var thickness = self.isHorizontal() ? self.markerHeight(d) : self.markerWidth(d);
            var scalePos = self.isHorizontal() ? self.y.scale.rangeBand(d) : self.x.scale.rangeBand(d);

            return (scalePos - thickness) * 0.5;
        };

        self.yPosition = function(d) {

            var position = 0;

            if (self.isHorizontal()) {
                position = self.y.scale(self.keyFunction()(d));

                offset = self.calculateOffset(d);

                position = widthFactor !== 1 ? position + offset : position;

            } else {
                position = self.y.scale(self.valueFunction()(d));
            }

            return position;
        };

        self.isHorizontal = function(shouldBeHorizontal) {
            if (!arguments.length) {
                return isHorizontal;
            }
            isHorizontal = shouldBeHorizontal;
            return self;
        };

        self.markerWidth = function(d) {
            var w = 0;

            if (self.isHorizontal()) {
                w = self.thickness();
            } else {
                w = self.x.scale.rangeBand(d) * widthFactor;
            }

            return w;
        };

        self.markerHeight = function(d) {
            var h = 0;

            if (self.isHorizontal()) {
                h = self.y.scale.rangeBand(d) * widthFactor;
            } else {
                h = self.thickness();
            }

            return h;
        };

        self.draw = function(chart, isDragging) {

            self.initializeTooltip(chart.tooltip);
            self.selectedItems = chart.selectedItems;

            function reset(d) {
                d.yPos = 0;
                d.xPos = 0;
            }

            var d = self.dataset().forEach(reset);

            var groups = chart.plotArea
                .selectAll('g.' + insight.Constants.BarGroupClass + "." + self.name)
                .data(self.dataset(), self.keyAccessor);

            var newGroups = groups.enter()
                .append('g')
                .attr('class', insight.Constants.BarGroupClass + " " + self.name);

            var newBars = newGroups.selectAll('rect.bar');

            function duration(d, i) {
                return 200 + (i * 20);
            }

            newBars = newGroups.append('rect')
                .attr('class', self.itemClassName)
                .attr('y', self.y.bounds[0])
                .attr('height', 0)
                .attr('fill', self.color)
                .attr('clip-path', 'url(#' + chart.clipPath() + ')')
                .on('mouseover', self.mouseOver)
                .on('mouseout', self.mouseOut)
                .on('click', self.click);

            var bars = groups.selectAll('.' + self.name + 'class');

            bars
                .transition()
                .duration(duration)
                .attr('y', self.yPosition)
                .attr('x', self.xPosition)
                .attr('width', self.markerWidth)
                .attr('height', self.markerHeight);

            groups.exit().remove();
        };

        // Public functions -------------------------------------------------------------------------------------------

        /**
         * The width of the marker, as a proportion of the column width.
         * @memberof! insight.MarkerSeries
         * @instance
         * @returns {Number} - The current width proportion.
         *
         * @also
         *
         * Sets the width of the marker, as a proportion of the column width.
         * @memberof! insight.MarkerSeries
         * @instance
         * @param {Number} widthProportion The new width proportion.
         * @returns {this}
         */
        self.widthFactor = function(widthProportion) {

            if (!arguments.length) {
                return widthFactor;
            }
            widthFactor = widthProportion;
            return self;
        };

        /**
         * The thickeness of the marker, in pixels.
         * @memberof! insight.MarkerSeries
         * @instance
         * @returns {Number} - The current marker thickness.
         *
         * @also
         *
         * Sets the thickeness of the marker, in pixels.
         * @memberof! insight.MarkerSeries
         * @instance
         * @param {Number} markerThickness The new thickeness, in pixels.
         * @returns {this}
         */
        self.thickness = function(markerThickness) {
            if (!arguments.length) {
                return thickness;
            }
            thickness = markerThickness;
            return self;
        };

    };

    insight.MarkerSeries.prototype = Object.create(insight.Series.prototype);
    insight.MarkerSeries.prototype.constructor = insight.MarkerSeries;

})(insight);
