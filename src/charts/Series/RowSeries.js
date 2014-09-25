(function(insight) {

    /**
     * The RowSeries class extends the BarSeries class and draws horizontal bars on a Chart
     * @class insight.RowSeries
     * @extends insight.BarSeries
     * @param {String} name - A uniquely identifying name for this series
     * @param {insight.DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.RowSeries = function RowSeries(name, data, x, y) {

        insight.BarSeries.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            barThicknessFunction = self.y.scale.rangeBand;

        // Internal variables -------------------------------------------------------------------------------------------

        self.valueAxis = x;
        self.keyAxis = y;
        self.classValues = [insight.Constants.RowClass];

        // Internal functions -----------------------------------------------------------------------------------------

        self.isHorizontal = function() {
            return true;
        };

        self.barLength = function(d, plotHeight) {
            var barValue = self.valueFunction()(d);
            return self.valueAxis.scale(barValue);
        };

        self.valuePosition = function(d) {
            return 0;
        };
    };

    insight.RowSeries.prototype = Object.create(insight.BarSeries.prototype);
    insight.RowSeries.prototype.constructor = insight.RowSeries;

})(insight);
