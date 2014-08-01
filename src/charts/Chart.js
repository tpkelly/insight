(function(insight) {

    /**
     * The Chart class is the element in which series and axes are drawn
     * @class insight.Chart
     * @param {string} name - A uniquely identifying name for this chart
     * @param {string} element - The css selector identifying the div container that the chart will be drawn in. '#columnChart' for example.
     */
    insight.Chart = (function(insight) {

        function Chart(name, element) {

            this.name = name;
            this.element = element;
            this.selectedItems = [];
            this.container = null;
            this.chart = null;
            this.measureCanvas = document.createElement('canvas');

            var margin = {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            };

            this.legendView = null;

            var height = d3.functor(300),
                width = d3.functor(300),
                maxWidth = d3.functor(300),
                minWidth = d3.functor(300),
                zoomable = false,
                series = [],
                xAxes = [],
                yAxes = [],
                self = this,
                title = '',
                autoMargin = true,
                legend = null,
                zoomInitialized = false,
                initialized = false,
                zoomAxis = null;

            // private functions

            function onWindowResize() {

                var scrollBarWidth = 50;
                var left = self.container[0][0].offsetLeft;

                var widthWithoutScrollBar =
                    window.innerWidth -
                    left -
                    scrollBarWidth;

                self.resizeWidth(widthWithoutScrollBar);

            }

            var init = function(create, container) {

                window.addEventListener('resize', onWindowResize);

                self.container = create ? d3.select(container)
                    .append('div') : d3.select(self.element)
                    .append('div');

                self.container
                    .attr('class', insight.Constants.ContainerClass)
                    .style('position', 'relative')
                    .style('display', 'inline-block');

                self.chartSVG = self.container
                    .append('svg')
                    .attr('class', insight.Constants.ChartSVG);

                self.plotArea = self.chartSVG.append('g')
                    .attr('class', insight.Constants.PlotArea);

                self.addClipPath();

                initialized = true;
            };


            var initZoom = function() {
                self.zoom = d3.behavior.zoom()
                    .on('zoom', self.dragging.bind(self));

                self.zoom.x(zoomAxis.scale);

                if (!self.zoomExists()) {
                    //Draw ourselves as the first element in the plot area
                    self.plotArea.insert('rect', ':first-child')
                        .attr('class', 'zoompane')
                        .attr('width', self.width())
                        .attr('height', self.height() - self.margin()
                            .top - self.margin()
                            .bottom)
                        .style('fill', 'none')
                        .style('pointer-events', 'all');
                }

                self.plotArea.select('.zoompane')
                    .call(self.zoom);

                zoomInitialized = true;
            };

            // public methods

            /** 
             * Empty event handler that is overridden by any listeners who want to know when this Chart's series change
             * @memberof! insight.Chart
             * @param {insight.Series[]} series - An array of insight.Series belonging to this Chart
             */
            this.seriesChanged = function(series) {

            };



            this.draw = function(dragging) {

                if (!initialized) {
                    init();
                }

                this.resizeChart();

                var axes = xAxes.concat(yAxes);

                axes.map(function(axis) {
                    axis.draw(self, dragging);
                });

                this.series()
                    .map(function(series) {
                        series.draw(self, dragging);
                    });

                if (legend !== null) {
                    legend.draw(self, self.series());
                }

                if (zoomable && !zoomInitialized) {
                    initZoom();
                }
            };

            this.addClipPath = function() {
                this.plotArea.append('clipPath')
                    .attr('id', this.clipPath())
                    .append('rect')
                    .attr('x', 1)
                    .attr('y', 0)
                    .attr('width', this.width() - this.margin()
                        .left - this.margin()
                        .right)
                    .attr('height', this.height() - this.margin()
                        .top - this.margin()
                        .bottom);
            };

            /**
             * Resizes the chart width according to the given window width within the chart's own minimum and maximum width
             * @memberof! insight.Chart
             * @instance
             * @param {Number} windowWidth The current window width to resize against
             */
            this.resizeWidth = function(windowWidth) {

                var self = this;


                if (this.width() > windowWidth && this.width() !== this.minWidth()) {

                    doResize(Math.max(this.minWidth(), windowWidth));

                } else if (this.width() < windowWidth && this.width() !== this.maxWidth()) {

                    doResize(Math.min(this.maxWidth(), windowWidth));

                }


                function doResize(newWidth) {

                    self.width(newWidth, true);
                    self.draw();

                }

            };

            this.resizeChart = function() {
                if (autoMargin) {
                    self.calculateLabelMargin();
                }

                var chartMargin = self.margin();

                var context = self.measureCanvas.getContext('2d');
                context.font = "15pt Open Sans Bold";

                self.container.style('width', self.width() + 'px');

                self.chartSVG
                    .attr('width', self.width())
                    .attr('height', self.height());

                self.plotArea = this.plotArea
                    .attr('transform', 'translate(' + chartMargin.left + ',' + chartMargin.top + ')');

                self.plotArea.select('#' + self.clipPath())
                    .append('rect')
                    .attr('x', 1)
                    .attr('y', 0)
                    .attr('width', self.width() - chartMargin.left - chartMargin.right)
                    .attr('height', self.height() - chartMargin.top - chartMargin.bottom);
            };


            /**
             * Enable zooming for an axis on this chart
             * @memberof! insight.Chart
             * @instance
             * @param axis The axis to enable zooming for
             * @returns {Chart} Returns this.
             */
            this.zoomable = function(axis) {
                zoomable = true;
                zoomAxis = axis;
                axis.zoomable(true);
                return this;
            };



            this.zoomExists = function() {
                var z = this.plotArea.selectAll('.zoompane');
                return z[0].length;
            };

            this.dragging = function() {
                self.draw(true);
            };

            /**
             * The margins to use around the chart (top, bottom, left, right), each measured in pixels.
             * @memberof! insight.Chart
             * @instance
             * @returns {object} - The current margins of the chart.
             *
             * @also
             *
             * Sets the margins to use around the chart (top, bottom, left, right), each measured in pixels.
             * @memberof! insight.Chart
             * @instance
             * @param {object} margins The new margins to use around the chart.
             * @returns {this}
             */
            this.margin = function(newMargins) {
                if (!arguments.length) {
                    return margin;
                }

                autoMargin = false;
                margin = newMargins;

                return this;
            };

            this.clipPath = function() {

                return insight.Utils.safeString(this.name) + 'clip';
            };


            this.title = function(_) {
                if (!arguments.length) {
                    return title;
                }

                title = _;
                return this;
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
            this.width = function(newWidth, dontSetMax) {
                if (!arguments.length) {
                    return width();
                }

                if (!dontSetMax) {

                    this.maxWidth(newWidth);

                }

                width = d3.functor(newWidth);
                return this;
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
            this.height = function(newHeight) {
                if (!arguments.length) {
                    return height();
                }
                height = d3.functor(newHeight);
                return this;
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
            this.maxWidth = function(newMaxWidth) {
                if (!arguments.length) {
                    return maxWidth();
                }

                maxWidth = d3.functor(newMaxWidth);
                return this;
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
            this.minWidth = function(newMinWidth) {
                if (!arguments.length) {
                    return minWidth();
                }

                minWidth = d3.functor(newMinWidth);
                return this;
            };

            /**
             * The series to draw on this chart.
             * @memberof! insight.Chart
             * @instance
             * @returns {Series[]} - The current series drawn on the chart.
             *
             * @also
             *
             * Sets the series to draw on this chart.
             * @memberof! insight.Chart
             * @instance
             * @param {Series[]} newSeries The new series to draw on the chart.
             * @returns {this}
             */
            this.series = function(newSeries) {
                if (!arguments.length) {
                    return series;
                }
                series = newSeries;

                self.seriesChanged(self, newSeries);

                return this;
            };

            /**
             * The legend to draw on this chart.
             * @memberof! insight.Chart
             * @instance
             * @returns {Legend} - The current legend drawn on the chart.
             *
             * @also
             *
             * Sets the legend to draw on this chart.
             * @memberof! insight.Chart
             * @instance
             * @param {Legend} newLegend The new legend to draw on the chart.
             * @returns {this}
             */
            this.legend = function(newLegend) {
                if (!arguments.length) {
                    return legend;
                }

                legend = newLegend;

                return this;
            };

            /**
             * Add a new x-axis to the chart.
             *
             * @memberof! insight.Chart
             * @instance
             * @param {Axis} [axis] The x-axis to add.
             * @returns {this}
             */
            this.addXAxis = function(axis) {
                axis.direction = 'h';
                xAxes.push(axis);
                return this;
            };

            /**
             * All of the x-axes on the chart.
             * @memberof! insight.Chart
             * @instance
             * @returns {Axis[]} - The current x-axes of the chart.
             *
             * @also
             *
             * Sets the x-axes on the chart.
             * @memberof! insight.Chart
             * @instance
             * @param {Axis[]} newXAxes The new x-axes to draw on the chart.
             * @returns {this}
             */
            this.xAxes = function(newXAxes) {
                if (!arguments.length) {
                    return xAxes;
                }

                //Wipe out all existing axes
                xAxes = [];

                for (var index = 0; index < newXAxes.length; index++) {
                    self.addXAxis(newXAxes[index]);
                }

                return this;
            };

            /**
             * The primary x-axis on the chart.
             * @memberof! insight.Chart
             * @instance
             * @returns {Axis} - The current primary x-axis of the chart.
             *
             * @also
             *
             * Sets the primary x-axis on the chart.
             * @memberof! insight.Chart
             * @instance
             * @param {Axis} xAxis The new primary x-axis of the chart.
             * @returns {this}
             */
            this.xAxis = function(xAxis) {
                if (!arguments.length) {
                    return xAxes[0];
                }

                var newXAxes = xAxes.slice(0);
                newXAxes[0] = xAxis;
                return this.xAxes(newXAxes);
            };

            /**
             * Add a new y-axis to the chart.
             *
             * @memberof! insight.Chart
             * @instance
             * @param {Axis} [axis] The y-axis to add.
             * @returns {this}
             */
            this.addYAxis = function(axis) {
                axis.direction = 'v';
                yAxes.push(axis);
                return this;
            };

            /**
             * All of the y-axes on the chart.
             * @memberof! insight.Chart
             * @instance
             * @returns {Axis[]} - The current y-axes of the chart.
             *
             * @also
             *
             * Sets the y-axes on the chart.
             * @memberof! insight.Chart
             * @instance
             * @param {Axis[]} newYAxes The new y-axes to draw on the chart.
             * @returns {this}
             */
            this.yAxes = function(newYAxes) {
                if (!arguments.length) {
                    return yAxes;
                }

                //Wipe out all existing axes
                yAxes = [];

                for (var index = 0; index < newYAxes.length; index++) {
                    self.addYAxis(newYAxes[index]);
                }

                return this;
            };

            /**
             * The primary y-axis on the chart.
             * @memberof! insight.Chart
             * @instance
             * @returns {Axis} - The current primary y-axis of the chart.
             *
             * @also
             *
             * Sets the primary y-axis on the chart.
             * @memberof! insight.Chart
             * @instance
             * @param {Axis} yAxis The new primary y-axis of the chart.
             * @returns {this}
             */
            this.yAxis = function(yAxis) {
                if (!arguments.length) {
                    return yAxes[0];
                }

                var newYAxes = yAxes.slice(0);
                newYAxes[0] = yAxis;
                return this.yAxes(newYAxes);
            };


            this.autoMargin = function(_) {
                if (!arguments.length) {
                    return autoMargin;
                }
                autoMargin = _;
                return this;
            };

            /**
             * This function takes a CSS dimension selector and updates the class attributes of 
             * any attributes in this Chart to reflect whether they are currently selected or not. 
             * .notselected is needed in addition to .selected, as items are coloured differently when they are not selected
             * and something else is.
             * @memberof! insight.Chart
             * @param {string} selector - a CSS selector matching a slice of a dimension. eg. an entry in a grouping by Country 
                                          would be 'in_England', which would match that dimensional value in any charts.
             */
            this.highlight = function(selector) {
                // select the elements matching the dimension that has been clicked (possibly in another chart)
                var clicked = this.plotArea.selectAll('.' + selector);
                var alreadySelected = clicked.classed('selected');

                if (alreadySelected) {
                    clicked.classed('selected', false);
                    insight.Utils.removeItemFromArray(self.selectedItems, selector);
                } else {
                    clicked.classed('selected', true)
                        .classed('notselected', false);
                    self.selectedItems.push(selector);
                }

                // depending on if anything is selected, we have to update the rest as notselected so that they are coloured differently
                var selected = this.plotArea.selectAll('.selected');
                var notselected = this.plotArea.selectAll('.bar:not(.selected),.bubble:not(.selected)');

                // if nothing is selected anymore, clear the .notselected class from any elements (stop showing them as gray)
                notselected.classed('notselected', selected[0].length > 0);
            };
        }



        Chart.prototype.calculateLabelMargin = function() {

            var canvas = this.measureCanvas;
            var max = 0;
            var margin = {
                "top": 0,
                "left": 0,
                "bottom": 0,
                "right": 0
            };

            this.series()
                .forEach(function(series) {
                    var xAxis = series.x;
                    var yAxis = series.y;

                    var labelDimensions = series.maxLabelDimensions(canvas);

                    margin[xAxis.orientation()] = Math.max(labelDimensions.maxKeyHeight, margin[xAxis.orientation()]);
                    margin[yAxis.orientation()] = Math.max(labelDimensions.maxValueWidth, margin[yAxis.orientation()]);
                });

            this.margin(margin);
        };

        return Chart;

    })(insight);
})(insight);
