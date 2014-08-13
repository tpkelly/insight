(function(insight) {

    insight.Theme = function Theme() {
        //Do nothing, just be a base class
    };

    this.axisStyle = {
        gridlineWidth: undefined,
        gridlineColor: undefined,
        showGridlines: undefined,

        tickSize: undefined,
        tickPadding: undefined,

        axisLineColor: undefined,

        tickLabelFont: undefined,
        tickLabelColor: undefined,

        axisLabelFont: undefined,
        axisLabelColor: undefined
    };

    this.chartStyle = {
        seriesPalette: undefined,
        fillColor: undefined,
        titleFont: undefined,
        titleColor: undefined
    };

    this.seriesStyle = {
        showPoints: undefined,
        lineStyle: undefined
    };

    this.tableStyle = {

    };
})(insight);