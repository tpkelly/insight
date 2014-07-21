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

            var zoomAxis = null;
            this.container = null;
            this.chart = null;
            this.measureCanvas = document.createElement('canvas');

            this._margin = {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            };

            var height = d3.functor(300);
            var width = d3.functor(300);
            var zoomable = false;
            var series = [];
            var axes = [];
            var self = this;
            var barPadding = d3.functor(0.1);
            var title = '';
            var autoMargin = false;


            this.init = function(create, container) {

                if (autoMargin) {
                    self.calculateLabelMargin();
                }

                self.container = create ? d3.select(container)
                    .append('div') : d3.select(self.element)
                    .append('div');

                self.container
                    .attr('class', insight.Constants.ContainerClass)
                    .style('width', self.width() + 'px')
                    .style('position', 'relative')
                    .style('display', 'inline-block');

                self.chartSVG = self.container
                    .append('svg')
                    .attr('class', insight.Constants.ChartSVG)
                    .attr('width', self.width())
                    .attr('height', self.height());

                self.chart = self.chartSVG.append('g')
                    .attr('class', insight.Constants.Chart)
                    .attr('transform', 'translate(' + self.margin()
                        .left + ',' + self.margin()
                        .top + ')');

                self.addClipPath();

                axes.map(function(axis) {
                    axis.initialize();
                });

                if (zoomable) {
                    self.initZoom();
                }

                this.tooltip = new insight.Tooltip()
                    .container(self.container.node())
                    .offset({
                        x: 0,
                        y: -10
                    });

                self.draw(false);
            };


            this.draw = function(dragging) {
                this.resizeChart();

                axes.map(function(axis) {
                    var isZoom = zoomAxis == axis;

                    if (!isZoom) {
                        axis.initializeScale();
                    }

                    axis.draw(dragging);
                });

                this.series()
                    .map(function(series) {
                        series.draw(dragging);
                    });
            };

            this.addAxis = function(axis) {
                axes.push(axis);
            };

            this.axes = function() {
                return axes;
            };

            this.addClipPath = function() {
                this.chart.append('clipPath')
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


            this.resizeChart = function() {
                this.container.style('width', this.width() + 'px');

                this.chartSVG
                    .attr('width', this.width())
                    .attr('height', this.height());

                this.chart = this.chart
                    .attr('transform', 'translate(' + this.margin()
                        .left + ',' + this.margin()
                        .top + ')');

                this.chart.select('#' + this.clipPath())
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



            this.recalculateScales = function() {
                scales.map(function(scale) {
                    // don't resize the scale that is being dragged/zoomed, it is done automatically by d3
                    var notZoomScale = zoomAxis != scale;

                    if (notZoomScale) {
                        scale.initialize();
                    }
                });
            };

            this.zoomable = function(scale) {
                zoomable = true;
                zoomAxis = scale;
                return this;
            };

            this.initZoom = function() {
                this.zoom = d3.behavior.zoom()
                    .on('zoom', self.dragging.bind(self));

                this.zoom.x(zoomAxis.scale);

                if (!this.zoomExists()) {
                    this.chart.append('rect')
                        .attr('class', 'zoompane')
                        .attr('width', this.width())
                        .attr('height', this.height() - this.margin()
                            .top - this.margin()
                            .bottom)
                        .style('fill', 'none')
                        .style('pointer-events', 'all');
                }

                this.chart.select('.zoompane')
                    .call(this.zoom);
            };

            this.zoomExists = function() {
                var z = this.chart.selectAll('.zoompane');
                return z[0].length;
            };

            this.dragging = function() {
                self.draw(true);
            };

            this.barPadding = function(_) {
                if (!arguments.length) {
                    return barPadding();
                }
                barPadding = d3.functor(_);
                return this;
            };

            this.margin = function(_) {
                if (!arguments.length) {
                    return this._margin;
                }
                this._margin = _;
                return this;
            };

            this.clipPath = function() {

                return insight.Utils.safeString(this.name) + 'clip';
            };


            /**
             * This method is called by member series when their items are activated by a mouseover event. Tooltips are displayed and CSS classes applied.
             * @param {DOMElement} element - The DOMElement (usually SVG) triggering the event
             * @param {string} text - The text/html that the series is providing
             */
            this.mouseOver = function(element, tooltipText) {

                this.tooltip.show(element, tooltipText);

                d3.select(element)
                    .classed('active', true);
            };

            /**
             * This method is called by member series when their items activate a mouseout event.  Any tooltip is hidden and CSS classes are applied.
             * @param {DOMElement} element - The DOMElement (usually SVG) triggering the event
             * @param {string} text - The text/html that the series is providing
             */
            this.mouseOut = function(element) {

                this.tooltip.hide();

                d3.select(element)
                    .classed('active', false);
            };

            this.title = function(_) {
                if (!arguments.length) {
                    return title;
                }

                title = _;
                return this;
            };

            this.width = function(_) {
                if (!arguments.length) {
                    return width();
                }

                width = d3.functor(_);
                return this;
            };

            this.height = function(_) {
                if (!arguments.length) {
                    return height();
                }
                height = d3.functor(_);
                return this;
            };

            this.series = function(_) {
                if (!arguments.length) {
                    return series;
                }
                series = _;
                return this;
            };

            this.autoMargin = function(_) {
                if (!arguments.length) {
                    return autoMargin;
                }
                autoMargin = _;
                return this;
            };

            this.highlight = function(selector, value) {

                var clicked = this.chart.selectAll('.' + selector);
                var alreadySelected = clicked.classed('selected');

                if (alreadySelected) {
                    clicked.classed('selected', false);
                    insight.Utils.removeItemFromArray(self.selectedItems, selector);
                } else {
                    clicked.classed('selected', true)
                        .classed('notselected', false);
                    self.selectedItems.push(selector);
                }

                var selected = this.chart.selectAll('.selected');
                var notselected = this.chart.selectAll('.bar:not(.selected),.bubble:not(.selected)');

                notselected.classed('notselected', selected[0].length > 0);
            };

            insight.addChart(this);
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
                    var labelDimensions = series.maxLabelDimensions(canvas);

                    margin[series.x.anchor] = Math.max(labelDimensions.maxKeyWidth, margin[series.x.anchor]);
                    margin[series.y.anchor] = Math.max(labelDimensions.maxValueWidth, margin[series.y.anchor]);
                });

            this.margin(margin);
        };

        return Chart;

    })(insight);
})(insight);
