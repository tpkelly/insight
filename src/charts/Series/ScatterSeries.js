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

        var self = this;

        // Internal variables -----------------------------------------------------------------------------------------

        self.cssClassName = d3.functor(insight.Constants.Scatter);

        self.classValues = [self.cssClassName()];

        // Internal functions -----------------------------------------------------------------------------------------

        self.pointData = function(data) {
            // create radius for each item
            data.forEach(function(d) {
                d.radius = Math.max(self.radiusFunction()(d), 0);
            });

            return data;
        };

    };

    insight.ScatterSeries.prototype = Object.create(insight.PointSeries.prototype);
    insight.ScatterSeries.prototype.constructor = insight.ScatterSeries;

})(insight);
