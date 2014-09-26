(function(insight) {

    /**
     * The ColumnSeries class extends the [BarSeries]{@link insight.BarSeries} class and draws vertical bars on a [Chart]{@link insight.Chart}
     * @constructor
     * @extends insight.BarSeries
     * @param {String} name - A uniquely identifying name for this series
     * @param {insight.DataSet | Array | insight.Grouping} data - The DataSet containing this series' data
     * @param {insight.Axis} x - The x axis
     * @param {insight.Axis} y - The y axis
     */
    insight.ColumnSeries = function ColumnSeries(name, data, x, y) {

        insight.BarSeries.call(this, name, data, x, y);

        // Private variables -----------------------------------------------------------------------------------------

        var self = this;

        // Internal variables ------------------------------------------------------------------------------------------

        self.valueAxis = y;
        self.keyAxis = x;
        self.classValues = [insight.Constants.ColClass];

        // Internal functions ----------------------------------------------------------------------------------------

        self.isHorizontal = d3.functor(false);

        self.orderFunction = function(a, b) {
            // Sort descending for categorical data
            return self.valueFunction()(b) - self.valueFunction()(a);
        };

        self.barLength = function(d, plotHeight) {
            return plotHeight - self.valuePosition(d);
        };

        self.valuePosition = function(d) {
            var barValue = self.valueFunction()(d);
            return self.valueAxis.scale(barValue);
        };

    };

    insight.ColumnSeries.prototype = Object.create(insight.BarSeries.prototype);
    insight.ColumnSeries.prototype.constructor = insight.ColumnSeries;

})(insight);
