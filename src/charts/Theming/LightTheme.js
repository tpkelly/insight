(function(insight) {

    /**
     * A Theme for drawing on a lightly coloured background. Sets a number of the properties defined in the Theme base
     * class.
     * @class insight.LightTheme
     */
    insight.LightTheme = function LightTheme() {
        insight.Theme.apply(this);

        //Configure for axis
        this.axisStyle.gridlineWidth = 1;
        this.axisStyle.gridlineColor = '#888';
        this.axisStyle.showGridlines = false;

        this.axisStyle.tickSize = 1;
        this.axisStyle.tickPadding = 10;

        this.axisStyle.axisLineColor = '#777';
        this.axisStyle.tickLabelFont = 'Helvetica Neue 11pt';
        this.axisStyle.tickLabelColor = '#777';
        this.axisStyle.axisLabelFont = 'Helvetica Neue 12pt';
        this.axisStyle.axisLabelColor = '#777';

        //Configure for chart
        this.chartStyle.seriesPalette = ['red', 'green', 'blue'];
        this.chartStyle.fillColor = '#fff';
        this.chartStyle.titleFont = 'Helvetica Neue 16pt';
        this.chartStyle.titleColor = '#000';

        //Configure series
        this.seriesStyle.showPoints = false;
        this.seriesStyle.lineStyle = 'linear';
    };

    insight.LightTheme.prototype = Object.create(insight.Theme.prototype);
    insight.LightTheme.prototype.constructor = insight.LightTheme;

    //Set this as the default theme
    insight.defaultTheme = new insight.LightTheme();

})(insight);
