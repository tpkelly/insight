(function(insight) {

    /**
     * The Axis class coordinates the domain of the series data and draws axes.
     * @class insight.Axis
     * @param {string} name - A uniquely identifying name for this axis
     * @param {insight.Scales.Scale} scale - insight.Scale.Linear for example
     */
    insight.Axis = function Axis(name, scale) {

        // Private variables --------------------------------------------------------------------------------------

        var self = this,
            label = name,
            shouldBeOrdered = d3.functor(false),
            orderingFunction = null,
            tickSize = d3.functor(0),
            tickPadding = d3.functor(0),
            lineWidth = 1,
            labelRotation = 0,
            tickLabelFont = '11pt Helvetica Neue',
            tickLabelColor = d3.functor('Black'),
            axisLabelFont = '12pt Helvetica Neue',
            axisLabelColor = d3.functor('Black'),
            tickLabelOrientation = d3.functor('lr'),
            shouldShowGridlines = false,
            colorFunction = d3.functor('#000'),
            shouldDisplay = true,
            barPadding = d3.functor(0.1),
            initialisedAxisView = false,
            shouldReversePosition = false,
            zoomable = false,
            axisStrategy = strategyForScale(scale),
            tickFrequency;

        // Internal variables ---------------------------------------------------------------------------------------

        self.measureCanvas = document.createElement('canvas');
        self.scale = scale.scale();
        self.bounds = [0, 0];
        self.series = [];
        self.direction = '';
        self.gridlines = new insight.AxisGridlines(self);

        // Private functions -------------------------------------------------------------------------------------

        function strategyForScale(scale) {
            switch (scale.name) {
                case insight.Scales.Linear.name:
                    return new insight.LinearAxis();
                case insight.Scales.Ordinal.name:
                    return new insight.OrdinalAxis();
                case insight.Scales.Time.name:
                    return new insight.DateAxis();

                default:
                    return new insight.LinearAxis();
            }
        }

        function orientation() {
            if (self.isHorizontal()) {
                return (shouldReversePosition) ? 'top' : 'bottom';
            } else {
                return (shouldReversePosition) ? 'right' : 'left';
            }
        }

        function textAnchor() {

            var angleRadians = insight.Utils.degreesToRadians(self.tickLabelRotation());
            var trigFunc = (self.isHorizontal()) ? Math.sin : Math.cos;
            var trigResult = parseFloat(trigFunc(angleRadians).toFixed(10));

            if (trigResult === 0) {
                return 'middle';
            }

            switch (self.orientation()) {

                case 'left':
                case 'top':
                    return (trigResult > 0) ? 'end' : 'start';

                case 'right':
                case 'bottom':
                    return (trigResult > 0) ? 'start' : 'end';
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
         * This method calculates the scale ranges for this axis using the calculated output bounds for this axis.
         */
        function applyScaleRange() {

            // x-axis goes from 0 (left) to max (right)
            // y-axis goes from max (top) to 0 (bottom)
            var rangeBounds = (self.isHorizontal()) ? [0, self.bounds[0]] : [self.bounds[1], 0];

            if (self.scale.rangeRoundBands) {

                // ordinal, so use rangeRoundBands, passing the axis bounds and bar padding
                self.scale.rangeRoundBands(rangeBounds, self.barPadding());

            } else {

                // linear/date so use rangeBands, passing the axis bounds only
                self.scale.rangeRound(rangeBounds);

            }

        }

        // Internal functions -------------------------------------------------------------------------------------

        /*
         * Returns a boolean value representing if this Axis is zoomable.
         * @instance
         * @memberof! insight.Axis
         * @returns {Boolean} - A value indicating whether the axis is zoomable or not
         *
         * @also
         *
         * Sets the zoomable status of this Axis.  A zoomable Axis allows drag and zoom operations, and is not redrawn automatically on the draw() event of a chart.
         * @instance
         * @memberof! insight.Axis
         * @param {Boolean} shouldBeZoomable - A boolean value to set this Axis as zoomable or not.
         * @returns {this}
         */
        self.isZoomable = function(shouldBeZoomable) {
            if (!arguments.length) {
                return zoomable;
            }
            zoomable = shouldBeZoomable;

            return self;
        };

        self.tickValues = function() {
            return axisStrategy.tickValues(self);
        };

        self.measureTickValues = function(tickValues) {
            var textMeasurer = new insight.TextMeasurer(self.measureCanvas);

            var formattedValues = tickValues.map(function(tickValue) {
                return self.tickLabelFormat()(tickValue);
            });

            return formattedValues.map(function(formattedTickValue) {
                return textMeasurer.measureText(
                    formattedTickValue,
                    self.tickLabelFont(),
                    self.tickLabelRotation());
            });
        };

        self.calculateLabelDimensions = function() {

            if (!self.shouldDisplay()) {
                return {
                    width: 0,
                    height: 0
                };
            }

            var textMeasurer = new insight.TextMeasurer(self.measureCanvas);

            var axisLabelHeight = textMeasurer.measureText(self.label(), self.axisLabelFont()).height;

            var tickLabelSizes = self.measureTickValues(self.tickValues());

            var maxTickLabelWidth = d3.max(tickLabelSizes, function(d) {
                return Math.abs(d.width);
            });

            var maxTickLabelHeight = d3.max(tickLabelSizes, function(d) {
                return Math.abs(d.height);
            });

            var axisLabelWidth = Math.ceil(textMeasurer.measureText(self.label(), self.axisLabelFont()).width);

            if (maxTickLabelWidth === 0) {
                maxTickLabelHeight = 0;
            }

            if (axisLabelWidth === 0) {
                axisLabelHeight = 0;
            }

            var totalWidth =
                self.tickPadding() * 2 +
                self.tickSize() +
                maxTickLabelWidth +
                axisLabelWidth;

            var labelHeight = (self.isHorizontal()) ? maxTickLabelHeight + axisLabelHeight : Math.max(maxTickLabelHeight, axisLabelHeight);

            var totalHeight = labelHeight + self.tickPadding() * 2 + self.tickSize();

            return {
                height: totalHeight,
                width: totalWidth
            };
        };

        self.calculateLabelOverhang = function() {

            var overhangs = {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            };

            if (!self.shouldDisplay() ||
                (self.isHorizontal() && (self.tickLabelRotation() % 180 === 90)) ||
                (!self.isHorizontal() && (self.tickLabelRotation() % 180 === 0))) {
                return overhangs;
            }

            var textMeasurer = new insight.TextMeasurer(self.measureCanvas);

            var domain = self.domain();

            var firstTick = self.tickLabelFormat()(domain[0]);
            var lastTick = self.tickLabelFormat()(domain[domain.length - 1]);

            var firstTickSize = textMeasurer.measureText(firstTick, self.tickLabelFont(), self.tickLabelRotation());
            var lastTickSize = textMeasurer.measureText(lastTick, self.tickLabelFont(), self.tickLabelRotation());

            var angleRadians = insight.Utils.degreesToRadians(self.tickLabelRotation());

            switch (self.textAnchor()) {
                case 'start':
                case 'end':
                    firstTickSize.width = Math.abs(firstTickSize.width);
                    firstTickSize.height = Math.abs(firstTickSize.height);
                    lastTickSize.width = Math.abs(lastTickSize.width);
                    lastTickSize.height = Math.abs(lastTickSize.height);
                    break;

                case 'middle':
                    firstTickSize.width = Math.ceil(Math.abs(firstTickSize.width * 0.5));
                    firstTickSize.height = Math.ceil(Math.abs(firstTickSize.height * 0.5));
                    lastTickSize.width = Math.ceil(Math.abs(lastTickSize.width * 0.5));
                    lastTickSize.height = Math.ceil(Math.abs(lastTickSize.height * 0.5));
                    break;
            }

            var overhangLast;

            if (self.isHorizontal()) {

                overhangLast = ((self.textAnchor() === 'start') === (Math.cos(angleRadians) > 0));

                overhangs.left = !overhangLast || self.textAnchor() === 'middle' ? firstTickSize.width : 0;
                overhangs.right = overhangLast || self.textAnchor() === 'middle' ? lastTickSize.width : 0;

            } else {

                overhangLast = ((self.textAnchor() === 'start') === (Math.sin(angleRadians) < 0));

                overhangs.top = overhangLast || self.textAnchor() === 'middle' ? lastTickSize.height : 0;
                overhangs.bottom = !overhangLast || self.textAnchor() === 'middle' ? firstTickSize.height : 0;

            }

            return overhangs;

        };

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
            return axisStrategy.domain(self);
        };

        self.tickLabelRotationTransform = function() {

            var offset = self.tickPadding() + self.tickSize();

            var measurer = new insight.TextMeasurer(self.measureCanvas);
            var labelSize = measurer.measureText('aa', self.tickLabelFont());
            var textHeight = Math.ceil(labelSize.height);

            offset = (self.orientation() === 'left' || self.orientation() === 'top') ? -offset : offset;

            if (self.isHorizontal()) {
                return ' rotate(' + self.tickLabelRotation() + ',' + (textHeight / 2) + ',' + offset + ')';
            } else {
                return ' rotate(' + self.tickLabelRotation() + ',' + offset + ',' + (textHeight / 2) + ')';
            }
        };

        self.axisPosition = function() {
            var transform = 'translate(';

            if (self.isHorizontal()) {
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

            if (self.isHorizontal()) {
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

            self.scale.domain(self.domain());
            applyScaleRange();

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

        self.updateAxisBounds = function(chart) {
            self.bounds = chart.calculatePlotAreaSize();
        };

        self.draw = function(chart, isDragging) {

            // Scale range and bounds need to be initialized regardless of whether the axis will be displayed

            self.updateAxisBounds(chart);

            if (!self.isZoomable()) {
                self.initializeScale();
            }

            if (!self.shouldDisplay()) {
                return;
            }

            self.setupAxisView(chart);

            var animationDuration = isDragging ? 0 : 200;

            var adjustedTickSize = self.tickSize();
            // All ticks draw from top-left position of axis. Top and Left ticks drawn up/left, but Bottom and Right
            // draw down/right, overlapping the axis line.
            if (self.orientation() === 'bottom' || self.orientation() === 'right') {
                adjustedTickSize += self.lineWidth();
            }

            self.axis = d3.svg.axis()
                .scale(self.scale)
                .orient(self.orientation())
                .tickSize(adjustedTickSize)
                .tickPadding(self.tickPadding())
                .tickFormat(self.tickLabelFormat())
                .tickValues(self.tickValues());

            self.axisElement
                .attr('transform', self.axisPosition())
                .style('stroke', self.lineColor())
                .style('stroke-width', self.lineWidth())
                .style('fill', 'none')
                .transition()
                .duration(animationDuration)
                .call(self.axis);

            self.axisElement
                .selectAll('path.domain')
                .style('stroke', self.lineColor())
                .style('stroke-width', self.lineWidth())
                .style('fill', 'none');

            self.axisElement
                .selectAll('text')
                .attr('transform', self.tickLabelRotationTransform)
                .style('text-anchor', self.textAnchor());

            d3.selectAll(".tick > text")
                .style('font', self.tickLabelFont());

            self.labelElement
                .style('font', self.axisLabelFont())
                .style('color', self.axisLabelColor())
                .text(self.label());

            self.positionLabel();

            if (self.shouldShowGridlines()) {
                self.gridlines.drawGridLines(chart, self.scale.ticks());
            }
        };

        // Public functions --------------------------------------------------------------------------------------

        /**
         * The font to use for the axis tick labels.
         * @memberof! insight.Axis
         * @instance
         * @returns {String} - The font to use for the axis tick labels.
         *
         * @also
         *
         * Sets the font to use for the axis tick labels.
         * @memberof! insight.Axis
         * @instance
         * @param {String} font The font to use for the axis tick labels.
         * @returns {this}
         */
        self.tickLabelFont = function(font) {
            if (!arguments.length) {
                return tickLabelFont;
            }
            tickLabelFont = font;
            return self;
        };

        /**
         * The font to use for the axis label.
         * @memberof! insight.Axis
         * @instance
         * @returns {String} - The font to use for the axis label.
         *
         * @also
         *
         * Sets the font to use for the axis label.
         * @memberof! insight.Axis
         * @instance
         * @param {String} font The font to use for the axis label.
         * @returns {this}
         */
        self.axisLabelFont = function(font) {
            if (!arguments.length) {
                return axisLabelFont;
            }
            axisLabelFont = font;
            return self;
        };

        /**
         * The color to use for the axis tick label.
         * @memberof! insight.Axis
         * @instance
         * @returns {Function} - A function that returns the color of an axis tick label.
         *
         * @also
         *
         * Sets the color to use for the axis tick label.
         * @memberof! insight.Axis
         * @instance
         * @param {Function|Color} color Either a function that returns a color, or a color.
         * @returns {this}
         */
        self.tickLabelColor = function(color) {
            if (!arguments.length) {
                return tickLabelColor;
            }
            tickLabelColor = d3.functor(color);
            return self;
        };

        /**
         * The color to use for the axis label.
         * @memberof! insight.Axis
         * @instance
         * @returns {Function} - A function that returns the color of an axis label.
         *
         * @also
         *
         * Sets the color to use for the axis label.
         * @memberof! insight.Axis
         * @instance
         * @param {Function|Color} color Either a function that returns a color, or a color.
         * @returns {this}
         */
        self.axisLabelColor = function(color) {
            if (!arguments.length) {
                return axisLabelColor;
            }
            axisLabelColor = d3.functor(color);
            return self;
        };

        /**
         * Whether or not the axis is displayed horizontally (true) or vertically (false).
         * @memberof! insight.Axis
         * @instance
         * @returns {boolean} - Whether the axis is horizontal.
         */
        self.isHorizontal = function() {
            return self.direction === 'h';
        };

        /**
         * Whether the axis values are displayed in order or not.
         * @memberof! insight.Axis
         * @instance
         * @returns {Boolean} - Whether the axis is currently ordered.
         *
         * @also
         *
         * Sets whether the axis values are displayed in order or not.
         * @memberof! insight.Axis
         * @instance
         * @param {Function|Boolean} shouldOrderAxis Either a function that returns a boolean, or a boolean.
         * @returns {this}
         */
        self.isOrdered = function(shouldOrderAxis) {
            if (!arguments.length) {
                return shouldBeOrdered();
            }
            shouldBeOrdered = d3.functor(shouldOrderAxis);
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
        self.shouldDisplay = function(shouldBeDisplayed) {
            if (!arguments.length) {
                return shouldDisplay;
            }
            shouldDisplay = shouldBeDisplayed;
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
         * @param {boolean} isReversed Whether the axis is drawn at the bottom/left (false) or top/right (true).
         * @returns {this}
         */
        self.hasReversedPosition = function(isReversed) {
            if (!arguments.length) {
                return shouldReversePosition;
            }
            shouldReversePosition = isReversed;
            return self;
        };

        // label and axis tick methods

        /**
         * Gets the axis label
         * @memberof! insight.Axis
         * @instance
         * @returns {String} - The axis label
         *
         * @also
         *
         * Sets the axis label
         * @memberof! insight.Axis
         * @instance
         * @param {String} axisLabel The axis label
         * @returns {this}
         */
        self.label = function(axisLabel) {
            if (!arguments.length) {
                return label;
            }
            label = axisLabel;
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
         * Gets the color of the axis lines.
         * @memberof! insight.Axis
         * @instance
         * @returns {Color} - The color of the axis lines.
         *
         * @also
         *
         * Sets the color of the axis lines.
         * @memberof! insight.Axis
         * @instance
         * @param {Function|Color} color Either a function that returns a color, or a color.
         * @returns {this}
         */
        self.lineColor = function(color) {
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
         * @param {boolean} showGridlines Whether the axis has gridlines drawn from its major ticks.
         * @returns {this}
         */
        self.shouldShowGridlines = function(showLines) {
            if (!arguments.length) {
                return shouldShowGridlines;
            }
            shouldShowGridlines = showLines;

            return self;
        };

        self.tickFrequency = function(tickFreq) {
            if (!arguments.length) {
                return tickFrequency != null ? tickFrequency : axisStrategy.tickFrequency(self);
            }
            if (tickFreq <= 0) {
                throw new Error(insight.ErrorMessages.nonPositiveTickFrequencyException);
            }
            tickFrequency = tickFreq;

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
        this.lineColor(theme.axisStyle.axisLineColor);
        this.lineWidth(theme.axisStyle.axisLineWidth);

        this.tickLabelFont(theme.axisStyle.tickLabelFont);
        this.tickLabelColor(theme.axisStyle.tickLabelColor);
        this.axisLabelFont(theme.axisStyle.axisLabelFont);
        this.axisLabelColor(theme.axisStyle.axisLabelColor);

        this.shouldShowGridlines(theme.axisStyle.showGridlines);

        this.gridlines.applyTheme(theme);

        return this;
    };

})(insight);
