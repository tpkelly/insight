
var data = [
    {key:'a', value:0, date: new Date(2014,0,1)},
    {key:'b', value:3, date: new Date(2014,0,3)}, 
    {key:'c', value:12, date: new Date(2014,0,2)}, 
    {key:'d', value:20, date: new Date(2014,0,14)}, 
    {key:'e', value:13, date: new Date(2013,4,15)}
];


describe('Axis Tests', function() {
    
    it('label getter works after initialization', function() {
        
        //Given:
        var chart = new insight.Chart('test', '#test', 'ada');
        var axis = new insight.Axis(chart, 'Value Axis', 'h', insight.Scales.Linear, 'bottom');

        //Then:
        var observedLabel = axis.label();
        var expectedLabel = 'Value Axis';
        expect(observedLabel).toBe(expectedLabel);
        
    });


    it('horizontal getter works', function() {
        
        //Given:
        var chart = new insight.Chart('test', '#test', 'ada');
        var axis = new insight.Axis(chart, 'Value Axis', 'h', insight.Scales.Linear, 'bottom');

        //Then:
        var observedResult = axis.horizontal();
        var expectedResult = true;
        expect(observedResult).toBe(expectedResult);
        
    });

    it('vertical getter works', function() {
        
        //Given:
        var chart = new insight.Chart('test', '#test', 'ada');
        var axis = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Linear, 'bottom');

        //Then:
        var observedResult = axis.vertical();
        var expectedResult = true;
        expect(observedResult).toBe(expectedResult);
    });

    it('will be displayed by default', function() {
        
        //Given:
        var chart = new insight.Chart('test', '#test', 'ada');
        var axis = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Linear, 'bottom');

        //Then:
        var observedResult = axis.display();
        var expectedResult = true;
        expect(observedResult).toBe(expectedResult);
    });

    it('can be set to not be displayed', function() {
        
        //Given:
        var chart = new insight.Chart('test', '#test', 'ada');
        var axis = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Linear, 'bottom')
                              .display(false);

        //Then:
        var observedResult = axis.display();
        var expectedResult = false;
        expect(observedResult).toBe(expectedResult);
    });

    it('not ordered by default', function() {
        
        //Given:
        var chart = new insight.Chart('test', '#test', 'ada');
        var axis = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Linear, 'bottom');

        //Then:
        var observedResult = axis.ordered();
        var expectedResult = false;
        expect(observedResult).toBe(expectedResult);
    });


    it('ordering setter works', function() {
        
        //Given:
        var chart = new insight.Chart('test', '#test', 'ada');
        var axis = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Linear, 'bottom')
                              .ordered(true);

        //Then:
        var observedResult = axis.ordered();
        var expectedResult = true;
        expect(observedResult).toBe(expectedResult);
    });


    it('calculates min and max of linear domain', function() {
        
        //Given:
        var dataset = new insight.DataSet(data);
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(300)
                               .height(400)
                               .margin({top:50, left:30, right: 50, bottom:50});

        var x = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Ordinal, 'left');
        var y = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Linear, 'left');

        var series = new insight.ColumnSeries('chart', chart, dataset, x, y, 'blue')
                                .valueFunction(function(d){return d.value;});

        //Then:
        var observedResult = y.domain();
        var expectedResult = [0, 20];

        expect(observedResult).toEqual(expectedResult);
    });

    it('calculates values of ordinal domain', function() {
        
        //Given:
        var dataset = new insight.DataSet(data);
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(300)
                               .height(400)
                               .margin({top:50, left:30, right: 50, bottom:50});

        var x = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Ordinal, 'left');
        var y = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Linear, 'left');

        var series = new insight.ColumnSeries('chart', chart, dataset, x, y, 'blue')
                                .valueFunction(function(d){return d.value;});

        //Then:
        var observedResult = x.domain();
        var expectedResult = ['a','b','c','d','e'];

        expect(observedResult).toEqual(expectedResult);
    });

    it('calculates min max values of time scale', function() {
        
        //Given:
        var dataset = new insight.DataSet(data);
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(300)
                               .height(400)
                               .margin({top:50, left:30, right: 50, bottom:50});

        var x = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Time, 'left');
        var y = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Linear, 'left');

        var series = new insight.ColumnSeries('chart', chart, dataset, x, y, 'blue')
                                .keyFunction(function(d){return d.date;});

        //Then:
        var observedResult = x.domain();
        var expectedResult = [new Date(2013,4,15), new Date(2014,0,14)];

        expect(observedResult).toEqual(expectedResult);
    });


    it('calculates bounds for a vertical column series, with zero margin', function() {
        
        //Given:
        var dataset = new insight.DataSet(data);
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(300)
                               .height(400)
                               .margin({top:0, left:0, right: 0, bottom:0});

        var x = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Ordinal, 'left');
        var y = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Linear, 'left');

        var series = new insight.ColumnSeries('chart', chart, dataset, x, y, 'blue');

        //Then: (origin of SVG is top left, hence starting at the height of the chart)
        var observedResult = y.calculateBounds();
        var expectedResult = [400, 0];

        expect(observedResult).toEqual(expectedResult);
    });

    it('calculates bounds for a vertical linear scale, with a margin', function() {
        
        //Given:
        var dataset = new insight.DataSet(data);
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(300)
                               .height(400)
                               .margin({top:50, left:0, right: 0, bottom:100});

        var x = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Ordinal, 'left');
        var y = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Linear, 'left');

        var series = new insight.ColumnSeries('chart', chart, dataset, x, y, 'blue');

        //Then:
        var observedResult = y.calculateBounds();
        var expectedResult = [250, 0];

        expect(observedResult).toEqual(expectedResult);
    });

    it('calculates output bounds for a horizontal scale, with no margin', function() {
        
        //Given:
        var dataset = new insight.DataSet(data);
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(400)
                               .height(300)
                               .margin({top:0, left:0, right: 0, bottom:0});

        var x = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Linear, 'left');
        var y = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Ordinal, 'left');

        var series = new insight.RowSeries('chart', chart, dataset, x, y, 'blue');

        //Then:
        var observedResult = x.calculateBounds();
        var expectedResult = [0, 400];

        expect(observedResult).toEqual(expectedResult);
    });

    it('calculates output bounds for a horizontal scale, with a margin', function() {
        
        //Given:
        var dataset = new insight.DataSet(data);
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(400)
                               .height(300)
                               .margin({top:0, left:100, right: 10, bottom:0});

        var x = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Linear, 'left');
        var y = new insight.Axis(chart, 'Value Axis', 'v', insight.Scales.Ordinal, 'left');

        var series = new insight.RowSeries('chart', chart, dataset, x, y, 'blue');

        //Then:
        var observedResult = x.calculateBounds();
        var expectedResult = [0, 290];

        expect(observedResult).toEqual(expectedResult);
    });

    it('bottom anchored horizontal axis is positioned correctly', function() {
        
        //Given:        
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(400)
                               .height(300)
                               .margin({top:0, left:0, right: 0, bottom:0});

        var x = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Linear, 'bottom');
        
        //Then:
        var observedResult = x.axisPosition();
        var expectedResult = 'translate(0,300)';

        expect(observedResult).toEqual(expectedResult);
    });

    it('bottom anchored horizontal axis is positioned correctly with margin', function() {
        
        //Given:        
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(400)
                               .height(300)
                               .margin({top:10, left:100, right: 10, bottom:50});

        var x = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Linear, 'bottom');
        
        //Then:
        var observedResult = x.axisPosition();
        var expectedResult = 'translate(0,240)';

        expect(observedResult).toEqual(expectedResult);
    });

    it('top anchored horizontal axis is positioned correctly with no margin', function() {
        
        //Given:        
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(400)
                               .height(300)
                               .margin({top:0, left:0, right: 0, bottom:0});

        var x = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Linear, 'top');
        
        //Then:
        var observedResult = x.axisPosition();
        var expectedResult = 'translate(0,0)';

        expect(observedResult).toEqual(expectedResult);
    });

    it('left anchored vertical axis is positioned correctly with no margin', function() {
        
        //Given:        
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(400)
                               .height(300)
                               .margin({top:0, left:0, right: 0, bottom:0});

        var y = new insight.Axis(chart, 'Key Axis', 'v', insight.Scales.Linear, 'left');
        
        //Then:
        var observedResult = y.axisPosition();
        var expectedResult = 'translate(0,0)';

        expect(observedResult).toEqual(expectedResult);
    });

    it('right anchored vertical axis is positioned correctly with no margin', function() {
        
        //Given:        
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(400)
                               .height(300)
                               .margin({top:0, left:0, right: 0, bottom:0});

        var y = new insight.Axis(chart, 'Key Axis', 'v', insight.Scales.Linear, 'right');
        
        //Then:
        var observedResult = y.axisPosition();
        var expectedResult = 'translate(400,0)';

        expect(observedResult).toEqual(expectedResult);
    });

    it('right anchored vertical axis is positioned correctly with margin', function() {
        
        //Given:        
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(400)
                               .height(300)
                               .margin({top:0, left:10, right: 40, bottom:0});

        var y = new insight.Axis(chart, 'Key Axis', 'v', insight.Scales.Linear, 'right');
        
        //Then:
        var observedResult = y.axisPosition();
        var expectedResult = 'translate(350,0)';

        expect(observedResult).toEqual(expectedResult);
    });

    it('no tick label rotation by default', function() {
        
        //Given:        
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(400)
                               .height(300)
                               .margin({top:0, left:10, right: 40, bottom:0});

        var y = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Linear, 'bottom');
        
        //Then:
        var observedResult = y.tickRotationTransform();
        var expectedResult = '';

        expect(observedResult).toEqual(expectedResult);
    });


    it('no  label rotation by default', function() {
        
        //Given:        
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(400)
                               .height(300)
                               .margin({top:0, left:10, right: 40, bottom:0});

        var y = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Linear, 'bottom');
        
        //Then:
        var observedResult = y.tickRotationTransform();
        var expectedResult = '';

        expect(observedResult).toEqual(expectedResult);
    });

    it('default label rotation when top to bottom specified', function() {
        
        //Given:        
        var chart = new insight.Chart('test', '#test', 'ada')
                               .width(400)
                               .height(300)
                               .margin({top:0, left:10, right: 40, bottom:0});

        var y = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Linear, 'bottom')
                           .tickOrientation('tb')
                           .tickSize(0);
        
        //Then:
        var observedResult = y.tickRotationTransform();
        var expectedResult = ' rotate(90,0,10)';

        expect(observedResult).toEqual(expectedResult);
    });

    describe('Gridlines', function() {

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
            var chart = new insight.Chart('test', '#test', 'ada')
                .width(400)
                .height(300)
                .margin({top: 0, left: 10, right: 40, bottom: 0});

            var y = new insight.Axis(chart, 'Key Axis', 'h', insight.Scales.Linear, 'bottom')
                .tickOrientation('tb')
                .tickSize(0);

            //Then:
            var gridlinesVisible = y.showGridlines();
            expect(gridlinesVisible).toBe(false);
        });

        it('no gridlines when gridlines are hidden', function () {
            //Given:
            insight.init();
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

            var x = new insight.Axis(chart, 'ValueAxis', 'h', insight.Scales.Linear, 'bottom')
                .tickOrientation('lr');

            var y = new insight.Axis(chart, 'KeyAxis', 'v', insight.Scales.Linear, 'left')
                .tickOrientation('lr')
                .showGridlines(false);

            var data = new insight.DataSet([
                {"key": 1, "value": 1},
                {"key": 2, "value": 2},
                {"key": 3, "value": 3}
            ]);
            var lineSeries = new insight.LineSeries('line', chart, data, x, y);
            chart.series([lineSeries]);

            insight.drawCharts();
            removeChartElement();

            //Then:
            // One per tickmark, between 0 and 3 by 0.5 steps (inclusive).
            expect(y.gridlines.allGridlines()).toBeCloseTo([]);
        });

        it('multiple gridlines when gridlines are visible', function () {
            //Given:
            insight.init();
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

            var x = new insight.Axis(chart, 'ValueAxis', 'h', insight.Scales.Linear, 'bottom')
                .tickOrientation('lr');

            var y = new insight.Axis(chart, 'KeyAxis', 'v', insight.Scales.Linear, 'left')
                .tickOrientation('lr')
                .showGridlines(true);

            var data = new insight.DataSet([
                {"key": 1, "value": 1},
                {"key": 2, "value": 2},
                {"key": 3, "value": 3}
            ]);
            var lineSeries = new insight.LineSeries('line', chart, data, x, y);
            chart.series([lineSeries]);

            insight.drawCharts();
            removeChartElement();

            //Then:
            // One per tickmark, between 0 and 3 by 0.5 steps (inclusive).
            expect(y.gridlines.allGridlines()[0].length).toEqual(7);
        });

    });
});
