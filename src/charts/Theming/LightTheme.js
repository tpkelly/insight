(function(insight) {

    /**
     * A Theme for drawing on a lightly coloured background. Sets a number of the properties defined in the Theme base
     * class.
     * @class insight.LightTheme
     */
    insight.LightTheme = function LightTheme() {

        var self = this;

        insight.Theme.apply(self);

        //Configure for axis
        self.axisStyle.gridlineWidth = 1;
        self.axisStyle.gridlineColor = '#888';
        self.axisStyle.showGridlines = false;

        self.axisStyle.tickSize = 3;
        self.axisStyle.tickPadding = 10;

        self.axisStyle.axisLineWidth = 1;
        self.axisStyle.axisLineColor = '#777';
        self.axisStyle.tickLabelFont = '11pt Helvetica Neue';
        self.axisStyle.tickLabelColor = '#777';
        self.axisStyle.axisLabelFont = '12pt Helvetica Neue';
        self.axisStyle.axisLabelColor = '#777';

        //Configure for chart
        self.chartStyle.seriesPalette = ['#3182bd', '#c6dbed', '#6baed6', '#08519c', '#9ecae1'];
        self.chartStyle.fillColor = '#fff';
        self.chartStyle.titleFont = 'bold 12pt Helvetica Neue';
        self.chartStyle.titleColor = '#000';

        //Configure series
        self.seriesStyle.showPoints = false;
        self.seriesStyle.lineStyle = 'linear';
    };

    insight.LightTheme.prototype = Object.create(insight.Theme.prototype);
    insight.LightTheme.prototype.constructor = insight.LightTheme;

    //Set LightTheme as the default theme
    insight.defaultTheme = new insight.LightTheme();

})(insight);
