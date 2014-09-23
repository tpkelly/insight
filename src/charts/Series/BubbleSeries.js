(function(insight) {

    /**
     * The BubbleSeries class extends the PointSeries class to display datapoints as differently sized circles,
     * where radius represents a measured value.
     * @class insight.BubbleSeries
     * @extends insight.PointSeries
     * @param {String} name - A uniquely identifying name for this series
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.BubbleSeries = function BubbleSeries(name, data, x, y) {

        insight.PointSeries.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this;

        // Internal variables -----------------------------------------------------------------------------------------

        self.cssClassName = d3.functor(insight.Constants.Bubble);

        self.classValues = [self.cssClassName()];

        // Internal functions -----------------------------------------------------------------------------------------

        self.pointData = function(data) {
            var max = d3.max(data, self.radiusFunction());

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

            function rad(d) {
                return d.radius;
            }

            //this sort ensures that smaller bubbles are on top of larger ones, so that they are always selectable.  Without changing original array (hence concat which creates a copy)
            data = data.concat()
                .sort(function(a, b) {
                    return d3.descending(rad(a), rad(b));
                });

            return data;
        };
    };

    insight.BubbleSeries.prototype = Object.create(insight.PointSeries.prototype);
    insight.BubbleSeries.prototype.constructor = insight.BubbleSeries;

})(insight);
