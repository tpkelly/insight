/**
 * The Axis class coordinates the domain of the series data and draws axes.
 * @class insight.Axis
 * @param {string} name - A uniquely identifying name for this chart
 * @param {insight.Scales.Scale} scale - insight.Scale.Linear for example
 */
insight.Axis = function Axis(name, scale) {

    this.scaleType = scale.name;
    this.scale = scale.scale();
    this.rangeType = this.scale.rangeRoundBands ? this.scale.rangeRoundBands : this.scale.rangeRound;
    this.bounds = [0, 0];
    this.series = [];
    this.direction = '';
    this.gridlines = new insight.AxisGridlines(this);

    var self = this,
        label = name,
        ordered = d3.functor(false),
        orderingFunction = null,
        tickSize = d3.functor(1),
        tickPadding = d3.functor(10),
        labelRotation = '0',
        tickOrientation = d3.functor('lr'),
        showGridLines = false,
        colorFunction = d3.functor('#777'),
        display = true,
        barPadding = d3.functor(0.1),
        initialisedAxisView = false,
        reversedPosition = false,
        zoomable = false;

    var orientation = function() {
        if (self.horizontal()) {
            return (reversedPosition) ? 'top' : 'bottom';
        } else {
            return (reversedPosition) ? 'right' : 'left';
        }
    };

    var textAnchor = function() {
        var orientation = self.orientation();
        if (orientation === 'left' || orientation === 'top') {
            return 'end';
        } else {
            return 'start';
        }
    };

    // private functions

    /*
     * The default axis tick format, just returns the input
     * @returns {object} tickPoint - The axis data for a particular tick
     * @param {object} ticklabel - The output string to be displayed
     */
    var format = function(d) {
        return d;
    };

    /*
     * This method calculates the scale ranges for this axis, given a range type function and using the calculated output bounds for this axis.
     * @param {rangeType} rangeType - a d3 range function, which can either be in bands (for columns) or a continuous range
     */
    var applyScaleRange = function(rangeType) {

        // x-axis goes from 0 (left) to max (right)
        // y-axis goes from max (top) to 0 (bottom)
        var rangeBounds = (self.horizontal()) ? [0, self.bounds[0]] : [self.bounds[1], 0];

        rangeType.apply(this, [
            rangeBounds, self.barPadding()
        ]);
    };

    this.barPadding = function(_) {
        if (!arguments.length) {
            return barPadding();
        }
        barPadding = d3.functor(_);
        return this;
    };

    /*
     * For an ordinal/categorical axis, this method queries all series that use this axis to get the list of available values
     * @returns {object[]} values - the values for this ordinal axis
     */
    var findOrdinalValues = function() {
        var vals = [];

        // Build a list of values used by this axis by checking all Series using this axis
        // Optionally provide an ordering function to sort the results by.  If the axis is ordered but no custom ordering is defined,
        // then the series value function will be used by default.
        self.series.map(function(series) {
            vals = vals.concat(series.keys(self.orderingFunction()));
        });

        vals = insight.Utils.arrayUnique(vals);

        return vals;
    };

    /**
     * Calculates the minimum value to be used in this axis.
     * @returns {object} - The smallest value in the datasets that use this axis
     */
    var findMin = function() {
        var min = Number.MAX_VALUE;

        self.series.map(function(series) {
            var m = series.findMin(self);

            min = m < min ? m : min;
        });

        return min;
    };

    /**
     * Calculates the maximum value to be used in this axis.
     * @returns {object} - The largest value in the datasets that use this axis
     */
    var findMax = function() {
        var max = 0;

        self.series.map(function(series) {
            var m = series.findMax(self);

            max = m > max ? m : max;
        });

        return max;
    };

    // public functions

    /**
     * Whether or not the axis is displayed horizontally (true) or vertically (false).
     * @memberof! insight.Axis
     * @returns {boolean} - Whether the axis is horizontal.
     */
    this.horizontal = function() {
        return this.direction === 'h';
    };

    /**
     * Whether the axis values are displayed in order or not.
     * @memberof! insight.Axis
     * @instance
     * @returns {boolean} - Whether the axis is currently ordered.
     *
     * @also
     *
     * Sets whether the axis values are displayed in order or not.
     * @memberof! insight.Axis
     * @instance
     * @param {boolean} value Whether or not the axis will be ordered.
     * @returns {this}
     */
    this.ordered = function(value) {
        if (!arguments.length) {
            return ordered();
        }
        ordered = d3.functor(value);
        return this;
    };

    this.orderingFunction = function(value) {
        if (!arguments.length) {
            return orderingFunction;
        }
        orderingFunction = value;
        return this;
    };

    this.addSeries = function(series) {
        this.series.push(series);
    };


    // scale domain and output range methods


    /**
     * This method calculates the domain of values that this axis has, from a minimum to a maximum.
     * @memberof! insight.Axis
     * @instance
     * @returns {object[]} bounds - An array with two items, for the lower and upper range of this axis
     */
    this.domain = function() {
        var domain = [];

        if (this.scaleType === insight.Scales.Linear.name) {
            domain = [0, findMax()];
        } else if (this.scaleType === insight.Scales.Ordinal.name) {
            domain = findOrdinalValues();
        } else if (this.scaleType === insight.Scales.Time.name) {
            domain = [new Date(findMin()), new Date(findMax())];
        }

        return domain;
    };


    /**
     * This method calculates the output range bound of this axis, taking into account the size and margins of the chart.
     * @memberof! insight.Axis
     * @instance
     * @returns {int[]} - An array with two items, for the width and height of the axis, respectively.
     */
    this.calculateAxisBounds = function(chart) {
        var bounds = [];
        var margin = chart.margin();

        bounds[0] = chart.width() - margin.right - margin.left;
        bounds[1] = chart.height() - margin.top - margin.bottom;

        self.bounds = bounds;

        return self.bounds;
    };


    /**
     * Returns a boolean value representing if this Axis is zoomable.
     * @instance
     * @memberof! insight.Axis
     * @returns {boolean}
     *
     * @also
     *
     * Sets the zoomable status of this Axis.  A zoomable Axis allows drag and zoom operations, and is not redrawn automatically on the draw() event of a chart.
     * @instance
     * @memberof! insight.Axis
     * @param {boolean} value - A true/false value to set this Axis as zoomable or not.
     * @returns {this}
     */
    this.zoomable = function(value) {
        if (!arguments.length) {
            return zoomable;
        }
        zoomable = value;

        return this;
    };

    /**
     * Whether the axis is drawn on the chart.
     * @memberof! insight.Axis
     * @instance
     * @returns {boolean} - Whether the axis is currently being drawn on the chart.
     *
     * @also
     *
     * Sets whether the axis is drawn on the chart.
     * @memberof! insight.Axis
     * @instance
     * @param {boolean} displayed Whether or not the axis will be drawn.
     * @returns {this}
     */
    this.display = function(value) {
        if (!arguments.length) {
            return display;
        }
        display = value;
        return this;
    };


    /**
     * Whether the axis is drawn in a reversed position.
     * @memberof! insight.Axis
     * @instance
     * @returns {boolean} - Whether the axis is drawn at the bottom/left (false) or top/right (true).
     *
     * @also
     *
     * Sets whether the axis is drawn in a reversed position.
     * @memberof! insight.Axis
     * @instance
     * @param {boolean} reversed Whether the axis is drawn at the bottom/left (false) or top/right (true).
     * @returns {this}
     */
    this.reversed = function(value) {
        if (!arguments.length) {
            return reversedPosition;
        }
        reversedPosition = value;
        return this;
    };

    // label and axis tick methods

    this.label = function(value) {
        if (!arguments.length) {
            return label;
        }
        label = value;
        return this;
    };


    this.labelFormat = function(value) {
        if (!arguments.length) {
            return format;
        }
        format = value;
        return this;
    };


    /**
     * The color of the axis labels and lines.
     * @memberof! insight.Axis
     * @instance
     * @returns {Color} - The color of the axis labels and lines.
     *
     * @also
     *
     * Sets the color of the axis labels and lines.
     * @memberof! insight.Axis
     * @instance
     * @param {Color} color The new color of the axis labels and lines.
     * @returns {this}
     */
    this.color = function(color) {
        if (!arguments.length) {
            return colorFunction;
        }
        colorFunction = d3.functor(color);
        return this;
    };


    this.orientation = function(value) {
        if (!arguments.length) {
            return orientation();
        }
        orientation = d3.functor(value);
        return this;
    };


    this.tickRotation = function(value) {
        if (!arguments.length) {
            return labelRotation;
        }
        labelRotation = value;
        return this;
    };



    this.tickSize = function(value) {
        if (!arguments.length) {
            return tickSize();
        }
        tickSize = d3.functor(value);
        return this;
    };


    this.tickPadding = function(value) {
        if (!arguments.length) {
            return tickPadding();
        }
        tickPadding = d3.functor(value);
        return this;
    };


    this.textAnchor = function(value) {
        if (!arguments.length) {
            return textAnchor();
        }
        textAnchor = d3.functor(value);
        return this;
    };



    this.tickOrientation = function(value) {
        if (!arguments.length) {
            return tickOrientation();
        }

        if (value === 'tb') {
            labelRotation = '90';
        } else if (value === 'lr') {
            labelRotation = '0';
        }

        tickOrientation = d3.functor(value);

        return this;
    };

    this.tickRotationTransform = function() {
        var offset = self.tickPadding() + (self.tickSize() * 2);
        offset = (reversedPosition && !self.horizontal()) ? 0 - offset : offset;

        var rotation = ' rotate(' + self.tickRotation() + ',0,' + offset + ')';

        return rotation;
    };


    this.axisPosition = function() {
        var transform = 'translate(';

        if (self.horizontal()) {
            var transX = 0;
            var transY = self.orientation() === 'top' ? 0 : self.bounds[1];

            transform += transX + ',' + transY + ')';

        } else {
            var xShift = self.orientation() === 'left' ? 0 : self.bounds[0];
            transform += xShift + ',0)';
        }

        return transform;
    };

    this.pixelValueForValue = function(d) {
        return self.scale(d);
    };

    this.positionLabel = function() {

        if (self.horizontal()) {
            this.labelElement.style('left', 0)
                .style(self.orientation(), 0)
                .style('width', '100%')
                .style('text-align', 'center');
        } else {
            this.labelElement.style(self.orientation(), '0')
                .style('top', '35%');
        }
    };

    /**
     * Whether the axis has gridlines drawn from its major ticks.
     * @memberof! insight.Axis
     * @instance
     * @returns {boolean} - Whether the axis has gridlines drawn from its major ticks.
     *
     * @also
     *
     * Sets whether the axis has gridlines drawn from its major ticks.
     * @memberof! insight.Axis
     * @instance
     * @param {boolean} reversed Whether the axis has gridlines drawn from its major ticks.
     * @returns {this}
     */
    this.showGridlines = function(showLines) {
        if (!arguments.length) {
            return showGridLines;
        }
        showGridLines = showLines;

        return this;
    };

    this.initializeScale = function() {
        applyScaleRange.call(this.scale.domain(this.domain()), this.rangeType);

    };


    this.setupAxisView = function(chart) {

        if (initialisedAxisView)
            return;

        initialisedAxisView = true;

        this.initializeScale();

        this.axis = d3.svg.axis()
            .scale(this.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.labelFormat());

        this.axisElement = chart.plotArea.append('g');

        this.axisElement
            .attr('class', insight.Constants.AxisClass)
            .attr('transform', self.axisPosition())
            .call(this.axis)
            .selectAll('text')
            .attr('class', insight.Constants.AxisTextClass)
            .style('text-anchor', self.textAnchor())
            .style('transform', self.tickRotationTransform());

        this.labelElement = chart.container
            .append('div')
            .attr('class', insight.Constants.AxisLabelClass)
            .style('position', 'absolute')
            .text(this.label());
    };

    this.draw = function(chart, dragging) {

        // Scale range and bounds need to be initialized regardless of whether the axis will be displayed

        this.calculateAxisBounds(chart);

        if (!this.zoomable()) {
            this.initializeScale();
        }

        if (!this.display()) {
            return;
        }

        this.setupAxisView(chart);

        var animationDuration = dragging ? 0 : 200;

        this.axis = d3.svg.axis()
            .scale(this.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.labelFormat());

        this.axisElement
            .attr('transform', self.axisPosition())
            .style('stroke', self.color())
            .transition()
            .duration(animationDuration)
            .call(this.axis);

        this.axisElement
            .selectAll('text')
            .attr('transform', self.tickRotationTransform())
            .style('text-anchor', self.textAnchor());

        this.labelElement
            .text(this.label());

        this.positionLabel();


        if (showGridLines) {
            this.gridlines.drawGridLines(chart, this.scale.ticks());
        }
    };
};
