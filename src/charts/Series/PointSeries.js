(function(insight) {

    /*
     * The PointSeries is an abstract base class for all Cartesian classes representing points (E.g. Scatter, Bubbles
     * and Lines).
     * @class insight.PointSeries
     * @param {string} name - A uniquely identifying name for this chart
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.PointSeries = function PointSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        var radiusFunction = d3.functor(3),
            opacityFunction = d3.functor(1),
            self = this;

        // Internal functions -----------------------------------------------------------------------------------------

        self.rangeY = function(d) {
            return self.y.scale(self.valueFunction()(d));
        };

        self.rangeX = function(d, i) {
            return self.x.scale(self.keyFunction()(d));
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
         * @param {Number} radius The new radius of each point, in pixels.
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
         * The function to extract the radius of each bubble from the data objects.
         * @memberof! insight.BubbleSeries
         * @instance
         * @returns {Function} - The current function used to determine the radius of data objects.
         *
         * @also
         *
         * Sets the function to extract the radius of each bubble from the data objects.
         * @memberof! insight.BubbleSeries
         * @instance
         * @param {Function} radiusFunc The new function to extract the radius of each bubble from the data objects.
         * @returns {this}
         */
        self.radiusFunction = function(radiusFunc) {
            if (!arguments.length) {
                return radiusFunction;
            }
            radiusFunction = radiusFunc;

            return self;
        };

        /**
         * The opacity of each point. A number between 0.0 and 1.0 where
         * 0.0 is completely transparent and 1.0 is completely opaque.
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
                return opacityFunction();
            }
            opacityFunction = d3.functor(opacity);

            return self;
        };
    };

    insight.PointSeries.prototype = Object.create(insight.Series.prototype);
    insight.PointSeries.prototype.constructor = insight.PointSeries;

})(insight);
