//Create a dummy theme object
var dummyTheme = ({axisStyle : {
    gridlineWidth:3.1,
    gridlineColor: '#204',
    showGridlines: true,

    tickSize: 1.4,
    tickPadding: 6.4,

    axisLineColor: '#345',

    tickLabelFont: 'Sans serif 72pt',
    tickLabelColor: '#eac',

    axisLabelFont: 'Sans serif 73pt',
    axisLabelColor: '#abc'
},

chartStyle : {
    seriesPalette: ['#eee', '#aaa', '#a42'],
    fillColor: '#24a',
    titleFont: 'Sans serif 71pt',
    titleColor: '#cab'
},

seriesStyle : {
    showPoints: true,
    lineStyle: 'cardinal'
},

tableStyle : {

}});

describe("Theme", function(){
    var chartGroup;
    var chart;
    var lineSeries, rowSeries, columnSeries, bubbleSeries;

    beforeEach(function() {
        var xAxis = new insight.Axis('x-axis', insight.Scales.Linear);
        var yAxis = new insight.Axis('y-axis', insight.Scales.Linear);

        lineSeries = new insight.LineSeries('line', [1,2,3], xAxis, yAxis);
        rowSeries = new insight.RowSeries('row', [1,2,3], xAxis, yAxis);
        columnSeries = new insight.ColumnSeries('column', [1,2,3], xAxis, yAxis);
        bubbleSeries = new insight.BubbleSeries('bubble', [1,2,3], xAxis, yAxis);

        chart = new insight.Chart('Chart', '#chart');
        chart.xAxis(xAxis);
        chart.yAxis(yAxis);
        chart.series([lineSeries, rowSeries, columnSeries, bubbleSeries]);

        chartGroup = new insight.ChartGroup();
        chartGroup.charts = [chart];
    });

    describe("Axis", function() {
        it("Tick size to be set by theme", function() {
            //When:
            chartGroup.applyTheme(dummyTheme);

            //Then:
            expect(chart.xAxis().tickSize()).toBe(1.4);
            expect(chart.yAxis().tickSize()).toBe(1.4);
        });

        it("Tick padding to be set by theme", function() {
            //When:
            chartGroup.applyTheme(dummyTheme);

            //Then:
            expect(chart.xAxis().tickPadding()).toBe(6.4);
            expect(chart.yAxis().tickPadding()).toBe(6.4);
        });

        it("Line color to be set by theme", function() {
            //When:
            chartGroup.applyTheme(dummyTheme);

            //Then:
            expect(chart.xAxis().color()).toBe('#345');
            expect(chart.yAxis().color()).toBe('#345');
        });

        it("Gridline color to be set by theme", function() {
            //When:
            chartGroup.applyTheme(dummyTheme);

            //Then:
            expect(chart.xAxis().gridlines.lineColor()).toBe('#204');
            expect(chart.yAxis().gridlines.lineColor()).toBe('#204');
        });

        it("Gridline width to be set by theme", function() {
            //When:
            chartGroup.applyTheme(dummyTheme);

            //Then:
            expect(chart.xAxis().gridlines.lineWidth()).toBe(3.1);
            expect(chart.yAxis().gridlines.lineWidth()).toBe(3.1);
        });

        it("Gridline visibility to be set by theme", function() {
            //When:
            chartGroup.applyTheme(dummyTheme);

            //Then:
            expect(chart.xAxis().showGridlines()).toBe(true);
            expect(chart.yAxis().showGridlines()).toBe(true);
        });
    });

    describe("Chart", function() {
        it("Series palette to be set by theme", function() {
            //When:
            chartGroup.applyTheme(dummyTheme);

            //Then:
            var seriesColours = chart.series().map(function(d) {
                return d.color();
            })
            expect(seriesColours).toEqual(['#eee', '#aaa', '#a42', '#eee']);
        });
    });

    describe("Series", function() {
        it("Line style to be set by theme", function() {
            //When:
            chartGroup.applyTheme(dummyTheme);

            //Then:
            expect(lineSeries.lineType()).toBe('cardinal');
        });

        it("Line point visibility to be set by theme", function() {
            //When:
            chartGroup.applyTheme(dummyTheme);

            //Then:
            expect(lineSeries.showPoints()).toBe(true);
        });
    })
});