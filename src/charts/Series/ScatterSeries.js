(function(insight) {

    /**
     * The ScatterSeries class extends the PointSeries class to display datapoints as small circles.
     * @class insight.ScatterSeries
     * @param {string} name - A uniquely identifying name for this series
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.ScatterSeries = function ScatterSeries(name, data, x, y) {

        insight.PointSeries.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            selector = self.name + insight.Constants.Scatter;

        // Private functions ------------------------------------------------------------------------------------------

        function className(d) {

            return selector + " " + insight.Constants.Scatter + " " + self.dimensionName;
        }

        // Internal functions -----------------------------------------------------------------------------------------

        self.scatterData = function(data) {
            var max = d3.max(data, self.radiusFunction());

            //Minimum of pixels-per-axis-unit
            var xValues = data.map(self.keyFunction());
            var yValues = data.map(self.valueFunction());
            var xBounds = self.x.bounds[1];
            var yBounds = self.y.bounds[0];

            // create radius for each item
            data.forEach(function(d) {
                d.radius = Math.max(self.radiusFunction()(d), 0);
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
                .attr('r', self.radiusFunction())
                .attr('cx', self.rangeX)
                .attr('cy', self.rangeY)
                .attr('opacity', self.pointOpacity())
                .style('fill', self.color);
        };

    };

    insight.ScatterSeries.prototype = Object.create(insight.PointSeries.prototype);
    insight.ScatterSeries.prototype.constructor = insight.ScatterSeries;

})(insight);
