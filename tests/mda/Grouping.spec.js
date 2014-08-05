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

describe('Grouping', function() {

    it('will initialize without error', function() {
        
        var dataset = new insight.DataSet(sourceData);

        var group =  dataset.group('country', function(d){return d.Country;});

        var data = group.getData();
        
        expect(data.length).toBe(4);
    });

    it('will correctly sum a property', function() {
        var dataset = new insight.DataSet(sourceData);

        var group =  dataset.group('country', function(d){return d.Country;});

        group.sum(['IQ']);

        var data = group.getData();
        
        var scotland = data.filter(function(country){ return country.key=='Scotland'; })[0];
        var england = data.filter(function(country){ return country.key=='England'; })[0];
        
        expect(scotland.value.IQ.Sum).toBe(268);
        expect(england.value.IQ.Sum).toBe(589);
    });

    it('will correctly average a property', function() {
        var dataset = new insight.DataSet(sourceData);

        var group =  dataset.group('country', function(d){return d.Country;});

        group.mean(['IQ']);

        var data = group.getData();
        
        var scotland = data.filter(function(country){ return country.key=='Scotland'; })[0];
        var england = data.filter(function(country){ return country.key=='England'; })[0];
        
        // Then

        var actualValue = scotland.value.IQ.Average;
        var expectedValue = 268/3;

        var actualSum = scotland.value.IQ.Sum;
        var expectedSum = 268;

        expect(actualValue).toBe(expectedValue);
        expect(actualSum).toBe(expectedSum);
    });


    it('will correctly average a property after a filter event', function() {
        // Given
        var dataset = new insight.DataSet(sourceData);
        
        var group =  dataset.group('country', function(d){return d.Country;});        
        var age =  dataset.group('age', function(d){return d.Age;});

        group.mean(['IQ']);

        // When 

        var data = group.getData();
        
        //filter age by people older than 10, to remove an entry from the scotland group
        age.dimension.crossfilterDimension.filter(function(d){
            return d > 10;
        });

        group.recalculate();

        var scotland = data.filter(function(country){ return country.key=='Scotland'; })[0];
        var england = data.filter(function(country){ return country.key=='England'; })[0];
        
        // Then

        expect(scotland.value.IQ.Average).toBe(199/2);
        expect(england.value.IQ.Average).toBe(278/4);
        expect(scotland.value.Count).toBe(2);        
    });


    it('will order data correctly, using the count by default', function() {
        
        var dataset = new insight.DataSet(sourceData);

        var group =  dataset.group('country', function(d){return d.Country;})
                        .ordered(true);
        
        var data = group.getData(function(a,b){return b.value.Count - a.value.Count;});
        
        expect(data[0].key).toBe('England');
        expect(data[data.length-1].key).toBe('Scotland');
    });


    it('will order data correctly, using a provided ordering function', function() {

        var dataset = new insight.DataSet(sourceData);

        var group =  dataset.group('country', function(d){return d.Country;})
                         .ordered(true);
        
        var data = group.getData(function(a,b){return b.value.Count - a.value.Count;});
        
        expect(data[0].key).toBe('England');
        expect(data[data.length-1].key).toBe('Scotland');
    });

    
    it('will calculate a cumulative property', function() {
        
        var dataset = new insight.DataSet(sourceData);

        var group =  dataset.group('country', function(d){return d.Country;})
            .mean(['IQ'])
            .cumulative(['IQ.Sum','IQ.Average']);

        var data = group.getData();


        expect(data[data.length-1].value.IQ.SumCumulative).toBe(1616);        
    });

    
    it('will correctly count the values in an value property', function() {
        
        var dataset = new insight.DataSet(sourceData);

        var group =  dataset.group('country', function(d){return d.Country;}).count(['Gender']);

        var dataArray = group.getData();
        
        var scotland = dataArray.filter(function(country){ return country.key=='Scotland'; })[0];

        expect(scotland.value.Gender.Male).toBe(2);
        expect(scotland.value.Gender.Female).toBe(1);
        
    });


    it('will correctly count the values in an array property', function() {
        
        var dataset = new insight.DataSet(sourceData);

        var group =  dataset.group('country', function(d){return d.Country;}).count(['Interests']);

        var data = group.getData();

        var scotland = data.filter(function(country){ return country.key=='Scotland'; })[0];

        expect(scotland.value.Interests.Ballet).toBe(1);
        expect(scotland.value.Interests.Music).toBe(3);
        expect(scotland.value.Interests.Total).toBe(9);
        
    });



    it('will update the count after a dimensional filter', function() {
        
        var dataset = new insight.DataSet(sourceData);

        var age =  dataset.group('age', function(d){return d.Age;});
       

        var group =  dataset.group('country', function(d){return d.Country;})
                            .count(['Gender', 'Interests']);

        var dataArray = group.getData();

        var scotland = dataArray.filter(function(country){ return country.key=='Scotland'; })[0];

        expect(scotland.value.Gender.Male).toBe(2);
        expect(scotland.value.Gender.Female).toBe(1);
        expect(scotland.value.Interests.Ballet).toBe(1);
        expect(scotland.value.Interests.Music).toBe(3);
        expect(scotland.value.Interests.Total).toBe(9);

        //filter age by people older than 10, to remove an entry from the scotland group and hopefully trigger a recalculation of the property counts
        age.dimension.crossfilterDimension.filter(function(d){
            return d > 10;
        });

        group.recalculate();

        scotland = group.getData().filter(function(country){ return country.key=='Scotland'; })[0];

        expect(scotland.value.Gender.Male).toBe(1);
        expect(scotland.value.Gender.Female).toBe(1);
        expect(scotland.value.Interests.Triathlon).toBe(1);
        expect(scotland.value.Interests.Music).toBe(2);
        expect(scotland.value.Interests.Total).toBe(6);
    });


    it('will correctly aggregate a multi dimension', function() {
        
        var ndx = new insight.DataSet(sourceData);

        var group =  ndx.group('interests', function(d){return d.Interests;}, true)
                            .count(['Interests']);
        
        var age =  ndx.group('age', function(d){return d.Age;});
        
        var data = group.getData();

        var ballet = group.getData().filter(function(a){ return a.key=='Ballet'; })[0];
        var triathlon = group.getData().filter(function(a){ return a.key=='Triathlon'; })[0];

        expect(ballet.value).toBe(1);
        expect(triathlon.value).toBe(11);        

        age.dimension.crossfilterDimension.filter(function(d){ 
            return d > 10; 
        });

        group.getData();

        ballet = group.getData().filter(function(a){ return a.key=='Ballet'; })[0];
        triathlon = group.getData().filter(function(a){ return a.key=='Triathlon'; })[0];

        expect(ballet.value).toBe(0);
        expect(triathlon.value).toBe(6);        
    });


    it('will correctly aggregate a sorted multi dimension', function() {
        
        var ndx = new insight.DataSet(sourceData);

        var group =  ndx.group('interests', function(d){return d.Interests;}, true)
                            .count(['Interests']);
        
        var age =  ndx.group('age', function(d){return d.Age;});
        
        
        var data = group.getData(function(a,b){return b.value - a.value;});

        var ballet = group.getData().filter(function(a){ return a.key=='Ballet'; })[0];
        var triathlon = group.getData().filter(function(a){ return a.key=='Triathlon'; })[0];

        expect(ballet.value).toBe(1);
        expect(triathlon.value).toBe(11);        

        var current = data[0].value;

        data.forEach(function(d){
            expect(d.value <= current).toBe(true);
            current = d.value;
        });

        age.dimension.crossfilterDimension.filter(function(d){ 
            return d > 10; 
        });

        data = group.getData(function(a,b){return b.value - a.value;});
        
        ballet = group.getData().filter(function(a){ return a.key=='Ballet'; })[0];
        triathlon = group.getData().filter(function(a){ return a.key=='Triathlon'; })[0];

        expect(ballet.value).toBe(0);
        expect(triathlon.value).toBe(6);        

        current = data[0].value;

        data.forEach(function(d){
            expect(d.value <= current).toBe(true);
            current = d.value;
        });

    });

    it('will allow custom post aggregation steps', function() {
        
        // Given
        var dataset = new insight.DataSet(sourceData);

        var countryGroup =  dataset.group('countryGroup', function(d){ return d.Country; })
                                .sum(['IQ']);
       
        var postAggregation = function(group) {
            var total = 0;

                           
            group.getData()
                .forEach(function(d)
                {
                    d.value.IQ.PlusOne = d.value.IQ.Sum + 1;
                });
        };

        // When
        
        countryGroup.postAggregation(postAggregation);

        var dataArray = countryGroup.getData();

        // Then

        var actualData = dataArray.map(function(entry){ return entry.value.IQ.Sum; });
        var plusOneData = dataArray.map(function(entry){ return entry.value.IQ.PlusOne; });
        
        var expectedData = [589, 418, 268, 341];
        var expectedPlusOneData = [590, 419, 269, 342];
        
        expect(actualData).toEqual(expectedData);
        expect(plusOneData).toEqual(expectedPlusOneData);

    });

    describe('correlation', function() {
    
        describe('setting correlationPairs', function() {
        
            var countryGroup;
            
            beforeEach(function() {
            
                var dataset = new insight.DataSet(sourceData);
                countryGroup =  dataset.group('countryGroup', function(d){ return d.Country; });
            
            });
        
            it('sets correlationPairs', function() {
                
                // When 
                countryGroup.correlationPairs([['IQ', 'Age']]);
                
                // Then
                expect(countryGroup.correlationPairs()).toEqual([['IQ', 'Age']]);
                
            });
            
            it('sets mean if mean is not set', function() {
                
                // verify that mean has not been set
                expect(countryGroup.mean()).toEqual([]);
                
                // When
                countryGroup.correlationPairs([['IQ', 'Age']]);
                
                // Then
                expect(countryGroup.mean()).toEqual(['IQ', 'Age']);
                
            });
            
            it('adds to mean if mean is already set', function() {
                
                // Given
                countryGroup.mean(['Age', 'shoesize']);
                
                // When
                countryGroup.correlationPairs([['IQ', 'Age']]);
                
                // Then
                expect(countryGroup.mean()).toEqual(['Age', 'shoesize', 'IQ']);
                
            });
            
        });
        
        it('correlation can be calculated on given property pairs', function() {
            
            var dataset = new insight.DataSet(sourceData);
            var countryGroup =  dataset.group('countryGroup', function(d){ return d.Country; })
                                    .correlationPairs([['IQ', 'Age']]);

            var groupData = countryGroup.getData();
            
            var england = groupData.filter(function(country){ return country.key=='England'; })[0];
            var northernIreland = groupData.filter(function(country){ return country.key=='Northern Ireland'; })[0];
            var scotland = groupData.filter(function(country){ return country.key=='Scotland'; })[0];
            var wales = groupData.filter(function(country){ return country.key=='Wales'; })[0];
            
            expect(england.value.IQ_Cor_Age).toBeCloseTo(-0.765468643);
            expect(northernIreland.value.IQ_Cor_Age).toBeCloseTo(-0.393323745);
            expect(scotland.value.IQ_Cor_Age).toBeCloseTo(0.972167128);
            expect(wales.value.IQ_Cor_Age).toBeCloseTo(0.14985373);

        });
    
    });
    
    
    
});

