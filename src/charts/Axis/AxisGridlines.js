(function(insight) {

    /**
     * The Axis gridlines represent and draw the gridlines for a given axis.
     * @class insight.AxisGridlines
     * @param {Axis} axis - The axis to draw gridlines from.
     */
    insight.AxisGridlines = function AxisGridlines(axis) {

        this.parentAxis = axis;
        var lineColor = '#777';
        var lineWidth = 1;

        /** Returns the array of all gridlines for this axis.
         *
         * @memberof! insight.AxisGridlines
         * @instance
         * @param {Chart} chart The chart to grab the gridlines from.
         * @return {object[]} - All of the gridlines currently added to this chart.
         */
        this.allGridlines = function(chart) {
            var gridLineIdentifier = 'line.' + this.parentAxis.label();
            return chart.plotArea.selectAll(gridLineIdentifier);
        };

        /** The color of the gridlines.
         * @memberof! insight.AxisGridlines
         * @instance
         * @returns {Color} - The current line color of the gridlines.
         *
         * @also
         *
         * Sets the color of the gridlines
         * @memberof! insight.AxisGridlines
         * @instance
         * @param {Color} value The new gridline color.
         * @returns {this}
         */
        this.lineColor = function(value) {
            if (!arguments.length) {
                return lineColor;
            }
            lineColor = value;
            return this;
        };

        /** The width of the gridlines.
         * @memberof! insight.AxisGridlines
         * @instance
         * @returns {Number} - The current line width of the gridlines.
         *
         * @also
         *
         * Sets the width of the gridlines
         * @memberof! insight.AxisGridlines
         * @instance
         * @param {Number} value The new gridline width.
         * @returns {this}
         */
        this.lineWidth = function(value) {
            if (!arguments.length) {
                return lineWidth;
            }
            lineWidth = value;
            return this;
        };

        this.drawGridLines = function(chart, ticks) {
            var attributes = {
                'class': this.parentAxis.label(),
                'fill': 'none',
                'shape-rendering': 'crispEdges',
                'stroke': lineColor,
                'stroke-width': lineWidth
            };

            var axis = this.parentAxis;

            if (this.parentAxis.horizontal()) {
                attributes.x1 = this.parentAxis.pixelValueForValue;
                attributes.x2 = this.parentAxis.pixelValueForValue;
                attributes.y1 = 0;
                attributes.y2 = this.parentAxis.bounds[1];
            } else {
                attributes.x1 = 0;
                attributes.x2 = this.parentAxis.bounds[0];
                attributes.y1 = this.parentAxis.pixelValueForValue;
                attributes.y2 = this.parentAxis.pixelValueForValue;
            }

            //Get all lines, and add new datapoints.
            var gridLines = this.allGridlines(chart)
                .data(ticks);

            //Add lines for all new datapoints
            gridLines
                .enter()
                .append('line');

            //Update position of all lines
            gridLines.attr(attributes);

            //Remove any lines which are no longer in the data
            gridLines.exit()
                .remove();

        };

    };

})(insight);
