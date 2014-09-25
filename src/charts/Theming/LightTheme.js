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
        self.axisStyle.shouldShowGridlines = false;

        self.axisStyle.tickSize = 3;
        self.axisStyle.tickPadding = 10;

        self.axisStyle.axisLineWidth = 1;
        self.axisStyle.axisLineColor = '#777';
        self.axisStyle.tickLineWidth = 1;
        self.axisStyle.tickLineColor = '#777';
        self.axisStyle.tickLabelFont = '11pt Helvetica Neue';
        self.axisStyle.tickLabelColor = '#777';
        self.axisStyle.axisTitleFont = '12pt Helvetica Neue';
        self.axisStyle.axisTitleColor = '#777';

        //Configure for chart
        self.chartStyle.seriesPalette = ['#3182bd', '#c6dbed', '#6baed6', '#08519c', '#9ecae1'];
        self.chartStyle.fillColor = '#fff';
        self.chartStyle.titleFont = 'bold 12pt Helvetica Neue';
        self.chartStyle.titleColor = '#000';

        //Configure series
        self.seriesStyle.shouldShowPoints = false;
        self.seriesStyle.lineStyle = 'linear';

        //Configure table
        self.tableStyle.headerFont = 'bold 14pt Helvetica Neue';
        self.tableStyle.headerTextColor = '#084594';
        self.tableStyle.rowHeaderFont = 'bold 12pt Helvetica Neue';
        self.tableStyle.rowHeaderTextColor = '#2171b5';
        self.tableStyle.cellFont = '12pt Helvetica Neue';
        self.tableStyle.cellTextColor = '#888';

        self.tableStyle.headerDivider = '1px solid #084594';
    };

    insight.LightTheme.prototype = Object.create(insight.Theme.prototype);
    insight.LightTheme.prototype.constructor = insight.LightTheme;

    //Set LightTheme as the default theme
    insight.defaultTheme = new insight.LightTheme();

})(insight);
