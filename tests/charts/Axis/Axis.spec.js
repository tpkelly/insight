
var data = [
    {key:'a', value:0, date: new Date(2014,0,1)},
    {key:'b', value:3, date: new Date(2014,0,3)}, 
    {key:'c', value:12, date: new Date(2014,0,2)}, 
    {key:'d', value:20, date: new Date(2014,0,14)}, 
    {key:'e', value:13, date: new Date(2013,4,15)}
];


describe('Axis', function() {

    describe('constructor', function() {
        it('label getter works', function() {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.Scales.Linear);

            //Then:
            var observedLabel = axis.label();
            var expectedLabel = 'Value Axis';
            expect(observedLabel).toBe(expectedLabel);

        });
    });

    describe('tickLabelRotation', function() {

        it('has initial value of 0', function() {

            // Given
            var axis = new insight.Axis('SomeAxis', insight.Scales.Ordinal);

            // When
            var result = axis.tickLabelRotation();

            // Then
            expect(result).toBe(0);

        });

    });

    describe('barPadding', function() {

        it('has initial value of 0.1', function() {
            //Given:
            var axis = new insight.Axis('Value Axis', insight.Scales.Linear);

            //Then:
            expect(axis.barPadding()).toBe(0.1);

        });
    });

    describe('isHorizontal', function() {
        it('returns true for horizontal axis', function() {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.Scales.Linear);
            axis.direction = 'h';

            // When
            var observedResult = axis.isHorizontal();

            //Then:
            expect(observedResult).toBe(true);

        });

        it('returns false for vertical axis', function() {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.Scales.Linear);
            axis.direction = 'v';

            // When
            var observedResult = axis.isHorizontal();

            //Then:
            expect(observedResult).toBe(false);
        });
    });

    describe('shouldDisplay', function() {
        it('returns true by default', function() {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.Scales.Linear);

            //Then:
            var observedResult = axis.shouldDisplay();
            var expectedResult = true;
            expect(observedResult).toBe(expectedResult);
        });

        it('returns false when value set to false', function() {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.Scales.Linear)
                                  .shouldDisplay(false);

            //Then:
            var observedResult = axis.shouldDisplay();
            var expectedResult = false;
            expect(observedResult).toBe(expectedResult);
        });
    });

    describe('isOrdered', function() {
        it('returns false by default', function () {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.Scales.Linear);

            //Then:
            var observedResult = axis.isOrdered();
            var expectedResult = false;
            expect(observedResult).toBe(expectedResult);
        });


        it('returns true when value set to true', function () {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.Scales.Linear)
                .isOrdered(true);

            //Then:
            var observedResult = axis.isOrdered();
            var expectedResult = true;
            expect(observedResult).toBe(expectedResult);
        });
    });

    describe('domain', function() {

        it('calculates min and max of linear domain', function () {

            //Given:
            var dataset = new insight.DataSet(data);

            var x = new insight.Axis('Key Axis', insight.Scales.Ordinal);
            var y = new insight.Axis('Value Axis', insight.Scales.Linear);

            var series = new insight.ColumnSeries('chart', dataset, x, y)
                .valueFunction(function (d) {
                    return d.value;
                });

            //Then:
            var observedResult = y.domain();
            var expectedResult = [0, 20];

            expect(observedResult).toEqual(expectedResult);
        });

        it('calculates values of ordinal domain', function () {

            //Given:
            var dataset = new insight.DataSet(data);

            var x = new insight.Axis('Key Axis', insight.Scales.Ordinal);
            var y = new insight.Axis('Value Axis', insight.Scales.Linear);

            var series = new insight.ColumnSeries('chart', dataset, x, y)
                .valueFunction(function (d) {
                    return d.value;
                });

            //Then:
            var observedResult = x.domain();
            var expectedResult = ['a', 'b', 'c', 'd', 'e'];

            expect(observedResult).toEqual(expectedResult);
        });

        it('calculates min max values of time scale', function () {

            //Given:
            var dataset = new insight.DataSet(data);

            var x = new insight.Axis('Key Axis', insight.Scales.Time);
            var y = new insight.Axis('Value Axis', insight.Scales.Linear);

            var series = new insight.Series('chart', dataset, x, y)
                .keyFunction(function (d) {
                    return d.date;
                });

            //Then:
            var observedResult = x.domain();
            var expectedResult = [new Date(2013, 4, 15), new Date(2014, 0, 14)];

            expect(observedResult).toEqual(expectedResult);
        });
    });

    describe('axisPosition', function() {
        var axis;
        beforeEach(function() {
            axis = new insight.Axis('Key Axis', insight.Scales.Linear);
            axis.bounds = [300, 400];
        });

        it('bottom anchored horizontal axis is positioned correctly', function () {

            // Given
            axis.isHorizontal = d3.functor(true);

            // When
            var axisPosition = axis.axisPosition();
            var expectedResult = 'translate(0,400)';

            // Then
            expect(axisPosition).toEqual(expectedResult);
        });

        it('top anchored horizontal axis is positioned correctly', function () {

            // Given
            axis.hasReversedPosition(true);
            axis.isHorizontal = d3.functor(true);

            // When
            var axisPosition = axis.axisPosition();
            var expectedResult = 'translate(0,0)';

            // Then
            expect(axisPosition).toEqual(expectedResult);
        });

        it('left anchored vertical axis is positioned correctly', function () {

            // Given
            axis.isHorizontal = d3.functor(false);

            // When
            var axisPosition = axis.axisPosition();
            var expectedResult = 'translate(0,0)';

            // Then
            expect(axisPosition).toEqual(expectedResult);
        });

        it('right anchored vertical axis is positioned correctly', function () {

            // Given
            axis.hasReversedPosition(true);
            axis.isHorizontal = d3.functor(false);

            // When
            var axisPosition = axis.axisPosition();
            var expectedResult = 'translate(300,0)';

            // Then
            expect(axisPosition).toEqual(expectedResult);
        });
    });

    describe('tickLabelRotationTransform', function() {
        it('returns no tick rotation by default', function () {

            // Given
            var y = new insight.Axis('Key Axis', insight.Scales.Linear)
                .tickSize(0)
                .tickPadding(0);

            // When
            var observedResult = y.tickLabelRotationTransform();

            // Then
            expect(observedResult).toEqual(' rotate(0,0,6)');

        });

        it('returns 90 degree tick rotation when top to bottom specified', function () {

            //Given:
            var y = new insight.Axis('Key Axis', insight.Scales.Linear)
                .tickLabelOrientation('tb')
                .tickSize(0)
                .tickPadding(0);

            //Then:
            var observedResult = y.tickLabelRotationTransform();
            var expectedResult = ' rotate(90,0,6)';

            expect(observedResult).toEqual(expectedResult);
        });
    });

    describe('shouldShowGridlines', function() {

        var div = document.createElement('div');
        div.id  = 'testChart';

        var createChartElement = function(){

            document.body.appendChild(div);
        };

        var removeChartElement = function(){
            document.body.removeChild(div);
        };


        it('gridlines hidden by default', function () {
            //Given:
            var y = new insight.Axis('Key Axis', insight.Scales.Linear)
                .tickLabelOrientation('tb')
                .tickSize(0);

            //Then:
            var gridlinesVisible = y.shouldShowGridlines();
            expect(gridlinesVisible).toBe(false);
        });

        it('no gridlines when gridlines are hidden', function () {
            //Given:
            createChartElement();
            
            var chart = new insight.Chart('test', '#testChart')
                .width(650)
                .height(350)
                .margin(
                {
                    top: 0,
                    left: 130,
                    right: 40,
                    bottom: 100
                });

            var x = new insight.Axis('ValueAxis', insight.Scales.Linear)
                .tickLabelOrientation('lr');

            var y = new insight.Axis('KeyAxis', insight.Scales.Linear)
                .tickLabelOrientation('lr')
                .shouldShowGridlines(false);

            chart.addXAxis(x);
            chart.addYAxis(y);

            var data = new insight.DataSet([
                {"key": 1, "value": 1},
                {"key": 2, "value": 2},
                {"key": 3, "value": 3}
            ]);
            var lineSeries = new insight.LineSeries('line', data, x, y);
            chart.series([lineSeries]);


            chart.draw();
            
            removeChartElement();

            //Then:
            // One per tickmark, between 0 and 3 by 0.5 steps (inclusive).
            expect(y.gridlines.allGridlines(chart)).toBeCloseTo([]);
        });

        it('multiple gridlines when gridlines are visible', function () {
            //Given:
            createChartElement();

            var chart = new insight.Chart('test', '#testChart')
                .width(650)
                .height(350)
                .margin(
                {
                    top: 0,
                    left: 130,
                    right: 40,
                    bottom: 100
                });

            var x = new insight.Axis('ValueAxis', insight.Scales.Linear)
                .tickLabelOrientation('lr');

            var y = new insight.Axis('KeyAxis', insight.Scales.Linear)
                .tickLabelOrientation('lr')
                .shouldShowGridlines(true);

            chart.addXAxis(x);
            chart.addYAxis(y);

            var data = new insight.DataSet([
                {"key": 1, "value": 1},
                {"key": 2, "value": 2},
                {"key": 3, "value": 3}
            ]);
            var lineSeries = new insight.LineSeries('line', data, x, y);
            chart.series([lineSeries]);

            chart.draw();

            removeChartElement();

            //Then:
            // One per tickmark, between 0 and 3 by 0.5 steps (inclusive).
            expect(y.gridlines.allGridlines(chart)[0].length).toEqual(7);
        });

        it('Gridlines drawn when axis has no label', function() {
            //Given:
            createChartElement();

            var chart = new insight.Chart('test', '#testChart')
                .width(500)
                .height(500);

            var x = new insight.Axis('ValueAxis', insight.Scales.Linear);
            var y = new insight.Axis('', insight.Scales.Linear)
                .shouldShowGridlines(true);

            chart.addXAxis(x);
            chart.addYAxis(y);

            var data = new insight.DataSet([
                {"key": 1, "value": 1},
                {"key": 2, "value": 2},
                {"key": 3, "value": 3}
            ]);
            var lineSeries = new insight.LineSeries('line', data, x, y);
            chart.series([lineSeries]);

            //When:
            expect(chart.draw).not.toThrow();

            removeChartElement();
        });

        it('Gridlines drawn when axis has spaces', function() {
            //Given:
            createChartElement();

            var chart = new insight.Chart('test', '#testChart')
                .width(500)
                .height(500);

            var x = new insight.Axis('ValueAxis', insight.Scales.Linear);
            var y = new insight.Axis('Key Axis', insight.Scales.Linear)
                .shouldShowGridlines(true);

            chart.addXAxis(x);
            chart.addYAxis(y);

            var data = new insight.DataSet([
                {"key": 1, "value": 1},
                {"key": 2, "value": 2},
                {"key": 3, "value": 3}
            ]);
            var lineSeries = new insight.LineSeries('line', data, x, y);
            chart.series([lineSeries]);

            //When:
            expect(chart.draw).not.toThrow();

            removeChartElement();
        });

        it('Gridlines drawn when axis has special characters', function() {
            //Given:
            createChartElement();

            var chart = new insight.Chart('test', '#testChart')
                .width(500)
                .height(500);

            var x = new insight.Axis('ValueAxis', insight.Scales.Linear);
            var y = new insight.Axis('Key$Axis', insight.Scales.Linear)
                .shouldShowGridlines(true);

            chart.addXAxis(x);
            chart.addYAxis(y);

            var data = new insight.DataSet([
                {"key": 1, "value": 1},
                {"key": 2, "value": 2},
                {"key": 3, "value": 3}
            ]);
            var lineSeries = new insight.LineSeries('line', data, x, y);
            chart.series([lineSeries]);

            //When:
            expect(chart.draw).not.toThrow();

            removeChartElement();
        });
    });

    describe('calculateLabelDimensions', function() {
        var axis,
            axisFont = insight.defaultTheme.axisStyle.axisLabelFont,
            axisFontSize = insight.Utils.fontSizeFromFont(axisFont),
            axisLabel = 'Axis Label',
            tickPadding = 5,
            tickLabelFont = insight.defaultTheme.axisStyle.tickLabelFont,
            tickLabelFontSize = insight.Utils.fontSizeFromFont(tickLabelFont),
            tickSize = 10,
            textMeasurer;

        var data = [
            {key: 'Largest', value: 700},
            {key: 'Mid', value: 600},
            {key: 'T', value: 400}
        ];

        beforeEach(function() {
            axis = new insight.Axis('', insight.Scales.Ordinal);
            var secondaryAxis = new insight.Axis('Y Label', insight.Scales.Linear);

            series = new insight.ColumnSeries('testSeries', data, axis, secondaryAxis);

            var canvas = document.createElement('canvas');

            textMeasurer = new insight.TextMeasurer(canvas);
        });

        describe('horizontal axis', function() {

            beforeEach(function() {
                axis.isHorizontal = d3.functor(true);
            });

            it('returns correct value when no title and zero tick size and tick padding', function () {

                // Given
                axis.label('')
                    .tickPadding(0)
                    .tickSize(0);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedResult = textMeasurer.measureText('Largest', tickLabelFont).height;
                expect(result.height).toBe(expectedResult);

            });

            it('returns correct value when no title and non-zero tick size and tick padding', function () {

                // Given
                axis.label('')
                    .tickPadding(tickPadding)
                    .tickSize(tickSize);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelHeight = textMeasurer.measureText('Largest', tickLabelFont).height;

                var expectedResult = expectedTickLabelHeight
                    + tickPadding * 2
                    + tickSize;

                expect(result.height).toBe(expectedResult);

            });

            it('returns correct value when title provided and non-zero tick size and tick padding', function () {

                // Given
                axis.label(axisLabel)
                    .tickPadding(tickPadding)
                    .tickSize(tickSize);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelHeight = textMeasurer.measureText('Largest', tickLabelFont).height;
                var expectedAxisLabelHeight = textMeasurer.measureText(axisLabel, axisFont).height;

                var expectedResult = expectedTickLabelHeight
                    + tickPadding * 2
                    + tickSize
                    + expectedAxisLabelHeight;

                expect(result.height).toBe(expectedResult);

            });

            it('handles tick label rotation', function() {

                // Given
                var tickLabelRotation = 30;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .label(axisLabel)
                    .tickLabelRotation(tickLabelRotation);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelHeight = textMeasurer.measureText('Largest', tickLabelFont, tickLabelRotation).height;
                var expectedAxisLabelHeight = textMeasurer.measureText(axisLabel, axisFont).height;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    expectedTickLabelHeight +
                    expectedAxisLabelHeight;

                expect(result.height).toBe(expectedResult);

            });

            it('handles negative text height', function() {

                // Given
                var tickLabelRotation = 180;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .label(axisLabel)
                    .tickLabelRotation(tickLabelRotation);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedAxisLabelHeight = textMeasurer.measureText(axisLabel, axisFont).height;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    0 +
                    expectedAxisLabelHeight;

                expect(result.height).toBe(expectedResult);

            });

            it('handles formatted tick labels', function() {

                // Given
                var tickLabelRotation = 30;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .label(axisLabel)
                    .tickLabelRotation(tickLabelRotation)
                    .tickLabelFormat(function(tickLabel) {
                        return tickLabel + '!!!';
                    });

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelHeight = textMeasurer.measureText('Largest!!!', tickLabelFont, tickLabelRotation).height;
                var expectedAxisLabelHeight = textMeasurer.measureText(axisLabel, axisFont).height;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    expectedTickLabelHeight +
                    expectedAxisLabelHeight;

                expect(result.height).toBe(expectedResult);

            });

        });

        describe('vertical axis', function() {

            beforeEach(function() {
                axis.isHorizontal = d3.functor(false);
            });

            it('returns correct value when no title and zero tick size and tick padding', function () {

                // Given
                axis.label('')
                    .tickPadding(0)
                    .tickSize(0);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedResult = textMeasurer.measureText('Largest', tickLabelFont).width;
                expect(result.width).toBe(expectedResult);

            });

            it('returns correct value when no title and non-zero tick size and tick padding', function () {

                // Given
                axis.tickPadding(tickPadding).tickSize(tickSize);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedMaxTickLabelWidth = textMeasurer.measureText('Largest', tickLabelFont).width;

                var expectedResult = expectedMaxTickLabelWidth
                    + tickPadding * 2
                    + tickSize;

                expect(result.width).toBe(expectedResult);

            });

            it('returns correct value when title provided and non-zero tick size and tick padding', function () {

                // Given
                axis.label(axisLabel)
                    .tickPadding(tickPadding)
                    .tickSize(tickSize);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedMaxTickLabelWidth = textMeasurer.measureText('Largest', tickLabelFont).width;
                var expectedAxisLabelWidth = textMeasurer.measureText(axisLabel, axisFont).width;

                var expectedResult = expectedMaxTickLabelWidth
                    + tickPadding * 2
                    + tickSize
                    + expectedAxisLabelWidth;

                expect(result.width).toBe(expectedResult);

            });

            it('handles tick label rotation', function() {

                // Given
                var tickLabelRotation = 30;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .label(axisLabel)
                    .tickLabelRotation(tickLabelRotation);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedMaxTickLabelWidth = textMeasurer.measureText('Largest', tickLabelFont, tickLabelRotation).width;
                var expectedAxisLabelWidth = textMeasurer.measureText(axisLabel, axisFont).width;

                var expectedResult = expectedMaxTickLabelWidth
                    + tickPadding * 2
                    + tickSize
                    + expectedAxisLabelWidth;

                expect(result.width).toBe(expectedResult);

            });

            it('handles negative text width', function() {

                // Given
                var tickLabelRotation = 180;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .label(axisLabel)
                    .tickLabelRotation(tickLabelRotation);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedAxisLabelWidth = textMeasurer.measureText(axisLabel, axisFont).width;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    0 +
                    expectedAxisLabelWidth;

                expect(result.width).toBe(expectedResult);

            });


            it('handles formatted tick labels', function() {

                // Given
                var tickLabelRotation = 30;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .label(axisLabel)
                    .tickLabelRotation(tickLabelRotation)
                    .tickLabelFormat(function(tickValue) {
                        return '_' + tickValue + '_';
                    });

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedMaxTickLabelWidth = textMeasurer.measureText('_Largest_', tickLabelFont, tickLabelRotation).width;
                var expectedAxisLabelWidth = textMeasurer.measureText(axisLabel, axisFont).width;

                var expectedResult = expectedMaxTickLabelWidth
                    + tickPadding * 2
                    + tickSize
                    + expectedAxisLabelWidth;

                expect(result.width).toBe(expectedResult);

            });

        });

    });

    describe('calculateLabelOverhang', function() {

        var axis,
            tickLabelFont = insight.defaultTheme.axisStyle.tickLabelFont,
            textMeasurer;

        beforeEach(function() {
            var canvas = document.createElement('canvas');
            textMeasurer = new insight.TextMeasurer(canvas);
        });

        describe('with ordinal scale', function() {

            var data = [
                {key: 'First', value: 1},
                {key: 'Middle', value: 3},
                {key: 'Last', value: 2}
            ];

            beforeEach(function() {
                axis = new insight.Axis('', insight.Scales.Ordinal)
                    .tickLabelFormat(function(tickValue) {
                        return tickValue + '!!!';
                    });

                var secondaryAxis = new insight.Axis('Y Label', insight.Scales.Linear);
                series = new insight.ColumnSeries('testSeries', data, axis, secondaryAxis);
            });

            describe('on horizontal axis', function() {

                beforeEach(function() {
                    axis.isHorizontal = d3.functor(true);
                });

                describe('with no tickLabelRotation', function() {

                    beforeEach(function() {
                        axis.tickLabelRotation(0);
                    });

                    it('and textAnchor start - has right overhang only, using width of last formatted tick value', function() {

                        // Given
                        axis.textAnchor('start');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedRight = textMeasurer.measureText('Last!!!', tickLabelFont).width;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: expectedRight,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor middle - has left and right overhang, using half the width of first and last formatted tick values', function() {

                        // Given
                        axis.textAnchor('middle');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedLeft = textMeasurer.measureText('First!!!', tickLabelFont).width / 2;
                        var expectedRight = textMeasurer.measureText('Last!!!', tickLabelFont).width / 2;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: Math.ceil(expectedRight),
                            left: Math.ceil(expectedLeft)
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor end - has left overhang only, using width of first formatted tick value', function() {

                        // Given
                        axis.textAnchor('end');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedLeft = textMeasurer.measureText('First!!!', tickLabelFont).width;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: expectedLeft
                        };

                        expect(result).toEqual(expectedResult);

                    });

                });

                describe('with 90 degree tickLabelRotation', function() {

                    beforeEach(function() {
                        axis.tickLabelRotation(90);
                    });

                    it('and textAnchor start - has no left or right overhang', function() {

                        // Given
                        axis.textAnchor('start');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor middle - has no left or right overhang', function() {

                        // Given
                        axis.textAnchor('middle');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor end - has no left or right overhang', function() {

                        // Given
                        axis.textAnchor('end');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                });

                describe('with 180 degree tickLabelRotation', function() {

                    var rotation = 180;

                    beforeEach(function() {
                        axis.tickLabelRotation(rotation);
                    });

                    it('and textAnchor start - has left overhang only, using width of first formatted tick value', function() {

                        // Given
                        axis.textAnchor('start');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedLeft = textMeasurer.measureText('First!!!', tickLabelFont, rotation).width;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: Math.abs(expectedLeft)
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor middle - has left and right overhang, using half the width of first and last formatted tick values', function() {

                        // Given
                        axis.textAnchor('middle');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedLeft = textMeasurer.measureText('First!!!', tickLabelFont, rotation).width / 2;
                        var expectedRight = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).width / 2;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: Math.ceil(Math.abs(expectedRight)),
                            left: Math.ceil(Math.abs(expectedLeft))
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor end - has right overhang only, using width of last formatted tick value', function() {

                        // Given
                        axis.textAnchor('end');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedRight = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).width;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: Math.abs(expectedRight),
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                });

                describe('with 30 degree tickLabelRotation', function() {

                    var rotation = 30;

                    beforeEach(function() {
                        axis.tickLabelRotation(rotation);
                    });

                    it('and textAnchor start - has right overhang only, using width of last formatted tick value', function() {

                        // Given
                        axis.textAnchor('start');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedRight = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).width;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: expectedRight,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor middle - has left and right overhang, using half the width of first and last formatted tick values', function() {

                        // Given
                        axis.textAnchor('middle');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedLeft = textMeasurer.measureText('First!!!', tickLabelFont, rotation).width / 2;
                        var expectedRight = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).width / 2;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: Math.ceil(expectedRight),
                            left: Math.ceil(expectedLeft)
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor end - has left overhang only, using width of first formatted tick value', function() {

                        // Given
                        axis.textAnchor('end');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedLeft = textMeasurer.measureText('First!!!', tickLabelFont, rotation).width;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: expectedLeft
                        };

                        expect(result).toEqual(expectedResult);

                    });

                });

                describe('with 170 degree tickLabelRotation', function() {

                    var rotation = 170;

                    beforeEach(function() {
                        axis.tickLabelRotation(rotation);
                    });

                    it('and textAnchor start - has left overhang only, using width of first formatted tick value', function() {

                        // Given
                        axis.textAnchor('start');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedLeft = textMeasurer.measureText('First!!!', tickLabelFont, rotation).width;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: Math.abs(expectedLeft)
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor middle - has left and right overhang, using half the width of first and last formatted tick values', function() {

                        // Given
                        axis.textAnchor('middle');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedLeft = textMeasurer.measureText('First!!!', tickLabelFont, rotation).width / 2;
                        var expectedRight = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).width / 2;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: Math.ceil(Math.abs(expectedRight)),
                            left: Math.ceil(Math.abs(expectedLeft))
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor end - has right overhang only, using width of last formatted tick value', function() {

                        // Given
                        axis.textAnchor('end');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedRight = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).width;

                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: Math.abs(expectedRight),
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                });

            });

            describe('on vertical axis', function() {

                beforeEach(function() {
                    axis.isHorizontal = d3.functor(false);
                });

                describe('with no tickLabelRotation', function() {

                    beforeEach(function() {
                        axis.tickLabelRotation(0);
                    });

                    it('and textAnchor start - has no top or bottom overhang', function() {

                        // Given
                        axis.textAnchor('start');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor middle - has no top or bottom overhang', function() {

                        // Given
                        axis.textAnchor('middle');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('with textAnchor end - has no top or bottom overhang', function() {

                        // Given
                        axis.textAnchor('end');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                });

                describe('with 90 degree tickLabelRotation', function() {

                    var rotation = 90;

                    beforeEach(function() {
                        axis.tickLabelRotation(rotation);
                    });

                    it('with textAnchor start - has bottom overhang only, using height of first formatted tick value', function() {

                        // Given
                        axis.textAnchor('start');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedBottom = textMeasurer.measureText('First!!!', tickLabelFont, rotation).height;

                        var expectedResult = {
                            top: 0,
                            bottom: expectedBottom,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('with textAnchor middle - has top and bottom overhang, using half the height of first and last formatted tick values', function() {

                        // Given
                        axis.textAnchor('middle');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedBottom = textMeasurer.measureText('First!!!', tickLabelFont, rotation).height / 2;
                        var expectedTop = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).height / 2;

                        var expectedResult = {
                            top: expectedTop,
                            bottom: expectedBottom,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('with textAnchor end - has top overhang only, using height of last formatted tick value', function() {

                        // Given
                        axis.textAnchor('end');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedTop = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).height;

                        var expectedResult = {
                            top: expectedTop,
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                });

                describe('with 180 degree tickLabelRotation', function() {

                    var rotation = 180;

                    beforeEach(function() {
                        axis.tickLabelRotation(rotation);
                    });

                    it('and textAnchor start - has no top or bottom overhang', function() {

                        // Given
                        axis.textAnchor('start');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor middle - has no top or bottom overhang', function() {

                        // Given
                        axis.textAnchor('middle');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('with textAnchor end - has no top or bottom overhang', function() {

                        // Given
                        axis.textAnchor('end');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedResult = {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                });

                describe('with 30 degree tickLabelRotation', function() {

                    var rotation = 30;

                    beforeEach(function() {
                        axis.tickLabelRotation(rotation);
                    });

                    it('and textAnchor start - has bottom overhang only, using height of first formatted tick value', function() {

                        // Given
                        axis.textAnchor('start');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedBottom = textMeasurer.measureText('First!!!', tickLabelFont, rotation).height;

                        var expectedResult = {
                            top: 0,
                            bottom: expectedBottom,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor middle - has top and bottom overhang, using half the height of first and last formatted tick values', function() {

                        // Given
                        axis.textAnchor('middle');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedBottom = textMeasurer.measureText('First!!!', tickLabelFont, rotation).height / 2;
                        var expectedTop = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).height / 2;

                        var expectedResult = {
                            top: Math.ceil(expectedTop),
                            bottom: Math.ceil(expectedBottom),
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor end - has top overhang only, using height of last formatted tick value', function() {

                        // Given
                        axis.textAnchor('end');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedTop = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).height;

                        var expectedResult = {
                            top: expectedTop,
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                });

                describe('with 170 degree tickLabelRotation', function() {

                    var rotation = 170;

                    beforeEach(function() {
                        axis.tickLabelRotation(rotation);
                    });

                    it('and textAnchor start - has bottom overhang only, using height of first formatted tick value', function() {

                        // Given
                        axis.textAnchor('start');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedBottom = textMeasurer.measureText('First!!!', tickLabelFont, rotation).height;

                        var expectedResult = {
                            top: 0,
                            bottom: Math.abs(expectedBottom),
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor middle - has top and bottom overhang, using half the height of first and last formatted tick values', function() {

                        // Given
                        axis.textAnchor('middle');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedBottom = textMeasurer.measureText('First!!!', tickLabelFont, rotation).height / 2;
                        var expectedTop = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).height / 2;

                        var expectedResult = {
                            top: Math.ceil(Math.abs(expectedTop)),
                            bottom: Math.ceil(Math.abs(expectedBottom)),
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                    it('and textAnchor end - has top overhang only, using height of last formatted tick value', function() {

                        // Given
                        axis.textAnchor('end');

                        // When
                        var result = axis.calculateLabelOverhang();

                        // Then
                        var expectedTop = textMeasurer.measureText('Last!!!', tickLabelFont, rotation).height;

                        var expectedResult = {
                            top: Math.abs(expectedTop),
                            bottom: 0,
                            right: 0,
                            left: 0
                        };

                        expect(result).toEqual(expectedResult);

                    });

                });

            });

        });

    });

});
