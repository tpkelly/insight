(function(insight) {

    /**
     * The BubbleSeries class extends the PointSeries class to display datapoints as differently sized circles,
     * where radius represents a measured value.
     * @class insight.BubbleSeries
     * @param {string} name - A uniquely identifying name for this series
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.BubbleSeries = function BubbleSeries(name, data, x, y) {

        insight.PointSeries.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            selector = self.name + insight.Constants.Bubble;

        // Internal variables -------------------------------------------------------------------------------------------

        self.classValues = [insight.Constants.Bubble];

        // Internal functions -----------------------------------------------------------------------------------------

        self.bubbleData = function(data) {
            var max = d3.max(data, self.radiusFunction());

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
                var radiusInput = self.radiusFunction()(d);

                if (radiusInput <= 0) {
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

        self.draw = function(chart, isDragging) {

            self.initializeTooltip(chart.container.node());
            self.selectedItems = chart.selectedItems;

            var duration = isDragging ? 0 : function(d, i) {
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
                .attr('opacity', self.opacity)
                .style('fill', this.color);
        };

    };

    insight.BubbleSeries.prototype = Object.create(insight.PointSeries.prototype);
    insight.BubbleSeries.prototype.constructor = insight.BubbleSeries;

})(insight);
