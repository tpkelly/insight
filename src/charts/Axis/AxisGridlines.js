(function(insight) {

    /**
     * The Axis gridlines represent and draw the gridlines for a given axis.
     * @class insight.AxisGridlines
     * @param {Axis} axis - The axis to draw gridlines from.
     */
    insight.AxisGridlines = function AxisGridlines(axis) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            lineColor = '#000',
            lineWidth = 0;

        // Internal variables -------------------------------------------------------------------------------------------

        self.parentAxis = axis;

        // Internal functions ----------------------------------------------------------------------------------------

        self.drawGridLines = function(chart, ticks) {
            var attributes = {
                'class': self.parentAxis.label(),
                'fill': 'none',
                'shape-rendering': 'crispEdges',
                'stroke': lineColor,
                'stroke-width': lineWidth
            };

            var axis = self.parentAxis;

            if (self.parentAxis.horizontal()) {
                attributes.x1 = self.parentAxis.pixelValueForValue;
                attributes.x2 = self.parentAxis.pixelValueForValue;
                attributes.y1 = 0;
                attributes.y2 = self.parentAxis.bounds[1];
            } else {
                attributes.x1 = 0;
                attributes.x2 = self.parentAxis.bounds[0];
                attributes.y1 = self.parentAxis.pixelValueForValue;
                attributes.y2 = self.parentAxis.pixelValueForValue;
            }

            //Get all lines, and add new datapoints.
            var gridLines = self.allGridlines(chart)
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

        // Public functions -------------------------------------------------------------------------------------------

        /** Returns the array of all gridlines for this axis.
         *
         * @memberof! insight.AxisGridlines
         * @instance
         * @param {Chart} chart The chart to grab the gridlines from.
         * @returns {object[]} - All of the gridlines currently added to this chart.
         */
        self.allGridlines = function(chart) {
            var gridLineIdentifier = 'line.' + self.parentAxis.label();
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
         * @param {Color} gridlineColor The new gridline color.
         * @returns {this}
         */
        self.lineColor = function(gridlineColor) {
            if (!arguments.length) {
                return lineColor;
            }
            lineColor = gridlineColor;
            return self;
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
         * @param {Number} gridlineWidth The new gridline width.
         * @returns {this}
         */
        self.lineWidth = function(gridlineWidth) {
            if (!arguments.length) {
                return lineWidth;
            }
            lineWidth = gridlineWidth;
            return self;
        };

        self.applyTheme(insight.defaultTheme);
    };

    insight.AxisGridlines.prototype.applyTheme = function(theme) {
        this.lineWidth(theme.axisStyle.gridlineWidth);
        this.lineColor(theme.axisStyle.gridlineColor);

        return this;
    };

})(insight);
