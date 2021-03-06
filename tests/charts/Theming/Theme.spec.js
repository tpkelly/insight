describe("Theme", function(){

    var dummyTheme;
    var chartGroup;
    var chart;
    var lineSeries, rowSeries, columnSeries, bubbleSeries;

    beforeEach(function() {
        //Create a new theme to be applied
        dummyTheme = {

            axisStyle: {
                gridlineWidth:3.1,
                gridlineColor: '#204',
                showGridlines: true,

                tickSize: 1.4,
                tickPadding: 6.4,

                axisLineColor: '#345',
                axisLineWidth: 12.5,

                tickLabelFont: 'Sans serif 72pt',
                tickLabelColor: '#eac',

                axisLabelFont: 'Sans serif 73pt',
                axisLabelColor: '#abc'
            },

            chartStyle: {
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

            }
        };

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

        // we don't care about resizing the chart for theme tests and there are browser specific
        // differences so a spy will prevent the chart from being resized and thus prevent the side effects
        spyOn(chart, 'resizeChart');
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
            expect(chart.xAxis().lineColor()()).toBe('#345');
            expect(chart.yAxis().lineColor()()).toBe('#345');
        });

        it("Line width to be set by theme", function() {
            //When:
            chartGroup.applyTheme(dummyTheme);

            //Then:
            expect(chart.xAxis().lineWidth()).toBe(12.5);
            expect(chart.yAxis().lineWidth()).toBe(12.5);
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
            expect(chart.xAxis().shouldShowGridlines()).toBe(true);
            expect(chart.yAxis().shouldShowGridlines()).toBe(true);
        });
    });

    describe("Chart", function() {
        it("Series palette to be set by theme", function() {
            //When:
            chartGroup.applyTheme(dummyTheme);
            chartGroup.draw();

            //Then:
            var seriesColours = chart.series().map(function(d) {
                return d.color();
            });
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
            expect(lineSeries.shouldShowPoints()).toBe(true);
        });
    });

    describe("Initial theme", function() {
        var method;
        var spy;
        var prototype;

        beforeEach(function() {
            spy = jasmine.createSpy('applyTheme');
        });

        afterEach(function() {
            prototype.applyTheme = method;
        });

        it ("to be set on initialising ChartGroup", function() {
            //Given:
            prototype = insight.ChartGroup.prototype;
            method = prototype.applyTheme;
            prototype.applyTheme = spy;

            //When:
            var chartgroup = new insight.ChartGroup();

            //Then:
            expect(spy).toHaveBeenCalled();
        });

        it ("to be set on initialising Chart", function() {
            //Given:
            prototype = insight.Chart.prototype;
            method = prototype.applyTheme;
            prototype.applyTheme = spy;

            //When:
            var chart = new insight.Chart();

            //Then:
            expect(spy).toHaveBeenCalled();
        });

        it ("to be set on initialising Series", function() {
            //Given:
            prototype = insight.LineSeries.prototype;
            method = prototype.applyTheme;
            prototype.applyTheme = spy;

            var xAxis = new insight.Axis('Axis', insight.Scales.Linear);
            var yAxis = new insight.Axis('Axis', insight.Scales.Linear);

            //When:
            var series = new insight.LineSeries('Series', [], xAxis, yAxis);

            //Then:
            expect(spy).toHaveBeenCalled();
        });

        it ("to be set on initialising Axis", function() {
            //Given:
            prototype = insight.Axis.prototype;
            method = prototype.applyTheme;
            prototype.applyTheme = spy;

            //When:
            var axis = new insight.Axis('Axis', insight.Scales.Linear);

            //Then:
            expect(spy).toHaveBeenCalled();
        });

        it ("to be set on initialising Gridlines", function() {
            //Given:
            prototype = insight.AxisGridlines.prototype;
            method = prototype.applyTheme;
            prototype.applyTheme = spy;

            //When:
            var axis = new insight.AxisGridlines();

            //Then:
            expect(spy).toHaveBeenCalled();
        });


        it ("to be set on initialising Table", function() {
            //Given:
            prototype = insight.Table.prototype;
            method = prototype.applyTheme;
            prototype.applyTheme = spy;

            //When:
            var table = new insight.Table();

            //Then:
            expect(spy).toHaveBeenCalled();
        });
    });

    it("Chart handles empty colour palette", function() {
        //Given:
        dummyTheme.chartStyle.seriesPalette = [];

        //When:
        chart.applyTheme(dummyTheme);

        //Then:
        var seriesColours = chart.series().map(function(d) {
            return d.color();
        });
        //Expect default series colour palette
        expect(seriesColours).toEqual(['lightblue', 'lightblue', 'lightblue', 'lightblue']);
    })
});
