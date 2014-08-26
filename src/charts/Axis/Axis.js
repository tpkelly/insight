(function(insight) {

    /**
     * The Axis class coordinates the domain of the series data and draws axes.
     * @class insight.Axis
     * @param {string} name - A uniquely identifying name for this chart
     * @param {insight.Scales.Scale} scale - insight.Scale.Linear for example
     */
    insight.Axis = function Axis(name, scale) {

        // Private variables --------------------------------------------------------------------------------------

        var self = this,
            label = name,
            ordered = d3.functor(false),
            orderingFunction = null,
            tickSize = d3.functor(0),
            tickPadding = d3.functor(0),
            lineWidth = 1,
            labelRotation = '0',
            tickLabelOrientation = d3.functor('lr'),
            showGridlines = false,
            colorFunction = d3.functor('#000'),
            display = true,
            barPadding = d3.functor(0.1),
            initialisedAxisView = false,
            reversedPosition = false,
            zoomable = false;

        // Internal variables ---------------------------------------------------------------------------------------

        self.scaleType = scale.name;
        self.scale = scale.scale();
        self.rangeType = self.scale.rangeRoundBands ? self.scale.rangeRoundBands : self.scale.rangeRound;
        self.bounds = [0, 0];
        self.series = [];
        self.direction = '';
        self.gridlines = new insight.AxisGridlines(self);

        // Private functions -------------------------------------------------------------------------------------

        function orientation() {
            if (self.horizontal()) {
                return (reversedPosition) ? 'top' : 'bottom';
            } else {
                return (reversedPosition) ? 'right' : 'left';
            }
        }

        function textAnchor() {
            var orientation = self.orientation();
            if (orientation === 'left' || orientation === 'top') {
                return 'end';
            } else {
                return 'start';
            }
        }

        /*
         * The default axis tick format, just returns the input
         * @returns {object} tickPoint - The axis data for a particular tick
         * @param {object} ticklabel - The output string to be displayed
         */
        function format(d) {
            return d;
        }

        /*
         * This method calculates the scale ranges for this axis, given a range type function and using the calculated output bounds for this axis.
         * @param {rangeType} rangeType - a d3 range function, which can either be in bands (for columns) or a continuous range
         */
        function applyScaleRange(rangeType) {

            // x-axis goes from 0 (left) to max (right)
            // y-axis goes from max (top) to 0 (bottom)
            var rangeBounds = (self.horizontal()) ? [0, self.bounds[0]] : [self.bounds[1], 0];

            rangeType.apply(self, [
                rangeBounds, self.barPadding()
            ]);
        }

        /*
         * For an ordinal/categorical axis, this method queries all series that use this axis to get the list of available values
         * @returns {object[]} values - the values for this ordinal axis
         */
        function findOrdinalValues() {
            var vals = [];

            // Build a list of values used by this axis by checking all Series using this axis
            // Optionally provide an ordering function to sort the results by.  If the axis is ordered but no custom ordering is defined,
            // then the series value function will be used by default.
            self.series.forEach(function(series) {
                vals = vals.concat(series.keys(self.orderingFunction()));
            });

            vals = insight.Utils.arrayUnique(vals);

            return vals;
        }

        /*
         * Calculates the minimum value to be used in this axis.
         * @returns {object} - The smallest value in the datasets that use this axis
         */
        function findMin() {
            var min = Number.MAX_VALUE;

            self.series.forEach(function(series) {
                var m = series.findMin(self);

                min = m < min ? m : min;
            });

            return min;
        }

        /*
         * Calculates the maximum value to be used in this axis.
         * @returns {object} - The largest value in the datasets that use this axis
         */
        function findMax() {
            var max = 0;

            self.series.forEach(function(series) {
                var m = series.findMax(self);

                max = m > max ? m : max;
            });

            return max;
        }

        // Internal functions -------------------------------------------------------------------------------------

        /*
         * Adds to the list of series that this axis is associated with
         * @memberof! insight.Axis
         * @instance
         * @param {insight.Series} series The series to add
         */
        self.addSeries = function(series) {
            self.series.push(series);
        };

        /*
         * Calculates the domain of values that this axis has, from a minimum to a maximum.
         * @memberof! insight.Axis
         * @instance
         * @returns {object[]} bounds - An array with two items, for the lower and upper range of this axis
         */
        self.domain = function() {
            var domain = [];

            if (self.scaleType === insight.Scales.Linear.name) {
                domain = [0, findMax()];
            } else if (self.scaleType === insight.Scales.Ordinal.name) {
                domain = findOrdinalValues();
            } else if (self.scaleType === insight.Scales.Time.name) {
                domain = [new Date(findMin()), new Date(findMax())];
            }

            return domain;
        };

        /*
         * Calculates the output range bound of this axis, taking into account the size and margins of the chart.
         * @memberof! insight.Axis
         * @instance
         * @param {insight.Chart} chart The chart to calculate bounds against.
         * @returns {int[]} - An array with two items, for the width and height of the axis, respectively.
         */
        self.calculateAxisBounds = function(chart) {
            var bounds = [];
            var margin = chart.margin();

            bounds[0] = chart.width() - margin.right - margin.left;
            bounds[1] = chart.height() - margin.top - margin.bottom;

            self.bounds = bounds;

            return self.bounds;
        };

        self.tickLabelRotationTransform = function() {
            var offset = self.tickPadding() + (self.tickSize() * 2);
            offset = (reversedPosition && !self.horizontal()) ? 0 - offset : offset;

            var rotation = ' rotate(' + self.tickLabelRotation() + ',0,' + offset + ')';

            return rotation;
        };

        self.axisPosition = function() {
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

        self.pixelValueForValue = function(d) {
            return self.scale(d);
        };

        self.positionLabel = function() {

            if (self.horizontal()) {
                self.labelElement.style('left', 0)
                    .style(self.orientation(), 0)
                    .style('width', '100%')
                    .style('text-align', 'center');
            } else {
                self.labelElement.style(self.orientation(), '0').style('top', '35%');
            }
        };

        self.barPadding = function(_) {
            if (!arguments.length) {
                return barPadding();
            }
            barPadding = d3.functor(_);
            return self;
        };

        self.initializeScale = function() {
            applyScaleRange.call(self.scale.domain(self.domain()), self.rangeType);

        };

        self.setupAxisView = function(chart) {

            if (initialisedAxisView) {
                return;
            }

            initialisedAxisView = true;

            self.initializeScale();

            self.axis = d3.svg.axis();

            self.axisElement = chart.plotArea.append('g');

            self.axisElement
                .attr('class', insight.Constants.AxisClass)
                .call(self.axis)
                .selectAll('text')
                .attr('class', insight.Constants.AxisTextClass);

            self.labelElement = chart.container
                .append('div')
                .attr('class', insight.Constants.AxisLabelClass)
                .style('position', 'absolute');
        };

        self.draw = function(chart, dragging) {

            // Scale range and bounds need to be initialized regardless of whether the axis will be displayed

            self.calculateAxisBounds(chart);

            if (!self.zoomable()) {
                self.initializeScale();
            }

            if (!self.display()) {
                return;
            }

            self.setupAxisView(chart);

            var animationDuration = dragging ? 0 : 200;

            self.axis = d3.svg.axis()
                .scale(self.scale)
                .orient(self.orientation())
                .tickSize(self.tickSize())
                .tickPadding(self.tickPadding())
                .tickFormat(self.tickLabelFormat());

            self.axisElement
                .attr('transform', self.axisPosition())
                .style('stroke', self.color())
                .style('stroke-width', self.lineWidth())
                .style('fill', 'none')
                .transition()
                .duration(animationDuration)
                .call(self.axis);

            self.axisElement
                .selectAll('text')
                .attr('transform', self.tickLabelRotationTransform())
                .style('text-anchor', self.textAnchor());

            self.labelElement
                .text(self.label());

            self.positionLabel();


            if (self.showGridlines()) {
                self.gridlines.drawGridLines(chart, self.scale.ticks());
            }
        };

        // Public functions --------------------------------------------------------------------------------------

        /**
         * Whether or not the axis is displayed horizontally (true) or vertically (false).
         * @memberof! insight.Axis
         * @instance
         * @returns {boolean} - Whether the axis is horizontal.
         */
        self.horizontal = function() {
            return self.direction === 'h';
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
        self.ordered = function(value) {
            if (!arguments.length) {
                return ordered();
            }
            ordered = d3.functor(value);
            return self;
        };

        /**
         * Gets the function used to order the axis values
         * @memberof! insight.Axis
         * @instance
         * @returns {Function} - The current ordering function
         *
         * @also
         *
         * Sets the function used to order the axis values
         * @memberof! insight.Axis
         * @instance
         * @param {Function} orderFunc The ordering function
         * @returns {this}
         */
        self.orderingFunction = function(orderFunc) {
            if (!arguments.length) {
                return orderingFunction;
            }
            orderingFunction = orderFunc;
            return self;
        };

        /**
         * Returns a boolean value representing if this Axis is zoomable.
         * @instance
         * @memberof! insight.Axis
         * @returns {boolean} - A value indicating whether the axis is zoomable or not
         *
         * @also
         *
         * Sets the zoomable status of this Axis.  A zoomable Axis allows drag and zoom operations, and is not redrawn automatically on the draw() event of a chart.
         * @instance
         * @memberof! insight.Axis
         * @param {boolean} value - A true/false value to set this Axis as zoomable or not.
         * @returns {this}
         */
        self.zoomable = function(value) {
            if (!arguments.length) {
                return zoomable;
            }
            zoomable = value;

            return self;
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
        self.display = function(value) {
            if (!arguments.length) {
                return display;
            }
            display = value;
            return self;
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
        self.reversedPosition = function(reversed) {
            if (!arguments.length) {
                return reversedPosition;
            }
            reversedPosition = reversed;
            return self;
        };

        // label and axis tick methods

        /**
         * Gets the axis label
         * @memberof! insight.Axis
         * @instance
         * @returns {string} - The axis label
         *
         * @also
         *
         * Sets the axis label
         * @memberof! insight.Axis
         * @instance
         * @param {string} value The axis label
         * @returns {this}
         */
        self.label = function(value) {
            if (!arguments.length) {
                return label;
            }
            label = value;
            return self;
        };

        /**
         * Gets the function that will be used to format the axis tick labels.
         * @memberof! insight.Axis
         * @instance
         * @returns {Function} - A function that accepts the axis tick string and returns the formatted label
         *
         * @also
         *
         * Sets the function that will be used to format the axis tick labels
         * See `insight.Formatters` for pre-built examples.
         * @memberof! insight.Axis
         * @instance
         * @param {Function} value A function that accepts the axis tick label and returns the formatted label
         * @returns {this}
         */
        self.tickLabelFormat = function(formatFunc) {
            if (!arguments.length) {
                return format;
            }
            format = formatFunc;
            return self;
        };

        /**
         * Gets the width of the axis line.
         * @memberof! insight.Axis
         * @instance
         * @returns {Number} - The width of the axis line.
         *
         * @also
         *
         * Sets the width of the axis line.
         * @memberof! insight.Axis
         * @instance
         * @param {Number} width The new width of the axis line.
         * @returns {this}
         */
        self.lineWidth = function(width) {
            if (!arguments.length) {
                return lineWidth;
            }
            lineWidth = width;
            return self;
        };

        /**
         * Gets the color of the axis labels and lines.
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
        self.color = function(color) {
            if (!arguments.length) {
                return colorFunction;
            }
            colorFunction = d3.functor(color);
            return self;
        };

        /*
         * Gets the axis orientation: h = horizontal, v = vertical
         * @memberof! insight.Axis
         * @instance
         * @returns {string} - h = horizontal, v = vertical
         *
         * @also
         *
         * Sets the axis orientation: h = horizontal, v = vertical
         * @memberof! insight.Axis
         * @instance
         * @param {string} value The the axis orientation: h = horizontal, v = vertical
         * @returns {this}
         */
        self.orientation = function(value) {
            if (!arguments.length) {
                return orientation();
            }
            orientation = d3.functor(value);
            return self;
        };

        /**
         * Gets the clockwise angle (degrees), that the each tick label will be rotated from horizontal.
         * @memberof! insight.Axis
         * @instance
         * @returns {number} - The clockwise angle (degrees), that the each tick label will be rotated from horizontal.
         *
         * @also
         *
         * Sets the clockwise angle (degrees), that the each tick label will be rotated from horizontal.
         * @memberof! insight.Axis
         * @instance
         * @param {number} value The clockwise angle (degrees), that the each tick label will be rotated from horizontal.
         * @returns {this}
         */
        self.tickLabelRotation = function(value) {
            if (!arguments.length) {
                return labelRotation;
            }
            labelRotation = value;
            return self;
        };

        /**
         * Gets the size of each axis tick in pixels.
         * @memberof! insight.Axis
         * @instance
         * @returns {number} - The size of each axis tick, in pixels.
         *
         * @also
         *
         * Sets the size of each axis tick in, pixels.
         * @memberof! insight.Axis
         * @instance
         * @param {number} value The size of each axis tick, in pixels.
         * @returns {this}
         */
        self.tickSize = function(value) {
            if (!arguments.length) {
                return tickSize();
            }
            tickSize = d3.functor(value);
            return self;
        };

        /**
         * Gets the padding between the end of a tick and its label, in pixels.
         * @memberof! insight.Axis
         * @instance
         * @returns {number} - The padding between the end of a tick and its label, in pixels.
         *
         * @also
         *
         * Sets the padding between the end of a tick and its label, in pixels.
         * @memberof! insight.Axis
         * @instance
         * @param {number} value The padding between the end of a tick and its label, in pixels.
         * @returns {this}
         */
        self.tickPadding = function(value) {
            if (!arguments.length) {
                return tickPadding();
            }
            tickPadding = d3.functor(value);
            return self;
        };

        /**
         * Gets the text-anchor attribute that will be set on each tick Label.
         * One of: start/middle/end.
         * @memberof! insight.Axis
         * @instance
         * @returns {string} - The the current text-anchor attribute value.
         *
         * @also
         *
         * Sets the text-anchor attribute that will be set on each tick Label.
         * @memberof! insight.Axis
         * @instance
         * @param {string} value The text-anchor attribute that will be set on each tick Label.
         * @returns {this}
         */
        self.textAnchor = function(value) {
            if (!arguments.length) {
                return textAnchor();
            }
            textAnchor = d3.functor(value);
            return self;
        };

        /**
         * Gets the orientation of the tick labels: 'tb' = top to bottom, 'lr' = left to right.
         * @memberof! insight.Axis
         * @instance
         * @returns {string} - 'tb' = top to bottom, 'lr' = left to right.
         *
         * @also
         *
         * Sets the orientation of the tick labels: 'tb' = top to bottom, 'lr' = left to right.
         * This is a helper function that sets the ticklabelRotation to either 0 or 90.
         * @memberof! insight.Axis
         * @instance
         * @param {string} value 'tb' = top to bottom, 'lr' = left to right.
         * @returns {this}
         */
        self.tickLabelOrientation = function(value) {
            if (!arguments.length) {
                return tickLabelOrientation();
            }

            if (value === 'tb') {
                labelRotation = '90';
            } else if (value === 'lr') {
                labelRotation = '0';
            }

            tickLabelOrientation = d3.functor(value);

            return self;
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
        self.showGridlines = function(showLines) {
            if (!arguments.length) {
                return showGridlines;
            }
            showGridlines = showLines;

            return self;
        };

        self.applyTheme(insight.defaultTheme);
    };

    /**
     * Applies all properties from a theme to the axis.
     * @memberof! insight.Axis
     * @instance
     * @param {insight.Theme} theme The theme to apply to the axis.
     * @returns {this}
     */
    insight.Axis.prototype.applyTheme = function(theme) {
        this.tickSize(theme.axisStyle.tickSize);
        this.tickPadding(theme.axisStyle.tickPadding);
        this.color(theme.axisStyle.axisLineColor);
        this.lineWidth(theme.axisStyle.axisLineWidth);

        /* TODO: Tick and axis label font/colours
         tickLabelFont: undefined,
         tickLabelColor: undefined,

         axisLabelFont: undefined,
         axisLabelColor: undefined
         */

        this.showGridlines(theme.axisStyle.showGridlines);

        this.gridlines.applyTheme(theme);

        return this;
    };

})(insight);
