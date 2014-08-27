/**
 * Created by tkelly on 03/07/2014.
 */

 var bubbleDataSet = 
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


describe('Bubble Series Tests', function() {

    it('Points with same radius have radius greater than 0', function () {
        //Given:
        var data = [{x:0, y:0, radius:2},
                    {x:5, y:3, radius:2},
                    {x:3, y:5, radius:2}];
        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Bubble Chart', '#chart')
            .width(250)
            .height(250);

        var xAxis = new insight.Axis('', insight.Scales.Linear, 'bottom');
        var yAxis = new insight.Axis('', insight.Scales.Linear, 'left');
        chart.addXAxis(xAxis);
        chart.addYAxis(yAxis);

        var series = new insight.BubbleSeries('BubbleSeries', dataset, xAxis, yAxis)
            .radiusFunction(function(d) {
                return d.radius;
            });
        chart.series([series]);

        //When:
        xAxis.updateAxisBounds(chart);
        yAxis.updateAxisBounds(chart);
        var bubbleData = series.bubbleData(series.dataset());

        //Then:
        var radii = bubbleData.map(function(d) {
            return d.radius;
        })

        // Max pixel radius = 25 (width:250 / 10)
        // Radius = 25 (max pixel radius) * 2 (current radius) / 2 (max radius in set)
        expect(radii).toEqual([25, 25, 25]);
    });

    it('Points with 0 radius have radius of 0', function () {
        //Given:
        var data = [{x:0, y:0, radius:0},
                    {x:5, y:3, radius:0},
                    {x:3, y:5, radius:0}];
        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Bubble Chart', '#chart')
            .width(250)
            .height(250);

        var xAxis = new insight.Axis('', insight.Scales.Linear);
        var yAxis = new insight.Axis('', insight.Scales.Linear);
        chart.addXAxis(xAxis);
        chart.addYAxis(yAxis);

        var series = new insight.BubbleSeries('BubbleSeries', dataset, xAxis, yAxis)
            .radiusFunction(function(d) {
                return d.radius;
            });
        chart.series([series]);

        //When:
        xAxis.updateAxisBounds(chart);
        yAxis.updateAxisBounds(chart);
        var bubbleData = series.bubbleData(series.dataset());

        //Then:
        var radii = bubbleData.map(function(d) {
            return d.radius;
        })
        expect(radii).toEqual([0, 0, 0]);
    });

    it('Points with different radius have proportional radii', function () {
        //Given:
        var data = [{x:0, y:0, radius:5},
                    {x:5, y:3, radius:1},
                    {x:3, y:5, radius:2}];
        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Bubble Chart', '#chart')
            .width(250)
            .height(250);

        var xAxis = new insight.Axis('', insight.Scales.Linear);
        var yAxis = new insight.Axis('', insight.Scales.Linear);
        chart.addXAxis(xAxis);
        chart.addYAxis(yAxis);

        var series = new insight.BubbleSeries('BubbleSeries', dataset, xAxis, yAxis)
            .radiusFunction(function(d) {
                return d.radius;
            });
        chart.series([series]);

        //When:
        xAxis.updateAxisBounds(chart);
        yAxis.updateAxisBounds(chart);
        xAxis.bounds = chart.calculatePlotAreaSize();
        var bubbleData = series.bubbleData(series.dataset());

        //Then:
        var radii = bubbleData.map(function(d) {
            return d.radius;
        })

        //Largest is 25px, the rest are proportional to the size of the largest
        //Also returned in descending order, to display the smallest points on top.
        expect(radii).toEqual([25, 10, 5]);
    });

    it('BubbleSeries item class values are correct', function() {
        
        //Given 

        var data = new insight.DataSet(bubbleDataSet);

        var chart = new insight.Chart('Chart 1', '#chart1');
                
        var group =  data.group('country', function(d){return d.Country;})
                         .mean(['Age']);

        var xScale = new insight.Axis('Country', insight.Scales.Ordinal);
        var yScale = new insight.Axis('Stuff', insight.Scales.Linear);
        
        chart.addXAxis(xScale);
        chart.addYAxis(yScale);

        var series = new insight.BubbleSeries('countryBubbles', group, xScale, yScale)
                                .radiusFunction(function(d) {
                                    return d.radius;
                                });
        // When
        series.rootClassName = series.seriesClassName();

        // Then
        var actualData = series.dataset().map(function(data){ return series.itemClassName(data); });
        var expectedData = [
                            'countryBubblesclass bubble in_England',
                            'countryBubblesclass bubble in_Northern_Ireland',
                            'countryBubblesclass bubble in_Scotland',
                            'countryBubblesclass bubble in_Wales',
                            ];

        expect(actualData).toEqual(expectedData);

    });
});