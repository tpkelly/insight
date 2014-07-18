/**
 * The Axis class coordinates the domain of the series data and draws axes on the chart in the required orientation and position.
 * @class insight.Axis
 * @param {Chart} chart - The parent chart object
 * @param {string} name - A uniquely identifying name for this chart
 * @param {string} orientation - horizontal 'h' or vertical 'v'
 * @param {insight.Scales.Scale} scale - insight.Scale.Linear for example
 * @param {string} anchor - 'left/right/top/bottom'
 */
insight.Axis = function Axis(chart, name, direction, scale, anchor) {

    this.chart = chart;
    this.scaleType = scale.name;
    this.scale = scale.scale();
    this.anchor = anchor ? anchor : 'left';
    this.rangeType = this.scale.rangeRoundBands ? this.scale.rangeRoundBands : this.scale.rangeRound;
    this.bounds = [];
    this.direction = direction;
    this.series = [];

    var self = this;
    var label = name;
    var ordered = d3.functor(false);
    var tickSize = d3.functor(1);
    var tickPadding = d3.functor(10);
    var labelRotation = '90';
    var tickOrientation = d3.functor('lr');
    var orientation = direction == 'h' ? d3.functor(this.anchor) : d3.functor(this.anchor);
    var textAnchor;
    var showGridLines = false;
    var colorFunction = d3.functor('#777');
    var display = true;

    this.chart.addAxis(this);

    if (direction == 'v') {
        textAnchor = this.anchor == 'left' ? 'end' : 'start';
    }
    if (direction == 'h') {
        textAnchor = 'start';
    }

    // private functions

    /**
     * The default axis tick format, just returns the input
     * @returns {object} tickPoint - The axis data for a particular tick
     * @param {object} ticklabel - The output string to be displayed
     */
    var format = function(d) {
        return d;
    };

    /**
     * This method calculates the scale ranges for this axis, given a range type function and using the calculated output bounds for this axis.
     * @param {rangeType} rangeType - a d3 range function, which can either be in bands (for columns) or a continuous range
     */
    var applyScaleRange = function(rangeType) {
        self.bounds = self.calculateBounds();

        rangeType.apply(this, [
            self.bounds, self.chart.barPadding()
        ]);
    };

    /**
     * For an ordinal/categorical axis, this method queries all series that use this axis to get the list of available values
     * TODO - currently just checks the first as I've not had a scenario where different series on the same axis had different ordinal keys.
     * @returns {object[]} values - the values for this ordinal axis
     */
    var findOrdinalValues = function() {
        var vals = [];

        self.series.map(function(series) {
            vals = series.keys();
        });

        return vals;
    };

    /**
     * For linear series, this method is used to calculate the maximum value to be used in this axis.
     * @returns {Date} max - The largest value in the datasets that use this axis
     */
    var findMax = function() {
        var max = 0;

        self.series.map(function(series) {
            var m = series.findMax(self);

            max = m > max ? m : max;
        });

        return max;
    };


    /**
     * For time series, this method is used to calculate the minimum value to be used in this axis.
     * @returns {Date} minTime - The smallest time in the datasets that use this axis
     */
    var minTime = function() {
        // start at the largest time, and work back from there to find the minimum
        var minTime = new Date(8640000000000000);

        self.series.map(function(series) {
            var cMin = d3.min(series.keys());
            minTime = cMin < minTime ? cMin : minTime;
        });
        return minTime;
    };


    /**
     * For time series, this method is used to calculate the maximum value to be used in this axis.
     * @returns {Date} minTime - The largest time in the datasets that use this axis
     */
    var maxTime = function() {
        // start at the smallest time, and work back from there to find the minimum
        var maxTime = new Date(-8640000000000000);

        self.series.map(function(series) {
            var cMax = d3.max(series.keys());
            maxTime = cMax > maxTime ? cMax : maxTime;
        });

        return maxTime;
    };


    // public functions 


    this.horizontal = function() {
        return this.direction == 'h';
    };

    this.vertical = function() {
        return this.direction == 'v';
    };

    this.ordered = function(value) {
        if (!arguments.length) {
            return ordered();
        }
        ordered = d3.functor(value);
        return this;
    };


    this.addSeries = function(series) {
        this.series.push(series);
    };


    // scale domain and output range methods


    /**
     * This method calculates the domain of values that this axis has, from a minimum to a maximum.
     * @memberof insight.Axis
     * @returns {object[]} bounds - An array with two items, for the lower and upper range of this axis
     */
    this.domain = function() {
        var domain = [];

        if (this.scaleType == insight.Scales.Linear.name) {
            domain = [0, findMax()];
        } else if (this.scaleType == insight.Scales.Ordinal.name) {
            domain = findOrdinalValues();
        } else if (this.scaleType == insight.Scales.Time.name) {
            domain = [minTime(), maxTime()];
        }

        return domain;
    };


    /**
     * This method calculates the output range bound of this axis, taking into account the size and margins of the chart.
     * @memberof insight.Axis
     * @returns {int[]} bounds - An array with two items, for the lower and upper bound of this axis
     */
    this.calculateBounds = function() {
        var bounds = [];
        var margin = self.chart.margin();

        if (self.horizontal()) {
            bounds[0] = 0;
            bounds[1] = self.chart.width() - margin.right - margin.left;
        } else if (self.vertical()) {
            bounds[0] = self.chart.height() - margin.top - margin.bottom;
            bounds[1] = 0;

        }
        return bounds;
    };



    /**
     * This getter/setter defines whether or not the axis should be drawn on the chart (lines and labels)
     * @returns {function}
     */
    /**
     * @param {boolean} value - When used as a setter, this function takes a boolean value that will define whether this axis will be drawn
     * @returns {this}
     */
    this.display = function(value) {
        if (!arguments.length) {
            return display;
        }
        display = value;
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
     * This getter/setter defines the color used by the axis labels and lines
     * @returns {function}
     */
    /**
     * @param {object} color - When used as a setter, this function can take a string color (hex, named or "rgb(r,g,b)") or a function that returns the color of the axis.
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
            return textAnchor;
        }
        textAnchor = value;
        return this;
    };



    this.tickOrientation = function(value) {
        if (!arguments.length) {
            return tickOrientation();
        }

        tickOrientation = d3.functor(value);

        return this;
    };


    /**
     * This method gets/sets the rotation angle used for horizontal axis labels.  Defaults to 90 degrees
     * @memberof insight.Axis
     * @returns {object} return - Description
     * @param {object[]} data - Description
     */
    this.tickRotationTransform = function() {
        var offset = self.tickPadding() + (self.tickSize() * 2);
        offset = self.anchor == 'top' ? 0 - offset : offset;

        var rotation = this.tickOrientation() == 'tb' ? ' rotate(' + self.tickRotation() + ',0,' + offset + ')' : '';

        return rotation;
    };


    this.axisPosition = function() {
        var transform = 'translate(';

        if (self.horizontal()) {
            var transX = 0;
            var transY = self.anchor == 'top' ? 0 : (self.chart.height() - self.chart.margin()
                .bottom - self.chart.margin()
                .top);

            transform += transX + ',' + transY + ')';

        } else if (self.vertical()) {
            var xShift = self.anchor == 'left' ? 0 : self.chart.width() - self.chart.margin()
                .right - self.chart.margin()
                .left;
            transform += xShift + ',0)';
        }

        return transform;
    };


    /**
     * This method positions the text label for the axis (not the tick labels)
     * @memberof insight.Axis
     */
    this.positionLabel = function() {

        if (self.horizontal()) {
            this.labelElement.style('left', 0)
                .style(self.anchor, 0)
                .style('width', '100%')
                .style('text-align', 'center');
        } else if (self.vertical()) {
            this.labelElement.style(self.anchor, '0')
                .style('top', '35%');
        }
    };

    /**
     * This getter/setter defines whether gridlines are displayed for the axis.
     * @returns {function}
     */
    /**
     * @param {object} showLines - When used as a setter, this function can take a boolean of whether to display the gridlines (true) or hide them (false).
     * @returns {this}
     */
    this.showGridlines = function(showLines) {
        if (!arguments.length) {
            return showGridLines;
        }
        showGridLines = showLines;

        return this;
    };

    /** Returns the array of all gridlines for this axis. */
    this.gridlines = function() {
        var gridLineIdentifier = 'line.' + label;
        return this.chart.chart.selectAll(gridLineIdentifier);
    };


    this.drawGridLines = function() {

        var ticks = this.scale.ticks();

        var attributes = {
            'class': label,
            'fill': 'none',
            'shape-rendering': 'crispEdges',
            'stroke': this.color,
            'stroke-width': '1px'
        };
        var chartMargin = self.chart.margin();
        var margin = self.chart.margin();
        var valueFunction = function(d) {
            return self.scale(d);
        };

        if (self.horizontal()) {
            attributes.x1 = valueFunction;
            attributes.x2 = valueFunction;
            attributes.y1 = 0;
            attributes.y2 = self.chart.height() - chartMargin.top - chartMargin.bottom;
        } else {
            attributes.x1 = 0;
            attributes.x2 = self.chart.width() - chartMargin.left - chartMargin.right;
            attributes.y1 = valueFunction;
            attributes.y2 = valueFunction;
        }

        //Get all lines, and add new datapoints.
        var gridLines = this.gridlines()
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


    this.initializeScale = function() {
        applyScaleRange.call(this.scale.domain(this.domain()), this.rangeType);

    };


    this.initialize = function() {

        this.initializeScale();

        if (this.display()) {
            this.axis = d3.svg.axis()
                .scale(this.scale)
                .orient(self.orientation())
                .tickSize(self.tickSize())
                .tickPadding(self.tickPadding())
                .tickFormat(self.labelFormat());

            this.axisElement = this.chart.chart.append('g');

            this.axisElement
                .attr('class', insight.Constants.AxisClass)
                .attr('transform', self.axisPosition())
                .call(this.axis)
                .selectAll('text')
                .attr('class', insight.Constants.AxisTextClass)
                .style('text-anchor', self.textAnchor())
                .style('transform', self.tickRotationTransform());

            this.labelElement = this.chart.container
                .append('div')
                .attr('class', insight.Constants.AxisLabelClass)
                .style('position', 'absolute')
                .text(this.label());

            this.positionLabel();
        }
    };



    this.draw = function(dragging) {

        if (this.display()) {

            this.axis = d3.svg.axis()
                .scale(this.scale)
                .orient(self.orientation())
                .tickSize(self.tickSize())
                .tickPadding(self.tickPadding())
                .tickFormat(self.labelFormat());

            this.axisElement
                .attr('transform', self.axisPosition())
                .style('stroke', self.color())
                .call(this.axis);

            this.axisElement
                .selectAll('text')
                .attr('transform', self.tickRotationTransform())
                .style('text-anchor', self.textAnchor());

            this.labelElement
                .text(this.label());

            if (showGridLines) {
                this.drawGridLines();
            }
        }
    };
};
