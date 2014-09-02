
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

    });

    describe('calculateLabelDimensions', function() {
        var axis,
            axisFont = insight.defaultTheme.axisStyle.axisLabelFont,
            axisFontSize = insight.Utils.fontSizeFromFont(axisFont),
            axisLabel = 'Axis Label',
            tickPadding = 5,
            tickLabelFont = insight.defaultTheme.axisStyle.tickLabelFont,
            tickLabelFontSize = insight.Utils.fontSizeFromFont(tickLabelFont),
            tickSize = 10;

        var fakeMeasurer = {
            measureText: function(text, font, angleDegrees) {

                if (!text) {
                    return { width: 0, height: 0 };
                }

                if (!angleDegrees) {
                    angleDegrees = 0;
                }

                var fontSize = insight.Utils.fontSizeFromFont(font);

                var width = text.length * fontSize + angleDegrees;
                var height = text.length * fontSize + angleDegrees * 2;

                return {
                    width: width,
                    height: height
                };

            }
        };

        function mockCreateTextMeasurer() {

            return fakeMeasurer;

        }

        var data = [
            {key: 'Largest', value: 700},
            {key: 'Medium', value: 600},
            {key: 'Tiny', value: 400}
        ];

        beforeEach(function() {
            axis = new insight.Axis('', insight.Scales.Ordinal);
            var secondaryAxis = new insight.Axis('Y Label', insight.Scales.Linear);

            series = new insight.ColumnSeries('testSeries', data, axis, secondaryAxis);

            spyOn(insight.TextMeasurer, 'create').andCallFake(mockCreateTextMeasurer);
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
                var expectedResult = fakeMeasurer.measureText('Largest', tickLabelFont).height;
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
                var expectedTickLabelHeight = fakeMeasurer.measureText('Largest', tickLabelFont).height;

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
                var expectedTickLabelHeight = fakeMeasurer.measureText('Largest', tickLabelFont).height;
                var expectedAxisLabelHeight = fakeMeasurer.measureText(axisLabel, axisFont).height;

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
                var expectedTickLabelHeight = fakeMeasurer.measureText('Largest', tickLabelFont, tickLabelRotation).height;
                var expectedAxisLabelHeight = fakeMeasurer.measureText(axisLabel, axisFont).height;

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
                var expectedResult = fakeMeasurer.measureText('Largest', tickLabelFont).width;
                expect(result.width).toBe(expectedResult);

            });

            it('returns correct value when no title and non-zero tick size and tick padding', function () {

                // Given
                axis.tickPadding(tickPadding).tickSize(tickSize);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedMaxTickLabelWidth = fakeMeasurer.measureText('Largest', tickLabelFont).width;

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
                var expectedMaxTickLabelWidth = fakeMeasurer.measureText('Largest', tickLabelFont).width;
                var expectedAxisLabelWidth = fakeMeasurer.measureText(axisLabel, axisFont).width;

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
                var expectedMaxTickLabelWidth = fakeMeasurer.measureText('Largest', tickLabelFont, tickLabelRotation).width;
                var expectedAxisLabelWidth = fakeMeasurer.measureText(axisLabel, axisFont).width;

                var expectedResult = expectedMaxTickLabelWidth
                    + tickPadding * 2
                    + tickSize
                    + expectedAxisLabelWidth;

                expect(result.width).toBe(expectedResult);

            });

        });
    });

});
