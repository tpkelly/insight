(function(insight) {

    /**
     * The Theme base class provides the basic structure of a theme, to allow the Chart, Series or Axis to extract values
     * from it to style themselves.
     *
     * All values are `undefined`, being properly set in the subclasses of Theme.
     * @class insight.Theme
     */
    insight.Theme = function Theme() {

        var self = this;

        /**
         * The styles to apply to an axis.
         * @memberof! insight.Theme
         * @instance
         * @type {Object}
         *
         * @property {Integer}  gridlineWidth       The width of an axis grid line, in pixels.
         * @property {Color}    gridlineColor       The color of an axis grid line.
         * @property {Boolean}  showGridlines Whether axis grid lines should be displayed or not.
         *
         * @property {Integer}  tickSize        The length of axis ticks, in pixels.
         * @property {Integer}  tickPadding     The distance between the end of axis tick marks and tick labels, in pixels.
         *
         * @property {Integer}  axisLineWidth   The width of the axis line, in pixels.
         * @property {Integer}  axisLineColor   The color of an axis line.
         *
         * @property {Font}     tickLabelFont     The font to use for axis tick labels.
         * @property {Color}    tickLabelColor  The color to use for axis tick labels.

         * @property {Font}     tickLabelFont     The font to use for axis label.
         * @property {Color}    tickLabelColor  The color to use for axis label.
         */
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

        /**
         * The styles to apply to a chart.
         * @memberof! insight.Theme
         * @instance
         * @type {Object}
         *
         * @property {Array<Color>} seriesPalette   The ordered array of colors to use for each successive series within a chart.
         * @property {Color}        fillColor       The color to use for the chart's background.
         * @property {Font}         titleFont       The font to use for the chart's title.
         * @property {Color }       titleColor      The color to use for the chart's title.
         */
        self.chartStyle = {
            seriesPalette: undefined,
            fillColor: undefined,
            titleFont: undefined,
            titleColor: undefined
        };

        /**
         * The styles to apply to a series
         * @memberof! insight.Theme
         * @instance
         * @type {Object}
         *
         * @property {Boolean}      showPoints  Whether points should be shown on a series, if applicable to the series.
         * @property {LineStyle}    lineStyle   The style of line to use for a series, if applicable to the series.
         */
        self.seriesStyle = {
            showPoints: undefined,
            lineStyle: undefined
        };

        /**
         * The styles to apply to a table
         * @memberof! insight.Theme
         * @instance
         * @type {Object}
         */
        self.tableStyle = {

        };
    };

})(insight);
