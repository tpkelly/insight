(function(insight) {

    /**
     * The PointSeries is an abstract base class for all Cartesian classes representing points (E.g. Scatter, Bubbles
     * and Lines).
     * @constructor
     * @extends insight.Series
     * @param {String} name - A uniquely identifying name for this chart
     * @param {insight.DataProvider | Object[]} data - An object which contains this series' data
     * @param {insight.Axis} x - The x axis
     * @param {insight.Axis} y - The y axis
     */
    insight.PointSeries = function PointSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        // Private variables -----------------------------------------------------------------------------------------

        var radiusFunction = d3.functor(3),
            self = this;

        var opacityFunction = function() {
            // If we are using selected/notSelected, then make selected more opaque than notSelected
            if (d3.select(this).classed('selected')) {
                return 0.8;
            }

            if (d3.select(this).classed('notselected')) {
                return 0.2;
            }

            //If not using selected/notSelected, make everything semi-transparent
            return 0.5;
        };

        // Internal variables -----------------------------------------------------------------------------------------

        self.cssClassName = d3.functor(insight.constants.Point);

        self.classValues = [self.cssClassName()];

        // Internal functions -------------------------------------------------------------------------------------------


        self.yPosition = function(d) {
            var yValue = self.y.scale(self.valueFunction()(d));
            return yValue || 0;
        };

        self.xPosition = function(d, i) {
            var xValue = self.x.scale(self.keyFunction()(d));
            return xValue || 0;
        };

        self.selector = function() {
            return self.name + self.cssClassName();
        };

        self.draw = function(chart, isDragging) {

            self.tooltip = chart.tooltip;
            self.selectedItems = chart.selectedItems;

            var duration = isDragging ? 0 : function(d, i) {
                return 200 + (i * 20);
            };

            var data = self.pointData(self.dataset());

            var points = chart.plotArea.selectAll('circle.' + self.shortClassName())
                .data(data, self.keyFunction());

            function rad(d) {
                return d.radius || 0;
            }

            points.enter()
                .append('circle')
                .on('mouseover', self.mouseOver)
                .on('mouseout', self.mouseOut)
                .on('click', self.click);

            points.attr('class', self.itemClassName);

            points.transition()
                .duration(duration)
                .attr('r', rad)
                .attr('cx', self.xPosition)
                .attr('cy', self.yPosition)
                .attr('opacity', self.pointOpacity())
                .style('fill', self.color);

            //Remove any data which is no longer displayed
            points.exit().remove();
        };


        // Public functions -------------------------------------------------------------------------------------------

        /**
         * The radius of each point, in pixels.
         * @memberof! insight.PointSeries
         * @instance
         * @returns {Number} - The current radius of each point, in pixels.
         * @deprecated Use radiusFunction instead.
         *
         * @also
         *
         * Sets the radius of each point, in pixels.
         * @memberof! insight.PointSeries
         * @instance
         * @param {Function|Number} radius The new radius of each point, in pixels.
         * @returns {this}
         * @deprecated Use radiusFunction instead.
         */
        self.pointRadius = function(radius) {
            if (!arguments.length) {
                return radiusFunction();
            }
            radiusFunction = d3.functor(radius);

            return self;
        };

        /**
         * Gets the function to extract the radius of each bubble from the data objects.
         * @memberof! insight.PointSeries
         * @instance
         * @returns {Function} - The current function used to determine the radius of data objects.
         *
         * @also
         *
         * Sets the function to extract the radius of each bubble from the data objects.
         * @memberof! insight.PointSeries
         * @instance
         * @param {Function|Number} radiusFunc The new radius of each bubble, extracted from the data objects.
         * @returns {this}
         */
        self.radiusFunction = function(radiusFunc) {
            if (!arguments.length) {
                return radiusFunction;
            }
            radiusFunction = d3.functor(radiusFunc);

            return self;
        };

        /**
         * Gets the function to compute the opacity of each point. A number between 0.0 and 1.0 where
         * 0.0 is completely transparent and 1.0 is opaque.
         * @memberof! insight.PointSeries
         * @instance
         * @returns {Number} - The current opacity of each point (0.0 - 1.0).
         *
         * @also
         *
         * Sets the opacity of each point. A number between 0.0 and 1.0 where
         * 0.0 is completely transparent and 1.0 is completely opaque.
         * @memberof! insight.PointSeries
         * @instance
         * @param {Number} opacity The new opacity of each point.
         * @returns {this}
         */
        self.pointOpacity = function(opacity) {
            if (!arguments.length) {
                return opacityFunction;
            }
            opacityFunction = d3.functor(opacity);

            return self;
        };
    };

    insight.PointSeries.prototype = Object.create(insight.Series.prototype);
    insight.PointSeries.prototype.constructor = insight.PointSeries;

})(insight);
