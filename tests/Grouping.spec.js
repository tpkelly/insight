var dataset = 
[{"Id":1,"Forename":"Martin","Surname":"Watkins","Country":"Scotland","DisplayColour":"#38d33c","Age":1,"IQ":69},
{"Id":2,"Forename":"Teresa","Surname":"Knight","Country":"Scotland","DisplayColour":"#6ee688","Age":20,"IQ":103},
{"Id":3,"Forename":"Mary","Surname":"Lee","Country":"Wales","DisplayColour":"#8e6bc2","Age":3,"IQ":96},
{"Id":4,"Forename":"Sandra","Surname":"Harrison","Country":"Northern Ireland","DisplayColour":"#02acd0","Age":16,"IQ":55},
{"Id":5,"Forename":"Frank","Surname":"Cox","Country":"England","DisplayColour":"#0b281c","Age":5,"IQ":105},
{"Id":6,"Forename":"Mary","Surname":"Jenkins","Country":"England","DisplayColour":"#5908e3","Age":19,"IQ":69},
{"Id":7,"Forename":"Earl","Surname":"Stone","Country":"Wales","DisplayColour":"#672542","Age":6,"IQ":60},
{"Id":8,"Forename":"Ashley","Surname":"Carr","Country":"England","DisplayColour":"#f9874f","Age":18,"IQ":63},
{"Id":9,"Forename":"Judy","Surname":"Mcdonald","Country":"Northern Ireland","DisplayColour":"#3ab1a8","Age":2,"IQ":70},
{"Id":10,"Forename":"Earl","Surname":"Flores","Country":"England","DisplayColour":"#1be47c","Age":20,"IQ":93},
{"Id":11,"Forename":"Terry","Surname":"Wheeler","Country":"Wales","DisplayColour":"#2cd57b","Age":4,"IQ":87},
{"Id":12,"Forename":"Willie","Surname":"Reid","Country":"Northern Ireland","DisplayColour":"#7fcf1e","Age":7,"IQ":86},
{"Id":13,"Forename":"Deborah","Surname":"Palmer","Country":"Northern Ireland","DisplayColour":"#9fd1d5","Age":5,"IQ":85},
{"Id":14,"Forename":"Annie","Surname":"Jordan","Country":"England","DisplayColour":"#8f4fd1","Age":10,"IQ":100},
{"Id":15,"Forename":"Craig","Surname":"Gibson","Country":"England","DisplayColour":"#111ab4","Age":7,"IQ":106},
{"Id":16,"Forename":"Lisa","Surname":"Parker","Country":"England","DisplayColour":"#52d5cf","Age":18,"IQ":53},
{"Id":17,"Forename":"Samuel","Surname":"Willis","Country":"Wales","DisplayColour":"#e2f6cc","Age":11,"IQ":98},
{"Id":18,"Forename":"Lisa","Surname":"Chapman","Country":"Northern Ireland","DisplayColour":"#1c5829","Age":7,"IQ":51},
{"Id":19,"Forename":"Ryan","Surname":"Freeman","Country":"Scotland","DisplayColour":"#6cbc04","Age":12,"IQ":96},
{"Id":20,"Forename":"Frances","Surname":"Lawson","Country":"Northern Ireland","DisplayColour":"#e739c9","Age":14,"IQ":71}];



var chartGroup = new ChartGroup('Testing');

describe("Grouping tests", function() {

    it("will initialize without error", function() {
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension);
        
        group.initialize();

        var data = group.getData();
        
        expect(data.length).toBe(4);
    });

    it("will correctly sum a property", function() {
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension);
        
        group.sum(['IQ']);

        group.initialize();

        var data = group.getData();
        
        var scotland = data.filter(function(country){ return country.key=='Scotland'; })[0];
        var england = data.filter(function(country){ return country.key=='England'; })[0];
        
        expect(scotland.value.IQ.Sum).toBe(268);
        expect(england.value.IQ.Sum).toBe(589);
    });

    it("will correctly average a property", function() {
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension);
        
        group.sum(['IQ']);

        group.initialize();

        var data = group.getData();
        
        var scotland = data.filter(function(country){ return country.key=='Scotland'; })[0];
        var england = data.filter(function(country){ return country.key=='England'; })[0];
        
        expect(scotland.value.IQ.Sum).toBe(268);
        expect(england.value.IQ.Sum).toBe(589);
    });


    it("will order data correctly, using the count by default", function() {
        
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension)
                                        .ordered(true);
        group.initialize(); 

        var data = group.getOrderedData();
        
        expect(data[0].key).toBe('England');
        expect(data[data.length-1].key).toBe('Scotland');

    });


    it("will order data correctly, using a provided ordering function", function() {

        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension)
                                        .ordered(true);
        group.initialize(); 

        var data = group.getOrderedData();
        
        expect(data[0].key).toBe('England');
        expect(data[data.length-1].key).toBe('Scotland');

    });

    
    it("will calculate a cumulative property", function() {
        
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension)
                        .ordered(true);

        group.initialize(); 

    
    });
    

})

