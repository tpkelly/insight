(function(insight) {

    /**
     * The BubbleSeries class extends the Series class
     * @class insight.BubbleSeries
     * @param {string} name - A uniquely identifying name for this chart
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.BubbleSeries = function BubbleSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            selector = self.name + insight.Constants.Bubble,
            radiusFunction = d3.functor(10);

        // Internal variables -------------------------------------------------------------------------------------------

        self.classValues = [insight.Constants.Bubble];

        // Internal functions -----------------------------------------------------------------------------------------

        self.rangeY = function(d) {
            return self.y.scale(self.valueFunction()(d));
        };

        self.rangeX = function(d, i) {
            return self.x.scale(self.keyFunction()(d));
        };

        /*
         * This method is called when any post aggregation calculations, provided by the computeFunction() setter, need to be recalculated.
         * @memberof insight.BubbleSeries
         * @instance
         * @param {insight.Scale} scale - a scale parameter to check if the values should be taken from x or y functions.
         * @returns {object} - the maximum value for the series on the provided axis
         */
        self.findMax = function(scale) {

            var data = self.dataset();

            var func = scale === self.x ? self.keyFunction() : self.valueFunction();

            return d3.max(data, func);
        };

        self.bubbleData = function(data) {
            var max = d3.max(data, radiusFunction);

            function rad(d) {
                return d.radius;
            }

            //Minimum of pixels-per-axis-unit
            var xValues = data.map(self.keyFunction());
            var yValues = data.map(self.valueFunction());
            var xBounds = self.x.bounds[1];
            var yBounds = self.y.bounds[0];
            var maxRad = Math.min(xBounds / 10, yBounds / 10);

            // create radius for each item
            data.forEach(function(d) {
                var radiusInput = radiusFunction(d);

                if (radiusInput === 0) {
                    d.radius = 0;
                } else {
                    d.radius = (radiusInput * maxRad) / max;
                }
            });

            //this sort ensures that smaller bubbles are on top of larger ones, so that they are always selectable.  Without changing original array (hence concat which creates a copy)
            data = data.concat()
                .sort(function(a, b) {
                    return d3.descending(rad(a), rad(b));
                });

            return data;
        };

        self.draw = function(chart, drag) {

            self.initializeTooltip(chart.container.node());
            self.selectedItems = chart.selectedItems;

            var duration = drag ? 0 : function(d, i) {
                return 200 + (i * 20);
            };

            function click(filter) {
                return self.click(self, filter);
            }

            var bubbleData = self.bubbleData(self.dataset());

            var bubbles = chart.plotArea.selectAll('circle.' + insight.Constants.Bubble)
                .data(bubbleData, self.keyFunction());

            bubbles.enter()
                .append('circle')
                .attr('class', self.itemClassName)
                .on('mouseover', self.mouseOver)
                .on('mouseout', self.mouseOut)
                .on('click', click);


            function rad(d) {
                return d.radius;
            }

            function opacity() {
                // If we are using selected/notSelected, then make selected more opaque than notSelected
                if (this.classList && this.classList.contains("selected")) {
                    return 0.8;
                }

                if (this.classList && this.classList.contains("notselected")) {
                    return 0.3;
                }

                //If not using selected/notSelected, make everything semi-transparent
                return 0.5;
            }

            bubbles.transition()
                .duration(duration)
                .attr('r', rad)
                .attr('cx', self.rangeX)
                .attr('cy', self.rangeY)
                .attr('opacity', opacity)
                .style('fill', this.color);
        };

        // Public functions -------------------------------------------------------------------------------------------

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

    };

    insight.BubbleSeries.prototype = Object.create(insight.Series.prototype);
    insight.BubbleSeries.prototype.constructor = insight.BubbleSeries;

})(insight);
