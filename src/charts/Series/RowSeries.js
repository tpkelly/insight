(function(insight) {

    /**
     * The RowSeries class extends the [BarSeries]{@link insight.BarSeries} class and draws horizontal bars on a [Chart]{@link insight.Chart}
     * @constructor
     * @extends insight.BarSeries
     * @param {String} name - A uniquely identifying name for this series
     * @param {insight.DataSet | Array | insight.Grouping} data - The DataSet containing this series' data
     * @param {insight.Axis} x - The x axis
     * @param {insight.Axis} y - The y axis
     */
    insight.RowSeries = function RowSeries(name, data, x, y) {

        insight.BarSeries.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this;

        // Internal variables -------------------------------------------------------------------------------------------

        self.valueAxis = x;
        self.keyAxis = y;
        self.classValues = [insight.constants.RowClass];

        // Internal functions -----------------------------------------------------------------------------------------

        self.isHorizontal = d3.functor(true);

        self.barLength = function(d, plotHeight) {
            var barValue = self.valueFunction()(d);
            return self.valueAxis.scale(barValue);
        };

        self.valuePosition = d3.functor(0);
    };

    insight.RowSeries.prototype = Object.create(insight.BarSeries.prototype);
    insight.RowSeries.prototype.constructor = insight.RowSeries;

})(insight);
