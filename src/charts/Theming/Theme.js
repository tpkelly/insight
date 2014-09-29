(function(insight) {

    /**
     * The Theme base class provides the basic structure of a theme, to allow the Chart, Series or Axis to extract values
     * from it to style themselves.
     *
     * All values are `undefined`, being properly set in the subclasses of Theme.
     * @constructor
     */
    insight.Theme = function Theme() {

        var self = this;

        /**
         * The styles to apply to an axis.
         * @memberof! insight.Theme
         * @instance
         * @type {Object}
         *
         * @property {Integer}  gridlineWidth   The width of an axis grid line, in pixels.
         * @property {Color}    gridlineColor   The color of an axis grid line.
         * @property {Boolean}  shouldShowGridlines   Whether axis grid lines should be displayed or not.
         *
         * @property {Integer}  tickSize        The length of axis ticks, in pixels.
         * @property {Integer}  tickPadding     The distance between the end of axis tick marks and tick labels, in pixels.
         *
         * @property {Integer}  tickLineWidth   The width of the tick marks, in pixels.
         * @property {Color}  tickLineColor   The color of the tick marks.
         *
         * @property {Integer}  axisLineWidth   The width of the axis line, in pixels.
         * @property {Color}  axisLineColor   The color of an axis line.
         *
         * @property {Font}     tickLabelFont   The font to use for axis tick labels.
         * @property {Color}    tickLabelColor  The color to use for axis tick labels.
         *
         * @property {Font}     axisTitleFont   The font to use for an axis title.
         * @property {Color}    axisTitleColor  The color to use for an axis title.
         */
        self.axisStyle = {

            gridlineWidth: undefined,
            gridlineColor: undefined,
            shouldShowGridlines: undefined,

            tickSize: undefined,
            tickPadding: undefined,

            tickLineWidth: undefined,
            tickLineColor: undefined,

            axisLineWidth: undefined,
            axisLineColor: undefined,

            tickLabelFont: undefined,
            tickLabelColor: undefined,

            axisTitleFont: undefined,
            axisTitleColor: undefined
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
         * @property {Color}        titleColor      The color to use for the chart's title.
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
         * @property {Boolean} shouldShowPoints Whether points should be shown on a series, if applicable to the series.
         * @property {LineStyle} lineStyle The style of line to use for a series, if applicable to the series.
         */
        self.seriesStyle = {
            shouldShowPoints: undefined,
            lineStyle: undefined
        };

        /**
         * The styles to apply to a table
         * @memberof! insight.Theme
         * @instance
         * @type {Object}
         *
         * @property {Font}     headerFont                  The font to use for a table column header.
         * @property {Color}    headerTextColor             The text color to use for a table column header.
         *
         * @property {Font}     rowHeaderFont               The font to use for a table row header.
         * @property {Color}    rowHeaderTextColor          The text color to use for a table row header.
         *
         * @property {Font}     cellFont                    The font to use for a table cell.
         * @property {Color}    cellTextColor               The text color to use for a table cell.
         *
         * @property {Border}   headerDivider               The CSS border style to use for the divider between the table headers and body.
         *
         * @property {Color}    headerBackgroundColor       The background color for the header row on the table.
         * @property {Color}    rowBackgroundColor          The background color for rows on the table.
         * @property {Color}    rowAlternateBackgroundColor The background color for every other row on the table.
         */
        self.tableStyle = {
            headerFont: undefined,
            headerTextColor: undefined,
            rowHeaderFont: undefined,
            rowHeaderTextColor: undefined,
            cellFont: undefined,
            cellTextColor: undefined,
            headerDivider: undefined,
            headerBackgroundColor: undefined,
            rowBackgroundColor: undefined,
            rowAlternateBackgroundColor: undefined
        };
    };

})(insight);
