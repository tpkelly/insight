
describe('Dimension', function() {

    var sourceData = 
        [{'Id':1,'Forename':'Martin','Surname':'Watkins','Country':'Scotland','DisplayColour':'#38d33c','Age':1,'IQ':69,'Gender':'Male','Interests':['Ballet', 'Music', 'Climbing']},
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

    var crossfilterData;

    beforeEach(function(){
        crossfilterData = crossfilter(sourceData);
    });

    function sliceByCountry(d) {
        return d.Country;
    }

    function sliceByInterests(d) {
        return d.Interests;
    }

    describe('constructor', function() {

        it('will initialize without error', function() {

            // When:
            var dimension = new insight.Dimension('testDim', crossfilterData, sliceByCountry, false);

            // Then:
            expect(dimension.name).toEqual('testDim');
            expect(dimension.filters).toEqual([]);
            expect(dimension.crossfilterDimension).toBeDefined();

        });

    });

    describe('createFilterFunction', function() {

            it('will create the appropriate filter for a one to one dimension', function() {

                // Given:
                var dimension = new insight.Dimension('testDim', crossfilterData, sliceByCountry, false);

                var testData = ['England', 'Scotland', 'Wales', 'Ireland'];

                // When:
                var actualFilterFunction = dimension.createFilterFunction('England').filterFunction;


                // Then:
                var actualData = testData.filter(actualFilterFunction);
                var expectedData = ['England'];

                expect(actualData).toEqual(expectedData);

            });

            it('will create the appropriate filter for a one to many dimension', function() {

                // Given:
                var dimension = new insight.Dimension('testDim', crossfilterData, sliceByInterests, true);

                var testData = [['Football', 'Cycling'], ['Cycling'], ['Dancing', 'Football'], ['Cycling', 'Dancing']];

                // When:
                var actualFilterFunction = dimension.createFilterFunction('Cycling').filterFunction;

                // Then:
                var actualData = testData.filter(actualFilterFunction);
                var expectedData = [['Football', 'Cycling'], ['Cycling'], ['Cycling', 'Dancing']];

                expect(actualData).toEqual(expectedData);

            });

    });

    describe('applyFilter', function() {

        beforeEach(function() {

            this.addMatchers({
                toContainSameElementsAs: insightTesting.matchers.toContainSameElementsAs
            });

        });

        it('will filter data using the filter function if it is not already applied', function() {

            // Given:
            var dimension = new insight.Dimension('testDim', crossfilterData, sliceByCountry, false);
            var filterFunction = dimension.createFilterFunction('England');

            // When:
            dimension.applyFilter(filterFunction);

            // Then:
            var expectedData = sourceData.filter(function(d) {
                return d.Country === 'England';
            });

            var filteredData = dimension.crossfilterDimension.top(sourceData.length);
            expect(filteredData).toContainSameElementsAs(expectedData);

        });

        it('will remove a filter if it is already applied', function() {

            // Given:
            var dimension = new insight.Dimension('testDim', crossfilterData, sliceByCountry, false);
            var filterFunction = dimension.createFilterFunction('England');
            dimension.applyFilter(filterFunction);

            // When:
            dimension.applyFilter(filterFunction);

            // Then:
            var filteredData = dimension.crossfilterDimension.top(sourceData.length);
            expect(filteredData).toContainSameElementsAs(sourceData);

        });

        it('adds a filter if a different filter is already applied', function() {

            // Given:
            var dimension = new insight.Dimension('testDim', crossfilterData, sliceByCountry, false);
            dimension.applyFilter(dimension.createFilterFunction('England'));

            // When:
            dimension.applyFilter(dimension.createFilterFunction('Scotland'));

            // Then:
            var expectedData = sourceData.filter(function(d) {
                return d.Country === 'England' || d.Country === 'Scotland';
            });

            var filteredData = dimension.crossfilterDimension.top(sourceData.length);
            expect(filteredData).toContainSameElementsAs(expectedData);

        });

        it('filtering a value that doesn\'t exist results in empty data', function() {

            // Given:
            var dimension = new insight.Dimension('testDim', crossfilterData, sliceByCountry, false);

            // When:
            dimension.applyFilter(dimension.createFilterFunction('France'));

            // Then:
            var filteredData = dimension.crossfilterDimension.top(sourceData.length);
            expect(filteredData).toEqual([]);

        });

        it('filtering an empty dimension results in empty data', function() {

            // Given:
            var emptydata = crossfilter([]);
            var dimension = new insight.Dimension('testDim', emptydata, sliceByCountry, false);

            // When:
            dimension.applyFilter(dimension.createFilterFunction('France'));

            // Then:
            var filteredData = dimension.crossfilterDimension.top(1);
            expect(filteredData).toEqual([]);

        });

    });

    describe('clearFilters', function() {

    });

});