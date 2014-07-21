/**
 * Created by tkelly on 01/07/2014.
 */

describe("Series Tests", function(){

    var chart;
    var xScale;
    var yScale;

    beforeEach(function() {
        chart = new insight.Chart('Chart', '#chart');
        xScale = new insight.Axis('x-axis', insight.Scales.Linear, 'bottom');
        yScale = new insight.Axis('y-axis', insight.Scales.Linear, 'left');
        chart.addXAxis(xScale);
        chart.addYAxis(yScale);
    });

   it("Dataset is empty when no data given", function(){
       //Given:
       var data = new insight.DataSet([]);
       var series = new insight.Series('Test series', data, xScale, yScale, 'red');

       //Then:
       var expectedData = [];
       var observedData = series.dataset();
       expect(observedData).toEqual(expectedData);
   });

    it("Dataset is not ordered by default", function(){
        //Given:
        var data = new insight.DataSet([3, 1, 5, 1, 4, 6]);
        var series = new insight.Series('Test series', data, xScale, yScale, 'red');

        //Then:
        var expectedData = [3, 1, 5, 1, 4, 6];
        var observedData = series.dataset();
        expect(observedData).toEqual(expectedData);
    });

    it("Dataset can be ordered", function(){
        //Given:
        xScale.ordered(true);
        var data = new insight.DataSet([3, 1, 5, 1, 4, 6]);
        var series = new insight.Series('Test series', data, xScale, yScale, 'red');

        //Then:
        var expectedData = [3, 1, 5, 1, 4, 6];
        var observedData = series.dataset();
        expect(observedData).toEqual(expectedData);
    });

    it("Dataset can be filtered", function(){
        //Given:
        var data = new insight.DataSet([3, 1, 5, 1, 4, 6]);
        var series = new insight.Series('Test series', data, xScale, yScale, 'red').filterFunction(function(d){return d > 3});

        //Then:
        var expectedData = [5, 4, 6];
        var observedData = series.dataset();
        expect(observedData).toEqual(expectedData);
    });

    it("All values can be filtered", function(){
        //Given:
        var data = new insight.DataSet([3, 1, 5, 1, 4, 6]);
        var series = new insight.Series('Test series', data, xScale, yScale, 'red').filterFunction(function(d){return d > 6});

        //Then:
        var expectedData = [];
        var observedData = series.dataset();
        expect(observedData).toEqual(expectedData);
    });

/*  Currently failing: Need to think about how to react to data which is just a series of numbers or strings or dates,
                       without providing a valueFunction or keyFunction.

    it("Last value can be extracted", function(){
        //Given:
        var chart = new insight.Chart('Chart', '#chart');
        var xScale = new insight.Scale(chart, 'x-axis', 'h', insight.Scales.Linear);
        var yScale = new insight.Scale(chart, 'y-axis', 'v', insight.Scales.Linear);

        var data = new insight.DataSet([3, 1, 5, 1, 7, 6]);
        var series = new insight.Series('Test series', chart, data, xScale, yScale, 'red');

        //Then:
        var expectedMaximum = 6;
        var observedMaximum = series.findMax(xScale);
        expect(observedMaximum).toEqual(expectedMaximum);
    });

    it("Maximum value can be extracted", function(){
        //Given:
        var chart = new insight.Chart('Chart', '#chart');
        var xScale = new insight.Scale(chart, 'x-axis', 'h', insight.Scales.Linear);
        var yScale = new insight.Scale(chart, 'y-axis', 'v', insight.Scales.Linear);

        var data = new insight.DataSet([3, 1, 5, 1, 7, 6]);
        var series = new insight.Series('Test series', chart, data, xScale, yScale, 'red');

        //Then:
        var expectedMaximum = 7;
        var observedMaximum = series.findMax(yScale);
        expect(observedMaximum).toEqual(expectedMaximum);
    });*/
});
