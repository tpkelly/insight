(function(insight) {

    /**
     * The Theme base class provides the basic structure of a theme, to allow the Chart, Series or Axis to extract values
     * from it to style themselves.
     *
     * All values are `undefined`, being properly set in the subclasses of Theme.
     * @class insight.Theme
     */
    insight.Theme = function Theme() {

        //Do nothing, just be a base class

        var self = this;

        self.axisStyle = {
            gridlineWidth: undefined,
            gridlineColor: undefined,
            showGridlines: undefined,

            tickSize: undefined,
            tickPadding: undefined,

            axisLineWidth: undefined,
            axisLineColor: undefined,

            tickLabelFont: undefined,
            tickLabelColor: undefined,

            axisLabelFont: undefined,
            axisLabelColor: undefined
        };

        self.chartStyle = {
            seriesPalette: undefined,
            fillColor: undefined,
            titleFont: undefined,
            titleColor: undefined
        };

        self.seriesStyle = {
            showPoints: undefined,
            lineStyle: undefined
        };

        self.tableStyle = {

        };
    };

})(insight);
