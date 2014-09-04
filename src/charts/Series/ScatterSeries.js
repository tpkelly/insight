(function(insight) {

    /**
     * The ScatterSeries class extends the Series class
     * @class insight.ScatterSeries
     * @param {string} name - A uniquely identifying name for this chart
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     * @param {object} color - a string or function that defines the color to be used for the items in this series
     */
    insight.ScatterSeries = function ScatterSeries(name, data, x, y, color) {

        insight.Series.call(this, name, data, x, y, color);

        var radiusFunction = d3.functor(3),
            opacityFunction = d3.functor(1),
            self = this,
            selector = this.name + insight.Constants.Scatter;


        this.findMax = function(scale) {
            var self = this;

            var max = 0;
            var data = this.data.getData();

            var func = scale === self.x ? self.keyFunction() : self.valueFunction();

            var m = d3.max(data, func);

            max = m > max ? m : max;

            return max;
        };


        this.rangeY = function(d) {
            return self.y.scale(self.valueFunction()(d));
        };

        this.rangeX = function(d, i) {
            return self.x.scale(self.keyFunction()(d));
        };

        this.radiusFunction = function(_) {
            if (!arguments.length) {
                return radiusFunction;
            }
            radiusFunction = _;

            return this;
        };

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
        this.pointRadius = function(radius) {
            if (!arguments.length) {
                return radiusFunction();
            }
            radiusFunction = d3.functor(radius);

            return this;
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
        this.pointOpacity = function(opacity) {
            if (!arguments.length) {
                return opacityFunction();
            }
            opacityFunction = d3.functor(opacity);

            return this;
        };

        var className = function(d) {

            return selector + " " + insight.Constants.Scatter + " " + self.dimensionName;
        };

        this.scatterData = function(data) {
            var max = d3.max(data, radiusFunction);

            //Minimum of pixels-per-axis-unit
            var xValues = data.map(self.keyFunction());
            var yValues = data.map(self.valueFunction());
            var xBounds = this.x.bounds[1];
            var yBounds = this.y.bounds[0];

            // create radius for each item
            data.forEach(function(d) {
                d.radius = radiusFunction(d);
            });

            return data;
        };

        this.draw = function(chart, drag) {

            self.initializeTooltip(chart.container.node());
            self.selectedItems = chart.selectedItems;

            var duration = drag ? 0 : function(d, i) {
                return 200 + (i * 20);
            };

            var click = function(filter) {
                return self.click(this, filter);
            };

            var scatterData = this.scatterData(this.dataset());

            var points = chart.plotArea.selectAll('circle.' + selector)
                .data(scatterData, self.keyFunction());

            points.enter()
                .append('circle')
                .attr('class', className)
                .on('mouseover', this.mouseOver)
                .on('mouseout', this.mouseOut)
                .on('click', click);

            points
                .attr('r', radiusFunction)
                .attr('cx', self.rangeX)
                .attr('cy', self.rangeY)
                .attr('opacity', opacityFunction)
                .attr('fill', this.color);
        };
    };

    insight.ScatterSeries.prototype = Object.create(insight.Series.prototype);
    insight.ScatterSeries.prototype.constructor = insight.ScatterSeries;

})(insight);
