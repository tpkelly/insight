
var data = [
    {key:'a', value:0, date: new Date(2014,0,1)},
    {key:'b', value:3, date: new Date(2014,0,3)}, 
    {key:'c', value:12, date: new Date(2014,0,2)}, 
    {key:'d', value:20, date: new Date(2014,0,14)}, 
    {key:'e', value:13, date: new Date(2013,4,15)}
];


describe('Axis', function() {

    describe('constructor', function() {
        it('title getter works', function() {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.scales.linear);

            //Then:
            var observedTitle = axis.title();
            var expectedTitle = 'Value Axis';
            expect(observedTitle).toBe(expectedTitle);

        });
    });

    describe('tickLabelRotation', function() {

        it('has initial value of 0', function() {

            // Given
            var axis = new insight.Axis('SomeAxis', insight.scales.ordinal);

            // When
            var result = axis.tickLabelRotation();

            // Then
            expect(result).toBe(0);

        });

    });

    describe('barPadding', function() {

        it('has initial value of 0.1', function() {
            //Given:
            var axis = new insight.Axis('Value Axis', insight.scales.linear);

            //Then:
            expect(axis.barPadding()).toBe(0.1);

        });
    });

    describe('isHorizontal', function() {
        it('returns true for horizontal axis', function() {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.scales.linear);
            axis.direction = 'h';

            // When
            var observedResult = axis.isHorizontal();

            //Then:
            expect(observedResult).toBe(true);

        });

        it('returns false for vertical axis', function() {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.scales.linear);
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
            var axis = new insight.Axis('Value Axis', insight.scales.linear);

            //Then:
            var observedResult = axis.shouldDisplay();
            var expectedResult = true;
            expect(observedResult).toBe(expectedResult);
        });

        it('returns false when value set to false', function() {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.scales.linear)
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
            var axis = new insight.Axis('Value Axis', insight.scales.linear);

            //Then:
            var observedResult = axis.isOrdered();
            var expectedResult = false;
            expect(observedResult).toBe(expectedResult);
        });


        it('returns true when value set to true', function () {

            //Given:
            var axis = new insight.Axis('Value Axis', insight.scales.linear)
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

            var x = new insight.Axis('Key Axis', insight.scales.ordinal);
            var y = new insight.Axis('Value Axis', insight.scales.linear);

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

            var x = new insight.Axis('Key Axis', insight.scales.ordinal);
            var y = new insight.Axis('Value Axis', insight.scales.linear);

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

            var x = new insight.Axis('Key Axis', insight.scales.time);
            var y = new insight.Axis('Value Axis', insight.scales.linear);

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
            axis = new insight.Axis('Key Axis', insight.scales.linear);
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
            var y = new insight.Axis('Key Axis', insight.scales.linear)
                .tickSize(0)
                .tickPadding(0);

            // When
            var observedResult = y.tickLabelRotationTransform().split(',')[0];

            // Then
            expect(observedResult).toEqual(' rotate(0');

        });

        it('returns 90 degree tick rotation when top to bottom specified', function () {

            //Given:
            var y = new insight.Axis('Key Axis', insight.scales.linear)
                .tickLabelOrientation('tb')
                .tickSize(0)
                .tickPadding(0);

            //Then:
            var observedResult = y.tickLabelRotationTransform().split(',')[0];
            var expectedResult = ' rotate(90';

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
            var y = new insight.Axis('Key Axis', insight.scales.linear)
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

            var x = new insight.Axis('ValueAxis', insight.scales.linear)
                .tickLabelOrientation('lr');

            var y = new insight.Axis('KeyAxis', insight.scales.linear)
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

            var x = new insight.Axis('ValueAxis', insight.scales.linear)
                .tickLabelOrientation('lr');

            var y = new insight.Axis('KeyAxis', insight.scales.linear)
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

        it('Gridlines drawn when axis has no title', function() {
            //Given:
            createChartElement();

            var chart = new insight.Chart('test', '#testChart')
                .width(500)
                .height(500);

            var x = new insight.Axis('ValueAxis', insight.scales.linear);
            var y = new insight.Axis('', insight.scales.linear)
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

            var x = new insight.Axis('ValueAxis', insight.scales.linear);
            var y = new insight.Axis('Key Axis', insight.scales.linear)
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

            var x = new insight.Axis('ValueAxis', insight.scales.linear);
            var y = new insight.Axis('Key$Axis', insight.scales.linear)
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
            axisFont = insight.defaultTheme.axisStyle.axisTitleFont,
            axisTitle = 'Axis Title',
            tickPadding = 5,
            tickLabelFont = insight.defaultTheme.axisStyle.tickLabelFont,
            tickSize = 10,
            series,
            textMeasurer;

        var data = [
            {key: 'Largest', value: 700},
            {key: 'Mid', value: 600},
            {key: 'T', value: 400}
        ];

        beforeEach(function() {
            axis = new insight.Axis('', insight.scales.ordinal);
            var secondaryAxis = new insight.Axis('Y Title', insight.scales.linear);

            series = new insight.ColumnSeries('testSeries', data, axis, secondaryAxis);

            var canvas = document.createElement('canvas');

            textMeasurer = new insight.TextMeasurer(canvas);
        });

        it('uses tickValues to perform calculation', function () {

            // Given
            axis.title('')
                .tickPadding(0)
                .tickSize(0);
            spyOn(axis, 'tickValues').andCallThrough();

            // When
            axis.calculateLabelDimensions();

            // Then
            expect(axis.tickValues).toHaveBeenCalled();

        });

        describe('horizontal axis', function() {

            beforeEach(function() {
                axis.isHorizontal = d3.functor(true);
            });

            it('returns correct value when no title and zero tick size and tick padding', function () {

                // Given
                axis.title('')
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
                axis.title('')
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
                axis.title(axisTitle)
                    .tickPadding(tickPadding)
                    .tickSize(tickSize);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelHeight = textMeasurer.measureText('Largest', tickLabelFont).height;
                var expectedAxisTitleHeight = textMeasurer.measureText(axisTitle, axisFont).height;

                var expectedResult = expectedTickLabelHeight
                    + tickPadding * 2
                    + tickSize
                    + expectedAxisTitleHeight;

                expect(result.height).toBe(expectedResult);

            });

            it('handles tick label rotation', function() {

                // Given
                var tickLabelRotation = 30;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .title(axisTitle)
                    .tickLabelRotation(tickLabelRotation);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelHeight = textMeasurer.measureText('Largest', tickLabelFont, tickLabelRotation).height;
                var expectedAxisTitleHeight = textMeasurer.measureText(axisTitle, axisFont).height;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    expectedTickLabelHeight +
                    expectedAxisTitleHeight;

                expect(result.height).toBe(expectedResult);

            });

            it('handles tick label rotation greater than 180 degrees', function() {

                // Given
                var tickLabelRotation = 190;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .title(axisTitle)
                    .tickLabelRotation(tickLabelRotation);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelHeight = textMeasurer.measureText('Largest', tickLabelFont, tickLabelRotation).height;
                var expectedAxisTitleHeight = textMeasurer.measureText(axisTitle, axisFont).height;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    Math.abs(expectedTickLabelHeight) +
                    expectedAxisTitleHeight;

                expect(result.height).toBe(expectedResult);

            });

            it('handles tick label rotation 300 degrees', function() {

                // Given
                var tickLabelRotation = 300;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .title(axisTitle)
                    .tickLabelRotation(tickLabelRotation);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelHeight = textMeasurer.measureText('Largest', tickLabelFont, tickLabelRotation).height;
                var expectedAxisTitleHeight = textMeasurer.measureText(axisTitle, axisFont).height;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    Math.abs(expectedTickLabelHeight) +
                    expectedAxisTitleHeight;

                expect(result.height).toBe(expectedResult);

            });

            it('handles negative tick label height', function() {

                // Given
                var tickLabelRotation = 180;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .title(axisTitle)
                    .tickLabelRotation(tickLabelRotation);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedAxisTickLabelHeight = textMeasurer.measureText('Largest', tickLabelFont, tickLabelRotation).height;
                var expectedAxisTitleHeight = textMeasurer.measureText(axisTitle, axisFont).height;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    Math.abs(expectedAxisTickLabelHeight) +
                    expectedAxisTitleHeight;

                expect(result.height).toBe(expectedResult);

            });

            it('handles formatted tick labels', function() {

                // Given
                var tickLabelRotation = 30;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .title(axisTitle)
                    .tickLabelRotation(tickLabelRotation)
                    .tickLabelFormat(function(tickLabel) {
                        return tickLabel + '!!!';
                    });

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelHeight = textMeasurer.measureText('Largest!!!', tickLabelFont, tickLabelRotation).height;
                var expectedAxisTitleHeight = textMeasurer.measureText(axisTitle, axisFont).height;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    expectedTickLabelHeight +
                    expectedAxisTitleHeight;

                expect(result.height).toBe(expectedResult);

            });

            it('returns zero height if axis is not displayed', function() {

                // Given
                var tickLabelRotation = 30;

                axis.shouldDisplay(false)
                    .tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .title(axisTitle)
                    .tickLabelRotation(tickLabelRotation)
                    .tickLabelFormat(function(tickLabel) {
                        return tickLabel + '!!!';
                    });

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelHeight = textMeasurer.measureText('Largest!!!', tickLabelFont, tickLabelRotation).height;
                var expectedAxisTitleHeight = textMeasurer.measureText(axisTitle, axisFont).height;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    expectedTickLabelHeight +
                    expectedAxisTitleHeight;

                expect(result.height).toBe(0);

            });

            it('handles empty list of tick values', function() {

                // Given
                spyOn(axis, 'tickValues').andReturn([]);

                var tickPadding = 10,
                    tickSize = 5;

                axis.title('')
                    .tickPadding(tickPadding)
                    .tickSize(tickSize);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedHeight = 2 * tickPadding + tickSize;
                expect(result.height).toBe(expectedHeight);

            });

        });

        describe('vertical axis', function() {

            beforeEach(function() {
                axis.isHorizontal = d3.functor(false);
            });

            it('returns correct value when no title and zero tick size and tick padding', function () {

                // Given
                axis.title('')
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
                axis.title(axisTitle)
                    .tickPadding(tickPadding)
                    .tickSize(tickSize);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedMaxTickLabelWidth = textMeasurer.measureText('Largest', tickLabelFont).width;
                var expectedAxisTitleWidth = textMeasurer.measureText(axisTitle, axisFont).width;

                var expectedResult = expectedMaxTickLabelWidth
                    + tickPadding * 2
                    + tickSize
                    + expectedAxisTitleWidth;

                expect(result.width).toBe(expectedResult);

            });

            it('handles tick label rotation', function() {

                // Given
                var tickLabelRotation = 30;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .title(axisTitle)
                    .tickLabelRotation(tickLabelRotation);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedMaxTickLabelWidth = textMeasurer.measureText('Largest', tickLabelFont, tickLabelRotation).width;
                var expectedAxisTitleWidth = textMeasurer.measureText(axisTitle, axisFont).width;

                var expectedResult = expectedMaxTickLabelWidth
                    + tickPadding * 2
                    + tickSize
                    + expectedAxisTitleWidth;

                expect(result.width).toBe(expectedResult);

            });

            it('handles negative tick label width', function() {

                // Given
                var tickLabelRotation = 180;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .title(axisTitle)
                    .tickLabelRotation(tickLabelRotation);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelWidth = textMeasurer.measureText('Largest', tickLabelFont, tickLabelRotation).width;
                var expectedAxisTitleWidth = textMeasurer.measureText(axisTitle, axisFont).width;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    Math.abs(expectedTickLabelWidth) +
                    expectedAxisTitleWidth;

                expect(result.width).toBe(expectedResult);

            });


            it('handles tick label rotation greater than 180 degrees', function() {

                // Given
                var tickLabelRotation = 190;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .title(axisTitle)
                    .tickLabelRotation(tickLabelRotation);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedTickLabelWidth = textMeasurer.measureText('Largest', tickLabelFont, tickLabelRotation).width;
                var expectedAxisTitleWidth = textMeasurer.measureText(axisTitle, axisFont).width;

                var expectedResult =
                    tickSize +
                    tickPadding * 2 +
                    Math.abs(expectedTickLabelWidth) +
                    expectedAxisTitleWidth;

                expect(result.width).toBe(expectedResult);

            });


            it('handles formatted tick labels', function() {

                // Given
                var tickLabelRotation = 30;

                axis.tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .title(axisTitle)
                    .tickLabelRotation(tickLabelRotation)
                    .tickLabelFormat(function(tickValue) {
                        return '_' + tickValue + '_';
                    });

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedMaxTickLabelWidth = textMeasurer.measureText('_Largest_', tickLabelFont, tickLabelRotation).width;
                var expectedAxisTitleWidth = textMeasurer.measureText(axisTitle, axisFont).width;

                var expectedResult = expectedMaxTickLabelWidth
                    + tickPadding * 2
                    + tickSize
                    + expectedAxisTitleWidth;

                expect(result.width).toBe(expectedResult);

            });

            it('returns zero width if axis is not displayed', function() {

                // Given
                var tickLabelRotation = 30;

                axis.shouldDisplay(false)
                    .tickSize(tickSize)
                    .tickPadding(tickPadding)
                    .title(axisTitle)
                    .tickLabelRotation(tickLabelRotation)
                    .tickLabelFormat(function(tickValue) {
                        return '_' + tickValue + '_';
                    });

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedMaxTickLabelWidth = textMeasurer.measureText('_Largest_', tickLabelFont, tickLabelRotation).width;
                var expectedAxisTitleWidth = textMeasurer.measureText(axisTitle, axisFont).width;

                var expectedResult = expectedMaxTickLabelWidth
                    + tickPadding * 2
                    + tickSize
                    + expectedAxisTitleWidth;

                expect(result.width).toBe(0);

            });

            it('handles empty list of tick values', function() {

                // Given
                spyOn(axis, 'tickValues').andReturn([]);

                var tickPadding = 10,
                    tickSize = 5;

                axis.title('')
                    .tickPadding(tickPadding)
                    .tickSize(tickSize);

                // When
                var result = axis.calculateLabelDimensions();

                // Then
                var expectedWidth = 2 * tickPadding + tickSize;
                expect(result.width).toBe(expectedWidth);

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
                axis = new insight.Axis('', insight.scales.ordinal)
                    .tickLabelFormat(function(tickValue) {
                        return tickValue + '!!!';
                    });

                var secondaryAxis = new insight.Axis('Y Title', insight.scales.linear);
                series = new insight.ColumnSeries('testSeries', data, axis, secondaryAxis);
            });

            describe('on horizontal axis', function() {

                beforeEach(function() {
                    axis.isHorizontal = d3.functor(true);
                });

                it('returns zero overhang if axis is not displayed', function() {

                    // Given
                    axis.shouldDisplay(false);

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

                it('returns zero overhang if domain is empty and tick labels are rotated and formatted', function() {

                    // Given
                    spyOn(axis, 'domain').andReturn([]);
                    axis.tickLabelRotation(30);
                    axis.tickLabelFormat(function(d) {
                        return d.valueOf();
                    });

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

                it('returns zero overhang if domain is empty and there is tick label rotation and formatting', function() {

                    // Given
                    spyOn(axis, 'domain').andReturn([]);
                    axis.tickLabelRotation(30);
                    axis.tickLabelFormat(function(d) {
                        return d.valueOf();
                    });

                    // When
                    debugger;
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

                it('returns zero overhang if axis is not displayed and rotation is 90 degrees', function() {

                    // Given
                    axis.shouldDisplay(false)
                        .tickLabelRotation(90);

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
                            top: Math.ceil(expectedTop),
                            bottom: Math.ceil(expectedBottom),
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

    describe('textAnchor', function() {

        var axis;

        beforeEach(function() {
            axis = new insight.Axis('TestAxis', insight.scales.linear);
        });

        describe('vertical axis', function() {

            beforeEach(function() {
                axis.isHorizontal = d3.functor(false);
            });

            it('end if no rotation', function() {

                // Given
                axis.tickLabelRotation(0);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');


            });

            it('end if 45 degree rotation', function() {

                // Given
                axis.tickLabelRotation(45);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');


            });

            it('middle if 90 degree rotation', function() {

                // Given
                axis.tickLabelRotation(90);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('middle');


            });

            it('start if 135 degree rotation', function() {

                // Given
                axis.tickLabelRotation(135);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');


            });

            it('start if 180 degree rotation', function() {

                // Given
                axis.tickLabelRotation(180);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');

            });

            it('start if 225 degree rotation', function() {

                // Given
                axis.tickLabelRotation(225);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');

            });

            it('middle if 270 degree rotation', function() {

                // Given
                axis.tickLabelRotation(270);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('middle');

            });

            it('end if 315 degree rotation', function() {

                // Given
                axis.tickLabelRotation(315);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');

            });

            it('end if 360 degree rotation', function() {

                // Given
                axis.tickLabelRotation(360);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');

            });

            it('start if no rotation and reversed position', function() {

                // Given
                axis.tickLabelRotation(0);
                axis.hasReversedPosition(true);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');


            });

            it('start if 45 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(45);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');

            });

            it('middle if 90 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(90);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('middle');


            });

            it('middle if -90 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(-90);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('middle');


            });

            it('end if 135 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(135);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');


            });

            it('end if 180 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(180);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');

            });

            it('end if 225 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(225);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');

            });

            it('middle if 270 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(270);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('middle');

            });

            it('start if 315 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(315);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');

            });

            it('start if 360 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(360);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');

            });



        });

        describe('horizontal axis', function() {

            beforeEach(function() {
                axis.isHorizontal = d3.functor(true);
            });

            it('middle if no rotation', function() {

                // Given
                axis.tickLabelRotation(0);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('middle');


            });

            it('start if 45 degree rotation', function() {

                // Given
                axis.tickLabelRotation(45);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');


            });

            it('start if 90 degree rotation', function() {

                // Given
                axis.tickLabelRotation(90);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');


            });

            it('start if 135 degree rotation', function() {

                // Given
                axis.tickLabelRotation(135);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');


            });

            it('middle if 180 degree rotation', function() {

                // Given
                axis.tickLabelRotation(180);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('middle');

            });

            it('end if 225 degree rotation', function() {

                // Given
                axis.tickLabelRotation(225);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');

            });

            it('end if 270 degree rotation', function() {

                // Given
                axis.tickLabelRotation(270);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');

            });

            it('end if 315 degree rotation', function() {

                // Given
                axis.tickLabelRotation(270);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');

            });

            it('middle if 360 degree rotation', function() {

                // Given
                axis.tickLabelRotation(360);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('middle');

            });

            it('middle if no rotation and reversed position', function() {

                // Given
                axis.tickLabelRotation(0);
                axis.hasReversedPosition(true);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('middle');


            });

            it('end if 45 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(45);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');


            });

            it('end if 90 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(90);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');


            });

            it('end if 135 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(135);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('end');


            });

            it('middle if 180 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(180);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('middle');

            });

            it('start if 225 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(225);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');

            });

            it('start if 270 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(270);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');

            });

            it('start if 315 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(270);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('start');

            });

            it('middle if 360 degree rotation and reversed position', function() {

                // Given
                axis.hasReversedPosition(true);
                axis.tickLabelRotation(360);

                // When
                var result = axis.textAnchor();

                // Then
                expect(result).toBe('middle');

            });

        });

    });

    describe('tickValues', function() {
        function fakeAxisMeasurer(item) {
            return item.map(function() { return { width: 20, height: 10 } });
        }

        describe('on linear axis', function() {

            var axis;
            beforeEach(function() {
                axis = new insight.Axis('axis', insight.scales.linear);
            });

            it('tickValues are generated from tickFrequency', function() {

                // Given:
                spyOn(axis, 'domain').andReturn([0, 53271721]);
                spyOn(axis, 'tickFrequency').andReturn(5000000);

                // When:
                var result = axis.tickValues();

                // Then:
                var expectedTickValues = [
                    0,
                    5000000,
                    10000000,
                    15000000,
                    20000000,
                    25000000,
                    30000000,
                    35000000,
                    40000000,
                    45000000,
                    50000000
                ];
                expect(result).toEqual(expectedTickValues);
            });

            it('has rounded tick values', function() {

                // Given:
                spyOn(axis, 'domain').andReturn([241, 53271721]);
                spyOn(axis, 'tickFrequency').andReturn(5000000);

                // When:
                var result = axis.tickValues();

                // Then:
                var expectedTickValues = [
                    5000000,
                    10000000,
                    15000000,
                    20000000,
                    25000000,
                    30000000,
                    35000000,
                    40000000,
                    45000000,
                    50000000
                ];
                expect(result).toEqual(expectedTickValues);
            });

            it('has rounded tick values for small tick frequencies', function() {

                // Given:
                spyOn(axis, 'domain').andReturn([0, 1]);
                spyOn(axis, 'tickFrequency').andReturn(0.1);

                // When:
                var result = axis.tickValues();

                // Then:
                var expectedTickValues = [
                    0,
                    0.1,
                    0.2,
                    0.3,
                    0.4,
                    0.5,
                    0.6,
                    0.7,
                    0.8,
                    0.9,
                    1
                ];
                expect(result).toEqual(expectedTickValues);
            });

            it('has tick values that contain domain values', function() {

                // Given:
                spyOn(axis, 'domain').andReturn([0, 1000]);
                spyOn(axis, 'tickFrequency').andReturn(100);

                // When:
                var result = axis.tickValues();

                // Then:
                var expectedTickValues = [
                    0,
                    100,
                    200,
                    300,
                    400,
                    500,
                    600,
                    700,
                    800,
                    900,
                    1000
                ];
                expect(result).toEqual(expectedTickValues);
            });

            describe('the tick step', function() {

                it('increases by tickFrequency', function() {
                    //Given:
                    var tickFrequency = 10;
                    var axisStrategy = new insight.LinearAxis();

                    //Then:
                    var nextTick = axisStrategy.nextTickValue(axis, 50, tickFrequency);
                    expect(nextTick).toBe(60);
                });

                it('decreases by tickFrequency', function() {
                    //Given:
                    var tickFrequency = 10;
                    var axisStrategy = new insight.LinearAxis();

                    //Then:
                    var nextTick = axisStrategy.previousTickValue(axis, 50, tickFrequency);
                    expect(nextTick).toBe(40);
                });
            });
        });

        describe('on ordinal axis', function() {


            var axis;
            var categories;

            beforeEach(function() {
                axis = new insight.Axis('axis', insight.scales.ordinal);
                categories = ['Cat', 'Dog', 'Snake', 'Horse', 'Rabbit'];
                spyOn(axis, 'domain').andReturn(categories);
            });

            it('tickValues are generated from ordinal values', function() {

                // When:
                var result = axis.tickValues();

                // Then:
                expect(result).toEqual(categories);
            });

            it('ignores tickFrequency', function() {
                //Given:
                spyOn(axis, 'tickFrequency').andReturn(2);

                //Then:
                expect(axis.tickValues()).toEqual(categories);
            });

            describe('the tick step', function() {

                var axisStrategy;
                beforeEach(function() {
                    axisStrategy = new insight.OrdinalAxis();
                });

                it('increases to next ordinal value', function() {

                    // When:
                    var nextTick = axisStrategy.nextTickValue(axis, 'Snake');

                    // Then:
                    expect(nextTick).toBe('Horse');
                });

                it('decreases to previous ordinal value', function() {

                    // When:
                    var nextTick = axisStrategy.previousTickValue(axis, 'Dog');

                    // Then:
                    expect(nextTick).toBe('Cat');
                });

                it('last tick value cannot be increased', function() {

                    // When:
                    var nextTick = axisStrategy.nextTickValue(axis, 'Rabbit');

                    // Then:
                    expect(nextTick).toBe(null);
                });

                it('first tick value cannot be decreased', function() {

                    // When:
                    var nextTick = axisStrategy.previousTickValue(axis, 'Cat');

                    // Then:
                    expect(nextTick).toBe(null);
                });

                it('cannot increase a missing tick value', function() {

                    // When:
                    var nextTick = axisStrategy.nextTickValue(axis, 'Fictional');

                    // Then:
                    expect(nextTick).toBe(null);
                });

                it('cannot decrease a missing tick value', function() {

                    // When:
                    var nextTick = axisStrategy.previousTickValue(axis, 'Fictional');

                    // Then:
                    expect(nextTick).toBe(null);
                });
            });

        });

        describe('on time axis', function() {

            var axis;
            beforeEach(function() {
                axis = new insight.Axis('axis', insight.scales.time);
            });

            it('tickValues are generated from tickFrequency', function() {

                // Given:
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(2014, 0, 1)),
                        new Date(Date.UTC(2014, 9, 1, 17, 33, 3))]
                );
                spyOn(axis, 'tickFrequency').andReturn(insight.DateFrequency.dateFrequencyForMonths(1));

                // When:
                var result = axis.tickValues();

                // Then:
                var expectedTickValues = [
                    new Date(Date.UTC(2014, 0, 1)),
                    new Date(Date.UTC(2014, 1, 1)),
                    new Date(Date.UTC(2014, 2, 1)),
                    new Date(Date.UTC(2014, 3, 1)),
                    new Date(Date.UTC(2014, 4, 1)),
                    new Date(Date.UTC(2014, 5, 1)),
                    new Date(Date.UTC(2014, 6, 1)),
                    new Date(Date.UTC(2014, 7, 1)),
                    new Date(Date.UTC(2014, 8, 1)),
                    new Date(Date.UTC(2014, 9, 1))
                ];
                expect(result).toEqual(expectedTickValues);
            });

            it('has hourly tick values for a 12-hour long time axis', function() {

                // Given:
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(2014, 10, 8, 4, 6, 1)),
                        new Date(Date.UTC(2014, 10, 8, 16, 33, 3))]
                );
                spyOn(axis, 'tickFrequency').andReturn(insight.DateFrequency.dateFrequencyForHours(1));

                // When:
                var result = axis.tickValues();

                // Then:
                var expectedTickValues = [
                    new Date(Date.UTC(2014, 10, 8, 5)),
                    new Date(Date.UTC(2014, 10, 8, 6)),
                    new Date(Date.UTC(2014, 10, 8, 7)),
                    new Date(Date.UTC(2014, 10, 8, 8)),
                    new Date(Date.UTC(2014, 10, 8, 9)),
                    new Date(Date.UTC(2014, 10, 8, 10)),
                    new Date(Date.UTC(2014, 10, 8, 11)),
                    new Date(Date.UTC(2014, 10, 8, 12)),
                    new Date(Date.UTC(2014, 10, 8, 13)),
                    new Date(Date.UTC(2014, 10, 8, 14)),
                    new Date(Date.UTC(2014, 10, 8, 15)),
                    new Date(Date.UTC(2014, 10, 8, 16))
                ];
                expect(result).toEqual(expectedTickValues);
            });

            it('handles dates before 1970', function() {

                // Given:
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(1965, 0, 1, 0, 0)),
                        new Date(Date.UTC(1975, 0, 1, 0, 0))]
                );
                spyOn(axis, 'tickFrequency').andReturn(insight.DateFrequency.dateFrequencyForYears(1));

                // When:
                var result = axis.tickValues();

                // Then:
                var expectedTickValues = [
                    new Date(Date.UTC(1965, 0, 1)),
                    new Date(Date.UTC(1966, 0, 1)),
                    new Date(Date.UTC(1967, 0, 1)),
                    new Date(Date.UTC(1968, 0, 1)),
                    new Date(Date.UTC(1969, 0, 1)),
                    new Date(Date.UTC(1970, 0, 1)),
                    new Date(Date.UTC(1971, 0, 1)),
                    new Date(Date.UTC(1972, 0, 1)),
                    new Date(Date.UTC(1973, 0, 1)),
                    new Date(Date.UTC(1974, 0, 1)),
                    new Date(Date.UTC(1975, 0, 1))
                ];
                expect(result).toEqual(expectedTickValues);
            });

            describe('the tick step', function() {

                var axisStrategy;
                beforeEach(function() {
                    axisStrategy = new insight.DateAxis();
                });

                it('increases by tickFrequency for years', function() {
                    //Given:
                    var tickFrequency = insight.DateFrequency.dateFrequencyForYears(1);

                    //Then:
                    var nextTick = axisStrategy.nextTickValue(axis, new Date(2012, 1, 29), tickFrequency);
                    expect(nextTick).toEqual(new Date(2013, 2, 1));
                });

                it('decreases by tickFrequency for years', function() {
                    //Given:
                    var tickFrequency = insight.DateFrequency.dateFrequencyForYears(1);

                    //Then:
                    var nextTick = axisStrategy.previousTickValue(axis, new Date(2012, 1, 29), tickFrequency);
                    expect(nextTick).toEqual(new Date(2011, 2, 1));
                });


                it('increases by tickFrequency for months', function() {
                    //Given:
                    var tickFrequency = insight.DateFrequency.dateFrequencyForMonths(3);

                    //Then:
                    var nextTick = axisStrategy.nextTickValue(axis, new Date(2014, 4, 10), tickFrequency);
                    expect(nextTick).toEqual(new Date(2014, 7, 10));
                });

                it('decreases by tickFrequency for months', function() {
                    //Given:
                    var tickFrequency = insight.DateFrequency.dateFrequencyForMonths(3);

                    //Then:
                    var nextTick = axisStrategy.previousTickValue(axis, new Date(2014, 7, 10), tickFrequency);
                    expect(nextTick).toEqual(new Date(2014, 4, 10));
                });

                it('increases by tickFrequency for days', function() {
                    //Given:
                    var tickFrequency = insight.DateFrequency.dateFrequencyForDays(1);

                    //Then:
                    var nextTick = axisStrategy.nextTickValue(axis, new Date(2014, 6, 31), tickFrequency);
                    expect(nextTick).toEqual(new Date(2014, 7, 1));
                });

                it('decreases by tickFrequency for days', function() {
                    //Given:
                    var tickFrequency= insight.DateFrequency.dateFrequencyForDays(1);

                    //Then:
                    var nextTick = axisStrategy.previousTickValue(axis, new Date(2014, 0, 1), tickFrequency);
                    expect(nextTick).toEqual(new Date(2013, 11, 31));
                });

                it('increases by tickFrequency for hours', function() {
                    //Given:
                    var tickFrequency = insight.DateFrequency.dateFrequencyForHours(6);

                    //Then:
                    var nextTick = axisStrategy.nextTickValue(axis, new Date(Date.UTC(2014, 2, 30, 0)), tickFrequency);
                    expect(nextTick).toEqual(new Date(Date.UTC(2014, 2, 30, 6)));
                });

                it('decreases by tickFrequency for hours', function() {
                    //Given:
                    var tickFrequency = insight.DateFrequency.dateFrequencyForHours(6);

                    //Then:
                    var nextTick = axisStrategy.previousTickValue(axis, new Date(Date.UTC(2014, 9, 26, 5)), tickFrequency);
                    expect(nextTick).toEqual(new Date(Date.UTC(2014, 9, 25, 23)));
                });

                it('increases by tickFrequency for minutes', function() {
                    //Given:
                    var tickFrequency = insight.DateFrequency.dateFrequencyForMinutes(6);

                    //Then:
                    var nextTick = axisStrategy.nextTickValue(axis, new Date(2014, 2, 30, 0, 5), tickFrequency);
                    expect(nextTick).toEqual(new Date(2014, 2, 30, 0, 11));
                });

                it('decreases by tickFrequency for minutes', function() {
                    //Given:
                    var tickFrequency = insight.DateFrequency.dateFrequencyForMinutes(6);

                    //Then:
                    var nextTick = axisStrategy.previousTickValue(axis, new Date(2014, 9, 26, 6, 11), tickFrequency);
                    expect(nextTick).toEqual(new Date(2014, 9, 26, 6, 5));
                });

                it('increases by tickFrequency for seconds', function() {
                    //Given:
                    var tickFrequency = insight.DateFrequency.dateFrequencyForSeconds(6);

                    //Then:
                    var nextTick = axisStrategy.nextTickValue(axis, new Date(2014, 2, 30, 0, 0, 5), tickFrequency);
                    expect(nextTick).toEqual(new Date(2014, 2, 30, 0, 0, 11));
                });

                it('decreases by tickFrequency for seconds', function() {
                    //Given:
                    var tickFrequency = insight.DateFrequency.dateFrequencyForSeconds(6);

                    //Then:
                    var nextTick = axisStrategy.previousTickValue(axis, new Date(2014, 9, 26, 6, 0, 11), tickFrequency);
                    expect(nextTick).toEqual(new Date(2014, 9, 26, 6, 0, 5));
                });
            });

        });

    });

    describe('initial tick', function() {
        it('on linear axis is a multiple of the tick frequency', function() {
            //Given:
            var axis = new insight.Axis('axis', insight.scales.linear);
            spyOn(axis, 'domain').andReturn([7, 20]);
            var tickFrequency = 4;
            var axisStrategy = new insight.LinearAxis();

            //Then:
            var expectedFirstTick = 8;
            var observedFirstTick = axisStrategy.initialTickValue(axis, tickFrequency);
            expect(observedFirstTick).toBe(expectedFirstTick);
        });

        describe('on date axis', function() {

            it('is a multiple of a second tick frequency', function() {
                //Given:
                var axis = new insight.Axis('axis', insight.scales.time);
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(2014, 10, 8, 4, 6, 4)),
                        new Date(Date.UTC(2014, 10, 8, 16, 33, 5))]
                );
                var tickFrequency = insight.DateFrequency.dateFrequencyForSeconds(15);
                var axisStrategy = new insight.DateAxis();

                //Then:
                var expectedFirstTick = new Date(Date.UTC(2014, 10, 8, 4, 6, 15));
                var observedFirstTick = axisStrategy.initialTickValue(axis, tickFrequency);
                expect(observedFirstTick).toEqual(expectedFirstTick);
            });

            it('is a multiple of a minute tick frequency', function() {
                //Given:
                var axis = new insight.Axis('axis', insight.scales.time);
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(2014, 10, 8, 4, 6, 4)),
                        new Date(Date.UTC(2014, 10, 8, 16, 33, 5))]
                );
                var tickFrequency = insight.DateFrequency.dateFrequencyForMinutes(30);
                var axisStrategy = new insight.DateAxis();

                //Then:
                var expectedFirstTick = new Date(Date.UTC(2014, 10, 8, 4, 30));
                var observedFirstTick = axisStrategy.initialTickValue(axis, tickFrequency);
                expect(observedFirstTick).toEqual(expectedFirstTick);
            });

            it('is a multiple of a hour tick frequency', function() {
                //Given:
                var axis = new insight.Axis('axis', insight.scales.time);
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(2014, 10, 8, 4, 6)),
                        new Date(Date.UTC(2014, 10, 8, 16, 33))]
                );
                var tickFrequency = insight.DateFrequency.dateFrequencyForHours(6);
                var axisStrategy = new insight.DateAxis();

                //Then:
                var expectedFirstTick = new Date(Date.UTC(2014, 10, 8, 6));
                var observedFirstTick = axisStrategy.initialTickValue(axis, tickFrequency);
                expect(observedFirstTick).toEqual(expectedFirstTick);
            });

            it('is a multiple of a day tick frequency', function() {
                //Given:
                var axis = new insight.Axis('axis', insight.scales.time);
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(2013, 9, 30, 4)),
                        new Date(Date.UTC(2013, 10, 9, 16))]
                );
                var tickFrequency = insight.DateFrequency.dateFrequencyForDays(2);
                var axisStrategy = new insight.DateAxis();

                //Then:
                var expectedFirstTick = new Date(Date.UTC(2013, 9, 30));
                var observedFirstTick = axisStrategy.initialTickValue(axis, tickFrequency);
                expect(observedFirstTick).toEqual(expectedFirstTick);
            });

            it('handles month boundaries for day tick frequencies', function() {
                //Given:
                var axis = new insight.Axis('axis', insight.scales.time);
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(2013, 9, 31, 4)),
                        new Date(Date.UTC(2014, 1, 18, 16))]
                );
                var tickFrequency = insight.DateFrequency.dateFrequencyForDays(2);
                var axisStrategy = new insight.DateAxis();

                //Then:
                var expectedFirstTick = new Date(Date.UTC(2013, 10, 1));
                var observedFirstTick = axisStrategy.initialTickValue(axis, tickFrequency);
                expect(observedFirstTick).toEqual(expectedFirstTick);
            });

            it('handles year boundaries for day tick frequencies', function() {
                //Given:
                var axis = new insight.Axis('axis', insight.scales.time);
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(2014, 0, 1, 4)),
                        new Date(Date.UTC(2014, 0, 18, 16))]
                );
                var tickFrequency = insight.DateFrequency.dateFrequencyForDays(2);
                var axisStrategy = new insight.DateAxis();

                //Then:
                var expectedFirstTick = new Date(Date.UTC(2014, 0, 2));
                var observedFirstTick = axisStrategy.initialTickValue(axis, tickFrequency);
                expect(observedFirstTick).toEqual(expectedFirstTick);
            });

            it('is a multiple of a week tick frequency', function() {
                //Given:
                var axis = new insight.Axis('axis', insight.scales.time);
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(2014, 10, 8, 4)),
                        new Date(Date.UTC(2014, 10, 8, 16))]
                );
                var tickFrequency = insight.DateFrequency.dateFrequencyForWeeks(1);
                var axisStrategy = new insight.DateAxis();

                //Then:
                var expectedFirstTick = new Date(Date.UTC(2014, 10, 9));
                var observedFirstTick = axisStrategy.initialTickValue(axis, tickFrequency);
                expect(observedFirstTick).toEqual(expectedFirstTick);
            });

            it('is a multiple of a month tick frequency', function() {
                //Given:
                var axis = new insight.Axis('axis', insight.scales.time);
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(2014, 7, 8)),
                        new Date(Date.UTC(2014, 11, 8))]
                );
                var tickFrequency = insight.DateFrequency.dateFrequencyForMonths(3);
                var axisStrategy = new insight.DateAxis();

                //Then:
                var expectedFirstTick = new Date(Date.UTC(2014, 9));
                var observedFirstTick = axisStrategy.initialTickValue(axis, tickFrequency);
                expect(observedFirstTick).toEqual(expectedFirstTick);
            });

            it('is a multiple of a year tick frequency', function() {
                //Given:
                var axis = new insight.Axis('axis', insight.scales.time);
                spyOn(axis, 'domain').andReturn([
                        new Date(Date.UTC(2014, 10, 8, 4, 6, 1)),
                        new Date(Date.UTC(2014, 10, 8, 16, 33, 3))]
                );
                var tickFrequency = insight.DateFrequency.dateFrequencyForYears(5);
                var axisStrategy = new insight.DateAxis();

                //Then:
                var expectedFirstTick = new Date(2015, 0);
                var observedFirstTick = axisStrategy.initialTickValue(axis, tickFrequency);
                expect(observedFirstTick).toEqual(expectedFirstTick);
            });
        });


        it('on ordinal axis is the first value', function() {
            //Given:
            var axis = new insight.Axis('axis', insight.scales.ordinal);
            spyOn(axis, 'domain').andReturn(['Cat', 'Dog', 'Horse', 'Rat', 'Rabbit']);
            var axisStrategy = new insight.OrdinalAxis();
            var tickFrequency;

            //Then:
            var expectedFirstTick = 'Cat';
            var observedFirstTick = axisStrategy.initialTickValue(axis, tickFrequency);
            expect(observedFirstTick).toEqual(expectedFirstTick);
        });
    });

    describe('tickFrequency', function() {

        describe('on linear axis', function() {

            var axis;
            beforeEach(function() {
                axis = new insight.Axis('axis', insight.scales.linear);
                axis.bounds = [1000, 300];
                axis.isHorizontal = d3.functor(true);

                spyOn(axis, 'measureTickValues').andCallFake(function(item) {
                    return item.map(function() { return { width: 20, height: 10 } });
                });
            });

            it('has a 1/10th tick frequency', function() {
                //Given:
                spyOn(axis, 'domain').andReturn([0, 1000]);

                //Then:
                var expectedFrequency = 100;
                var observedFrequency = axis.tickFrequency();
                expect(observedFrequency).toBe(expectedFrequency);
            });

            it('has a round frequency', function() {
                //Given:
                spyOn(axis, 'domain').andReturn([0, 2025]);

                //Then:
                var expectedFrequency = 200;
                var observedFrequency = axis.tickFrequency();
                expect(observedFrequency).toBe(expectedFrequency);
            });

            it('has tick frequency of a single significant figure', function() {
                //Given:
                spyOn(axis, 'domain').andReturn([0, 999]);

                //Then:
                var expectedFrequency = 100;
                var observedFrequency = axis.tickFrequency();
                expect(observedFrequency).toBe(expectedFrequency);
            });

            it('has tick frequency of 1 when range is 0', function() {
                //Given:
                spyOn(axis, 'domain').andReturn([5, 5]);

                //Then:
                var expectedFrequency = 1;
                var observedFrequency = axis.tickFrequency();
                expect(observedFrequency).toBe(expectedFrequency);
            });

            it('can have a tick frequency set by the user', function() {
                //Given:
                var userSpecifiedValue = 75;
                spyOn(axis, 'domain').andReturn([0, 1000]);

                //When:
                axis.tickFrequency(userSpecifiedValue);

                //Then:
                var expectedFrequency = userSpecifiedValue;
                var observedFrequency = axis.tickFrequency();
                expect(observedFrequency).toBe(expectedFrequency);
            });

            it('setting the tick frequency updates tickValues', function() {
                //Given:
                var userSpecifiedValue = 75;
                spyOn(axis, 'domain').andReturn([0, 500]);

                //When:
                axis.tickFrequency(userSpecifiedValue);

                //Then:
                var expectedTicks = [0, 75, 150, 225, 300, 375, 450];
                var observedTicks = axis.tickValues();
                expect(observedTicks).toEqual(expectedTicks);
            });

            it('tick frequency cannot be negative', function() {
                //Given:
                var throwMinusOne = function() {axis.tickFrequency(-1);};
                var throwMinusOneHundred = function() {axis.tickFrequency(-100);};
                var throwMinusPointOne = function() {axis.tickFrequency(-.1);};

                //Then:
                expect(throwMinusOne).toThrow(insight.ErrorMessages.nonPositiveTickFrequencyException);
                expect(throwMinusOneHundred).toThrow(insight.ErrorMessages.nonPositiveTickFrequencyException);
                expect(throwMinusPointOne).toThrow(insight.ErrorMessages.nonPositiveTickFrequencyException);
            });

            it('tick frequency cannot be zero', function() {
                //Given:
                var throwAction = function() {axis.tickFrequency(0);};

                //Then:
                expect(throwAction).toThrow(insight.ErrorMessages.nonPositiveTickFrequencyException);
            });

            it('ensures tick labels do not overlap when axis is horizontal', function() {
                //Given:
                axis.bounds = [100, 300];
                spyOn(axis, 'domain').andReturn([0, 999]);

                //Then:
                var expectedFrequency = 200;
                var observedFrequency = axis.tickFrequency();
                expect(observedFrequency).toBe(expectedFrequency);
            });

            it('ensures tick labels do not overlap when axis is vertical', function() {
                axis.isHorizontal = d3.functor(false);
                //Given:
                axis.bounds = [1000, 50];
                spyOn(axis, 'domain').andReturn([0, 999]);

                //Then:
                var expectedFrequency = 200;
                var observedFrequency = axis.tickFrequency();
                expect(observedFrequency).toBe(expectedFrequency);
            });

        });

        describe('on date / time axis', function() {

            var axis;
            beforeEach(function() {
                axis = new insight.Axis('axis', insight.scales.time);
                axis.bounds = [1000, 300];
                axis.isHorizontal = d3.functor(true);

                spyOn(axis, 'measureTickValues').andCallFake(function(item) {
                    return item.map(function() { return { width: 20, height: 10 } });
                });
            });

            it('has a 1/10th tick frequency', function() {
                //Given:
                spyOn(axis, 'domain').andReturn([
                    new Date(2014, 0, 1),
                    new Date(2014, 10, 1)
                ]);

                //Then:
                var expectedFrequency = insight.DateFrequency.dateFrequencyForMonths(1).toValue();
                var observedFrequency = axis.tickFrequency().toValue();
                expect(observedFrequency).toEqual(expectedFrequency);
            });

            it('has a whole-date frequency for partial-day ranges', function() {
                //Given:
                spyOn(axis, 'domain').andReturn([
                    new Date(2014, 0, 1),
                    new Date(2014, 0, 21, 5)
                ]);

                //Then:
                var expectedFrequency = insight.DateFrequency.dateFrequencyForDays(2).toValue();
                var observedFrequency = axis.tickFrequency().toValue();
                expect(observedFrequency).toEqual(expectedFrequency);
            });

            it('has a whole-year frequency for partial-year ranges', function() {
                //Given:
                spyOn(axis, 'domain').andReturn([
                    new Date(2004, 1, 1),
                    new Date(2014, 0, 30)
                ]);

                //Then:
                var expectedFrequency = insight.DateFrequency.dateFrequencyForYears(1).toValue();
                var observedFrequency = axis.tickFrequency().toValue();
                expect(observedFrequency).toEqual(expectedFrequency);
            });

            it('has maximum tick frequency of 100 years', function() {
                //Given:
                spyOn(axis, 'domain').andReturn([
                    new Date(1900, 1, 1),
                    new Date(200014, 0, 30)
                ]);

                //Then:
                var expectedFrequency = insight.DateFrequency.dateFrequencyForYears(100).toValue();
                var observedFrequency = axis.tickFrequency().toValue();
                expect(observedFrequency).toEqual(expectedFrequency);
            });

            it('ensures tick labels do not overlap when axis is horizontal', function() {
                //Given:
                axis.bounds = [100, 300];
                spyOn(axis, 'domain').andReturn([
                    new Date(2014, 0, 1),
                    new Date(2014, 10, 1)
                ]);

                //Then:
                var expectedFrequency = insight.DateFrequency.dateFrequencyForMonths(3).toValue();
                var observedFrequency = axis.tickFrequency().toValue();
                expect(observedFrequency).toEqual(expectedFrequency);
            });

            it('ensures tick labels do not overlap when axis is vertical', function() {
                //Given:
                axis.isHorizontal = d3.functor(false);
                axis.bounds = [1000, 50];
                spyOn(axis, 'domain').andReturn([
                    new Date(2014, 0, 1),
                    new Date(2014, 10, 1)
                ]);

                //Then:
                var expectedFrequency = insight.DateFrequency.dateFrequencyForMonths(3).toValue();
                var observedFrequency = axis.tickFrequency().toValue();
                expect(observedFrequency).toEqual(expectedFrequency);
            });

        });
    });
});
