(function(insight) {

    /**
     * The ScatterSeries class extends the PointSeries class to display datapoints as small circles.
     * @constructor
     * @extends insight.PointSeries
     * @param {String} name - A uniquely identifying name for this series
     * @param {insight.DataProvider | Object[]} data - An object which contains this series' data
     * @param {insight.Axis} x - The x axis
     * @param {insight.Axis} y - The y axis
     */
    insight.ScatterSeries = function ScatterSeries(name, data, x, y) {

        insight.PointSeries.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this;

        // Internal variables -----------------------------------------------------------------------------------------

        self.cssClassName = d3.functor(insight.constants.Scatter);

        self.classValues = [self.cssClassName()];

        // Internal functions -----------------------------------------------------------------------------------------

        self.pointData = function(data) {
            // create radius for each item
            data.forEach(function(d) {
                d.radius = Math.max(self.radiusFunction()(d), 0);
            });

            return data;
        };

        // Override default opacity to be opaque
        self.pointOpacity(1.0);
    };

    insight.ScatterSeries.prototype = Object.create(insight.PointSeries.prototype);
    insight.ScatterSeries.prototype.constructor = insight.ScatterSeries;

})(insight);
