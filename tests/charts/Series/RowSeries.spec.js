var rowdata = 
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


describe('Row Series Tests', function() {
    
    
    it('correctly places a single row series', function() {
        
        var chart = new insight.Chart('Chart 1', '#chart1');
        
        var dataset = new insight.DataSet(rowdata);        
       
        var group =  dataset.group('country',function(d){return d.Country;});

        var xScale = new insight.Axis('Values', insight.scales.ordinal);
        var yScale = new insight.Axis('Keys', insight.scales.linear);
        chart.addXAxis(xScale);
        chart.addYAxis(yScale);

        var series = new insight.RowSeries('countryColumn', group, xScale, yScale)
                            .valueFunction(function(d){return d.value.Count;});        
        
    });

    it('RowSeries item class values are correct', function() {
        
        //Given 

        var data = new insight.DataSet(rowdata);

        var chart = new insight.Chart('Chart 1', '#chart1');
                
        var group =  data.group('country', function(d){return d.Country;})
                         .mean(['Age']);

        var xScale = new insight.Axis('Country', insight.scales.ordinal);
        var yScale = new insight.Axis('Stuff', insight.scales.linear);
        
        chart.addXAxis(xScale);
        chart.addYAxis(yScale);

        var series = new insight.RowSeries('countryRows', group, xScale, yScale)
                                .valueFunction(function(d){ return d.Country; });
        // When 
        
        series.currentSeries = {name: 'default', accessor: function(d){ return d.Country; }};
        series.rootClassName = series.seriesClassName();

        // Then
        var actualData = series.dataset().map(function(data){ return series.itemClassName(data); });
        var expectedData = [
                            'countryRowsclass ' + insight.constants.RowClass + ' in_England',
                            'countryRowsclass ' + insight.constants.RowClass + ' in_Northern_Ireland',
                            'countryRowsclass ' + insight.constants.RowClass + ' in_Scotland',
                            'countryRowsclass ' + insight.constants.RowClass + ' in_Wales'
                            ];

        expect(actualData).toEqual(expectedData);

    });

    describe('findMax', function() {

        var xAxis,
            yAxis,
            series;

        beforeEach(function() {

            xAxis = new insight.Axis('x', insight.scales.linear);
            yAxis = new insight.Axis('y', insight.scales.ordinal);

            var dataset = new insight.DataSet(rowdata);
            var countryGroup = dataset.group('countries', function(d) { return d.Country; });

            series = new insight.RowSeries('columns', countryGroup, xAxis, yAxis)
                .keyFunction(function(group) {
                    return group.key;
                })
                .valueFunction(function(group) {
                    return group.value.Count;
                });

        });

        it('returns maximum value on y-axis', function() {

            // When
            var result = series.findMax(yAxis);

            // Then
            expect(result).toBe('Wales');

        });

        it('returns maximum value on x-axis', function() {

            // When
            var result = series.findMax(xAxis);

            // Then
            expect(result).toBe(7);

        });

    });

    describe('sorts data in descending value order', function() {

        var xAxis,
            yAxis,
            series;

        beforeEach(function () {

            xAxis = new insight.Axis('x', insight.scales.ordinal)
                .isOrdered(true);
            yAxis = new insight.Axis('y', insight.scales.linear);

            var dataset = new insight.DataSet([
                {key: "A", value: 3},
                {key: "B", value: 1},
                {key: "C", value: 5},
                {key: "D", value: 1},
                {key: "E", value: 4},
                {key: "F", value: 6}
            ]);


            series = new insight.ColumnSeries('columns', dataset, xAxis, yAxis);;
        });

        it('descending by default', function () {

            // When
            var observedData = series.dataset();

            // Then
            var keys = observedData.map(series.keyFunction());
            var values = observedData.map(series.valueFunction());
            expect(keys).toEqual(["F", "C", "E", "A", "B", "D"]);
            expect(values).toEqual([6, 5, 4, 3, 1, 1]);

        });

    });

});
