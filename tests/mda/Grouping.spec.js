describe('Grouping', function() {

    var dataAllFieldsPresent = [
        {'Id':1,'Forename':'Martin','Surname':'Watkins','Country':'Scotland','DisplayColour':'#38d33c','Age':1,'IQ':69,'Gender':'Male','Interests':['Ballet', 'Music', 'Climbing']},
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
        {'Id':20,'Forename':'Frances','Surname':'Lawson','Country':'Northern Ireland','DisplayColour':'#e739c9','Age':14,'IQ':71, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'}
    ];

    var dataWithFieldsMissing = [
        {'Id':1,'Forename':'Martin','Surname':'Watkins','Country':'Scotland','DisplayColour':'#38d33c','Age':1},
        {'Id':2,'Forename':'Teresa','Surname':'Knight','Country':'Scotland','DisplayColour':'#6ee688','Age':20,'IQ':103,'Interests':['Triathlon', 'Music', 'Mountain Biking'],'Gender':'Female'},
        {'Id':3,'Forename':'Mary','Surname':'Lee','Country':'Wales','DisplayColour':'#8e6bc2','Age':3,'IQ':96,'Interests':['Triathlon', 'Music', 'Mountain Biking'],'Gender':'Female'},
        {'Id':4,'Forename':'Sandra','Surname':'Harrison','Country':'Northern Ireland','DisplayColour':'#02acd0','Age':16,'IQ':55, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':5,'Forename':'Frank','Surname':'Cox','Country':'England','DisplayColour':'#0b281c','Age':5,'Gender':'Female'},
        {'Id':6,'Forename':'Mary','Surname':'Jenkins','Country':'England','DisplayColour':'#5908e3','Age':19,'Gender':'Female'},
        {'Id':7,'Forename':'Earl','Surname':'Stone','Country':'Wales','DisplayColour':'#672542','Age':6,'IQ':60,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Male'},
        {'Id':8,'Forename':'Ashley','Surname':'Carr','Country':'England','DisplayColour':'#f9874f','Age':18,'Gender':'Female'},
        {'Id':9,'Forename':'Judy','Surname':'Mcdonald','Country':'Northern Ireland','DisplayColour':'#3ab1a8','Age':2,'IQ':70,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':10,'Forename':'Earl','Surname':'Flores','Country':'Scotland','DisplayColour':'#1be47c','Age':16,'IQ':93,'Interests':['Climbing', 'Boxing', 'Music'], 'Gender':'Male'}
    ];

    var crossfilterAllFields, crossfilterMissingFields, emptyCrossfilterData;

    beforeEach(function() {
        crossfilterAllFields = crossfilter(dataAllFieldsPresent);
        crossfilterMissingFields = crossfilter(dataWithFieldsMissing);
        emptyCrossfilterData = crossfilter([]);
    });

    function findByKey(data, keyValue) {
        var matches = data.filter(function(entry){
            return entry.key==keyValue;
        });
        return matches[0];
    }

    function sliceByAge(d){
        return d.Age;
    }

    function sliceByCountry(d){
        return d.Country;
    }

    function sliceByInterests(d){
        return d.Interests;
    }

    function sliceByGender(d) {
        return d.Gender;
    }


    it('will initialize without error', function() {

        // Given:
        var dimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
        var group = new insight.Grouping(dimension);

        // When:
        var data = group.extractData();

        // Then:
        expect(data.length).toBe(4);
    });

    it('when given empty data will initialize without error', function() {

        // Given:
        var dimension = new insight.Dimension('country', emptyCrossfilterData, sliceByCountry);
        var group = new insight.Grouping(dimension);

        // When:
        var data = group.extractData();

        // Then:
        expect(data.length).toBe(0);
    });

    describe('sum', function() {

        it('will correctly sum a property', function() {

            // Given
            var dimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var group = new insight.Grouping(dimension);

            // When
            group.sum(['IQ']);

            var data = group.extractData();

            var scotland = findByKey(data, 'Scotland');
            var england = findByKey(data, 'England');

            // Then
            expect(scotland.value.IQ.Sum).toBe(268);
            expect(england.value.IQ.Sum).toBe(589);
        });

        it('will correctly sum an optional property', function() {

            // Given
            var dimension = new insight.Dimension('country', crossfilterMissingFields, sliceByCountry);
            var group = new insight.Grouping(dimension);

            // When
            group.sum(['IQ']);

            var data = group.extractData();

            var scotland = findByKey(data, 'Scotland');
            var england = findByKey(data, 'England');

            // Then
            expect(scotland.value.IQ.Sum).toBe(196);
            expect(england.value.IQ.Sum).toBe(0);
        });
    });

    describe('mean', function() {

        it('will correctly average a property', function() {

            // Given
            var dimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var group = new insight.Grouping(dimension);

            // When
            group.mean(['IQ']);

            var data = group.extractData();

            var scotland = findByKey(data, 'Scotland');

            // Then
            expect(scotland.value.IQ.Average).toBe(268/3);
            expect(scotland.value.IQ.Sum).toBe(268);
        });

        it('will correctly average a property after a filter event', function() {

            // Given
            var countryDimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var ageDimension = new insight.Dimension('age', crossfilterAllFields, sliceByAge);
            var countryGroup = new insight.Grouping(countryDimension);

            countryGroup.mean(['IQ']);

            // When
            var data = countryGroup.extractData();

            //filter age by people older than 10, to remove an entry from the scotland group
            ageDimension.crossfilterDimension.filter(function(d){
                return d > 10;
            });

            countryGroup.recalculate();

            var scotland = findByKey(data, 'Scotland');
            var england = findByKey(data, 'England');

            // Then
            expect(scotland.value.IQ.Average).toBe(199/2);
            expect(england.value.IQ.Average).toBe(278/4);
            expect(scotland.value.Count).toBe(2);
        });

        it('will correctly average an optional property', function() {

            // Given
            var dimension = new insight.Dimension('country', crossfilterMissingFields, sliceByCountry);
            var group = new insight.Grouping(dimension);

            // When
            group.mean(['IQ']);

            var data = group.extractData();

            var scotland = findByKey(data, 'Scotland');
            var england = findByKey(data, 'England');

            // Then
            expect(scotland.value.IQ.Average).toBe(196/2);
            expect(scotland.value.IQ.Sum).toBe(196);
            expect(england.value.IQ.Average).not.toBeDefined();
            expect(england.value.IQ.Sum).toBe(0);
        });

        it('will correctly average an optional property after a filter event', function() {

            // Given
            var countryDimension = new insight.Dimension('country', crossfilterMissingFields, sliceByCountry);
            var ageDimension = new insight.Dimension('age', crossfilterMissingFields, sliceByAge);
            var group = new insight.Grouping(countryDimension);

            // When
            group.mean(['IQ']);

            var data = group.extractData();

            //filter age by people older than 10, to remove an entry from the scotland group
            ageDimension.crossfilterDimension.filter(function(d){
                return d > 18;
            });

            group.recalculate();

            var scotland = findByKey(data, 'Scotland');
            var england = findByKey(data, 'England');

            // Then

            expect(scotland.value.IQ.Average).toBe(103);
            expect(scotland.value.IQ.Sum).toBe(103);
            expect(england.value.IQ.Average).not.toBeDefined();
            expect(england.value.IQ.Sum).toBe(0);
        });
    });

    describe('isOrdered', function() {

        it('will order data correctly, using the count by default', function() {

            // Given
            var dimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var group = new insight.Grouping(dimension);

            // When
            group.isOrdered(true);

            var data = group.extractData(function(a,b){return b.value.Count - a.value.Count;});

            // Then
            expect(data[0].key).toBe('England');
            expect(data[data.length-1].key).toBe('Scotland');
        });


        it('will order data correctly, using a provided ordering function', function() {

            // Given
            var dimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var group = new insight.Grouping(dimension);

            // When
            group.isOrdered(true);

            var data = group.extractData(function(a,b){return b.value.Count - a.value.Count;});

            // Then
            expect(data[0].key).toBe('England');
            expect(data[data.length-1].key).toBe('Scotland');
        });
    });

    describe('cumulative', function() {

        it('will calculate a cumulative property', function() {

            // Given
            var dimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var group = new insight.Grouping(dimension);

            // When
            group.mean(['IQ'])
                .cumulative(['IQ.Sum','IQ.Average']);

            var data = group.extractData();

            // Then
            expect(data[data.length-1].value.IQ.SumCumulative).toBe(1616);
        });
    });

    describe('count', function() {

        it('will correctly count the values in an value property', function() {

            // Given
            var dimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var group = new insight.Grouping(dimension);

            // When
            group.count(['Gender']);

            var dataArray = group.extractData();

            var scotland = findByKey(dataArray, 'Scotland');

            // Then
            expect(scotland.value.Gender.Male).toBe(2);
            expect(scotland.value.Gender.Female).toBe(1);

        });

        it('will correctly count the values in an optional value property', function() {

            // Given
            var dimension = new insight.Dimension('country', crossfilterMissingFields, sliceByCountry);
            var group = new insight.Grouping(dimension);

            // When
            group.count(['Gender']);

            var data = group.extractData();

            var scotland = findByKey(data, 'Scotland');
            var england = findByKey(data, 'England');

            // Then
            expect(scotland.value.Gender.Male).toBe(1);
            expect(scotland.value.Gender.Female).toBe(1);
            expect(england.value.Gender.Male).not.toBeDefined();
            expect(england.value.Gender.Female).toBe(3);

        });

        it('will correctly count the values in an array property', function() {

            // Given
            var dimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var group = new insight.Grouping(dimension);

            // When
            group.count(['Interests']);

            var data = group.extractData();

            var scotland = findByKey(data, 'Scotland');

            // Then
            expect(scotland.value.Interests.Ballet).toBe(1);
            expect(scotland.value.Interests.Music).toBe(3);
            expect(scotland.value.Interests.Total).toBe(9);

        });

        it('will correctly count the values in an optional array property', function() {

            // Given
            var dimension = new insight.Dimension('country', crossfilterMissingFields, sliceByCountry);
            var group = new insight.Grouping(dimension);

            // When
            group.count(['Interests']);

            var data = group.extractData();

            var scotland = findByKey(data, 'Scotland');
            var england = findByKey(data, 'England');

            // Then
            expect(scotland.value.Interests.Boxing).toBe(1);
            expect(scotland.value.Interests.Music).toBe(2);
            expect(scotland.value.Interests.Total).toBe(6);
            expect(england.value.Interests.Music).not.toBeDefined();
            expect(england.value.Interests.Total).toBe(0);

        });

        it('will update the count after a dimensional filter', function() {

            // Given
            var countryDimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var ageDimension = new insight.Dimension('age', crossfilterAllFields, sliceByAge);
            var countryGroup = new insight.Grouping(countryDimension);

            // When
            countryGroup.count(['Gender', 'Interests']);

            var dataArray = countryGroup.extractData();

            var scotland = dataArray.filter(function(country){ return country.key=='Scotland'; })[0];

            // Then
            expect(scotland.value.Gender.Male).toBe(2);
            expect(scotland.value.Gender.Female).toBe(1);
            expect(scotland.value.Interests.Ballet).toBe(1);
            expect(scotland.value.Interests.Music).toBe(3);
            expect(scotland.value.Interests.Total).toBe(9);

            //filter age by people older than 10, to remove an entry from the scotland group and hopefully trigger a recalculation of the property counts
            ageDimension.crossfilterDimension.filter(function(d){
                return d > 10;
            });

            countryGroup.recalculate();

            scotland = findByKey(countryGroup.extractData(), 'Scotland');

            expect(scotland.value.Gender.Male).toBe(1);
            expect(scotland.value.Gender.Female).toBe(1);
            expect(scotland.value.Interests.Triathlon).toBe(1);
            expect(scotland.value.Interests.Music).toBe(2);
            expect(scotland.value.Interests.Total).toBe(6);
        });


        it('will correctly aggregate a multi dimension', function() {

            // Given
            var interestsDimension = new insight.Dimension('interests', crossfilterAllFields, sliceByInterests, true);
            var ageDimension = new insight.Dimension('age', crossfilterAllFields, sliceByAge);

            // When
            var interestsGroup = new insight.Grouping(interestsDimension)
                .count(['Interests']);

            var data = interestsGroup.extractData();

            var ballet = findByKey(data, 'Ballet');
            var triathlon = findByKey(data, 'Triathlon');

            // Then
            expect(ballet.value).toBe(1);
            expect(triathlon.value).toBe(11);

            ageDimension.crossfilterDimension.filter(function(d){
                return d > 10;
            });

            interestsGroup.extractData();

            var ballet = findByKey(data, 'Ballet');
            var triathlon = findByKey(data, 'Triathlon');

            expect(ballet.value).toBe(0);
            expect(triathlon.value).toBe(6);
        });


        it('will correctly aggregate a sorted multi dimension', function() {

            // Given
            var interestsDimension = new insight.Dimension('interests', crossfilterAllFields, sliceByInterests, true);
            var ageDimension = new insight.Dimension('age', crossfilterAllFields, sliceByAge);

            // When
            var interestsGroup = new insight.Grouping(interestsDimension)
                .count(['Interests']);


            var data = interestsGroup.extractData(function(a,b){return b.value - a.value;});

            var ballet = findByKey(data, 'Ballet');
            var triathlon = findByKey(data, 'Triathlon');

            // Then
            expect(ballet.value).toBe(1);
            expect(triathlon.value).toBe(11);

            var current = data[0].value;

            data.forEach(function(d){
                expect(d.value <= current).toBe(true);
                current = d.value;
            });

            ageDimension.crossfilterDimension.filter(function(d){
                return d > 10; 
            });

            data = interestsGroup.extractData(function(a,b){return b.value - a.value;});

            var ballet = findByKey(data, 'Ballet');
            var triathlon = findByKey(data, 'Triathlon');

            expect(ballet.value).toBe(0);
            expect(triathlon.value).toBe(6);

            current = data[0].value;

            data.forEach(function(d){
                expect(d.value <= current).toBe(true);
                current = d.value;
            });

        });
    });

    describe('postAggregation', function() {
        it('will allow custom post aggregation steps', function() {

            // Given
            var countryDimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var group = new insight.Grouping(countryDimension)
                .sum(['IQ']);

            var postAggregation = function(groupEntry) {
                var total = 0;
                groupEntry.extractData()
                    .forEach(function(d)
                    {
                        d.value.IQ.PlusOne = d.value.IQ.Sum + 1;
                    });
            };

            // When

            group.postAggregation(postAggregation);

            var dataArray = group.extractData();

            // Then

            var actualData = dataArray.map(function(entry){ return entry.value.IQ.Sum; });
            var plusOneData = dataArray.map(function(entry){ return entry.value.IQ.PlusOne; });

            var expectedData = [589, 418, 268, 341];
            var expectedPlusOneData = [590, 419, 269, 342];

            expect(actualData).toEqual(expectedData);
            expect(plusOneData).toEqual(expectedPlusOneData);

        });

        it('when given empty data runs without error', function() {

            // Given
            var countryDimension = new insight.Dimension('country', emptyCrossfilterData, sliceByCountry);
            var group = new insight.Grouping(countryDimension)
                .sum(['IQ']);

            var postAggregation = function(groupEntry) {
                var total = 0;
                groupEntry.extractData()
                    .forEach(function(d)
                    {
                        d.value.IQ.PlusOne = d.value.IQ.Sum + 1;
                    });
            };

            // When
            group.postAggregation(postAggregation);

            var dataArray = group.extractData();

            // Then - nothing to expect except a lack of exception

        });

    });

    describe('correlationPairs', function() {

        describe('updates aggregation properties', function() {

            var group;

            beforeEach(function() {

                var dimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
                group = new insight.Grouping(dimension);

            });

            it('sets correlationPairs', function() {

                // When
                group.correlationPairs([['IQ', 'Age']]);

                // Then
                expect(group.correlationPairs()).toEqual([['IQ', 'Age']]);

            });

            it('sets mean if mean is not set', function() {

                // verify that mean has not been set
                expect(group.mean()).toEqual([]);

                // When
                group.correlationPairs([['IQ', 'Age']]);

                // Then
                expect(group.mean()).toEqual(['IQ', 'Age']);

            });

            it('adds to mean if mean is already set', function() {

                // Given
                group.mean(['Age', 'shoesize']);

                // When
                group.correlationPairs([['IQ', 'Age']]);

                // Then
                expect(group.mean()).toEqual(['Age', 'shoesize', 'IQ']);

            });

            it('sets sum if sum is not set', function() {

                // verify that sum has not been set
                expect(group.sum()).toEqual([]);

                // When
                group.correlationPairs([['IQ', 'Age']]);

                // Then
                expect(group.sum()).toEqual(['IQ', 'Age']);

            });

            it('adds to sum if sum is already set', function() {

                // Given
                group.sum(['Age', 'shoesize']);

                // When
                group.correlationPairs([['IQ', 'Age']]);

                // Then
                expect(group.sum()).toEqual(['Age', 'shoesize', 'IQ']);

            });

        });

        it('can be calculated on given property pairs', function() {

            var countryDimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var group = new insight.Grouping(countryDimension)
                .correlationPairs([['IQ', 'Age']]);

            // calling extractData will cause the correlation calculations to be performed
            var data = group.extractData();

            // get the groups for each country
            var england = findByKey(data, 'England');
            var northernIreland = findByKey(data, 'Northern Ireland');
            var scotland = findByKey(data, 'Scotland');
            var wales = findByKey(data, 'Wales');

            // verify that the values are as expected
            expect(england.value.IQ_Cor_Age).toBeCloseTo(-0.765468643);
            expect(northernIreland.value.IQ_Cor_Age).toBeCloseTo(-0.393323745);
            expect(scotland.value.IQ_Cor_Age).toBeCloseTo(0.972167128);
            expect(wales.value.IQ_Cor_Age).toBeCloseTo(0.14985373);

        });

        it('can be calculated on given property pairs after a ChartGroup filter', function() {

            // Given
            var countryDimension = new insight.Dimension('country', crossfilterAllFields, sliceByCountry);
            var countryGroup = new insight.Grouping(countryDimension)
                .correlationPairs([['IQ', 'Age']]);

            // we're going to filter gender so we need a gender group and a series so groups can be filtered
            var genderDimension = new insight.Dimension('genderGroup', crossfilterAllFields, sliceByGender);
            var genderGroup = new insight.Grouping(genderDimension);
            var clickedGender = {key:'Male', value:{}};

            // add the groups to series
            var x = new insight.Axis('Country', insight.scales.ordinal);
            var y = new insight.Axis('Values', insight.scales.linear);
            var countrySeries = new insight.ColumnSeries('columns', countryGroup, x, y)
                .valueFunction(function(d) { return d.value.IQ_Cor_Age; });
            var genderSeries = new insight.ColumnSeries('genders', genderGroup, x, y);

            // create a chart group with a chart containing the two series
            var chart = new insight.Chart('name', 'element');
            chart.xAxis(x);
            chart.yAxis(y);
            chart.series([countrySeries, genderSeries]);

            // prevent the chart from resizing or highlighting
            var emptyFunction = function() {};
            chart.resizeChart = emptyFunction;
            chart.toggleHighlight = emptyFunction;

            var chartGroup = new insight.ChartGroup();
            chartGroup.add(chart);


            // When

            chart.draw();

            // filter the chart group to only include Male gender
            chartGroup.filterByGrouping(genderGroup, 'Male');

            // calling extractData will cause the correlation calculations to be performed
            var groupData = countryGroup.extractData();

            // get the groups for each country
            var england = findByKey(groupData, 'England');
            var northernIreland = findByKey(groupData, 'Northern Ireland');
            var scotland = findByKey(groupData, 'Scotland');
            var wales = findByKey(groupData, 'Wales');


            // Then

            expect(england.value.IQ_Cor_Age).toBeCloseTo(-0.981574155);
            expect(isNaN(northernIreland.value.IQ_Cor_Age)).toBe(true);
            expect(scotland.value.IQ_Cor_Age).toBe(1);
            expect(wales.value.IQ_Cor_Age).toBe(-1);

        });

    });

});
