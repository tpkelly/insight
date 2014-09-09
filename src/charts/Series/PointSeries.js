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
    };

    insight.PointSeries.prototype = Object.create(insight.Series.prototype);
    insight.PointSeries.prototype.constructor = insight.PointSeries;

})(insight);
