(function(insight) {

    /**
     * The Chart class is the element in which series and axes are drawn
     * @constructor insight.Chart
     * @param {String} name - A uniquely identifying name for this chart
     * @param {String} element - The css selector identifying the div container that the chart will be drawn in.
     * @example var myChart = new insight.Chart('My Chart', '#chart-div');
     */
    insight.Chart = function Chart(name, element) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            height = d3.functor(300),
            width = d3.functor(300),
            maxWidth = d3.functor(300),
            minWidth = d3.functor(300),
            zoomable = false,
            series = [],
            xAxes = [],
            yAxes = [],
            title = '',
            titleColor = d3.functor('#000'),
            titleFont = '16pt Helvetica Neue',
            shouldAutoMargin = true,
            legend = null,
            zoomInitialized = false,
            initialized = false,
            zoomAxis = null,
            titlePadding = 20,
            highlightSelector = insight.Utils.highlightSelector();

        var margin = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };

        // Internal variables -----------------------------------------------------------------------------------------

        self.name = name;
        self.element = element;
        self.selectedItems = [];
        self.container = null;
        self.chart = null;
        self.measureCanvas = document.createElement('canvas');
        self.seriesPalette = [];
        self.legendView = null;

        // Private functions ------------------------------------------------------------------------------------------

        function onWindowResize() {

            var scrollBarWidth = 50;
            var left = self.container[0][0].offsetLeft;

            var widthWithoutScrollBar =
                window.innerWidth -
                left -
                scrollBarWidth;

            self.resizeWidth(widthWithoutScrollBar);

        }

        function init() {
            initialized = true;

            window.addEventListener('resize', onWindowResize);

            self.container = d3.select(self.element).append('div');

            self.container
                .attr('class', insight.Constants.ContainerClass)
                .style('position', 'relative')
                .style('display', 'inline-block');

            self.chartSVG = self.container
                .append('svg')
                .attr('class', insight.Constants.ChartSVG);

            self.plotArea = self.chartSVG.append('g')
                .attr('class', insight.Constants.PlotArea);

            // create the empty text element used by the text measuring process
            self.axisMeasurer = self.plotArea
                .append('text')
                .attr('class', insight.Constants.AxisTextClass);

            self.labelMeasurer = self.container
                .append('text')
                .attr('class', insight.Constants.AxisLabelClass);

            self.titleContainer = self.container
                .append('text')
                .attr('class', insight.Constants.ChartTitleClass);

            self.addClipPath();

            self.initializeTooltip(self.container.node());
        }

        function initZoom() {

            self.zoom = d3.behavior.zoom()
                .on('zoom', self.dragging.bind(self));

            self.zoom.x(zoomAxis.scale);

            if (!self.zoomExists()) {
                //Draw ourselves as the first element in the plot area
                self.plotArea.insert('rect', ':first-child')
                    .attr('class', 'zoompane')
                    .attr('width', self.width())
                    .attr('height', self.height() - self.margin().top - self.margin().bottom)
                    .style('fill', 'none')
                    .style('pointer-events', 'all');
            }

            self.plotArea.select('.zoompane')
                .call(self.zoom);

            zoomInitialized = true;
        }

        // Internal functions -----------------------------------------------------------------------------------------

        self.filterSeriesByType = function(targetSeries) {

            var seriesOfType = self.series().filter(function(s) {
                return s.constructor === targetSeries.constructor;
            });

            return seriesOfType;

        };

        /*
         * Calculates the plot area of this chart, taking into account the size and margins of the chart.
         * @memberof! insight.Axis
         * @instance
         * @returns {Number[]} - An array with two items, for the width and height of the axis, respectively.
         */
        self.calculatePlotAreaSize = function() {
            var bounds = [];
            var margin = self.margin();

            bounds[0] = self.width() - margin.right - margin.left;
            bounds[1] = self.height() - margin.top - margin.bottom;

            return bounds;

        };

        /*
         * Gets the position of the given series in this chart compared to other series in the chart that have the
         * same type as the given series.
         *
         * For example:
         *  chart.series([lineSeries, bubbleSeries0, rowSeries, bubbleSeries1]);
         *  index = chart.seriesIndexByType(bubbleSeries0); // index === 0
         *  index = chart.seriesIndexByType(bubbleSeries1); // index === 1
         *
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Series} targetSeries The series to find the index of.
         * @returns {Number} - The position of the given series in this chart compared to other series in the chart
         * that have the same type as the given series.
         */
        self.seriesIndexByType = function(targetSeries) {

            var seriesOfType = self.filterSeriesByType(targetSeries);
            return seriesOfType.indexOf(targetSeries);

        };

        /*
         * Gets the number of series in the chart which are the same type as the target series.
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Series} targetSeries The series type to check for.
         * @returns {Number} - The number of series in the chart which are the same type as the target series.
         */
        self.countSeriesOfType = function(targetSeries) {

            var seriesOfType = self.filterSeriesByType(targetSeries);
            return seriesOfType.length;

        };

        self.drawTitle = function() {
            self.titleContainer
                .style('position', 'absolute')
                .style('left', self.margin().left + 'px')
                .style('width', self.width() - self.margin().left - self.margin().right + 'px')
                .style('text-align', 'center')
                .style("font", self.titleFont())
                .style("color", self.titleColor())
                .text(title);
        };

        self.addClipPath = function() {

            self.plotArea.append('clipPath')
                .attr('id', self.clipPath())
                .append('rect')
                .attr('x', 1)
                .attr('y', 0)
                .attr('width', self.width() - self.margin().left - self.margin().right)
                .attr('height', self.height() - self.margin().top - self.margin().bottom);
        };

        /*
         * Resizes the chart width according to the given window width within the chart's own minimum and maximum width
         * @memberof! insight.Chart
         * @instance
         * @param {Number} windowWidth The current window width to resize against
         */
        self.resizeWidth = function(windowWidth) {

            if (self.width() > windowWidth && self.width() !== self.minWidth()) {

                doResize(Math.max(self.minWidth(), windowWidth));

            } else if (self.width() < windowWidth && self.width() !== self.maxWidth()) {

                doResize(Math.min(self.maxWidth(), windowWidth));

            }


            function doResize(newWidth) {

                self.width(newWidth, true);
                self.draw();
            }

        };

        self.resizeChart = function() {

            if (shouldAutoMargin) {
                self.calculateChartMargin();
            }

            var chartMargin = self.margin();

            self.container.style('width', self.width() + 'px');

            self.chartSVG
                .attr('width', self.width())
                .attr('height', self.height());

            self.plotArea = self.plotArea
                .attr('transform', 'translate(' + chartMargin.left + ',' + chartMargin.top + ')');

            self.plotArea.select('#' + self.clipPath())
                .append('rect')
                .attr('x', 1)
                .attr('y', 0)
                .attr('width', self.width() - chartMargin.left - chartMargin.right)
                .attr('height', self.height() - chartMargin.top - chartMargin.bottom);
        };

        self.zoomExists = function() {
            var z = self.plotArea.selectAll('.zoompane');
            return z[0].length;
        };

        self.dragging = function() {
            self.draw(true);
        };

        self.clipPath = function() {

            return insight.Utils.safeString(self.name) + 'clip';
        };

        /*
         * Takes a CSS selector and applies classes to chart elements to show them as selected or not.
         * in response to a filtering event.
         * and something else is.
         * @memberof! insight.Chart
         * @param {String} selector - a CSS selector matching a slice of a dimension. eg. an entry in a grouping by Country
         would be 'in_England', which would match that dimensional value in any charts.
         */
        self.toggleHighlight = function(selector) {
            var clicked = self.plotArea.selectAll('.' + selector);
            var alreadySelected = insight.Utils.arrayContains(self.selectedItems, selector);

            if (alreadySelected) {
                clicked.classed('selected', false);
                insight.Utils.removeItemFromArray(self.selectedItems, selector);
            } else {
                clicked.classed('selected', true)
                    .classed('notselected', false);
                self.selectedItems.push(selector);
            }
        };

        self.clearHighlight = function() {

            self.selectedItems = [];

            // if the chart has not yet been drawn then there will be no plotArea so nothing to do here
            if (!self.plotArea) {
                return;
            }

            self.plotArea.selectAll('.selected')
                .classed('selected', false);

            self.plotArea.selectAll('.notselected')
                .classed('notselected', false);

        };

        /*
         * Creates the tooltip for this chart, checking if it exists already first.
         * @memberof! insight.Chart
         * @param {DOMElement} container - The DOM Element that the tooltip should be drawn inside.
         */
        self.initializeTooltip = function(container) {
            if (!self.tooltip) {
                self.tooltip = new insight.Tooltip()
                    .container(container);
            }
        };

        self.draw = function(isDragging) {

            if (!initialized) {
                init();
            }

            self.resizeChart();

            var axes = xAxes.concat(yAxes);

            axes.forEach(function(axis) {
                axis.draw(self, isDragging);
            });

            self.series()
                .forEach(function(series, index) {
                    series.color = d3.functor(self.seriesPalette[index % self.seriesPalette.length]);
                    series.draw(self, isDragging);
                });

            if (legend !== null) {
                legend.draw(self, self.series());
            }

            self.drawTitle();

            if (zoomable && !zoomInitialized) {
                initZoom();
            }
        };

        // Public functions -------------------------------------------------------------------------------------------

        /**
         * Empty event handler that is overridden by any listeners who want to know when this Chart's series change
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Series[]} series - An array of insight.Series belonging to this Chart
         */
        self.seriesChanged = function(series) {

        };

        /**
         * Enable zooming and panning for an axis on this chart
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Axis} axis The axis to enable zooming and panning for
         * @returns {this}
         */
        self.setInteractiveAxis = function(axis) {
            zoomable = true;
            zoomAxis = axis;
            axis.isZoomable(true);
            return self;
        };

        /**
         * The margins to use around the chart (top, bottom, left, right), each measured in pixels.
         * @memberof! insight.Chart
         * @instance
         * @returns {Object} - The current margins of the chart.
         * @example {top: 10, bottom: 20, left: 30, right: 40}
         *
         * @also
         *
         * Sets the margins to use around the chart (top, bottom, left, right), each measured in pixels.
         * @memberof! insight.Chart
         * @instance
         * @param {Object} margins The new margins to use around the chart.
         * @example self.margin({top: 10, bottom: 20, left: 30, right: 40})
         * @returns {this}
         */
        self.margin = function(newMargins) {
            if (!arguments.length) {
                return margin;
            }

            shouldAutoMargin = false;
            margin = newMargins;

            return self;
        };

        /**
         * The title of the chart.
         * @memberof! insight.Chart
         * @instance
         * @returns {String} - The title of the chart.
         *
         * @also
         *
         * Sets the title of the chart.
         * @memberof! insight.Chart
         * @instance
         * @param {String} chartTitle The new title of the chart.
         * @returns {this}
         */
        self.title = function(chartTitle) {
            if (!arguments.length) {
                return title;
            }

            title = chartTitle;
            return self;
        };

        /**
         * The font of the chart title.
         * @memberof! insight.Chart
         * @instance
         * @returns {String} - The font of the chart title.
         *
         * @also
         *
         * Sets the font of the chart title.
         * @memberof! insight.Chart
         * @instance
         * @param {String} chartTitleFont The new font of the chart title.
         * @returns {this}
         */
        self.titleFont = function(chartTitleFont) {
            if (!arguments.length) {
                return titleFont;
            }

            titleFont = chartTitleFont;
            return self;
        };

        /**
         * The text color of the chart title.
         * @memberof! insight.Chart
         * @instance
         * @returns {Function} - The text color of the chart title.
         *
         * @also
         *
         * Sets the text color of the chart title.
         * @memberof! insight.Chart
         * @instance
         * @param {Function} chartTitleColor The new text color of the chart title.
         * @returns {this}
         */
        self.titleColor = function(chartTitleColor) {
            if (!arguments.length) {
                return titleColor;
            }

            titleColor = d3.functor(chartTitleColor);
            return self;
        };

        /**
         * The spacing between the chart title and the plot area.
         * @memberof! insight.Chart
         * @instance
         * @returns {Number} - The padding in pixels between the chart title and the plot area.
         *
         * @also
         *
         * Sets the spacing between the chart title and the plot area.
         * @memberof! insight.Chart
         * @instance
         * @param {Number} newTitlePadding The padding in pixels between the chart title and the plot area.
         * @returns {this}
         */
        self.titlePadding = function(newTitlePadding) {
            if (!arguments.length) {
                return titlePadding;
            }

            titlePadding = newTitlePadding;
            return self;
        };

        /**
         * The width of the chart element, measured in pixels.
         * @memberof! insight.Chart
         * @instance
         * @returns {Number} - The current width of the chart.
         *
         * @also
         *
         * Sets the width of the chart element, measured in pixels.
         * @memberof! insight.Chart
         * @instance
         * @param {Number} newWidth The new width of the chart.
         * @param {Boolean} dontSetMax If falsey then the maxWidth of the chart will also be set to newWidth.
         * @returns {this}
         */
        self.width = function(newWidth, dontSetMax) {
            if (!arguments.length) {
                return width();
            }

            if (!dontSetMax) {

                self.maxWidth(newWidth);

            }

            width = d3.functor(newWidth);
            return self;
        };

        /**
         * The height of the chart element, measured in pixels.
         * @memberof! insight.Chart
         * @instance
         * @returns {Number} - The current height of the chart.
         *
         * @also
         *
         * Sets the height of the chart element, measured in pixels.
         * @memberof! insight.Chart
         * @instance
         * @param {Number} newHeight The new height of the chart, measured in pixels.
         * @returns {this}
         */
        self.height = function(newHeight) {
            if (!arguments.length) {
                return height();
            }
            height = d3.functor(newHeight);
            return self;
        };

        /**
         * The maximum width of the chart element, measured in pixels.
         * @memberof! insight.Chart
         * @instance
         * @returns {Number} - The maximum width of the chart.
         *
         * @also
         *
         * Sets the maximum width of the chart element, measured in pixels.
         * @memberof! insight.Chart
         * @instance
         * @param {Number} newMaxWidth The new maximum width of the chart, measured in pixels.
         * @returns {this}
         */
        self.maxWidth = function(newMaxWidth) {
            if (!arguments.length) {
                return maxWidth();
            }

            maxWidth = d3.functor(newMaxWidth);
            return self;
        };

        /**
         * The minimum width of the chart element, measured in pixels.
         * @memberof! insight.Chart
         * @instance
         * @returns {Number} - The minimum width of the chart.
         *
         * @also
         *
         * Sets the minimum width of the chart element, measured in pixels.
         * @memberof! insight.Chart
         * @instance
         * @param {Number} newMinWidth The new minimum width of the chart, measured in pixels.
         * @returns {this}
         */
        self.minWidth = function(newMinWidth) {
            if (!arguments.length) {
                return minWidth();
            }

            minWidth = d3.functor(newMinWidth);
            return self;
        };

        /**
         * The series to draw on this chart.
         * @memberof! insight.Chart
         * @instance
         * @returns {insight.Series[]} - The current series drawn on the chart.
         *
         * @also
         *
         * Sets the series to draw on this chart.
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Series[]} newSeries The new series to draw on the chart.
         * @returns {this}
         */
        self.series = function(newSeries) {
            if (!arguments.length) {
                return series;
            }
            series = newSeries;

            self.seriesChanged(self, newSeries);

            return self;
        };

        /**
         * The legend to draw on this chart.
         * @memberof! insight.Chart
         * @instance
         * @returns {insight.Legend} - The current legend drawn on the chart.
         *
         * @also
         *
         * Sets the legend to draw on this chart.
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Legend} newLegend The new legend to draw on the chart.
         * @returns {this}
         */
        self.legend = function(newLegend) {
            if (!arguments.length) {
                return legend;
            }

            legend = newLegend;

            return self;
        };

        /**
         * Add a new x-axis to the chart.
         *
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Axis} axis The x-axis to add.
         * @returns {this}
         */
        self.addXAxis = function(axis) {
            axis.direction = 'h';
            xAxes.push(axis);
            return self;
        };

        /**
         * All of the x-axes on the chart.
         * @memberof! insight.Chart
         * @instance
         * @returns {insight.Axis[]} - The current x-axes of the chart.
         *
         * @also
         *
         * Sets the x-axes on the chart.
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Axis[]} newXAxes The new x-axes to draw on the chart.
         * @returns {this}
         */
        self.xAxes = function(newXAxes) {
            if (!arguments.length) {
                return xAxes;
            }

            //Wipe out all existing axes
            xAxes = [];

            for (var index = 0; index < newXAxes.length; index++) {
                self.addXAxis(newXAxes[index]);
            }

            return self;
        };

        /**
         * The primary x-axis on the chart.
         * @memberof! insight.Chart
         * @instance
         * @returns {insight.Axis} - The current primary x-axis of the chart.
         *
         * @also
         *
         * Sets the primary x-axis on the chart.
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Axis} xAxis The new primary x-axis of the chart.
         * @returns {this}
         */
        self.xAxis = function(xAxis) {
            if (!arguments.length) {
                return xAxes[0];
            }

            var newXAxes = xAxes.slice(0);
            newXAxes[0] = xAxis;
            return self.xAxes(newXAxes);
        };

        /**
         * Add a new y-axis to the chart.
         *
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Axis} axis The y-axis to add.
         * @returns {this}
         */
        self.addYAxis = function(axis) {
            axis.direction = 'v';
            yAxes.push(axis);
            return self;
        };

        /**
         * All of the y-axes on the chart.
         * @memberof! insight.Chart
         * @instance
         * @returns {insight.Axis[]} - The current y-axes of the chart.
         *
         * @also
         *
         * Sets the y-axes on the chart.
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Axis[]} newYAxes The new y-axes to draw on the chart.
         * @returns {this}
         */
        self.yAxes = function(newYAxes) {
            if (!arguments.length) {
                return yAxes;
            }

            //Wipe out all existing axes
            yAxes = [];

            for (var index = 0; index < newYAxes.length; index++) {
                self.addYAxis(newYAxes[index]);
            }

            return self;
        };

        /**
         * The primary y-axis on the chart.
         * @memberof! insight.Chart
         * @instance
         * @returns {insight.Axis} - The current primary y-axis of the chart.
         *
         * @also
         *
         * Sets the primary y-axis on the chart.
         * @memberof! insight.Chart
         * @instance
         * @param {insight.Axis} yAxis The new primary y-axis of the chart.
         * @returns {this}
         */
        self.yAxis = function(yAxis) {
            if (!arguments.length) {
                return yAxes[0];
            }

            var newYAxes = yAxes.slice(0);
            newYAxes[0] = yAxis;
            return self.yAxes(newYAxes);
        };

        /**
         * Whether chart margins will be calculated automatically.
         * @memberof! insight.Chart
         * @instance
         * @returns {Boolean} - Whether chart margins will currently be calculated automatically.
         *
         * @also
         *
         * Sets whether chart margins will be calculated automatically.
         * @memberof! insight.Chart
         * @instance
         * @param {Boolean} auto The new value indicating whether chart margins will be calculated automatically.
         * @returns {this}
         */
        self.autoMargin = function(auto) {
            if (!arguments.length) {
                return shouldAutoMargin;
            }
            shouldAutoMargin = auto;
            return self;
        };

        //Apply the default look-and-feel
        self.applyTheme(insight.defaultTheme);
    };

    /*
     * Sets the margin for the Chart by using a MarginMEasurer to measure the required label and axis widths for
     * the contents of this Chart
     * @memberof! insight.Chart
     * @instance
     * @param {DOMElement} measurer - A canvas HTML element to use by the measurer.  Specific to each chart as
     *                                each chart may have specific css rules
     * @param {Object} axisStyles - An associative map between css properties and values for the axis values
     * @param {Object} labelStyles - An associative map between css properties and values for the axis labels
     */
    insight.Chart.prototype.calculateChartMargin = function() {

        var allAxes = this.xAxes().concat(this.yAxes());

        var margin = {
            'top': 10,
            'left': 10,
            'bottom': 10,
            'right': 10
        };

        allAxes.forEach(function(axis) {

            var labelDimensions = axis.calculateLabelDimensions();
            var axisMargin = (axis.isHorizontal()) ? labelDimensions.height : labelDimensions.width;

            margin[axis.orientation()] = Math.max(axisMargin, margin[axis.orientation()]);

            var labelOverhang = axis.calculateLabelOverhang();
            margin.top = Math.max(margin.top, labelOverhang.top);
            margin.bottom = Math.max(margin.bottom, labelOverhang.bottom);
            margin.left = Math.max(margin.left, labelOverhang.left);
            margin.right = Math.max(margin.right, labelOverhang.right);

        });

        //Adjust margins to fit the title
        if (this.title() && this.title().length > 0) {
            var textMeasurer = new insight.TextMeasurer(this.measureCanvas);
            margin.top += textMeasurer.measureText(this.title(), this.titleFont()).height + this.titlePadding();
        }

        this.margin(margin);

    };

    /**
     * Applies all properties from a theme to the chart, and all axes and series of the chart.
     * @memberof! insight.Chart
     * @instance
     * @param {insight.Theme} theme The theme to apply to all properties of the chart, and all axes and series of the chart.
     * @returns {this}
     */
    insight.Chart.prototype.applyTheme = function(theme) {
        var axes = this.xAxes()
            .concat(this.yAxes());

        this.titleFont(theme.chartStyle.titleFont);
        this.titleColor(theme.chartStyle.titleColor);

        axes.forEach(function(axis) {
            axis.applyTheme(theme);
        });

        this.seriesPalette = theme.chartStyle.seriesPalette;

        this.series()
            .forEach(function(series) {
                series.applyTheme(theme);
            });

        return this;
    };

})(insight);
