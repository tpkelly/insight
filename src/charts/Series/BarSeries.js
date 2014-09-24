(function(insight) {

    /*
     * The BarSeries is an abstract base class for columns and rows.
     * @class insight.BarSeries
     * @extends insight.Series
     * @param {String} name - A uniquely identifying name for this series
     * @param {insight.DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.BarSeries = function BarSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this;

        // Internal variables -------------------------------------------------------------------------------------------

        self.classValues = [insight.Constants.BarClass];
    };

    insight.BarSeries.prototype = Object.create(insight.Series.prototype);
    insight.BarSeries.prototype.constructor = insight.BarSeries;
})(insight);
