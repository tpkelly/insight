/**
 * Created by tkelly on 01/07/2014.
 */


var seriesDataSet =
    [{'Id':1,'Forename':'Martin','Surname':'Watkins','Country':'Scotland','DisplayColour':'#38d33c','Age':1,'IQ':69},
        {'Id':2,'Forename':'Teresa','Surname':'Knight','Country':'Scotland','DisplayColour':'#6ee688','Age':20,'IQ':103},
        {'Id':3,'Forename':'Mary','Surname':'Lee','Country':'Wales','DisplayColour':'#8e6bc2','Age':3,'IQ':96},
        {'Id':4,'Forename':'Sandra','Surname':'Harrison','Country':'Northern Ireland','DisplayColour':'#02acd0','Age':16,'IQ':55},
        {'Id':5,'Forename':'Frank','Surname':'Cox','Country':'England','DisplayColour':'#0b281c','Age':5,'IQ':105},
        {'Id':6,'Forename':'Mary','Surname':'Jenkins','Country':'England','DisplayColour':'#5908e3','Age':19,'IQ':69},
        {'Id':7,'Forename':'Earl','Surname':'Stone','Country':'Wales','DisplayColour':'#672542','Age':6,'IQ':60},
        {'Id':8,'Forename':'Ashley','Surname':'Carr','Country':'England','DisplayColour':'#f9874f','Age':18,'IQ':63},
        {'Id':9,'Forename':'Judy','Surname':'Mcdonald','Country':'Northern Ireland','DisplayColour':'#3ab1a8','Age':2,'IQ':70},
        {'Id':10,'Forename':'Earl','Surname':'Flores','Country':'England','DisplayColour':'#1be47c','Age':20,'IQ':93},
        {'Id':11,'Forename':'Terry','Surname':'Wheeler','Country':'Wales','DisplayColour':'#2cd57b','Age':4,'IQ':87},
        {'Id':12,'Forename':'Willie','Surname':'Reid','Country':'Northern Ireland','DisplayColour':'#7fcf1e','Age':7,'IQ':86},
        {'Id':13,'Forename':'Deborah','Surname':'Palmer','Country':'Northern Ireland','DisplayColour':'#9fd1d5','Age':5,'IQ':85},
        {'Id':14,'Forename':'Annie','Surname':'Jordan','Country':'England','DisplayColour':'#8f4fd1','Age':10,'IQ':100},
        {'Id':15,'Forename':'Craig','Surname':'Gibson','Country':'England','DisplayColour':'#111ab4','Age':7,'IQ':106},
        {'Id':16,'Forename':'Lisa','Surname':'Parker','Country':'England','DisplayColour':'#52d5cf','Age':18,'IQ':53},
        {'Id':17,'Forename':'Samuel','Surname':'Willis','Country':'Wales','DisplayColour':'#e2f6cc','Age':11,'IQ':98},
        {'Id':18,'Forename':'Lisa','Surname':'Chapman','Country':'Northern Ireland','DisplayColour':'#1c5829','Age':7,'IQ':51},
        {'Id':19,'Forename':'Ryan','Surname':'Freeman','Country':'Scotland','DisplayColour':'#6cbc04','Age':12,'IQ':96},
        {'Id':20,'Forename':'Frances','Surname':'Lawson','Country':'Northern Ireland','DisplayColour':'#e739c9','Age':14,'IQ':71}];

