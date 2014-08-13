(function(insight) {

    insight.LightTheme = function LightTheme() {
        insight.Theme.call(this);

        //Configure for axis
        self.axisStyle.gridlineWidth = 1;
        self.axisStyle.gridlineColor = '#888';
        self.axisStyle.showGridlines = false;

        self.axisStyle.tickSize = 1;
        self.axisStyle.tickPadding = 10;

        self.axisStyle.axisLineColor = '#777';
        self.axisStyle.tickLabelFont = 'Helvetica Neue 11pt';
        self.axisStyle.tickLabelColor = '#777';
        self.axisStyle.axisLabelFont = 'Helvetica Neue 12pt';
        self.axisStyle.axisLabelColor = '#777';

        //Configure for chart
        self.chartStyle.seriesPalette = ['red', 'green', 'blue'];
        self.chartStyle.fillColor = '#fff';
        self.chartStyle.titleFont = 'Helvetica Neue 16pt';
        self.chartStyle.titleColor = '#000';

        //Configure series
        self.seriesStyle.showPoints = false;
        self.seriesStyle.lineStyle = 'linear';
    };

    insight.LightTheme.prototype = Object.create(insight.Theme.prototype);
    insight.LightTheme.prototype.constructor = insight.LightTheme;

})(insight);