describe('Chart', function() {
    
    describe('constructor', function() {

        it('sets name', function() {

            var chart = new insight.Chart('somename', 'asdads', 'ada');

            expect(chart.name).toBe('somename');

        });

        it('sets element', function() {

            var chart = new insight.Chart('somename', 'somelement', 'ada');

            expect(chart.element).toBe('somelement');

        });

    });

    describe('defaults', function() {

        var chart;

        beforeEach(function() {
            chart = new insight.Chart();
        });

        it('selectedItems empty', function() {

            expect(chart.selectedItems).toEqual([]);

        });

        it('container null', function() {

            expect(chart.container).toBeNull();

        });

        it('height 300', function() {

            expect(chart.height()).toBe(300);

        });

        it('width 300', function() {

            expect(chart.width()).toBe(300);

        });

        it('minWidth 300', function() {

            expect(chart.minWidth()).toBe(300);

        });

        it('maxWidth 300', function() {

            expect(chart.maxWidth()).toBe(300);

        });

        it('margin {0,0,0,0}', function() {

            expect(chart.margin()).toEqual({
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            });

        });

        it('series empty', function() {

            expect(chart.series()).toEqual([]);

        });

        it('axes empty', function() {

            expect(chart.xAxes()).toEqual([]);
            expect(chart.yAxes()).toEqual([]);

        });

        it('title empty', function() {

            expect(chart.title()).toBe('');

        });


        it('title color black', function() {

            expect(chart.titleColor()).toEqual('#000');

        });

        it('title font Helvetica 16pt', function() {

            expect(chart.titleFont()).toBe('Helvetica Neue 16pt');

        });
    });

    describe('gets and sets', function() {

        var chart;

        beforeEach(function() {
            chart = new insight.Chart('asda', 'asdads', 'ada');
        });

        it('title', function() {

            var result = chart.title('Test Chart');

            expect(chart.title()).toBe('Test Chart');
            expect(result).toBe(chart);
        });

        it('width', function() {

            var result = chart.width(123);

            expect(chart.width()).toBe(123);
            expect(result).toBe(chart);
        });

        it('maxWidth', function() {

            var result = chart.width(220);

            expect(chart.maxWidth()).toBe(220);
            expect(result).toBe(chart);
        });

        it('setting width sets maxWidth', function() {

            chart.maxWidth(300);
            var result = chart.width(123);

            expect(chart.maxWidth()).toBe(123);
            expect(result).toBe(chart);
        });

        it('setting width sets maxWidth if dontSetMaxWidth false', function() {

            chart.maxWidth(300);
            var result = chart.width(123, false);

            expect(chart.maxWidth()).toBe(123);
            expect(result).toBe(chart);
        });

        it('setting width doesn\'t set maxWidth if dontSetMaxWidth true', function() {

            chart.maxWidth(300);
            var result = chart.width(123, true);

            expect(chart.maxWidth()).toBe(300);
            expect(result).toBe(chart);
        });

        it('setting maxWidth doesn\'t set width', function() {

            chart.width(250);
            var result = chart.maxWidth(450);

            expect(chart.width()).toBe(250);
            expect(result).toBe(chart);
        });

        it('height', function() {

            var result = chart.height(500);

            expect(chart.height()).toBe(500);
            expect(result).toBe(chart);
        });

        it('margin', function() {

            var result = chart.margin({
                top: 1,
                left: 2,
                right: 3,
                bottom: 4
            });

            expect(chart.margin()).toEqual({
                top: 1,
                left: 2,
                right: 3,
                bottom: 4
            });
            expect(result).toBe(chart);
        });

        it('series', function() {

            var s = {};
            var result = chart.series(s);

            expect(chart.series()).toBe(s);
            expect(result).toBe(chart);
        });

        it('autoMargin', function() {

            var result = chart.autoMargin(true);

            expect(chart.autoMargin()).toBe(true);
            expect(result).toBe(chart);
        });

    });

    describe('addAxis', function() {

        it('adds to axes', function() {

            var chart = new insight.Chart();

            expect(chart.xAxes()).toEqual([]);

            var a = {};

            chart.addXAxis(a);

            expect(chart.xAxes()[0]).toBe(a);

        });

    });

    describe('init', function() {

        describe('with no arguments', function() {
            var chart, reald3;

            var testInit = function(setup) {

                if(arguments.length){
                    setup();
                }
                
                d3 = new D3Mocks();

                // prevent calling through to functions that are not being tested
                spyOn(chart, 'calculateLabelMargin');
                spyOn(chart, 'draw').andCallThrough();
                spyOn(chart, 'addClipPath').andCallThrough();
                spyOn(window, 'getComputedStyle');

                chart.draw();
            };

            beforeEach(function(){

                reald3 = d3;  

                chart = new insight.Chart('ChartName');                

            });

            afterEach(function() {

                d3 = reald3;

            });

            describe('sets chart div', function() {

                it('class', function() {

                    testInit();

                    expect(d3.elements['div'].attrs['class']).toEqual(insight.Constants.ContainerClass);

                });

                it('position', function() {

                    testInit();

                    expect(d3.elements['div'].styles['position']).toEqual('relative');

                });

                it('display', function() {

                    testInit();

                    expect(d3.elements['div'].styles['display']).toEqual('inline-block');

                });

            });

            describe('sets chart svg', function() {

                it('class', function() {

                    testInit();

                    expect(d3.elements['svg'].attrs['class']).toEqual(insight.Constants.ChartSVG);

                });

            });

            describe('sets chart g', function() {

                it('class', function() {

                    testInit();

                    expect(d3.elements['g'].attrs['class']).toEqual(insight.Constants.PlotArea);

                });

            });

            describe('calls', function() {

                it('addClipPath', function() {

                    testInit();

                    expect(chart.addClipPath).toHaveBeenCalled();

                });

                it('draw', function() {

                    testInit();

                    expect(chart.draw).toHaveBeenCalledWith();

                });
               

            });
        });
    });

    describe('autosize margins', function() {

        var chart,
            xAxis,
            yAxis,
            textElement,
            styles,
            measurer,
            minimalMargins = 10;

        //Set up tests
        beforeEach(function() {
            chart = new insight.Chart('asda', 'asdads', 'ada');
            measurer = new insight.MarginMeasurer();
            xAxis = new insight.Axis('', insight.Scales.Linear);
            yAxis = new insight.Axis('', insight.Scales.Linear);

            styles = {'font-size': '10px', 'font-family': 'Helvetica', 'line-height': '18px'};

            chart.addXAxis(xAxis);
            chart.addYAxis(yAxis);

        });

        it('margins are set to minimal value when no series on chart', function() {
            //Given:
            chart.series([]);
            
            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":minimalMargins,
                "right":minimalMargins,
                "bottom":minimalMargins
            });
        });

        it('margins are set to minimal value when series has no data', function() {
            //Given:
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);
            
            var expectedDimensions = {
                    "maxKeyWidth": 0,
                    "maxValueWidth": 0,
                    "maxKeyHeight": 0,
                    "maxValueHeight": 0
            };
            
            chart.series([series]);

            spyOn(measurer, 'seriesLabelDimensions').andReturn(expectedDimensions);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":minimalMargins,
                "right":minimalMargins,
                "bottom":minimalMargins
            });

        });

        it('bottom margins are expanded when x-axis has labels', function() {
            //Given:
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);
            
            var expectedDimensions = {
                    "maxKeyWidth": 15,
                    "maxValueWidth": 0,
                    "maxKeyHeight": 20,
                    "maxValueHeight": 0
            };

            spyOn(measurer, 'seriesLabelDimensions').andReturn(expectedDimensions);

            chart.series([series]);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":minimalMargins,
                "right":minimalMargins,
                "bottom":20
            });

        });

        it('left margins are expanded when y-axis has labels', function() {
            //Given:
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);
            
            var expectedDimensions = {
                    "maxKeyWidth": 0,
                    "maxValueWidth": 15,
                    "maxKeyHeight": 0,
                    "maxValueHeight": 20
                };

            spyOn(measurer, 'seriesLabelDimensions').andReturn(expectedDimensions);

            chart.series([series]);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":15,
                "right":minimalMargins,
                "bottom":minimalMargins
            });

        });

        it('right margins are expanded when y-axis is reversed', function() {
            //Given:
            yAxis = new insight.Axis('', insight.Scales.Linear).hasReversedPosition(true);
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);
            
            var maxDimensions = {
                    "maxKeyWidth": 0,
                    "maxValueWidth": 15,
                    "maxKeyHeight": 0,
                    "maxValueHeight": 20
                };

            spyOn(measurer, 'seriesLabelDimensions').andReturn(maxDimensions);

            chart.series([series]);
            chart.yAxis(yAxis);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":minimalMargins,
                "right":15,
                "bottom":minimalMargins
            });
        });

        it('top margins are expanded when x-axis is reversed', function() {
            //Given:
            xAxis = new insight.Axis('', insight.Scales.Linear).hasReversedPosition(true);
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);

            var maxDimensions = {
                "maxKeyWidth": 15,
                "maxValueWidth":0,
                "maxKeyHeight": 20,
                "maxValueHeight": 0
            };

            spyOn(measurer, 'seriesLabelDimensions').andReturn(maxDimensions);


            chart.series([series]);
            chart.xAxis(xAxis);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":20,
                "left":minimalMargins,
                "right":minimalMargins,
                "bottom":minimalMargins
            });
        });

        it('margins are not expanded for margins smaller than minimal value', function() {
            //Given:
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);

            var expectedDimensions = {
                "maxKeyWidth": 5,
                "maxValueWidth": 0,
                "maxKeyHeight": 8,
                "maxValueHeight": 0
            };

            spyOn(measurer, 'seriesLabelDimensions').andReturn(expectedDimensions);

            chart.series([series]);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":minimalMargins,
                "right":minimalMargins,
                "bottom":minimalMargins
            });

        });
    });

    describe("adding axes", function() {
       it("Adding x-axis adds to the axis array", function() {
           //Given:
           var chart = new insight.Chart('asda', 'asdads', 'ada');
           var xAxis = new insight.Axis('', insight.Scales.Linear);

           //When:
           chart.xAxis(xAxis);

           //Then:
           expect(chart.xAxes()).toEqual([xAxis]);
       });

        it("Adding x-axis twice only adds to the axis array once", function() {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');
            var xAxis = new insight.Axis('', insight.Scales.Linear);

            //When:
            chart.xAxis(xAxis);
            chart.xAxis(xAxis);

            //Then:
            expect(chart.xAxes()).toEqual([xAxis]);
        });

        it("Adding x-axes adds to the axis array", function() {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');
            var xAxis = new insight.Axis('', insight.Scales.Linear);

            //When:
            chart.xAxes([xAxis]);

            //Then:
            expect(chart.xAxes()).toEqual([xAxis]);
        });

        it("Adding x-axes twice only adds to the axis array once", function() {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');
            var xAxis = new insight.Axis('', insight.Scales.Linear);

            //When:
            chart.xAxes([xAxis]);
            chart.xAxes([xAxis]);

            //Then:
            expect(chart.xAxes()).toEqual([xAxis]);
        });

            it("Adding y-axis adds to the axis array", function() {
                //Given:
                var chart = new insight.Chart('asda', 'asdads', 'ada');
                var yAxis = new insight.Axis('', insight.Scales.Linear);

                //When:
                chart.yAxis(yAxis);

                //Then:
                expect(chart.yAxes()).toEqual([yAxis]);
            });

            it("Adding y-axis twice only adds to the axis array once", function() {
                //Given:
                var chart = new insight.Chart('asda', 'asdads', 'ada');
                var yAxis = new insight.Axis('', insight.Scales.Linear);

                //When:
                chart.yAxis(yAxis);
                chart.yAxis(yAxis);

                //Then:
                expect(chart.yAxes()).toEqual([yAxis]);
            });

            it("Adding x-axes adds to the axis array", function() {
                //Given:
                var chart = new insight.Chart('asda', 'asdads', 'ada');
                var yAxis = new insight.Axis('', insight.Scales.Linear);

                //When:
                chart.yAxes([yAxis]);

                //Then:
                expect(chart.yAxes()).toEqual([yAxis]);
            });

            it("Adding x-axes twice only adds to the axis array once", function() {
                //Given:
                var chart = new insight.Chart('asda', 'asdads', 'ada');
                var yAxis = new insight.Axis('', insight.Scales.Linear);

                //When:
                chart.yAxes([yAxis]);
                chart.yAxes([yAxis]);

                //Then:
                expect(chart.yAxes()).toEqual([yAxis]);
            });
    });

    describe('resizeWidth', function() {

        var chart, element;

        beforeEach(function() {

            element = document.createElement('div');
            element.id = 'testElement';
            document.body.appendChild(element);

            chart = new insight.Chart('name', '#testElement');
            chart.draw();

            spyOn(chart, 'resizeChart');
            spyOn(chart, 'draw');
        });

        afterEach(function() {

            element.parentNode.removeChild(element);

        });

        it('sets width if less than current width and greater than minimum width', function() {

            // Arrange
            chart.width(750);
            chart.minWidth(150);

            // Act
            chart.resizeWidth(200);

            // Assert
            expect(chart.width()).toBe(200);
            expect(chart.draw).toHaveBeenCalled();

        });

        it('sets width to minimum if less than current width and less than minimum width', function() {

            // Arrange
            chart.width(750);
            chart.minWidth(150);

            // Act
            chart.resizeWidth(10);

            // Assert
            expect(chart.width()).toBe(150);
            expect(chart.draw).toHaveBeenCalled();

        });

        it('sets width if greater than current width and less than maximum width', function() {

            // Arrange
            chart.width(180);
            chart.maxWidth(800);

            // Act
            chart.resizeWidth(300);

            // Assert
            expect(chart.width()).toBe(300);
            expect(chart.draw).toHaveBeenCalled();

        });

        it('sets width to maximum if greater than current width and greater than maximum width', function() {

            // Arrange
            chart.width(100);
            chart.maxWidth(150);

            // Act
            chart.resizeWidth(360);

            // Assert
            expect(chart.width()).toBe(150);
            expect(chart.draw).toHaveBeenCalled();

        });

        it('doesn\'t resize or redraw if chart width is minimum and greater than window width', function() {

            // Arrange
            chart.width(100);
            chart.minWidth(100);

            // Act
            chart.resizeWidth(50);

            // Assert
            expect(chart.width()).toBe(100);
            expect(chart.draw).not.toHaveBeenCalled();

        });

        it('doesn\'t resize or redraw if chart width is maximum and less than window width', function() {

            // Arrange
            chart.width(120);
            chart.maxWidth(120);

            // Act
            chart.resizeWidth(500);

            // Assert
            expect(chart.width()).toBe(120);
            expect(chart.draw).not.toHaveBeenCalled();

        });

    });


    describe('seriesIndexByType', function() {

        var chart,
            seriesData,
            xAxis,
            yAxis;

        beforeEach(function() {

            chart = new insight.Chart('somechart', '#someelement');
            seriesData = [1, 2, 3, 4, 5];

            xAxis = new insight.Axis('x', insight.Scales.Linear);
            yAxis = new insight.Axis('y', insight.Scales.Linear);

        });

        it('returns -1 if no series in chart', function() {

            // Given
            var series = new insight.BubbleSeries('bubbles', seriesData, xAxis, yAxis);

            chart.series([]);

            // When
            var result = chart.seriesIndexByType(series);

            // Then
            expect(result).toBe(-1);

        });

        it('returns -1 if series not in chart', function() {

            // Given
            var targetSeries = new insight.BubbleSeries('bubbles', seriesData, xAxis, yAxis);
            var otherSeries = new insight.BubbleSeries('someOtherSeries', seriesData, xAxis, yAxis);

            chart.series([otherSeries]);

            // When
            var result = chart.seriesIndexByType(targetSeries);

            // Then
            expect(result).toBe(-1);

        });

        it('returns 0 if target series is the only series in the chart', function() {

            // Given
            var targetSeries = new insight.BubbleSeries('bubbles', seriesData, xAxis, yAxis);

            chart.series([targetSeries]);

            // When
            var result = chart.seriesIndexByType(targetSeries);

            // Then
            expect(result).toBe(0);

        });

        it('returns 0 if target series is the first series of its type in the chart', function() {

            // Given
            var bubbleSeries = new insight.BubbleSeries('bubbles', seriesData, xAxis, yAxis);
            var lineSeries = new insight.LineSeries('line', seriesData, xAxis, yAxis);

            chart.series([lineSeries, bubbleSeries]);

            // When
            var result = chart.seriesIndexByType(bubbleSeries);

            // Then
            expect(result).toBe(0);

        });

        it('returns 1 if target series is the second series of its type in the chart', function() {

            // Given
            var bubbleSeries = new insight.BubbleSeries('bubbles', seriesData, xAxis, yAxis);
            var moreBubbles = new insight.BubbleSeries('moreBubbles', seriesData, xAxis, yAxis);
            var lineSeries = new insight.LineSeries('bubbles', seriesData, xAxis, yAxis);

            chart.series([moreBubbles, lineSeries, bubbleSeries]);

            // When
            var result = chart.seriesIndexByType(bubbleSeries);

            // Then
            expect(result).toBe(1);

        });

    });

});
