describe('ChartGroup', function() {

    var sourceData = 
        [{'Id':1,'Forename':'Martin','Surname':'Watkins','Country':'Scotland','DisplayColour':'#38d33c','Age':1,'IQ':69,'Gender':'Male','Interests':['Ballet', 'Music', 'Climbing'],},
        {'Id':2,'Forename':'Teresa','Surname':'Knight','Country':'Scotland','DisplayColour':'#6ee688','Age':20,'IQ':103,'Interests':['Triathlon', 'Music', 'Mountain Biking'],'Gender':'Female'},
        {'Id':3,'Forename':'Mary','Surname':'Lee','Country':'Wales','DisplayColour':'#8e6bc2','Age':3,'IQ':96,'Interests':['Triathlon', 'Music', 'Mountain Biking'],'Gender':'Female'},
        {'Id':4,'Forename':'Sandra','Surname':'Harrison','Country':'Northern Ireland','DisplayColour':'#02acd0','Age':16,'IQ':55, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':5,'Forename':'Frank','Surname':'Cox','Country':'England','DisplayColour':'#0b281c','Age':5,'IQ':105,'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Male'},
        {'Id':6,'Forename':'Mary','Surname':'Jenkins','Country':'England','DisplayColour':'#5908e3','Age':19,'IQ':69,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':7,'Forename':'Earl','Surname':'Stone','Country':'Wales','DisplayColour':'#672542','Age':6,'IQ':60,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Male'},
        {'Id':8,'Forename':'Ashley','Surname':'Carr','Country':'England','DisplayColour':'#f9874f','Age':18,'IQ':63,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':9,'Forename':'Judy','Surname':'Mcdonald','Country':'Northern Ireland','DisplayColour':'#3ab1a8','Age':2,'IQ':70,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':10,'Forename':'Earl','Surname':'Flores','Country':'England','DisplayColour':'#1be47c','Age':20,'IQ':93,'Interests':['Climbing', 'Boxing'], 'Gender':'Male'},
        {'Id':11,'Forename':'Terry','Surname':'Wheeler','Country':'Wales','DisplayColour':'#2cd57b','Age':4,'IQ':87,'Interests':['Climbing', 'Boxing'], 'Gender':'Male'},
        {'Id':12,'Forename':'Willie','Surname':'Reid','Country':'Northern Ireland','DisplayColour':'#7fcf1e','Age':7,'IQ':86,'Interests':['Climbing', 'Boxing'], 'Gender':'Male'},
        {'Id':13,'Forename':'Deborah','Surname':'Palmer','Country':'Northern Ireland','DisplayColour':'#9fd1d5','Age':5,'IQ':85,'Interests':['Climbing', 'Boxing'], 'Gender':'Female'},
        {'Id':14,'Forename':'Annie','Surname':'Jordan','Country':'England','DisplayColour':'#8f4fd1','Age':10,'IQ':100, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':15,'Forename':'Craig','Surname':'Gibson','Country':'England','DisplayColour':'#111ab4','Age':7,'IQ':106,'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Male'},
        {'Id':16,'Forename':'Lisa','Surname':'Parker','Country':'England','DisplayColour':'#52d5cf','Age':18,'IQ':53,'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Female'},
        {'Id':17,'Forename':'Samuel','Surname':'Willis','Country':'Wales','DisplayColour':'#e2f6cc','Age':11,'IQ':98, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':18,'Forename':'Lisa','Surname':'Chapman','Country':'Northern Ireland','DisplayColour':'#1c5829','Age':7,'IQ':51, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':19,'Forename':'Ryan','Surname':'Freeman','Country':'Scotland','DisplayColour':'#6cbc04','Age':12,'IQ':96, 'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Male'},
        {'Id':20,'Forename':'Frances','Surname':'Lawson','Country':'Northern Ireland','DisplayColour':'#e739c9','Age':14,'IQ':71, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'}];
   


    var chart,
        table,
        div = document.createElement('div'),
        dataset,
        chartGroup;

    div.id  = 'testChart';

    
    beforeEach(function() {        
    
        document.body.appendChild(div);
        dataset = new insight.DataSet(sourceData);
        chartGroup = new insight.ChartGroup();        
    });

    afterEach(function() {
        document.body.removeChild(div);
    });

    describe('defaults', function() {

        it('dimensions empty', function() {

            expect(chartGroup.dimensions).toEqual([]);

        });

        it('groupings empty', function() {

            expect(chartGroup.groupings).toEqual([]);

        });

        it('filteredDimensions empty', function() {

            expect(chartGroup.filteredDimensions).toEqual([]);

        });

        it('dimensionListenerMap empty', function() {

            expect(chartGroup.dimensionListenerMap).toEqual([]);

        });

        it('tables empty', function() {

            expect(chartGroup.tables).toEqual([]);

        });

        it('charts empty', function() {

            expect(chartGroup.charts).toEqual([]);

        });

    });

    describe('add', function() {

        it('adds a chart with no series', function() {

            // Given
            chart = new insight.Chart('testChart', '#testChart');

            // When
            chartGroup.add(chart);

            // Then
            expect(chartGroup.charts).toEqual([chart]);
            expect(chartGroup.tables).toEqual([]);

        });

        it('adds a table with no series', function() {

            // Given
            table = new insight.Table('testTable', '#testChart');

            // When
            chartGroup.add(table);

            // Then
            expect(chartGroup.tables).toEqual([table]);
            expect(chartGroup.charts).toEqual([]);

        });

        it('adding a chart with multiple series doesn\'t duplicate dimensions or groupings', function() {

            // Given
            chart = new insight.Chart('testChart', '#testChart');

            var countries =  dataset.group('country', function(d){return d.Country;});

            var x = new insight.Axis('Country', insight.Scales.Ordinal);
            var y = new insight.Axis('Values', insight.Scales.Linear);

            chart.xAxis(x);
            chart.yAxis(y);

            var series = new insight.ColumnSeries('columns', countries, x, y)
                .valueFunction(function(d){return d.value.Count;});

            var series2 = new insight.ColumnSeries('columns2', countries, x, y)
                .valueFunction(function(d){return d.value.Count + 1;});

            chart.series([series, series2]);

            // When
            chartGroup.add(chart);

            // Then
            expect(chartGroup.charts).toEqual([chart]);
            expect(chartGroup.dimensions).toEqual([countries.dimension]);
            expect(chartGroup.groupings).toEqual([countries]);
        });

    });

    describe('draw', function() {

        it('draws all charts', function() {

            // Given
            var chart1 = new insight.Chart('testChart', '#testChart'),
                chart2 = new insight.Chart('anotherChart', '#someElement');

            chartGroup.add(chart1);
            chartGroup.add(chart2);

            spyOn(chart1, 'draw');
            spyOn(chart2, 'draw');

            // When
            chartGroup.draw();

            // Then
            expect(chart1.draw).toHaveBeenCalled();
            expect(chart2.draw).toHaveBeenCalled();

        });

        it('redraws all charts', function() {

            // Given
            var chart1 = new insight.Chart('testChart', '#testChart'),
                chart2 = new insight.Chart('anotherChart', '#someElement');

            chartGroup.add(chart1);
            chartGroup.add(chart2);

            spyOn(chart1, 'draw');
            spyOn(chart2, 'draw');

            // When
            chartGroup.draw();
            chartGroup.draw();

            // Then
            expect(chart1.draw.calls.length).toBe(2);
            expect(chart2.draw.calls.length).toBe(2);

        });

        it('draws all tables', function() {

            // Given
            var emptyData = [],
                table1 = new insight.Table('first', '#firstElement', emptyData),
                table2 = new insight.Table('second', '#secondElement', emptyData);

            chartGroup.add(table1);
            chartGroup.add(table2);

            spyOn(table1, 'draw');
            spyOn(table2, 'draw');

            // When
            chartGroup.draw();

            // Then
            expect(table1.draw).toHaveBeenCalled();
            expect(table2.draw).toHaveBeenCalled();

        });

        it('redraws all tables', function() {

            // Given
            var emptyData = [],
                table1 = new insight.Table('first', '#firstElement', emptyData),
                table2 = new insight.Table('second', '#secondElement', emptyData);

            chartGroup.add(table1);
            chartGroup.add(table2);

            spyOn(table1, 'draw');
            spyOn(table2, 'draw');

            // When
            chartGroup.draw();
            chartGroup.draw();

            // Then
            expect(table1.draw.calls.length).toBe(2);
            expect(table2.draw.calls.length).toBe(2);

        });

        it('draws all charts and tables in the same group', function() {

            // Given
            var emptyData = [],
                table1 = new insight.Table('first', '#firstElement', emptyData),
                table2 = new insight.Table('second', '#secondElement', emptyData),
                chart1 = new insight.Chart('testChart', '#testChart'),
                chart2 = new insight.Chart('anotherChart', '#someElement');

            chartGroup.add(table1);
            chartGroup.add(table2);
            chartGroup.add(chart1);
            chartGroup.add(chart2);

            spyOn(table1, 'draw');
            spyOn(table2, 'draw');
            spyOn(chart1, 'draw');
            spyOn(chart2, 'draw');

            // When
            chartGroup.draw();

            // Then
            expect(table1.draw).toHaveBeenCalled();
            expect(table2.draw).toHaveBeenCalled();
            expect(chart1.draw).toHaveBeenCalled();
            expect(chart2.draw).toHaveBeenCalled();

        });

    });

    describe('multiple items', function(){

        var chart,
            chart2,
            x,
            y,
            countries,
            series,
            series2,
            table;

        beforeEach(function(){

            chart = new insight.Chart('testChart', '#testChart');
            countries =  dataset.group('country', function(d){return d.Country;});

            x = new insight.Axis('Country', insight.Scales.Ordinal);
            y = new insight.Axis('Values', insight.Scales.Linear);

            chart.xAxis(x);
            chart.yAxis(y);

            series = new insight.ColumnSeries('columns', countries, x, y)
                .valueFunction(function(d){return d.value.Count;});

            chart.series([series]);


            // second chart
            chart2 = new insight.Chart('AnotherChart', '#testChart2');
            x2 = new insight.Axis('Country', insight.Scales.Ordinal);
            y2 = new insight.Axis('Values', insight.Scales.Linear);

            chart2.xAxis(x2);
            chart2.yAxis(y2);

            series2 = new insight.ColumnSeries('columns', countries, x2, y2)
                .valueFunction(function(d){return d.value.Count;});

            chart2.series([series2]);

            table = new insight.Table('testTable', '#testChart', countries);

            // spy on the initialization of the chart, to make sure it's called
            spyOn(chart, 'draw');
            spyOn(chart2, 'draw');
            spyOn(table, 'draw');

        });

        it('adding multiple items correctly populates the dimension list', function() {

            // Given
            chartGroup.add(chart);
            chartGroup.add(chart2);
            chartGroup.add(table);

            // When
            chartGroup.draw();

            // Then
            var expectedDimensionMap = {'country': [chart, chart2, table]};

            expect(chartGroup.dimensionListenerMap).toEqual(expectedDimensionMap);

        });

        it('drawing a ChartGroup containing multiple items draws each item', function() {

            // Given
            chartGroup.add(chart);
            chartGroup.add(chart2);
            chartGroup.add(table);

            // When
            chartGroup.draw();

            // Then
            expect(chart.draw.calls.length).toEqual(1);
            expect(chart2.draw.calls.length).toEqual(1);
            expect(table.draw.calls.length).toEqual(1);

        });


        it('redrawing a ChartGroup containing multiple items redraws each item', function() {

            // Given
            chartGroup.add(chart);
            chartGroup.add(table);
            chartGroup.add(chart2);

            // When
            chartGroup.draw();
            chartGroup.draw();

            // Then
            expect(chart.draw.calls.length).toEqual(2);
            expect(chart2.draw.calls.length).toEqual(2);
            expect(table.draw.calls.length).toEqual(2);

        });

    });

    describe('filterByGrouping', function() {
        
        var chart,
            x,
            y,
            countries,
            series,
            table;

        beforeEach(function(){

            // Given
            chart = new insight.Chart('testChart', '#testChart');

            countries =  dataset.group('country', function(d){return d.Country;});

            x = new insight.Axis('Country', insight.Scales.Ordinal);
            y = new insight.Axis('Values', insight.Scales.Linear);
            
            chart.xAxis(x);
            chart.yAxis(y);

            series = new insight.ColumnSeries('columns', countries, x, y)
                .valueFunction(function(d){return d.value.Count;});
            
            chart.series([series]);

            table = new insight.Table('testTable', '#testChart', countries);

            // spy on the initialization of the chart, to make sure it's called
            spyOn(chart, 'draw');
            spyOn(chartGroup, 'draw');
            spyOn(table, 'draw');
            spyOn(countries, 'recalculate');
            spyOn(countries.dimension, 'createFilterFunction').andCallThrough();
            spyOn(chart, 'highlight');
            spyOn(table, 'highlight');
            
            chartGroup.add(chart);
            chartGroup.add(table);
            chartGroup.draw();        
            
            // When
            chartGroup.filterByGrouping(countries, 'England');

        });

        it('creates a filter function on each Grouping in the ChartGroup', function() {

            expect(countries.dimension.createFilterFunction).toHaveBeenCalled();

        });

        it('recalculates the countries group', function() {

            expect(countries.recalculate).toHaveBeenCalled();

        });

        it('redraws the entire ChartGroup', function() {

            expect(chartGroup.draw).toHaveBeenCalled();

        });

        it('highlights the chart inside', function() {
        
            expect(chart.highlight).toHaveBeenCalled();

        });

        it('highlights the table inside', function() {

            expect(table.highlight).toHaveBeenCalled();

        });

    });

    describe('removeFilters', function() {



    });

});