/**
 * The Axis gridlines represent and draw the gridlines for a given axis.
 * @class insight.AxisGridlines
 * @param {Axis} axis - The axis to draw gridlines from.
 */
insight.AxisGridlines = function AxisGridlines(axis) {

    this.parentAxis = axis;
    var lineColor = '#777';
    var lineWidth = 1;

    /** Returns the array of all gridlines for this axis. */
    this.allGridlines = function() {
        var gridLineIdentifier = 'line.' + this.parentAxis.label();
        return this.parentAxis.chart.chart.selectAll(gridLineIdentifier);
    };


    this.lineColor = function(value) {
        if (!arguments.length) {
            return lineColor;
        }
        lineColor = value;
        return this;
    };

    this.lineWidth = function(value) {
        if (!arguments.length) {
            return lineWidth;
        }
        lineWidth = value;
        return this;
    };

    /** Draw all gridlines for a given set of ticks
     *
     * @param ticks The ticks to create gridlines for.
     */
    this.drawGridLines = function(ticks) {
        var attributes = {
            'class': this.parentAxis.label(),
            'fill': 'none',
            'shape-rendering': 'crispEdges',
            'stroke': lineColor,
            'stroke-width': lineWidth
        };
        var chartMargin = this.parentAxis.chart.margin();
        var axis = this.parentAxis;

        if (this.parentAxis.horizontal()) {
            attributes.x1 = this.parentAxis.pixelValueForValue;
            attributes.x2 = this.parentAxis.pixelValueForValue;
            attributes.y1 = 0;
            attributes.y2 = this.parentAxis.chart.height() - chartMargin.top - chartMargin.bottom;
        } else {
            attributes.x1 = 0;
            attributes.x2 = this.parentAxis.chart.width() - chartMargin.left - chartMargin.right;
            attributes.y1 = this.parentAxis.pixelValueForValue;
            attributes.y2 = this.parentAxis.pixelValueForValue;
        }

        //Get all lines, and add new datapoints.
        var gridLines = this.allGridlines()
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