describe("Series", function(){

    var chart;
    var xAxis;
    var yAxis;

    describe('dataset', function() {

        beforeEach(function() {
            chart = new insight.Chart('Chart', '#chart');
            xAxis = new insight.Axis('x-axis', insight.Scales.Linear, 'bottom');
            yAxis = new insight.Axis('y-axis', insight.Scales.Linear, 'left');
            chart.addXAxis(xAxis);
            chart.addYAxis(yAxis);
        });

        it("returns empty when no data given", function(){
            //Given:
            var data = new insight.DataSet([]);
            var series = new insight.Series('Test series', data, xAxis, yAxis, 'red');

            //Then:
            var expectedData = [];
            var observedData = series.dataset();
            expect(observedData).toEqual(expectedData);
        });

        it("returns un-ordered data by default", function(){
            //Given:
            var data = new insight.DataSet([3, 1, 5, 1, 4, 6]);
            var series = new insight.Series('Test series', data, xAxis, yAxis, 'red');

            //Then:
            var expectedData = [3, 1, 5, 1, 4, 6];
            var observedData = series.dataset();
            expect(observedData).toEqual(expectedData);
        });

        it("returns ordered data if an orderFunction is provided with an insight.DataSet", function(){

            // Given:
            var data = new insight.DataSet([3, 1, 5, 1, 4, 6]);
            var series = new insight.Series('Test series', data, xAxis, yAxis, 'red');

            var orderFunction = function(a, b) {
                return a - b;
            };

            // Then:
            var expectedData = [1, 1, 3, 4, 5, 6];
            var observedData = series.dataset(orderFunction);
            expect(observedData).toEqual(expectedData);

        });

        it("returns ordered data if an orderFunction is provided without a plain array", function(){

            // Given:
            var data = [12, 3, 672, 45, 8];
            var series = new insight.Series('Test series', data, xAxis, yAxis, 'red');

            var orderFunction = function(a, b) {
                return a - b;
            };

            // Then:
            var expectedData = [3, 8, 12, 45, 672];
            var observedData = series.dataset(orderFunction);
            expect(observedData).toEqual(expectedData);

        });

        it("returns filtered data if given a filterFunction", function(){
            //Given:
            var data = new insight.DataSet([3, 1, 5, 1, 4, 6]);
            var series = new insight.Series('Test series', data, xAxis, yAxis, 'red').filterFunction(function(d){return d > 3});

            //Then:
            var expectedData = [5, 4, 6];
            var observedData = series.dataset();
            expect(observedData).toEqual(expectedData);
        });

        it("returns empty if all data is filtered by the filterFunction", function(){
            //Given:
            var data = new insight.DataSet([3, 1, 5, 1, 4, 6]);
            var series = new insight.Series('Test series', data, xAxis, yAxis, 'red').filterFunction(function(d){return d > 6});

            //Then:
            var expectedData = [];
            var observedData = series.dataset();
            expect(observedData).toEqual(expectedData);
        });
    });



   

/*  Currently failing: Need to think about how to react to data which is just a series of numbers or strings or dates,
                       without providing a valueFunction or keyFunction.

    it("Last value can be extracted", function(){
        //Given:
        var chart = new insight.Chart('Chart', '#chart');
        var xAxis = new insight.Scale(chart, 'x-axis', 'h', insight.Scales.Linear);
        var yAxis = new insight.Scale(chart, 'y-axis', 'v', insight.Scales.Linear);

        var data = new insight.DataSet([3, 1, 5, 1, 7, 6]);
        var series = new insight.Series('Test series', chart, data, xAxis, yAxis, 'red');

        //Then:
        var expectedMaximum = 6;
        var observedMaximum = series.findMax(xAxis);
        expect(observedMaximum).toEqual(expectedMaximum);
    });

    it("Maximum value can be extracted", function(){
        //Given:
        var chart = new insight.Chart('Chart', '#chart');
        var xAxis = new insight.Scale(chart, 'x-axis', 'h', insight.Scales.Linear);
        var yAxis = new insight.Scale(chart, 'y-axis', 'v', insight.Scales.Linear);

        var data = new insight.DataSet([3, 1, 5, 1, 7, 6]);
        var series = new insight.Series('Test series', chart, data, xAxis, yAxis, 'red');

        //Then:
        var expectedMaximum = 7;
        var observedMaximum = series.findMax(yAxis);
        expect(observedMaximum).toEqual(expectedMaximum);
    });*/


    it('Series does selection by group key value', function() {
        //Given:
        var xScale = new insight.Axis('Country', insight.Scales.Ordinal);
        var yScale = new insight.Axis('Stuff', insight.Scales.Linear);
        var series = new insight.Series('country', seriesDataSet, xScale, yScale, 'silver')
            .groupKeyFunction(function(d) {
                return d.Surname;
            });

        //Then:
        var selectionClassName = series.itemClassName(seriesDataSet[0]);
        expect(selectionClassName).toBe(series.seriesClassName() + ' ' + insight.Utils.keySelector('Watkins'));
    });
});
