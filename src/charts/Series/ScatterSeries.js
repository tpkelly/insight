(function(insight) {

    /**
     * The ScatterSeries class extends the Series class
     * @class insight.ScatterSeries
     * @param {string} name - A uniquely identifying name for this chart
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.ScatterSeries = function ScatterSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var radiusFunction = d3.functor(3),
            opacityFunction = d3.functor(1),
            self = this,
            selector = self.name + insight.Constants.Scatter;

        // Private functions ------------------------------------------------------------------------------------------

        function className(d) {

            return selector + " " + insight.Constants.Scatter + " " + self.dimensionName;
        }

        // Internal functions -----------------------------------------------------------------------------------------

        self.rangeY = function(d) {
            return self.y.scale(self.valueFunction()(d));
        };

        self.rangeX = function(d, i) {
            return self.x.scale(self.keyFunction()(d));
        };

        self.radiusFunction = function(_) {
            if (!arguments.length) {
                return radiusFunction;
            }
            radiusFunction = _;

            return self;
        };

        self.scatterData = function(data) {
            var max = d3.max(data, radiusFunction);

            //Minimum of pixels-per-axis-unit
            var xValues = data.map(self.keyFunction());
            var yValues = data.map(self.valueFunction());
            var xBounds = self.x.bounds[1];
            var yBounds = self.y.bounds[0];

            // create radius for each item
            data.forEach(function(d) {
                d.radius = radiusFunction(d);
            });

            return data;
        };

        self.draw = function(chart, isDragging) {

            self.initializeTooltip(chart.container.node());
            self.selectedItems = chart.selectedItems;

            var duration = isDragging ? 0 : function(d, i) {
                return 200 + (i * 20);
            };

            function click(filter) {
                return self.click(self, filter);
            }

            var scatterData = self.scatterData(self.dataset());

            var points = chart.plotArea.selectAll('circle.' + selector)
                .data(scatterData, self.keyFunction());

            points.enter()
                .append('circle')
                .attr('class', className)
                .on('mouseover', self.mouseOver)
                .on('mouseout', self.mouseOut)
                .on('click', click);

            points
                .attr('r', radiusFunction)
                .attr('cx', self.rangeX)
                .attr('cy', self.rangeY)
                .attr('opacity', opacityFunction)
                .style('fill', self.color);
        };

        // Public functions -------------------------------------------------------------------------------------------

        /**
         * The radius of each point, in pixels.
         * @memberof! insight.ScatterSeries
         * @instance
         * @returns {Number} - The current radius of each point, in pixels.
         *
         * @also
         *
         * Sets the radius of each point, in pixels.
         * @memberof! insight.ScatterSeries
         * @instance
         * @param {Number} radius The new radius of each point, in pixels.
         * @returns {this}
         */
        self.pointRadius = function(radius) {
            if (!arguments.length) {
                return radiusFunction();
            }
            radiusFunction = d3.functor(radius);

            return self;
        };

        /**
         * The opacity of each point. A number between 0.0 and 1.0 where
         * 0.0 is completely transparent and 1.0 is completely opaque.
         * @memberof! insight.ScatterSeries
         * @instance
         * @returns {Number} - The current opacity of each point (0.0 - 1.0).
         *
         * @also
         *
         * Sets the opacity of each point. A number between 0.0 and 1.0 where
         * 0.0 is completely transparent and 1.0 is completely opaque.
         * @memberof! insight.ScatterSeries
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

    insight.ScatterSeries.prototype = Object.create(insight.Series.prototype);
    insight.ScatterSeries.prototype.constructor = insight.ScatterSeries;

})(insight);
